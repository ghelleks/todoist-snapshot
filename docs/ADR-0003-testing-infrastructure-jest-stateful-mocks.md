# ADR-0003: Testing Infrastructure with Jest and Stateful Mocks

## Status
Accepted

## Context
The todoist-snapshot project faced significant testing challenges due to its Google Apps Script runtime environment:

**Core Testing Challenges**:
- **No Local Runtime**: Google Apps Script only runs in Google's cloud environment
- **Limited Testing Tools**: Google Apps Script editor provides minimal debugging capabilities
- **API Dependencies**: Heavy reliance on Google APIs (Docs, Drive, Properties) and external Todoist API
- **Complex State Management**: Document updates, file operations, and configuration changes require stateful testing
- **Integration Testing**: End-to-end workflows span multiple Google services

**Quality Requirements**:
- **High Coverage**: Target 90%+ test coverage for reliability
- **Test-Driven Development**: Write tests before implementation
- **Comprehensive Scenarios**: Unit, integration, and end-to-end testing
- **Realistic Testing**: Tests must accurately simulate production behavior
- **Fast Feedback**: Quick test execution for development workflow

**Technical Constraints**:
- Cannot run Google Apps Script code directly in Node.js
- Must mock all Google Apps Script APIs and services
- Need to simulate complex stateful interactions between services
- Require realistic test data for various scenarios (edge cases, large datasets)

## Decision
Implemented a **comprehensive Jest-based testing infrastructure** with enhanced stateful mocks that accurately simulate the Google Apps Script environment.

### Key Components
1. **Jest Testing Framework**: Modern JavaScript testing with excellent tooling
2. **Stateful Mock System**: Advanced mocks that maintain state across test operations
3. **Comprehensive Test Coverage**: 114+ test cases across 6 categories
4. **Realistic Test Data**: Multiple datasets covering various scenarios
5. **Environment Configuration**: `.env.test` support for test configuration

### Architecture Overview
- **Test Categories**: Unit (114 cases), Integration, End-to-End
- **Mock APIs**: PropertiesService, UrlFetchApp, DocumentApp, DriveApp, Logger
- **Test Data**: Realistic, edge cases, large datasets, minimal, empty, malformed
- **Coverage Reporting**: HTML and LCOV reports with 90%+ target

## Alternatives Considered

### Option 1: Google Apps Script Test Runner
- **Description**: Use Google Apps Script's built-in testing capabilities
- **Pros**: Native environment, no mocking required, direct API access
- **Cons**: Limited testing framework, poor debugging tools, slow execution, no local development
- **Risk Level**: High (limited tooling and slow feedback)

### Option 2: Manual Testing Only
- **Description**: Rely solely on manual testing in Google Apps Script environment
- **Pros**: Simple setup, real environment testing
- **Cons**: No automation, poor coverage tracking, slow feedback, no regression testing
- **Risk Level**: High (quality and maintainability issues)

### Option 3: Lightweight Mock Framework
- **Description**: Simple function mocks without state management
- **Pros**: Easy setup, fast execution, minimal complexity
- **Cons**: Unrealistic testing, limited integration testing, poor simulation of stateful operations
- **Risk Level**: Medium (testing effectiveness limitations)

### Option 4: External Testing Service
- **Description**: Cloud-based testing service with Google Apps Script support
- **Pros**: Managed infrastructure, potentially better tooling
- **Cons**: Additional costs, vendor dependency, limited customization, security concerns
- **Risk Level**: Medium (vendor dependency and cost)

## Consequences

### Positive
- **Comprehensive Coverage**: 114+ test cases covering all major functionality
- **Fast Development Cycle**: Instant local test execution with watch mode
- **Realistic Simulation**: Stateful mocks accurately model Google Apps Script behavior
- **Quality Assurance**: 90%+ test coverage with comprehensive scenario testing
- **Debugging Capabilities**: Full Node.js debugging tools and error reporting
- **Automated Validation**: Continuous integration support with coverage reporting
- **Test-Driven Development**: Write tests before implementation for better design

### Negative
- **Mock Maintenance**: Complex mock system requires ongoing maintenance
- **Environment Differences**: Potential gaps between mocked and real Google Apps Script behavior
- **Setup Complexity**: Sophisticated test infrastructure with learning curve
- **Test Data Management**: Large test datasets require careful maintenance
- **Execution Overhead**: Comprehensive test suite takes time to run completely

### Neutral
- **Development Workflow**: Requires discipline to maintain test-first approach
- **Tool Familiarity**: Team must learn Jest and mock system patterns
- **Coverage Enforcement**: Requires process to maintain 90%+ coverage target

## Implementation Notes

### Test Infrastructure Components

**Jest Configuration** (`jest.config.js`):
- Node.js test environment
- Test file patterns and setup
- Coverage collection and reporting
- 10-second timeout for complex tests

**Mock System** (`tests/mocks/google-apps-script.js`):
- Stateful PropertiesService simulation
- HTTP request mocking for Todoist API
- Document and file operation tracking
- Logger service with test utilities

**Test Data** (`tests/fixtures/test-data.js`):
- Realistic task datasets with metadata
- Edge case scenarios (unicode, special characters)
- Large datasets (100+ tasks) for performance testing
- Malformed data for error handling tests

**Environment Setup** (`tests/setup/test-env.js`):
- Environment variable loading from `.env.test`
- Global test configuration
- Mock initialization

### Test Categories and Coverage

**Unit Tests (114 cases)**:
- Configuration Management (20 tests): Property handling, URL parsing
- API Integration (25 tests): Todoist API calls, error handling
- Data Processing (30 tests): Text formatting, Markdown, project grouping
- Export Formats (25 tests): Google Docs, text, JSON export functionality
- Sync Functions (14 tests): Main sync logic, target configuration

**Integration Tests**:
- End-to-end workflows from API to export
- Error recovery scenarios
- Performance testing with large datasets

### Development Workflow Commands
```bash
npm test                    # Run all tests
npm run test:watch         # Development with auto-reload
npm run test:coverage      # Generate coverage reports
npm run test:unit          # Unit tests only
npm run test:integration   # Integration tests only
```

### Quality Gates
- **Coverage Threshold**: 90% minimum coverage required
- **Test Status**: All tests must pass before deployment
- **Mock Validation**: Regular validation against real Google Apps Script behavior
- **Performance Testing**: Large dataset tests ensure scalability

## References
- [Jest Testing Framework](https://jestjs.io/)
- [Google Apps Script Testing Best Practices](https://developers.google.com/apps-script/guides/support/troubleshooting)
- [Mock Functions Documentation](https://jestjs.io/docs/mock-functions)
- [Test Coverage Analysis](https://jestjs.io/docs/code-coverage)
- [Node.js Testing Best Practices](https://github.com/goldbergyoni/nodebestpractices#-6-testing-and-overall-quality-practices)