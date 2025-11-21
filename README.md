# BulletBase - Pushbullet Firefox Extension

A feature-rich Pushbullet client for Firefox with SMS mirroring and push notifications.

## Core Features

### 1. SMS Sync 📱
Receive SMS notifications from your Android phone directly as Firefox notifications on your Mac.
- Real-time SMS mirroring
- Shows sender name/number and message content
- Native Firefox notifications
- Full SMS thread management

### 2. Send Push 🚀
Send pushes from your computer to your phone instantly.
- **Notes**: Send text messages to your devices
- **Links**: Share URLs with optional descriptions
- Target specific devices or broadcast to all
- Instant delivery

### 3. Additional Features
- View and manage all connected devices
- Browse push history
- Full SMS client (view threads, send messages)
- Real-time WebSocket connection
- Clean, modern UI

## Installation

### For Firefox

1. Download or build the extension
2. Open Firefox and go to `about:debugging#/runtime/this-firefox`
3. Click "Load Temporary Add-on"
4. Navigate to the `dist` folder and select `manifest.json`

### Get API Key

1. Go to https://www.pushbullet.com/#settings/account
2. Create an Access Token
3. Copy the token and paste it when logging into the extension

## Development

**Prerequisites:** Node.js and npm

1. Install dependencies:
   ```bash
   npm install
   ```

2. Build the extension:
   ```bash
   npm run build
   ```

3. Create distribution package:
   ```bash
   npm run zip
   ```

4. For development with hot reload:
   ```bash
   npm run dev
   ```

## Testing

See [TESTING.md](TESTING.md) for detailed testing instructions.

## How It Works

- **Background Script**: Maintains WebSocket connection to Pushbullet servers
- **Popup UI**: React-based interface for managing devices, SMS, and pushes
- **Real-time Sync**: Instant notifications via WebSocket
- **Native Integration**: Uses Firefox notification API

## Requirements

- Firefox browser
- Pushbullet account
- Android phone with Pushbullet app (for SMS sync)

## Tech Stack

- React + TypeScript
- Vite
- Tailwind CSS
- Pushbullet API
- WebSocket for real-time updates

## License

MIT
