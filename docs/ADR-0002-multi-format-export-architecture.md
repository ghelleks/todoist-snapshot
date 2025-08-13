# ADR-0002: Multi-Format Export Architecture

## Status
Accepted

## Context
The todoist-snapshot project needed to support multiple output formats to serve different user needs and use cases:

**User Requirements**:
- **Rich formatting**: Some users want formatted documents with styles, headers, and visual hierarchy
- **Plain text**: Others need simple text files for integration with other tools or lightweight access
- **Raw data**: Developers and power users need structured JSON for analysis, backup, or further processing
- **Flexible configuration**: Users should be able to choose which formats to export without requiring all

**Technical Constraints**:
- Single API call efficiency (Todoist API rate limits)
- Google Apps Script execution time limits (6 minutes)
- Different Google APIs for each output format
- Varying data processing requirements per format

**Design Goals**:
- Minimize API calls to Todoist (single fetch for multiple exports)
- Support selective export (users can configure any combination of formats)
- Maintain consistent data across all formats
- Optimize for different use cases per format

## Decision
Implemented a **unified data processing architecture** with format-specific rendering pipelines supporting three distinct export formats:

1. **Google Docs Export** (`syncTodoistToDoc`): Rich formatted documents with headers, styles, and visual hierarchy
2. **Plain Text Export** (`syncTodoistToTextFile`): Simple text files with markdown-style formatting
3. **JSON Export** (`syncTodoistToJsonFile`): Raw structured data for programmatic access

### Architecture Components
- **Single Data Fetch**: One Todoist API call serves all configured export formats
- **Format-Specific Processors**: Dedicated formatting functions for each output type
- **Unified Entry Point**: `syncTodoist()` function detects configured targets and orchestrates exports
- **Independent Configuration**: Each format can be enabled/disabled independently via properties

## Alternatives Considered

### Option 1: Single Format with Conversion
- **Description**: Export to one primary format (Google Docs) and convert to others
- **Pros**: Single processing pipeline, consistent formatting logic
- **Cons**: Loss of format-specific optimization, unnecessary complexity for simple exports
- **Risk Level**: Medium (conversion complexity and data loss)

### Option 2: Separate Scripts per Format
- **Description**: Individual Google Apps Script functions for each export format
- **Pros**: Complete separation of concerns, simpler individual implementations
- **Cons**: Multiple API calls, code duplication, inconsistent data across formats
- **Risk Level**: High (API rate limits and data consistency)

### Option 3: Template-Based Rendering
- **Description**: Single data model with pluggable template renderers
- **Pros**: Consistent data model, extensible architecture
- **Cons**: Over-engineering for three formats, complex template system in Apps Script
- **Risk Level**: Medium (implementation complexity)

### Option 4: External Processing Service
- **Description**: External service to handle format conversion and rendering
- **Pros**: Powerful processing capabilities, unlimited format support
- **Cons**: Additional infrastructure, security complexity, breaks zero-cost model
- **Risk Level**: High (infrastructure and security complexity)

## Consequences

### Positive
- **Efficient API Usage**: Single Todoist API call serves multiple export formats
- **User Flexibility**: Users can enable any combination of export formats
- **Format Optimization**: Each format optimized for its specific use case:
  - Google Docs: Rich formatting with headers, styles, task metadata
  - Text Files: Simple markdown-style formatting for broad compatibility
  - JSON: Complete raw data for programmatic access and backup
- **Performance**: Parallel processing of formats after single data fetch
- **Maintainability**: Clear separation between data fetching and format rendering

### Negative
- **Code Complexity**: Multiple formatting pipelines to maintain
- **Testing Overhead**: Each format requires comprehensive test coverage
- **Data Synchronization**: Must ensure consistency across all format outputs
- **Feature Parity**: New features must be implemented across all relevant formats

### Neutral
- **Configuration Complexity**: Users must understand different format capabilities
- **Error Handling**: Format-specific errors must be handled independently
- **Memory Usage**: All format data held in memory during multi-format exports

## Implementation Notes

### Data Flow Architecture
1. **Configuration Detection**: Check PropertiesService for enabled export targets
2. **Single API Fetch**: Retrieve tasks and projects from Todoist once
3. **Data Processing**: Build unified task list with metadata and hierarchy
4. **Format Rendering**: Process data through format-specific pipelines
5. **Output Generation**: Write to configured Google Docs/Drive files

### Format-Specific Features
- **Google Docs**: Headers, bold/italic text, clickable links, task statistics, creation dates
- **Plain Text**: Blockquote descriptions, simple markdown formatting, task counts
- **JSON**: Complete task metadata, project details, comment counts, raw API data

### Error Handling Strategy
- **Graceful Degradation**: Individual format failures don't affect other formats
- **Detailed Logging**: Format-specific error messages for troubleshooting
- **Partial Success**: Users informed of which formats succeeded/failed

### Performance Optimizations
- **Lazy Processing**: Format pipelines only executed for configured targets
- **Shared Computations**: Common data processing shared between formats
- **Memory Management**: Large datasets processed incrementally where possible

## References
- [Google Docs API Documentation](https://developers.google.com/docs/api)
- [Google Drive API Documentation](https://developers.google.com/drive/api)
- [Todoist REST API Documentation](https://developer.todoist.com/rest/v2/)
- [Google Apps Script DocumentApp Reference](https://developers.google.com/apps-script/reference/document)
- [Google Apps Script DriveApp Reference](https://developers.google.com/apps-script/reference/drive)