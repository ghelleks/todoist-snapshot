/**
 * End-to-End Integration Tests
 * Tests complete workflows from API to export with realistic data
 */

// Import mocks
require('../mocks/google-apps-script');

// Import the source functions
const fs = require('fs');
const path = require('path');

// Load and evaluate the Google Apps Script file
const gasCode = fs.readFileSync(path.join(__dirname, '../../todoist-snapshot.js'), 'utf8');
eval(gasCode);

describe('End-to-End Integration Tests', () => {
  let mockTodoistData;
  let mockDocument, mockBody, mockFile;

  beforeEach(() => {
    // Reset all mocks before each test
    MockUtils.resetAll();

    // Setup realistic test data
    mockTodoistData = {
      tasks: [
        {
          id: '2995104339',
          content: 'Complete quarterly report **urgently**',
          description: 'Include Q4 metrics\nAdd performance analysis\nReview with team',
          due: { datetime: '2025-09-16T17:00:00Z' },
          priority: 4,
          labels: ['work', 'urgent'],
          project_id: '2203306141',
          created_at: '2024-01-01T10:00:00Z',
          comment_count: 3,
          subtasks: [
            {
              id: '2995104340',
              content: 'Gather Q4 data',
              priority: 2,
              labels: ['data'],
              due: { date: '2025-09-16' },
              created_at: '2024-01-02T09:00:00Z',
              comment_count: 1
            },
            {
              id: '2995104341',
              content: 'Create visualizations',
              priority: 1,
              labels: [],
              created_at: '2024-01-02T09:30:00Z'
            }
          ]
        },
        {
          id: '2995104342',
          content: 'Schedule team meeting with [calendar link](https://calendar.google.com)',
          description: '',
          due: { date: '2025-09-17' },
          priority: 2,
          labels: ['meeting'],
          project_id: '2203306141',
          created_at: '2024-01-03T14:00:00Z',
          comment_count: 0,
          subtasks: []
        },
        {
          id: '2995104343',
          content: 'Buy groceries',
          description: 'Milk, bread, eggs',
          due: { date: '2025-09-18' },
          priority: 1,
          labels: [],
          project_id: 'inbox',
          created_at: '2024-01-05T08:00:00Z',
          comment_count: 0,
          subtasks: []
        }
      ],
      rawTasks: [
        {
          id: '2995104339',
          content: 'Complete quarterly report **urgently**',
          description: 'Include Q4 metrics\nAdd performance analysis\nReview with team',
          due: { datetime: '2025-09-16T17:00:00Z' },
          priority: 4,
          labels: ['work', 'urgent'],
          project_id: '2203306141',
          created_at: '2024-01-01T10:00:00Z',
          comment_count: 3
        },
        {
          id: '2995104342',
          content: 'Schedule team meeting with [calendar link](https://calendar.google.com)',
          due: { date: '2025-09-17' },
          priority: 2,
          labels: ['meeting'],
          project_id: '2203306141',
          created_at: '2024-01-03T14:00:00Z',
          comment_count: 0
        },
        {
          id: '2995104343',
          content: 'Buy groceries',
          description: 'Milk, bread, eggs',
          due: { date: '2025-09-18' },
          priority: 1,
          labels: [],
          project_id: 'inbox',
          created_at: '2024-01-05T08:00:00Z',
          comment_count: 0
        }
      ],
      projects: [
        { id: '2203306141', name: 'Work Project' },
        { id: '2203306142', name: 'Personal Projects' }
      ]
    };

    // Setup comprehensive mocks
    setupMocks();
    setupAPIResponses();
    setupConfiguration();
  });

  function setupMocks() {
    // Mock document structure
    mockBody = {
      setText: jest.fn(),
      appendParagraph: jest.fn(() => ({
        setHeading: jest.fn(() => mockBody),
        setItalic: jest.fn(() => mockBody)
      })),
      appendListItem: jest.fn(() => ({
        appendText: jest.fn(),
        editAsText: jest.fn(() => ({
          getText: jest.fn(() => 'Complete quarterly report urgently'),
          setBold: jest.fn(),
          setItalic: jest.fn(),
          setLinkUrl: jest.fn(),
          deleteText: jest.fn(),
          insertText: jest.fn()
        })),
        setIndentStart: jest.fn()
      }))
    };

    mockDocument = {
      getBody: jest.fn(() => mockBody)
    };

    mockFile = {
      setContent: jest.fn()
    };

    DocumentApp.openById.mockReturnValue(mockDocument);
    DriveApp.getFileById.mockReturnValue(mockFile);

    // Mock date formatting
    Utilities.formatDate.mockImplementation((date, timezone, format) => {
      const d = new Date(date);
      if (format.includes('h:mm a')) {
        return 'Jan 15, 2024 at 5:00 PM';
      } else if (format.includes('MMM d, yyyy')) {
        return 'Jan 15, 2024';
      } else if (format.includes('MMM d')) {
        return 'Jan 1';
      }
      return d.toLocaleDateString();
    });
  }

  function setupAPIResponses() {
    // Mock Todoist API responses
    UrlFetchApp.fetch.mockImplementation((url, params) => {
      if (url.includes('/tasks') && !url.includes('parent_id')) {
        // Main tasks endpoint
        return {
          getContentText: () => JSON.stringify(mockTodoistData.rawTasks),
          getResponseCode: () => 200
        };
      } else if (url.includes('/tasks?parent_id=2995104339')) {
        // Subtasks for first task
        return {
          getContentText: () => JSON.stringify([
            {
              id: '2995104340',
              content: 'Gather Q4 data',
              priority: 2,
              labels: ['data'],
              due: { date: '2025-09-16' },
              created_at: '2024-01-02T09:00:00Z',
              comment_count: 1
            },
            {
              id: '2995104341',
              content: 'Create visualizations',
              priority: 1,
              labels: [],
              created_at: '2024-01-02T09:30:00Z'
            }
          ]),
          getResponseCode: () => 200
        };
      } else if (url.includes('/tasks?parent_id=')) {
        // No subtasks for other tasks
        return {
          getContentText: () => JSON.stringify([]),
          getResponseCode: () => 200
        };
      } else if (url.includes('/projects')) {
        // Projects endpoint
        return {
          getContentText: () => JSON.stringify(mockTodoistData.projects),
          getResponseCode: () => 200
        };
      }
      return { getContentText: () => JSON.stringify([]) };
    });
  }

  function setupConfiguration() {
    PropertiesService.setMockProperties({
      'TODOIST_TOKEN': 'test-token-12345',
      'DOC_ID': '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms',
      'TEXT_FILE_ID': '1AbCdEFghIJklMNopQRstuVWxyz123456',
      'JSON_FILE_ID': '1XyZabcDEFghIJklMNopQRstuVWxyz789',
      'TIMEZONE': 'America/Chicago',
      'DEBUG': 'false'
    });
  }

  describe('Complete Workflow Tests', () => {
    test('should perform full sync from API to Google Doc', () => {
      syncTodoistToDoc();

      // Verify API calls
      expect(UrlFetchApp.fetch).toHaveBeenCalledWith(
        'https://api.todoist.com/rest/v2/tasks',
        expect.objectContaining({
          headers: { 'Authorization': 'Bearer test-token-12345' }
        })
      );

      // Verify document operations
      expect(DocumentApp.openById).toHaveBeenCalledWith('1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms');
      expect(mockBody.setText).toHaveBeenCalledWith('');
      
      // Verify title and metadata
      expect(mockBody.appendParagraph).toHaveBeenCalledWith(
        expect.stringContaining('Todoist Tasks for')
      );
      expect(mockBody.appendParagraph).toHaveBeenCalledWith(
        expect.stringContaining('Total tasks: 3')
      );

      // Verify project sections
      expect(mockBody.appendParagraph).toHaveBeenCalledWith('Inbox');
      expect(mockBody.appendParagraph).toHaveBeenCalledWith('Work Project');

      // Verify list items created (3 main tasks + 2 subtasks = 5)
      expect(mockBody.appendListItem).toHaveBeenCalledTimes(5);

      // Verify success logging
      expect(Logger.log).toHaveBeenCalledWith('✅ Successfully synced tasks to Google Doc');
    });

    test('should perform full sync from API to text file', () => {
      syncTodoistToTextFile();

      // Verify API calls
      expect(UrlFetchApp.fetch).toHaveBeenCalled();

      // Verify file operations
      expect(DriveApp.getFileById).toHaveBeenCalledWith('1AbCdEFghIJklMNopQRstuVWxyz123456');
      expect(mockFile.setContent).toHaveBeenCalledTimes(1);

      const textContent = mockFile.setContent.mock.calls[0][0];

      // Verify content structure
      expect(textContent).toContain('Todoist Tasks for');
      expect(textContent).toContain('Export date:');
      expect(textContent).toContain('Total tasks: 3');
      expect(textContent).toContain('Inbox:');
      expect(textContent).toContain('Work Project:');
      expect(textContent).toContain('- (P1) Complete quarterly report urgently');
      expect(textContent).toContain('[work, urgent]');
      expect(textContent).toContain('(3 comments, created Jan 1)');
      expect(textContent).toContain('> Include Q4 metrics');
      expect(textContent).toContain('  - (P3) Gather Q4 data');
      expect(textContent).toContain('- Buy groceries');

      // Verify success logging
      expect(Logger.log).toHaveBeenCalledWith('✅ Successfully synced tasks to text file');
    });

    test('should perform full sync from API to JSON file', () => {
      syncTodoistToJsonFile();

      // Verify API calls
      expect(UrlFetchApp.fetch).toHaveBeenCalled();

      // Verify file operations
      expect(DriveApp.getFileById).toHaveBeenCalledWith('1XyZabcDEFghIJklMNopQRstuVWxyz789');
      expect(mockFile.setContent).toHaveBeenCalledTimes(1);

      const jsonContent = mockFile.setContent.mock.calls[0][0];
      const parsedJson = JSON.parse(jsonContent);

      // Verify JSON structure
      expect(parsedJson).toHaveProperty('exportMetadata');
      expect(parsedJson).toHaveProperty('statistics');
      expect(parsedJson).toHaveProperty('data');

      // Verify metadata
      expect(parsedJson.exportMetadata.timezone).toBe('America/Chicago');
      expect(parsedJson.exportMetadata.apiVersion).toBe('v2');

      // Verify statistics
      expect(parsedJson.statistics.tasks.total).toBe(3);
      expect(parsedJson.statistics.tasks.withLabels).toBe(2);
      expect(parsedJson.statistics.tasks.byPriority.p1).toBe(1);
      expect(parsedJson.statistics.tasks.byPriority.p3).toBe(1);

      // Verify raw data preservation
      expect(parsedJson.data.tasks).toEqual(mockTodoistData.rawTasks);
      expect(parsedJson.data.projects).toEqual(mockTodoistData.projects);

      // Verify success logging
      expect(Logger.log).toHaveBeenCalledWith('✅ Successfully synced tasks to JSON file');
    });

    test('should optimize API calls for multi-target sync', () => {
      syncTodoist();

      // Should make API calls for tasks, projects, and subtasks
      // Tasks call + projects call + 3 subtask calls = 5 total
      expect(UrlFetchApp.fetch).toHaveBeenCalledTimes(5);

      // Verify all files were updated
      expect(DocumentApp.openById).toHaveBeenCalledWith('1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms');
      expect(DriveApp.getFileById).toHaveBeenCalledWith('1AbCdEFghIJklMNopQRstuVWxyz123456');
      expect(DriveApp.getFileById).toHaveBeenCalledWith('1XyZabcDEFghIJklMNopQRstuVWxyz789');

      // Verify completion logging
      expect(Logger.log).toHaveBeenCalledWith('✅ Todoist sync completed successfully');
    });
  });

  describe('Data Processing Integration', () => {
    test('should properly process and format complex tasks', () => {
      syncTodoistToTextFile();

      const textContent = mockFile.setContent.mock.calls[0][0];

      // Verify priority formatting
      expect(textContent).toContain('- (P1) Complete quarterly report urgently');
      expect(textContent).toContain('- (P3) Schedule team meeting');
      expect(textContent).toContain('- Buy groceries'); // P4 has no prefix

      // Verify label formatting
      expect(textContent).toContain('[work, urgent]');
      expect(textContent).toContain('[meeting]');

      // Verify metadata formatting
      expect(textContent).toContain('(3 comments, created Jan 1)');
      expect(textContent).toContain('(1 comments, created Jan 2)');

      // Verify due date formatting
      expect(textContent).toContain('(Due: Sep 16, 2025 at 5:00 PM)');
      expect(textContent).toContain('(Due: Sep 17, 2025)');

      // Verify description formatting
      expect(textContent).toContain('> Include Q4 metrics');
      expect(textContent).toContain('> Add performance analysis');
      expect(textContent).toContain('> Milk, bread, eggs');

      // Verify subtask formatting
      expect(textContent).toContain('  - (P3) Gather Q4 data');
      expect(textContent).toContain('  - Create visualizations');
    });

    test('should handle markdown in Google Docs export', () => {
      syncTodoistToDoc();

      // Verify markdown processing was attempted
      const listItemMock = mockBody.appendListItem();
      const textElementMock = listItemMock.editAsText();

      expect(textElementMock.setBold).toHaveBeenCalled();
      expect(textElementMock.setLinkUrl).toHaveBeenCalled();
    });

    test('should properly group tasks by project', () => {
      syncTodoistToTextFile();

      const textContent = mockFile.setContent.mock.calls[0][0];

      // Verify project ordering (Inbox first, then alphabetical)
      const inboxIndex = textContent.indexOf('Inbox:');
      const workIndex = textContent.indexOf('Work Project:');
      expect(inboxIndex).toBeLessThan(workIndex);

      // Verify tasks appear under correct projects
      const inboxSection = textContent.substring(inboxIndex, workIndex);
      expect(inboxSection).toContain('Buy groceries');

      const workSection = textContent.substring(workIndex);
      expect(workSection).toContain('Complete quarterly report');
      expect(workSection).toContain('Schedule team meeting');
    });
  });

  describe('Error Recovery Integration', () => {
    test('should handle API errors gracefully', () => {
      UrlFetchApp.fetch.mockImplementation(() => {
        throw new Error('Network timeout');
      });

      syncTodoistToDoc();

      expect(Logger.log).toHaveBeenCalledWith(
        expect.stringMatching(/❌ Failed to sync tasks to Google Doc.*Network timeout/)
      );
    });

    test('should handle malformed API responses', () => {
      UrlFetchApp.fetch.mockImplementation((url) => {
        if (url.includes('/tasks/filter')) {
          return { getContentText: () => 'invalid json' };
        }
        return { getContentText: () => JSON.stringify([]) };
      });

      syncTodoistToDoc();

      expect(Logger.log).toHaveBeenCalledWith(
        expect.stringMatching(/❌ Failed to sync tasks to Google Doc/)
      );
    });

    test('should handle document access errors', () => {
      DocumentApp.openById.mockImplementation(() => {
        throw new Error('Document not accessible');
      });

      syncTodoistToDoc();

      expect(Logger.log).toHaveBeenCalledWith(
        expect.stringMatching(/❌ Failed to sync tasks to Google Doc.*Document not accessible/)
      );
    });

    test('should handle file write errors', () => {
      mockFile.setContent.mockImplementation(() => {
        throw new Error('Quota exceeded');
      });

      syncTodoistToTextFile();

      expect(Logger.log).toHaveBeenCalledWith(
        expect.stringMatching(/❌ Failed to sync tasks to text file.*Quota exceeded/)
      );
    });
  });

  describe('Configuration Integration', () => {
    test('should handle missing configuration gracefully', () => {
      PropertiesService.setMockProperties({});

      expect(() => syncTodoist()).toThrow('No output targets configured');
    });

    test('should respect DEBUG configuration', () => {
      PropertiesService.setMockProperties({
        'DEBUG': 'true',
        'DOC_ID': '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms',
        'TODOIST_TOKEN': 'test-token-12345'
      });

      syncTodoistToDoc();

      // Should log debug information
      expect(Logger.log).toHaveBeenCalledWith(
        expect.stringContaining('FETCH SUBTASKS DEBUG')
      );
    });

    test('should use custom timezone in exports', () => {
      PropertiesService.setMockProperties({
        'TIMEZONE': 'Europe/London',
        'JSON_FILE_ID': '1XyZabcDEFghIJklMNopQRstuVWxyz789',
        'TODOIST_TOKEN': 'test-token-12345'
      });

      syncTodoistToJsonFile();

      const jsonContent = mockFile.setContent.mock.calls[0][0];
      const parsedJson = JSON.parse(jsonContent);

      expect(parsedJson.exportMetadata.timezone).toBe('Europe/London');
    });
  });

  describe('Performance and Scale', () => {
    test('should handle large datasets efficiently', () => {
      // Create a large dataset
      const largeTasks = Array.from({ length: 100 }, (_, i) => ({
        id: `task-${i}`,
        content: `Task ${i}`,
        project_id: i % 5 === 0 ? 'inbox' : `project-${i % 5}`,
        priority: (i % 4) + 1,
        labels: i % 3 === 0 ? [`label-${i}`] : [],
        subtasks: []
      }));

      UrlFetchApp.fetch.mockImplementation((url) => {
        if (url.includes('/tasks/filter')) {
          return { getContentText: () => JSON.stringify(largeTasks) };
        } else if (url.includes('/tasks?parent_id=')) {
          return { getContentText: () => JSON.stringify([]) };
        } else if (url.includes('/projects')) {
          return { getContentText: () => JSON.stringify([
            { id: 'project-1', name: 'Project 1' },
            { id: 'project-2', name: 'Project 2' }
          ]) };
        }
        return { getContentText: () => JSON.stringify([]) };
      });

      syncTodoistToTextFile();

      const textContent = mockFile.setContent.mock.calls[0][0];
      expect(textContent).toContain('Total tasks: 100');
      expect(Logger.log).toHaveBeenCalledWith('✅ Successfully synced tasks to text file');
    });

    test('should handle API rate limiting simulation', () => {
      let callCount = 0;
      UrlFetchApp.fetch.mockImplementation((url) => {
        callCount++;
        if (callCount <= 3) {
          // Simulate successful calls
          if (url.includes('/tasks/filter')) {
            return { getContentText: () => JSON.stringify([mockTodoistData.rawTasks[0]]) };
          } else if (url.includes('/projects')) {
            return { getContentText: () => JSON.stringify(mockTodoistData.projects) };
          }
          return { getContentText: () => JSON.stringify([]) };
        } else {
          // Simulate rate limiting
          throw new Error('Too many requests');
        }
      });

      syncTodoistToDoc();

      // Should handle the error gracefully
      expect(Logger.log).toHaveBeenCalledWith(
        expect.stringMatching(/❌ Failed to sync tasks to Google Doc/)
      );
    });
  });
});