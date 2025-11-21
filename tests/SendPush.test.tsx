/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SendPush from '../src/components/SendPush';
import * as service from '../src/services/pushbulletService';

vi.mock('../src/services/pushbulletService');

describe('SendPush Component', () => {
  const mockApiKey = 'test-api-key';
  const mockDevices = [
    {
      iden: 'device1',
      nickname: 'Test Phone',
      pushable: true,
      active: true,
      created: 1234567890,
      modified: 1234567890,
      icon: 'phone',
      generated_nickname: false,
      manufacturer: 'Test',
      model: 'Phone',
      app_version: 1,
      push_token: 'token',
      has_sms: true,
      kind: 'android',
    },
  ];
  const mockPushes = [
    {
      iden: 'push1',
      active: true,
      created: 1234567890,
      modified: 1234567890,
      type: 'note' as const,
      dismissed: false,
      direction: 'self' as const,
      sender_iden: 'user1',
      sender_email: 'test@test.com',
      receiver_iden: 'user1',
      receiver_email: 'test@test.com',
      title: 'Test Push',
      body: 'Test message',
    },
  ];
  const mockOnRefresh = vi.fn();
  const mockSetLoading = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders send push form', () => {
    render(
      <SendPush
        apiKey={mockApiKey}
        devices={mockDevices}
        pushes={[]}
        loading={false}
        onRefresh={mockOnRefresh}
        setLoading={mockSetLoading}
      />
    );

    expect(screen.getByPlaceholderText(/type message or paste url/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /send/i })).toBeInTheDocument();
  });

  it('sends a text note when user types message', async () => {
    const user = userEvent.setup();
    vi.mocked(service.sendPush).mockResolvedValue({} as any);

    render(
      <SendPush
        apiKey={mockApiKey}
        devices={mockDevices}
        pushes={[]}
        loading={false}
        onRefresh={mockOnRefresh}
        setLoading={mockSetLoading}
      />
    );

    const input = screen.getByPlaceholderText(/type message or paste url/i);
    const sendButton = screen.getByRole('button', { name: /send/i });

    await user.type(input, 'Hello from test');
    await user.click(sendButton);

    await waitFor(() => {
      expect(service.sendPush).toHaveBeenCalledWith(mockApiKey, {
        type: 'note',
        body: 'Hello from test',
      });
    });
  });

  it('sends a link when user pastes URL', async () => {
    const user = userEvent.setup();
    vi.mocked(service.sendPush).mockResolvedValue({} as any);

    render(
      <SendPush
        apiKey={mockApiKey}
        devices={mockDevices}
        pushes={[]}
        loading={false}
        onRefresh={mockOnRefresh}
        setLoading={mockSetLoading}
      />
    );

    const input = screen.getByPlaceholderText(/type message or paste url/i);
    const sendButton = screen.getByRole('button', { name: /send/i });

    await user.type(input, 'https://example.com');
    await user.click(sendButton);

    await waitFor(() => {
      expect(service.sendPush).toHaveBeenCalledWith(mockApiKey, {
        type: 'link',
        url: 'https://example.com',
      });
    });
  });

  it('sends to specific device when selected', async () => {
    const user = userEvent.setup();
    vi.mocked(service.sendPush).mockResolvedValue({} as any);

    render(
      <SendPush
        apiKey={mockApiKey}
        devices={mockDevices}
        pushes={[]}
        loading={false}
        onRefresh={mockOnRefresh}
        setLoading={mockSetLoading}
      />
    );

    const deviceSelect = screen.getByRole('combobox');
    const input = screen.getByPlaceholderText(/type message or paste url/i);
    const sendButton = screen.getByRole('button', { name: /send/i });

    await user.selectOptions(deviceSelect, 'device1');
    await user.type(input, 'Test message');
    await user.click(sendButton);

    await waitFor(() => {
      expect(service.sendPush).toHaveBeenCalledWith(mockApiKey, {
        type: 'note',
        body: 'Test message',
        device_iden: 'device1',
      });
    });
  });

  it('displays push history', () => {
    render(
      <SendPush
        apiKey={mockApiKey}
        devices={mockDevices}
        pushes={mockPushes}
        loading={false}
        onRefresh={mockOnRefresh}
        setLoading={mockSetLoading}
      />
    );

    expect(screen.getByText('Test Push')).toBeInTheDocument();
    expect(screen.getByText('Test message')).toBeInTheDocument();
  });

  it('deletes push when delete button clicked', async () => {
    const user = userEvent.setup();
    vi.mocked(service.deletePush).mockResolvedValue();

    render(
      <SendPush
        apiKey={mockApiKey}
        devices={mockDevices}
        pushes={mockPushes}
        loading={false}
        onRefresh={mockOnRefresh}
        setLoading={mockSetLoading}
      />
    );

    const deleteButton = screen.getByRole('button', { name: /delete push/i });
    await user.click(deleteButton);

    await waitFor(() => {
      expect(service.deletePush).toHaveBeenCalledWith(mockApiKey, 'push1');
      expect(mockOnRefresh).toHaveBeenCalled();
    });
  });

  it('shows error when send fails', async () => {
    const user = userEvent.setup();
    vi.mocked(service.sendPush).mockRejectedValue(new Error('Network error'));

    render(
      <SendPush
        apiKey={mockApiKey}
        devices={mockDevices}
        pushes={[]}
        loading={false}
        onRefresh={mockOnRefresh}
        setLoading={mockSetLoading}
      />
    );

    const input = screen.getByPlaceholderText(/type message or paste url/i);
    const sendButton = screen.getByRole('button', { name: /send/i });

    await user.type(input, 'Test');
    await user.click(sendButton);

    await waitFor(() => {
      expect(screen.getByText(/network error/i)).toBeInTheDocument();
    });
  });

  it('shows success message after sending', async () => {
    const user = userEvent.setup();
    vi.mocked(service.sendPush).mockResolvedValue({} as any);

    render(
      <SendPush
        apiKey={mockApiKey}
        devices={mockDevices}
        pushes={[]}
        loading={false}
        onRefresh={mockOnRefresh}
        setLoading={mockSetLoading}
      />
    );

    const input = screen.getByPlaceholderText(/type message or paste url/i);
    const sendButton = screen.getByRole('button', { name: /send/i });

    await user.type(input, 'Test');
    await user.click(sendButton);

    await waitFor(() => {
      expect(screen.getByText(/sent successfully/i)).toBeInTheDocument();
    });
  });

  it('clears input after successful send', async () => {
    const user = userEvent.setup();
    vi.mocked(service.sendPush).mockResolvedValue({} as any);

    render(
      <SendPush
        apiKey={mockApiKey}
        devices={mockDevices}
        pushes={[]}
        loading={false}
        onRefresh={mockOnRefresh}
        setLoading={mockSetLoading}
      />
    );

    const input = screen.getByPlaceholderText(/type message or paste url/i) as HTMLInputElement;
    const sendButton = screen.getByRole('button', { name: /send/i });

    await user.type(input, 'Test');
    await user.click(sendButton);

    await waitFor(() => {
      expect(input.value).toBe('');
    });
  });

  it('disables send button when input is empty', () => {
    render(
      <SendPush
        apiKey={mockApiKey}
        devices={mockDevices}
        pushes={[]}
        loading={false}
        onRefresh={mockOnRefresh}
        setLoading={mockSetLoading}
      />
    );

    const sendButton = screen.getByRole('button', { name: /send/i });
    expect(sendButton).toBeDisabled();
  });

  it('calls onRefresh when refresh button clicked', async () => {
    const user = userEvent.setup();

    render(
      <SendPush
        apiKey={mockApiKey}
        devices={mockDevices}
        pushes={[]}
        loading={false}
        onRefresh={mockOnRefresh}
        setLoading={mockSetLoading}
      />
    );

    const refreshButton = screen.getByRole('button', { name: /refresh push history/i });
    await user.click(refreshButton);

    expect(mockOnRefresh).toHaveBeenCalled();
  });
});
