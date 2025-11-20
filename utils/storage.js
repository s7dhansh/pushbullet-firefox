
export const getStorage = (key) => {
  return new Promise((resolve) => {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      chrome.storage.local.get([key], (result) => {
        resolve(result[key] || null);
      });
    } else {
      resolve(localStorage.getItem(key));
    }
  });
};

export const setStorage = (key, value) => {
  return new Promise((resolve) => {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      chrome.storage.local.set({ [key]: value }, () => resolve());
    } else {
      localStorage.setItem(key, value);
      resolve();
    }
  });
};

export const removeStorage = (key) => {
  return new Promise((resolve) => {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      chrome.storage.local.remove([key], () => resolve());
    } else {
      localStorage.removeItem(key);
      resolve();
    }
  });
};
