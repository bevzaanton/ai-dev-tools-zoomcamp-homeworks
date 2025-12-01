const { io } = require('socket.io-client');
const http = require('http');
const { Server } = require('socket.io');
const express = require('express');
const cors = require('cors');

describe('Socket.io Integration Tests', () => {
    let httpServer;
    let ioServer;
    let clientSocket1;
    let clientSocket2;
    let clientSocket3;
    const PORT = 3001;

    beforeAll((done) => {
        const app = express();
        app.use(cors());
        httpServer = http.createServer(app);
        ioServer = new Server(httpServer, {
            cors: {
                origin: '*',
                methods: ['GET', 'POST']
            }
        });

        const users = new Map();
        const adjectives = ['Quick', 'Clever', 'Bright', 'Swift', 'Bold'];
        const nouns = ['Panda', 'Tiger', 'Eagle', 'Dolphin', 'Fox'];
        const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8'];

        function generateRandomName() {
            const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
            const noun = nouns[Math.floor(Math.random() * nouns.length)];
            return `${adj} ${noun}`;
        }

        function getRandomColor() {
            return colors[Math.floor(Math.random() * colors.length)];
        }

        ioServer.on('connection', (socket) => {
            const userName = generateRandomName();
            const userColor = getRandomColor();

            users.set(socket.id, { name: userName, color: userColor });

            socket.emit('user-info', { id: socket.id, name: userName, color: userColor });

            ioServer.emit('users-update', Array.from(users.entries()).map(([id, user]) => ({
                id,
                name: user.name,
                color: user.color
            })));

            socket.on('code-change', (code) => {
                socket.broadcast.emit('code-update', code);
            });

            socket.on('disconnect', () => {
                users.delete(socket.id);
                ioServer.emit('users-update', Array.from(users.entries()).map(([id, user]) => ({
                    id,
                    name: user.name,
                    color: user.color
                })));
            });
        });

        httpServer.listen(PORT, () => {
            done();
        });
    });

    afterAll((done) => {
        ioServer.close(() => {
            httpServer.close(() => {
                done();
            });
        });
    });

    afterEach((done) => {
        const sockets = [clientSocket1, clientSocket2, clientSocket3];

        sockets.forEach(socket => {
            if (socket && socket.connected) {
                socket.removeAllListeners();
                socket.disconnect();
            }
        });

        clientSocket1 = null;
        clientSocket2 = null;
        clientSocket3 = null;

        setTimeout(done, 300);
    });

    describe('User Connection and Presence', () => {
        test('should receive user-info on connection', (done) => {
            clientSocket1 = io(`http://localhost:${PORT}`);

            clientSocket1.on('user-info', (userInfo) => {
                expect(userInfo).toHaveProperty('id');
                expect(userInfo).toHaveProperty('name');
                expect(userInfo).toHaveProperty('color');
                expect(userInfo.id).toBe(clientSocket1.id);
                expect(typeof userInfo.name).toBe('string');
                expect(userInfo.color).toMatch(/^#[0-9A-F]{6}$/i);
                done();
            });
        });

        test('should receive users-update with current user on connection', (done) => {
            clientSocket1 = io(`http://localhost:${PORT}`);

            clientSocket1.once('users-update', (users) => {
                expect(Array.isArray(users)).toBe(true);
                expect(users.length).toBeGreaterThan(0);
                const currentUser = users.find(u => u.id === clientSocket1.id);
                expect(currentUser).toBeDefined();
                expect(currentUser).toHaveProperty('name');
                expect(currentUser).toHaveProperty('color');
                done();
            });
        });

        test('should broadcast users-update to all clients when new user connects', (done) => {
            clientSocket1 = io(`http://localhost:${PORT}`);
            let receivedFirstUpdate = false;

            clientSocket1.on('users-update', (users) => {
                if (!receivedFirstUpdate) {
                    receivedFirstUpdate = true;
                    expect(users.length).toBe(1);

                    clientSocket2 = io(`http://localhost:${PORT}`);
                } else {
                    expect(users.length).toBe(2);
                    done();
                }
            });
        });

        test('should broadcast users-update when user disconnects', (done) => {
            clientSocket1 = io(`http://localhost:${PORT}`);
            let updateReceived = false;

            clientSocket1.once('users-update', () => {
                clientSocket2 = io(`http://localhost:${PORT}`);

                clientSocket2.once('users-update', () => {
                    clientSocket1.once('users-update', (users) => {
                        if (!updateReceived) {
                            updateReceived = true;
                            expect(users.length).toBeGreaterThanOrEqual(1);
                            expect(users.some(u => u.id === clientSocket1.id)).toBe(true);
                            expect(users.some(u => u.id === clientSocket2.id)).toBe(false);
                            done();
                        }
                    });

                    setTimeout(() => {
                        clientSocket2.disconnect();
                    }, 100);
                });
            });
        });
    });

    describe('Code Synchronization', () => {
        test('should broadcast code-change to other clients', (done) => {
            const testCode = 'console.log("Hello World");';

            clientSocket1 = io(`http://localhost:${PORT}`);

            clientSocket1.on('connect', () => {
                clientSocket2 = io(`http://localhost:${PORT}`);

                clientSocket2.on('connect', () => {
                    clientSocket2.on('code-update', (code) => {
                        expect(code).toBe(testCode);
                        done();
                    });

                    setTimeout(() => {
                        clientSocket1.emit('code-change', testCode);
                    }, 100);
                });
            });
        });

        test('should not send code-update to the sender', (done) => {
            const testCode = 'const x = 42;';
            let receivedUpdate = false;

            clientSocket1 = io(`http://localhost:${PORT}`);

            clientSocket1.on('code-update', () => {
                receivedUpdate = true;
            });

            clientSocket1.on('connect', () => {
                clientSocket1.emit('code-change', testCode);

                setTimeout(() => {
                    expect(receivedUpdate).toBe(false);
                    done();
                }, 200);
            });
        });

        test('should handle multiple code changes in sequence', (done) => {
            const codes = ['line 1', 'line 1\nline 2', 'line 1\nline 2\nline 3'];
            let receivedCount = 0;

            clientSocket1 = io(`http://localhost:${PORT}`);

            clientSocket1.on('connect', () => {
                clientSocket2 = io(`http://localhost:${PORT}`);

                clientSocket2.on('connect', () => {
                    clientSocket2.on('code-update', (code) => {
                        expect(code).toBe(codes[receivedCount]);
                        receivedCount++;

                        if (receivedCount === codes.length) {
                            done();
                        }
                    });

                    setTimeout(() => {
                        codes.forEach((code, index) => {
                            setTimeout(() => {
                                clientSocket1.emit('code-change', code);
                            }, index * 50);
                        });
                    }, 100);
                });
            });
        });
    });

    describe('Multiple Clients', () => {
        test('should handle 3 simultaneous connections', (done) => {
            clientSocket1 = io(`http://localhost:${PORT}`);

            clientSocket1.once('users-update', () => {
                clientSocket2 = io(`http://localhost:${PORT}`);

                clientSocket2.once('users-update', () => {
                    clientSocket3 = io(`http://localhost:${PORT}`);

                    clientSocket3.once('users-update', (users) => {
                        expect(users.length).toBeGreaterThanOrEqual(3);
                        done();
                    });
                });
            });
        });

        test('should broadcast code to all other clients', (done) => {
            const testCode = 'function test() {}';
            let client2Received = false;
            let client3Received = false;

            clientSocket1 = io(`http://localhost:${PORT}`);
            clientSocket2 = io(`http://localhost:${PORT}`);
            clientSocket3 = io(`http://localhost:${PORT}`);

            clientSocket2.on('code-update', (code) => {
                expect(code).toBe(testCode);
                client2Received = true;
                checkDone();
            });

            clientSocket3.on('code-update', (code) => {
                expect(code).toBe(testCode);
                client3Received = true;
                checkDone();
            });

            function checkDone() {
                if (client2Received && client3Received) {
                    done();
                }
            }

            Promise.all([
                new Promise(resolve => clientSocket1.on('connect', resolve)),
                new Promise(resolve => clientSocket2.on('connect', resolve)),
                new Promise(resolve => clientSocket3.on('connect', resolve))
            ]).then(() => {
                setTimeout(() => {
                    clientSocket1.emit('code-change', testCode);
                }, 100);
            });
        });
    });
});
