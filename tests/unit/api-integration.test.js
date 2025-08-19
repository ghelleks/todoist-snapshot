/**
 * API Integration Tests
 * Tests for Todoist API interactions, error handling, and data fetching
 */

// Import mocks
require('../mocks/google-apps-script');

// Import the source functions
const fs = require('fs');
const path = require('path');

// Load and evaluate the Google Apps Script file
const gasCode = fs.readFileSync(path.join(__dirname, '../../todoist-snapshot.gs'), 'utf8');
eval(gasCode);

describe('API Integration', () => {
  beforeEach(() => {
    // Reset all mocks before each test
    MockUtils.resetAll();
    
    // Setup default successful token retrieval
    PropertiesService.setMockProperties({
      'TODOIST_TOKEN': 'mock-token-12345'
    });
  });

  describe('getTodoistData()', () => {
    test('should fetch tasks and projects successfully', () => {
      const mockTasks = [
        {
          id: '123',
          content: 'Test task',
          description: 'Test description',
          due: { date: '2024-01-15' },
          priority: 1,
          labels: ['test'],
          project_id: '456',
          created_at: '2024-01-01T10:00:00Z',
          comment_count: 2
        }
      ];
      
      const mockProjects = [
        { id: '456', name: 'Test Project' }
      ];

      // Mock API responses
      UrlFetchApp.fetch
        .mockReturnValueOnce({
          getContentText: () => JSON.stringify(mockTasks)
        })
        .mockReturnValueOnce({
          getContentText: () => JSON.stringify([]) // subtasks response
        })
        .mockReturnValueOnce({
          getContentText: () => JSON.stringify(mockProjects)
        });

      const result = getTodoistData();

      expect(result).toHaveProperty('tasks');
      expect(result).toHaveProperty('rawTasks');
      expect(result).toHaveProperty('projects');
      expect(result.tasks).toHaveLength(1);
      expect(result.projects).toEqual(mockProjects);
      expect(result.tasks[0]).toHaveProperty('subtasks');
    });

    test('should use correct API endpoints and headers', () => {
      UrlFetchApp.fetch
        .mockReturnValueOnce({
          getContentText: () => JSON.stringify([])
        })
        .mockReturnValueOnce({
          getContentText: () => JSON.stringify([])
        });

      getTodoistData();

      // Check that the correct URLs were called
      expect(UrlFetchApp.fetch).toHaveBeenCalledWith(
        expect.stringContaining('https://api.todoist.com/rest/v2/tasks?filter='),
        expect.objectContaining({
          method: 'get',
          headers: {
            'Authorization': 'Bearer mock-token-12345'
          },
          muteHttpExceptions: true
        })
      );

      expect(UrlFetchApp.fetch).toHaveBeenCalledWith(
        'https://api.todoist.com/rest/v2/projects',
        expect.objectContaining({
          method: 'get',
          headers: {
            'Authorization': 'Bearer mock-token-12345'
          },
          muteHttpExceptions: true
        })
      );
    });

    test('should use correct task filter to include overdue items', () => {
      UrlFetchApp.fetch
        .mockReturnValueOnce({
          getContentText: () => JSON.stringify([])
        })
        .mockReturnValueOnce({
          getContentText: () => JSON.stringify([])
        });

      getTodoistData();

      const expectedFilter = encodeURIComponent('overdue | today | future');
      expect(UrlFetchApp.fetch).toHaveBeenCalledWith(
        `https://api.todoist.com/rest/v2/tasks?filter=${expectedFilter}`,
        expect.any(Object)
      );
    });

    test('should handle malformed JSON responses gracefully', () => {
      UrlFetchApp.fetch
        .mockReturnValueOnce({
          getContentText: () => 'invalid json'
        });

      expect(() => getTodoistData()).toThrow();
    });
  });

  describe('fetchTasksWithSubtasks()', () => {
    const mockParams = {
      method: 'get',
      headers: { 'Authorization': 'Bearer mock-token-12345' },
      muteHttpExceptions: true
    };

    test('should attach subtasks to parent tasks', () => {
      const mockTasks = [
        { id: '123', content: 'Parent task' },
        { id: '124', content: 'Another parent task' }
      ];

      const mockSubtasks = [
        { id: '125', content: 'Subtask 1', parent_id: '123' },
        { id: '126', content: 'Subtask 2', parent_id: '123' }
      ];

      // Mock subtask API responses
      UrlFetchApp.fetch
        .mockReturnValueOnce({
          getContentText: () => JSON.stringify(mockSubtasks)
        })
        .mockReturnValueOnce({
          getContentText: () => JSON.stringify([])
        });

      const result = fetchTasksWithSubtasks(mockTasks, mockParams);

      expect(result).toHaveLength(2);
      expect(result[0].subtasks).toEqual(mockSubtasks);
      expect(result[1].subtasks).toEqual([]);
    });

    test('should call subtask API for each task', () => {
      const mockTasks = [
        { id: '123', content: 'Task 1' },
        { id: '124', content: 'Task 2' }
      ];

      UrlFetchApp.fetch
        .mockReturnValue({
          getContentText: () => JSON.stringify([])
        });

      fetchTasksWithSubtasks(mockTasks, mockParams);

      expect(UrlFetchApp.fetch).toHaveBeenCalledWith(
        'https://api.todoist.com/rest/v2/tasks?parent_id=123',
        mockParams
      );
      expect(UrlFetchApp.fetch).toHaveBeenCalledWith(
        'https://api.todoist.com/rest/v2/tasks?parent_id=124',
        mockParams
      );
    });

    test('should handle subtask API errors gracefully', () => {
      const mockTasks = [{ id: '123', content: 'Parent task' }];

      // Mock an error response
      UrlFetchApp.fetch.mockImplementation(() => {
        throw new Error('Network error');
      });

      const result = fetchTasksWithSubtasks(mockTasks, mockParams);

      expect(result).toHaveLength(1);
      expect(result[0].subtasks).toEqual([]);
    });

    test('should handle empty subtask responses', () => {
      const mockTasks = [{ id: '123', content: 'Parent task' }];

      UrlFetchApp.fetch.mockReturnValue({
        getContentText: () => JSON.stringify(null)
      });

      const result = fetchTasksWithSubtasks(mockTasks, mockParams);

      expect(result[0].subtasks).toEqual([]);
    });

    test('should log debug information when DEBUG is enabled', () => {
      // Enable debug mode
      PropertiesService.getScriptProperties().getProperty.mockImplementation((key) => {
        if (key === 'DEBUG') return 'true';
        if (key === 'TODOIST_TOKEN') return 'mock-token-12345';
        return null;
      });

      const mockTasks = [{ id: '123', content: 'Test task' }];

      UrlFetchApp.fetch.mockReturnValue({
        getContentText: () => JSON.stringify([])
      });

      fetchTasksWithSubtasks(mockTasks, mockParams);

      // Verify debug logging occurred
      expect(Logger.log).toHaveBeenCalledWith(expect.stringContaining('FETCH SUBTASKS DEBUG'));
      expect(Logger.log).toHaveBeenCalledWith(expect.stringContaining('Total tasks to process: 1'));
    });

    test('should handle malformed subtask JSON responses', () => {
      const mockTasks = [{ id: '123', content: 'Parent task' }];

      UrlFetchApp.fetch.mockReturnValue({
        getContentText: () => 'invalid json'
      });

      const result = fetchTasksWithSubtasks(mockTasks, mockParams);

      expect(result[0].subtasks).toEqual([]);
    });
  });

  describe('API Error Scenarios', () => {
    test('should handle 401 unauthorized responses', () => {
      UrlFetchApp.fetch.mockReturnValue({
        getContentText: () => JSON.stringify({ error: 'Unauthorized' }),
        getResponseCode: () => 401
      });

      // The function doesn't explicitly handle HTTP status codes,
      // but we can test that it doesn't crash
      expect(() => getTodoistData()).not.toThrow();
    });

    test('should handle 429 rate limiting responses', () => {
      UrlFetchApp.fetch.mockReturnValue({
        getContentText: () => JSON.stringify({ error: 'Rate limited' }),
        getResponseCode: () => 429
      });

      expect(() => getTodoistData()).not.toThrow();
    });

    test('should handle 500 server error responses', () => {
      UrlFetchApp.fetch.mockReturnValue({
        getContentText: () => JSON.stringify({ error: 'Internal server error' }),
        getResponseCode: () => 500
      });

      expect(() => getTodoistData()).not.toThrow();
    });

    test('should handle network timeout errors', () => {
      UrlFetchApp.fetch.mockImplementation(() => {
        throw new Error('Request timeout');
      });

      expect(() => getTodoistData()).toThrow('Request timeout');
    });

    test('should handle empty API responses', () => {
      UrlFetchApp.fetch
        .mockReturnValueOnce({
          getContentText: () => JSON.stringify([])
        })
        .mockReturnValueOnce({
          getContentText: () => JSON.stringify([])
        });

      const result = getTodoistData();

      expect(result.tasks).toEqual([]);
      expect(result.projects).toEqual([]);
    });
  });

  describe('Token Management', () => {
    test('should throw error when token is not configured', () => {
      PropertiesService.getScriptProperties().getProperty.mockReturnValue(null);

      expect(() => getTodoistData()).toThrow('TODOIST_TOKEN is not configured');
    });

    test('should use the configured token in API calls', () => {
      const customToken = 'custom-token-xyz';
      PropertiesService.getScriptProperties().getProperty.mockReturnValue(customToken);

      UrlFetchApp.fetch
        .mockReturnValueOnce({
          getContentText: () => JSON.stringify([])
        })
        .mockReturnValueOnce({
          getContentText: () => JSON.stringify([])
        });

      getTodoistData();

      expect(UrlFetchApp.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: {
            'Authorization': `Bearer ${customToken}`
          }
        })
      );
    });
  });
});