// ============================================================
// Google Drive Backup Sync
// ============================================================

import { google } from 'googleapis';
import { readFileSync } from 'fs';
import { join } from 'path';

// Google Drive API configuration
const SCOPES = ['https://www.googleapis.com/auth/drive.file'];
const TOKEN_PATH = join(process.cwd(), 'token.json');
const CREDENTIALS_PATH = join(process.cwd(), 'credentials.json');

let driveClient = null;

// Load credentials from file
export function loadCredentials() {
  try {
    const credentials = JSON.parse(readFileSync(CREDENTIALS_PATH, 'utf-8'));
    return credentials;
  } catch (error) {
    console.error('Error loading credentials:', error);
    return null;
  }
}

// Authenticate with Google Drive
export async function authenticate() {
  const credentials = loadCredentials();
  if (!credentials) {
    throw new Error('Google Drive credentials not found. Please setup credentials.json');
  }

  const { client_secret, client_id, redirect_uris } = credentials.installed || credentials.web;
  const oAuth2Client = new google.auth.OAuth2(
    client_id,
    client_secret,
    redirect_uris[0]
  );

  // Check if we have previously stored a token
  try {
    const token = JSON.parse(readFileSync(TOKEN_PATH, 'utf-8'));
    oAuth2Client.setCredentials(token);
    driveClient = google.drive({ version: 'v3', auth: oAuth2Client });
    return oAuth2Client;
  } catch (error) {
    // Token not found, user needs to authorize
    console.log('No valid token found. Please run the authorization flow.');
    return null;
  }
}

// Upload file to Google Drive
export async function uploadToDrive(filePath, folderId = null) {
  try {
    if (!driveClient) {
      await authenticate();
    }

    if (!driveClient) {
      throw new Error('Google Drive authentication failed');
    }

    const fileMetadata = {
      name: filePath.split(/[/\\]/).pop(),
    };

    if (folderId) {
      fileMetadata.parents = [folderId];
    }

    const media = {
      mimeType: 'application/x-sqlite3',
      body: readFileSync(filePath),
    };

    const file = await driveClient.files.create({
      resource: fileMetadata,
      media: media,
      fields: 'id',
    });

    console.log(`File uploaded to Google Drive: ${file.data.id}`);
    return { success: true, fileId: file.data.id };
  } catch (error) {
    console.error('Google Drive upload error:', error);
    return { success: false, error: error.message };
  }
}

// Find or create backup folder in Google Drive
export async function getOrCreateBackupFolder(folderName = 'C-Ledger Backups') {
  try {
    if (!driveClient) {
      await authenticate();
    }

    if (!driveClient) {
      throw new Error('Google Drive authentication failed');
    }

    // Search for existing folder
    const response = await driveClient.files.list({
      q: `name='${folderName}' and mimeType='application/vnd.google-apps.folder' and trashed=false`,
      fields: 'files(id, name)',
    });

    if (response.data.files.length > 0) {
      return response.data.files[0].id;
    }

    // Create new folder
    const fileMetadata = {
      name: folderName,
      mimeType: 'application/vnd.google-apps.folder',
    };

    const file = await driveClient.files.create({
      resource: fileMetadata,
      fields: 'id',
    });

    console.log(`Created backup folder: ${file.data.id}`);
    return file.data.id;
  } catch (error) {
    console.error('Folder creation error:', error);
    return null;
  }
}

// Sync backup to Google Drive
export async function syncToDrive(backupPath, folderName = 'C-Ledger Backups') {
  try {
    const folderId = await getOrCreateBackupFolder(folderName);
    if (!folderId) {
      throw new Error('Failed to get or create backup folder');
    }

    const result = await uploadToDrive(backupPath, folderId);
    return result;
  } catch (error) {
    console.error('Sync error:', error);
    return { success: false, error: error.message };
  }
}
