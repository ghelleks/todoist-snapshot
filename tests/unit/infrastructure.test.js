/**
 * Infrastructure Test
 * Quick test to verify the test infrastructure is working correctly
 */

// Import mocks
require('../mocks/google-apps-script');

// Import the source functions
const fs = require('fs');
const path = require('path');

// Load and evaluate the Google Apps Script file
const gasCode = fs.readFileSync(path.join(__dirname, '../../todoist-snapshot.gs'), 'utf8');
eval(gasCode);

describe('Test Infrastructure', () => {
  beforeEach(() => {
    MockUtils.resetAll();
  });

  test('should have working enhanced mocks', () => {
    // Test PropertiesService mock
    PropertiesService.setMockProperties({
      'TEST_KEY': 'test-value'
    });
    
    const value = PropertiesService.getScriptProperties().getProperty('TEST_KEY');
    expect(value).toBe('test-value');
  });

  test('should have working Logger mock', () => {
    Logger.log('Test message');
    
    expect(Logger.getLastLog()).toBe('Test message');
    expect(Logger.getAllLogs()).toContain('Test message');
  });

  test('should have working UrlFetchApp mock', () => {
    PropertiesService.setMockProperties({
      'TODOIST_TOKEN': 'test-token'
    });

    const result = getTodoistData();
    
    expect(result).toHaveProperty('tasks');
    expect(result).toHaveProperty('projects');
    expect(UrlFetchApp.getCallCount()).toBeGreaterThan(0);
  });

  test('should handle basic export function', () => {
    PropertiesService.setMockProperties({
      'JSON_FILE_ID': 'test-file-id',
      'TODOIST_TOKEN': 'test-token'
    });

    expect(() => syncTodoistToJsonFile()).not.toThrow();
    
    const fileState = DriveApp.getFileState('test-file-id');
    expect(fileState).toBeTruthy();
    expect(fileState.content).toBeTruthy();
  });
});