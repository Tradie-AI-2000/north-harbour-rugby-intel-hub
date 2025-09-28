import VideoAnalysisComponent from "@/components/video-analysis";

// Sample video data for demonstration
const samplePlayer = {
  id: "james-mitchell",
  personalDetails: {
    firstName: "James",
    lastName: "Mitchell"
  },
  videoAnalysis: [
    {
      id: "video-1",
      title: "Match Highlights vs Auckland Blues",
      description: "Outstanding performance showcasing exceptional lineout throwing and attacking play",
      videoUrl: "https://example.com/video1.mp4",
      thumbnailUrl: "https://example.com/thumb1.jpg",
      duration: 185,
      matchDate: "2024-01-18",
      opponent: "Auckland Blues",
      analysisType: "highlight" as const,
      tags: ["lineout", "attack", "leadership", "tries"],
      keyMoments: [
        {
          timestamp: 45,
          title: "Perfect Lineout Throw",
          description: "Pinpoint accuracy under pressure leading to attacking platform",
          category: "lineout" as const
        },
        {
          timestamp: 92,
          title: "Try Assist",
          description: "Quick hands to create space for winger's try",
          category: "try" as const
        },
        {
          timestamp: 156,
          title: "Defensive Leadership",
          description: "Organizing defensive line and making crucial tackle",
          category: "tackle" as const
        }
      ],
      metrics: {
        tackles: 12,
        carries: 8,
        metersGained: 45,
        turnovers: 2,
        passesCompleted: 23,
        lineoutSuccess: 95
      },
      coachNotes: "Excellent game management and leadership qualities on display. James showed great composure in pressure situations.",
      isHighlight: true,
      uploadedBy: "Coach Williams",
      uploadedAt: "2024-01-19T10:30:00Z"
    },
    {
      id: "video-2",
      title: "Lineout Training Session",
      description: "Technical breakdown of lineout throwing technique and calling strategies",
      videoUrl: "https://example.com/video2.mp4",
      duration: 420,
      matchDate: "2024-01-15",
      analysisType: "skill_focus" as const,
      tags: ["lineout", "technique", "calling", "accuracy"],
      keyMoments: [
        {
          timestamp: 120,
          title: "Throwing Technique",
          description: "Demonstration of proper body positioning and release",
          category: "skill" as const
        },
        {
          timestamp: 285,
          title: "Call Variations",
          description: "Different lineout calls and their execution",
          category: "skill" as const
        }
      ],
      metrics: {
        lineoutSuccess: 98
      },
      coachNotes: "James has perfected his lineout throwing technique. His accuracy has improved significantly over the season.",
      isHighlight: false,
      uploadedBy: "Coach Thompson",
      uploadedAt: "2024-01-16T14:15:00Z"
    },
    {
      id: "video-3",
      title: "Full Match vs Wellington",
      description: "Complete match footage showing game management and decision making",
      videoUrl: "https://example.com/video3.mp4",
      duration: 4800,
      matchDate: "2024-01-12",
      opponent: "Wellington Hurricanes",
      analysisType: "full_match" as const,
      tags: ["full-game", "leadership", "decision-making"],
      keyMoments: [
        {
          timestamp: 1200,
          title: "First Half Try",
          description: "Breaking the line from lineout ball",
          category: "try" as const
        },
        {
          timestamp: 2880,
          title: "Crucial Turnover",
          description: "Stealing ball at breakdown in defensive 22",
          category: "turnover" as const
        }
      ],
      metrics: {
        tackles: 15,
        carries: 12,
        metersGained: 67,
        turnovers: 3,
        passesCompleted: 34,
        lineoutSuccess: 92
      },
      isHighlight: false,
      uploadedBy: "Video Analyst",
      uploadedAt: "2024-01-13T09:00:00Z"
    },
    {
      id: "video-4",
      title: "Scrum Training Session",
      description: "Working on hooking technique and scrum stability",
      videoUrl: "https://example.com/video4.mp4",
      duration: 360,
      matchDate: "2024-01-10",
      analysisType: "training" as const,
      tags: ["scrum", "hooking", "technique", "stability"],
      keyMoments: [
        {
          timestamp: 180,
          title: "Hooking Technique",
          description: "Perfect timing on the hook back",
          category: "scrum" as const
        },
        {
          timestamp: 300,
          title: "Scrum Stability",
          description: "Maintaining position under pressure",
          category: "scrum" as const
        }
      ],
      coachNotes: "Solid improvement in scrum technique. James is becoming more consistent with his hooking.",
      isHighlight: false,
      uploadedBy: "Forward Coach",
      uploadedAt: "2024-01-11T16:45:00Z"
    }
  ]
};

export default function VideoDemo() {
  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-nh-navy mb-2">
            Video Analysis & Highlight Reels Demo
          </h1>
          <p className="text-slate-600">
            North Harbour Rugby Player Performance Hub - Video Analysis Feature
          </p>
        </div>
        
        <VideoAnalysisComponent 
          playerId="james-mitchell" 
          player={samplePlayer as any}
        />
      </div>
    </div>
  );
}