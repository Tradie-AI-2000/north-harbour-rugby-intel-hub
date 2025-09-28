import * as fs from 'fs';
import * as csvParser from 'csv-parser';
import { db } from '@shared/firebase';
import { FIREBASE_COLLECTIONS } from '@shared/firebase-schema';

interface CSVPlayerRow {
  id: string;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  position: string;
  secondary_position: string;
  jersey_number: string;
  height: string;
  weight: string;
  email: string;
  phone: string;
  club: string;
  experience: string;
  teamHistory: string;
  previous_clubs: string;
  current_status: string;
  availability: string;
  attendanceScore: string;
  scScore: string;
  medicalScore: string;
  personalityScore: string;
}

export class CSVFirebaseUploader {
  
  async uploadCSVToFirebase(csvFilePath: string): Promise<{success: boolean, count: number, errors: any[]}> {
    console.log('🔥 Starting CSV upload to Firebase...');
    console.log(`📁 CSV File: ${csvFilePath}`);
    
    const results: any[] = [];
    const errors: any[] = [];
    let uploadCount = 0;

    try {
      // Read and parse CSV file
      const csvData: CSVPlayerRow[] = await this.readCSVFile(csvFilePath);
      console.log(`📊 Found ${csvData.length} players in CSV`);

      // Upload each player to Firebase
      for (const row of csvData) {
        try {
          const firebasePlayer = this.transformCSVToFirebase(row, uploadCount + 1);
          
          // Add to Firebase
          const docRef = await db.collection(FIREBASE_COLLECTIONS.PLAYERS).add(firebasePlayer);
          console.log(`✅ Uploaded: ${firebasePlayer.firstName} ${firebasePlayer.lastName} (${docRef.id})`);
          
          uploadCount++;
          results.push({ id: docRef.id, name: `${firebasePlayer.firstName} ${firebasePlayer.lastName}` });
          
        } catch (error) {
          console.error(`❌ Error uploading player ${row['First Name']} ${row['Last Name']}:`, error);
          errors.push({ player: `${row['First Name']} ${row['Last Name']}`, error: error.message });
        }
      }

      console.log(`🎯 Upload Complete: ${uploadCount} players successfully uploaded to Firebase`);
      return { success: true, count: uploadCount, errors };

    } catch (error) {
      console.error('❌ CSV Upload failed:', error);
      return { success: false, count: 0, errors: [error] };
    }
  }

  private async readCSVFile(filePath: string): Promise<CSVPlayerRow[]> {
    return new Promise((resolve, reject) => {
      const results: CSVPlayerRow[] = [];
      
      fs.createReadStream(filePath)
        .pipe(csvParser())
        .on('data', (data) => results.push(data))
        .on('end', () => resolve(results))
        .on('error', reject);
    });
  }

  private transformCSVToFirebase(csvRow: CSVPlayerRow, index: number): any {
    // Use CSV ID or generate from name and index
    const id = csvRow.id?.trim() || `${csvRow.first_name?.toLowerCase()}_${csvRow.last_name?.toLowerCase()}_${index}`;
    
    return {
      id: id,
      firstName: csvRow.first_name?.trim() || '',
      lastName: csvRow.last_name?.trim() || '',
      position: csvRow.position?.trim() || '',
      secondaryPosition: csvRow.secondary_position?.trim() || '',
      jerseyNumber: parseInt(csvRow.jersey_number) || index,
      dateOfBirth: csvRow.date_of_birth?.trim() || '',
      email: csvRow.email?.trim() || `${id}@northharbour.nz`,
      phone: csvRow.phone?.trim() || '',
      club: csvRow.club?.trim() || 'North Harbour Rugby',
      experience: csvRow.experience?.trim() || 'Professional',
      teamHistory: csvRow.teamHistory?.trim() || 'North Harbour',
      previousClubs: csvRow.previous_clubs?.trim() || '',
      
      // Physical attributes
      height: parseFloat(csvRow.height) || 180,
      weight: parseFloat(csvRow.weight) || 85,
      
      // Status and performance
      currentStatus: csvRow.current_status?.trim() || 'available',
      availability: csvRow.availability?.trim() || 'available',
      
      // Default skill ratings (to be updated with real data)
      skills: {
        ballHandling: 7,
        passing: 7,
        defense: 7,
        communication: 7,
        kicking: 6,
        lineoutThrowing: csvRow['Position']?.includes('Hooker') ? 8 : 3,
        scrummaging: csvRow['Position']?.includes('Prop') || csvRow['Position']?.includes('Hooker') ? 8 : 5
      },
      
      // Performance scores from CSV data
      attendanceScore: parseFloat(csvRow.attendanceScore) || 8.0,
      scScore: parseFloat(csvRow.scScore) || 7.5,
      medicalScore: parseFloat(csvRow.medicalScore) || 8.5,
      personalityScore: parseFloat(csvRow.personalityScore) || 8.0,
      
      // Metadata
      source: 'CSV_2025_Upload',
      uploadedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  }
}

// Export for use in routes
export const csvUploader = new CSVFirebaseUploader();