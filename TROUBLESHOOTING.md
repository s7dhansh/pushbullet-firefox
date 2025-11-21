# Troubleshooting Guide

Common issues and their solutions for BulletBase Firefox Extension.

## Table of Contents

- [Installation Issues](#installation-issues)
- [SMS Sync Issues](#sms-sync-issues)
- [Push Notification Issues](#push-notification-issues)
- [Connection Issues](#connection-issues)
- [Performance Issues](#performance-issues)

---

## Installation Issues

### Extension won't load

**Problem**: Extension fails to load in Firefox

**Solutions**:

1. Check Firefox version (requires 90+)
2. Verify `manifest.json` exists in dist folder
3. Check browser console for errors (F12)
4. Try rebuilding: `npm run build`

### Build fails

**Problem**: `npm run build` fails with errors

**Solutions**:

1. Delete `node_modules` and reinstall:
   ```bash
   rm -rf node_modules
   npm install
   ```
2. Clear build cache:
   ```bash
   rm -rf dist
   npm run build
   ```
3. Check Node.js version (requires 18+)

---

## SMS Sync Issues

### SMS notifications not appearing

**Problem**: Not receiving SMS notifications on computer

**Checklist**:

- [ ] Pushbullet Android app is running
- [ ] SMS permissions granted in Android app
- [ ] Phone has internet connection
- [ ] WebSocket shows "Live" in extension
- [ ] Firefox notifications enabled

**Solutions**:

1. **Check Firefox Notifications**:
   - macOS: System Preferences → Notifications → Firefox
   - Windows: Settings → System → Notifications → Firefox
   - Linux: System Settings → Notifications

2. **Verify Android App**:
   - Open Pushbullet app on phone
   - Go to Settings → SMS
   - Ensure "SMS Mirroring" is enabled
   - Grant SMS permissions if prompted

3. **Check WebSocket Connection**:
   - Open extension
   - Look for "Live" indicator in sidebar
   - If "Offline", check internet connection
   - Try refreshing extension

4. **Test with Manual SMS**:
   - Send SMS to your phone
   - Check if notification appears
   - Check browser console (F12) for errors

### SMS threads not loading

**Problem**: SMS tab shows "No SMS threads found"

**Solutions**:

1. Ensure phone is awake and connected
2. Click refresh button in SMS tab
3. Wait 5-10 seconds for response
4. Check if phone has SMS messages
5. Verify device is SMS-capable in Devices tab

### Can't send SMS from computer

**Problem**: SMS send fails or doesn't deliver

**Solutions**:

1. Check phone has signal
2. Verify recipient number format (+1234567890)
3. Ensure Pushbullet app is running on phone
4. Check for error messages in extension
5. Try sending from phone first to verify number

---

## Push Notification Issues

### Pushes not appearing on phone

**Problem**: Sent pushes don't show up on phone

**Checklist**:

- [ ] Phone has internet connection
- [ ] Pushbullet app is installed and logged in
- [ ] Correct device selected (or "All Devices")
- [ ] Phone notifications enabled for Pushbullet

**Solutions**:

1. **Verify Device Status**:
   - Go to Devices tab
   - Check device shows as active
   - Try selecting specific device

2. **Check Phone Settings**:
   - Open Pushbullet app
   - Verify logged in with same account
   - Check notification permissions

3. **Test with Simple Push**:
   - Send simple text: "test"
   - Check if it appears in push history
   - Check phone notifications

### URL not detected as link

**Problem**: Pasted URL sends as text instead of link

**Solutions**:

1. Ensure URL includes protocol: `https://example.com`
2. Check for extra spaces before/after URL
3. Try copying URL again
4. Verify URL is valid

### Push history not updating

**Problem**: Sent pushes don't appear in history

**Solutions**:

1. Click refresh button
2. Wait a few seconds for sync
3. Check internet connection
4. Reload extension

---

## Connection Issues

### WebSocket shows "Offline"

**Problem**: Extension can't connect to Pushbullet

**Solutions**:

1. **Check Internet Connection**:

   ```bash
   # Test connectivity
   ping api.pushbullet.com
   ```

2. **Verify API Key**:
   - Go to [Pushbullet Settings](https://www.pushbullet.com/#settings/account)
   - Check if token is still valid
   - Try creating new token
   - Re-login with new token

3. **Check Firewall/Proxy**:
   - Ensure WebSocket connections allowed
   - Check corporate firewall settings
   - Try different network

4. **Browser Issues**:
   - Clear browser cache
   - Disable other extensions temporarily
   - Try Firefox in safe mode

### Frequent disconnections

**Problem**: WebSocket keeps disconnecting

**Solutions**:

1. Check network stability
2. Disable VPN temporarily
3. Check for browser updates
4. Monitor browser console for errors

### CORS errors

**Problem**: "CORS blocked" errors in console

**Solution**:

- Extension must be installed, not run as web page
- Load from `about:debugging`, not `localhost`
- Rebuild and reload extension

---

## Performance Issues

### Extension slow to load

**Problem**: Extension takes long time to open

**Solutions**:

1. Check number of pushes in history
2. Clear old pushes
3. Check internet speed
4. Restart Firefox

### High memory usage

**Problem**: Extension uses too much memory

**Solutions**:

1. Close and reopen extension
2. Clear push history
3. Restart Firefox
4. Check for memory leaks in console

### SMS tab slow to load

**Problem**: SMS threads take long time to appear

**Solutions**:

1. This is normal for first load (5-10 seconds)
2. Ensure phone is awake
3. Check phone's internet speed
4. Reduce number of SMS threads on phone

---

## Error Messages

### "Invalid API Key"

**Cause**: API token is incorrect or expired

**Solution**:

1. Get new token from Pushbullet
2. Logout and login again
3. Verify token copied correctly

### "Network Error: CORS blocked"

**Cause**: Running as web page instead of extension

**Solution**:

- Install as Firefox extension
- Don't run from `localhost`

### "Request timed out"

**Cause**: Phone not responding or offline

**Solution**:

1. Wake up phone
2. Check phone's internet
3. Restart Pushbullet app on phone
4. Click retry button

### "Failed to send push"

**Cause**: Network or API error

**Solution**:

1. Check internet connection
2. Verify API key is valid
3. Try again in a few seconds
4. Check Pushbullet service status

---

## Debug Mode

### Enable Debug Logging

1. Open browser console (F12)
2. Go to Console tab
3. Look for extension logs
4. Check for errors or warnings

### Useful Console Commands

```javascript
// Check WebSocket status
console.log(chrome.runtime.getBackgroundPage());

// View stored data
chrome.storage.local.get(null, console.log);

// Clear storage
chrome.storage.local.clear();
```

---

## Still Having Issues?

### Get Help

1. **Check Existing Issues**: [GitHub Issues](../../issues)
2. **Search Discussions**: [GitHub Discussions](../../discussions)
3. **Report Bug**: Use [Bug Report Template](.github/ISSUE_TEMPLATE/bug_report.md)

### Include in Bug Report

- Extension version
- Firefox version
- Operating system
- Console errors
- Steps to reproduce
- Screenshots

---

## Useful Links

- [Pushbullet API Status](https://status.pushbullet.com/)
- [Pushbullet Help Center](https://help.pushbullet.com/)
- [Firefox Extension Debugging](https://extensionworkshop.com/documentation/develop/debugging/)

---

Last updated: 2024-11-21
