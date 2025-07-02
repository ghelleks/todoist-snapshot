/**
 * Configuration management for Todoist-to-Google-Doc sync script.
 * This file handles secure storage and retrieval of sensitive credentials
 * using Google Apps Script's PropertiesService.
 */

/**
 * Gets the Todoist API token from script properties.
 * @returns {string} The Todoist API token
 * @throws {Error} If token is not configured
 */
function getTodoistToken() {
  const token = PropertiesService.getScriptProperties().getProperty('TODOIST_TOKEN');
  if (!token) {
    throw new Error('TODOIST_TOKEN is not configured. Please run setupConfig() first.');
  }
  return token;
}

/**
 * Gets the Google Doc ID from script properties.
 * @returns {string} The Google Doc ID
 * @throws {Error} If doc ID is not configured
 */
function getDocId() {
  const docId = PropertiesService.getScriptProperties().getProperty('DOC_ID');
  if (!docId) {
    throw new Error('DOC_ID is not configured. Please run setupConfig() first.');
  }
  return docId;
}

/**
 * Gets the timezone for date formatting from script properties.
 * Defaults to 'America/Chicago' if not configured.
 * @returns {string} The timezone string
 */
function getTimezone() {
  const timezone = PropertiesService.getScriptProperties().getProperty('TIMEZONE');
  return timezone || 'America/Chicago';
}

/**
 * One-time setup function to configure your credentials.
 * Replace the values below with your actual credentials and run this function once.
 * 
 * IMPORTANT: After running this function, delete or comment out your actual 
 * credentials from this file for security.
 */
function setupConfig() {
  const properties = PropertiesService.getScriptProperties();
  
  // TODO: Replace these with your actual values, then run this function
  const config = {
    'TODOIST_TOKEN': 'YOUR_TODOIST_TOKEN_HERE',
    'DOC_ID': 'YOUR_GOOGLE_DOC_ID_HERE',
    'TIMEZONE': 'America/Chicago' // Optional: change to your timezone
  };
  
  properties.setProperties(config);
  Logger.log('Configuration saved successfully!');
  Logger.log('Remember to remove your actual credentials from this file after setup.');
}

/**
 * Utility function to verify all required configuration is set up.
 * @returns {boolean} True if all required config is present
 */
function verifyConfig() {
  try {
    getTodoistToken();
    getDocId();
    Logger.log('✓ Configuration verified successfully');
    Logger.log('✓ Todoist token: configured');
    Logger.log('✓ Google Doc ID: configured');
    Logger.log('✓ Timezone: ' + getTimezone());
    return true;
  } catch (error) {
    Logger.log('✗ Configuration error: ' + error.message);
    return false;
  }
}

/**
 * Utility function to clear all stored configuration.
 * Use with caution - this will remove all stored credentials.
 */
function clearConfig() {
  const properties = PropertiesService.getScriptProperties();
  properties.deleteProperty('TODOIST_TOKEN');
  properties.deleteProperty('DOC_ID');
  properties.deleteProperty('TIMEZONE');
  Logger.log('All configuration cleared.');
} 