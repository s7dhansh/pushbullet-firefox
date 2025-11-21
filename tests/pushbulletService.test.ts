import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as service from '../src/services/pushbulletService';

describe('Pushbullet Service', () => {
  const mockApiKey = 'test-api-key';

  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  describe('getCurrentUser', () => {
    it('fetches current user successfully', async () => {
      const mockUser = {
        iden: 'user1',
        email: 'test@test.com',
        name: 'Test User',
        image_url: 'https://example.com/image.jpg',
      };

      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => mockUser,
      } as Response);

      const result = await service.getCurrentUser(mockApiKey);

      expect(fetch).toHaveBeenCalledWith(
        'https://api.pushbullet.com/v2/users/me',
        expect.objectContaining({
          headers: expect.objectContaining({
            'Access-Token': mockApiKey,
          }),
        })
      );
      expect(result).toEqual(mockUser);
    });

    it('throws error when fetch fails', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: false,
        status: 401,
      } as Response);

      await expect(service.getCurrentUser(mockApiKey)).rejects.toThrow('Failed to fetch user');
    });
  });

  describe('getDevices', () => {
    it('fetches and filters active devices', async () => {
      const mockDevices = {
        devices: [
          { iden: 'device1', active: true, nickname: 'Phone' },
          { iden: 'device2', active: false, nickname: 'Old Phone' },
          { iden: 'device3', active: true, nickname: 'Tablet' },
        ],
      };

      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => mockDevices,
      } as Response);

      const result = await service.getDevices(mockApiKey);

      expect(result).toHaveLength(2);
      expect(result.every((d) => d.active)).toBe(true);
    });
  });

  describe('sendPush', () => {
    it('sends note push successfully', async () => {
      const pushData = {
        type: 'note',
        title: 'Test',
        body: 'Test message',
      };

      const mockResponse = { iden: 'push1', ...pushData };

      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      const result = await service.sendPush(mockApiKey, pushData);

      expect(fetch).toHaveBeenCalledWith(
        'https://api.pushbullet.com/v2/pushes',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(pushData),
        })
      );
      expect(result).toEqual(mockResponse);
    });

    it('sends link push successfully', async () => {
      const pushData = {
        type: 'link',
        url: 'https://example.com',
      };

      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ iden: 'push1', ...pushData }),
      } as Response);

      await service.sendPush(mockApiKey, pushData);

      expect(fetch).toHaveBeenCalledWith(
        'https://api.pushbullet.com/v2/pushes',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(pushData),
        })
      );
    });

    it('sends push to specific device', async () => {
      const pushData = {
        type: 'note',
        body: 'Test',
        device_iden: 'device1',
      };

      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ iden: 'push1', ...pushData }),
      } as Response);

      await service.sendPush(mockApiKey, pushData);

      expect(fetch).toHaveBeenCalledWith(
        'https://api.pushbullet.com/v2/pushes',
        expect.objectContaining({
          body: JSON.stringify(pushData),
        })
      );
    });
  });

  describe('deletePush', () => {
    it('deletes push successfully', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
      } as Response);

      await service.deletePush(mockApiKey, 'push1');

      expect(fetch).toHaveBeenCalledWith(
        'https://api.pushbullet.com/v2/pushes/push1',
        expect.objectContaining({
          method: 'DELETE',
        })
      );
    });

    it('throws error when delete fails', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: false,
      } as Response);

      await expect(service.deletePush(mockApiKey, 'push1')).rejects.toThrow(
        'Failed to delete push'
      );
    });
  });

  describe('sendSMS', () => {
    it('sends SMS via ephemeral', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      } as Response);

      await service.sendSMS(mockApiKey, 'user1', 'device1', '+1234567890', 'Test SMS');

      expect(fetch).toHaveBeenCalledWith(
        'https://api.pushbullet.com/v2/ephemerals',
        expect.objectContaining({
          method: 'POST',
          body: expect.stringContaining('messaging_extension_reply'),
        })
      );
    });
  });

  describe('createWebSocket', () => {
    it('creates WebSocket connection', () => {
      const onMessage = vi.fn();
      const ws = service.createWebSocket(mockApiKey, onMessage);

      expect(ws).toBeDefined();
      expect(ws.url).toBe(`wss://stream.pushbullet.com/websocket/${mockApiKey}`);
    });

    it('handles incoming messages', async () => {
      const onMessage = vi.fn();
      const ws = service.createWebSocket(mockApiKey, onMessage);

      const mockMessage = { type: 'push', push: { type: 'note' } };
      const messageEvent = {
        data: JSON.stringify(mockMessage),
      } as MessageEvent;

      // Simulate message received
      if (ws.onmessage) {
        ws.onmessage(messageEvent);
      }

      expect(onMessage).toHaveBeenCalledWith(mockMessage);
    });
  });
});
