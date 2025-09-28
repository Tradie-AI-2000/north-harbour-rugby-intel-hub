// Clean CSV Export for North Harbour Rugby Performance Hub

export function generateCleanPlayersCSV(): string {
  const headers = [
    'firstName', 'lastName', 'dateOfBirth', 'height', 'weight', 'primaryPosition', 
    'jerseyNumber', 'phone', 'email', 'bodyFat', 'fitnessScore', 'topSpeed', 
    'tackles', 'carries', 'tries', 'passAccuracy', 'currentStatus', 'coachingNotes'
  ];

  const samplePlayers = [
    ['Jake', 'Thompson', '1998-03-15', '185', '105', 'Hooker', '2', '+64 21 234 5678', 'jake.thompson@email.com', '12', '85', '28.5', '15', '8', '2', '92', 'Available', 'Excellent lineout throwing'],
    ['Mike', 'Wilson', '1995-07-22', '180', '120', 'Prop', '1', '+64 21 456 7890', 'mike.wilson@email.com', '15', '78', '25.2', '18', '12', '1', '88', 'Available', 'Strong scrummaging technique'],
    ['Sam', 'Roberts', '1999-11-08', '195', '115', 'Lock', '4', '+64 21 678 9012', 'sam.roberts@email.com', '10', '88', '27.1', '20', '6', '1', '85', 'Minor Strain', 'Outstanding lineout work']
  ];

  let csv = headers.join(',') + '\n';
  
  samplePlayers.forEach(player => {
    csv += player.map(field => `"${field}"`).join(',') + '\n';
  });

  return csv;
}

export function generateMatchStatsCSV(): string {
  const headers = [
    'playerName', 'matchDate', 'opponent', 'result', 'minutesPlayed', 'tries', 
    'tackles', 'carries', 'passAccuracy', 'distanceCovered', 'topSpeed'
  ];

  const sampleMatches = [
    ['Jake Thompson', '2025-01-20', 'Auckland', 'W 24-18', '80', '1', '12', '8', '92', '6.2', '28.5'],
    ['Mike Wilson', '2025-01-20', 'Auckland', 'W 24-18', '75', '0', '15', '12', '88', '5.8', '25.2'],
    ['Sam Roberts', '2025-01-15', 'Canterbury', 'L 15-22', '65', '0', '18', '6', '85', '6.8', '27.1']
  ];

  let csv = headers.join(',') + '\n';
  
  sampleMatches.forEach(match => {
    csv += match.map(field => `"${field}"`).join(',') + '\n';
  });

  return csv;
}

export function generateTrainingCSV(): string {
  const headers = [
    'playerName', 'sessionDate', 'sessionType', 'duration', 'intensity', 
    'loadScore', 'rpe', 'completionRate', 'notes'
  ];

  const sampleTraining = [
    ['Jake Thompson', '2025-01-22', 'Strength Training', '90', '8', '450', '7', '100', 'Excellent session'],
    ['Mike Wilson', '2025-01-22', 'Strength Training', '90', '9', '520', '8', '95', 'Focused on scrum technique'],
    ['Sam Roberts', '2025-01-21', 'Skills Training', '75', '6', '320', '5', '100', 'Lineout practice']
  ];

  let csv = headers.join(',') + '\n';
  
  sampleTraining.forEach(session => {
    csv += session.map(field => `"${field}"`).join(',') + '\n';
  });

  return csv;
}

export function generateInjuryCSV(): string {
  const headers = [
    'playerName', 'injuryType', 'injuryDate', 'injuryLocation', 'severity', 
    'expectedReturn', 'currentStatus', 'treatmentNotes'
  ];

  const sampleInjuries = [
    ['Sam Roberts', 'Muscle Strain', '2025-01-10', 'Hamstring', 'Minor', '2025-01-25', 'Recovering', 'Physiotherapy 3x per week'],
    ['Jake Thompson', 'Minor Knock', '2024-12-15', 'Shoulder', 'Very Minor', '2024-12-20', 'Cleared', 'Rest and ice treatment']
  ];

  let csv = headers.join(',') + '\n';
  
  sampleInjuries.forEach(injury => {
    csv += injury.map(field => `"${field}"`).join(',') + '\n';
  });

  return csv;
}