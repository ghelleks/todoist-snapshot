# Todoist Snapshot - Claude Development Guide

This is a comprehensive guide for developing the todoist-snapshot project, a Google Apps Script that syncs Todoist tasks to Google Docs, plain text files, and JSON files.

## Project Overview

**Purpose**: Automatically syncs Todoist tasks to various output formats (Google Docs, text files, JSON) with rich metadata and formatting.

**Technology Stack**:
- Google Apps Script (main runtime environment)
- Node.js with Jest (testing environment)
- Todoist REST API (data source)
- Google Docs/Drive API (output targets)

**Key Features**:
- Multi-format export: Google Docs (rich formatting), plain text, JSON (raw data)
- Enhanced metadata: creation dates, comment counts, task statistics
- Sub-task support with hierarchical display
- Markdown formatting support (bold, italic, links)
- Comprehensive test infrastructure with 114+ test cases
- Environment variable-based configuration for testing

## Development Principles

### Test-Driven Development
- **Primary Rule**: Before writing new code, write the test that validates the code's behavior
- **Test Coverage**: 90%+ overall coverage achieved
- **Test Types**: Unit tests (114 cases), integration tests, end-to-end workflows
- **Mock System**: Enhanced stateful mocks that accurately simulate Google Apps Script APIs

### Code Quality Standards
- All functions must have corresponding unit tests
- New features require both positive and negative test cases
- Error handling must be tested comprehensively
- Performance tests for large datasets (100+ tasks)

## Project Structure

```
todoist-snapshot/
├── todoist-snapshot.gs          # Main Google Apps Script file
├── package.json                 # npm configuration and scripts
├── jest.config.js              # Jest testing configuration
├── README.md                   # User-facing documentation
├── CLAUDE.md                   # This development guide
├── tests/                      # Comprehensive test infrastructure
│   ├── unit/                   # Unit tests (6 test files, 114 cases)
│   │   ├── configuration.test.js     # Property management, URL parsing
│   │   ├── api-integration.test.js   # Todoist API integration
│   │   ├── data-processing.test.js   # Text formatting, Markdown
│   │   ├── export-formats.test.js    # Google Docs, text, JSON exports
│   │   ├── sync-functions.test.js    # Main sync logic
│   │   └── infrastructure.test.js    # Test system validation
│   ├── integration/            # Integration and end-to-end tests
│   │   └── end-to-end.test.js        # Complete workflow testing
│   ├── fixtures/               # Test data and scenarios
│   │   └── test-data.js              # Comprehensive test datasets
│   ├── mocks/                  # Enhanced Google Apps Script mocks
│   │   └── google-apps-script.js     # Stateful API mocks
│   ├── setup/                  # Test environment setup
│   │   └── test-env.js               # Environment variable loading
│   └── README.md               # Test infrastructure documentation
└── coverage/                   # Test coverage reports (generated)
```

## Recent Major Changes

### Enhanced Metadata Export
- **Added comprehensive task metadata**: Creation dates, comment counts, task statistics
- **Enhanced export headers**: Task/project counts, export timestamp, timezone info
- **Improved data structure**: More detailed project and task information

### Fixed Labels Bug
- **Issue**: Labels were not appearing in Google Doc exports
- **Solution**: Fixed label processing and display logic
- **Impact**: All export formats now properly show task labels

### Comprehensive Test Infrastructure
- **Jest Framework**: Complete testing setup with 114+ test cases
- **Enhanced Mocks**: Stateful Google Apps Script API mocks with realistic behavior
- **Test Data**: Multiple datasets including realistic, edge case, and large-scale scenarios
- **Environment Configuration**: .env.test file support for test configuration

### NPM-Based Development Workflow
- **Package Management**: Full npm setup with development dependencies
- **Test Scripts**: Multiple test commands (watch, coverage, unit, integration)
- **Coverage Reporting**: HTML and LCOV coverage reports
- **Development Tools**: TypeScript types for Jest, dotenv for environment management

## Testing Infrastructure

### Test Categories

**Unit Tests (114 test cases)**:
- Configuration Management (20 tests): Property handling, URL parsing, validation
- API Integration (25 tests): Todoist API calls, error handling, rate limiting
- Data Processing (30 tests): Text formatting, Markdown processing, project grouping
- Export Formats (25 tests): Google Docs, plain text, and JSON export functionality
- Sync Functions (14 tests): Main sync logic, target configuration, optimization

**Integration Tests**:
- End-to-End Workflows: Complete API-to-export workflows
- Error Recovery: Comprehensive error handling scenarios
- Performance: Large dataset handling and optimization

### Mock System Features

**Stateful Behavior**:
- Track API calls, document changes, file content
- Realistic Todoist API response simulation
- Error injection for testing failure scenarios
- Configuration management for different test scenarios

**Key Mock APIs**:
- `PropertiesService`: Script property management
- `UrlFetchApp`: HTTP requests to Todoist API
- `DocumentApp`: Google Docs manipulation
- `DriveApp`: File operations for text/JSON export
- `Logger`: Enhanced logging with test utilities

### Test Data Scenarios

**Available Datasets**:
- `testData.realistic`: Complex tasks with metadata, subtasks, formatting
- `testData.edgeCases`: Special characters, unicode, boundary conditions
- `testData.large`: 100+ tasks for performance testing
- `testData.minimal`: Simple test scenarios
- `testData.empty`: Empty datasets for edge case testing
- `testData.malformed`: Invalid/corrupted data handling

## Available Commands

### NPM Scripts
```bash
# Run all tests
npm test

# Run tests in watch mode (development)
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

### Coverage Analysis
```bash
# Generate detailed HTML coverage report
npm run test:coverage

# View coverage report in browser
open coverage/lcov-report/index.html
```

## Development Workflow

### Adding New Features

1. **Write Tests First**:
   ```bash
   # Create test file in appropriate directory
   touch tests/unit/new-feature.test.js
   
   # Write failing tests for the new functionality
   # Run tests to confirm they fail
   npm test tests/unit/new-feature.test.js
   ```

2. **Implement Feature**:
   - Add code to `todoist-snapshot.gs`
   - Follow existing patterns and conventions
   - Ensure proper error handling

3. **Validate Implementation**:
   ```bash
   # Run tests to ensure they pass
   npm test
   
   # Check coverage
   npm run test:coverage
   
   # Run integration tests
   npm run test:integration
   ```

### Testing Best Practices

**Setup**:
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
```

**Error Testing**:
```javascript
// Test API failure scenarios
test('should handle API errors gracefully', () => {
  UrlFetchApp.injectError('apiError', 'Network timeout');
  expect(() => getTodoistData()).toThrow('Network timeout');
});
```

**State Verification**:
```javascript
// Verify document updates
test('should update document content', () => {
  syncTodoistToDoc();
  const docState = DocumentApp.getDocumentState('test-doc-id');
  expect(docState.content).toContain('Inbox');
});
```

## Configuration Management

### Google Apps Script Properties
The main script uses `PropertiesService` for configuration:

- `TODOIST_TOKEN`: Required Todoist API token
- `DOC_ID`: Optional Google Doc URL/ID for formatted export
- `TEXT_FILE_ID`: Optional text file URL/ID for plain text export
- `JSON_FILE_ID`: Optional JSON file URL/ID for raw data export
- `TIMEZONE`: Optional timezone (default: America/Chicago)
- `DEBUG`: Optional debug flag (set to "true" to enable debug logging)

### Test Environment Configuration
Tests can use `.env.test` file (not committed) for environment variables:

```bash
# .env.test (create locally, do not commit)
TODOIST_TOKEN=test-token-value
DOC_ID=test-doc-id
TEXT_FILE_ID=test-file-id
JSON_FILE_ID=test-json-id
TIMEZONE=America/Chicago
DEBUG=true
```

## Architecture and Design Patterns

### Main Functions
- `syncTodoist()`: Unified entry point, detects configured targets
- `syncTodoistToDoc()`: Google Docs export with rich formatting
- `syncTodoistToTextFile()`: Plain text export to Drive file
- `syncTodoistToJsonFile()`: Raw JSON data export
- `getTodoistData()`: Todoist API integration
- `formatTasksForDoc()`: Rich text formatting for Google Docs
- `formatTasksForText()`: Plain text formatting
- `buildTaskList()`: Core task processing and organization

### Data Flow
1. **Configuration Loading**: Read properties from PropertiesService
2. **API Integration**: Fetch tasks and projects from Todoist
3. **Data Processing**: Format tasks, group by projects, process metadata
4. **Export Generation**: Create appropriate output format
5. **Target Updates**: Write to configured Google Docs/files

### Error Handling
- Comprehensive error checking for missing configuration
- API error handling with meaningful error messages
- Graceful degradation for optional features
- Debug logging for troubleshooting

## Security Considerations

- API tokens stored securely in PropertiesService (encrypted)
- No hardcoded credentials in source code
- Environment variables for testing (not committed)
- Proper error messages without exposing sensitive data

## Performance Optimizations

- Single API call for multiple export targets
- Efficient data processing for large task lists
- Stateful mocks for faster test execution
- Comprehensive caching in test environment

## Contributing Guidelines

### Code Standards
- Follow existing code patterns and naming conventions
- Add comprehensive tests for all new functionality
- Update documentation for user-facing changes
- Ensure error handling and edge case coverage

### Test Requirements
- Minimum 90% test coverage for new code
- Both positive and negative test cases
- Performance tests for operations handling large datasets
- Integration tests for complete workflows

### Pull Request Process
1. Ensure all tests pass: `npm test`
2. Verify coverage meets standards: `npm run test:coverage`
3. Update relevant documentation
4. Test with realistic data scenarios

This development guide ensures consistent, high-quality development practices for the todoist-snapshot project.