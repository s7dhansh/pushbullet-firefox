# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Comprehensive test suite with >80% coverage
- GitHub Actions CI/CD pipeline
- Automated releases on push to main
- Commit linting with Husky
- ESLint and Prettier configuration
- Contributing guidelines

## [1.0.2] - 2024-11-21

### Added

- Simplified push interface with single textbox
- Auto-detection for URLs vs text messages
- Integrated push history in Pushes tab
- Enhanced SMS notification handling

### Changed

- Consolidated "History" and "Send Push" into single "Pushes" tab
- Improved UI/UX with cleaner interface
- Better error handling and user feedback

### Fixed

- SMS notifications now properly appear on Mac
- WebSocket connection stability improvements

## [1.0.1] - 2024-11-20

### Added

- SMS sync functionality
- Send push to phone feature
- Device management
- Real-time WebSocket connection

### Fixed

- Initial bug fixes and improvements

## [1.0.0] - 2024-11-19

### Added

- Initial release
- Basic Pushbullet integration
- Firefox extension structure
- React + TypeScript setup

[Unreleased]: https://github.com/yourusername/pushbullet-firefox/compare/v1.0.2...HEAD
[1.0.2]: https://github.com/yourusername/pushbullet-firefox/compare/v1.0.1...v1.0.2
[1.0.1]: https://github.com/yourusername/pushbullet-firefox/compare/v1.0.0...v1.0.1
[1.0.0]: https://github.com/yourusername/pushbullet-firefox/releases/tag/v1.0.0
