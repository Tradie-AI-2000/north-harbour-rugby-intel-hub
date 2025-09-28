import { db } from './firebase';
import { FIREBASE_COLLECTIONS } from '@shared/firebase-schema';

export class FirebaseCleanupService {
  
  /**
   * Clears all existing Firebase collections before migration
   */
  async clearAllCollections(): Promise<{success: boolean, collectionsCleared: string[], errors: string[]}> {
    console.log('🧹 Starting Firebase cleanup - clearing existing data...');
    
    const errors: string[] = [];
    const collectionsCleared: string[] = [];

    try {
      // Get all collections in the database
      const collections = await db.listCollections();
      
      console.log(`📋 Found ${collections.length} existing collections`);
      
      for (const collection of collections) {
        try {
          console.log(`🗑️ Clearing collection: ${collection.id}`);
          
          // Get all documents in the collection
          const snapshot = await collection.get();
          
          if (snapshot.empty) {
            console.log(`✅ Collection ${collection.id} is already empty`);
            collectionsCleared.push(collection.id);
            continue;
          }

          // Delete documents in batches of 500 (Firestore limit)
          const batch = db.batch();
          let batchCount = 0;
          
          for (const doc of snapshot.docs) {
            batch.delete(doc.ref);
            batchCount++;
            
            // Commit batch if we reach 500 documents
            if (batchCount >= 500) {
              await batch.commit();
              console.log(`📦 Committed batch of ${batchCount} deletions for ${collection.id}`);
              batchCount = 0;
            }
          }
          
          // Commit any remaining documents
          if (batchCount > 0) {
            await batch.commit();
            console.log(`📦 Committed final batch of ${batchCount} deletions for ${collection.id}`);
          }
          
          collectionsCleared.push(collection.id);
          console.log(`✅ Successfully cleared collection: ${collection.id}`);
          
        } catch (collectionError: any) {
          const errorMsg = `Failed to clear collection ${collection.id}: ${collectionError.message}`;
          console.error(`❌ ${errorMsg}`);
          errors.push(errorMsg);
        }
      }

      // Also clear any subcollections by checking known player documents
      await this.clearPlayerSubcollections();
      
      console.log(`🎉 Cleanup completed. Cleared ${collectionsCleared.length} collections`);
      
      return {
        success: errors.length === 0,
        collectionsCleared,
        errors
      };
      
    } catch (error: any) {
      const errorMsg = `Firebase cleanup failed: ${error.message}`;
      console.error(`❌ ${errorMsg}`);
      errors.push(errorMsg);
      
      return {
        success: false,
        collectionsCleared,
        errors
      };
    }
  }

  /**
   * Clear player subcollections specifically
   */
  private async clearPlayerSubcollections(): Promise<void> {
    try {
      // Get all player documents first
      const playersSnapshot = await db.collection('players').get();
      
      if (playersSnapshot.empty) {
        console.log('📋 No existing player documents found');
        return;
      }

      console.log(`🔍 Checking subcollections for ${playersSnapshot.size} players`);

      for (const playerDoc of playersSnapshot.docs) {
        const subcollectionNames = [
          'medicalAppointments',
          'medicalNotes', 
          'injuryRecords',
          'fitnessTests',
          'gpsSessions',
          'physicalAttributes',
          'coachingNotes',
          'matchAnalysis',
          'aiAnalysis',
          'statusTracking',
          'dataSourceTracking'
        ];

        for (const subcollectionName of subcollectionNames) {
          try {
            const subcollectionRef = playerDoc.ref.collection(subcollectionName);
            const subcollectionSnapshot = await subcollectionRef.get();
            
            if (!subcollectionSnapshot.empty) {
              const batch = db.batch();
              subcollectionSnapshot.docs.forEach(doc => {
                batch.delete(doc.ref);
              });
              await batch.commit();
              console.log(`🗑️ Cleared ${subcollectionSnapshot.size} documents from ${playerDoc.id}/${subcollectionName}`);
            }
          } catch (subError) {
            console.log(`⚠️ Could not clear subcollection ${playerDoc.id}/${subcollectionName}: ${subError}`);
          }
        }
      }
    } catch (error) {
      console.log(`⚠️ Error clearing player subcollections: ${error}`);
    }
  }

  /**
   * Get current database status
   */
  async getDatabaseStatus(): Promise<{collections: Array<{name: string, documentCount: number}>, totalDocuments: number}> {
    try {
      const collections = await db.listCollections();
      const collectionStats = [];
      let totalDocuments = 0;

      for (const collection of collections) {
        const snapshot = await collection.get();
        const documentCount = snapshot.size;
        totalDocuments += documentCount;
        
        collectionStats.push({
          name: collection.id,
          documentCount
        });
      }

      return {
        collections: collectionStats,
        totalDocuments
      };
    } catch (error: any) {
      console.error('Error getting database status:', error);
      return {
        collections: [],
        totalDocuments: 0
      };
    }
  }

  /**
   * Verify database is clean
   */
  async verifyCleanup(): Promise<{isClean: boolean, remainingData: any}> {
    const status = await this.getDatabaseStatus();
    
    return {
      isClean: status.totalDocuments === 0,
      remainingData: status
    };
  }
}

export const cleanupService = new FirebaseCleanupService();