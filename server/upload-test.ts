import type { Express, Request, Response } from "express";
import multer from 'multer';

// Configure multer for file uploads
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

export function registerUploadTest(app: Express) {
  // Simple test endpoint first
  app.get('/api/test-upload', (req: Request, res: Response) => {
    res.json({ 
      success: true, 
      message: "Upload endpoint is reachable",
      timestamp: new Date().toISOString()
    });
  });

  // File upload endpoint with different path to avoid conflicts
  app.post('/api/statsports-upload', upload.single('gpsFile'), (req: Request, res: Response) => {
    try {
      console.log('📄 Test upload handler called');
      console.log('📄 Body:', req.body);
      console.log('📄 File:', req.file ? { name: req.file.originalname, size: req.file.size } : 'No file');
      
      const result = {
        success: true,
        message: "Test upload working!",
        data: {
          hasFile: !!req.file,
          fileName: req.file?.originalname,
          fileSize: req.file?.size,
          sessionData: req.body.sessionData,
          bodyKeys: Object.keys(req.body)
        }
      };
      
      console.log('📤 Sending test response:', result);
      res.json(result);
      
    } catch (error) {
      console.error('❌ Test upload error:', error);
      res.status(500).json({
        success: false,
        error: 'Test upload failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });
}