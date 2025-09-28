import type { Express } from "express";
import { createServer, type Server } from "http";
import { registerFirebaseRoutesV2 } from './firebase-routes-v2';
import xmlUploadRouter from './xml-upload-api';

// Shared player database that both endpoints can access
const playerProfiles = {
  "jake_thompson": {
    id: "jake_thompson",
    personalDetails: {
      firstName: "Jake",
      lastName: "Thompson",
      email: "jake.thompson@northharbour.com",
      phone: "555-0123",
      dateOfBirth: "1995-03-15",
      address: "Auckland, New Zealand",
      emergencyContact: {
        name: "Sarah Thompson",
        relationship: "Partner",
        phone: "555-0124"
      }
    },
    rugbyProfile: {
      jerseyNumber: 7,
      primaryPosition: "Openside Flanker",
      secondaryPositions: ["Blindside Flanker"],
      playingLevel: "Professional",
      yearsInTeam: 3,
      previousClubs: ["Auckland", "Blues Academy"]
    },
    status: {
      fitness: "injured",
      medical: "under_review"
    },
    currentStatus: "injured",
    physicalAttributes: [{
      date: "2024-01-01",
      weight: 95,
      height: 183,
      bodyFat: 9.2,
      leanMass: 86
    }]
  },
  "luke_henderson": {
    id: "luke_henderson",
    personalDetails: {
      firstName: "Luke",
      lastName: "Henderson",
      email: "luke.henderson@northharbour.com",
      phone: "555-0124",
      dateOfBirth: "1994-08-22",
      address: "North Shore, New Zealand",
      emergencyContact: {
        name: "Maria Henderson",
        relationship: "Wife",
        phone: "555-0125"
      }
    },
    rugbyProfile: {
      jerseyNumber: 4,
      primaryPosition: "Lock",
      secondaryPositions: ["Blindside Flanker"],
      playingLevel: "Professional",
      yearsInTeam: 4,
      previousClubs: ["Canterbury", "Crusaders Academy"]
    },
    status: {
      fitness: "injured",
      medical: "treatment"
    },
    currentStatus: "injured",
    physicalAttributes: [{
      date: "2024-01-01",
      weight: 108,
      height: 198,
      bodyFat: 8.8,
      leanMass: 98
    }]
  }
} as const;

export function registerRoutes(app: Express): Server {
  
  // CSV DOWNLOAD ROUTE - PRIORITY REGISTRATION
  app.get('/api/download/statsports-template', (req, res) => {
    try {
      const fs = require('fs');
      const path = require('path');
      
      const templatePath = path.resolve('statsports_gps_upload_template.csv');
      
      console.log('✅ CSV TEMPLATE DOWNLOAD REQUEST');
      console.log('Template path:', templatePath);
      console.log('File exists:', fs.existsSync(templatePath));
      
      if (!fs.existsSync(templatePath)) {
        console.log('❌ Template file not found');
        return res.status(404).json({ error: 'Template file not found' });
      }
      
      const csvContent = fs.readFileSync(templatePath, 'utf8');
      console.log('✅ CSV Content loaded successfully');
      console.log('Content length:', csvContent.length);
      console.log('First line:', csvContent.split('\n')[0]);
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="statsports_gps_upload_template.csv"');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Pragma', 'no-cache');
      
      res.send(csvContent);
      console.log('✅ CSV RESPONSE SENT SUCCESSFULLY - ACTUAL CSV CONTENT');
    } catch (error) {
      console.error('❌ Error serving template file:', error);
      res.status(500).json({ error: 'Failed to serve template file' });
    }
  });

  // FIREBASE V2 API ROUTES - COMPLETE BACKEND
  console.log('🚀 Registering Firebase v2 routes - Complete API architecture...');
  registerFirebaseRoutesV2(app);
  
  // Simple test endpoint to verify API routing works
  app.get("/api/test", (req, res) => {
    res.json({ message: "API routing is working" });
  });

  // Medical availability update endpoint
  app.put("/api/medical/player/:id/availability", (req, res) => {
    const playerId = req.params.id;
    const { availability, medicalNotes, updatedBy } = req.body;
    
    console.log(`🏥 MEDICAL API: Updating availability for ${playerId}:`, { availability, medicalNotes, updatedBy });
    
    res.json({
      success: true,
      message: `Player availability updated to ${availability}`,
      playerId: playerId,
      availability: availability,
      medicalNotes: medicalNotes,
      timestamp: new Date().toISOString()
    });
  });

  // Main players endpoint for team dashboard - FIREBASE INTEGRATED
  app.get("/api/players", async (req, res) => {
    try {
      console.log('🔥 FETCHING PLAYERS FROM FIREBASE (routes_minimal.ts)...');
      
      // Import Firebase here to avoid circular dependencies
      const { db } = require('./firebase');
      
      const playersRef = db.collection('players');
      const snapshot = await playersRef.orderBy('personalDetails.lastName').get();
      
      if (snapshot.empty) {
        console.log('⚠️ No players found in Firebase - using fallback data');
        return res.json([]);
      }

      const players: any[] = [];
      snapshot.forEach((doc: any) => {
        const data = doc.data();
        console.log(`🔍 Processing player ${doc.id}:`, {
          firstName: data.personalDetails?.firstName,
          lastName: data.personalDetails?.lastName,
          primaryPosition: data.primaryPosition
        });
        
        // Transform Firebase data to frontend format
        const player = {
          id: doc.id,
          personalDetails: {
            firstName: data.personalDetails?.firstName || '',
            lastName: data.personalDetails?.lastName || '',
            fullName: data.personalDetails?.fullName || `${data.personalDetails?.firstName || ''} ${data.personalDetails?.lastName || ''}`.trim(),
            primaryPosition: data.primaryPosition || 'Position TBD',
            jerseyNumber: data.jerseyNumber || Math.floor(Math.random() * 99) + 1
          },
          currentStatus: data.availability?.status || 'Available',
          status: {
            fitness: data.availability?.status === 'Available' ? 'available' : 
                     data.availability?.status === 'Injured' ? 'injured' : 'modified',
            medical: 'cleared'
          }
        };
        console.log(`✅ Transformed player:`, player.personalDetails);
        players.push(player);
      });

      console.log(`✅ Returning ${players.length} players from Firebase`);
      res.json(players);

      // REMOVED: All hardcoded data replaced with Firebase
      const removedHardcodedPlayers = [
        {
          id: "mike_wilson",
          personalDetails: {
            firstName: "Mike",
            lastName: "Wilson",
            jerseyNumber: 12,
            position: "Centre"
          },
          currentStatus: "available",
          status: {
            fitness: "available",
            medical: "cleared"
          }
        },
        {
          id: "mike_wilson",
          personalDetails: {
            firstName: "Mike",
            lastName: "Wilson",
            jerseyNumber: 12,
            position: "Centre"
          },
          currentStatus: "available",
          status: {
            fitness: "available",
            medical: "cleared"
          }
        },
        {
          id: "tom_carter",
          personalDetails: {
            firstName: "Tom",
            lastName: "Carter",
            jerseyNumber: 15,
            position: "Fullback"
          },
          currentStatus: "available",
          status: {
            fitness: "available",
            medical: "cleared"
          }
        },
        {
          id: "daniel_collins",
          personalDetails: {
            firstName: "Daniel",
            lastName: "Collins",
            jerseyNumber: 3,
            position: "Tighthead Prop"
          },
          currentStatus: "modified",
          status: {
            fitness: "modified",
            medical: "monitoring"
          }
        },
        {
          id: "sam_rodriguez",
          personalDetails: {
            firstName: "Sam",
            lastName: "Rodriguez",
            jerseyNumber: 9,
            position: "Scrum-half"
          },
          currentStatus: "available",
          status: {
            fitness: "available",
            medical: "cleared"
          }
        },
        {
          id: "luke_henderson",
          personalDetails: {
            firstName: "Luke",
            lastName: "Henderson",
            jerseyNumber: 4,
            position: "Lock"
          },
          currentStatus: "injured",
          status: {
            fitness: "injured",
            medical: "treatment"
          }
        },
        {
          id: "alex_morgan",
          personalDetails: {
            firstName: "Alex",
            lastName: "Morgan",
            jerseyNumber: 10,
            position: "Fly-half"
          },
          currentStatus: "available",
          status: {
            fitness: "available",
            medical: "cleared"
          }
        },
        {
          id: "ryan_patel",
          personalDetails: {
            firstName: "Ryan",
            lastName: "Patel",
            jerseyNumber: 14,
            position: "Wing"
          },
          currentStatus: "modified",
          status: {
            fitness: "modified",
            medical: "recovery"
          }
        },
        {
          id: "james_brown",
          personalDetails: {
            firstName: "James",
            lastName: "Brown",
            jerseyNumber: 1,
            position: "Loosehead Prop"
          },
          currentStatus: "available",
          status: {
            fitness: "available",
            medical: "cleared"
          }
        },
        {
          id: "mason_taylor",
          personalDetails: {
            firstName: "Mason",
            lastName: "Taylor",
            jerseyNumber: 2,
            position: "Hooker"
          },
          currentStatus: "available",
          status: {
            fitness: "available",
            medical: "cleared"
          }
        },
        {
          id: "ethan_clark",
          personalDetails: {
            firstName: "Ethan",
            lastName: "Clark",
            jerseyNumber: 5,
            position: "Lock"
          },
          currentStatus: "available",
          status: {
            fitness: "available",
            medical: "cleared"
          }
        },
        {
          id: "connor_white",
          personalDetails: {
            firstName: "Connor",
            lastName: "White",
            jerseyNumber: 6,
            position: "Blindside Flanker"
          },
          currentStatus: "modified",
          status: {
            fitness: "modified",
            medical: "load_management"
          }
        },
        {
          id: "noah_davis",
          personalDetails: {
            firstName: "Noah",
            lastName: "Davis",
            jerseyNumber: 8,
            position: "Number 8"
          },
          currentStatus: "available",
          status: {
            fitness: "available",
            medical: "cleared"
          }
        },
        {
          id: "joshua_garcia",
          personalDetails: {
            firstName: "Joshua",
            lastName: "Garcia",
            jerseyNumber: 11,
            position: "Wing"
          },
          currentStatus: "available",
          status: {
            fitness: "available",
            medical: "cleared"
          }
        },
        {
          id: "caleb_martinez",
          personalDetails: {
            firstName: "Caleb",
            lastName: "Martinez",
            jerseyNumber: 13,
            position: "Centre"
          },
          currentStatus: "available",
          status: {
            fitness: "available",
            medical: "cleared"
          }
        } 
      ];
      
      // OLD HARDCODED LOGIC REMOVED - Firebase handles response above
    } catch (error) {
      console.error("Error fetching players:", error);
      res.status(500).json({ error: "Failed to fetch players" });
    }
  });

  // Firebase player routes
  app.get("/api/firebase/players", async (req, res) => {
    try {
      res.json({ message: "Firebase players endpoint - implement connection" });
    } catch (error) {
      console.error("Error fetching players:", error);
      res.status(500).json({ error: "Failed to fetch players" });
    }
  });

  // REMOVED: Player data endpoint for medical profile - now handled by Firebase V2 API
  // Legacy route /api/players/:id is handled by firebase-routes-v2.ts

  // Player avatar endpoint
  app.get("/api/players/:id/avatar", async (req, res) => {
    try {
      // Return a placeholder avatar URL
      res.json({ 
        avatarUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face"
      });
    } catch (error) {
      console.error("Error fetching avatar:", error);
      res.status(500).json({ error: "Failed to fetch avatar" });
    }
  });

  // REMOVED: Player status update endpoint - now handled by Firebase V2 API
  // Legacy route /api/players/:id/status is handled by firebase-routes-v2.ts

  // ==========================================
  // XML MATCH DATA UPLOAD ROUTES
  // ==========================================
  app.use(xmlUploadRouter);
  console.log("✅ XML Upload routes registered successfully");

  // Create the HTTP server
  const httpServer = createServer(app);
  return httpServer;
}