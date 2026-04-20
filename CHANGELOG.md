# Changelog

All notable changes to BrandEx Ledger will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Planned
- Multi-currency support
- Print/export ledger as PDF
- Dark mode theme option
- Advanced reporting and analytics

## [1.0.0] - 2025-04-20

### Added
- Initial release of BrandEx Ledger
- Dashboard with summary statistics (Total Clients, Total Due, Total Received, Total Balance)
- Client cards displaying Code, City, Name, and Outstanding Balance
- Search and sort functionality for clients (by Code/Name/City/Balance)
- Add/Edit/Delete client functionality
- Full ledger view for each client
- Ledger table with columns: Date, Folder No, Stage (S1-S4 + Custom), TM No, Class (1-45), Details, Due, Received, Balance
- Color-coded rows (green for received payments, yellow for opening balance)
- Running balance calculation row-by-row
- Filter ledger entries by stage
- Search ledger entries by details, folder number, TM number
- Sort ledger by any column
- Add Entry modal with entry types (Normal, Payment Received, Opening Balance)
- Custom stage option
- Auto-calculation of balance from Due - Received
- Class dropdown with 45 options
- Settings page for firm configuration
- Logo upload functionality (saved in browser)
- Firm name, address, phone, email configuration
- Bank account details (Bank Name, Account No, IBAN, Account Title)
- Data management features:
  - Export backup as JSON
  - Import backup from JSON
  - Clear all data with double-confirmation
- NeoBrutalism design theme
- Responsive mobile layout
- Offline-first architecture using Local Storage
- Zero external dependencies for core functionality
- Toast notifications for success/error messages
- Modal dialogs for forms

### Technical Details
- Single-file application (HTML + CSS + JS)
- Custom CSS variables for theming
- Space Grotesk and IBM Plex Mono fonts
- Cross-browser compatibility (Chrome, Firefox, Safari, Edge)
- Data persisted in browser Local Storage

---

## Versioning Scheme

- **Major version**: Incompatible API changes or major feature overhauls
- **Minor version**: New functionality in a backwards-compatible manner
- **Patch version**: Backwards-compatible bug fixes

## Modification Log

### 2025-04-20
- Initial project setup
- Added README.md with comprehensive documentation
- Added CHANGELOG.md for tracking modifications
- Configured Git repository with GitHub remote
