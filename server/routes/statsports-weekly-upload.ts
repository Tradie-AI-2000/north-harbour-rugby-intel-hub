import { Request, Response } from 'express';
import multer from 'multer';
import { generateSessionId, parseSessionId } from '../../shared/weekly-training-schema';

// Configure multer for file uploads
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

interface SessionAssignment {
  weekId: string;
  weekName: string;
  sessionNumber: number;
  sessionType: 'training' | 'match';
  sessionName: string;
  date: string;
}

interface UploadResult {
  success: boolean;
  recordsProcessed: number;
  errors: string[];
  duplicates: number;
  playersAffected: string[];
  sessionCreated: SessionAssignment & { sessionId: string };
}

export const handleStatSportsWeeklyUpload = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log('📄 Upload request received:', {
      body: req.body,
      file: req.file ? { originalname: req.file.originalname, size: req.file.size } : null,
      contentType: req.headers['content-type']
    });

    // Parse session assignment data from form body
    let sessionData: SessionAssignment;
    
    if (!req.body.sessionData) {
      res.status(400).json({ 
        success: false, 
        error: 'Session data is required. Please ensure all session details are filled out.' 
      });
      return;
    }
    
    try {
      if (typeof req.body.sessionData === 'string') {
        sessionData = JSON.parse(req.body.sessionData);
      } else {
        // Handle case where session data is sent as individual form fields
        sessionData = {
          weekId: req.body.weekId,
          weekName: req.body.weekName,
          sessionNumber: parseInt(req.body.sessionNumber),
          sessionType: req.body.sessionType,
          sessionName: req.body.sessionName,
          date: req.body.date
        };
      }
    } catch (parseError) {
      res.status(400).json({ 
        success: false, 
        error: 'Invalid session data format',
        details: parseError instanceof Error ? parseError.message : 'JSON parsing failed'
      });
      return;
    }
    
    const file = req.file;

    if (!file) {
      res.status(400).json({ success: false, error: 'No file uploaded' });
      return;
    }

    if (!file.originalname.toLowerCase().endsWith('.csv')) {
      res.status(400).json({ success: false, error: 'File must be a CSV' });
      return;
    }

    // Generate enhanced session ID
    const sessionId = generateSessionId(sessionData.weekId, sessionData.sessionNumber, sessionData.date);
    
    // Verify sessionId format
    const parsedId = parseSessionId(sessionId);
    if (parsedId.isLegacy) {
      res.status(400).json({ success: false, error: 'Invalid session ID format' });
      return;
    }

    console.log(`📊 Processing StatSports upload for session: ${sessionId}`);
    console.log(`📅 Session details:`, sessionData);

    // Parse CSV file
    const csvContent = file.buffer.toString('utf-8');
    const lines = csvContent.split('\n').filter(line => line.trim());
    
    if (lines.length < 2) {
      res.status(400).json({ success: false, error: 'CSV file appears to be empty or invalid' });
      return;
    }

    const headers = lines[0].split(',').map(h => h.trim());
    const dataRows = lines.slice(1);

    // Validate required columns
    const requiredColumns = ['playerId', 'playerLoad', 'totalDistance', 'metresPerMinute'];
    const missingColumns = requiredColumns.filter(col => !headers.includes(col));
    
    if (missingColumns.length > 0) {
      res.status(400).json({ 
        success: false, 
        error: `Missing required columns: ${missingColumns.join(', ')}` 
      });
      return;
    }

    const processedRecords: any[] = [];
    const errors: string[] = [];
    const playersAffected: string[] = [];

    // Process each data row
    for (let i = 0; i < dataRows.length; i++) {
      const row = dataRows[i].split(',').map(cell => cell.trim());
      
      if (row.length !== headers.length) {
        errors.push(`Row ${i + 2}: Column count mismatch`);
        continue;
      }

      const record: any = {};
      headers.forEach((header, index) => {
        record[header] = row[index];
      });

      // Add session and week linking
      record.sessionId = sessionId;
      record.weekId = sessionData.weekId;
      record.sessionType = sessionData.sessionType;
      record.uploadedAt = new Date().toISOString();
      record.uploadedBy = 'nick_marquet'; // TODO: Get from auth context

      processedRecords.push(record);
      
      if (record.playerId && !playersAffected.includes(record.playerId)) {
        playersAffected.push(record.playerId);
      }
    }

    // TODO: Save to Firebase
    // For now, simulate successful upload
    console.log(`✅ Processed ${processedRecords.length} GPS records for ${playersAffected.length} players`);
    console.log(`📊 Session ${sessionId} ready for analytics`);

    // Calculate session summary
    const playerLoads = processedRecords
      .map(r => parseFloat(r.playerLoad))
      .filter(load => !isNaN(load));
    
    const averagePlayerLoad = playerLoads.length > 0 
      ? playerLoads.reduce((sum, load) => sum + load, 0) / playerLoads.length 
      : 0;

    const result: UploadResult = {
      success: true,
      recordsProcessed: processedRecords.length,
      errors,
      duplicates: 0,
      playersAffected,
      sessionCreated: {
        ...sessionData,
        sessionId,
      }
    };

    res.json(result);

  } catch (error) {
    console.error('❌ StatSports weekly upload error:', error);
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Upload processing failed',
      details: error instanceof Error ? error.stack : 'Unknown error'
    });
  }
};

// Export multer middleware
export const uploadMiddleware = upload.single('gpsFile');