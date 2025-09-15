/**
 * Main Sync Function Tests
 * Tests for the main sync logic, target configuration, and error handling
 */

// Import mocks
require('../mocks/google-apps-script');

// Import the source functions
const fs = require('fs');
const path = require('path');

// Load and evaluate the Google Apps Script file
const gasCode = fs.readFileSync(path.join(__dirname, '../../todoist-snapshot.gs'), 'utf8');
eval(gasCode);

describe('Main Sync Functions', () => {
  beforeEach(() => {
    // Reset all mocks before each test
    MockUtils.resetAll();
    
    // Setup default successful responses
    UrlFetchApp.fetch
      .mockReturnValueOnce({
        getContentText: () => JSON.stringify([]),
        getResponseCode: () => 200
      })
      .mockReturnValueOnce({
        getContentText: () => JSON.stringify([]),
        getResponseCode: () => 200
      });

    // Setup default document and file mocks
    DocumentApp.openById.mockReturnValue({
      getBody: () => ({
        setText: jest.fn(),
        appendParagraph: jest.fn(() => ({
          setHeading: jest.fn(),
          setItalic: jest.fn()
        })),
        appendListItem: jest.fn(() => ({
          appendText: jest.fn(),
          getText: jest.fn(() => ''),
          editAsText: jest.fn(() => ({
            getText: jest.fn(() => ''),
            setBold: jest.fn(),
            setItalic: jest.fn(),
            setLinkUrl: jest.fn(),
            deleteText: jest.fn(),
            insertText: jest.fn()
          })),
          setIndentStart: jest.fn()
        }))
      })
    });

    DriveApp.getFileById.mockReturnValue({
      setContent: jest.fn()
    });
  });

  describe('syncTodoist() - Main Entry Point', () => {
    test('should throw error when no output targets configured', () => {
      PropertiesService.setMockProperties({});

      expect(() => syncTodoist()).toThrow('No output targets configured');
    });

    test('should sync to Doc only when only DOC_ID configured', () => {
      PropertiesService.setMockProperties({
        'DOC_ID': 'doc123',
        'TODOIST_TOKEN': 'token123'
      });

      // Clear logs before test
      Logger.log.mockClear();

      syncTodoist();

      // Verify that syncTodoistToDoc was called by checking for the log message it produces
      expect(Logger.log).toHaveBeenCalledWith('✅ Successfully synced tasks to Google Doc');
      expect(Logger.log).toHaveBeenCalledWith('✅ Todoist sync completed successfully');
      
      // Verify that the other sync functions were NOT called
      expect(Logger.log).not.toHaveBeenCalledWith('✅ Successfully synced tasks to text file');
      expect(Logger.log).not.toHaveBeenCalledWith('✅ Successfully synced tasks to JSON file');
    });

    test('should sync to text file only when only TEXT_FILE_ID configured', () => {
      PropertiesService.setMockProperties({
        'TEXT_FILE_ID': 'file123',
        'TODOIST_TOKEN': 'token123'
      });

      // Clear logs before test
      Logger.log.mockClear();

      syncTodoist();

      // Verify that syncTodoistToTextFile was called by checking for the log message it produces
      expect(Logger.log).toHaveBeenCalledWith('✅ Successfully synced tasks to text file');
      expect(Logger.log).toHaveBeenCalledWith('✅ Todoist sync completed successfully');
      
      // Verify that the other sync functions were NOT called
      expect(Logger.log).not.toHaveBeenCalledWith('✅ Successfully synced tasks to Google Doc');
      expect(Logger.log).not.toHaveBeenCalledWith('✅ Successfully synced tasks to JSON file');
    });

    test('should sync to JSON file only when only JSON_FILE_ID configured', () => {
      PropertiesService.setMockProperties({
        'JSON_FILE_ID': 'json123',
        'TODOIST_TOKEN': 'token123'
      });

      // Clear logs before test
      Logger.log.mockClear();

      syncTodoist();

      // Verify that syncTodoistToJsonFile was called by checking for the log message it produces
      expect(Logger.log).toHaveBeenCalledWith('✅ Successfully synced tasks to JSON file');
      expect(Logger.log).toHaveBeenCalledWith('✅ Todoist sync completed successfully');
      
      // Verify that the other sync functions were NOT called
      expect(Logger.log).not.toHaveBeenCalledWith('✅ Successfully synced tasks to Google Doc');
      expect(Logger.log).not.toHaveBeenCalledWith('✅ Successfully synced tasks to text file');
    });

    test('should fetch data once and update all targets when multiple configured', () => {
      PropertiesService.setMockProperties({
        'DOC_ID': 'doc123',
        'TEXT_FILE_ID': 'file123', 
        'JSON_FILE_ID': 'json123',
        'TODOIST_TOKEN': 'token123'
      });

      // Clear logs before test
      Logger.log.mockClear();

      syncTodoist();

      // Verify that all three sync functions were called by checking for their log messages
      expect(Logger.log).toHaveBeenCalledWith('✅ Successfully synced tasks to Google Doc');
      expect(Logger.log).toHaveBeenCalledWith('✅ Successfully synced tasks to text file');
      expect(Logger.log).toHaveBeenCalledWith('✅ Successfully synced tasks to JSON file');
      expect(Logger.log).toHaveBeenCalledWith('✅ Todoist sync completed successfully');
    });

    test('should log debug information when DEBUG enabled', () => {
      PropertiesService.setMockProperties({
        'DOC_ID': 'doc123',
        'TEXT_FILE_ID': 'file123',
        'DEBUG': 'true',
        'TODOIST_TOKEN': 'token123'
      });

      // Clear logs before test
      Logger.log.mockClear();

      syncTodoist();

      expect(Logger.log).toHaveBeenCalledWith(expect.stringContaining('Targets:'));
    });

    test('should log start and completion messages', () => {
      PropertiesService.getScriptProperties().getProperty.mockImplementation((key) => {
        switch (key) {
          case 'DOC_ID': return 'doc123';
          case 'TODOIST_TOKEN': return 'token123';
          default: return null;
        }
      });

      const originalSyncToDoc = global.syncTodoistToDoc;
      global.syncTodoistToDoc = jest.fn();

      syncTodoist();

      expect(Logger.log).toHaveBeenCalledWith('🚀 Starting Todoist sync...');
      expect(Logger.log).toHaveBeenCalledWith('✅ Todoist sync completed successfully');

      global.syncTodoistToDoc = originalSyncToDoc;
    });
  });

  describe('syncTodoistToDoc() - Google Docs Sync', () => {
    beforeEach(() => {
      PropertiesService.getScriptProperties().getProperty.mockImplementation((key) => {
        switch (key) {
          case 'DOC_ID': return 'doc123';
          case 'TODOIST_TOKEN': return 'token123';
          default: return null;
        }
      });
    });

    test('should sync successfully with fetched data', () => {
      syncTodoistToDoc();

      expect(DocumentApp.openById).toHaveBeenCalledWith('doc123');
      expect(Logger.log).toHaveBeenCalledWith('✅ Successfully synced tasks to Google Doc');
    });

    test('should use pre-fetched data when provided', () => {
      const preFetchedData = {
        tasks: [{ id: '123', content: 'Test task', labels: [], subtasks: [] }],
        projects: [{ id: '456', name: 'Test Project' }]
      };

      syncTodoistToDoc(preFetchedData);

      expect(DocumentApp.openById).toHaveBeenCalledWith('doc123');
      expect(Logger.log).toHaveBeenCalledWith('✅ Successfully synced tasks to Google Doc');
    });

    test('should handle and log errors', () => {
      DocumentApp.openById.mockImplementation(() => {
        throw new Error('Document access denied');
      });

      syncTodoistToDoc();

      expect(Logger.log).toHaveBeenCalledWith(
        expect.stringMatching(/❌ Failed to sync tasks to Google Doc.*Document access denied/)
      );
    });

    test('should log stack trace when DEBUG enabled', () => {
      PropertiesService.getScriptProperties().getProperty.mockImplementation((key) => {
        switch (key) {
          case 'DOC_ID': return 'doc123';
          case 'TODOIST_TOKEN': return 'token123';
          case 'DEBUG': return 'true';
          default: return null;
        }
      });

      const testError = new Error('Test error');
      testError.stack = 'Test stack trace';
      
      DocumentApp.openById.mockImplementation(() => {
        throw testError;
      });

      syncTodoistToDoc();

      expect(Logger.log).toHaveBeenCalledWith('Test stack trace');
    });
  });

  describe('syncTodoistToTextFile() - Text File Sync', () => {
    beforeEach(() => {
      PropertiesService.getScriptProperties().getProperty.mockImplementation((key) => {
        switch (key) {
          case 'TEXT_FILE_ID': return 'file123';
          case 'TODOIST_TOKEN': return 'token123';
          default: return null;
        }
      });
    });

    test('should sync successfully with fetched data', () => {
      syncTodoistToTextFile();

      expect(DriveApp.getFileById).toHaveBeenCalledWith('file123');
      expect(Logger.log).toHaveBeenCalledWith('✅ Successfully synced tasks to text file');
    });

    test('should use pre-fetched data when provided', () => {
      const preFetchedData = {
        tasks: [{ id: '123', content: 'Test task', labels: [], subtasks: [] }],
        projects: [{ id: '456', name: 'Test Project' }]
      };

      syncTodoistToTextFile(preFetchedData);

      expect(DriveApp.getFileById).toHaveBeenCalledWith('file123');
      expect(Logger.log).toHaveBeenCalledWith('✅ Successfully synced tasks to text file');
    });

    test('should handle and log errors', () => {
      DriveApp.getFileById.mockImplementation(() => {
        throw new Error('File not found');
      });

      syncTodoistToTextFile();

      expect(Logger.log).toHaveBeenCalledWith(
        expect.stringMatching(/❌ Failed to sync tasks to text file.*File not found/)
      );
    });

    test('should log stack trace when DEBUG enabled', () => {
      PropertiesService.getScriptProperties().getProperty.mockImplementation((key) => {
        switch (key) {
          case 'TEXT_FILE_ID': return 'file123';
          case 'TODOIST_TOKEN': return 'token123';
          case 'DEBUG': return 'true';
          default: return null;
        }
      });

      const testError = new Error('Test error');
      testError.stack = 'Test stack trace';
      
      DriveApp.getFileById.mockImplementation(() => {
        throw testError;
      });

      syncTodoistToTextFile();

      expect(Logger.log).toHaveBeenCalledWith('Test stack trace');
    });
  });

  describe('syncTodoistToJsonFile() - JSON File Sync', () => {
    beforeEach(() => {
      PropertiesService.getScriptProperties().getProperty.mockImplementation((key) => {
        switch (key) {
          case 'JSON_FILE_ID': return 'json123';
          case 'TODOIST_TOKEN': return 'token123';
          default: return null;
        }
      });
    });

    test('should sync successfully with fetched data', () => {
      syncTodoistToJsonFile();

      expect(DriveApp.getFileById).toHaveBeenCalledWith('json123');
      expect(Logger.log).toHaveBeenCalledWith('✅ Successfully synced tasks to JSON file');
    });

    test('should use pre-fetched data when provided', () => {
      const preFetchedData = {
        rawTasks: [{ id: '123', content: 'Test task' }],
        projects: [{ id: '456', name: 'Test Project' }]
      };

      syncTodoistToJsonFile(preFetchedData);

      expect(DriveApp.getFileById).toHaveBeenCalledWith('json123');
      expect(Logger.log).toHaveBeenCalledWith('✅ Successfully synced tasks to JSON file');
    });

    test('should handle and log errors', () => {
      DriveApp.getFileById.mockImplementation(() => {
        throw new Error('Permission denied');
      });

      syncTodoistToJsonFile();

      expect(Logger.log).toHaveBeenCalledWith(
        expect.stringMatching(/❌ Failed to sync tasks to JSON file.*Permission denied/)
      );
    });

    test('should use rawTasks for JSON export', () => {
      const preFetchedData = {
        tasks: [{ id: '123', content: 'Processed task', subtasks: [] }],
        rawTasks: [{ id: '123', content: 'Raw task' }],
        projects: []
      };

      const mockFile = { setContent: jest.fn() };
      DriveApp.getFileById.mockReturnValue(mockFile);

      syncTodoistToJsonFile(preFetchedData);

      const jsonCall = mockFile.setContent.mock.calls[0][0];
      const parsedJson = JSON.parse(jsonCall);
      
      expect(parsedJson.data.tasks).toEqual(preFetchedData.rawTasks);
    });
  });

  describe('Error Propagation and Handling', () => {
    test('should not catch errors in syncTodoist when single target fails', () => {
      PropertiesService.getScriptProperties().getProperty.mockImplementation((key) => {
        switch (key) {
          case 'DOC_ID': return 'doc123';
          case 'TODOIST_TOKEN': return 'token123';
          default: return null;
        }
      });

      DocumentApp.openById.mockImplementation(() => {
        throw new Error('Critical failure');
      });

      // syncTodoist should not catch the error, it should propagate
      expect(() => syncTodoist()).toThrow('Critical failure');
    });

    test('should handle API errors in individual sync functions', () => {
      PropertiesService.getScriptProperties().getProperty.mockImplementation((key) => {
        switch (key) {
          case 'DOC_ID': return 'doc123';
          case 'TODOIST_TOKEN': return null; // This will cause getTodoistToken to throw
          default: return null;
        }
      });

      syncTodoistToDoc();

      expect(Logger.log).toHaveBeenCalledWith(
        expect.stringMatching(/❌ Failed to sync tasks to Google Doc/)
      );
    });

    test('should handle malformed pre-fetched data', () => {
      const malformedData = {
        tasks: null,
        projects: undefined
      };

      expect(() => syncTodoistToDoc(malformedData)).not.toThrow();
      expect(() => syncTodoistToTextFile(malformedData)).not.toThrow();
      expect(() => syncTodoistToJsonFile(malformedData)).not.toThrow();
    });
  });

  describe('Data Flow Optimization', () => {
    test('should call getTodoistData only once for multiple targets', () => {
      PropertiesService.getScriptProperties().getProperty.mockImplementation((key) => {
        switch (key) {
          case 'DOC_ID': return 'doc123';
          case 'TEXT_FILE_ID': return 'file123';
          case 'TODOIST_TOKEN': return 'token123';
          default: return null;
        }
      });

      // Mock getTodoistData to track calls
      const originalGetTodoistData = global.getTodoistData;
      global.getTodoistData = jest.fn(() => ({
        tasks: [],
        rawTasks: [],
        projects: []
      }));

      // Mock individual sync functions to prevent actual API calls
      const originalSyncToDoc = global.syncTodoistToDoc;
      const originalSyncToTextFile = global.syncTodoistToTextFile;
      global.syncTodoistToDoc = jest.fn();
      global.syncTodoistToTextFile = jest.fn();

      syncTodoist();

      expect(global.getTodoistData).toHaveBeenCalledTimes(1);

      // Restore original functions
      global.getTodoistData = originalGetTodoistData;
      global.syncTodoistToDoc = originalSyncToDoc;
      global.syncTodoistToTextFile = originalSyncToTextFile;
    });

    test('should pass same data object to all sync functions', () => {
      PropertiesService.getScriptProperties().getProperty.mockImplementation((key) => {
        switch (key) {
          case 'DOC_ID': return 'doc123';
          case 'TEXT_FILE_ID': return 'file123';
          case 'JSON_FILE_ID': return 'json123';
          case 'TODOIST_TOKEN': return 'token123';
          default: return null;
        }
      });

      const mockData = {
        tasks: [{ id: '123', content: 'Test' }],
        rawTasks: [{ id: '123', content: 'Test' }],
        projects: []
      };

      const originalGetTodoistData = global.getTodoistData;
      global.getTodoistData = jest.fn(() => mockData);

      const originalSyncToDoc = global.syncTodoistToDoc;
      const originalSyncToTextFile = global.syncTodoistToTextFile;
      const originalSyncToJsonFile = global.syncTodoistToJsonFile;
      
      global.syncTodoistToDoc = jest.fn();
      global.syncTodoistToTextFile = jest.fn();
      global.syncTodoistToJsonFile = jest.fn();

      syncTodoist();

      expect(global.syncTodoistToDoc).toHaveBeenCalledWith(mockData);
      expect(global.syncTodoistToTextFile).toHaveBeenCalledWith(mockData);
      expect(global.syncTodoistToJsonFile).toHaveBeenCalledWith(mockData);

      // Restore original functions
      global.getTodoistData = originalGetTodoistData;
      global.syncTodoistToDoc = originalSyncToDoc;
      global.syncTodoistToTextFile = originalSyncToTextFile;
      global.syncTodoistToJsonFile = originalSyncToJsonFile;
    });
  });
});