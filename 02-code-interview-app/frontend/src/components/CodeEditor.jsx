import React, { useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { socket } from '../socket';

const CodeEditor = ({ onRun }) => {
  const [language, setLanguage] = useState('javascript');
  const [code, setCode] = useState('// Type your code here...');

  useEffect(() => {
    socket.on('code-update', (newCode) => {
      console.log('Received code-update:', newCode.substring(0, 50) + '...');
      setCode(newCode);
    });

    return () => {
      socket.off('code-update');
    };
  }, []);

  const handleEditorChange = (value) => {
    setCode(value);
    console.log('Emitting code-change, socket connected:', socket.connected);
    socket.emit('code-change', value);
  };

  const handleRun = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onRun) {
      onRun(code, language);
    }
  };

  return (
    <div className="code-editor">
      <div className="editor-header">
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          className="language-select"
        >
          <option value="javascript">JavaScript</option>
          <option value="python">Python</option>
        </select>
        <button type="button" className="run-button" onClick={handleRun}>Run</button>
      </div>
      <Editor
        height="100%"
        language={language}
        value={code}
        theme="vs-dark"
        onChange={handleEditorChange}
        options={{
          minimap: { enabled: false },
          fontSize: 14,
        }}
      />
    </div>
  );
};

export default CodeEditor;
