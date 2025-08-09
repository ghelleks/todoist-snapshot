// --- CONFIGURATION ---
// Configuration is managed via Script properties (Project settings → Script properties).
// Set: TODOIST_TOKEN (required), DOC_ID (optional URL), TEXT_FILE_ID (optional URL), TIMEZONE (optional).

// Configuration helpers (inline): paste sharing URLs or raw IDs into Script Properties.
// Required properties:
// - TODOIST_TOKEN: your Todoist API token
// Optional targets (provide at least one):
// - DOC_ID: Google Doc URL or ID
// - TEXT_FILE_ID: Drive text file URL or ID
// Optional:
// - TIMEZONE: e.g., America/Chicago

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
    Logger.log('Successfully synced tasks.');
  } catch (e) {
    Logger.log('Failed to sync tasks: ' + e.toString());
    Logger.log(e.stack); // Added for more detailed error logging.
  }
}

/**
 * The main function to sync to a plain text file in Drive instead of a Google Doc.
 * @param {{tasks: Array, projects: Array}=} preFetchedData Optional pre-fetched data to avoid duplicate API calls
 */
function syncTodoistToTextFile(preFetchedData) {
  try {
    const todoistData = preFetchedData || getTodoistData();
    writeTasksToTextFile(todoistData.tasks, todoistData.projects);
    Logger.log('Successfully synced tasks to text file.');
  } catch (e) {
    Logger.log('Failed to sync tasks to text file: ' + e.toString());
    Logger.log(e.stack);
  }
}

/**
 * Unified sync function. Checks configured targets and performs the appropriate sync(s).
 * If both DOC_ID and TEXT_FILE_ID are set, it fetches once and updates both outputs.
 */
function syncTodoist() {
  const properties = PropertiesService.getScriptProperties();
  const hasDoc = !!properties.getProperty('DOC_ID');
  const hasText = !!properties.getProperty('TEXT_FILE_ID');

  if (!hasDoc && !hasText) {
    throw new Error('No output targets configured. Set DOC_ID and/or TEXT_FILE_ID via setupConfig().');
  }

  if (hasDoc && hasText) {
    const data = getTodoistData();
    syncTodoistToDoc(data);
    syncTodoistToTextFile(data);
    return;
  }

  if (hasDoc) {
    syncTodoistToDoc();
  }
  if (hasText) {
    syncTodoistToTextFile();
  }
}

/**
 * Fetches tasks and projects from the Todoist API.
 * @returns {Object} An object containing arrays of tasks and projects.
 */
function getTodoistData() {
  // Set up API request parameters
  const params = {
    'method': 'get',
    'headers': {
      'Authorization': 'Bearer ' + getTodoistToken()
    },
    'muteHttpExceptions': true
  };
  
  // Fetch tasks due today or overdue
  const taskFilter = encodeURIComponent('!(no due date)');
  const taskUrl = 'https://api.todoist.com/rest/v2/tasks?filter=' + taskFilter;
  const taskResponse = UrlFetchApp.fetch(taskUrl, params);
  const tasks = JSON.parse(taskResponse.getContentText());

  // Fetch all projects
  const projectUrl = 'https://api.todoist.com/rest/v2/projects';
  const projectResponse = UrlFetchApp.fetch(projectUrl, params);
  const projects = JSON.parse(projectResponse.getContentText());
  
  return { tasks, projects };
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
  const lines = [];
  const title = 'Todoist Tasks for ' + new Date().toLocaleDateString();
  lines.push(title, '');

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
      var description = task.description ? ' — ' + task.description : '';

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

      var line = '- ' + priorityPrefix + content + description + dueDateString + labelsSuffix;
      lines.push(line);
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
 * Formats a single list item with bold task content, description, priority, labels, and Markdown.
 * @param {ListItem} listItem - The Google Docs ListItem element to format.
 * @param {Object} task - The task object from Todoist.
 */
function formatListItem(listItem, task) {
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
  if (task.labels.length > 0) {
    labelsSuffix = ` [${task.labels.join(', ')}]`;
  }
  
  // --- 2. Append pieces and apply base formatting ---
  if (priorityPrefix) {
    listItem.appendText(priorityPrefix);
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