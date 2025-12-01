import React, { useEffect, useRef } from 'react';
import Sidebar from './components/Sidebar';
import CodeEditor from './components/CodeEditor';
import OutputPanel from './components/OutputPanel';
import { socket } from './socket';
import './App.css';

function App() {
  const pyodideRef = useRef(null);
  const [output, setOutput] = React.useState([]);
  const [isPyodideLoading, setIsPyodideLoading] = React.useState(false);

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

  const loadPyodide = async () => {
    if (pyodideRef.current) return pyodideRef.current;
    if (isPyodideLoading) return null;

    setIsPyodideLoading(true);
    try {
      // Load Pyodide from CDN
      if (!window.loadPyodide) {
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/pyodide/v0.24.1/full/pyodide.js';
        document.head.appendChild(script);

        await new Promise((resolve, reject) => {
          script.onload = resolve;
          script.onerror = reject;
        });
      }

      pyodideRef.current = await window.loadPyodide({
        indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.24.1/full/',
      });
      setIsPyodideLoading(false);
      return pyodideRef.current;
    } catch (error) {
      console.error('Failed to load Pyodide:', error);
      setIsPyodideLoading(false);
      return null;
    }
  };

  const runPythonCode = async (code) => {
    const logs = [];

    try {
      logs.push('Loading Python runtime...');
      setOutput([...logs]);

      const pyodide = await loadPyodide();
      if (!pyodide) {
        logs.push('Error: Failed to load Python runtime');
        setOutput(logs);
        return;
      }

      logs.pop(); // Remove "Loading Python runtime..." message

      // Redirect Python stdout to capture print statements
      pyodide.runPython(`
        import sys
        from io import StringIO
        sys.stdout = StringIO()
      `);

      // Run the user's code
      await pyodide.runPythonAsync(code);

      // Get the output
      const stdout = pyodide.runPython('sys.stdout.getvalue()');
      if (stdout) {
        logs.push(...stdout.split('\n').filter(line => line.trim()));
      }

      if (logs.length === 0) {
        logs.push('Code executed successfully (no output)');
      }
    } catch (error) {
      logs.push('Error: ' + error.message);
    }

    setOutput(logs);
  };

  const runJavaScriptCode = (code) => {
    const logs = [];
    const originalConsoleLog = console.log;
    console.log = (...args) => {
      logs.push(args.join(' '));
      originalConsoleLog(...args);
    };

    try {
      // eslint-disable-next-line no-new-func
      new Function(code)();
      if (logs.length === 0) {
        logs.push('Code executed successfully (no output)');
      }
    } catch (error) {
      logs.push('Error: ' + error.message);
    } finally {
      console.log = originalConsoleLog;
      setOutput(logs);
    }
  };

  const runCode = async (code, language) => {
    if (language === 'javascript') {
      runJavaScriptCode(code);
    } else if (language === 'python') {
      await runPythonCode(code);
    } else {
      setOutput(['Execution for ' + language + ' is not supported.']);
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
