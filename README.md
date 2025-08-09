# Todoist to Google Docs or Text File Sync

This Google Apps Script automatically syncs your Todoist tasks to a Google Document or a plain text file, creating a daily task list with priorities, due dates, descriptions, and labels.

## Features

- ✅ Fetches tasks with due dates from Todoist
- 📝 Creates formatted Google Doc with grouped tasks by project
- 📄 Optionally exports to a plain text file in Google Drive
- 🏷️ Displays task priorities (P1, P2, P3), labels, and descriptions
- 📅 Shows due dates and times in your preferred timezone
- ✨ Supports Markdown formatting (bold, italic, links)
- 🔒 Secure credential storage using Google Apps Script PropertiesService
- ⏰ Can be scheduled to run automatically

## Prerequisites

- Google account with access to Google Apps Script
- Todoist account with API access
- A Google Document or a plain text file in Google Drive where you want the tasks to be written

## Setup Instructions

### 1. Get Your Todoist API Token

1. Go to [Todoist Integrations](https://todoist.com/prefs/integrations)
2. Scroll down to "API token" section
3. Copy your API token (it will look like: `0123456789abcdef0123456789abcdef01234567`)

### 2. Create a Google Document or a Plain Text File

You can target either a Google Doc (rich formatting) or a plain text file (simple list). Use one or both.

#### Option A: Google Doc
1. Create a new Google Document where your tasks will be synced
2. Copy the document link (URL). Example: `https://docs.google.com/document/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit`

#### Option B: Plain Text File
1. In Google Drive, create or upload a `.txt` file (e.g., `todoist-snapshot.txt`)
2. Right-click the file → Get link → Copy link. Example: `https://drive.google.com/file/d/1AbCdEFghIJklMNopQRstuVWxyz123456/view?usp=sharing`

### 3. Set Up Google Apps Script

1. Go to [Google Apps Script](https://script.google.com/)
2. Create a new project
3. Delete the default `Code.gs` content
4. Create one file in your project:
   - `todoist-snapshot.gs` (copy the contents from this repository)

### 4. Configure Script Properties (URLs + Token)

Use the Apps Script UI to set properties. Paste full sharing URLs; the script will extract IDs automatically.

1. In the Apps Script editor, open Project settings (gear icon) → Script properties → Add script property
2. Add these properties:
   - `TODOIST_TOKEN`: your Todoist API token
   - `DOC_ID` (optional): Google Doc sharing URL if you want Doc output
   - `TEXT_FILE_ID` (optional): Drive file sharing URL (.txt) if you want text output
   - `TIMEZONE` (optional): e.g., `America/Chicago`
3. Save the properties

### 5. Test the Sync

Primary entry point:
1. Run the `syncTodoist()` function from `todoist-snapshot.gs`
2. Behavior:
   - If only `DOC_ID` is set, it updates the Google Doc
   - If only `TEXT_FILE_ID` is set, it overwrites the text file
   - If both are set, it fetches once and updates both outputs
3. Optionally, you can run the specific targets directly:
   - `syncTodoistToDoc()`
   - `syncTodoistToTextFile()`

### 6. Set Up Automatic Sync (Optional)

To automatically sync your tasks daily:

1. In Google Apps Script, click on the clock icon (⏰) in the left sidebar (Triggers)
2. Click "+ Add Trigger"
3. Configure the trigger:
   - Choose which function to run: `syncTodoist`
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
4. **Writes Output**:
   - If targeting a Google Doc: clears the document and writes the formatted list
   - If targeting a text file: builds a plaintext snapshot and overwrites the file content

## Text File Export Notes

- Overwrite behavior: each run replaces the entire file content
- No ID needed: paste the Drive file URL into config; the script extracts the ID automatically
- Formatting: plaintext output includes priorities, descriptions, due dates, and labels, but no rich formatting
- Permissions: the first run will prompt to authorize Drive access (used by `DriveApp`)

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
   - Ensure you pasted the Google Doc URL in config
   - Make sure the document exists and is accessible

3. **Tasks not appearing**
   - Check that you have tasks with due dates in Todoist
   - Verify the API token has proper permissions
   - Check the execution log for API errors

4. **Permission errors**
   - Make sure you've authorized the script to access both Todoist and Google Docs
   - Re-run the authorization if needed

### Debug Functions

- Not required. Configuration is read directly from Script properties.

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