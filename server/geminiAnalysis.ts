import { GoogleGenerativeAI } from "@google/generative-ai";

if (!process.env.GEMINI_API_KEY) {
  throw new Error("GEMINI_API_KEY environment variable must be set");
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export interface MatchAnalysisRequest {
  sectionId: string;
  matchData: any;
  teamStats?: any;
  playerPerformances?: any[];
}

export interface GeminiAnalysisResult {
  section: string;
  analysis: string;
  keyInsights: string[];
  recommendations: string[];
  performanceRating: number;
  confidence: number;
}

export class GeminiRugbyAnalyst {
  public model: any;
  
  constructor() {
    // Use Gemini Pro for advanced rugby analysis
    this.model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  }

  async analyzeMatchSection(request: MatchAnalysisRequest): Promise<GeminiAnalysisResult> {
    const prompt = this.buildAnalysisPrompt(request);
    
    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const analysisText = response.text();
      
      // Parse the structured response
      return this.parseGeminiResponse(analysisText, request.sectionId);
    } catch (error) {
      console.error("Error generating Gemini analysis:", error);
      throw new Error("Failed to generate AI analysis");
    }
  }

  private buildAnalysisPrompt(request: MatchAnalysisRequest): string {
    const { sectionId, matchData, teamStats, playerPerformances } = request;
    
    let prompt = `You are an expert rugby performance analyst and coach with 20+ years of experience analyzing professional rugby matches. 

Analyze the following ${sectionId.replace('_', ' ')} data from a North Harbour Rugby match and provide expert insights:

MATCH CONTEXT:
- North Harbour vs ${matchData?.opponent || 'Opposition'}
- Result: ${matchData?.result || 'Unknown'} (${matchData?.finalScore || 'N/A'})
- Competition: ${matchData?.competition || 'NPC'}

`;

    switch (sectionId) {
      case 'possession_territory':
        prompt += `POSSESSION & TERRITORY DATA:
- Possession: ${teamStats?.possessionPercent}%
- Territory: ${teamStats?.territoryPercent}%
- Attacking Minutes: ${teamStats?.attackingMinutes}
- Ball in Play: ${teamStats?.ballInPlayMinutes} minutes

ANALYSIS REQUIRED:
1. Evaluate possession efficiency and territory control
2. Assess attacking time utilization
3. Compare to professional benchmarks (45-55% possession optimal)
4. Identify tactical implications for game management
5. Provide specific coaching recommendations for improvement`;
        break;

      case 'attack_analysis':
        prompt += `ATTACK PERFORMANCE DATA:
- Carry Efficiency: ${teamStats?.carryEfficiencyPercent}%
- Carries Over Gainline: ${teamStats?.carriesOverGainlinePercent}%
- Carries On Gainline: ${teamStats?.carriesOnGainlinePercent}%
- Carries Behind Gainline: ${teamStats?.carriesBehindGainlinePercent}%

TOP PERFORMERS:
${playerPerformances?.slice(0, 3).map(p => 
  `- ${p.playerName} (${p.position}): ${p.ballCarryMetres || p.carries || 0}m/${p.linebreaks || 0} linebreaks`
).join('\n')}

ANALYSIS REQUIRED:
1. Evaluate gainline success and attacking structure
2. Assess individual player contributions and impact
3. Compare attack patterns to elite rugby standards
4. Identify strengths to exploit and weaknesses to address
5. Provide tactical recommendations for attacking improvement`;
        break;

      case 'defence_analysis':
        prompt += `DEFENSIVE PERFORMANCE DATA:
- Team Tackle Success: ${teamStats?.madeTacklePercent}%
- Opposition Carries Over Gainline: ${teamStats?.oppCarriesOverGainlinePercent}%

DEFENSIVE LEADERS:
${playerPerformances?.filter(p => p.tacklesMade).slice(0, 4).map(p => 
  `- ${p.playerName} (${p.position}): ${p.tacklesMade} tackles, ${p.madeTacklePercent}% success, ${p.dominantTackles || 0} dominant`
).join('\n')}

ANALYSIS REQUIRED:
1. Evaluate defensive structure and line speed effectiveness
2. Assess individual tackle technique and success rates
3. Analyze opposition attacking success against our defense
4. Compare to professional defensive standards (85%+ tackle success)
5. Provide specific defensive coaching points and improvements`;
        break;

      case 'breakdown_analysis':
        prompt += `BREAKDOWN PERFORMANCE DATA:
- Ruck Retention: ${teamStats?.ruckRetentionPercent}%
- Quick Ball (0-3s): ${teamStats?.ruckSpeed0to3SecsPercent}%
- Medium Ball (3-6s): ${teamStats?.ruckSpeed3to6SecsPercent}%
- Slow Ball (6s+): ${teamStats?.ruckSpeedOver6SecsPercent}%
- Breakdown Steals: ${teamStats?.breakdownSteals}

BREAKDOWN SPECIALISTS:
${playerPerformances?.filter(p => p.ruckArrivals).slice(0, 3).map(p => 
  `- ${p.playerName} (${p.position}): ${p.ruckArrivals} arrivals, ${p.ruckFirst3} first-3, ${p.cleanouts} cleanouts`
).join('\n')}

ANALYSIS REQUIRED:
1. Evaluate breakdown dominance and ball speed
2. Assess individual player contributions to ruck success
3. Compare ruck speed to elite professional standards
4. Analyze counter-rucking effectiveness
5. Provide technical and tactical breakdown improvements`;
        break;

      case 'set_piece':
        prompt += `SET PIECE PERFORMANCE DATA:
- Own Scrum Won: ${teamStats?.ownScrumWonPercent}%
- Scrum Completion: ${teamStats?.ownScrumCompletionPercent}%
- Total Scrums: ${teamStats?.totalScrums}
- Overall Completion: ${teamStats?.scrumCompletionPercent}%

ANALYSIS REQUIRED:
1. Evaluate scrum dominance and technical execution
2. Assess lineout performance and accuracy
3. Compare set piece to professional benchmarks
4. Identify opportunities for attacking platform creation
5. Provide technical coaching points for forward pack`;
        break;

      case 'individual_performance':
        prompt += `INDIVIDUAL PLAYER RATINGS:
${playerPerformances?.map(p => 
  `- ${p.playerName} (${p.position}): ${p.overallRating}/10
    Key Stats: ${p.triesScored ? `${p.triesScored} tries` : ''}${p.tacklesMade ? `${p.tacklesMade} tackles` : ''}${p.ballCarryMetres ? `${p.ballCarryMetres}m` : ''}`
).join('\n')}

ANALYSIS REQUIRED:
1. Evaluate individual player impact on team performance
2. Identify standout performers and areas for improvement
3. Assess position-specific contributions and effectiveness
4. Compare individual metrics to professional standards
5. Provide player development recommendations and contract implications`;
        break;
    }

    prompt += `

RESPONSE FORMAT:
Provide your analysis in the following structured format:

**EXPERT ANALYSIS:**
[Detailed professional assessment of the performance data]

**KEY INSIGHTS:**
• [3-4 bullet points of the most important findings]

**TACTICAL RECOMMENDATIONS:**
• [3-4 specific coaching recommendations for improvement]

**PERFORMANCE RATING:** [Score out of 10 with justification]

**CONFIDENCE LEVEL:** [Your confidence in this analysis, 0-100%]

Focus on actionable insights that Jimmy Maher and the North Harbour coaching staff can implement. Use professional rugby terminology and reference specific tactical concepts.`;

    return prompt;
  }

  private parseGeminiResponse(analysisText: string, sectionId: string): GeminiAnalysisResult {
    // Extract structured data from Gemini response
    const analysis = analysisText;
    
    // Extract key insights (look for bullet points after "KEY INSIGHTS:")
    const insightsMatch = analysis.match(/\*\*KEY INSIGHTS:\*\*([\s\S]*?)\*\*TACTICAL RECOMMENDATIONS:\*\*/);
    const keyInsights = insightsMatch 
      ? insightsMatch[1].split('•').filter(item => item.trim()).map(item => item.trim())
      : [];

    // Extract recommendations
    const recommendationsMatch = analysis.match(/\*\*TACTICAL RECOMMENDATIONS:\*\*([\s\S]*?)\*\*PERFORMANCE RATING:\*\*/);
    const recommendations = recommendationsMatch
      ? recommendationsMatch[1].split('•').filter(item => item.trim()).map(item => item.trim())
      : [];

    // Extract performance rating
    const ratingMatch = analysis.match(/\*\*PERFORMANCE RATING:\*\*\s*(\d+(?:\.\d+)?)/);
    const performanceRating = ratingMatch ? parseFloat(ratingMatch[1]) : 7.5;

    // Extract confidence level
    const confidenceMatch = analysis.match(/\*\*CONFIDENCE LEVEL:\*\*\s*(\d+)/);
    const confidence = confidenceMatch ? parseInt(confidenceMatch[1]) : 85;

    return {
      section: sectionId,
      analysis: analysisText,
      keyInsights: keyInsights.slice(0, 4), // Limit to 4 insights
      recommendations: recommendations.slice(0, 4), // Limit to 4 recommendations
      performanceRating: Math.min(10, Math.max(0, performanceRating)),
      confidence: Math.min(100, Math.max(0, confidence))
    };
  }

  async analyzePlayerPerformance(playerId: string, matchData: any, playerStats: any): Promise<GeminiAnalysisResult> {
    const prompt = `You are an expert rugby performance analyst. Analyze this individual player performance:

PLAYER: ${playerStats.playerName} (${playerStats.position})
MATCH: North Harbour vs ${matchData.opponent}
OVERALL RATING: ${playerStats.overallRating}/10

PERFORMANCE DATA:
${JSON.stringify(playerStats, null, 2)}

Provide expert analysis focusing on:
1. Position-specific performance evaluation
2. Impact on team success
3. Technical strengths and weaknesses
4. Development recommendations
5. Contract/selection implications

Use the same structured format with expert analysis, key insights, recommendations, rating, and confidence level.`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const analysisText = response.text();
      
      return this.parseGeminiResponse(analysisText, `player_${playerId}`);
    } catch (error) {
      console.error("Error generating player analysis:", error);
      throw new Error("Failed to generate player analysis");
    }
  }

  async generateMatchReport(matchData: any, teamStats: any, playerPerformances: any[]): Promise<string> {
    const prompt = `You are Jimmy Maher, Head Coach of North Harbour Rugby. Generate a comprehensive post-match analysis report.

MATCH SUMMARY:
- North Harbour vs ${matchData.opponent}
- Result: ${matchData.result} (${matchData.finalScore})
- Competition: ${matchData.competition}

TEAM PERFORMANCE SUMMARY:
${JSON.stringify(teamStats, null, 2)}

TOP 3 PERFORMERS:
${playerPerformances.slice(0, 3).map(p => `${p.playerName}: ${p.overallRating}/10`).join('\n')}

Generate a professional coaching report covering:
1. Match overview and result analysis
2. Team performance by phase (attack, defense, set piece)
3. Individual player highlights and concerns
4. Key learnings and tactical adjustments needed
5. Focus areas for next training week
6. Selection considerations for next match

Write in a professional coaching tone suitable for team management and player feedback.`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error("Error generating match report:", error);
      throw new Error("Failed to generate match report");
    }
  }

  async analyzeTryPatterns(data: {
    totalTries: number;
    zoneBreakdown: any[];
    quarterBreakdown: any[];
    phaseBreakdown: any[];
    sourceBreakdown: any[];
    teamBreakdown: any;
    rawData: any[];
  }): Promise<string> {
    const prompt = `As a professional rugby analyst, analyze the following try-scoring patterns and provide detailed insights:

**Try Scoring Data:**
- Total Tries: ${data.totalTries}
- Team Breakdown: ${data.teamBreakdown.home} home tries, ${data.teamBreakdown.away} away tries

**Zone Distribution:**
${data.zoneBreakdown.map(zone => `- ${zone.name}: ${zone.value} tries (${zone.percentage}%)`).join('\n')}

**Quarter Distribution:**
${data.quarterBreakdown.map(quarter => `- ${quarter.name}: ${quarter.value} tries (${quarter.percentage}%)`).join('\n')}

**Phase Distribution:**
${data.phaseBreakdown.map(phase => `- ${phase.name}: ${phase.value} tries (${phase.percentage}%)`).join('\n')}

**Try Sources:**
${data.sourceBreakdown.map(source => `- ${source.name}: ${source.value} tries (${source.percentage}%)`).join('\n')}

**Analysis Requirements:**
1. **Tactical Patterns**: Identify key trends in try-scoring zones and what this reveals about team tactics
2. **Temporal Analysis**: Analyze quarter-by-quarter patterns and what this indicates about fitness, momentum, or tactical changes
3. **Phase Play Insights**: Examine phase distribution to understand attacking structures and efficiency
4. **Source Analysis**: Evaluate the effectiveness of different attacking platforms (set piece vs. open play)
5. **Comparative Context**: How these patterns compare to typical rugby performance metrics
6. **Future Implications**: Recommendations for tactical adjustments and areas of focus
7. **Opposition Scouting**: If this is opposition data, highlight vulnerabilities to exploit
8. **Performance Benchmarking**: Compare against professional rugby standards where relevant

**Future Analysis Note**: When more match data becomes available, this analysis will include:
- Comparison with historical performance
- Opposition-specific try-scoring patterns
- Home vs. away performance variations
- Seasonal trends and development trajectories

Provide a comprehensive analysis in a professional rugby coaching format with actionable insights.`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Gemini API error:', error);
      throw new Error('Failed to generate try pattern analysis');
    }
  }

  async analyzeComparativeTryPatterns(data: {
    currentTeam: {
      name: string;
      totalTries: number;
      zoneBreakdown: any[];
      quarterBreakdown: any[];
      phaseBreakdown: any[];
      sourceBreakdown: any[];
      rawData: any[];
      isNorthHarbour: boolean;
    };
    oppositionTeam: {
      name: string;
      totalTries: number;
      rawData: any[];
      isNorthHarbour: boolean;
    } | null;
    comparative: boolean;
    analysisFrom?: string;
    analysisPerspective?: string;
    matchContext?: {
      homeTeam: string;
      awayTeam: string;
      venue: string;
      date: string;
    };
  }): Promise<string> {
    const { currentTeam, oppositionTeam, comparative, analysisFrom, analysisPerspective, matchContext } = data;
    
    // Determine analysis perspective based on whether current team is North Harbour
    const isAnalyzingNorthHarbour = currentTeam.isNorthHarbour;
    const analysisType = isAnalyzingNorthHarbour ? 'attacking' : 'defensive';
    
    let prompt = `As a professional rugby analyst for "North Harbour Rugby", provide analysis from our team's perspective:

## Match Context
**Fixture:** ${matchContext?.homeTeam || 'Team 1'} vs ${matchContext?.awayTeam || 'Team 2'}
**Venue:** ${matchContext?.venue || 'Stadium'}
**Date:** ${matchContext?.date || 'Match Day'}

## ${isAnalyzingNorthHarbour ? 'North Harbour Attacking Analysis' : 'Opposition Scouting Report (Defensive Analysis)'}
**Analysis Type:** ${isAnalyzingNorthHarbour ? 'Our try-scoring patterns and attacking effectiveness' : 'Opposition try-scoring patterns - how they score against us'}
**Team Analyzed:** ${currentTeam.name}
**Total Tries:** ${currentTeam.totalTries}

**Zone Distribution:**
${currentTeam.zoneBreakdown.map(zone => `- ${zone.name}: ${zone.value} tries (${zone.percentage}%)`).join('\n')}

**Quarter Distribution:**
${currentTeam.quarterBreakdown.map(quarter => `- ${quarter.name}: ${quarter.value} tries (${quarter.percentage}%)`).join('\n')}

**Phase Distribution:**
${currentTeam.phaseBreakdown.map(phase => `- ${phase.name}: ${phase.value} tries (${phase.percentage}%)`).join('\n')}

**Try Sources:**
${currentTeam.sourceBreakdown.map(source => `- ${source.name}: ${source.value} tries (${source.percentage}%)`).join('\n')}`;

    if (comparative && oppositionTeam) {
      // Calculate opposition zone breakdown for comparison
      const oppZoneBreakdown = ['attacking_22', 'attacking_22m_halfway', 'defending_22m_halfway', 'defending_22'].map(zone => {
        const count = oppositionTeam.rawData.filter((t: any) => t.zone === zone).length;
        return {
          name: zone.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()),
          value: count,
          percentage: oppositionTeam.totalTries > 0 ? Math.round((count / oppositionTeam.totalTries) * 100) : 0
        };
      });

      if (isAnalyzingNorthHarbour) {
        prompt += `

## Tries Against Analysis (Defensive Patterns)
**Total Tries We Conceded:** ${oppositionTeam.totalTries}

**Where Opposition Scored Against Us:**
${oppZoneBreakdown.map(zone => `- ${zone.name}: ${zone.value} tries (${zone.percentage}%)`).join('\n')}

## Attack vs Defense Comparison:
1. **Zone Patterns**: Compare where we score vs where we concede
2. **Defensive Vulnerabilities**: Identify our weak defensive zones
3. **Tactical Balance**: Areas where we're strong in attack but weak in defense
4. **Coaching Priorities**: Balance offensive development with defensive improvements`;
      } else {
        prompt += `

## Our Try-Scoring Reference
**Our Tries Scored:** ${oppositionTeam.totalTries}

**Our Zone Distribution:**
${oppZoneBreakdown.map(zone => `- ${zone.name}: ${zone.value} tries (${zone.percentage}%)`).join('\n')}

## Opposition Scouting vs Our Performance:
1. **Comparative Strengths**: How opposition patterns compare to our own
2. **Tactical Insights**: What their try patterns reveal about our defensive performance
3. **Strategic Planning**: How to exploit their patterns while improving our own`;
      }
    }

    prompt += `

**Analysis Framework (Always from North Harbour Rugby perspective):**
${isAnalyzingNorthHarbour ? 
  `1. **Our Attacking Efficiency**: Detailed analysis of North Harbour's try-scoring patterns and effectiveness
2. **Temporal Patterns**: Our quarter-by-quarter momentum, fitness, and concentration levels
3. **Our Phase Play**: Effectiveness of our attacking structures and continuity
4. **Our Platform Success**: Set piece vs open play try-scoring effectiveness
5. **Zone Analysis**: Our preferred attacking areas and success rates
6. **Strategic Development**: Areas where North Harbour can improve attacking output
7. **Training Focus**: Priority attacking skills for team development sessions` :
  `1. **Opposition Scouting**: Understanding ${currentTeam.name}'s try-scoring patterns and tendencies
2. **Their Temporal Patterns**: When ${currentTeam.name} scores most effectively against us
3. **Their Attacking Structure**: How they build phases and create opportunities
4. **Their Platform Preferences**: Where ${currentTeam.name} is most dangerous against our defense
5. **Defensive Strategy**: How North Harbour can nullify their attacking strengths
6. **Exploit Opportunities**: ${currentTeam.name}'s attacking weaknesses we can target
7. **Game Plan Recommendations**: Tactical adjustments to prevent their try-scoring patterns`}

${comparative && oppositionTeam ? `
**Comparative Analysis Available:**
- Opposition Team: ${oppositionTeam.name}
- Opposition Tries: ${oppositionTeam.totalTries}
- Provide direct comparisons and tactical recommendations based on both datasets
` : ''}

Provide comprehensive analysis with specific, actionable recommendations for North Harbour Rugby coaching staff.`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Gemini API error:', error);
      throw new Error('Failed to generate comparative try pattern analysis');
    }
  }
}

export const geminiAnalyst = new GeminiRugbyAnalyst();