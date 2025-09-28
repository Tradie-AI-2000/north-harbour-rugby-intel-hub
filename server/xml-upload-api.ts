// XML Upload API for Rugby Match Data
// Handles coach uploads of XML match files and processes them

import express from 'express';
import multer from 'multer';
import { XMLMatchProcessor } from './xml-processor';
import { XMLMatchData } from '../shared/xml-match-schema';

const router = express.Router();

// Configure multer for XML file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    // Accept XML files
    if (file.mimetype === 'application/xml' || file.mimetype === 'text/xml' || file.originalname.endsWith('.xml')) {
      cb(null, true);
    } else {
      cb(Error('Only XML files are allowed'));
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// In-memory storage for processed match data (would use database in production)
const matchDataStore: Map<string, XMLMatchData> = new Map();

// Upload and process XML match file
router.post('/api/v2/matches/:matchId/xml-upload', upload.single('xmlFile'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        error: 'No XML file uploaded' 
      });
    }

    const matchId = req.params.matchId;
    
    // Convert buffer to string, handling UTF-16 encoding
    let xmlContent: string;
    try {
      // Try UTF-16 first (as our sample file uses this)
      xmlContent = req.file.buffer.toString('utf16le');
      
      // If it doesn't start with XML declaration, try UTF-8
      if (!xmlContent.includes('<?xml')) {
        xmlContent = req.file.buffer.toString('utf8');
      }
    } catch (error) {
      return res.status(400).json({ 
        success: false, 
        error: 'Unable to decode XML file. Please ensure it\'s a valid XML file.' 
      });
    }

    // Process the XML data
    const processor = new XMLMatchProcessor(xmlContent);
    const matchData = processor.processMatchData();
    
    // Store the processed data
    matchDataStore.set(matchId, matchData);
    
    // Return success with summary
    res.json({
      success: true,
      message: 'XML file processed successfully',
      filename: req.file.originalname,
      matchId,
      summary: {
        totalEvents: calculateTotalEvents(matchData),
        topPlayers: matchData.individualPerformance.topPerformers.mostActive.slice(0, 3),
        teamStats: {
          northHarbourTries: matchData.attack.teamStats.triesScored.northHarbour,
          hawkesBayTries: matchData.attack.teamStats.triesScored.hawkesBay,
          totalLineBreaks: matchData.attack.teamStats.lineBreaks.northHarbour + matchData.attack.teamStats.lineBreaks.hawkesBay
        }
      }
    });

  } catch (error) {
    console.error('XML processing error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to process XML file. Please check the file format.' 
    });
  }
});

// Get processed match data
router.get('/api/v2/matches/:matchId/xml-data', (req, res) => {
  const matchId = req.params.matchId;
  const matchData = matchDataStore.get(matchId);
  
  if (!matchData) {
    return res.status(404).json({ 
      success: false, 
      error: 'No XML data found for this match. Please upload an XML file first.' 
    });
  }
  
  res.json({
    success: true,
    data: matchData
  });
});

// Get match data summary
router.get('/api/v2/matches/:matchId/xml-summary', (req, res) => {
  const matchId = req.params.matchId;
  const matchData = matchDataStore.get(matchId);
  
  if (!matchData) {
    return res.status(404).json({ 
      success: false, 
      error: 'No XML data found for this match' 
    });
  }
  
  const summary = {
    matchInfo: matchData.matchInfo,
    lastUpdated: new Date().toISOString(),
    totalEvents: calculateTotalEvents(matchData),
    sections: [
      { 
        name: 'Ball Movement & Possession', 
        events: matchData.ballMovement.teamStats.ballRuns.northHarbour + matchData.ballMovement.teamStats.ballRuns.hawkesBay + 
                matchData.ballMovement.teamStats.teamBallMovement.northHarbour + matchData.ballMovement.teamStats.teamBallMovement.hawkesBay 
      },
      { 
        name: 'Breakdown Analysis', 
        events: matchData.breakdowns.teamStats.ruckArrivals.northHarbour + matchData.breakdowns.teamStats.ruckArrivals.hawkesBay +
                matchData.breakdowns.teamStats.breakdowns.northHarbour + matchData.breakdowns.teamStats.breakdowns.hawkesBay
      },
      { 
        name: 'Defence & Tackling', 
        events: matchData.defence.teamStats.madeTackles.northHarbour + matchData.defence.teamStats.madeTackles.hawkesBay +
                matchData.defence.teamStats.ineffectiveTackles.northHarbour + matchData.defence.teamStats.ineffectiveTackles.hawkesBay
      },
      { 
        name: 'Attack & Breaks', 
        events: matchData.attack.teamStats.lineBreaks.northHarbour + matchData.attack.teamStats.lineBreaks.hawkesBay +
                matchData.attack.teamStats.triesScored.northHarbour + matchData.attack.teamStats.triesScored.hawkesBay
      },
      { 
        name: 'Set Piece', 
        events: matchData.setPiece.lineouts.teamStats.total.northHarbour + matchData.setPiece.lineouts.teamStats.total.hawkesBay +
                matchData.setPiece.scrums.teamStats.total.northHarbour + matchData.setPiece.scrums.teamStats.total.hawkesBay
      },
      { 
        name: 'Kicking Game', 
        events: matchData.kicking.teamStats.kicksInPlay.northHarbour + matchData.kicking.teamStats.kicksInPlay.hawkesBay +
                matchData.kicking.teamStats.goalKicks.northHarbour + matchData.kicking.teamStats.goalKicks.hawkesBay
      }
    ]
  };
  
  res.json({
    success: true,
    summary
  });
});

// Delete match data
router.delete('/api/v2/matches/:matchId/xml-data', (req, res) => {
  const matchId = req.params.matchId;
  const deleted = matchDataStore.delete(matchId);
  
  res.json({
    success: deleted,
    message: deleted ? 'Match data deleted successfully' : 'No data found to delete'
  });
});

function calculateTotalEvents(matchData: XMLMatchData): number {
  return matchData.individualPerformance.playerProfiles.reduce((total, player) => total + player.totalEvents, 0);
}

export default router;