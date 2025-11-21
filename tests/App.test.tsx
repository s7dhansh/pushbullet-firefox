import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../src/App';
import * as service from '../src/services/pushbulletService';
import * as storage from '../src/utils/storage';

vi.mock('../src/services/pushbulletService');
vi.mock('../src/utils/storage');

describe('App Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock getDevices and getPushes to prevent errors in Dashboard
    vi.mocked(service.getDevices).mockResolvedValue([]);
    vi.mocked(service.getPushes).mockResolvedValue([]);
  });

  it('shows login screen when no API key stored', async () => {
    vi.mocked(storage.getStorage).mockResolvedValue(null);

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText(/connect account/i)).toBeInTheDocument();
    });
  });

  it('shows error message on invalid API key', async () => {
    vi.mocked(storage.getStorage).mockResolvedValue('invalid-key');
    vi.mocked(service.getCurrentUser).mockRejectedValue(new Error('Invalid API Key'));

    render(<App />);

    await waitFor(
      () => {
        expect(screen.getByText(/invalid api key/i)).toBeInTheDocument();
      },
      { timeout: 3000 }
    );
  });

  it('logs in successfully with valid API key', async () => {
    const user = userEvent.setup();
    const mockUser = {
      iden: 'user1',
      email: 'test@test.com',
      name: 'Test User',
      image_url: 'https://example.com/image.jpg',
    };

    vi.mocked(storage.getStorage).mockResolvedValue(null);
    vi.mocked(service.getCurrentUser).mockResolvedValue(mockUser);
    vi.mocked(storage.setStorage).mockResolvedValue();

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText(/connect account/i)).toBeInTheDocument();
    });

    const input = screen.getByPlaceholderText(/o\.x/i);
    const loginButton = screen.getByRole('button', { name: /connect account/i });

    await user.type(input, 'test-api-key');
    await user.click(loginButton);

    await waitFor(
      () => {
        expect(service.getCurrentUser).toHaveBeenCalledWith('test-api-key');
        expect(storage.setStorage).toHaveBeenCalledWith('pb_api_key', 'test-api-key');
      },
      { timeout: 3000 }
    );
  });
});
