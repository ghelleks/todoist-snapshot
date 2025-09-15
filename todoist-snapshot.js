/**
 * Todoist Snapshot - Google Apps Script
 * 
 * @fileoverview Exports Todoist tasks to Google Docs, plain text files, or JSON
 * @version 1.0.0
 * @author Gunnar Hellekson
 * @license MIT
 * 
 * Features:
 * - Export tasks to Google Docs with rich formatting
 * - Export tasks to plain text files with blockquote descriptions
 * - Export raw JSON data for analysis/backup
 * - Support for sub-tasks with hierarchical display
 * - Configurable via Script properties
 * 
 *  Configuration:
 *
 *     Configuration is managed via Script properties
 *        (Project settings → Script properties).
 *
 * - TODOIST_TOKEN: Required Todoist API token
 * - DOC_ID: Optional Google Doc URL/ID for formatted export
 * - TEXT_FILE_ID: Optional text file URL/ID for plain text export
 * - JSON_FILE_ID: Optional JSON file URL/ID for raw data export
 * - TIMEZONE: Optional timezone (default: America/Chicago)
 * - DEBUG: Optional debug flag (set to "true" to enable debug logging)
 * 
 * Usage:
 * - Run syncTodoist() to export to all configured targets
 * - Run individual functions for specific exports
 */

// Debug flag - dynamically checked to enable detailed logging
function isDebugEnabled() {
  return PropertiesService.getScriptProperties().getProperty('DEBUG') === 'true';
}


/**
 * Unified sync function. Checks configured targets and performs the appropriate sync(s).
 * If both DOC_ID and TEXT_FILE_ID are set, it fetches once and updates both outputs.
 */
function syncTodoist() {
  const properties = PropertiesService.getScriptProperties();
  const hasDoc = !!properties.getProperty('DOC_ID');
  const hasText = !!properties.getProperty('TEXT_FILE_ID');
  const hasJson = !!properties.getProperty('JSON_FILE_ID');

  if (!hasDoc && !hasText && !hasJson) {
    throw new Error('No output targets configured. Set DOC_ID, TEXT_FILE_ID, and/or JSON_FILE_ID in Script properties.');
  }

  Logger.log('🚀 Starting Todoist sync...');
  if (isDebugEnabled()) {
    Logger.log('Targets: Doc=' + hasDoc + ', Text=' + hasText + ', JSON=' + hasJson);
  }

  // Count the number of configured targets
  const targetCount = [hasDoc, hasText, hasJson].filter(Boolean).length;

  // If multiple targets are set, fetch once and update all
  if (targetCount > 1) {
    const data = getTodoistData();
    if (hasDoc) syncTodoistToDoc(data);
    if (hasText) syncTodoistToTextFile(data);
    if (hasJson) syncTodoistToJsonFile(data);
  } else {
    // Single target - let each function fetch its own data
    if (hasDoc) syncTodoistToDoc();
    if (hasText) syncTodoistToTextFile();
    if (hasJson) syncTodoistToJsonFile();
  }

  Logger.log('✅ Todoist sync completed successfully');
}

function getTodoistToken() {
  const token = PropertiesService.getScriptProperties().getProperty('TODOIST_TOKEN');
  if (!token) {
    throw new Error('TODOIST_TOKEN is not configured. Set it in Project settings → Script properties.');
  }
  return token;
}

function getDocId() {
  const raw = PropertiesService.getScriptProperties().getProperty('DOC_ID');
  if (!raw) {
    throw new Error('DOC_ID is not configured. Set a Google Doc sharing URL in Script properties, or configure TEXT_FILE_ID instead.');
  }
  return extractDriveIdFromInput(raw);
}

function getTextFileId() {
  const raw = PropertiesService.getScriptProperties().getProperty('TEXT_FILE_ID');
  if (!raw) {
    throw new Error('TEXT_FILE_ID is not configured. Set a Drive file sharing URL in Script properties, or configure DOC_ID instead.');
  }
  return extractDriveIdFromInput(raw);
}

function getJsonFileId() {
  const raw = PropertiesService.getScriptProperties().getProperty('JSON_FILE_ID');
  if (!raw) {
    throw new Error('JSON_FILE_ID is not configured. Set a Drive file sharing URL in Script properties.');
  }
  return extractDriveIdFromInput(raw);
}

function getTimezone() {
  const timezone = PropertiesService.getScriptProperties().getProperty('TIMEZONE');
  return timezone || 'America/Chicago';
}

function extractDriveIdFromInput(input) {
  const trimmed = (input || '').trim();
  if (!trimmed) {
    throw new Error('Empty ID/URL provided.');
  }
  if (!/^https?:\/\//i.test(trimmed)) {
    return trimmed; // already an ID
  }
  if (/\/folders\//i.test(trimmed)) {
    throw new Error('The provided link appears to be a folder. Please provide a file or document link.');
  }
  var match = trimmed.match(/\/[du]\/([a-zA-Z0-9_-]{10,})\b/);
  if (match && match[1]) return match[1];
  match = trimmed.match(/\/file\/d\/([a-zA-Z0-9_-]{10,})\b/);
  if (match && match[1]) return match[1];
  match = trimmed.match(/[?&]id=([a-zA-Z0-9_-]{10,})/);
  if (match && match[1]) return match[1];
  throw new Error('Unable to extract a file ID from the provided URL. Provide a direct file/document link.');
}

/**
 * The main function to be run by the trigger.
 * It fetches data from Todoist and writes it to a Google Doc.
 * @param {{tasks: Array, projects: Array}=} preFetchedData Optional pre-fetched data to avoid duplicate API calls
 */
function syncTodoistToDoc(preFetchedData) {
  try {
    const todoistData = preFetchedData || getTodoistData();
    writeTasksToDoc(todoistData.tasks, todoistData.projects);
    Logger.log('✅ Successfully synced tasks to Google Doc');
  } catch (e) {
    Logger.log('❌ Failed to sync tasks to Google Doc: ' + e.toString());
    if (isDebugEnabled()) {
      Logger.log(e.stack);
    }
  }
}

/**
 * The main function to sync to a plain text file in Drive instead of a Google Doc.
 * @param {{tasks: Array, projects: Array}=} preFetchedData Optional pre-fetched data to avoid duplicate API calls
 */
function syncTodoistToTextFile(preFetchedData) {
  try {
    Logger.log('DEBUG: syncTodoistToTextFile() started');
    const todoistData = preFetchedData || getTodoistData();
    Logger.log('DEBUG: Got ' + todoistData.tasks.length + ' tasks from Todoist');
    writeTasksToTextFile(todoistData.tasks, todoistData.projects);
    Logger.log('✅ Successfully synced tasks to text file');
  } catch (e) {
    Logger.log('❌ Failed to sync tasks to text file: ' + e.toString());
    if (isDebugEnabled()) {
      Logger.log(e.stack);
    }
  }
}

/**
 * The main function to sync raw Todoist JSON data to a file in Drive.
 * @param {{tasks: Array, projects: Array}=} preFetchedData Optional pre-fetched data to avoid duplicate API calls
 */
function syncTodoistToJsonFile(preFetchedData) {
  try {
    const todoistData = preFetchedData || getTodoistData();
    writeTasksToJsonFile(todoistData.rawTasks, todoistData.projects);
    Logger.log('✅ Successfully synced tasks to JSON file');
  } catch (e) {
    Logger.log('❌ Failed to sync tasks to JSON file: ' + e.toString());
    if (isDebugEnabled()) {
      Logger.log(e.stack);
    }
  }
}


/**
 * Fetches tasks and projects from the Todoist API.
 * @returns {Object} An object containing arrays of tasks and projects.
 */
function getTodoistData() {
  Logger.log('DEBUG: getTodoistData() started');

  // Set up API request parameters
  Logger.log('DEBUG: Getting Todoist token...');
  const token = getTodoistToken();
  Logger.log('DEBUG: Token retrieved successfully');

  const params = {
    'method': 'get',
    'headers': {
      'Authorization': 'Bearer ' + token
    },
    'muteHttpExceptions': true
  };
  Logger.log('DEBUG: Request parameters set up');

  try {
    // Use the v2 tasks endpoint without filter to get all tasks
    // We'll filter them in the code instead of using the API filter
    const taskUrl = 'https://api.todoist.com/rest/v2/tasks';
    Logger.log('DEBUG: Calling tasks URL: ' + taskUrl);
    const taskResponse = UrlFetchApp.fetch(taskUrl, params);

    // Validate HTTP status code before parsing JSON
    if (taskResponse.getResponseCode() !== 200) {
      throw new Error('Failed to fetch tasks from Todoist API. Status: ' + taskResponse.getResponseCode() + ', Response: ' + taskResponse.getContentText());
    }

    // Validate response content looks like JSON
    const taskContent = taskResponse.getContentText();
    if (!taskContent.trim().startsWith('[') && !taskContent.trim().startsWith('{')) {
      throw new Error('Invalid JSON response from Todoist tasks API. Response content: ' + taskContent.substring(0, 200));
    }

    const rawTasks = JSON.parse(taskContent);
    Logger.log('DEBUG: Total tasks fetched: ' + rawTasks.length);

    // Filter tasks to those due within the next 7 days
    const now = new Date();
    const sevenDaysFromNow = new Date(now.getTime() + (7 * 24 * 60 * 60 * 1000));

    const filteredTasks = rawTasks.filter(task => {
      if (!task.due) return false; // Skip tasks with no due date

      let taskDueDate;
      if (task.due.datetime) {
        taskDueDate = new Date(task.due.datetime);
      } else if (task.due.date) {
        // Parse date in YYYY-MM-DD format
        const dateParts = task.due.date.split('-');
        taskDueDate = new Date(dateParts[0], dateParts[1] - 1, dateParts[2]);
      } else {
        return false;
      }

      // Include overdue tasks and tasks due within 7 days
      return taskDueDate <= sevenDaysFromNow;
    });

    Logger.log('DEBUG: Filtered to ' + filteredTasks.length + ' tasks due within 7 days');

    // For each task, fetch its sub-tasks and group them
    const sortedTasks = fetchTasksWithSubtasks(filteredTasks, params);

    // Fetch all projects
    const projectUrl = 'https://api.todoist.com/rest/v2/projects';
    Logger.log('DEBUG: Calling projects URL: ' + projectUrl);
    const projectResponse = UrlFetchApp.fetch(projectUrl, params);

    // Validate HTTP status code before parsing JSON
    if (projectResponse.getResponseCode() !== 200) {
      throw new Error('Failed to fetch projects from Todoist API. Status: ' + projectResponse.getResponseCode() + ', Response: ' + projectResponse.getContentText());
    }

    // Validate response content looks like JSON
    const projectContent = projectResponse.getContentText();
    if (!projectContent.trim().startsWith('[') && !projectContent.trim().startsWith('{')) {
      throw new Error('Invalid JSON response from Todoist projects API. Response content: ' + projectContent.substring(0, 200));
    }

    const projects = JSON.parse(projectContent);

    return { tasks: sortedTasks, rawTasks: filteredTasks, projects };
  } catch (error) {
    // Re-throw with additional context for debugging
    if (error.message.includes('JSON.parse')) {
      throw new Error('JSON parsing error in Todoist API response. This usually indicates an invalid API token or API rate limiting. Original error: ' + error.message);
    }
    throw error;
  }
}

/**
 * Fetches sub-tasks for each task and groups them together.
 * @param {Array} tasks - Array of task objects from Todoist API
 * @param {Object} params - API request parameters
 * @returns {Array} Array with sub-tasks grouped under their parents
 */
function fetchTasksWithSubtasks(tasks, params) {
  if (isDebugEnabled()) {
    Logger.log('=== FETCH SUBTASKS DEBUG ===');
    Logger.log('Total tasks to process: ' + tasks.length);
  }
  
  const result = [];
  
  // For each task, fetch its sub-tasks
  for (let i = 0; i < tasks.length; i++) {
    const task = tasks[i];
    if (isDebugEnabled()) {
      Logger.log('Processing task ' + (i+1) + ': ' + task.content);
    }
    
    // Fetch sub-tasks for this task
    const subTaskUrl = 'https://api.todoist.com/rest/v2/tasks?parent_id=' + task.id;
    try {
      if (isDebugEnabled()) {
        Logger.log('DEBUG: Calling subtasks URL: ' + subTaskUrl);
      }
      const subTaskResponse = UrlFetchApp.fetch(subTaskUrl, params);

      // Validate HTTP status code before parsing JSON
      if (subTaskResponse.getResponseCode() !== 200) {
        throw new Error('Failed to fetch sub-tasks for task ' + task.id + '. Status: ' + subTaskResponse.getResponseCode() + ', Response: ' + subTaskResponse.getContentText());
      }

      // Validate response content looks like JSON
      const subTaskContent = subTaskResponse.getContentText();
      if (!subTaskContent.trim().startsWith('[') && !subTaskContent.trim().startsWith('{')) {
        throw new Error('Invalid JSON response from Todoist sub-tasks API for task ' + task.id + '. Response content: ' + subTaskContent.substring(0, 200));
      }

      const subTasks = JSON.parse(subTaskContent);
      
      if (subTasks && subTasks.length > 0) {
        if (isDebugEnabled()) {
          Logger.log('Found ' + subTasks.length + ' sub-tasks for task: ' + task.content);
        }
        task.subtasks = subTasks;
      } else {
        task.subtasks = [];
      }
    } catch (error) {
      if (isDebugEnabled()) {
        Logger.log('Error fetching sub-tasks for task ' + task.id + ': ' + error.toString());
      }
      task.subtasks = [];
    }
    
    result.push(task);
  }
  
  if (isDebugEnabled()) {
    Logger.log('Final result: ' + result.length + ' tasks with sub-tasks attached');
  }
  return result;
}

/**
 * Clears a Google Doc and writes a grouped, formatted list of tasks.
 * @param {Array} tasks - An array of task objects from Todoist.
 * @param {Array} projects - An array of project objects from Todoist.
 */
function writeTasksToDoc(tasks, projects) {
  const doc = DocumentApp.openById(getDocId());
  const body = doc.getBody();
  body.setText('');
  
  const title = 'Todoist Tasks for ' + new Date().toLocaleDateString();
  body.appendParagraph(title).setHeading(DocumentApp.ParagraphHeading.HEADING1);

  // Add metadata header
  const metadata = [];
  metadata.push(`Export date: ${new Date().toLocaleString()}`);
  metadata.push(`Timezone: ${getTimezone()}`);
  metadata.push(`Total tasks: ${tasks.length}`);
  metadata.push(`Total projects: ${projects.length}`);
  
  // Calculate task statistics
  let tasksWithLabels = 0;
  let tasksWithComments = 0;
  let subtaskCount = 0;
  tasks.forEach(task => {
    if (task.labels && task.labels.length > 0) tasksWithLabels++;
    if (task.comment_count && task.comment_count > 0) tasksWithComments++;
    if (task.subtasks && task.subtasks.length > 0) subtaskCount += task.subtasks.length;
  });
  
  if (tasksWithLabels > 0) metadata.push(`Tasks with labels: ${tasksWithLabels}`);
  if (tasksWithComments > 0) metadata.push(`Tasks with comments: ${tasksWithComments}`);
  if (subtaskCount > 0) metadata.push(`Sub-tasks: ${subtaskCount}`);
  
  const metadataParagraph = body.appendParagraph(metadata.join(' • '));
  metadataParagraph.setItalic(true);
  body.appendParagraph(''); // Empty line

  if (tasks.length === 0) {
    body.appendParagraph('No tasks due today.');
    return;
  }

  const projectMap = new Map(projects.map(p => [p.id, p.name]));
  
  const tasksByProject = tasks.reduce((acc, task) => {
    const projectId = task.project_id || 'inbox';
    if (!acc[projectId]) {
      acc[projectId] = [];
    }
    acc[projectId].push(task);
    return acc;
  }, {});

  const sortedProjectIds = Object.keys(tasksByProject).sort((a, b) => {
    if (a === 'inbox') return -1;
    if (b === 'inbox') return 1;
    return projectMap.get(a).localeCompare(projectMap.get(b));
  });

  for (const projectId of sortedProjectIds) {
    const projectName = (projectId === 'inbox') ? 'Inbox' : projectMap.get(projectId);
    body.appendParagraph(projectName).setHeading(DocumentApp.ParagraphHeading.HEADING2);
    
    const projectTasks = tasksByProject[projectId];
    
    for (const task of projectTasks) {
      const listItem = body.appendListItem('');
      // Use the dedicated formatting function for each task.
      formatListItem(listItem, task);
      
      // Add sub-tasks if they exist
      if (task.subtasks && task.subtasks.length > 0) {
        for (const subTask of task.subtasks) {
          const subListItem = body.appendListItem('');
          formatListItem(subListItem, subTask, true); // true indicates it's a sub-task
        }
      }
    }
  }
}

/**
 * Builds a plain-text representation of the tasks grouped by project.
 * @param {Array} tasks
 * @param {Array} projects
 * @returns {string}
 */
function buildPlainTextForTasks(tasks, projects) {
  // Add this debugging at the start
  if (isDebugEnabled()) {
    Logger.log('=== TEXT EXPORT DEBUG ===');
    Logger.log('Tasks received: ' + (tasks ? tasks.length : 'null'));
    
    if (tasks && tasks.length > 0) {
      let subtaskCount = 0;
      tasks.forEach((task, index) => {
        if (task.subtasks && task.subtasks.length > 0) {
          Logger.log('Task ' + index + ' (' + task.content + ') has ' + task.subtasks.length + ' sub-tasks');
          subtaskCount += task.subtasks.length;
        }
      });
      Logger.log('Total sub-tasks found: ' + subtaskCount);
    }
  }
  
  const lines = [];
  const title = 'Todoist Tasks for ' + new Date().toLocaleDateString();
  lines.push(title);
  
  // Add metadata header
  const metadata = [];
  metadata.push('Export date: ' + new Date().toLocaleString());
  metadata.push('Timezone: ' + getTimezone());
  metadata.push('Total tasks: ' + (tasks ? tasks.length : 0));
  metadata.push('Total projects: ' + (projects ? projects.length : 0));
  
  // Calculate task statistics
  if (tasks && tasks.length > 0) {
    var tasksWithLabels = 0;
    var tasksWithComments = 0;
    var subtaskCount = 0;
    tasks.forEach(function(task) {
      if (task.labels && task.labels.length > 0) tasksWithLabels++;
      if (task.comment_count && task.comment_count > 0) tasksWithComments++;
      if (task.subtasks && task.subtasks.length > 0) subtaskCount += task.subtasks.length;
    });
    
    if (tasksWithLabels > 0) metadata.push('Tasks with labels: ' + tasksWithLabels);
    if (tasksWithComments > 0) metadata.push('Tasks with comments: ' + tasksWithComments);
    if (subtaskCount > 0) metadata.push('Sub-tasks: ' + subtaskCount);
  }
  
  lines.push(metadata.join(' • '));
  lines.push('');

  if (!tasks || tasks.length === 0) {
    lines.push('No tasks due today.');
    return lines.join('\n');
  }

  const projectMap = new Map(projects.map(function(p) { return [p.id, p.name]; }));

  const tasksByProject = tasks.reduce(function(acc, task) {
    const projectId = task.project_id || 'inbox';
    if (!acc[projectId]) acc[projectId] = [];
    acc[projectId].push(task);
    return acc;
  }, {});

  const sortedProjectIds = Object.keys(tasksByProject).sort(function(a, b) {
    if (a === 'inbox') return -1;
    if (b === 'inbox') return 1;
    return projectMap.get(a).localeCompare(projectMap.get(b));
  });

  for (var i = 0; i < sortedProjectIds.length; i++) {
    var projectId = sortedProjectIds[i];
    var projectName = (projectId === 'inbox') ? 'Inbox' : projectMap.get(projectId);
    lines.push(projectName + ':');

    var projectTasks = tasksByProject[projectId];
    for (var j = 0; j < projectTasks.length; j++) {
      var task = projectTasks[j];

      var priorityPrefix = '';
      if (task.priority === 4) priorityPrefix = '(P1) ';
      if (task.priority === 3) priorityPrefix = '(P2) ';
      if (task.priority === 2) priorityPrefix = '(P3) ';

      var content = task.content || '';
      var description = task.description || '';

      var dueDateString = '';
      if (task.due) {
        if (task.due.datetime) {
          var dateTime = new Date(task.due.datetime);
          dueDateString = ' (Due: ' + Utilities.formatDate(dateTime, getTimezone(), "MMM d, yyyy 'at' h:mm a") + ')';
        } else if (task.due.date) {
          var dateParts = task.due.date.split('-');
          var dateOnly = new Date(dateParts[0], dateParts[1] - 1, dateParts[2]);
          dueDateString = ' (Due: ' + Utilities.formatDate(dateOnly, 'UTC', 'MMM d, yyyy') + ')';
        }
      }

      var labelsSuffix = '';
      if (task.labels && task.labels.length > 0) {
        labelsSuffix = ' [' + task.labels.join(', ') + ']';
      }

      var metadataSuffix = '';
      var metadataParts = [];
      if (task.comment_count && task.comment_count > 0) {
        metadataParts.push(task.comment_count + ' comments');
      }
      if (task.created_at) {
        var createdDate = new Date(task.created_at);
        metadataParts.push('created ' + Utilities.formatDate(createdDate, getTimezone(), 'MMM d'));
      }
      if (metadataParts.length > 0) {
        metadataSuffix = ' (' + metadataParts.join(', ') + ')';
      }

      var line = '- ' + priorityPrefix + content + dueDateString + labelsSuffix + metadataSuffix;
      lines.push(line);
      
      // Add description as blockquote if it exists
      if (description) {
        // Split description into lines and format each as a blockquote
        var descriptionLines = description.split('\n');
        for (var d = 0; d < descriptionLines.length; d++) {
          var descLine = descriptionLines[d].trim();
          if (descLine) {
            lines.push('  > ' + descLine);
          }
        }
      }
      
      // Add sub-tasks if they exist
      if (task.subtasks && task.subtasks.length > 0) {
        for (var k = 0; k < task.subtasks.length; k++) {
          var subTask = task.subtasks[k];
          
          var subPriorityPrefix = '';
          if (subTask.priority === 4) subPriorityPrefix = '(P1) ';
          if (subTask.priority === 3) subPriorityPrefix = '(P2) ';
          if (subTask.priority === 2) subPriorityPrefix = '(P3) ';
          
          var subContent = subTask.content || '';
          var subDescription = subTask.description || '';
          
          var subDueDateString = '';
          if (subTask.due) {
            if (subTask.due.datetime) {
              var subDateTime = new Date(subTask.due.datetime);
              subDueDateString = ' (Due: ' + Utilities.formatDate(subDateTime, getTimezone(), "MMM d, yyyy 'at' h:mm a") + ')';
            } else if (subTask.due.date) {
              var subDateParts = subTask.due.date.split('-');
              var subDateOnly = new Date(subDateParts[0], subDateParts[1] - 1, subDateParts[2]);
              subDueDateString = ' (Due: ' + Utilities.formatDate(subDateOnly, 'UTC', 'MMM d, yyyy') + ')';
            }
          }
          
          var subLabelsSuffix = '';
          if (subTask.labels && subTask.labels.length > 0) {
            subLabelsSuffix = ' [' + subTask.labels.join(', ') + ']';
          }
          
          var subMetadataSuffix = '';
          var subMetadataParts = [];
          if (subTask.comment_count && subTask.comment_count > 0) {
            subMetadataParts.push(subTask.comment_count + ' comments');
          }
          if (subTask.created_at) {
            var subCreatedDate = new Date(subTask.created_at);
            subMetadataParts.push('created ' + Utilities.formatDate(subCreatedDate, getTimezone(), 'MMM d'));
          }
          if (subMetadataParts.length > 0) {
            subMetadataSuffix = ' (' + subMetadataParts.join(', ') + ')';
          }
          
          var subLine = '  - ' + subPriorityPrefix + subContent + subDueDateString + subLabelsSuffix + subMetadataSuffix;
          lines.push(subLine);
          
          // Add sub-task description as blockquote if it exists
          if (subDescription) {
            // Split description into lines and format each as a blockquote
            var subDescriptionLines = subDescription.split('\n');
            for (var sd = 0; sd < subDescriptionLines.length; sd++) {
              var subDescLine = subDescriptionLines[sd].trim();
              if (subDescLine) {
                lines.push('    > ' + subDescLine);
              }
            }
          }
        }
      }
    }

    lines.push('');
  }

  return lines.join('\n');
}

/**
 * Writes the tasks to a plain text file in Drive (overwrites file content).
 * @param {Array} tasks
 * @param {Array} projects
 */
function writeTasksToTextFile(tasks, projects) {
  var fileId = getTextFileId();
  var file = DriveApp.getFileById(fileId);
  var text = buildPlainTextForTasks(tasks, projects);
  file.setContent(text);
}

/**
 * Writes the raw Todoist JSON data to a file in Drive (overwrites file content).
 * @param {Array} tasks - Raw tasks array from Todoist API
 * @param {Array} projects - Raw projects array from Todoist API
 */
function writeTasksToJsonFile(tasks, projects) {
  var fileId = getJsonFileId();
  var file = DriveApp.getFileById(fileId);
  
  // Calculate additional statistics
  var taskStats = {
    total: tasks ? tasks.length : 0,
    withDueDates: 0,
    withLabels: 0,
    withComments: 0,
    byPriority: { p1: 0, p2: 0, p3: 0, p4: 0 },
    subtaskCount: 0
  };
  
  if (tasks) {
    tasks.forEach(function(task) {
      if (task.due) taskStats.withDueDates++;
      if (task.labels && task.labels.length > 0) taskStats.withLabels++;
      if (task.comment_count && task.comment_count > 0) taskStats.withComments++;
      
      // Count by priority (API uses 1-4, where 4 is highest)
      if (task.priority === 4) taskStats.byPriority.p1++;
      else if (task.priority === 3) taskStats.byPriority.p2++;
      else if (task.priority === 2) taskStats.byPriority.p3++;
      else taskStats.byPriority.p4++;
    });
  }

  // Create a structured JSON object with comprehensive metadata
  var jsonData = {
    exportMetadata: {
      exportDate: new Date().toISOString(),
      timezone: getTimezone(),
      apiVersion: 'v2',
      scriptVersion: '1.0.0'
    },
    statistics: {
      tasks: taskStats,
      projects: {
        total: projects ? projects.length : 0
      }
    },
    data: {
      tasks: tasks,
      projects: projects
    }
  };
  
  var jsonString = JSON.stringify(jsonData, null, 2); // Pretty-printed with 2-space indentation
  file.setContent(jsonString);
}

/**
 * Formats a single list item with bold task content, description, priority, labels, and Markdown.
 * @param {ListItem} listItem - The Google Docs ListItem element to format.
 * @param {Object} task - The task object from Todoist.
 * @param {boolean} isSubTask - Whether this is a sub-task (for indentation).
 */
function formatListItem(listItem, task, isSubTask = false) {
  // --- 1. Construct all the text pieces ---
  let priorityPrefix = '';
  if (task.priority === 4) priorityPrefix = '(P1) ';
  if (task.priority === 3) priorityPrefix = '(P2) ';
  if (task.priority === 2) priorityPrefix = '(P3) ';
  
  const content = task.content;
  const description = task.description ? ' — ' + task.description : '';

  // --- NEW: Format the due date/deadline ---
  let dueDateString = '';
  if (task.due) {
    // Case 1: Task has a specific time (datetime)
    if (task.due.datetime) {
      const date = new Date(task.due.datetime);
      // Format the date for the user's configured timezone
      dueDateString = ` (Due: ${Utilities.formatDate(date, getTimezone(), "MMM d, yyyy 'at' h:mm a")})`;
    } 
    // Case 2: Task is all-day (date only)
    else {
      // Parse YYYY-MM-DD manually to avoid timezone conversion issues on all-day tasks
      const dateParts = task.due.date.split('-');
      const date = new Date(dateParts[0], dateParts[1] - 1, dateParts[2]);
      dueDateString = ` (Due: ${Utilities.formatDate(date, "UTC", "MMM d, yyyy")})`;
    }
  }
  
  let labelsSuffix = '';
  if (task.labels && task.labels.length > 0) {
    labelsSuffix = ` [${task.labels.join(', ')}]`;
  }
  
  // --- 2. Append pieces and apply base formatting ---
  if (priorityPrefix) {
    listItem.appendText(priorityPrefix);
  }
  
  // Add indentation for sub-tasks
  if (isSubTask) {
    listItem.setIndentStart(36); // 36 points = 0.5 inches indentation
  }
  
  const contentStart = listItem.getText().length;
  if (content) {
    listItem.appendText(content);
  }
  const contentEnd = listItem.getText().length - 1;
  
  if (description) {
    listItem.appendText(description);
  }
  
  // Add the new due date string to the item
  if (dueDateString) {
    listItem.appendText(dueDateString);
  }
  
  if (labelsSuffix) {
    listItem.appendText(labelsSuffix);
  }
  
  const textElement = listItem.editAsText();
  
  // Apply the requested bold formatting to the task content
  if (contentEnd >= contentStart) {
    textElement.setBold(contentStart, contentEnd, true);
  }

  // --- 3. Apply Markdown formatting over the whole list item ---
  const fullText = textElement.getText();

  // Handle Links: [text](url)
  const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
  const linkMatches = [...fullText.matchAll(linkRegex)];
  for (let i = linkMatches.length - 1; i >= 0; i--) {
    const match = linkMatches[i];
    const linkText = match[1];
    const url = match[2];
    const startIndex = match.index;
    textElement.deleteText(startIndex, startIndex + match[0].length - 1);
    textElement.insertText(startIndex, linkText);
    textElement.setLinkUrl(startIndex, startIndex + linkText.length - 1, url);
  }

  // Handle Bold: **text**
  const textAfterLinks = textElement.getText();
  const boldRegex = /\*\*(.*?)\*\*/g;
  const boldMatches = [...textAfterLinks.matchAll(boldRegex)];
  for (let i = boldMatches.length - 1; i >= 0; i--) {
    const match = boldMatches[i];
    const startIndex = match.index;
    const innerTextLength = match[1].length;
    textElement.setBold(startIndex, startIndex + match[0].length - 1, true);
    textElement.deleteText(startIndex + 1 + innerTextLength, startIndex + 1 + innerTextLength + 1);
    textElement.deleteText(startIndex, startIndex + 1);
  }

  // Handle Italics: *text*
  const textAfterBold = textElement.getText();
  const italicRegex = /\*([^*]+)\*/g;
  const italicMatches = [...textAfterBold.matchAll(italicRegex)];
  for (let i = italicMatches.length - 1; i >= 0; i--) {
    const match = italicMatches[i];
    const startIndex = match.index;
    const innerTextLength = match[1].length;
    textElement.setItalic(startIndex, startIndex + match[0].length - 1, true);
    textElement.deleteText(startIndex + 1 + innerTextLength, startIndex + 1 + innerTextLength);
    textElement.deleteText(startIndex, startIndex);
  }
}