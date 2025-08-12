/**
 * Test Data Fixtures
 * Comprehensive test data for various scenarios and edge cases
 */

// Basic task templates
const baseTask = {
  id: '123',
  content: 'Basic task',
  description: '',
  due: null,
  priority: 1,
  labels: [],
  project_id: 'inbox',
  created_at: '2024-01-01T10:00:00Z',
  comment_count: 0,
  subtasks: []
};

const baseProject = {
  id: 'project1',
  name: 'Test Project',
  color: 'blue',
  order: 1,
  shared: false,
  favorite: false
};

// Comprehensive test datasets
const testData = {
  // Empty datasets
  empty: {
    tasks: [],
    projects: []
  },

  // Minimal dataset
  minimal: {
    tasks: [
      {
        ...baseTask,
        id: '1',
        content: 'Simple task'
      }
    ],
    projects: [
      {
        ...baseProject,
        id: 'inbox',
        name: 'Inbox'
      }
    ]
  },

  // Complex realistic dataset
  realistic: {
    tasks: [
      {
        id: '2995104339',
        content: 'Complete quarterly report **urgently**',
        description: 'Include Q4 metrics\nAdd performance analysis\nReview with team before Friday',
        due: { datetime: '2024-01-15T17:00:00Z' },
        priority: 4,
        labels: ['work', 'urgent', 'quarterly'],
        project_id: '2203306141',
        created_at: '2024-01-01T10:00:00Z',
        comment_count: 5,
        subtasks: [
          {
            id: '2995104340',
            content: 'Gather Q4 financial data from *all departments*',
            description: 'Contact finance team\nRequest budget reports',
            priority: 3,
            labels: ['data', 'finance'],
            due: { date: '2024-01-14' },
            created_at: '2024-01-02T09:00:00Z',
            comment_count: 2
          },
          {
            id: '2995104341',
            content: 'Create data visualizations',
            description: '',
            priority: 2,
            labels: ['design'],
            due: { datetime: '2024-01-14T16:00:00Z' },
            created_at: '2024-01-02T09:30:00Z',
            comment_count: 0
          },
          {
            id: '2995104342',
            content: 'Review draft with [team lead](mailto:lead@company.com)',
            description: 'Schedule 30min review session',
            priority: 3,
            labels: ['review'],
            due: { date: '2024-01-15' },
            created_at: '2024-01-02T10:00:00Z',
            comment_count: 1
          }
        ]
      },
      {
        id: '2995104343',
        content: 'Plan team building event',
        description: 'Research venues\nGet quotes\nSend calendar invites',
        due: { date: '2024-01-20' },
        priority: 2,
        labels: ['team', 'event'],
        project_id: '2203306142',
        created_at: '2024-01-03T14:00:00Z',
        comment_count: 3,
        subtasks: []
      },
      {
        id: '2995104344',
        content: 'Buy groceries 🛒',
        description: 'Milk (2%)\nBread (whole wheat)\nEggs (dozen)\nApples',
        due: { date: '2024-01-16' },
        priority: 1,
        labels: [],
        project_id: 'inbox',
        created_at: '2024-01-05T08:00:00Z',
        comment_count: 0,
        subtasks: []
      },
      {
        id: '2995104345',
        content: 'Schedule dentist appointment',
        description: '',
        due: null,
        priority: 1,
        labels: ['health'],
        project_id: '2203306143',
        created_at: '2024-01-06T12:00:00Z',
        comment_count: 0,
        subtasks: []
      }
    ],
    projects: [
      {
        id: '2203306141',
        name: 'Work Projects',
        color: 'blue',
        order: 1,
        shared: true,
        favorite: true
      },
      {
        id: '2203306142',
        name: 'Team Management',
        color: 'green',
        order: 2,
        shared: false,
        favorite: false
      },
      {
        id: '2203306143',
        name: 'Personal',
        color: 'red',
        order: 3,
        shared: false,
        favorite: true
      }
    ]
  },

  // Edge cases and special scenarios
  edgeCases: {
    tasks: [
      {
        id: '1',
        content: 'Task with "quotes" and special chars: @#$%^&*()',
        description: 'Description with\nmultiple\n\nlines\n\nand empty lines',
        due: { date: '2024-01-15' },
        priority: 4,
        labels: ['special-chars', 'test'],
        project_id: 'project1',
        created_at: '2024-01-01T00:00:00Z',
        comment_count: 999,
        subtasks: []
      },
      {
        id: '2',
        content: 'Task with émojis 🚀 and unicode ñáéíóú',
        description: 'Supports émojis: 🎉🔥💯\nAnd unicode: café, niño, naïve',
        due: { datetime: '2024-01-15T23:59:59Z' },
        priority: 1,
        labels: ['unicode', 'émojis'],
        project_id: 'project1',
        created_at: '2024-01-01T12:30:45Z',
        comment_count: 0,
        subtasks: []
      },
      {
        id: '3',
        content: 'Very **long** task with *lots* of [markdown](https://example.com) and multiple **bold** sections and *italic* text',
        description: 'This is a very long description that contains multiple lines and various formatting elements including **bold text**, *italic text*, and [links](https://example.com). It also has special characters like @mentions and #hashtags.',
        due: null,
        priority: 2,
        labels: ['markdown', 'formatting', 'long-content'],
        project_id: 'project1',
        created_at: '2024-01-01T06:15:30Z',
        comment_count: 42,
        subtasks: [
          {
            id: '3-1',
            content: 'Subtask with **markdown** and [links](https://sub.example.com)',
            description: 'Subtask description with *formatting*',
            priority: 4,
            labels: ['sub', 'markdown'],
            due: { datetime: '2024-01-14T09:00:00Z' },
            created_at: '2024-01-02T08:00:00Z',
            comment_count: 7
          }
        ]
      },
      {
        id: '4',
        content: 'Task without description',
        description: null,
        due: { date: '2024-01-15' },
        priority: 3,
        labels: null,
        project_id: null,
        created_at: '2024-01-01T18:45:00Z',
        comment_count: null,
        subtasks: null
      }
    ],
    projects: [
      {
        id: 'project1',
        name: 'Project with special chars: @#$%',
        color: 'purple',
        order: 1,
        shared: true,
        favorite: false
      }
    ]
  },

  // Large dataset for performance testing
  large: {
    tasks: generateLargeTasks(100),
    projects: generateLargeProjects(20)
  },

  // Malformed data for error testing
  malformed: {
    tasks: [
      {
        id: '1'
        // Missing required fields
      },
      {
        content: 'Task without ID',
        project_id: 'missing-project'
      },
      {
        id: '3',
        content: 'Task with invalid due date',
        due: { date: 'invalid-date' },
        priority: 'invalid-priority',
        labels: 'not-an-array',
        created_at: 'invalid-timestamp'
      }
    ],
    projects: [
      {
        id: 'project1'
        // Missing name
      },
      {
        name: 'Project without ID'
      }
    ]
  }
};

// API response templates
const apiResponses = {
  successfulTasksResponse: {
    getContentText: () => JSON.stringify(testData.realistic.tasks.map(t => {
      const { subtasks, ...task } = t;
      return task;
    }))
  },

  successfulProjectsResponse: {
    getContentText: () => JSON.stringify(testData.realistic.projects)
  },

  emptyTasksResponse: {
    getContentText: () => JSON.stringify([])
  },

  emptyProjectsResponse: {
    getContentText: () => JSON.stringify([])
  },

  malformedJsonResponse: {
    getContentText: () => 'invalid json {'
  },

  errorResponse: {
    getContentText: () => JSON.stringify({ error: 'Unauthorized' }),
    getResponseCode: () => 401
  },

  subtasksResponse: (parentId) => ({
    getContentText: () => {
      const parent = testData.realistic.tasks.find(t => t.id === parentId);
      return JSON.stringify(parent ? parent.subtasks : []);
    }
  })
};

// Configuration scenarios
const configurations = {
  fullConfig: {
    'TODOIST_TOKEN': 'test-token-12345',
    'DOC_ID': 'https://docs.google.com/document/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit',
    'TEXT_FILE_ID': 'https://drive.google.com/file/d/1AbCdEFghIJklMNopQRstuVWxyz123456/view',
    'JSON_FILE_ID': 'https://drive.google.com/file/d/1XyZabcDEFghIJklMNopQRstuVWxyz789/view',
    'TIMEZONE': 'America/Chicago',
    'DEBUG': 'false'
  },

  docOnlyConfig: {
    'TODOIST_TOKEN': 'test-token-12345',
    'DOC_ID': '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms',
    'TIMEZONE': 'Europe/London'
  },

  textOnlyConfig: {
    'TODOIST_TOKEN': 'test-token-12345',
    'TEXT_FILE_ID': '1AbCdEFghIJklMNopQRstuVWxyz123456',
    'TIMEZONE': 'Asia/Tokyo'
  },

  jsonOnlyConfig: {
    'TODOIST_TOKEN': 'test-token-12345',
    'JSON_FILE_ID': '1XyZabcDEFghIJklMNopQRstuVWxyz789/view',
    'TIMEZONE': 'Australia/Sydney'
  },

  debugConfig: {
    'TODOIST_TOKEN': 'test-token-12345',
    'DOC_ID': 'doc123',
    'DEBUG': 'true',
    'TIMEZONE': 'UTC'
  },

  missingTokenConfig: {
    'DOC_ID': 'doc123',
    'TIMEZONE': 'America/New_York'
  },

  noTargetsConfig: {
    'TODOIST_TOKEN': 'test-token-12345',
    'TIMEZONE': 'America/Los_Angeles'
  }
};

// Helper functions
function generateLargeTasks(count) {
  return Array.from({ length: count }, (_, i) => ({
    id: `task-${i}`,
    content: `Generated task ${i + 1}`,
    description: i % 5 === 0 ? `Description for task ${i + 1}` : '',
    due: i % 3 === 0 ? { date: `2024-01-${15 + (i % 16)}` } : null,
    priority: (i % 4) + 1,
    labels: i % 4 === 0 ? [`label-${i % 10}`] : [],
    project_id: i % 7 === 0 ? 'inbox' : `project-${(i % 5) + 1}`,
    created_at: `2024-01-0${(i % 9) + 1}T${String(i % 24).padStart(2, '0')}:00:00Z`,
    comment_count: i % 8,
    subtasks: i % 20 === 0 ? [
      {
        id: `task-${i}-sub-1`,
        content: `Subtask for task ${i + 1}`,
        priority: ((i + 1) % 4) + 1,
        labels: [`sub-label-${i % 5}`],
        created_at: `2024-01-0${(i % 9) + 1}T${String((i + 1) % 24).padStart(2, '0')}:00:00Z`,
        comment_count: i % 3
      }
    ] : []
  }));
}

function generateLargeProjects(count) {
  return Array.from({ length: count }, (_, i) => ({
    id: `project-${i + 1}`,
    name: `Generated Project ${i + 1}`,
    color: ['red', 'blue', 'green', 'yellow', 'purple'][i % 5],
    order: i + 1,
    shared: i % 3 === 0,
    favorite: i % 5 === 0
  }));
}

// Export all test data
module.exports = {
  testData,
  apiResponses,
  configurations,
  baseTask,
  baseProject,
  generateLargeTasks,
  generateLargeProjects
};