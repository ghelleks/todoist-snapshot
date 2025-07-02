# Todoist to Google Docs Sync

This Google Apps Script automatically syncs your Todoist tasks to a Google Document, creating a formatted daily task list with priorities, due dates, descriptions, and labels.

## Features

- ✅ Fetches tasks with due dates from Todoist
- 📝 Creates formatted Google Doc with grouped tasks by project
- 🏷️ Displays task priorities (P1, P2, P3), labels, and descriptions
- 📅 Shows due dates and times in your preferred timezone
- ✨ Supports Markdown formatting (bold, italic, links)
- 🔒 Secure credential storage using Google Apps Script PropertiesService
- ⏰ Can be scheduled to run automatically

## Prerequisites

- Google account with access to Google Apps Script
- Todoist account with API access
- A Google Document where you want the tasks to be written

## Setup Instructions

### 1. Get Your Todoist API Token

1. Go to [Todoist Integrations](https://todoist.com/prefs/integrations)
2. Scroll down to "API token" section
3. Copy your API token (it will look like: `0123456789abcdef0123456789abcdef01234567`)

### 2. Create a Google Document

1. Create a new Google Document where your tasks will be synced
2. Copy the document ID from the URL
   - Example URL: `https://docs.google.com/document/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit`
   - Document ID: `1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms`

### 3. Set Up Google Apps Script

1. Go to [Google Apps Script](https://script.google.com/)
2. Create a new project
3. Delete the default `Code.gs` content
4. Create two new files in your project:
   - `todoist-snapshot.gs` (copy the contents from this repository)
   - `config.gs` (copy the contents from this repository)

### 4. Configure Your Credentials

1. In the Google Apps Script editor, open `config.gs`
2. Find the `setupConfig()` function
3. Replace the placeholder values with your actual credentials:
   ```javascript
   const config = {
     'TODOIST_TOKEN': 'your_actual_todoist_token_here',
     'DOC_ID': 'your_actual_google_doc_id_here',
     'TIMEZONE': 'America/Chicago' // Optional: change to your timezone
   };
   ```
4. Save the file
5. Run the `setupConfig()` function:
   - Select `setupConfig` from the function dropdown
   - Click the "Run" button (▶️)
   - Authorize the script when prompted
6. **Important**: After running `setupConfig()`, remove or comment out your actual credentials from the `config.gs` file for security

### 5. Verify Configuration

1. Run the `verifyConfig()` function to ensure everything is set up correctly
2. Check the execution log to confirm all credentials are configured

### 6. Test the Sync

1. Run the `syncTodoistToDoc()` function from `todoist-snapshot.gs`
2. Check your Google Document to see if tasks appear
3. Verify the formatting looks correct

### 7. Set Up Automatic Sync (Optional)

To automatically sync your tasks daily:

1. In Google Apps Script, click on the clock icon (⏰) in the left sidebar (Triggers)
2. Click "+ Add Trigger"
3. Configure the trigger:
   - Choose which function to run: `syncTodoistToDoc`
   - Choose which deployment should run: `Head`
   - Select event source: `Time-driven`
   - Select type of time based trigger: `Day timer`
   - Select time of day: Choose your preferred time (e.g., "6am to 7am")
4. Save the trigger

## How It Works

The script:

1. **Fetches Tasks**: Uses the Todoist API to get all tasks that have due dates
2. **Groups by Project**: Organizes tasks by their Todoist projects (with Inbox first)
3. **Formats Content**: Applies formatting including:
   - **Bold** task titles
   - Priority indicators (P1, P2, P3)
   - Due dates and times in your timezone
   - Task descriptions
   - Labels in brackets
   - Markdown formatting (bold, italic, links)
4. **Updates Document**: Clears the Google Doc and writes the new task list

## Configuration Options

### Timezone

You can set your preferred timezone by updating the `TIMEZONE` property. Common examples:
- `America/New_York` (Eastern Time)
- `America/Chicago` (Central Time)
- `America/Denver` (Mountain Time)
- `America/Los_Angeles` (Pacific Time)
- `Europe/London` (GMT/BST)
- `Europe/Paris` (CET/CEST)

### Task Filtering

By default, the script fetches tasks with due dates using the filter `!(no due date)`. You can modify this in the `getTodoistData()` function if you want different filtering logic.

## Troubleshooting

### Common Issues

1. **"TODOIST_TOKEN is not configured" error**
   - Make sure you ran the `setupConfig()` function
   - Verify your API token is correct

2. **"DOC_ID is not configured" error**
   - Ensure you copied the correct Google Doc ID
   - Make sure the document exists and is accessible

3. **Tasks not appearing**
   - Check that you have tasks with due dates in Todoist
   - Verify the API token has proper permissions
   - Check the execution log for API errors

4. **Permission errors**
   - Make sure you've authorized the script to access both Todoist and Google Docs
   - Re-run the authorization if needed

### Debug Functions

The `config.gs` file includes helpful functions:
- `verifyConfig()` - Check if all configuration is set up correctly
- `clearConfig()` - Remove all stored configuration (use with caution)

## Security Notes

- Your credentials are stored securely using Google Apps Script's PropertiesService
- Never commit your actual API tokens to version control
- The PropertiesService data is encrypted and only accessible by your script
- Consider regenerating your Todoist API token periodically

## Customization

You can customize the script by:
- Modifying the task filtering logic in `getTodoistData()`
- Changing the document formatting in `writeTasksToDoc()`
- Adjusting the Markdown parsing in `formatListItem()`
- Adding additional task properties or metadata

## License

This project is open source and available under the MIT License.

## Contributing

Feel free to submit issues, feature requests, or pull requests to improve this script! 