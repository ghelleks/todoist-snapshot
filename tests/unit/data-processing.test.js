/**
 * Data Processing Tests
 * Tests for text formatting, project grouping, and data transformation
 */

// Import mocks
require('../mocks/google-apps-script');

// Import the source functions
const fs = require('fs');
const path = require('path');

// Load and evaluate the Google Apps Script file
const gasCode = fs.readFileSync(path.join(__dirname, '../../todoist-snapshot.gs'), 'utf8');
eval(gasCode);

describe('Data Processing', () => {
  beforeEach(() => {
    // Reset all mocks before each test
    MockUtils.resetAll();
    
    // Setup default timezone
    PropertiesService.setMockProperties({
      'TIMEZONE': 'America/Chicago'
    });

    // Mock Utilities.formatDate
    Utilities.formatDate.mockImplementation((date, timezone, format) => {
      const d = new Date(date);
      if (format.includes('MMM d, yyyy')) {
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      }
      if (format.includes('h:mm a')) {
        return d.toLocaleString('en-US', { 
          month: 'short', 
          day: 'numeric', 
          year: 'numeric',
          hour: 'numeric',
          minute: '2-digit',
          hour12: true
        });
      }
      return d.toLocaleDateString();
    });
  });

  describe('buildPlainTextForTasks()', () => {
    const mockProjects = [
      { id: '456', name: 'Work Project' },
      { id: '789', name: 'Personal' }
    ];

    test('should create correct plain text output with basic tasks', () => {
      const mockTasks = [
        {
          id: '123',
          content: 'Complete report',
          description: 'Quarterly business report',
          due: { date: '2024-01-15' },
          priority: 4,
          labels: ['urgent'],
          project_id: '456',
          created_at: '2024-01-01T10:00:00Z',
          comment_count: 2,
          subtasks: []
        }
      ];

      const result = buildPlainTextForTasks(mockTasks, mockProjects);

      expect(result).toContain('Todoist Tasks for');
      expect(result).toContain('Export date:');
      expect(result).toContain('Total tasks: 1');
      expect(result).toContain('Work Project:');
      expect(result).toContain('- (P1) Complete report');
      expect(result).toContain('[urgent]');
      expect(result).toContain('(2 comments, created Jan 1)');
      expect(result).toContain('> Quarterly business report');
    });

    test('should handle tasks with no metadata gracefully', () => {
      const mockTasks = [
        {
          id: '123',
          content: 'Simple task',
          project_id: '456',
          priority: 1,
          labels: [],
          subtasks: []
        }
      ];

      const result = buildPlainTextForTasks(mockTasks, mockProjects);

      expect(result).toContain('- Simple task');
      expect(result).not.toContain('[');
      expect(result).not.toContain('comments');
    });

    test('should group tasks by project correctly', () => {
      const mockTasks = [
        {
          id: '123',
          content: 'Work task',
          project_id: '456',
          priority: 1,
          labels: [],
          subtasks: []
        },
        {
          id: '124',
          content: 'Personal task',
          project_id: '789',
          priority: 1,
          labels: [],
          subtasks: []
        },
        {
          id: '125',
          content: 'Inbox task',
          project_id: 'inbox',
          priority: 1,
          labels: [],
          subtasks: []
        }
      ];

      const result = buildPlainTextForTasks(mockTasks, mockProjects);

      // Inbox should come first
      const inboxIndex = result.indexOf('Inbox:');
      const personalIndex = result.indexOf('Personal:');
      const workIndex = result.indexOf('Work Project:');

      expect(inboxIndex).toBeLessThan(personalIndex);
      expect(personalIndex).toBeLessThan(workIndex);
    });

    test('should format priorities correctly', () => {
      const mockTasks = [
        { id: '1', content: 'P1 task', project_id: '456', priority: 4, labels: [], subtasks: [] },
        { id: '2', content: 'P2 task', project_id: '456', priority: 3, labels: [], subtasks: [] },
        { id: '3', content: 'P3 task', project_id: '456', priority: 2, labels: [], subtasks: [] },
        { id: '4', content: 'P4 task', project_id: '456', priority: 1, labels: [], subtasks: [] }
      ];

      const result = buildPlainTextForTasks(mockTasks, mockProjects);

      expect(result).toContain('- (P1) P1 task');
      expect(result).toContain('- (P2) P2 task');
      expect(result).toContain('- (P3) P3 task');
      expect(result).toContain('- P4 task'); // No prefix for P4
    });

    test('should format due dates correctly', () => {
      const mockTasks = [
        {
          id: '123',
          content: 'Timed task',
          project_id: '456',
          priority: 1,
          labels: [],
          subtasks: [],
          due: { datetime: '2024-01-15T14:30:00Z' }
        },
        {
          id: '124',
          content: 'All-day task',
          project_id: '456',
          priority: 1,
          labels: [],
          subtasks: [],
          due: { date: '2024-01-15' }
        }
      ];

      const result = buildPlainTextForTasks(mockTasks, mockProjects);

      expect(result).toContain('(Due:');
      // Should have both date and time for datetime tasks
      expect(result).toMatch(/Timed task.*Due:.*\d{1,2}:\d{2}/);
      // Should have only date for all-day tasks
      expect(result).toMatch(/All-day task.*Due:.*Jan 15, 2024\)/);
    });

    test('should handle subtasks with proper indentation', () => {
      const mockTasks = [
        {
          id: '123',
          content: 'Parent task',
          project_id: '456',
          priority: 1,
          labels: [],
          subtasks: [
            {
              id: '124',
              content: 'Subtask 1',
              priority: 2,
              labels: ['sub'],
              due: { date: '2024-01-16' },
              created_at: '2024-01-02T10:00:00Z',
              comment_count: 1
            },
            {
              id: '125',
              content: 'Subtask 2',
              priority: 1,
              labels: []
            }
          ]
        }
      ];

      const result = buildPlainTextForTasks(mockTasks, mockProjects);

      expect(result).toContain('- Parent task');
      expect(result).toContain('  - (P3) Subtask 1');
      expect(result).toContain('[sub]');
      expect(result).toContain('(1 comments, created Jan 2)');
      expect(result).toContain('  - Subtask 2');
    });

    test('should handle empty task lists', () => {
      const result = buildPlainTextForTasks([], mockProjects);

      expect(result).toContain('No tasks due today');
    });

    test('should handle null/undefined inputs', () => {
      const result = buildPlainTextForTasks(null, mockProjects);

      expect(result).toContain('No tasks due today');
    });

    test('should include comprehensive metadata header', () => {
      const mockTasks = [
        {
          id: '123',
          content: 'Task with labels',
          project_id: '456',
          priority: 1,
          labels: ['urgent', 'work'],
          subtasks: [],
          comment_count: 3
        },
        {
          id: '124',
          content: 'Task with subtasks',
          project_id: '456',
          priority: 1,
          labels: [],
          subtasks: [
            { id: '125', content: 'Sub 1' },
            { id: '126', content: 'Sub 2' }
          ]
        }
      ];

      const result = buildPlainTextForTasks(mockTasks, mockProjects);

      expect(result).toContain('Total tasks: 2');
      expect(result).toContain('Total projects: 2');
      expect(result).toContain('Tasks with labels: 1');
      expect(result).toContain('Tasks with comments: 1');
      expect(result).toContain('Sub-tasks: 2');
    });

    test('should handle multiline descriptions properly', () => {
      const mockTasks = [
        {
          id: '123',
          content: 'Task with multiline description',
          description: 'Line 1\nLine 2\nLine 3',
          project_id: '456',
          priority: 1,
          labels: [],
          subtasks: []
        }
      ];

      const result = buildPlainTextForTasks(mockTasks, mockProjects);

      expect(result).toContain('> Line 1');
      expect(result).toContain('> Line 2');
      expect(result).toContain('> Line 3');
    });

    test('should handle special characters in task content', () => {
      const mockTasks = [
        {
          id: '123',
          content: 'Task with émojis 🚀 and spéciål characters & symbols',
          project_id: '456',
          priority: 1,
          labels: [],
          subtasks: []
        }
      ];

      const result = buildPlainTextForTasks(mockTasks, mockProjects);

      expect(result).toContain('Task with émojis 🚀 and spéciål characters & symbols');
    });
  });

  describe('formatListItem() - Google Docs Formatting', () => {
    let mockListItem;
    let mockTextElement;

    beforeEach(() => {
      mockTextElement = {
        getText: jest.fn(() => 'mock text content'),
        setBold: jest.fn(),
        setItalic: jest.fn(),
        setLinkUrl: jest.fn(),
        deleteText: jest.fn(),
        insertText: jest.fn()
      };

      mockListItem = {
        appendText: jest.fn(),
        editAsText: jest.fn(() => mockTextElement),
        setIndentStart: jest.fn(),
        getText: jest.fn(() => 'existing content')
      };
    });

    test('should format task content with bold', () => {
      const mockTask = {
        content: 'Important task',
        description: '',
        due: null,
        priority: 1,
        labels: []
      };

      formatListItem(mockListItem, mockTask);

      expect(mockListItem.appendText).toHaveBeenCalledWith('Important task');
      expect(mockTextElement.setBold).toHaveBeenCalled();
    });

    test('should format priority prefixes', () => {
      const testCases = [
        { priority: 4, expected: '(P1) ' },
        { priority: 3, expected: '(P2) ' },
        { priority: 2, expected: '(P3) ' },
        { priority: 1, expected: '' }
      ];

      testCases.forEach(({ priority, expected }) => {
        const mockTask = {
          content: 'Test task',
          priority: priority,
          labels: [],
          due: null
        };

        if (expected) {
          formatListItem(mockListItem, mockTask);
          expect(mockListItem.appendText).toHaveBeenCalledWith(expected);
        }
      });
    });

    test('should add subtask indentation', () => {
      const mockTask = {
        content: 'Subtask',
        priority: 1,
        labels: [],
        due: null
      };

      formatListItem(mockListItem, mockTask, true);

      expect(mockListItem.setIndentStart).toHaveBeenCalledWith(36);
    });

    test('should format due dates correctly', () => {
      const timedTask = {
        content: 'Timed task',
        priority: 1,
        labels: [],
        due: { datetime: '2024-01-15T14:30:00Z' }
      };

      const allDayTask = {
        content: 'All-day task',
        priority: 1,
        labels: [],
        due: { date: '2024-01-15' }
      };

      formatListItem(mockListItem, timedTask);
      expect(mockListItem.appendText).toHaveBeenCalledWith(expect.stringContaining('Due:'));

      jest.clearAllMocks();

      formatListItem(mockListItem, allDayTask);
      expect(mockListItem.appendText).toHaveBeenCalledWith(expect.stringContaining('Due:'));
    });

    test('should format labels correctly', () => {
      const mockTask = {
        content: 'Task with labels',
        priority: 1,
        labels: ['urgent', 'work', 'important'],
        due: null
      };

      formatListItem(mockListItem, mockTask);

      expect(mockListItem.appendText).toHaveBeenCalledWith(' [urgent, work, important]');
    });

    test('should handle empty labels array', () => {
      const mockTask = {
        content: 'Task without labels',
        priority: 1,
        labels: [],
        due: null
      };

      formatListItem(mockListItem, mockTask);

      // Should not append labels suffix
      expect(mockListItem.appendText).not.toHaveBeenCalledWith(expect.stringContaining('['));
    });

    test('should handle null labels', () => {
      const mockTask = {
        content: 'Task with null labels',
        priority: 1,
        labels: null,
        due: null
      };

      expect(() => formatListItem(mockListItem, mockTask)).not.toThrow();
    });

    test('should process Markdown links', () => {
      mockTextElement.getText.mockReturnValue('Visit [example](https://example.com)');
      
      const mockTask = {
        content: 'Visit [example](https://example.com)',
        priority: 1,
        labels: [],
        due: null
      };

      formatListItem(mockListItem, mockTask);

      expect(mockTextElement.deleteText).toHaveBeenCalled();
      expect(mockTextElement.insertText).toHaveBeenCalled();
      expect(mockTextElement.setLinkUrl).toHaveBeenCalled();
    });

    test('should process Markdown bold text', () => {
      mockTextElement.getText.mockReturnValue('This is **important** text');
      
      const mockTask = {
        content: 'This is **important** text',
        priority: 1,
        labels: [],
        due: null
      };

      formatListItem(mockListItem, mockTask);

      expect(mockTextElement.setBold).toHaveBeenCalled();
      expect(mockTextElement.deleteText).toHaveBeenCalled();
    });

    test('should process Markdown italic text', () => {
      mockTextElement.getText.mockReturnValue('This is *emphasized* text');
      
      const mockTask = {
        content: 'This is *emphasized* text',
        priority: 1,
        labels: [],
        due: null
      };

      formatListItem(mockListItem, mockTask);

      expect(mockTextElement.setItalic).toHaveBeenCalled();
      expect(mockTextElement.deleteText).toHaveBeenCalled();
    });

    test('should handle complex markdown combinations', () => {
      mockTextElement.getText
        .mockReturnValueOnce('Check [website](https://example.com) for **updates**')
        .mockReturnValueOnce('Check website for **updates**')
        .mockReturnValueOnce('Check website for updates');
      
      const mockTask = {
        content: 'Check [website](https://example.com) for **updates**',
        priority: 1,
        labels: [],
        due: null
      };

      formatListItem(mockListItem, mockTask);

      // Should process both links and bold text
      expect(mockTextElement.setLinkUrl).toHaveBeenCalled();
      expect(mockTextElement.setBold).toHaveBeenCalled();
    });
  });

  describe('Edge Cases and Error Handling', () => {
    test('should handle tasks with missing required fields', () => {
      const malformedTasks = [
        { id: '123' }, // missing content
        { content: 'Task without ID' }, // missing id
        { id: '124', content: 'Task', project_id: null } // null project_id
      ];

      expect(() => buildPlainTextForTasks(malformedTasks, [])).not.toThrow();
    });

    test('should handle invalid date formats gracefully', () => {
      const mockTasks = [
        {
          id: '123',
          content: 'Task with invalid date',
          project_id: '456',
          priority: 1,
          labels: [],
          subtasks: [],
          due: { date: 'invalid-date' }
        }
      ];

      expect(() => buildPlainTextForTasks(mockTasks, [])).not.toThrow();
    });

    test('should handle very large task lists', () => {
      const largeTasks = Array.from({ length: 1000 }, (_, i) => ({
        id: `${i}`,
        content: `Task ${i}`,
        project_id: 'project1',
        priority: 1,
        labels: [],
        subtasks: []
      }));

      const result = buildPlainTextForTasks(largeTasks, [{ id: 'project1', name: 'Project' }]);

      expect(result).toContain('Total tasks: 1000');
      expect(result.split('\n')).toHaveLength(expect.any(Number));
    });
  });
});