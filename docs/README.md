# Architectural Decision Records (ADRs)

This directory contains the Architectural Decision Records for the todoist-snapshot project. ADRs document the key architectural choices made during the development of this Google Apps Script application.

## Purpose

ADRs help maintain institutional knowledge by documenting:
- **What** architectural decisions were made
- **Why** those decisions were chosen over alternatives  
- **What** the consequences and tradeoffs are
- **When** the decisions were made and by whom

## ADR Index

| ADR | Title | Status | Date |
|-----|-------|--------|------|
| [ADR-0001](./ADR-0001-technology-stack-selection.md) | Technology Stack Selection - Google Apps Script Runtime | Accepted | 2025-01-12 |
| [ADR-0002](./ADR-0002-multi-format-export-architecture.md) | Multi-Format Export Architecture | Accepted | 2025-01-12 |
| [ADR-0003](./ADR-0003-testing-infrastructure-jest-stateful-mocks.md) | Testing Infrastructure with Jest and Stateful Mocks | Accepted | 2025-01-12 |
| [ADR-0004](./ADR-0004-configuration-management-properties-service.md) | Configuration Management via PropertiesService | Accepted | 2025-01-12 |
| [ADR-0005](./ADR-0005-mock-system-architecture-google-apps-script-apis.md) | Mock System Architecture for Google Apps Script APIs | Accepted | 2025-01-12 |
| [ADR-0006](./ADR-0006-test-driven-development-90-percent-coverage.md) | Test-Driven Development Approach with 90%+ Coverage | Accepted | 2025-01-12 |
| [ADR-0007](./ADR-0007-default-overdue-task-inclusion.md) | Default Overdue Task Inclusion in Exports | Accepted | 2025-08-19 |

## Key Architectural Themes

### **Platform Choice** (ADR-0001)
The decision to use Google Apps Script as the runtime platform enabled zero-infrastructure deployment while providing native Google Workspace integration, though it introduced platform-specific constraints and testing challenges.

### **Export Flexibility** (ADR-0002) 
The multi-format export architecture supports diverse user needs (rich formatting, plain text, structured data) through a unified processing pipeline that maximizes efficiency while maintaining format-specific optimizations.

### **Testing Strategy** (ADR-0003, ADR-0005, ADR-0006)
A comprehensive testing approach using Jest with sophisticated stateful mocks overcomes Google Apps Script's cloud-only execution limitations, enabling local development with 90%+ test coverage through test-driven development practices.

### **Configuration & Security** (ADR-0004)
Leveraging Google Apps Script's PropertiesService provides secure, encrypted credential storage with user-friendly URL parsing, balancing security requirements with ease of setup.

## ADR Template

Each ADR follows this structure:
- **Status**: Proposed | Accepted | Rejected | Superseded | Deprecated
- **Context**: The circumstances that led to the need for a decision
- **Decision**: The chosen solution and rationale
- **Alternatives Considered**: Other options evaluated with pros/cons
- **Consequences**: Positive, negative, and neutral impacts
- **Implementation Notes**: Technical details and guidelines
- **References**: Related documentation and resources

## Contributing

When making significant architectural changes:
1. Create a new ADR documenting the decision
2. Use the next sequential number (ADR-0007, etc.)
3. Update this README with the new ADR entry
4. Consider whether existing ADRs need status updates (superseded, deprecated)

## References

- [Documenting Architecture Decisions](https://cognitect.com/blog/2011/11/15/documenting-architecture-decisions) - Original ADR concept
- [ADR Tools and Templates](https://github.com/joelparkerhenderson/architecture-decision-record) - Community resources
- [Todoist Snapshot Development Guide](../CLAUDE.md) - Project-specific development practices