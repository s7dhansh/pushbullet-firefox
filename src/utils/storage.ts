declare const chrome: any;

export const getStorage = (key: string): Promise<string | null> => {
  return new Promise((resolve) => {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      chrome.storage.local.get([key], (result: { [key: string]: any }) => {
        resolve(result[key] || null);
      });
    } else {
      resolve(localStorage.getItem(key));
    }
  });
};

export const setStorage = (key: string, value: string): Promise<void> => {
  return new Promise((resolve) => {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      chrome.storage.local.set({ [key]: value }, () => resolve());
    } else {
      localStorage.setItem(key, value);
      resolve();
    }
  });
};

export const removeStorage = (key: string): Promise<void> => {
  return new Promise((resolve) => {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      chrome.storage.local.remove([key], () => resolve());
    } else {
      localStorage.removeItem(key);
      resolve();
    }
  });
};