import { db } from './firebase';
import { 
  FirebasePlayer, 
  FIREBASE_COLLECTIONS,
  MedicalAppointment,
  MedicalNote,
  InjuryRecord,
  FitnessTest,
  GpsTrainingSession,
  PhysicalAttributeTimeSeries,
  CoachingNote,
  SquadSelection,
  MatchAnalysis,
  AiAnalysis,
  PlayerStatus,
  TeamSquad
} from '@shared/firebase-schema';

export class FirebaseService {

  // ================================
  // PLAYER OPERATIONS
  // ================================

  async getAllPlayers(): Promise<FirebasePlayer[]> {
    const snapshot = await db.collection(FIREBASE_COLLECTIONS.PLAYERS).get();
    return snapshot.docs.map(doc => ({ ...doc.data() } as FirebasePlayer));
  }

  async getPlayer(playerId: string): Promise<FirebasePlayer | null> {
    const doc = await db.collection(FIREBASE_COLLECTIONS.PLAYERS).doc(playerId).get();
    return doc.exists ? (doc.data() as FirebasePlayer) : null;
  }

  async updatePlayer(playerId: string, updates: Partial<FirebasePlayer>): Promise<void> {
    const updateData = {
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    await db.collection(FIREBASE_COLLECTIONS.PLAYERS).doc(playerId).update(updateData);
  }

  async updatePlayerQuickStatus(playerId: string, quickStatus: Partial<FirebasePlayer['quickStatus']>): Promise<void> {
    await db.collection(FIREBASE_COLLECTIONS.PLAYERS).doc(playerId).update({
      quickStatus,
      updatedAt: new Date().toISOString(),
    });
  }

  // ================================
  // MEDICAL MANAGEMENT OPERATIONS
  // ================================

  async getMedicalAppointments(playerId: string): Promise<MedicalAppointment[]> {
    const snapshot = await db
      .collection(FIREBASE_COLLECTIONS.PLAYERS)
      .doc(playerId)
      .collection(FIREBASE_COLLECTIONS.MEDICAL_APPOINTMENTS)
      .orderBy('scheduledDate', 'desc')
      .get();
    
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as MedicalAppointment));
  }

  async createMedicalAppointment(playerId: string, appointment: Omit<MedicalAppointment, 'id'>): Promise<string> {
    const docRef = await db
      .collection(FIREBASE_COLLECTIONS.PLAYERS)
      .doc(playerId)
      .collection(FIREBASE_COLLECTIONS.MEDICAL_APPOINTMENTS)
      .add(appointment);
    
    // Update player quick status
    await this.updatePlayerQuickStatus(playerId, {
      upcomingAppointments: await this.getUpcomingAppointmentsCount(playerId)
    });
    
    return docRef.id;
  }

  async updateMedicalAppointment(playerId: string, appointmentId: string, updates: Partial<MedicalAppointment>): Promise<void> {
    await db
      .collection(FIREBASE_COLLECTIONS.PLAYERS)
      .doc(playerId)
      .collection(FIREBASE_COLLECTIONS.MEDICAL_APPOINTMENTS)
      .doc(appointmentId)
      .update({
        ...updates,
        updatedAt: new Date().toISOString(),
      });
  }

  async getMedicalNotes(playerId: string): Promise<MedicalNote[]> {
    const snapshot = await db
      .collection(FIREBASE_COLLECTIONS.PLAYERS)
      .doc(playerId)
      .collection(FIREBASE_COLLECTIONS.MEDICAL_NOTES)
      .orderBy('createdAt', 'desc')
      .get();
    
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as MedicalNote));
  }

  async createMedicalNote(playerId: string, note: Omit<MedicalNote, 'id'>): Promise<string> {
    const docRef = await db
      .collection(FIREBASE_COLLECTIONS.PLAYERS)
      .doc(playerId)
      .collection(FIREBASE_COLLECTIONS.MEDICAL_NOTES)
      .add(note);
    
    return docRef.id;
  }

  async getInjuryRecords(playerId: string): Promise<InjuryRecord[]> {
    const snapshot = await db
      .collection(FIREBASE_COLLECTIONS.PLAYERS)
      .doc(playerId)
      .collection(FIREBASE_COLLECTIONS.INJURY_RECORDS)
      .orderBy('dateOccurred', 'desc')
      .get();
    
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as InjuryRecord));
  }

  async createInjuryRecord(playerId: string, injury: Omit<InjuryRecord, 'id'>): Promise<string> {
    const docRef = await db
      .collection(FIREBASE_COLLECTIONS.PLAYERS)
      .doc(playerId)
      .collection(FIREBASE_COLLECTIONS.INJURY_RECORDS)
      .add(injury);
    
    // Update player quick status
    await this.updatePlayerQuickStatus(playerId, {
      openInjuries: await this.getOpenInjuriesCount(playerId),
      fitness: injury.status === 'active' ? 'injured' : 'available'
    });
    
    return docRef.id;
  }

  async updateInjuryRecord(playerId: string, injuryId: string, updates: Partial<InjuryRecord>): Promise<void> {
    await db
      .collection(FIREBASE_COLLECTIONS.PLAYERS)
      .doc(playerId)
      .collection(FIREBASE_COLLECTIONS.INJURY_RECORDS)
      .doc(injuryId)
      .update({
        ...updates,
        lastUpdated: new Date().toISOString(),
      });
    
    // Update player quick status if injury status changed
    if (updates.status) {
      await this.updatePlayerQuickStatus(playerId, {
        openInjuries: await this.getOpenInjuriesCount(playerId),
        fitness: updates.status === 'cleared' ? 'available' : 'injured'
      });
    }
  }

  // ================================
  // FITNESS & GPS OPERATIONS
  // ================================

  async getFitnessTests(playerId: string, testType?: string): Promise<FitnessTest[]> {
    let query = db
      .collection(FIREBASE_COLLECTIONS.PLAYERS)
      .doc(playerId)
      .collection(FIREBASE_COLLECTIONS.FITNESS_TESTS)
      .orderBy('testDate', 'desc');
    
    if (testType) {
      query = query.where('testType', '==', testType);
    }
    
    const snapshot = await query.get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as FitnessTest));
  }

  async createFitnessTest(playerId: string, test: Omit<FitnessTest, 'id'>): Promise<string> {
    const docRef = await db
      .collection(FIREBASE_COLLECTIONS.PLAYERS)
      .doc(playerId)
      .collection(FIREBASE_COLLECTIONS.FITNESS_TESTS)
      .add(test);
    
    // Update player quick status
    await this.updatePlayerQuickStatus(playerId, {
      lastFitnessTest: test.testDate
    });
    
    return docRef.id;
  }

  async getGpsSessions(playerId: string, limit: number = 50): Promise<GpsTrainingSession[]> {
    const snapshot = await db
      .collection(FIREBASE_COLLECTIONS.PLAYERS)
      .doc(playerId)
      .collection(FIREBASE_COLLECTIONS.GPS_SESSIONS)
      .orderBy('sessionDate', 'desc')
      .limit(limit)
      .get();
    
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as GpsTrainingSession));
  }

  async createGpsSession(playerId: string, session: Omit<GpsTrainingSession, 'id'>): Promise<string> {
    const docRef = await db
      .collection(FIREBASE_COLLECTIONS.PLAYERS)
      .doc(playerId)
      .collection(FIREBASE_COLLECTIONS.GPS_SESSIONS)
      .add(session);
    
    // Update player quick status
    await this.updatePlayerQuickStatus(playerId, {
      lastGpsSession: session.sessionDate
    });
    
    return docRef.id;
  }

  async getPhysicalAttributes(playerId: string): Promise<PhysicalAttributeTimeSeries[]> {
    const snapshot = await db
      .collection(FIREBASE_COLLECTIONS.PLAYERS)
      .doc(playerId)
      .collection(FIREBASE_COLLECTIONS.PHYSICAL_ATTRIBUTES)
      .orderBy('measurementDate', 'desc')
      .get();
    
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as PhysicalAttributeTimeSeries));
  }

  async createPhysicalAttributeEntry(playerId: string, entry: Omit<PhysicalAttributeTimeSeries, 'id'>): Promise<string> {
    const docRef = await db
      .collection(FIREBASE_COLLECTIONS.PLAYERS)
      .doc(playerId)
      .collection(FIREBASE_COLLECTIONS.PHYSICAL_ATTRIBUTES)
      .add(entry);
    
    // Update player's current weight/height in main document
    await this.updatePlayer(playerId, {
      currentWeight: entry.weight,
      currentHeight: entry.height || undefined,
    });
    
    return docRef.id;
  }

  // ================================
  // COACHING OPERATIONS
  // ================================

  async getCoachingNotes(playerId: string): Promise<CoachingNote[]> {
    const snapshot = await db
      .collection(FIREBASE_COLLECTIONS.PLAYERS)
      .doc(playerId)
      .collection(FIREBASE_COLLECTIONS.COACHING_NOTES)
      .orderBy('createdAt', 'desc')
      .get();
    
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as CoachingNote));
  }

  async createCoachingNote(playerId: string, note: Omit<CoachingNote, 'id'>): Promise<string> {
    const docRef = await db
      .collection(FIREBASE_COLLECTIONS.PLAYERS)
      .doc(playerId)
      .collection(FIREBASE_COLLECTIONS.COACHING_NOTES)
      .add(note);
    
    return docRef.id;
  }

  async getMatchAnalysis(playerId: string): Promise<MatchAnalysis[]> {
    const snapshot = await db
      .collection(FIREBASE_COLLECTIONS.PLAYERS)
      .doc(playerId)
      .collection(FIREBASE_COLLECTIONS.MATCH_ANALYSIS)
      .orderBy('matchDate', 'desc')
      .get();
    
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as MatchAnalysis));
  }

  async createMatchAnalysis(playerId: string, analysis: Omit<MatchAnalysis, 'id'>): Promise<string> {
    const docRef = await db
      .collection(FIREBASE_COLLECTIONS.PLAYERS)
      .doc(playerId)
      .collection(FIREBASE_COLLECTIONS.MATCH_ANALYSIS)
      .add(analysis);
    
    return docRef.id;
  }

  // ================================
  // AI ANALYSIS OPERATIONS
  // ================================

  async getAiAnalysis(playerId: string): Promise<AiAnalysis[]> {
    const snapshot = await db
      .collection(FIREBASE_COLLECTIONS.PLAYERS)
      .doc(playerId)
      .collection(FIREBASE_COLLECTIONS.AI_ANALYSIS)
      .orderBy('generatedAt', 'desc')
      .get();
    
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as AiAnalysis));
  }

  async createAiAnalysis(playerId: string, analysis: Omit<AiAnalysis, 'id'>): Promise<string> {
    const docRef = await db
      .collection(FIREBASE_COLLECTIONS.PLAYERS)
      .doc(playerId)
      .collection(FIREBASE_COLLECTIONS.AI_ANALYSIS)
      .add(analysis);
    
    return docRef.id;
  }

  // ================================
  // SQUAD MANAGEMENT OPERATIONS
  // ================================

  async getAllSquads(): Promise<TeamSquad[]> {
    const snapshot = await db.collection(FIREBASE_COLLECTIONS.SQUADS).get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as TeamSquad));
  }

  async getSquad(squadId: string): Promise<TeamSquad | null> {
    const doc = await db.collection(FIREBASE_COLLECTIONS.SQUADS).doc(squadId).get();
    return doc.exists ? ({ id: doc.id, ...doc.data() } as TeamSquad) : null;
  }

  async createSquad(squad: Omit<TeamSquad, 'id'>): Promise<string> {
    const docRef = await db.collection(FIREBASE_COLLECTIONS.SQUADS).add(squad);
    return docRef.id;
  }

  async updateSquad(squadId: string, updates: Partial<TeamSquad>): Promise<void> {
    await db.collection(FIREBASE_COLLECTIONS.SQUADS).doc(squadId).update({
      ...updates,
      updatedAt: new Date().toISOString(),
    });
  }

  async addPlayerToSquad(squadId: string, playerId: string, role: string, addedBy: string): Promise<void> {
    const squad = await this.getSquad(squadId);
    if (!squad) throw new Error('Squad not found');
    
    const newMember = {
      playerId,
      role,
      addedDate: new Date().toISOString(),
      addedBy,
    };
    
    await this.updateSquad(squadId, {
      members: [...squad.members, newMember],
    });
  }

  async removePlayerFromSquad(squadId: string, playerId: string): Promise<void> {
    const squad = await this.getSquad(squadId);
    if (!squad) throw new Error('Squad not found');
    
    await this.updateSquad(squadId, {
      members: squad.members.filter(member => member.playerId !== playerId),
    });
  }

  // ================================
  // HELPER METHODS
  // ================================

  private async getUpcomingAppointmentsCount(playerId: string): Promise<number> {
    const today = new Date().toISOString().split('T')[0];
    const snapshot = await db
      .collection(FIREBASE_COLLECTIONS.PLAYERS)
      .doc(playerId)
      .collection(FIREBASE_COLLECTIONS.MEDICAL_APPOINTMENTS)
      .where('scheduledDate', '>=', today)
      .where('status', '==', 'scheduled')
      .get();
    
    return snapshot.docs.length;
  }

  private async getOpenInjuriesCount(playerId: string): Promise<number> {
    const snapshot = await db
      .collection(FIREBASE_COLLECTIONS.PLAYERS)
      .doc(playerId)
      .collection(FIREBASE_COLLECTIONS.INJURY_RECORDS)
      .where('status', '==', 'active')
      .get();
    
    return snapshot.docs.length;
  }

  // ================================
  // SEARCH AND FILTERING
  // ================================

  async searchPlayers(searchTerm: string): Promise<FirebasePlayer[]> {
    // Firestore doesn't support full-text search, so we'll get all players and filter
    const allPlayers = await this.getAllPlayers();
    
    const lowerSearchTerm = searchTerm.toLowerCase();
    return allPlayers.filter(player => 
      player.firstName.toLowerCase().includes(lowerSearchTerm) ||
      player.lastName.toLowerCase().includes(lowerSearchTerm) ||
      player.position.toLowerCase().includes(lowerSearchTerm) ||
      player.club.toLowerCase().includes(lowerSearchTerm)
    );
  }

  async getPlayersByPosition(position: string): Promise<FirebasePlayer[]> {
    const snapshot = await db
      .collection(FIREBASE_COLLECTIONS.PLAYERS)
      .where('position', '==', position)
      .get();
    
    return snapshot.docs.map(doc => ({ ...doc.data() } as FirebasePlayer));
  }

  async getPlayersByStatus(status: string): Promise<FirebasePlayer[]> {
    const snapshot = await db
      .collection(FIREBASE_COLLECTIONS.PLAYERS)
      .where('availability', '==', status)
      .get();
    
    return snapshot.docs.map(doc => ({ ...doc.data() } as FirebasePlayer));
  }

  // ================================
  // ANALYTICS AND REPORTS
  // ================================

  async getPlayerAnalytics(playerId: string): Promise<any> {
    const player = await this.getPlayer(playerId);
    if (!player) throw new Error('Player not found');
    
    const [
      fitnessTests,
      gpsSessions,
      injuries,
      aiAnalysis,
      coachingNotes
    ] = await Promise.all([
      this.getFitnessTests(playerId),
      this.getGpsSessions(playerId, 10),
      this.getInjuryRecords(playerId),
      this.getAiAnalysis(playerId),
      this.getCoachingNotes(playerId)
    ]);
    
    return {
      player,
      analytics: {
        totalFitnessTests: fitnessTests.length,
        recentGpsSessions: gpsSessions.length,
        totalInjuries: injuries.length,
        activeInjuries: injuries.filter(i => i.status === 'active').length,
        aiAnalysisCount: aiAnalysis.length,
        coachingNotesCount: coachingNotes.length,
        lastUpdated: new Date().toISOString(),
      },
      recentActivity: {
        latestFitnessTest: fitnessTests[0] || null,
        latestGpsSession: gpsSessions[0] || null,
        latestInjury: injuries[0] || null,
        latestAiAnalysis: aiAnalysis[0] || null,
      }
    };
  }
}

export const firebaseService = new FirebaseService();