# ADR-0005: Mock System Architecture for Google Apps Script APIs

## Status
Accepted

## Context
The comprehensive testing infrastructure for todoist-snapshot required sophisticated mocking of Google Apps Script APIs to enable local Node.js testing. The challenge was creating mocks that accurately simulate the complex, stateful behavior of Google's services.

**Mock Requirements**:
- **Stateful Behavior**: Track changes across multiple API calls (document edits, file updates)
- **Realistic Simulation**: Accurately model Google Apps Script API behavior and responses
- **Test Isolation**: Independent test runs without cross-contamination
- **Error Injection**: Simulate various failure scenarios for error handling tests
- **Performance**: Fast execution for rapid development feedback

**APIs to Mock**:
- **PropertiesService**: Script property storage and retrieval
- **UrlFetchApp**: HTTP requests to external APIs (Todoist)
- **DocumentApp**: Google Docs creation and manipulation
- **DriveApp**: File operations for text and JSON exports
- **Logger**: Logging and debugging output

**Testing Scenarios**:
- **Configuration Management**: Property setting, retrieval, validation
- **API Integration**: HTTP requests, responses, error conditions
- **Document Operations**: Creating, updating, formatting Google Docs
- **File Operations**: Creating, writing, reading text and JSON files
- **State Persistence**: Changes maintained across multiple operations

## Decision
Implemented an **enhanced stateful mock system** that maintains realistic state across API operations and provides comprehensive testing capabilities.

### Mock System Architecture

**Core Components**:
1. **Stateful Storage**: Mock state persists across function calls within tests
2. **Realistic Behavior**: Mocks return data structures matching real Google APIs
3. **Error Injection**: Configurable error simulation for failure testing
4. **State Inspection**: Test utilities to examine mock state and verify operations
5. **Isolation**: Complete state reset between tests

**Mock Categories**:
- **Storage Mocks**: PropertiesService with persistent key-value storage
- **Network Mocks**: UrlFetchApp with configurable HTTP responses
- **Document Mocks**: DocumentApp with stateful document content tracking
- **File System Mocks**: DriveApp with virtual file system simulation
- **Utility Mocks**: Logger with captured output for testing

## Alternatives Considered

### Option 1: Simple Function Mocks
- **Description**: Basic Jest mocks returning static values
- **Pros**: Simple implementation, fast execution, minimal setup
- **Cons**: No state management, unrealistic behavior, limited testing scenarios
- **Risk Level**: High (poor test quality and coverage)

### Option 2: External Mock Library
- **Description**: Use existing Google Apps Script mock library
- **Pros**: Established solution, community support, proven patterns
- **Cons**: Limited availability, may not match specific needs, dependency management
- **Risk Level**: Medium (limited options and customization)

### Option 3: Real API Testing
- **Description**: Test against actual Google Apps Script APIs
- **Pros**: Perfect behavior simulation, no mocking complexity
- **Cons**: Slow execution, requires Google authentication, test isolation issues
- **Risk Level**: High (slow feedback and test reliability)

### Option 4: Hybrid Mock/Real System
- **Description**: Mock some APIs while using real ones for others
- **Pros**: Balance of speed and realism
- **Cons**: Complex setup, authentication requirements, inconsistent test environment
- **Risk Level**: Medium (complexity and reliability issues)

## Consequences

### Positive
- **Realistic Testing**: Stateful mocks accurately simulate Google Apps Script behavior
- **Comprehensive Coverage**: Support for complex testing scenarios including state changes
- **Fast Execution**: Local testing without network dependencies
- **Error Testing**: Configurable error injection for robust error handling tests
- **Test Isolation**: Clean state between tests prevents cross-contamination
- **Development Velocity**: Instant feedback during development
- **Debugging Capability**: Full Node.js debugging tools available

### Negative
- **Implementation Complexity**: Sophisticated mock system requires significant development effort
- **Maintenance Overhead**: Mocks must be updated as Google APIs evolve
- **Behavior Divergence**: Risk of mocks diverging from real API behavior over time
- **Learning Curve**: Developers must understand mock system patterns and capabilities

### Neutral
- **Test Reliability**: Mock quality directly impacts test effectiveness
- **Documentation**: Mock behavior must be well-documented for team understanding
- **Validation**: Regular comparison with real API behavior needed

## Implementation Notes

### Mock System Components

**PropertiesService Mock**:
```javascript
// Stateful property storage
const mockProperties = new Map();

global.PropertiesService = {
  getScriptProperties: () => ({
    getProperty: (key) => mockProperties.get(key) || null,
    setProperty: (key, value) => mockProperties.set(key, value),
    // Additional methods with realistic behavior
  })
};
```

**UrlFetchApp Mock**:
```javascript
// HTTP request simulation with error injection
global.UrlFetchApp = {
  fetch: (url, options) => {
    // Simulate Todoist API responses
    // Support error injection for testing
    // Return realistic response objects
  }
};
```

**DocumentApp Mock**:
```javascript
// Stateful document content tracking
const documentState = new Map();

global.DocumentApp = {
  openById: (id) => ({
    getBody: () => ({
      clear: () => { /* Update state */ },
      appendParagraph: (text) => { /* Track changes */ }
    })
  })
};
```

### State Management Features

**State Persistence**:
- Mock state maintained throughout individual test execution
- Document content, file contents, properties persist across function calls
- Realistic simulation of Google Apps Script stateful operations

**State Inspection**:
```javascript
// Test utilities for state verification
const docState = DocumentApp.getDocumentState(docId);
expect(docState.content).toContain('Expected text');

const fileState = DriveApp.getFileState(fileId);
expect(fileState.content).toEqual(expectedJson);
```

**State Reset**:
```javascript
beforeEach(() => {
  MockUtils.resetAll(); // Clean state for each test
  MockUtils.setupRealisticScenario(); // Common setup
});
```

### Error Injection System

**Configurable Errors**:
```javascript
// Inject specific errors for testing
UrlFetchApp.injectError('apiError', 'Network timeout');
DocumentApp.injectError('permissionError', 'Access denied');

// Test error handling
expect(() => syncTodoist()).toThrow('Network timeout');
```

**Error Scenarios**:
- Network failures for API calls
- Permission errors for document access
- Invalid configuration errors
- Rate limiting simulation

### Test Data Integration

**Realistic Scenarios**:
```javascript
MockUtils.setupRealisticScenario();
// Configures mocks with realistic Todoist data
// Sets up document and file states
// Provides comprehensive test environment
```

**Custom Scenarios**:
```javascript
MockUtils.setupCustomScenario({
  todoistData: testData.large,
  properties: { TODOIST_TOKEN: 'test-token' },
  documents: { 'doc-id': { content: 'Initial content' }}
});
```

### Quality Assurance

**Mock Validation**:
- Regular comparison with real Google Apps Script API behavior
- Test data validation against actual Todoist API responses
- Mock method signatures match official documentation

**Performance Monitoring**:
- Mock operation timing comparable to real APIs
- Memory usage tracking for large test datasets
- Test execution time optimization

**Coverage Tracking**:
- Mock API usage coverage to ensure all paths tested
- State change verification in comprehensive test scenarios

## References
- [Jest Mock Functions](https://jestjs.io/docs/mock-functions)
- [Google Apps Script API Reference](https://developers.google.com/apps-script/reference)
- [Testing Best Practices for Node.js](https://github.com/goldbergyoni/nodebestpractices#-6-testing-and-overall-quality-practices)
- [Mock Object Patterns](https://martinfowler.com/articles/mocksArentStubs.html)
- [State-Based Testing Strategies](https://testing.googleblog.com/2013/07/testing-on-toilet-know-your-test-doubles.html)