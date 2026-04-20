# BrandEx Ledger

A modern, offline-first client ledger management system built with vanilla HTML, CSS, and JavaScript. Perfect for law firms, consultants, and small businesses to track client accounts, payments, and outstanding balances.

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Offline](https://img.shields.io/badge/offline-ready-brightgreen.svg)

## Features

### Dashboard
- **Summary Statistics**: View Total Clients, Total Due, Total Received, and Total Balance at a glance
- **Client Cards**: Visual cards displaying Client Code, City, Name, and Outstanding Balance
- **Search & Filter**: Quickly find clients by name or code
- **Sorting**: Sort clients by Code, Name, City, or Balance (ascending/descending)
- **Quick Actions**: Add, Edit, or Delete clients directly from each card

### Ledger View
- **Full Transaction History**: Click any client card to view their complete ledger
- **Detailed Columns**: Date, Folder No, Stage (S1–S4 + Custom), TM No, Class (1–45), Details, Due, Received, Balance
- **Color-Coded Rows**:
  - Green highlight for Payment Received entries
  - Yellow highlight for Opening Balance entries
- **Running Balance**: Automatically calculated row-by-row
- **Advanced Filtering**: Filter by stage, search by details/folder/TM number
- **Column Sorting**: Sort by any column (date, folder, stage, amounts)

### Add Entry Modal
- **Entry Types**: Normal, Payment Received, or Opening Balance
- **Custom Stages**: Select predefined stages (S1–S4) or enter custom stage names
- **Auto Calculation**: Balance automatically calculated from Due − Received
- **Class Selection**: Dropdown with 45 class options

### Settings Page
- **Firm Branding**:
  - Upload your firm logo (saved in browser, displayed in topbar)
  - Configure firm name, address, phone, and email
- **Bank Details**: Store bank name, account number, IBAN, and account title
- **Persistent Settings**: All settings saved to browser Local Storage

### Data Management
- **Export Backup**: Download complete data as JSON file for safekeeping
- **Import Backup**: Restore data from previously exported JSON file
- **Clear Data**: Option to clear all data with double-confirmation
- **Privacy First**: All data lives in your browser's Local Storage — no internet required, works fully offline

## Technology Stack

- **Frontend**: Pure HTML5, CSS3, JavaScript (ES6+)
- **Storage**: Browser Local Storage
- **Styling**: Custom NeoBrutalism design with CSS variables
- **Fonts**: Space Grotesk (display), IBM Plex Mono (data)
- **No Dependencies**: Zero external dependencies for core functionality

## Installation & Usage

### Quick Start
1. Clone or download this repository
2. Open `index.html` in any modern web browser
3. Start adding clients and ledger entries
4. Save the HTML file to your desktop for daily offline use

### Local Preview
Run a local web server to preview the application:

```bash
# Using Python 3
python -m http.server 8000

# Using Python 2
python -m SimpleHTTPServer 8000

# Using Node.js (http-server)
npx http-server -p 8000

# Using PHP
php -S localhost:8000
```

Then open http://localhost:8000 in your browser.

### Deployment
Simply upload `index.html` to any static hosting service:
- GitHub Pages
- Netlify
- Vercel
- Any web server

## Browser Compatibility

- Chrome/Edge (recommended)
- Firefox
- Safari
- Opera

Requires Local Storage support (available in all modern browsers).

## Data Storage

All data is stored in your browser's Local Storage under the key `brandex_ledger_data`. This means:
- **Privacy**: Data never leaves your device
- **Offline**: Works without internet connection
- **Portable**: Export/import JSON backups to transfer data between devices
- **Capacity**: Limited by browser Local Storage quota (typically 5-10MB)

## Project Structure

```
C-Ledger/
├── index.html          # Single-file application (HTML + CSS + JS)
├── README.md           # This file
└── CHANGELOG.md        # Version history and modifications
```

## Customization

### Colors
Edit the CSS variables in `:root` to customize the color scheme:

```css
:root {
  --black: #0a0a0a;
  --white: #fafaf0;
  --yellow: #FFE234;
  --blue: #2563FF;
  --red: #FF3B30;
  --green: #00C853;
  /* ... more variables */
}
```

### Currency
The application uses PKR (Pakistani Rupee) as default currency. To change:
1. Search for "PKR" in `index.html`
2. Replace with your preferred currency code

## Backup & Recovery

### Export Backup
1. Go to Settings page
2. Click "Export Backup (JSON)"
3. Save the downloaded file to your computer

### Import Backup
1. Go to Settings page
2. Click "Import Backup (JSON)"
3. Select your previously exported JSON file
4. Confirm the import

### Clear All Data
1. Go to Settings page
2. Click "Clear ALL Data"
3. Confirm the warning dialog
4. Confirm again to permanently delete all data

## License

MIT License - feel free to use, modify, and distribute as needed.

## Contributing

Contributions are welcome! Feel free to:
- Report bugs
- Suggest new features
- Submit pull requests

## Support

For issues, questions, or suggestions, please open an issue on GitHub.

---

**Built with ❤️ for BrandEx Law Associates**
