import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getStorage, setStorage, removeStorage } from '../src/utils/storage';

describe('Storage Utils', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getStorage', () => {
    it('retrieves value from chrome storage', async () => {
      const mockValue = 'test-value';
      vi.mocked(chrome.storage.local.get).mockImplementation((_keys, callback) => {
        callback({ test_key: mockValue });
      });

      const result = await getStorage('test_key');

      expect(result).toBe(mockValue);
      expect(chrome.storage.local.get).toHaveBeenCalledWith(['test_key'], expect.any(Function));
    });

    it('returns null when key not found', async () => {
      vi.mocked(chrome.storage.local.get).mockImplementation((_keys, callback) => {
        callback({});
      });

      const result = await getStorage('nonexistent_key');

      expect(result).toBeNull();
    });
  });

  describe('setStorage', () => {
    it('stores value in chrome storage', async () => {
      vi.mocked(chrome.storage.local.set).mockImplementation((_items, callback) => {
        callback?.();
      });

      await setStorage('test_key', 'test-value');

      expect(chrome.storage.local.set).toHaveBeenCalledWith(
        { test_key: 'test-value' },
        expect.any(Function)
      );
    });
  });

  describe('removeStorage', () => {
    it('removes value from chrome storage', async () => {
      vi.mocked(chrome.storage.local.remove).mockImplementation((_keys, callback) => {
        callback?.();
      });

      await removeStorage('test_key');

      expect(chrome.storage.local.remove).toHaveBeenCalledWith(['test_key'], expect.any(Function));
    });
  });
});
