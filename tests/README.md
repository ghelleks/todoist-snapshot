# Test Infrastructure

This project uses Jest for testing Google Apps Script functions in a Node.js environment with comprehensive test coverage.

## Structure

```
tests/
├── unit/               # Unit tests for individual functions
│   ├── configuration.test.js     # Configuration management tests
│   ├── api-integration.test.js   # Todoist API integration tests
│   ├── data-processing.test.js   # Data formatting and processing tests
│   ├── export-formats.test.js    # Export functionality tests
│   ├── sync-functions.test.js    # Main sync logic tests
│   └── infrastructure.test.js    # Test infrastructure verification
├── integration/        # Integration tests for complete workflows
│   └── end-to-end.test.js        # Complete workflow tests
├── fixtures/           # Test data and scenarios
│   └── test-data.js              # Comprehensive test datasets
├── mocks/              # Mock implementations for GAS APIs
│   └── google-apps-script.js     # Enhanced stateful mocks
└── README.md           # This file
```

## Test Coverage

### Unit Tests (114 test cases)
- **Configuration Management**: Property handling, URL parsing, validation
- **API Integration**: Todoist API calls, error handling, data fetching
- **Data Processing**: Text formatting, Markdown processing, project grouping
- **Export Formats**: Google Docs, plain text, and JSON export functionality
- **Sync Functions**: Main sync logic, target configuration, optimization

### Integration Tests
- **End-to-End Workflows**: Complete API-to-export workflows
- **Error Recovery**: Comprehensive error handling scenarios
- **Performance**: Large dataset handling and optimization

### Test Data Scenarios
- **Realistic**: Complex tasks with metadata, subtasks, and formatting
- **Edge Cases**: Special characters, malformed data, boundary conditions
- **Large Scale**: Performance testing with 100+ tasks
- **Error Conditions**: API failures, permission errors, malformed responses

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

# Run specific test file
npm test tests/unit/configuration.test.js
```

## Enhanced Mock System

The mock system provides stateful, realistic behavior:

### Key Features
- **Stateful Mocks**: Track API calls, document changes, file content
- **Error Injection**: Simulate API failures, permission errors, timeouts
- **Realistic Responses**: Accurate Todoist API response simulation
- **Configuration Management**: Easy test scenario setup

### Using Mocks in Tests

```javascript
beforeEach(() => {
  // Reset all mock state
  MockUtils.resetAll();
  
  // Setup realistic scenario
  MockUtils.setupRealisticScenario();
  
  // Or setup custom configuration
  PropertiesService.setMockProperties({
    'TODOIST_TOKEN': 'test-token',
    'DOC_ID': 'test-doc-id'
  });
});

// Test with error injection
test('should handle API errors', () => {
  UrlFetchApp.injectError('apiError', 'Network timeout');
  expect(() => getTodoistData()).toThrow('Network timeout');
});
```

### Mock Utilities

```javascript
// State management
MockUtils.resetAll()                    // Reset all mock state
MockUtils.getState()                    // Get current mock state
MockUtils.setupRealisticScenario()     // Load realistic test data
MockUtils.setupErrorScenario()         // Inject specific errors

// Configuration
PropertiesService.setMockProperties(props)  // Set script properties
PropertiesService.clearProperties()         // Clear all properties

// API mocking
UrlFetchApp.setMockData(tasks, projects)    // Set custom API data
UrlFetchApp.injectError(type, value)        // Inject API errors
UrlFetchApp.getCallCount()                  // Get API call count

// Document/File state
DocumentApp.getDocumentState(id)            // Get document content
DriveApp.getFileState(id)                   // Get file content
```

## Test Data

### Available Datasets
- `testData.realistic`: Complex realistic tasks with metadata
- `testData.edgeCases`: Special characters, unicode, edge conditions
- `testData.large`: 100+ tasks for performance testing
- `testData.minimal`: Simple test scenarios
- `testData.empty`: Empty datasets
- `testData.malformed`: Invalid/corrupted data

### Configuration Scenarios
- `configurations.fullConfig`: All targets configured
- `configurations.docOnlyConfig`: Google Docs only
- `configurations.debugConfig`: Debug mode enabled
- `configurations.missingTokenConfig`: Missing API token

## Coverage Goals

- **Overall Coverage**: 90%+ achieved
- **Function Coverage**: 100% (all functions tested)
- **Branch Coverage**: 85%+ (critical paths covered)
- **Integration Coverage**: End-to-end workflows validated

## Coverage Reports

```bash
# Generate coverage report
npm run test:coverage

# View detailed HTML report
open coverage/lcov-report/index.html
```

Coverage reports include:
- Line-by-line coverage visualization
- Branch coverage analysis
- Function coverage summary
- Uncovered code identification

## Best Practices

### Writing Tests
1. Use `MockUtils.resetAll()` in `beforeEach()`
2. Set up realistic test data with provided fixtures
3. Test both success and error scenarios
4. Use descriptive test names and group related tests
5. Verify both behavior and state changes

### Mock Usage
1. Use enhanced mocks instead of manual Jest mocks
2. Inject errors to test error handling
3. Verify API call patterns and parameters
4. Check document/file state after operations

### Test Organization
1. Group related tests in describe blocks
2. Use consistent test naming patterns
3. Test edge cases and boundary conditions
4. Include performance tests for large datasets