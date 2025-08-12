/**
 * Test Environment Setup
 * Loads environment variables and sets up global test configuration
 */

const dotenv = require('dotenv');
const path = require('path');

// Load test environment variables
dotenv.config({ path: path.resolve(__dirname, '../../.env.test') });

// Make environment variables available to tests
global.TEST_ENV = {
  TODOIST_TOKEN: process.env.TODOIST_TOKEN,
  DOC_ID: process.env.DOC_ID,
  TEXT_FILE_ID: process.env.TEXT_FILE_ID,
  JSON_FILE_ID: process.env.JSON_FILE_ID,
  TIMEZONE: process.env.TIMEZONE,
  DEBUG: process.env.DEBUG
};