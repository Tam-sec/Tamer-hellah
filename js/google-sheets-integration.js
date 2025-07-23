// Google Sheets Integration for booking data
class GoogleSheetsIntegration {
    constructor() {
        this.sheetId = 'YOUR_GOOGLE_SHEET_ID'; // Replace with your Google Sheet ID
        this.apiKey = 'YOUR_GOOGLE_SHEETS_API_KEY'; // Replace with your API key
    }

    async saveBooking(bookingData) {
        const url = `https://sheets.googleapis.com/v4/spreadsheets/${this.sheetId}/values/Sheet1:append?valueInputOption=RAW&key=${this.apiKey}`;
        
        const values = [[
            new Date().toISOString(),
            bookingData.name || '',
            bookingData.phone || '',
            bookingData.service || '',
            bookingData.preferredTime || ''
        ]];

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    values: values
                })
            });

            if (response.ok) {
                console.log('Booking saved to Google Sheets successfully');
                return true;
            } else {
                throw new Error('Failed to save to Google Sheets');
            }
        } catch (error) {
            console.error('Error saving to Google Sheets:', error);
            return false;
        }
    }
}