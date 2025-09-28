import { google } from 'googleapis';
import { GoogleAuth } from 'google-auth-library';

// Google Sheets integration for North Harbour Rugby Performance Hub
// This service connects to Google Sheets to pull real player data

interface PlayerDataRow {
  name: string;
  position: string;
  jerseyNumber: number;
  weight: number;
  height: number;
  age: number;
  fitnessScore: number;
  injuryStatus: string;
  lastMatch: string;
  gpsDistance: number;
  topSpeed: number;
  tackles: number;
  carries: number;
  passAccuracy: number;
}

class GoogleSheetsService {
  private sheets: any;
  private auth: GoogleAuth;

  constructor() {
    // Handle different private key formats and ensure proper formatting
    let privateKey = process.env.GOOGLE_PRIVATE_KEY;
    if (privateKey) {
      // Replace escaped newlines with actual newlines
      privateKey = privateKey.replace(/\\n/g, '\n');
      
      // Ensure proper BEGIN/END headers if missing
      if (!privateKey.includes('-----BEGIN PRIVATE KEY-----')) {
        privateKey = `-----BEGIN PRIVATE KEY-----\n${privateKey}\n-----END PRIVATE KEY-----`;
      }
    }

    this.auth = new GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        private_key: privateKey,
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    });
    
    this.sheets = google.sheets({ version: 'v4', auth: this.auth });
  }

  /**
   * Fetches player data from Google Sheets
   * @param spreadsheetId - The ID of your Google Sheet
   * @param range - The range to read (e.g., 'Players!A2:M100')
   */
  async getPlayerData(spreadsheetId: string, range: string): Promise<PlayerDataRow[]> {
    try {
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId,
        range,
      });

      const rows = response.data.values;
      if (!rows || rows.length === 0) {
        console.log('No data found in spreadsheet');
        return [];
      }

      // Transform spreadsheet rows into structured player data
      return rows.map((row: any[]) => ({
        name: row[0] || '',
        position: row[1] || '',
        jerseyNumber: parseInt(row[2]) || 0,
        weight: parseFloat(row[3]) || 0,
        height: parseFloat(row[4]) || 0,
        age: parseInt(row[5]) || 0,
        fitnessScore: parseFloat(row[6]) || 0,
        injuryStatus: row[7] || 'Available',
        lastMatch: row[8] || '',
        gpsDistance: parseFloat(row[9]) || 0,
        topSpeed: parseFloat(row[10]) || 0,
        tackles: parseInt(row[11]) || 0,
        carries: parseInt(row[12]) || 0,
        passAccuracy: parseFloat(row[13]) || 0,
      }));
    } catch (error) {
      console.error('Error fetching data from Google Sheets:', error);
      throw new Error('Failed to fetch player data from Google Sheets');
    }
  }

  /**
   * Fetches match statistics from Google Sheets
   * @param spreadsheetId - The ID of your Google Sheet
   * @param range - The range for match data (e.g., 'Matches!A2:Z100')
   */
  async getMatchData(spreadsheetId: string, range: string) {
    try {
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId,
        range,
      });

      const rows = response.data.values;
      if (!rows || rows.length === 0) {
        return [];
      }

      return rows.map((row: any[]) => ({
        date: row[0],
        opponent: row[1],
        result: row[2],
        playerName: row[3],
        minutesPlayed: parseInt(row[4]) || 0,
        tries: parseInt(row[5]) || 0,
        assists: parseInt(row[6]) || 0,
        tackles: parseInt(row[7]) || 0,
        missedTackles: parseInt(row[8]) || 0,
        carries: parseInt(row[9]) || 0,
        metersGained: parseFloat(row[10]) || 0,
        passAccuracy: parseFloat(row[11]) || 0,
        lineoutSuccess: parseFloat(row[12]) || 0,
        scrumSuccess: parseFloat(row[13]) || 0,
      }));
    } catch (error) {
      console.error('Error fetching match data:', error);
      throw new Error('Failed to fetch match data from Google Sheets');
    }
  }

  /**
   * Fetches training data from Google Sheets
   * @param spreadsheetId - The ID of your Google Sheet
   * @param range - The range for training data
   */
  async getTrainingData(spreadsheetId: string, range: string) {
    try {
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId,
        range,
      });

      const rows = response.data.values;
      if (!rows || rows.length === 0) {
        return [];
      }

      return rows.map((row: any[]) => ({
        date: row[0],
        playerName: row[1],
        trainingType: row[2],
        duration: parseInt(row[3]) || 0,
        intensity: row[4],
        loadScore: parseFloat(row[5]) || 0,
        rpe: parseInt(row[6]) || 0, // Rate of Perceived Exertion
        notes: row[7] || '',
      }));
    } catch (error) {
      console.error('Error fetching training data:', error);
      throw new Error('Failed to fetch training data from Google Sheets');
    }
  }

  /**
   * Fetches injury/medical data from Google Sheets
   * @param spreadsheetId - The ID of your Google Sheet
   * @param range - The range for medical data
   */
  async getMedicalData(spreadsheetId: string, range: string) {
    try {
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId,
        range,
      });

      const rows = response.data.values;
      if (!rows || rows.length === 0) {
        return [];
      }

      return rows.map((row: any[]) => ({
        playerName: row[0],
        injuryType: row[1],
        injuryDate: row[2],
        expectedReturn: row[3],
        currentStatus: row[4],
        treatmentNotes: row[5] || '',
        clearanceStatus: row[6] || 'Pending',
      }));
    } catch (error) {
      console.error('Error fetching medical data:', error);
      throw new Error('Failed to fetch medical data from Google Sheets');
    }
  }

  /**
   * Sync all data from Google Sheets and update database
   * @param spreadsheetId - The main spreadsheet ID
   */
  async syncAllData(spreadsheetId: string) {
    try {
      const [playerData, matchData, trainingData, medicalData] = await Promise.all([
        this.getPlayerData(spreadsheetId, 'Players!A2:N1000'),
        this.getMatchData(spreadsheetId, 'Matches!A2:N1000'),
        this.getTrainingData(spreadsheetId, 'Training!A2:H1000'),
        this.getMedicalData(spreadsheetId, 'Medical!A2:G1000'),
      ]);

      return {
        players: playerData,
        matches: matchData,
        training: trainingData,
        medical: medicalData,
        syncTime: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Error syncing data from Google Sheets:', error);
      throw error;
    }
  }
}

export const googleSheetsService = new GoogleSheetsService();
export type { PlayerDataRow };