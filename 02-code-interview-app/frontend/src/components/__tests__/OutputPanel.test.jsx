import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import OutputPanel from '../OutputPanel';

describe('OutputPanel', () => {
  it('should render the output heading', () => {
    render(<OutputPanel output={[]} />);
    expect(screen.getByText('Output')).toBeInTheDocument();
  });

  it('should display ready message when no output', () => {
    render(<OutputPanel output={[]} />);
    expect(screen.getByText('> Ready to execute...')).toBeInTheDocument();
  });

  it('should display output lines when provided', () => {
    const output = ['Line 1', 'Line 2', 'Line 3'];
    render(<OutputPanel output={output} />);

    expect(screen.getByText('Line 1')).toBeInTheDocument();
    expect(screen.getByText('Line 2')).toBeInTheDocument();
    expect(screen.getByText('Line 3')).toBeInTheDocument();
  });

  it('should handle empty output array', () => {
    render(<OutputPanel />);
    expect(screen.getByText('> Ready to execute...')).toBeInTheDocument();
  });

  it('should render multiple output lines correctly', () => {
    const output = ['Hello World', 'Test output', 'Error: Something went wrong'];
    const { container } = render(<OutputPanel output={output} />);

    const outputContent = container.querySelector('.output-content');
    expect(outputContent.children).toHaveLength(3);
  });
});
