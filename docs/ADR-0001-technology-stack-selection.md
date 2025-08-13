# ADR-0001: Technology Stack Selection - Google Apps Script Runtime

## Status
Accepted

## Context
The todoist-snapshot project needed a runtime platform that could:
- Integrate seamlessly with Google Workspace (Docs, Drive)
- Handle periodic task synchronization without server infrastructure
- Provide secure credential storage and API access
- Minimize operational overhead and hosting costs
- Enable easy deployment and sharing among users

Key requirements:
- **Integration**: Direct access to Google Docs and Drive APIs without authentication complexity
- **Automation**: Support for scheduled execution (triggers)
- **Security**: Secure storage of API tokens and credentials
- **Accessibility**: Easy setup for end users without technical infrastructure
- **Cost**: Zero operational costs for hosting and execution
- **Maintenance**: Minimal infrastructure management

Alternative platforms considered:
- Traditional web servers (Node.js, Python)
- Serverless functions (AWS Lambda, Google Cloud Functions)
- Browser extensions
- Desktop applications

## Decision
Selected **Google Apps Script** as the primary runtime environment for the todoist-snapshot application.

### Rationale
1. **Native Google Integration**: Direct access to Google Docs and Drive APIs without OAuth flow complexity
2. **Built-in Scheduling**: Native trigger system for automated execution
3. **Secure Credential Storage**: PropertiesService provides encrypted storage for API tokens
4. **Zero Infrastructure**: No servers to manage or hosting costs
5. **User Accessibility**: Users can deploy by copying script to their Google Drive
6. **Execution Environment**: JavaScript runtime with Google service libraries

## Alternatives Considered

### Option 1: Node.js Web Server
- **Description**: Traditional server application with web dashboard
- **Pros**: Full control over environment, extensive library ecosystem, familiar development tools
- **Cons**: Requires hosting infrastructure, complex authentication setup, ongoing operational costs
- **Risk Level**: Medium (operational complexity)

### Option 2: AWS Lambda/Google Cloud Functions
- **Description**: Serverless function triggered on schedule
- **Pros**: Scalable, pay-per-use pricing, modern serverless architecture
- **Cons**: Complex authentication for Google APIs, deployment complexity, vendor lock-in concerns
- **Risk Level**: Medium (deployment and authentication complexity)

### Option 3: Browser Extension
- **Description**: Client-side extension running in user's browser
- **Pros**: Direct API access, local execution, no server costs
- **Cons**: Limited to browser environment, complex installation, no scheduling without browser open
- **Risk Level**: High (user experience and reliability)

### Option 4: Desktop Application
- **Description**: Standalone desktop application
- **Pros**: Full control over environment, offline capabilities
- **Cons**: Platform-specific builds, complex distribution, manual execution required
- **Risk Level**: High (distribution and maintenance complexity)

## Consequences

### Positive
- **Zero operational costs**: No hosting or infrastructure expenses
- **Simplified authentication**: Native Google API access without OAuth implementation
- **Easy user deployment**: Copy-paste installation process
- **Built-in scheduling**: Native trigger system for automation
- **Secure credential storage**: Encrypted PropertiesService for API tokens
- **Integrated logging**: Built-in Logger service for debugging
- **Automatic scaling**: Google handles execution environment scaling

### Negative
- **Limited runtime environment**: Restricted to Google Apps Script JavaScript subset
- **Execution time limits**: 6-minute maximum execution time per run
- **Limited debugging tools**: Basic logging and error reporting compared to full IDEs
- **Vendor lock-in**: Tightly coupled to Google's ecosystem
- **Limited third-party libraries**: Restricted library ecosystem compared to Node.js
- **Testing challenges**: Complex local testing setup required

### Neutral
- **Development workflow**: Requires browser-based IDE or external tooling for advanced development
- **Version control**: Manual synchronization required between Google Apps Script and git repository
- **Deployment process**: Manual copy-paste or automated deployment scripts needed

## Implementation Notes
- **Local Development**: Established Node.js/Jest testing environment to overcome Apps Script limitations
- **Mock System**: Created comprehensive Google Apps Script API mocks for local testing
- **Deployment Strategy**: Manual copy-paste from git repository to Google Apps Script editor
- **Error Handling**: Implemented comprehensive error handling within Apps Script execution limits
- **Monitoring**: Leveraged built-in Google Apps Script execution logs and email notifications

## References
- [Google Apps Script Documentation](https://developers.google.com/apps-script)
- [Google Apps Script Runtime Limits](https://developers.google.com/apps-script/guides/services/quotas)
- [PropertiesService Documentation](https://developers.google.com/apps-script/reference/properties)
- [Google Apps Script Triggers](https://developers.google.com/apps-script/guides/triggers)