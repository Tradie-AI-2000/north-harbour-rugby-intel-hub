import express, { Request, Response } from 'express';
import { db } from './firebase';
import { FIRESTORE_COLLECTIONS, generatePdfReportId, generatePdfPlayerStatsId } from '../shared/firebase-firestore-schema';
import { PDFMatchReportProcessor } from './pdf-match-report-processor';
import { validatePDFMatchReport, transformToMatchPerformanceFormat } from '../shared/pdf-match-report-schema';

// PDF Match Report Processing API
export class PDFMatchReportAPI {
  
  // Upload and process PDF match report
  static async uploadPDFReport(req: Request, res: Response) {
    try {
      const { matchId } = req.params;
      const { uploadedBy, uploadedByName, uploadedByRole } = req.body;

      if (!req.file) {
        return res.status(400).json({
          success: false,
          error: 'No PDF file provided'
        });
      }

      const file = req.file as Express.Multer.File;
      const filename = file.originalname;
      
      console.log(`📄 PDF UPLOAD: Processing ${filename} for match ${matchId}`);

      // Process PDF and extract statistics
      const pdfReport = await PDFMatchReportProcessor.processPDFReport(
        file.buffer,
        matchId,
        filename,
        uploadedBy || 'unknown_user'
      );

      // Store in Firestore
      const reportRef = db.collection(FIRESTORE_COLLECTIONS.PDF_MATCH_REPORTS).doc(pdfReport.reportId);
      await reportRef.set(pdfReport);

      // Store team statistics separately for easy querying
      const homeStatsRef = db.collection(FIRESTORE_COLLECTIONS.PDF_TEAM_STATS).doc(`${matchId}_home`);
      await homeStatsRef.set({
        ...pdfReport.homeTeamStats,
        team: 'home'
      });

      const awayStatsRef = db.collection(FIRESTORE_COLLECTIONS.PDF_TEAM_STATS).doc(`${matchId}_away`);
      await awayStatsRef.set({
        ...pdfReport.awayTeamStats,
        team: 'away'
      });

      // Store individual player statistics
      const batch = db.batch();
      pdfReport.playerStats.forEach(player => {
        const playerRef = db.collection(FIRESTORE_COLLECTIONS.PDF_PLAYER_STATS)
          .doc(`${player.playerId}_${matchId}`);
        batch.set(playerRef, {
          ...player,
          matchId
        });
      });
      await batch.commit();

      console.log(`✅ PDF PROCESSING: Successfully processed ${filename}`);

      res.json({
        success: true,
        reportId: pdfReport.reportId,
        matchId,
        processingInfo: pdfReport.processingInfo,
        teamStats: {
          home: pdfReport.homeTeamStats,
          away: pdfReport.awayTeamStats
        },
        playerCount: pdfReport.playerStats.length,
        extractedSections: pdfReport.processingInfo.extractedSections
      });

    } catch (error) {
      console.error('❌ PDF PROCESSING ERROR:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown processing error'
      });
    }
  }

  // Get processed PDF data for match (transformed for dashboard)
  static async getPDFMatchData(req: Request, res: Response) {
    try {
      const { matchId } = req.params;

      // Get team statistics
      const homeStatsDoc = await db.collection(FIRESTORE_COLLECTIONS.PDF_TEAM_STATS)
        .doc(`${matchId}_home`).get();
      const awayStatsDoc = await db.collection(FIRESTORE_COLLECTIONS.PDF_TEAM_STATS)
        .doc(`${matchId}_away`).get();

      if (!homeStatsDoc.exists || !awayStatsDoc.exists) {
        return res.status(404).json({
          success: false,
          error: 'No PDF data found for this match'
        });
      }

      // Get player statistics
      const playerStatsSnapshot = await db.collection(FIRESTORE_COLLECTIONS.PDF_PLAYER_STATS)
        .where('matchId', '==', matchId)
        .get();

      const playerStats = playerStatsSnapshot.docs.map(doc => doc.data());

      // Transform to dashboard format
      const dashboardData = transformToMatchPerformanceFormat({
        reportId: 'dummy',
        matchId,
        homeTeamStats: homeStatsDoc.data(),
        awayTeamStats: awayStatsDoc.data(),
        playerStats,
        processingInfo: {
          extractedSections: ['attack_defence'],
          extractionErrors: [],
          extractionTime: 0,
          confidence: 0.85
        },
        originalFilename: 'report.pdf',
        fileSize: 0,
        uploadedBy: 'unknown',
        uploadedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString()
      } as any);

      res.json({
        success: true,
        matchId,
        data: dashboardData,
        lastUpdated: homeStatsDoc.data()?.lastUpdated
      });

    } catch (error) {
      console.error('❌ PDF DATA RETRIEVAL ERROR:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown retrieval error'
      });
    }
  }

  // Get list of processed PDF reports for a match
  static async getPDFReports(req: Request, res: Response) {
    try {
      const { matchId } = req.params;

      const reportsSnapshot = await db.collection(FIRESTORE_COLLECTIONS.PDF_MATCH_REPORTS)
        .where('matchId', '==', matchId)
        .orderBy('createdAt', 'desc')
        .get();

      const reports = reportsSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          reportId: data.reportId,
          originalFilename: data.originalFilename,
          uploadedBy: data.uploadedBy,
          uploadedAt: data.uploadedAt,
          processingInfo: data.processingInfo,
          // Don't return full player stats in list view
          playerStats: undefined
        };
      });

      res.json({
        success: true,
        matchId,
        reports
      });

    } catch (error) {
      console.error('❌ PDF REPORTS LIST ERROR:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}