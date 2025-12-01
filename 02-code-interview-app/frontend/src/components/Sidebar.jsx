import React, { useState, useEffect } from 'react';
import { socket } from '../socket';

const Sidebar = () => {
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    socket.on('user-info', (userInfo) => {
      setCurrentUser(userInfo);
    });

    socket.on('users-update', (usersList) => {
      setUsers(usersList);
    });

    return () => {
      socket.off('user-info');
      socket.off('users-update');
    };
  }, []);

  return (
    <div className="sidebar">
      <h2>Participants ({users.length})</h2>
      <ul className="user-list">
        {users.map((user) => (
          <li key={user.id} className="user-item">
            <span
              className="user-badge"
              style={{ backgroundColor: user.color }}
            >
              {user.name.split(' ').map(w => w[0]).join('')}
            </span>
            <span className="user-name" style={{ color: user.color }}>
              {user.name}
              {currentUser && user.id === currentUser.id && ' (You)'}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Sidebar;
