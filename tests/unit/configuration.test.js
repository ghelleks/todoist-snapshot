/**
 * Configuration Management Tests
 * Tests for property retrieval, validation, and URL/ID extraction
 */

// Import mocks
require('../mocks/google-apps-script');

// Import the source functions (we'll need to load the .gs file as .js)
const fs = require('fs');
const path = require('path');

// Load and evaluate the Google Apps Script file
const gasCode = fs.readFileSync(path.join(__dirname, '../../todoist-snapshot.js'), 'utf8');
eval(gasCode);

describe('Configuration Management', () => {
  beforeEach(() => {
    // Reset all mocks before each test
    MockUtils.resetAll();
  });

  describe('getTodoistToken()', () => {
    test('should return valid token when configured', () => {
      // Token should be available from test environment
      const token = getTodoistToken();
      
      expect(token).toBe('test-token-12345');
    });

    test('should throw error when token is missing', () => {
      PropertiesService.setMockProperties({ TODOIST_TOKEN: null });
      
      expect(() => getTodoistToken()).toThrow('TODOIST_TOKEN is not configured');
    });

    test('should throw error when token is empty string', () => {
      PropertiesService.setMockProperties({ TODOIST_TOKEN: '' });
      
      expect(() => getTodoistToken()).toThrow('TODOIST_TOKEN is not configured');
    });
  });

  describe('getTimezone()', () => {
    test('should return default timezone when not configured', () => {
      PropertiesService.setMockProperties({ TIMEZONE: null });
      
      const timezone = getTimezone();
      
      expect(timezone).toBe('America/Chicago');
    });

    test('should return custom timezone when configured', () => {
      PropertiesService.setMockProperties({ TIMEZONE: 'Europe/London' });
      
      const timezone = getTimezone();
      
      expect(timezone).toBe('Europe/London');
    });

    test('should return default for empty timezone', () => {
      PropertiesService.setMockProperties({ TIMEZONE: '' });
      
      const timezone = getTimezone();
      
      expect(timezone).toBe('America/Chicago');
    });
  });

  describe('getDocId()', () => {
    test('should return extracted ID from valid Doc URL', () => {
      const mockUrl = 'https://docs.google.com/document/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit';
      PropertiesService.setMockProperties({ DOC_ID: mockUrl });
      
      const docId = getDocId();
      
      expect(docId).toBe('1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms');
    });

    test('should throw error when DOC_ID not configured', () => {
      PropertiesService.setMockProperties({ DOC_ID: null });
      
      expect(() => getDocId()).toThrow('DOC_ID is not configured');
    });

    test('should return ID when already an ID', () => {
      // The default from .env.test is already an ID
      const docId = getDocId();
      
      expect(docId).toBe('1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms');
    });
  });

  describe('getTextFileId()', () => {
    test('should return extracted ID from Drive file URL', () => {
      const mockUrl = 'https://drive.google.com/file/d/1AbCdEFghIJklMNopQRstuVWxyz123456/view?usp=sharing';
      PropertiesService.setMockProperties({ TEXT_FILE_ID: mockUrl });
      
      const fileId = getTextFileId();
      
      expect(fileId).toBe('1AbCdEFghIJklMNopQRstuVWxyz123456');
    });

    test('should throw error when TEXT_FILE_ID not configured', () => {
      PropertiesService.setMockProperties({ TEXT_FILE_ID: null });
      
      expect(() => getTextFileId()).toThrow('TEXT_FILE_ID is not configured');
    });
  });

  describe('getJsonFileId()', () => {
    test('should return extracted ID from Drive file URL', () => {
      const mockUrl = 'https://drive.google.com/file/d/1XyZabcDEFghIJklMNopQRstuVWxyz789/view?usp=sharing';
      PropertiesService.setMockProperties({ JSON_FILE_ID: mockUrl });
      
      const fileId = getJsonFileId();
      
      expect(fileId).toBe('1XyZabcDEFghIJklMNopQRstuVWxyz789');
    });

    test('should throw error when JSON_FILE_ID not configured', () => {
      PropertiesService.setMockProperties({ JSON_FILE_ID: null });
      
      expect(() => getJsonFileId()).toThrow('JSON_FILE_ID is not configured');
    });
  });

  describe('extractDriveIdFromInput()', () => {
    test('should extract ID from Google Docs sharing URL', () => {
      const url = 'https://docs.google.com/document/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit';
      
      const id = extractDriveIdFromInput(url);
      
      expect(id).toBe('1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms');
    });

    test('should extract ID from Drive file URL', () => {
      const url = 'https://drive.google.com/file/d/1AbCdEFghIJklMNopQRstuVWxyz123456/view?usp=sharing';
      
      const id = extractDriveIdFromInput(url);
      
      expect(id).toBe('1AbCdEFghIJklMNopQRstuVWxyz123456');
    });

    test('should extract ID from short Drive URL', () => {
      const url = 'https://drive.google.com/d/1AbCdEFghIJklMNopQRstuVWxyz123456';
      
      const id = extractDriveIdFromInput(url);
      
      expect(id).toBe('1AbCdEFghIJklMNopQRstuVWxyz123456');
    });

    test('should extract ID from URL with id parameter', () => {
      const url = 'https://drive.google.com/open?id=1AbCdEFghIJklMNopQRstuVWxyz123456';
      
      const id = extractDriveIdFromInput(url);
      
      expect(id).toBe('1AbCdEFghIJklMNopQRstuVWxyz123456');
    });

    test('should return ID when input is already an ID', () => {
      const id = '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms';
      
      const result = extractDriveIdFromInput(id);
      
      expect(result).toBe(id);
    });

    test('should throw error for empty input', () => {
      expect(() => extractDriveIdFromInput('')).toThrow('Empty ID/URL provided');
      expect(() => extractDriveIdFromInput(null)).toThrow('Empty ID/URL provided');
      expect(() => extractDriveIdFromInput(undefined)).toThrow('Empty ID/URL provided');
      expect(() => extractDriveIdFromInput('   ')).toThrow('Empty ID/URL provided');
    });

    test('should throw error for folder URLs', () => {
      const folderUrl = 'https://drive.google.com/drive/folders/1AbCdEFghIJklMNopQRstuVWxyz123456';
      
      expect(() => extractDriveIdFromInput(folderUrl)).toThrow('folder');
    });


    test('should handle URLs with additional parameters', () => {
      const url = 'https://docs.google.com/document/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit?usp=sharing&param=value';
      
      const id = extractDriveIdFromInput(url);
      
      expect(id).toBe('1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms');
    });

    test('should handle HTTP URLs (not just HTTPS)', () => {
      const url = 'http://docs.google.com/document/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit';
      
      const id = extractDriveIdFromInput(url);
      
      expect(id).toBe('1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms');
    });
  });
});