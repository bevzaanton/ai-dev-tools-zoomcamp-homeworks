import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import Sidebar from '../Sidebar';
import { socket } from '../../socket';

describe('Sidebar', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render participants heading', () => {
    render(<Sidebar />);
    expect(screen.getByText(/Participants/)).toBeInTheDocument();
  });

  it('should display user count as zero initially', () => {
    render(<Sidebar />);
    expect(screen.getByText('Participants (0)')).toBeInTheDocument();
  });

  it('should set up socket event listeners on mount', () => {
    render(<Sidebar />);

    expect(socket.on).toHaveBeenCalledWith('user-info', expect.any(Function));
    expect(socket.on).toHaveBeenCalledWith('users-update', expect.any(Function));
  });

  it('should clean up socket listeners on unmount', () => {
    const { unmount } = render(<Sidebar />);
    unmount();

    expect(socket.off).toHaveBeenCalledWith('user-info');
    expect(socket.off).toHaveBeenCalledWith('users-update');
  });

  it('should update users list when users-update event is received', async () => {
    const mockUsers = [
      { id: '1', name: 'Quick Panda', color: '#FF6B6B' },
      { id: '2', name: 'Clever Tiger', color: '#4ECDC4' },
    ];

    let usersUpdateCallback;
    socket.on.mockImplementation((event, callback) => {
      if (event === 'users-update') {
        usersUpdateCallback = callback;
      }
    });

    render(<Sidebar />);

    usersUpdateCallback(mockUsers);

    await waitFor(() => {
      expect(screen.getByText('Participants (2)')).toBeInTheDocument();
      expect(screen.getByText(/Quick Panda/)).toBeInTheDocument();
      expect(screen.getByText(/Clever Tiger/)).toBeInTheDocument();
    });
  });

  it('should display current user with "(You)" label', async () => {
    const mockCurrentUser = { id: '1', name: 'Quick Panda', color: '#FF6B6B' };
    const mockUsers = [
      { id: '1', name: 'Quick Panda', color: '#FF6B6B' },
      { id: '2', name: 'Clever Tiger', color: '#4ECDC4' },
    ];

    let userInfoCallback;
    let usersUpdateCallback;

    socket.on.mockImplementation((event, callback) => {
      if (event === 'user-info') {
        userInfoCallback = callback;
      } else if (event === 'users-update') {
        usersUpdateCallback = callback;
      }
    });

    render(<Sidebar />);

    userInfoCallback(mockCurrentUser);
    usersUpdateCallback(mockUsers);

    await waitFor(() => {
      expect(screen.getByText(/Quick Panda \(You\)/)).toBeInTheDocument();
      expect(screen.getByText(/Clever Tiger/)).toBeInTheDocument();
    });
  });

  it('should display user badges with correct initials', async () => {
    const mockUsers = [
      { id: '1', name: 'Quick Panda', color: '#FF6B6B' },
    ];

    let usersUpdateCallback;
    socket.on.mockImplementation((event, callback) => {
      if (event === 'users-update') {
        usersUpdateCallback = callback;
      }
    });

    render(<Sidebar />);
    usersUpdateCallback(mockUsers);

    await waitFor(() => {
      const badge = screen.getByText('QP');
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveStyle({ backgroundColor: '#FF6B6B' });
    });
  });
});
