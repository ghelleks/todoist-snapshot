# ADR-0007: Default Overdue Task Inclusion in Exports

## Status
Accepted

## Context
The todoist-snapshot application originally used a Todoist API filter that excluded tasks without due dates (`!(no due date)`). This approach had an unintended consequence: overdue tasks were not being included in exports by default, leading to users potentially missing important tasks that had passed their due dates.

### Problem Statement
Users reported in issue #2 that overdue tasks were not appearing in their daily task exports. This created a significant workflow problem:
- **Missed Overdue Tasks**: Important tasks that had passed their due date were invisible in exports
- **Incomplete Task Lists**: Daily exports did not provide a complete picture of actionable work
- **User Confusion**: The behavior was counter-intuitive—users expected to see overdue tasks in their task lists

### Original Implementation
```javascript
// Previous filter - excluded tasks without due dates but also missed overdue items
const taskFilter = encodeURIComponent('!(no due date)');
```

### User Impact
- Export completeness was compromised
- Users had to manually check Todoist for overdue tasks
- Daily workflow planning was hindered by incomplete task visibility

## Decision
Changed the default Todoist API filter from `!(no due date)` to `overdue | today | future` to explicitly include overdue tasks in all exports.

### Rationale
1. **Comprehensive Task Visibility**: Users need to see ALL actionable tasks, especially overdue ones
2. **Intuitive Behavior**: Overdue tasks are inherently more urgent and should always be visible
3. **Better Workflow Support**: Complete task lists enable better daily planning
4. **Explicit Intent**: The new filter clearly states what types of tasks are included
5. **User Expectation Alignment**: Matches what users naturally expect from a task export

### New Implementation
```javascript
// New filter - explicitly includes overdue, today's, and future tasks
const taskFilter = encodeURIComponent('overdue | today | future');
```

## Alternatives Considered

### Option 1: Keep Original Filter with Documentation
- **Description**: Maintain `!(no due date)` filter and document the limitation
- **Pros**: No behavior change for existing users
- **Cons**: Does not solve the core problem, users would continue missing overdue tasks
- **Rejected**: Does not address the fundamental issue

### Option 2: Make Filter Configurable
- **Description**: Add configuration option to choose between filters
- **Pros**: Maximum flexibility for different user preferences
- **Cons**: Increases complexity, most users would want overdue tasks included
- **Rejected**: Adds unnecessary complexity for minimal benefit

### Option 3: Include All Tasks (No Filter)
- **Description**: Remove filter entirely to include all tasks regardless of due date
- **Pros**: Maximum task visibility
- **Cons**: Could overwhelm users with tasks that have no due dates, potentially infinite backlog
- **Rejected**: Could create overwhelming task lists

### Option 4: Overdue + Today Only
- **Description**: Filter for `overdue | today` to focus on immediately actionable items
- **Pros**: Focuses on most urgent tasks
- **Cons**: Future tasks with specific due dates would be missed
- **Rejected**: Future tasks with due dates are relevant for planning

## Consequences

### Positive
- **Complete Task Visibility**: Users now see all time-relevant tasks including overdue items
- **Improved User Experience**: Resolves the primary complaint from issue #2
- **Better Daily Planning**: Exports now provide comprehensive actionable task lists
- **Intuitive Behavior**: Filter behavior now matches user expectations
- **Explicit Logic**: The new filter clearly communicates its intent through naming

### Negative
- **Behavior Change**: Existing users will see more tasks in their exports (though this is generally beneficial)
- **Potential Information Overload**: Users with many overdue tasks might see longer lists
- **Filter Dependency**: Still depends on specific Todoist filter syntax

### Neutral
- **Performance Impact**: Minimal—the API request complexity remains similar
- **Maintenance**: Filter logic remains equally maintainable
- **Testing**: Required updating test expectations but no additional complexity

## Implementation Notes

### Code Changes
1. **Main Filter Update** (todoist-snapshot.gs:202):
   ```javascript
   const taskFilter = encodeURIComponent('overdue | today | future');
   ```

2. **Test Updates** (tests/unit/api-integration.test.js):
   - Updated test expectations to verify the new filter string
   - Modified test name to reflect overdue inclusion purpose

3. **Documentation Updates** (README.md):
   - Updated feature descriptions to mention overdue task handling
   - Clarified task filtering behavior in multiple sections

### Todoist API Filter Syntax
- Uses Todoist's native filter language with pipe (`|`) operator for OR logic
- `overdue`: Tasks past their due date
- `today`: Tasks due today
- `future`: Tasks with future due dates

### Backwards Compatibility
- No breaking changes to API or configuration
- Users will simply see additional (overdue) tasks in their exports
- All existing functionality remains intact

## References
- [Issue #2: Include overdue items in export by default](https://github.com/ghelleks/todoist-snapshot/issues/2)
- [Todoist Filter Documentation](https://todoist.com/help/articles/205248842)
- [Pull Request #4: Implementation](https://github.com/ghelleks/todoist-snapshot/pull/4)
- [ADR-0002: Multi-Format Export Architecture](./ADR-0002-multi-format-export-architecture.md) - Related export functionality