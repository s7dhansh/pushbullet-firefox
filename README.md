# 🚀 BulletBase - Pushbullet Firefox Extension

<div align="center">

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Firefox](https://img.shields.io/badge/Firefox-Extension-orange.svg)](https://www.mozilla.org/firefox/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.2-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.2-61dafb.svg)](https://reactjs.org/)

A powerful, feature-rich Pushbullet client for Firefox with SMS mirroring, push notifications, and seamless device integration.

[Features](#-features) • [Installation](#-installation) • [Quick Start](#-quick-start) • [Development](#-development) • [Contributing](#-contributing)

</div>

---

## ✨ Features

### 📱 SMS Sync

Receive SMS notifications from your Android phone directly as Firefox notifications on your Mac/PC.

- **Real-time mirroring** - Instant SMS notifications
- **Full thread management** - View and manage conversations
- **Send from computer** - Reply to SMS using your keyboard
- **Native notifications** - Uses Firefox notification API

### 🚀 Smart Push System

Send messages and links to your phone with one click.

- **Auto-detection** - Paste URL or type text, it knows what to do
- **Device targeting** - Send to specific device or broadcast to all
- **Instant delivery** - Push appears on phone immediately
- **Integrated history** - View all pushes in one place

### 📲 Device Management

- View all connected devices
- Real-time connection status
- Device details and capabilities
- SMS-capable device detection

### 🎨 Modern UI

- Clean, intuitive interface
- Responsive design
- Real-time updates via WebSocket
- Minimal, distraction-free experience

---

## 🎯 Quick Start

### 1️⃣ Install Extension

**Option A: Load Temporary (Development)**

1. Open Firefox → `about:debugging#/runtime/this-firefox`
2. Click "Load Temporary Add-on"
3. Navigate to `dist` folder → Select `manifest.json`

**Option B: Install from Release**

1. Download `extension.zip` from [Releases](../../releases)
2. Extract the zip file
3. Follow Option A steps

### 2️⃣ Get API Key

1. Visit [Pushbullet Settings](https://www.pushbullet.com/#settings/account)
2. Click "Create Access Token"
3. Copy the token (format: `o.aBcDeFgHiJkLmNoPqRsTuVwXyZ`)

### 3️⃣ Login & Use

1. Click extension icon in Firefox toolbar
2. Paste your API key → Click "Login"
3. Start sending pushes and receiving SMS notifications! 🎉

---

## 📖 Usage

### Send a Push

```
1. Click "Pushes" tab
2. Type message or paste URL
3. Click "Send"
4. Check your phone!
```

### SMS Sync

```
1. Ensure Pushbullet app is running on Android
2. Receive SMS on phone
3. Firefox notification appears on computer
4. Reply from SMS tab if needed
```

### View Devices

```
1. Click "Devices" tab
2. See all connected devices
3. Check connection status
```

---

## 🛠️ Development

### Prerequisites

- Node.js 18+ and npm
- Firefox browser
- Pushbullet account

### Setup

```bash
# Clone repository
git clone https://github.com/yourusername/pushbullet-firefox.git
cd pushbullet-firefox

# Install dependencies
npm install

# Start development server
npm run dev

# Build extension
npm run build

# Create distribution package
npm run zip

# Create versioned release (saves to releases/v{version}.zip)
npm run release

# Run tests
npm test

# Run tests with coverage
npm run test:coverage
```

### Project Structure

```
pushbullet-firefox/
├── src/
│   ├── components/       # React components
│   │   ├── Dashboard.tsx
│   │   ├── SendPush.tsx
│   │   ├── SmsClient.tsx
│   │   └── ...
│   ├── services/         # API services
│   │   └── pushbulletService.ts
│   ├── utils/            # Utilities
│   ├── background.ts     # Background script
│   ├── App.tsx          # Main app
│   └── types.ts         # TypeScript types
├── public/              # Static assets
├── dist/                # Built extension
└── tests/               # Test files
```

### Scripts

| Command                 | Description                                           |
| ----------------------- | ----------------------------------------------------- |
| `npm run dev`           | Start development server with hot reload              |
| `npm run build`         | Build production extension                            |
| `npm run zip`           | Create distribution zip file                          |
| `npm run release`       | Create versioned release in `releases/v{version}.zip` |
| `npm test`              | Run test suite                                        |
| `npm run test:coverage` | Run tests with coverage report                        |
| `npm run lint`          | Lint code                                             |

---

## 🧪 Testing

We maintain comprehensive test coverage for all core functionality.

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run specific test file
npm test -- SendPush.test.tsx
```

See [TESTING.md](TESTING.md) for detailed testing guide.

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────┐
│         Firefox Extension               │
├─────────────────────────────────────────┤
│  Background Script (background.ts)      │
│  ├─ WebSocket connection                │
│  ├─ Push notification handler           │
│  └─ SMS notification handler            │
│                                          │
│  Popup UI (React)                       │
│  ├─ Devices Tab                         │
│  ├─ Pushes Tab (Send + History)        │
│  └─ SMS Tab                             │
└─────────────────────────────────────────┘
              ↕ WebSocket + REST
┌─────────────────────────────────────────┐
│      Pushbullet API Servers             │
└─────────────────────────────────────────┘
              ↕
┌─────────────────────────────────────────┐
│      Android Phone (Pushbullet App)     │
└─────────────────────────────────────────┘
```

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes using conventional commits
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Commit Convention

We use [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add new feature
fix: bug fix
docs: documentation changes
style: formatting, missing semicolons, etc.
refactor: code refactoring
test: adding tests
chore: maintenance tasks
```

---

## 🔧 Tech Stack

- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite 5
- **Styling**: Tailwind CSS 4
- **API**: Pushbullet REST API + WebSocket
- **Testing**: Vitest + React Testing Library
- **Linting**: ESLint + Prettier
- **Git Hooks**: Husky + Commitlint

---

## 📋 Requirements

- Firefox 90+
- Pushbullet account (free or pro)
- Android phone with Pushbullet app (for SMS sync)
- Internet connection

---

## 🐛 Troubleshooting

### No notifications appearing?

- Check Firefox notification permissions in System Preferences
- Verify WebSocket shows "Live" in sidebar
- Confirm API key is valid

### SMS not syncing?

- Ensure Pushbullet Android app is running
- Check SMS permissions in Android app
- Verify phone has internet connection

### Can't send pushes?

- Check internet connection
- Verify API key is valid
- Ensure target device is online

See [TROUBLESHOOTING.md](TROUBLESHOOTING.md) for more help.

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- [Pushbullet](https://www.pushbullet.com/) for their excellent API
- [Lucide Icons](https://lucide.dev/) for beautiful icons
- All contributors who help improve this project

---

## 📞 Support

- 🐛 [Report a Bug](../../issues/new?template=bug_report.md)
- 💡 [Request a Feature](../../issues/new?template=feature_request.md)
- 💬 [Discussions](../../discussions)

---

<div align="center">

Made with ❤️ by the community

⭐ Star this repo if you find it helpful!

</div>
