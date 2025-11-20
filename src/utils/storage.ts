// Safe wrapper for storage to work in both Extension and Web environments
declare const chrome: any;

const isExtension = () => {
  try {
    return typeof chrome !== 'undefined' && !!chrome.storage && !!chrome.storage.local;
  } catch (e) {
    return false;
  }
};

export const getStorage = (key: string): Promise<string | null> => {
  return new Promise((resolve) => {
    if (isExtension()) {
      try {
        chrome.storage.local.get([key], (result: any) => {
          if (chrome.runtime.lastError) {
            console.warn('Chrome storage error:', chrome.runtime.lastError);
            resolve(localStorage.getItem(key));
          } else {
            resolve(result && result[key] ? result[key] : null);
          }
        });
      } catch (e) {
        console.error('Storage get error:', e);
        resolve(localStorage.getItem(key));
      }
    } else {
      resolve(localStorage.getItem(key));
    }
  });
};

export const setStorage = (key: string, value: string): Promise<void> => {
  return new Promise((resolve) => {
    if (isExtension()) {
      try {
        chrome.storage.local.set({ [key]: value }, () => {
          if (chrome.runtime.lastError) {
             console.warn('Chrome storage set error:', chrome.runtime.lastError);
             localStorage.setItem(key, value);
          }
          resolve();
        });
      } catch (e) {
        localStorage.setItem(key, value);
        resolve();
      }
    } else {
      localStorage.setItem(key, value);
      resolve();
    }
  });
};

export const removeStorage = (key: string): Promise<void> => {
  return new Promise((resolve) => {
    if (isExtension()) {
      try {
        chrome.storage.local.remove([key], () => resolve());
      } catch (e) {
        localStorage.removeItem(key);
        resolve();
      }
    } else {
      localStorage.removeItem(key);
      resolve();
    }
  });
};