import React, { useEffect } from 'react';
import Sidebar from './components/Sidebar';
import CodeEditor from './components/CodeEditor';
import OutputPanel from './components/OutputPanel';
import { socket } from './socket';
import './App.css';

function App() {
  useEffect(() => {
    console.log('Attempting to connect socket...');

    socket.on('connect', () => {
      console.log('Socket connected successfully!', socket.id);
    });

    socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });

    socket.connect();

    return () => {
      socket.off('connect');
      socket.off('connect_error');
      socket.disconnect();
    };
  }, []);

  const [output, setOutput] = React.useState([]);

  const runCode = (code, language) => {
    if (language !== 'javascript') {
      setOutput(['Execution for ' + language + ' is not supported in this browser-only demo.']);
      return;
    }

    const logs = [];
    const originalConsoleLog = console.log;
    console.log = (...args) => {
      logs.push(args.join(' '));
      originalConsoleLog(...args);
    };

    try {
      // eslint-disable-next-line no-new-func
      new Function(code)();
    } catch (error) {
      logs.push('Error: ' + error.message);
    } finally {
      console.log = originalConsoleLog;
      setOutput(logs);
    }
  };

  return (
    <div className="app-container">
      <Sidebar />
      <main className="main-content">
        <CodeEditor onRun={runCode} />
        <OutputPanel output={output} />
      </main>
    </div>
  );
}

export default App;
