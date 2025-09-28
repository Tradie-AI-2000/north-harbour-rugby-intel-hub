import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { queryClient } from "./lib/queryClient";
import PlayerDashboard from "@/pages/player-dashboard";
import ExperimentalPlayerProfile from "@/pages/experimental-player-profile";
import PlayersOverview from "@/pages/players-overview";
import EnhancedPlayerProfile from "@/pages/enhanced-player-profile";
import MoneyBallPlayers from "@/pages/moneyball-players";
import VideoDemo from "@/pages/video-demo";
import FeaturesDemo from "@/pages/features-demo";
import TeamCohesionDashboard from "@/pages/team-cohesion-dashboard";
import TeamCohesionAnalytics from "@/pages/team-cohesion-analytics";
import AnalyticsOverview from "@/pages/analytics-overview";
import PerformanceAnalytics from "@/pages/performance-analytics";
import FitnessAnalytics from "@/pages/fitness-analytics";
import MainDashboard from "@/pages/main-dashboard";
import DataManagement from "@/pages/data-management";
import DataIntegration from "@/pages/data-integration";
import CSVUpload from "@/pages/csv-upload";
import TeamDashboard from "@/pages/team-dashboard";
import GPSManagement from "@/pages/gps-management";
import MatchPerformanceFixed from "@/pages/match-performance-fixed";
import MatchPerformance from "@/pages/match-performance";
import XMLMatchPerformance from "@/pages/xml-match-performance";
import MedicalHub from "@/pages/medical-hub-new";
import MedicalPlayerProfile from "@/pages/medical-player-profile";
import MedicalPortalTest from "@/pages/medical-portal-test";
import DataIntegrityDemo from "@/pages/data-integrity-demo";
import GameDayAnalysis from "@/pages/game-day-analysis";
import DataTemplatesHub from "@/pages/data-templates-hub";
import DataSchemaViewer from "@/pages/data-schema-viewer";
import TryAnalysisWrapper from "@/pages/try-analysis-simplified";
import MatchFixtures from "@/pages/match-fixtures";
import MatchList from "@/pages/match-list";
import SquadBuilder from "@/pages/squad-builder";
import WorkRateReport from "@/pages/work-rate-report";
import DataUploadPortal from "@/pages/data-upload-portal";
import DatabaseAdmin from "@/pages/database-admin";
import RoleSelection from "@/pages/role-selection";
import StrengthConditioning from "@/pages/strength-conditioning";
import SCPortal from "@/pages/sc-portal";
import TrainingWorkrate from "@/pages/training-workrate";
import WebSocketTestPage from "@/pages/websocket-test";
import FirebaseMigration from "@/pages/firebase-migration";
import CascadeTestDashboard from "@/components/cascade-test-dashboard";
import StatSportsUpload from "@/pages/statsports-upload";
import EnhancedStatSportsUpload from "@/pages/enhanced-statsports-upload";
import AthleteWellness from "@/pages/athlete-wellness";
import StrengthPowerTesting from "@/pages/strength-power-testing";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/features" component={FeaturesDemo} />
      <Route path="/data-management" component={DataManagement} />
      <Route path="/data-integration" component={DataIntegration} />
      <Route path="/csv-upload" component={CSVUpload} />
      <Route path="/video-demo" component={VideoDemo} />
      <Route path="/players" component={PlayersOverview} />
      <Route path="/player/:playerId" component={EnhancedPlayerProfile} />
      <Route path="/legacy/player/:playerId" component={PlayerDashboard} />
      {/* Team Routes - Standardized */}
      <Route path="/team" component={TeamDashboard} />
      <Route path="/team-cohesion" component={TeamCohesionAnalytics} />
      <Route path="/squad-builder" component={SquadBuilder} />
      
      {/* Team Route Redirects */}
      <Route path="/team/overview">
        {() => {
          window.location.replace("/team");
          return null;
        }}
      </Route>
      <Route path="/team-dashboard">
        {() => {
          window.location.replace("/team");
          return null;
        }}
      </Route>
      
      {/* Analytics Routes - Now using XML Match Performance as primary */}
      <Route path="/analytics/match-list/match-performance/:matchId/try-analysis" component={XMLMatchPerformance} />
      <Route path="/analytics/match-list/match-performance/:matchId" component={XMLMatchPerformance} />
      <Route path="/analytics/match-performance/:matchId" component={XMLMatchPerformance} />
      <Route path="/analytics/xml-match-performance/:matchId" component={XMLMatchPerformance} />
      <Route path="/xml-match-performance" component={XMLMatchPerformance} />
      <Route path="/analytics/match-list" component={MatchList} />
      <Route path="/analytics" component={AnalyticsOverview} />
      
      {/* Strength & Conditioning Portal */}
      <Route path="/sc-portal" component={SCPortal} />
      <Route path="/training-workrate" component={TrainingWorkrate} />
      <Route path="/s&c/training-workrate" component={TrainingWorkrate} />
      <Route path="/strength-conditioning" component={StrengthConditioning} />
      <Route path="/gps-management" component={GPSManagement} />
      <Route path="/work-rate-report" component={WorkRateReport} />
      <Route path="/experimental-player-profile" component={ExperimentalPlayerProfile} />
      <Route path="/experimental-player-profile/:playerId" component={ExperimentalPlayerProfile} />
      <Route path="/fitness-analytics" component={FitnessAnalytics} />
      <Route path="/main-dashboard" component={MainDashboard} />

      {/* Legacy Routes for backwards compatibility */}
      <Route path="/performance-analytics" component={PerformanceAnalytics} />
      <Route path="/match-fixtures" component={MatchFixtures} />
      <Route path="/match-list" component={MatchList} />
      <Route path="/match-performance" component={XMLMatchPerformance} />
      <Route path="/match-performance/:matchId" component={XMLMatchPerformance} />
      <Route path="/match-performance/:matchId/try-analysis" component={XMLMatchPerformance} />
      <Route path="/medical" component={MedicalHub} />
      <Route path="/medical-player/:playerId" component={MedicalPlayerProfile} />
      <Route path="/medical-portal-test" component={MedicalPortalTest} />
      
      {/* Medical Route Redirects */}
      <Route path="/medical-hub">
        {() => {
          window.location.replace("/medical");
          return null;
        }}
      </Route>
      <Route path="/data-integrity" component={DataIntegrityDemo} />
      
      {/* Route Redirects for Backwards Compatibility */}
      <Route path="/data-integrity-demo">
        {() => {
          window.location.replace("/data-integrity");
          return null;
        }}
      </Route>
      <Route path="/data-templates" component={DataTemplatesHub} />
      <Route path="/data-schema" component={DataSchemaViewer} />
      <Route path="/try-analysis" component={TryAnalysisWrapper} />
      <Route path="/work-rate-report" component={WorkRateReport} />
      <Route path="/data-upload-portal" component={DataUploadPortal} />
      <Route path="/statsports-upload" component={StatSportsUpload} />
      <Route path="/enhanced-statsports-upload" component={EnhancedStatSportsUpload} />
      <Route path="/athlete-wellness" component={AthleteWellness} />
      <Route path="/strength-power-testing" component={StrengthPowerTesting} />
      
      {/* Additional Route Redirects */}
      <Route path="/analytics/work-rate-report">
        {() => {
          window.location.replace("/work-rate-report");
          return null;
        }}
      </Route>
      <Route path="/database-admin" component={DatabaseAdmin} />
      <Route path="/firebase-migration" component={FirebaseMigration} />
      <Route path="/cascade-test" component={CascadeTestDashboard} />
      <Route path="/game-day/:id" component={GameDayAnalysis} />
      <Route path="/role-selection" component={RoleSelection} />
      <Route path="/experimental/player/:playerId" component={ExperimentalPlayerProfile} />
      <Route path="/moneyball" component={MoneyBallPlayers} />
      <Route path="/dashboard" component={MainDashboard} />
      <Route path="/websocket-test" component={WebSocketTestPage} />
      <Route path="/" component={RoleSelection} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
