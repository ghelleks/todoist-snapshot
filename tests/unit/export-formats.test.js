/**
 * Export Format Tests
 * Tests for Google Docs, plain text, and JSON export functionality
 */

// Import mocks
require('../mocks/google-apps-script');

// Import the source functions
const fs = require('fs');
const path = require('path');

// Load and evaluate the Google Apps Script file
const gasCode = fs.readFileSync(path.join(__dirname, '../../todoist-snapshot.js'), 'utf8');
eval(gasCode);

describe('Export Formats', () => {
  beforeEach(() => {
    // Reset all mocks before each test
    MockUtils.resetAll();
    
    // Setup default configuration using enhanced mocks
    PropertiesService.setMockProperties({
      'DOC_ID': 'doc123',
      'TEXT_FILE_ID': 'file123',
      'JSON_FILE_ID': 'json123',
      'TIMEZONE': 'America/Chicago',
      'TODOIST_TOKEN': 'test-token-123'
    });
  });

  describe('writeTasksToDoc() - Google Docs Export', () => {
    let mockBody, mockDoc;

    beforeEach(() => {
      mockBody = {
        setText: jest.fn(),
        appendParagraph: jest.fn(() => ({
          setHeading: jest.fn(() => mockBody),
          setItalic: jest.fn(() => mockBody)
        })),
        appendListItem: jest.fn(() => ({
          appendText: jest.fn(),
          editAsText: jest.fn(() => ({
            getText: jest.fn(() => 'mock text'),
            setBold: jest.fn(),
            setItalic: jest.fn(),
            setLinkUrl: jest.fn(),
            deleteText: jest.fn(),
            insertText: jest.fn()
          })),
          setIndentStart: jest.fn()
        }))
      };

      mockDoc = {
        getBody: jest.fn(() => mockBody)
      };

      DocumentApp.openById.mockReturnValue(mockDoc);
    });

    test('should clear document and set title', () => {
      const mockTasks = [];
      const mockProjects = [];

      writeTasksToDoc(mockTasks, mockProjects);

      expect(DocumentApp.openById).toHaveBeenCalledWith('doc123');
      expect(mockBody.setText).toHaveBeenCalledWith('');
      expect(mockBody.appendParagraph).toHaveBeenCalledWith(expect.stringContaining('Todoist Tasks for'));
    });

    test('should add metadata header with statistics', () => {
      const mockTasks = [
        {
          id: '123',
          content: 'Task 1',
          labels: ['urgent'],
          comment_count: 2,
          subtasks: [{ id: '124', content: 'Sub 1' }]
        },
        {
          id: '125',
          content: 'Task 2',
          labels: [],
          subtasks: []
        }
      ];
      const mockProjects = [{ id: '456', name: 'Project 1' }];

      writeTasksToDoc(mockTasks, mockProjects);

      // Check that metadata was added
      expect(mockBody.appendParagraph).toHaveBeenCalledWith(
        expect.stringContaining('Total tasks: 2')
      );
      expect(mockBody.appendParagraph).toHaveBeenCalledWith(
        expect.stringContaining('Total projects: 1')
      );
      expect(mockBody.appendParagraph).toHaveBeenCalledWith(
        expect.stringContaining('Tasks with labels: 1')
      );
      expect(mockBody.appendParagraph).toHaveBeenCalledWith(
        expect.stringContaining('Tasks with comments: 1')
      );
      expect(mockBody.appendParagraph).toHaveBeenCalledWith(
        expect.stringContaining('Sub-tasks: 1')
      );
    });

    test('should handle empty task list', () => {
      const mockTasks = [];
      const mockProjects = [];

      writeTasksToDoc(mockTasks, mockProjects);

      expect(mockBody.appendParagraph).toHaveBeenCalledWith('No tasks due today.');
    });

    test('should group tasks by project with proper headings', () => {
      const mockTasks = [
        {
          id: '123',
          content: 'Work task',
          project_id: '456',
          labels: [],
          subtasks: []
        },
        {
          id: '124',
          content: 'Inbox task',
          project_id: 'inbox',
          labels: [],
          subtasks: []
        }
      ];
      const mockProjects = [{ id: '456', name: 'Work Project' }];

      writeTasksToDoc(mockTasks, mockProjects);

      // Check project headings
      expect(mockBody.appendParagraph).toHaveBeenCalledWith('Inbox');
      expect(mockBody.appendParagraph).toHaveBeenCalledWith('Work Project');
    });

    test('should create list items for tasks and subtasks', () => {
      const mockTasks = [
        {
          id: '123',
          content: 'Parent task',
          project_id: '456',
          labels: [],
          subtasks: [
            { id: '124', content: 'Subtask 1' },
            { id: '125', content: 'Subtask 2' }
          ]
        }
      ];
      const mockProjects = [{ id: '456', name: 'Project' }];

      writeTasksToDoc(mockTasks, mockProjects);

      // Should create 3 list items (1 parent + 2 subtasks)
      expect(mockBody.appendListItem).toHaveBeenCalledTimes(3);
    });

    test('should handle tasks without subtasks', () => {
      const mockTasks = [
        {
          id: '123',
          content: 'Simple task',
          project_id: '456',
          labels: [],
          subtasks: []
        }
      ];
      const mockProjects = [{ id: '456', name: 'Project' }];

      writeTasksToDoc(mockTasks, mockProjects);

      expect(mockBody.appendListItem).toHaveBeenCalledTimes(1);
    });
  });

  describe('writeTasksToTextFile() - Plain Text Export', () => {
    let mockFile;

    beforeEach(() => {
      mockFile = {
        setContent: jest.fn()
      };

      DriveApp.getFileById.mockReturnValue(mockFile);
    });

    test('should write formatted text to file', () => {
      const mockTasks = [
        {
          id: '123',
          content: 'Test task',
          project_id: '456',
          priority: 4,
          labels: ['urgent'],
          subtasks: []
        }
      ];
      const mockProjects = [{ id: '456', name: 'Test Project' }];

      writeTasksToTextFile(mockTasks, mockProjects);

      expect(DriveApp.getFileById).toHaveBeenCalledWith('file123');
      expect(mockFile.setContent).toHaveBeenCalledWith(
        expect.stringContaining('Test Project:')
      );
      expect(mockFile.setContent).toHaveBeenCalledWith(
        expect.stringContaining('- (P1) Test task')
      );
    });

    test('should handle empty task list in text export', () => {
      const mockTasks = [];
      const mockProjects = [];

      writeTasksToTextFile(mockTasks, mockProjects);

      expect(mockFile.setContent).toHaveBeenCalledWith(
        expect.stringContaining('No tasks due today')
      );
    });

    test('should include metadata header in text export', () => {
      const mockTasks = [
        { id: '123', content: 'Task', project_id: '456', labels: [], subtasks: [] }
      ];
      const mockProjects = [{ id: '456', name: 'Project' }];

      writeTasksToTextFile(mockTasks, mockProjects);

      expect(mockFile.setContent).toHaveBeenCalledWith(
        expect.stringContaining('Export date:')
      );
      expect(mockFile.setContent).toHaveBeenCalledWith(
        expect.stringContaining('Total tasks: 1')
      );
    });
  });

  describe('writeTasksToJsonFile() - JSON Export', () => {
    let mockFile;

    beforeEach(() => {
      mockFile = {
        setContent: jest.fn()
      };

      DriveApp.getFileById.mockReturnValue(mockFile);
    });

    test('should write structured JSON with metadata', () => {
      const mockTasks = [
        {
          id: '123',
          content: 'Test task',
          priority: 4,
          labels: ['urgent'],
          due: { date: '2024-01-15' },
          comment_count: 2
        }
      ];
      const mockProjects = [{ id: '456', name: 'Test Project' }];

      writeTasksToJsonFile(mockTasks, mockProjects);

      expect(DriveApp.getFileById).toHaveBeenCalledWith('json123');
      
      const jsonCall = mockFile.setContent.mock.calls[0][0];
      const parsedJson = JSON.parse(jsonCall);

      // Check structure
      expect(parsedJson).toHaveProperty('exportMetadata');
      expect(parsedJson).toHaveProperty('statistics');
      expect(parsedJson).toHaveProperty('data');

      // Check metadata
      expect(parsedJson.exportMetadata).toHaveProperty('exportDate');
      expect(parsedJson.exportMetadata).toHaveProperty('timezone', 'America/Chicago');
      expect(parsedJson.exportMetadata).toHaveProperty('apiVersion', 'v2');
      expect(parsedJson.exportMetadata).toHaveProperty('scriptVersion', '1.0.0');

      // Check statistics
      expect(parsedJson.statistics.tasks.total).toBe(1);
      expect(parsedJson.statistics.tasks.withDueDates).toBe(1);
      expect(parsedJson.statistics.tasks.withLabels).toBe(1);
      expect(parsedJson.statistics.tasks.withComments).toBe(1);
      expect(parsedJson.statistics.tasks.byPriority.p1).toBe(1);

      // Check data
      expect(parsedJson.data.tasks).toEqual(mockTasks);
      expect(parsedJson.data.projects).toEqual(mockProjects);
    });

    test('should calculate priority statistics correctly', () => {
      const mockTasks = [
        { id: '1', priority: 4 }, // P1
        { id: '2', priority: 3 }, // P2
        { id: '3', priority: 2 }, // P3
        { id: '4', priority: 1 }, // P4
        { id: '5', priority: 1 }  // P4
      ];
      const mockProjects = [];

      writeTasksToJsonFile(mockTasks, mockProjects);

      const jsonCall = mockFile.setContent.mock.calls[0][0];
      const parsedJson = JSON.parse(jsonCall);

      expect(parsedJson.statistics.tasks.byPriority.p1).toBe(1);
      expect(parsedJson.statistics.tasks.byPriority.p2).toBe(1);
      expect(parsedJson.statistics.tasks.byPriority.p3).toBe(1);
      expect(parsedJson.statistics.tasks.byPriority.p4).toBe(2);
    });

    test('should handle empty task list in JSON export', () => {
      const mockTasks = [];
      const mockProjects = [];

      writeTasksToJsonFile(mockTasks, mockProjects);

      const jsonCall = mockFile.setContent.mock.calls[0][0];
      const parsedJson = JSON.parse(jsonCall);

      expect(parsedJson.statistics.tasks.total).toBe(0);
      expect(parsedJson.statistics.tasks.withDueDates).toBe(0);
      expect(parsedJson.data.tasks).toEqual([]);
    });

    test('should handle null tasks gracefully', () => {
      const mockTasks = null;
      const mockProjects = [];

      writeTasksToJsonFile(mockTasks, mockProjects);

      const jsonCall = mockFile.setContent.mock.calls[0][0];
      const parsedJson = JSON.parse(jsonCall);

      expect(parsedJson.statistics.tasks.total).toBe(0);
      expect(parsedJson.data.tasks).toBeNull();
    });

    test('should format JSON with proper indentation', () => {
      const mockTasks = [{ id: '123', content: 'Test' }];
      const mockProjects = [];

      writeTasksToJsonFile(mockTasks, mockProjects);

      const jsonCall = mockFile.setContent.mock.calls[0][0];
      
      // Check that it's pretty-printed (has newlines and spaces)
      expect(jsonCall).toContain('\n');
      expect(jsonCall).toContain('  '); // 2-space indentation
    });

    test('should include export timestamp', () => {
      const mockTasks = [];
      const mockProjects = [];

      const beforeTime = new Date();
      writeTasksToJsonFile(mockTasks, mockProjects);
      const afterTime = new Date();

      const jsonCall = mockFile.setContent.mock.calls[0][0];
      const parsedJson = JSON.parse(jsonCall);

      const exportTime = new Date(parsedJson.exportMetadata.exportDate);
      expect(exportTime.getTime()).toBeGreaterThanOrEqual(beforeTime.getTime());
      expect(exportTime.getTime()).toBeLessThanOrEqual(afterTime.getTime());
    });
  });

  describe('Export Error Handling', () => {
    test('should handle Document API errors', () => {
      DocumentApp.openById.mockImplementation(() => {
        throw new Error('Document not found');
      });

      expect(() => writeTasksToDoc([], [])).toThrow('Document not found');
    });

    test('should handle Drive API errors for text files', () => {
      DriveApp.getFileById.mockImplementation(() => {
        throw new Error('File not accessible');
      });

      expect(() => writeTasksToTextFile([], [])).toThrow('File not accessible');
    });

    test('should handle Drive API errors for JSON files', () => {
      DriveApp.getFileById.mockImplementation(() => {
        throw new Error('Permission denied');
      });

      expect(() => writeTasksToJsonFile([], [])).toThrow('Permission denied');
    });

    test('should handle setContent failures', () => {
      const mockFile = {
        setContent: jest.fn(() => {
          throw new Error('Quota exceeded');
        })
      };

      DriveApp.getFileById.mockReturnValue(mockFile);

      expect(() => writeTasksToTextFile([], [])).toThrow('Quota exceeded');
    });
  });

  describe('Configuration Integration', () => {
    test('should use correct document ID from configuration', () => {
      PropertiesService.getScriptProperties().getProperty.mockImplementation((key) => {
        if (key === 'DOC_ID') return 'custom-doc-id';
        return null;
      });

      writeTasksToDoc([], []);

      expect(DocumentApp.openById).toHaveBeenCalledWith('custom-doc-id');
    });

    test('should use correct file ID from configuration', () => {
      PropertiesService.getScriptProperties().getProperty.mockImplementation((key) => {
        if (key === 'TEXT_FILE_ID') return 'custom-file-id';
        return null;
      });

      writeTasksToTextFile([], []);

      expect(DriveApp.getFileById).toHaveBeenCalledWith('custom-file-id');
    });

    test('should use correct JSON file ID from configuration', () => {
      PropertiesService.getScriptProperties().getProperty.mockImplementation((key) => {
        if (key === 'JSON_FILE_ID') return 'custom-json-id';
        return null;
      });

      writeTasksToJsonFile([], []);

      expect(DriveApp.getFileById).toHaveBeenCalledWith('custom-json-id');
    });

    test('should use timezone from configuration in JSON export', () => {
      PropertiesService.getScriptProperties().getProperty.mockImplementation((key) => {
        if (key === 'TIMEZONE') return 'Europe/London';
        if (key === 'JSON_FILE_ID') return 'json123';
        return null;
      });

      const mockFile = { setContent: jest.fn() };
      DriveApp.getFileById.mockReturnValue(mockFile);

      writeTasksToJsonFile([], []);

      const jsonCall = mockFile.setContent.mock.calls[0][0];
      const parsedJson = JSON.parse(jsonCall);

      expect(parsedJson.exportMetadata.timezone).toBe('Europe/London');
    });
  });

  describe('Data Integrity', () => {
    test('should preserve all task data in JSON export', () => {
      const complexTask = {
        id: '123',
        content: 'Complex task',
        description: 'Detailed description',
        due: { 
          date: '2024-01-15',
          datetime: '2024-01-15T14:30:00Z',
          timezone: 'UTC'
        },
        priority: 4,
        labels: ['urgent', 'work'],
        project_id: '456',
        section_id: '789',
        parent_id: null,
        order: 1,
        comment_count: 5,
        created_at: '2024-01-01T10:00:00Z',
        creator_id: 'user123',
        url: 'https://todoist.com/showTask?id=123'
      };

      const mockFile = { setContent: jest.fn() };
      DriveApp.getFileById.mockReturnValue(mockFile);

      writeTasksToJsonFile([complexTask], []);

      const jsonCall = mockFile.setContent.mock.calls[0][0];
      const parsedJson = JSON.parse(jsonCall);

      expect(parsedJson.data.tasks[0]).toEqual(complexTask);
    });

    test('should maintain project data integrity', () => {
      const complexProject = {
        id: '456',
        name: 'Test Project',
        color: 'blue',
        comment_count: 10,
        order: 1,
        shared: false,
        favorite: true,
        inbox_project: false,
        team_inbox: false
      };

      const mockFile = { setContent: jest.fn() };
      DriveApp.getFileById.mockReturnValue(mockFile);

      writeTasksToJsonFile([], [complexProject]);

      const jsonCall = mockFile.setContent.mock.calls[0][0];
      const parsedJson = JSON.parse(jsonCall);

      expect(parsedJson.data.projects[0]).toEqual(complexProject);
    });
  });
});