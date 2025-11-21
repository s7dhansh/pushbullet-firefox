import { expect, afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';

// Extend Vitest's expect with jest-dom matchers
expect.extend(matchers);

// Cleanup after each test
afterEach(() => {
  cleanup();
});

// Mock chrome API
global.chrome = {
  storage: {
    local: {
      get: vi.fn((_keys, callback) => {
        callback({});
      }),
      set: vi.fn((_items, callback) => {
        callback?.();
      }),
      remove: vi.fn((_keys, callback) => {
        callback?.();
      }),
    },
    onChanged: {
      addListener: vi.fn(),
    },
  },
  notifications: {
    create: vi.fn(),
  },
  runtime: {
    id: 'test-extension-id',
  },
} as any;

// Mock WebSocket
class MockWebSocket {
  onopen: any = null;
  onmessage: any = null;
  onclose: any = null;
  onerror: any = null;
  close = vi.fn();
  send = vi.fn();
  readyState = 1; // OPEN

  constructor(public url: string) {
    // Simulate connection opening
    setTimeout(() => {
      if (this.onopen) this.onopen(new Event('open'));
    }, 0);
  }
}

global.WebSocket = MockWebSocket as any;

// Mock fetch
global.fetch = vi.fn();
