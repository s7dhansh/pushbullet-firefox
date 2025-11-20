
const API_BASE = 'https://api.pushbullet.com/v2';

const getHeaders = (apiKey) => ({
  // Using Basic Auth (ApiKey as username, empty password) prevents some header stripping issues
  'Authorization': 'Basic ' + btoa(apiKey + ':'),
  'Content-Type': 'application/json',
});

export const getCurrentUser = async (apiKey) => {
  console.log("Attempting login with key ending in:", apiKey.slice(-4));
  try {
    const res = await fetch(`${API_BASE}/users/me`, {
      headers: getHeaders(apiKey),
    });
    
    if (!res.ok) {
      const errorText = await res.text();
      console