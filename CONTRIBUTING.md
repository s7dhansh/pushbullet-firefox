# Contributing to BulletBase

Thank you for your interest in contributing! This document provides guidelines and instructions for contributing.

## 🚀 Getting Started

### Prerequisites

- Node.js 18 or higher
- npm or pnpm
- Firefox browser
- Git

### Setup Development Environment

1. Fork the repository
2. Clone your fork:

   ```bash
   git clone https://github.com/YOUR_USERNAME/pushbullet-firefox.git
   cd pushbullet-firefox
   ```

3. Install dependencies:

   ```bash
   npm install
   ```

4. Set up git hooks:

   ```bash
   npm run prepare
   ```

5. Start development:
   ```bash
   npm run dev
   ```

## 📝 Commit Convention

We use [Conventional Commits](https://www.conventionalcommits.org/) for clear and structured commit messages.

### Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `test`: Adding or updating tests
- `build`: Build system changes
- `ci`: CI/CD changes
- `chore`: Other changes (dependencies, etc.)

### Examples

```bash
feat(sms): add SMS notification sound
fix(push): resolve URL detection issue
docs(readme): update installation instructions
test(service): add tests for push service
```

### Commit Message Rules

- Use present tense ("add feature" not "added feature")
- Use imperative mood ("move cursor to..." not "moves cursor to...")
- First line should be 100 characters or less
- Reference issues and pull requests when relevant

## 🧪 Testing

### Run Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run tests with UI
npm run test:ui
```

### Writing Tests

- Place test files in `tests/` directory
- Name test files as `*.test.ts` or `*.test.tsx`
- Aim for high test coverage (>80%)
- Test both happy paths and error cases

### Test Structure

```typescript
describe('Component/Function Name', () => {
  beforeEach(() => {
    // Setup
  });

  it('should do something', () => {
    // Test implementation
  });
});
```

## 🎨 Code Style

### Linting

```bash
# Check for linting errors
npm run lint

# Auto-fix linting errors
npm run lint:fix
```

### Formatting

```bash
# Check formatting
npm run format:check

# Auto-format code
npm run format
```

### Style Guidelines

- Use TypeScript for type safety
- Follow existing code patterns
- Use meaningful variable and function names
- Add comments for complex logic
- Keep functions small and focused

## 🔄 Pull Request Process

### Before Submitting

1. Ensure all tests pass: `npm test`
2. Check code style: `npm run lint`
3. Update documentation if needed
4. Add tests for new features
5. Update CHANGELOG if applicable

### PR Guidelines

1. Create a feature branch from `main`:

   ```bash
   git checkout -b feature/your-feature-name
   ```

2. Make your changes with clear commits

3. Push to your fork:

   ```bash
   git push origin feature/your-feature-name
   ```

4. Open a Pull Request with:
   - Clear title following commit convention
   - Description of changes
   - Screenshots (if UI changes)
   - Related issue numbers

### PR Template

```markdown
## Description

Brief description of changes

## Type of Change

- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing

- [ ] Tests pass locally
- [ ] Added new tests
- [ ] Manual testing completed

## Screenshots (if applicable)

Add screenshots here

## Related Issues

Closes #123
```

## 🐛 Reporting Bugs

Use the [Bug Report template](.github/ISSUE_TEMPLATE/bug_report.md) and include:

- Clear description
- Steps to reproduce
- Expected vs actual behavior
- Environment details
- Console errors (if any)

## 💡 Suggesting Features

Use the [Feature Request template](.github/ISSUE_TEMPLATE/feature_request.md) and include:

- Clear description
- Use case
- Proposed solution
- Alternatives considered

## 📚 Documentation

- Update README.md for user-facing changes
- Update code comments for complex logic
- Add JSDoc comments for public APIs
- Update TESTING.md for test-related changes

## 🏗️ Project Structure

```
pushbullet-firefox/
├── .github/          # GitHub workflows and templates
├── src/
│   ├── components/   # React components
│   ├── services/     # API services
│   ├── utils/        # Utility functions
│   ├── background.ts # Background script
│   └── types.ts      # TypeScript types
├── tests/            # Test files
├── public/           # Static assets
└── dist/             # Build output
```

## 🤝 Code Review

All submissions require review. We aim to:

- Provide constructive feedback
- Respond within 48 hours
- Merge approved PRs quickly

## 📄 License

By contributing, you agree that your contributions will be licensed under the MIT License.

## ❓ Questions?

- Open a [Discussion](../../discussions)
- Check existing [Issues](../../issues)
- Read the [README](README.md)

## 🙏 Thank You!

Your contributions make this project better for everyone!
