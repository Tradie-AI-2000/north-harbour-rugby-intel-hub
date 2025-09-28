// CSV Export service for North Harbour Rugby Performance Hub
// Creates downloadable CSV templates and exports player data

export class CSVExportService {
  
  // Player data CSV structure with all fields from the dashboard
  static generatePlayersCSV(): string {
    const headers = [
      // Personal Details
      'firstName', 'lastName', 'dateOfBirth', 'height', 'weight', 'primaryPosition', 
      'jerseyNumber', 'phone', 'email', 'address',
      
      // Emergency Contact
      'emergencyContactName', 'emergencyContactRelationship', 'emergencyContactPhone',
      
      // Physical Attributes
      'bodyFat', 'leanMass', 'fitnessScore', 'vo2Max',
      
      // Rugby Profile
      'experience', 'playingLevel', 'preferredFoot', 'secondaryPosition',
      
      // Current Performance Metrics
      'topSpeed', 'averageSpeed', 'distanceCovered', 'sprintCount', 'highSpeedEfforts',
      
      // Game Statistics
      'tackles', 'carries', 'tries', 'assists', 'passAccuracy', 'lineoutSuccess', 
      'scrumSuccess', 'turnovers', 'penalties', 'metersGained',
      
      // Skills Assessment (1-100 scale)
      'ballHandling', 'passing', 'kicking', 'catching', 'rucking', 'scrummaging',
      'gameAwareness', 'decisionMaking', 'communication', 'leadership', 'workRate', 'discipline',
      
      // Advanced Metrics
      'averageHeartRate', 'maxHeartRate', 'caloriesBurned', 'trainingLoad', 'rpe',
      
      // Rugby Specific
      'rucks', 'mauls', 'lineouts', 'possessionTime', 'territoryGained', 'offloads',
      
      // Status & Medical
      'currentStatus', 'injuryStatus', 'lastMatchDate', 'overallRating',
      
      // Notes
      'coachingNotes'
    ];

    const sampleData = [
      // Sample North Harbour Rugby players with realistic data
      [
        'Jake', 'Thompson', '1998-03-15', '185', '105', 'Hooker', '2', 
        '+64 21 234 5678', 'jake.thompson@email.com', '123 Rugby Street, Auckland',
        'Sarah Thompson', 'Mother', '+64 21 345 6789',
        '12', '92.4', '85', '58.2',
        '5', 'Premier', 'Right', 'Prop',
        '28.5', '24.2', '6.2', '12', '18',
        '15', '8', '2', '1', '92', '88', '85', '3', '2', '45',
        '88', '90', '85', '87', '92', '89', '91', '88', '90', '85', '89', '88',
        '165', '185', '2850', '75', '7',
        '25', '8', '12', '15.5', '85', '4',
        'Available', 'Fit', '2025-01-20', '8.5',
        'Excellent lineout throwing accuracy, strong leadership qualities'
      ],
      [
        'Mike', 'Wilson', '1995-07-22', '180', '120', 'Prop', '1',
        '+64 21 456 7890', 'mike.wilson@email.com', '456 Scrum Lane, Auckland',
        'John Wilson', 'Father', '+64 21 567 8901',
        '15', '102', '78', '52.8',
        '8', 'Premier', 'Left', 'Hooker',
        '25.2', '22.1', '5.8', '8', '12',
        '18', '12', '1', '0', '88', '92', '95', '1', '1', '38',
        '85', '88', '82', '85', '88', '92', '87', '85', '88', '82', '85', '90',
        '170', '190', '3200', '82', '8',
        '32', '12', '8', '12.2', '92', '2',
        'Available', 'Fit', '2025-01-20', '8.2',
        'Exceptional scrummaging technique, improving mobility'
      ],
      [
        'Sam', 'Roberts', '1999-11-08', '195', '115', 'Lock', '4',
        '+64 21 678 9012', 'sam.roberts@email.com', '789 Lineout Ave, Auckland',
        'Emma Roberts', 'Mother', '+64 21 789 0123',
        '10', '103.5', '88', '62.1',
        '3', 'Premier', 'Right', 'Flanker',
        '27.1', '23.8', '6.8', '10', '15',
        '20', '6', '1', '2', '85', '95', '88', '4', '0', '42',
        '82', '85', '78', '88', '85', '88', '89', '92', '85', '88', '92', '85',
        '168', '182', '3100', '78', '6',
        '28', '15', '18', '18.2', '95', '6',
        'Minor Strain', 'Recovering', '2025-01-15', '8.8',
        'Outstanding lineout work, excellent aerial skills'
      ]
    ];

    let csv = headers.join(',') + '\n';
    
    sampleData.forEach(row => {
      csv += row.map(field => `"${field}"`).join(',') + '\n';
    });
    
    return csv;
  }

  // Match statistics CSV structure
  static generateMatchStatsCSV(): string {
    const headers = [
      'playerName', 'matchDate', 'opponent', 'result', 'minutesPlayed',
      'tries', 'assists', 'tackles', 'missedTackles', 'carries', 'metersGained',
      'passAccuracy', 'lineoutSuccess', 'scrumSuccess', 'turnovers', 'penalties',
      'distanceCovered', 'topSpeed', 'sprintCount', 'rucks', 'mauls', 'offloads',
      'defendersBeaten', 'cleanBreaks', 'possessionTime'
    ];

    const sampleData = [
      ['Jake Thompson', '2025-01-20', 'Auckland', 'W 24-18', '80', '1', '0', '12', '1', '8', '45', '92', '88', '85', '2', '1', '6.2', '28.5', '12', '15', '3', '2', '3', '1', '12.5'],
      ['Mike Wilson', '2025-01-20', 'Auckland', 'W 24-18', '75', '0', '1', '15', '2', '12', '38', '88', '92', '95', '1', '2', '5.8', '25.2', '8', '18', '5', '1', '2', '0', '8.2'],
      ['Sam Roberts', '2025-01-15', 'Canterbury', 'L 15-22', '65', '0', '0', '18', '1', '6', '42', '85', '95', '88', '3', '0', '6.8', '27.1', '10', '20', '8', '0', '1', '1', '15.8']
    ];

    let csv = headers.join(',') + '\n';
    sampleData.forEach(row => {
      csv += row.map(field => `"${field}"`).join(',') + '\n';
    });

    return csv;
  }

  // Training data CSV structure
  static generateTrainingCSV(): string {
    const headers = [
      'playerName', 'sessionDate', 'sessionType', 'duration', 'intensity',
      'loadScore', 'rpe', 'completionRate', 'caloriesBurned', 'averageHeartRate',
      'maxHeartRate', 'notes'
    ];

    const sampleData = [
      ['Jake Thompson', '2025-01-22', 'Strength Training', '90', '8', '450', '7', '100', '420', '145', '175', 'Excellent session, increased squat weight'],
      ['Mike Wilson', '2025-01-22', 'Strength Training', '90', '9', '520', '8', '95', '480', '155', '185', 'Focused on scrum technique'],
      ['Sam Roberts', '2025-01-21', 'Skills Training', '75', '6', '320', '5', '100', '350', '125', '160', 'Lineout practice, good progress']
    ];

    let csv = headers.join(',') + '\n';
    sampleData.forEach(row => {
      csv += row.map(field => `"${field}"`).join(',') + '\n';
    });

    return csv;
  }

  // Injury tracking CSV structure
  static generateInjuryTrackingCSV(): string {
    const headers = [
      'playerName', 'injuryType', 'injuryDate', 'injuryLocation', 'severity',
      'cause', 'expectedReturn', 'actualReturn', 'currentStatus', 'treatmentNotes',
      'clearanceStatus'
    ];

    const sampleData = [
      ['Sam Roberts', 'Muscle Strain', '2025-01-10', 'Hamstring', '2', 'Training overload', '2025-01-25', '', 'Recovering', 'Physiotherapy 3x per week', 'Pending'],
      ['Jake Thompson', 'Minor Knock', '2024-12-15', 'Shoulder', '1', 'Tackle contact', '2024-12-20', '2024-12-18', 'Cleared', 'Rest and ice', 'Cleared'],
    ];

    let csv = headers.join(',') + '\n';
    sampleData.forEach(row => {
      csv += row.map(field => `"${field}"`).join(',') + '\n';
    });

    return csv;
  }

  // Generate complete package with all CSV files
  static generateCompletePackage(): { [key: string]: string } {
    return {
      'players.csv': this.generatePlayersCSV(),
      'match_stats.csv': this.generateMatchStatsCSV(),
      'training_data.csv': this.generateTrainingCSV(),
      'injury_tracking.csv': this.generateInjuryTrackingCSV()
    };
  }
}

export { CSVExportService };