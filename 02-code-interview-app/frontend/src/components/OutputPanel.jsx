import React from 'react';

const OutputPanel = ({ output = [] }) => {
  return (
    <div className="output-panel">
      <h3>Output</h3>
      <div className="output-content">
        {output.length > 0 ? (
          output.map((line, index) => (
            <div key={index}>{line}</div>
          ))
        ) : (
          <div>&gt; Ready to execute...</div>
        )}
      </div>
    </div>
  );
};

export default OutputPanel;
