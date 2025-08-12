/**
 * Enhanced Mock implementations for Google Apps Script APIs
 * These mocks allow testing of GAS functions in a Node.js environment with stateful behavior
 */

// Import test data
const { testData, apiResponses, configurations } = require('../fixtures/test-data');

// State management for mocks
const mockState = {
  properties: {
    // Initialize with test environment variables
    ...(global.TEST_ENV || {})
  },
  documents: {},
  files: {},
  apiCallCount: 0,
  errors: {},
  logs: []
};

// Mock Logger with enhanced functionality
global.Logger = {
  log: jest.fn((...args) => {
    const logEntry = args.join(' ');
    mockState.logs.push(logEntry);
    console.log('[Logger.log]', ...args);
  }),
  
  // Utility methods for testing
  getLastLog: () => mockState.logs[mockState.logs.length - 1],
  getAllLogs: () => [...mockState.logs],
  clearLogs: () => { mockState.logs = []; }
};

// Mock console (ensure it exists)
if (typeof console === 'undefined') {
  global.console = {
    log: jest.fn(),
    error: jest.fn(),
    warn: jest.fn()
  };
}

// Enhanced PropertiesService with configurable responses
global.PropertiesService = {
  getScriptProperties: jest.fn(() => ({
    getProperty: jest.fn((key) => {
      return mockState.properties[key] || null;
    }),
    setProperty: jest.fn((key, value) => {
      mockState.properties[key] = value;
    }),
    setProperties: jest.fn((properties) => {
      Object.assign(mockState.properties, properties);
    }),
    deleteProperty: jest.fn((key) => {
      delete mockState.properties[key];
    }),
    getKeys: jest.fn(() => Object.keys(mockState.properties))
  })),
  
  // Test utilities
  setMockProperties: (properties) => {
    mockState.properties = { ...properties };
  },
  clearProperties: () => {
    mockState.properties = {};
  },
  getMockProperties: () => ({ ...mockState.properties })
};

// Enhanced UrlFetchApp with realistic API simulation
global.UrlFetchApp = {
  fetch: jest.fn((url, params) => {
    mockState.apiCallCount++;
    
    // Check for error injection
    if (mockState.errors.apiError) {
      throw new Error(mockState.errors.apiError);
    }
    
    // Simulate rate limiting
    if (mockState.errors.rateLimitAfter && mockState.apiCallCount > mockState.errors.rateLimitAfter) {
      throw new Error('Too many requests');
    }
    
    // Return appropriate response based on URL
    let responseData = '[]';
    let responseCode = 200;
    
    if (url.includes('/tasks?filter=')) {
      // Main tasks endpoint
      responseData = JSON.stringify(mockState.testTasks || testData.realistic.tasks.map(t => {
        const { subtasks, ...task } = t;
        return task;
      }));
    } else if (url.includes('/tasks?parent_id=')) {
      // Subtasks endpoint
      const parentIdMatch = url.match(/parent_id=([^&]+)/);
      if (parentIdMatch) {
        const parentId = parentIdMatch[1];
        const parent = (mockState.testTasks || testData.realistic.tasks).find(t => t.id === parentId);
        responseData = JSON.stringify(parent ? parent.subtasks || [] : []);
      }
    } else if (url.includes('/projects')) {
      // Projects endpoint
      responseData = JSON.stringify(mockState.testProjects || testData.realistic.projects);
    }
    
    // Handle malformed response injection
    if (mockState.errors.malformedResponse) {
      responseData = 'invalid json {';
    }
    
    // Handle HTTP error codes
    if (mockState.errors.httpError) {
      responseCode = mockState.errors.httpError;
      responseData = JSON.stringify({ error: 'API Error' });
    }
    
    return {
      getContentText: jest.fn(() => responseData),
      getResponseCode: jest.fn(() => responseCode)
    };
  }),
  
  // Test utilities
  setMockData: (tasks, projects) => {
    mockState.testTasks = tasks;
    mockState.testProjects = projects;
  },
  injectError: (errorType, errorValue) => {
    mockState.errors[errorType] = errorValue;
  },
  clearErrors: () => {
    mockState.errors = {};
  },
  getCallCount: () => mockState.apiCallCount,
  resetCallCount: () => {
    mockState.apiCallCount = 0;
  }
};

// Enhanced DocumentApp with document state tracking
global.DocumentApp = {
  openById: jest.fn((id) => {
    // Check for error injection
    if (mockState.errors.documentError) {
      throw new Error(mockState.errors.documentError);
    }
    
    // Initialize document state if not exists
    if (!mockState.documents[id]) {
      mockState.documents[id] = {
        content: '',
        paragraphs: [],
        listItems: []
      };
    }
    
    const doc = mockState.documents[id];
    
    return {
      getBody: jest.fn(() => ({
        setText: jest.fn((text) => {
          doc.content = text;
          doc.paragraphs = [];
          doc.listItems = [];
        }),
        appendParagraph: jest.fn((text) => {
          const paragraph = { text, heading: null, italic: false };
          doc.paragraphs.push(paragraph);
          return {
            setHeading: jest.fn((heading) => {
              paragraph.heading = heading;
              return paragraph;
            }),
            setItalic: jest.fn((italic) => {
              paragraph.italic = italic;
              return paragraph;
            })
          };
        }),
        appendListItem: jest.fn((text) => {
          const listItem = {
            text: text || '',
            indentStart: 0,
            textElements: []
          };
          doc.listItems.push(listItem);
          
          return {
            appendText: jest.fn((appendedText) => {
              listItem.text += appendedText;
            }),
            editAsText: jest.fn(() => ({
              getText: jest.fn(() => listItem.text),
              setBold: jest.fn((start, end, bold) => {
                listItem.textElements.push({ type: 'bold', start, end, value: bold });
              }),
              setItalic: jest.fn((start, end, italic) => {
                listItem.textElements.push({ type: 'italic', start, end, value: italic });
              }),
              setLinkUrl: jest.fn((start, end, url) => {
                listItem.textElements.push({ type: 'link', start, end, url });
              }),
              deleteText: jest.fn((start, end) => {
                listItem.textElements.push({ type: 'delete', start, end });
              }),
              insertText: jest.fn((index, text) => {
                listItem.textElements.push({ type: 'insert', index, text });
              })
            })),
            setIndentStart: jest.fn((indent) => {
              listItem.indentStart = indent;
            }),
            getText: jest.fn(() => listItem.text)
          };
        })
      }))
    };
  }),
  
  ParagraphHeading: {
    HEADING1: 'HEADING1',
    HEADING2: 'HEADING2',
    HEADING3: 'HEADING3'
  },
  
  // Test utilities
  getDocumentState: (id) => mockState.documents[id] || null,
  clearDocuments: () => {
    mockState.documents = {};
  },
  injectDocumentError: (error) => {
    mockState.errors.documentError = error;
  }
};

// Enhanced DriveApp with file state tracking
global.DriveApp = {
  getFileById: jest.fn((id) => {
    // Check for error injection
    if (mockState.errors.driveError) {
      throw new Error(mockState.errors.driveError);
    }
    
    // Initialize file state if not exists
    if (!mockState.files[id]) {
      mockState.files[id] = {
        content: '',
        lastModified: new Date()
      };
    }
    
    const file = mockState.files[id];
    
    return {
      setContent: jest.fn((content) => {
        if (mockState.errors.fileWriteError) {
          throw new Error(mockState.errors.fileWriteError);
        }
        file.content = content;
        file.lastModified = new Date();
      }),
      getContent: jest.fn(() => file.content),
      getLastModified: jest.fn(() => file.lastModified)
    };
  }),
  
  // Test utilities
  getFileState: (id) => mockState.files[id] || null,
  clearFiles: () => {
    mockState.files = {};
  },
  injectDriveError: (error) => {
    mockState.errors.driveError = error;
  },
  injectFileWriteError: (error) => {
    mockState.errors.fileWriteError = error;
  }
};

// Enhanced Utilities with realistic date formatting
global.Utilities = {
  formatDate: jest.fn((date, timezone, format) => {
    try {
      const d = new Date(date);
      
      // Handle different format patterns
      if (format.includes("MMM d, yyyy 'at' h:mm a")) {
        return d.toLocaleString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
          hour: 'numeric',
          minute: '2-digit',
          hour12: true,
          timeZone: timezone
        });
      } else if (format.includes('MMM d, yyyy')) {
        return d.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
          timeZone: timezone
        });
      } else if (format.includes('MMM d')) {
        return d.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          timeZone: timezone
        });
      }
      
      // Default formatting
      return d.toLocaleDateString('en-US', { timeZone: timezone });
    } catch (e) {
      return 'Invalid Date';
    }
  }),
  
  // Test utilities
  resetFormatDateMock: () => {
    global.Utilities.formatDate.mockClear();
  }
};

// Global test utilities
global.MockUtils = {
  // Reset all mock state
  resetAll: () => {
    // Reset to default test environment properties
    mockState.properties = {
      ...(global.TEST_ENV || {})
    };
    mockState.documents = {};
    mockState.files = {};
    mockState.apiCallCount = 0;
    mockState.errors = {};
    mockState.logs = [];
    mockState.testTasks = null;
    mockState.testProjects = null;
    
    // Clear all jest mocks
    jest.clearAllMocks();
  },
  
  // Setup realistic test scenario
  setupRealisticScenario: () => {
    PropertiesService.setMockProperties(configurations.fullConfig);
    UrlFetchApp.setMockData(testData.realistic.tasks, testData.realistic.projects);
  },
  
  // Setup edge case scenario
  setupEdgeCaseScenario: () => {
    PropertiesService.setMockProperties(configurations.fullConfig);
    UrlFetchApp.setMockData(testData.edgeCases.tasks, testData.edgeCases.projects);
  },
  
  // Setup error scenario
  setupErrorScenario: (errorType, errorValue) => {
    UrlFetchApp.injectError(errorType, errorValue);
  },
  
  // Get current state for assertions
  getState: () => ({
    properties: { ...mockState.properties },
    documents: { ...mockState.documents },
    files: { ...mockState.files },
    apiCallCount: mockState.apiCallCount,
    errors: { ...mockState.errors },
    logs: [...mockState.logs]
  })
};

module.exports = {
  Logger: global.Logger,
  PropertiesService: global.PropertiesService,
  UrlFetchApp: global.UrlFetchApp,
  DocumentApp: global.DocumentApp,
  DriveApp: global.DriveApp,
  Utilities: global.Utilities,
  MockUtils: global.MockUtils
};