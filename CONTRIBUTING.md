# Contributing to R3SN

Thank you for your interest in contributing to R3SN!

## Development Setup

### Prerequisites
- Node.js 18+
- Android Studio
- PostgreSQL 14+
- Redis 6+

### Installation

```bash
# Clone repository
git clone https://github.com/Nisu7648/R3SN.git
cd R3SN

# Install dependencies
npm install

# Setup environment
cp .env.example .env
# Edit .env with your configuration

# Setup database
createdb r3sn
npm run db:migrate

# Start development server
npm run dev
```

### Android Development

```bash
# Open Android Studio
# Import android/ folder

# Build APK
cd android
./gradlew assembleDebug

# Install on device
adb install app/build/outputs/apk/debug/app-debug.apk
```

## Project Structure

```
R3SN/
├── backend/
│   ├── core/              # Core engine components
│   ├── routes/            # API routes
│   └── server.js          # Main server
├── android/
│   └── app/
│       └── src/
│           └── main/
│               ├── java/  # Android services
│               └── res/   # Resources
├── docs/                  # Documentation
└── tests/                 # Test files
```

## Adding New Integrations

### API-based Integration

1. Create integration file in `backend/integrations/`
2. Implement connection logic
3. Define available actions
4. Add tests
5. Register in IntegrationHub

Example:
```javascript
class NewAppIntegration {
  async connect(credentials) {
    // Connection logic
  }
  
  async executeAction(action, params) {
    // Action execution
  }
}
```

### Plugin-based Integration

1. Use PluginFactory to generate base plugin
2. Customize generated code if needed
3. Test with target app
4. Document capabilities

## Creating Agents

1. Define agent type and capabilities
2. Implement agent logic
3. Register with AgentEngine
4. Add tests

Example:
```javascript
const agent = {
  type: 'data_processor',
  capabilities: ['transform', 'validate', 'enrich'],
  execute: async (input, context) => {
    // Agent logic
  }
};
```

## Testing

```bash
# Run all tests
npm test

# Run specific test
npm test -- agents.test.js

# Run with coverage
npm run test:coverage
```

## Code Style

- Use ESLint configuration
- Follow Airbnb style guide
- Write meaningful commit messages
- Add JSDoc comments

## Pull Request Process

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

### PR Guidelines

- Clear description of changes
- Link related issues
- Add tests for new features
- Update documentation
- Ensure CI passes

## Bug Reports

Use GitHub Issues with:
- Clear title
- Steps to reproduce
- Expected vs actual behavior
- Environment details
- Screenshots if applicable

## Feature Requests

- Describe the feature
- Explain use case
- Provide examples
- Discuss implementation approach

## Community

- Be respectful
- Help others
- Share knowledge
- Collaborate openly

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
