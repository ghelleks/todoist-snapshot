# ADR-0004: Configuration Management via PropertiesService

## Status
Accepted

## Context
The todoist-snapshot project required a secure and user-friendly configuration management solution that could handle:

**Security Requirements**:
- **API Token Storage**: Todoist API tokens must be stored securely and encrypted
- **Credential Protection**: No hardcoded credentials in source code
- **Access Control**: Configuration only accessible to the script owner
- **Audit Trail**: Changes to configuration should be trackable

**User Experience Requirements**:
- **Simple Setup**: Easy configuration for non-technical users
- **GUI Interface**: Visual configuration without code editing
- **Validation**: Clear error messages for invalid configuration
- **Flexibility**: Support for optional configurations and defaults

**Technical Requirements**:
- **Runtime Access**: Configuration available during script execution
- **Persistence**: Settings persist across script runs and deployments
- **Performance**: Fast access to configuration values
- **Testing Support**: Mockable for unit testing

**Configuration Categories**:
- **Required**: Todoist API token
- **Output Targets**: Google Doc ID, text file ID, JSON file ID
- **Optional**: Timezone, debug flags
- **Derived**: URLs that need parsing to extract IDs

## Decision
Selected **Google Apps Script PropertiesService** as the primary configuration management system with URL parsing and validation logic.

### Configuration Architecture
- **PropertiesService.getScriptProperties()**: Encrypted storage for all configuration
- **URL Parsing**: Automatic extraction of document/file IDs from Google URLs
- **Validation Logic**: Runtime validation with clear error messages
- **Default Values**: Sensible defaults for optional configuration
- **Debug Support**: Conditional debug logging based on configuration

### Configuration Properties
```
TODOIST_TOKEN: Required Todoist API token
DOC_ID: Optional Google Doc URL/ID for rich formatting
TEXT_FILE_ID: Optional text file URL/ID for plain text export
JSON_FILE_ID: Optional JSON file URL/ID for raw data export
TIMEZONE: Optional timezone (default: America/Chicago)
DEBUG: Optional debug flag ("true" enables detailed logging)
```

## Alternatives Considered

### Option 1: Environment Variables
- **Description**: Use Google Apps Script environment variables or script constants
- **Pros**: Familiar pattern, simple implementation, version controlled
- **Cons**: No built-in encryption, hardcoded credentials, difficult user configuration
- **Risk Level**: High (security vulnerability)

### Option 2: External Configuration Service
- **Description**: Store configuration in external service (Firebase, Google Sheets)
- **Pros**: Advanced configuration management, sharing capabilities, validation
- **Cons**: Additional dependencies, network requests, complex authentication, cost
- **Risk Level**: Medium (complexity and dependency)

### Option 3: Google Sheets Configuration
- **Description**: Use Google Sheets as configuration backend
- **Pros**: Visual interface, easy editing, sharing capabilities
- **Cons**: Additional API calls, complex access control, overkill for simple config
- **Risk Level**: Medium (complexity and performance)

### Option 4: Code-Based Configuration Files
- **Description**: JavaScript configuration files within the script
- **Pros**: Version controlled, familiar to developers, easy defaults
- **Cons**: Hardcoded credentials, no user-friendly editing, security risks
- **Risk Level**: High (security and usability)

### Option 5: Browser localStorage/sessionStorage
- **Description**: Store configuration in browser storage
- **Pros**: Client-side storage, fast access
- **Cons**: Not available in Google Apps Script environment, not persistent across sessions
- **Risk Level**: High (not applicable to server-side Apps Script)

## Consequences

### Positive
- **Security**: Automatic encryption of all stored properties including API tokens
- **User-Friendly**: Simple GUI interface in Google Apps Script project settings
- **No Dependencies**: Built into Google Apps Script platform
- **Performance**: Fast local access without network requests
- **Flexibility**: Support for optional configuration with defaults
- **URL Parsing**: Automatic handling of Google Drive/Docs URLs or direct IDs
- **Testing Support**: Easily mockable for comprehensive unit testing

### Negative
- **Platform Lock-in**: Tightly coupled to Google Apps Script ecosystem
- **Limited Validation**: Basic string storage without advanced type validation
- **Manual Setup**: Users must manually configure each property
- **No Sharing**: Configuration tied to individual script instances
- **Limited Organization**: Flat key-value structure without hierarchical organization

### Neutral
- **Configuration Discovery**: Properties not visible in source code (security vs. documentation trade-off)
- **Migration**: Configuration tied to script instance (requires manual setup per deployment)
- **Backup**: No built-in configuration export/import functionality

## Implementation Notes

### Configuration Access Pattern
```javascript
const properties = PropertiesService.getScriptProperties();
const todoistToken = properties.getProperty('TODOIST_TOKEN');
const docId = properties.getProperty('DOC_ID');
const debug = properties.getProperty('DEBUG') === 'true';
```

### URL Parsing Logic
- **Google Docs URLs**: Extract document ID from various Google Docs URL formats
- **Google Drive URLs**: Parse file IDs from sharing URLs
- **Direct IDs**: Support raw document/file IDs for advanced users
- **Validation**: Verify extracted IDs match expected Google ID patterns

### Error Handling Strategy
- **Missing Required Config**: Clear error messages for missing Todoist token
- **Invalid URLs**: Helpful guidance for malformed Google URLs
- **No Output Targets**: Inform users they must configure at least one export target
- **Debug Information**: Detailed logging when DEBUG flag is enabled

### Testing Approach
- **Mock Properties**: Complete PropertiesService mock for unit testing
- **Configuration Scenarios**: Test various valid/invalid configuration combinations
- **URL Parsing Tests**: Comprehensive testing of different Google URL formats
- **Error Condition Testing**: Validate error messages and handling

### Security Considerations
- **Encrypted Storage**: PropertiesService automatically encrypts all values
- **Access Control**: Only script owner can view/modify properties
- **No Logging**: Avoid logging sensitive configuration values
- **Token Validation**: Validate Todoist tokens without exposing them in logs

### User Documentation Requirements
- **Setup Guide**: Step-by-step configuration instructions
- **URL Examples**: Show various acceptable Google URL formats
- **Troubleshooting**: Common configuration errors and solutions
- **Security Notes**: Best practices for API token management

## References
- [Google Apps Script PropertiesService](https://developers.google.com/apps-script/reference/properties/properties-service)
- [Google Apps Script Security Best Practices](https://developers.google.com/apps-script/guides/support/security)
- [Google Drive File ID Documentation](https://developers.google.com/drive/api/guides/about-files)
- [Todoist API Authentication](https://developer.todoist.com/rest/v2/#authentication)