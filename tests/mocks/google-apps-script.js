/**
 * Mock implementations for Google Apps Script APIs
 * These mocks allow testing of GAS functions in a Node.js environment
 */

// Mock Logger
global.Logger = {
  log: jest.fn((...args) => {
    console.log('[Logger.log]', ...args);
  })
};

// Mock console (ensure it exists)
if (typeof console === 'undefined') {
  global.console = {
    log: jest.fn(),
    error: jest.fn(),
    warn: jest.fn()
  };
}

// Mock PropertiesService
global.PropertiesService = {
  getScriptProperties: jest.fn(() => ({
    getProperty: jest.fn((key) => {
      // Default mock values for testing
      const mockProperties = {
        'TODOIST_TOKEN': 'mock-token-12345',
        'TIMEZONE': 'America/Chicago',
        'DEBUG': 'false'
      };
      return mockProperties[key] || null;
    }),
    setProperty: jest.fn(),
    setProperties: jest.fn()
  }))
};

// Mock UrlFetchApp
global.UrlFetchApp = {
  fetch: jest.fn((url, params) => ({
    getContentText: jest.fn(() => {
      // Return mock API responses based on URL
      if (url.includes('/tasks')) {
        return JSON.stringify([
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
        ]);
      }
      if (url.includes('/projects')) {
        return JSON.stringify([
          { id: '456', name: 'Test Project' }
        ]);
      }
      return '[]';
    }),
    getResponseCode: jest.fn(() => 200)
  }))
};

// Mock DocumentApp
global.DocumentApp = {
  openById: jest.fn((id) => ({
    getBody: jest.fn(() => ({
      setText: jest.fn(),
      appendParagraph: jest.fn((text) => ({
        setHeading: jest.fn(),
        setItalic: jest.fn()
      })),
      appendListItem: jest.fn((text) => ({
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
    }))
  })),
  ParagraphHeading: {
    HEADING1: 'HEADING1',
    HEADING2: 'HEADING2'
  }
};

// Mock DriveApp
global.DriveApp = {
  getFileById: jest.fn((id) => ({
    setContent: jest.fn(),
    getContent: jest.fn(() => 'mock file content')
  }))
};

// Mock Utilities
global.Utilities = {
  formatDate: jest.fn((date, timezone, format) => {
    return new Date(date).toLocaleDateString();
  })
};

module.exports = {
  Logger: global.Logger,
  PropertiesService: global.PropertiesService,
  UrlFetchApp: global.UrlFetchApp,
  DocumentApp: global.DocumentApp,
  DriveApp: global.DriveApp,
  Utilities: global.Utilities
};