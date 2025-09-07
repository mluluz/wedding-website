/**
 * Google Apps Script for Wedding RSVP Form Integration
 * 
 * IMPORTANT: To fix "This app is blocked" error:
 * 1. Create a new Google Sheet for your wedding RSVPs
 * 2. Go to Extensions > Apps Script in your Google Sheet
 * 3. Replace the default code with this script
 * 4. Save the project (give it a clear name like "Wedding RSVP Handler")
 * 5. Click "Run" button to test and grant permissions
 * 6. When prompted, click "Advanced" then "Go to [Your Project Name] (unsafe)"
 * 7. Grant all requested permissions
 * 8. Deploy as web app with these settings:
 *    - Execute as: Me (your account)
 *    - Who has access: Anyone (even anonymous)
 * 9. Copy the deployment URL to use in your website
 * 
 * If still blocked, use Solution 2 or 3 below.
 */

function doPost(e) {
  try {
    // Get the active spreadsheet (the one this script is bound to)
    const sheet = SpreadsheetApp.getActiveSheet();
    
    // Parse the form data
    const data = JSON.parse(e.postData.contents);
    
    // Check if headers exist, if not create them
    if (sheet.getLastRow() === 0) {
      const headers = [
        'Timestamp',
        'Name',
        'Email',
        'Has Partner',
        'Partner Name',
        'Partner Email',
        'Friday Attendance',
        'Saturday Attendance',
        'Sunday Attendance',
        'Dietary Requirements',
        'Number of Children',
        'Nanny Services',
        'Additional Comments'
      ];
      sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
      
      // Style the header row
      const headerRange = sheet.getRange(1, 1, 1, headers.length);
      headerRange.setBackground('#c80000');
      headerRange.setFontColor('white');
      headerRange.setFontWeight('bold');
      headerRange.setWrap(true);
    }
    
    // Prepare row data
    const timestamp = new Date();
    const rowData = [
      timestamp,
      data.name || '',
      data.email || '',
      data.partner || 'no',
      data.partnerName || '',
      data.partnerEmail || '',
      data.friday || 'not selected',
      data.saturday || 'not selected',
      data.sunday || 'not selected',
      data.dietary || '',
      data.kids || '0',
      data.nannies || 'not selected',
      data.comments || ''
    ];
    
    // Add the data to the sheet
    sheet.appendRow(rowData);
    
    // Auto-resize columns for better readability
    sheet.autoResizeColumns(1, sheet.getLastColumn());
    
    // Return success response
    return ContentService
      .createTextOutput(JSON.stringify({
        status: 'success',
        message: 'RSVP submitted successfully!'
      }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    // Return error response
    console.error('Error processing RSVP:', error);
    return ContentService
      .createTextOutput(JSON.stringify({
        status: 'error',
        message: 'Failed to submit RSVP. Please try again.'
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  // Handle GET requests (for testing)
  return ContentService
    .createTextOutput(JSON.stringify({
      status: 'success',
      message: 'Wedding RSVP API is working!'
    }))
    .setMimeType(ContentService.MimeType.JSON);
}