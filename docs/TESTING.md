# Testing Guide for Pushbullet Firefox Extension

## Installation

1. Open Firefox and navigate to `about:debugging#/runtime/this-firefox`
2. Click "Load Temporary Add-on"
3. Navigate to the `dist` folder and select `manifest.json`
4. The extension should now be loaded

## Core Functionality Testing

### 1. SMS Sync - Receive SMS Notifications on Mac

**Setup:**
- Make sure you have the Pushbullet app installed on your Android phone
- Enable SMS mirroring in the Pushbullet Android app
- Your phone must be connected to the internet

**Test Steps:**
1. Load the extension in Firefox
2. Click the extension icon and log in with your Pushbullet API key
3. Navigate to the SMS tab to verify your phone is detected
4. Send an SMS to your phone from another device
5. You should see a Firefox notification appear on your Mac with the SMS content

**Expected Result:**
- Firefox notification appears with sender name/number and message content
- The notification shows immediately when SMS is received
- SMS also appears in the SMS tab of the extension

**Troubleshooting:**
- If notifications don't appear, check Firefox notification permissions
- Make sure the background script is running (check browser console)
- Verify your phone has internet connection and Pushbullet app is running

### 2. Send Push to Phone from Computer

**Test Steps:**
1. Click the extension icon
2. Navigate to the "Send Push" tab (icon with paper plane)
3. Select push type:
   - **Note**: Enter a title (optional) and message
   - **Link**: Enter a URL and optional description
4. Select target device (or leave as "All Devices")
5. Click "Send Push"

**Expected Result:**
- Success message appears in the extension
- Push notification appears on your phone immediately
- For notes: notification shows with title and message
- For links: notification shows with URL that can be opened

**Test Cases:**
- Send a note to all devices
- Send a note to a specific device
- Send a link to your phone
- Send without title (should still work)

## Additional Features

### SMS Client
- View SMS threads
- Send SMS from computer
- Compose new SMS messages

### Push History
- View recent pushes
- Delete pushes

### Device Management
- View all connected devices
- See device status

## Common Issues

1. **CORS Errors**: The extension must be installed as a Firefox extension, not run as a web page
2. **No Notifications**: Check Firefox notification permissions in System Preferences > Notifications
3. **SMS Not Syncing**: Ensure Pushbullet Android app has SMS permissions and is running
4. **Connection Issues**: Check that WebSocket connection shows "Live" in the sidebar

## API Key

Get your API key from: https://www.pushbullet.com/#settings/account
