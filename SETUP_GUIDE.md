# C-Ledger Setup Guide
## Complete Guide for Non-Coders

This guide will help you set up the C-Ledger Case Management System on your computer, even if you have no coding experience.

---

## Table of Contents
1. [What You Need](#what-you-need)
2. [Step 1: Install Node.js](#step-1-install-nodejs)
3. [Step 2: Install Git](#step-2-install-git)
4. [Step 3: Download the Project](#step-3-download-the-project)
5. [Step 4: Install Dependencies](#step-4-install-dependencies)
6. [Step 5: Run the Application](#step-5-run-the-application)
7. [Step 6: Migrate Existing Data (Optional)](#step-6-migrate-existing-data-optional)
8. [Step 7: Configure Google Drive Backup (Optional)](#step-7-configure-google-drive-backup-optional)
9. [Daily Usage](#daily-usage)
10. [Troubleshooting](#troubleshooting)

---

## What You Need

- A Windows computer
- Internet connection (for initial setup only)
- About 15-20 minutes of time

---

## Step 1: Install Node.js

Node.js is a program that lets the application run on your computer.

### How to Install:

1. Open your web browser (Chrome, Edge, etc.)
2. Go to: https://nodejs.org
3. Click the **"LTS"** button (Long Term Support - this is the stable version)
4. The download will start automatically
5. Once downloaded, open the file (usually in your Downloads folder)
6. Click **"Next"** through all the installation screens
7. Click **"Install"** and wait for it to finish
8. Click **"Finish"**

### Verify Installation:

1. Press `Windows key + R` on your keyboard
2. Type `cmd` and press Enter (a black window will open)
3. Type: `node --version`
4. Press Enter
5. You should see a version number like `v20.10.0`
6. If you see this, Node.js is installed correctly!

**Close the black window (cmd) when done.**

---

## Step 2: Install Git

Git is used to save your work and manage versions.

### How to Install:

1. Open your web browser
2. Go to: https://git-scm.com/download/win
3. The download will start automatically
4. Once downloaded, open the file
5. Click **"Next"** through all screens (use default settings)
6. Click **"Install"** and wait for it to finish
7. Click **"Finish"**

### Verify Installation:

1. Press `Windows key + R`
2. Type `cmd` and press Enter
3. Type: `git --version`
4. Press Enter
5. You should see a version number like `git version 2.43.0`

**Close the black window when done.**

---

## Step 3: Download the Project

You should already have the project folder. If not, follow these steps:

### If You Have the Project Folder:

1. Find the folder named `C-Ledger` on your computer
2. Right-click on it and choose "Copy"
3. Paste it where you want to keep it (Desktop or Documents is good)

### If You Need to Download from GitHub:

1. Go to the GitHub repository link provided to you
2. Click the green **"Code"** button
3. Click **"Download ZIP"**
4. Wait for the download to finish
5. Open your Downloads folder
6. Right-click the ZIP file and choose **"Extract All"**
7. Choose where to extract it (Desktop is recommended)
8. Click **"Extract"**

---

## Step 4: Install Dependencies

This step installs all the needed programs for C-Ledger to work.

1. Open the `C-Ledger` folder
2. Click the address bar at the top (it shows the folder path)
3. Type `cmd` and press Enter (a black window will open in that folder)
4. Type the following command and press Enter:

```
npm install
```

5. Wait for this to finish (it may take 1-2 minutes)
6. You'll see many lines of text scrolling - this is normal!
7. When it stops, you should see something like "added 80 packages"
8. If you see any red errors, let us know

**Keep the black window open for the next step.**

---

## Step 5: Run the Application

Now let's start the application!

1. In the same black window from Step 4, type:

```
npm run dev
```

2. Press Enter
3. Wait a few seconds
4. You should see something like:
   ```
   Local: http://localhost:5173/
   ```
5. Open your web browser (Chrome or Edge)
6. Go to: http://localhost:5173
7. The C-Ledger application should open!

**Keep the black window open while using the application. If you close it, the app will stop.**

---

## Step 6: Migrate Existing Data (Optional)

If you have data from the old version (the HTML file), you can migrate it to the new system.

### Export from Old Version:

1. Open the old `index.html` file in your browser
2. Go to the **Settings** page
3. Click **"Export Backup (JSON)"**
4. Save the file somewhere you can find it (Desktop is good)
5. Note the file name (it will be like `BrandEx-Ledger-Backup-2026-04-20.json`)

### Import to New Version:

1. Open a new black window (cmd) in the C-Ledger folder
2. Type this command (replace with your actual file path):

```
node src/db/migrate.js "C:\Users\YourName\Desktop\BrandEx-Ledger-Backup-2026-04-20.json"
```

3. Press Enter
4. Wait for the migration to complete
5. You should see a summary of what was migrated
6. Refresh your browser (F5) to see the migrated data

---

## Step 7: Configure Google Drive Backup (Optional)

This step is optional but recommended for automatic cloud backups.

### Prerequisites:
- A Google account
- About 10 minutes

### Step 7.1: Create Google Cloud Project

1. Go to: https://console.cloud.google.com
2. Sign in with your Google account
3. Click the project dropdown at the top
4. Click **"NEW PROJECT"**
5. Enter project name: `C-Ledger Backup`
6. Click **"CREATE"**
7. Wait for it to create (about 30 seconds)

### Step 7.2: Enable Google Drive API

1. In the left menu, click **"APIs & Services"** → **"Library"**
2. Search for: "Google Drive API"
3. Click on it
4. Click **"ENABLE"**

### Step 7.3: Create Credentials

1. In the left menu, click **"APIs & Services"** → **"Credentials"**
2. Click **"+ CREATE CREDENTIALS"** at the top
3. Choose **"OAuth client ID"**
4. If asked to configure consent screen:
   - Click **"External"** → **"Create"**
   - Fill in:
     - App name: `C-Ledger Backup`
     - User support email: your email
     - Developer contact: your email
   - Click **"SAVE AND CONTINUE"** through all steps
5. Back to credentials:
   - Application type: **"Desktop app"**
   - Name: `C-Ledger`
   - Click **"CREATE"**
6. A popup will appear with your credentials
7. Click **"DOWNLOAD JSON"**
8. Save the file as `credentials.json` in the C-Ledger folder
9. Click **"OK"** to close the popup

### Step 7.4: Authorize the App

1. In the C-Ledger folder, you should now have `credentials.json`
2. Open the C-Ledger application in your browser
3. Go to **Settings**
4. Enable **"Google Drive Sync"**
5. The first time, you'll need to authorize:
   - A link will appear in the black window (cmd)
   - Copy that link and open it in your browser
  . Sign in to your Google account
   - Click **"Allow"**
   - Copy the authorization code
   - Paste it back in the black window
   - Press Enter

Now your backups will automatically sync to Google Drive!

---

## Daily Usage

### Starting the Application:

1. Open the C-Ledger folder
2. Click the address bar and type `cmd`, press Enter
3. Type: `npm run dev`
4. Press Enter
5. Open http://localhost:5173 in your browser

### Stopping the Application:

1. Go to the black window (cmd)
2. Press `Ctrl + C` on your keyboard
3. The window will say "Terminating batch job"
4. Press `Y` and Enter
5. Close the window

### Backups:

- Automatic backups are created based on your settings (default: hourly)
- Local backups are saved in the `public/backup` folder
- If Google Drive is enabled, backups also sync to your Google Drive
- Manual backup: Go to Settings → Click "Export Backup"

---

## Troubleshooting

### Problem: "node is not recognized"

**Solution:** Node.js is not installed or not in your PATH. Reinstall Node.js from Step 1 and restart your computer.

### Problem: "npm is not recognized"

**Solution:** Node.js installation didn't complete properly. Reinstall Node.js from Step 1.

### Problem: Port 5173 is already in use

**Solution:** The app is already running! Check if you have another black window open with the app running. Or close any other apps using port 5173.

### Problem: Database locked error

**Solution:** You have two instances of the app running. Close one of them (close the extra cmd window).

### Problem: Google Drive authentication fails

**Solution:**
1. Delete the `token.json` file from the C-Ledger folder
2. Restart the app
3. Try the authorization process again

### Problem: Can't find my migrated data

**Solution:**
1. Make sure you used the correct file path in the migration command
2. Check that the JSON file is the correct backup file
3. Try running the migration command again

### Problem: App shows blank screen

**Solution:**
1. Clear your browser cache (Ctrl + Shift + Delete)
2. Try a different browser (Chrome or Edge)
3. Make sure the cmd window shows no errors

### Problem: Backups not creating

**Solution:**
1. Check that the `public/backup` folder exists
2. Make sure you have write permissions to that folder
3. Check the Settings page to confirm backup frequency is set

---

## Getting Help

If you encounter any issues not covered here:

1. Check the black window (cmd) for error messages
2. Take a screenshot of the error
3. Note what you were trying to do when the error occurred
4. Contact support with this information

---

## Tips for Non-Coders

- **Always keep the black window (cmd) open** while using the app
- **Don't delete the C-Ledger folder** - this contains all your data
- **Regular backups** are important - check Settings to ensure they're enabled
- **Export manual backups** before making big changes
- **The database file (ledger.db)** contains all your data - don't delete it!
- If something seems wrong, **refresh the browser** (F5) first
- If that doesn't work, **restart the app** (close cmd, open it again, run `npm run dev`)

---

## Quick Reference

**Start App:** `npm run dev`
**Stop App:** `Ctrl + C` in cmd window
**Install Dependencies:** `npm install`
**Migrate Data:** `node src/db/migrate.js "path/to/backup.json"`

---

## File Structure (For Reference)

```
C-Ledger/
├── ledger.db              # Your main database (IMPORTANT!)
├── package.json           # Project configuration
├── src/                   # Application code
│   ├── db/               # Database files
│   ├── components/       # UI components
│   └── backup/           # Backup system
├── public/               # Public files
│   └── backup/           # Local backup folder
└── credentials.json      # Google Drive credentials (if configured)
```

---

**Congratulations! You've successfully set up C-Ledger. Enjoy managing your trademark cases!**
