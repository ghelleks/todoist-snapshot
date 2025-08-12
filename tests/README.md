# Test Infrastructure

This project uses Jest for testing Google Apps Script functions in a Node.js environment.

## Structure

```
tests/
├── unit/           # Unit tests for individual functions
├── integration/    # Integration tests for complete workflows
├── mocks/          # Mock implementations for GAS APIs
└── README.md       # This file
```

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage report
npm run test:coverage

# Run only unit tests
npm run test:unit

# Run only integration tests
npm run test:integration
```

## Writing Tests

### Unit Tests
Place unit test files in `tests/unit/` with the pattern `*.test.js` or `*.spec.js`.

### Integration Tests
Place integration test files in `tests/integration/` with the pattern `*.test.js` or `*.spec.js`.

### Mocks
Google Apps Script APIs are automatically mocked via `tests/mocks/google-apps-script.js`. The mocks provide realistic behavior for testing without requiring the actual GAS environment.

## Coverage
Test coverage reports are generated in the `coverage/` directory when running `npm run test:coverage`.