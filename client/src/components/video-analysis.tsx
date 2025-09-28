import { useState } from "react";
import { Play, Pause, SkipBack, SkipForward, Volume2, Maximize, Clock, Tag, Calendar, User } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { format } from "date-fns";
import type { Player, VideoAnalysis } from "@shared/schema";

interface VideoAnalysisProps {
  playerId: string;
  player?: Player;
}

export default function VideoAnalysisComponent({ playerId, player }: VideoAnalysisProps) {
  const [selectedVideo, setSelectedVideo] = useState<VideoAnalysis | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);

  if (!player) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-500">No player data available</p>
      </div>
    );
  }

  const videoAnalysis = (player.videoAnalysis || []) as VideoAnalysis[];
  const highlights = videoAnalysis.filter(video => video.isHighlight);
  const matchVideos = videoAnalysis.filter(video => video.analysisType === 'full_match');
  const trainingVideos = videoAnalysis.filter(video => video.analysisType === 'training');
  const skillAnalysis = videoAnalysis.filter(video => video.analysisType === 'skill_focus');

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'try': return 'bg-nh-green text-white';
      case 'tackle': return 'bg-nh-blue text-white';
      case 'lineout': return 'bg-purple-500 text-white';
      case 'scrum': return 'bg-nh-amber text-white';
      case 'turnover': return 'bg-orange-500 text-white';
      case 'kick': return 'bg-indigo-500 text-white';
      case 'skill': return 'bg-cyan-500 text-white';
      case 'error': return 'bg-red-500 text-white';
      default: return 'bg-slate-500 text-white';
    }
  };

  const VideoPlayer = ({ video }: { video: VideoAnalysis }) => (
    <div className="relative aspect-video bg-black rounded-lg overflow-hidden mb-4">
      {/* Video Player Placeholder */}
      <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900">
        <div className="text-center text-white">
          <Play className="h-16 w-16 mx-auto mb-4 opacity-70" />
          <p className="text-lg font-medium">{video.title}</p>
          <p className="text-sm opacity-70">{formatDuration(video.duration)}</p>
        </div>
      </div>
      
      {/* Video Controls */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
        <div className="flex items-center space-x-2 mb-2">
          <Progress value={(currentTime / video.duration) * 100} className="flex-1" />
          <span className="text-white text-sm">{formatDuration(currentTime)} / {formatDuration(video.duration)}</span>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Button
              size="sm"
              variant="ghost"
              className="text-white hover:bg-white/20"
              onClick={() => setIsPlaying(!isPlaying)}
            >
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </Button>
            <Button size="sm" variant="ghost" className="text-white hover:bg-white/20">
              <SkipBack className="h-4 w-4" />
            </Button>
            <Button size="sm" variant="ghost" className="text-white hover:bg-white/20">
              <SkipForward className="h-4 w-4" />
            </Button>
            <Button size="sm" variant="ghost" className="text-white hover:bg-white/20">
              <Volume2 className="h-4 w-4" />
            </Button>
          </div>
          
          <Button size="sm" variant="ghost" className="text-white hover:bg-white/20">
            <Maximize className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );

  const VideoCard = ({ video }: { video: VideoAnalysis }) => (
    <Card 
      className={`cursor-pointer transition-all hover:shadow-lg ${
        selectedVideo?.id === video.id ? 'ring-2 ring-nh-blue' : ''
      }`}
      onClick={() => setSelectedVideo(video)}
    >
      <div className="relative aspect-video bg-slate-100 rounded-t-lg overflow-hidden">
        {video.thumbnailUrl ? (
          <img 
            src={video.thumbnailUrl} 
            alt={video.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex items-center justify-center h-full bg-gradient-to-br from-slate-200 to-slate-300">
            <Play className="h-8 w-8 text-slate-500" />
          </div>
        )}
        
        <div className="absolute bottom-2 right-2">
          <Badge variant="secondary" className="text-xs">
            <Clock className="h-3 w-3 mr-1" />
            {formatDuration(video.duration)}
          </Badge>
        </div>
        
        {video.isHighlight && (
          <div className="absolute top-2 left-2">
            <Badge className="bg-nh-green text-white text-xs">
              ⭐ Highlight
            </Badge>
          </div>
        )}
      </div>
      
      <CardContent className="p-4">
        <h3 className="font-medium text-sm mb-2 line-clamp-2">{video.title}</h3>
        <p className="text-xs text-slate-600 mb-3 line-clamp-2">{video.description}</p>
        
        <div className="space-y-2">
          <div className="flex items-center text-xs text-slate-500">
            <Calendar className="h-3 w-3 mr-1" />
            {format(new Date(video.matchDate), 'PPP')}
          </div>
          
          {video.opponent && (
            <div className="flex items-center text-xs text-slate-500">
              <span className="mr-1">vs</span>
              {video.opponent}
            </div>
          )}
          
          <div className="flex flex-wrap gap-1">
            {video.tags.slice(0, 2).map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                <Tag className="h-2 w-2 mr-1" />
                {tag}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const KeyMoments = ({ video }: { video: VideoAnalysis }) => (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Key Moments</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {video.keyMoments.map((moment, index) => (
            <div key={index} className="flex items-start space-x-3 p-3 rounded-lg bg-slate-50 hover:bg-slate-100 cursor-pointer">
              <div className="flex-shrink-0">
                <Badge className={getCategoryColor(moment.category)} variant="secondary">
                  {moment.category}
                </Badge>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="font-medium text-sm">{moment.title}</h4>
                  <span className="text-xs text-slate-500">{formatDuration(moment.timestamp)}</span>
                </div>
                <p className="text-xs text-slate-600">{moment.description}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );

  const VideoMetrics = ({ video }: { video: VideoAnalysis }) => (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Performance Metrics</CardTitle>
      </CardHeader>
      <CardContent>
        {video.metrics ? (
          <div className="grid grid-cols-2 gap-4">
            {Object.entries(video.metrics).map(([key, value]) => (
              value !== undefined && (
                <div key={key} className="text-center p-3 bg-slate-50 rounded-lg">
                  <div className="text-2xl font-bold text-nh-navy">{value}</div>
                  <div className="text-xs text-slate-600 capitalize">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </div>
                </div>
              )
            ))}
          </div>
        ) : (
          <p className="text-slate-500 text-center py-8">No metrics available for this video</p>
        )}
        
        {video.coachNotes && (
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center mb-2">
              <User className="h-4 w-4 text-nh-blue mr-2" />
              <span className="font-medium text-sm">Coach Notes</span>
            </div>
            <p className="text-sm text-slate-700">{video.coachNotes}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Selected Video Player */}
      {selectedVideo && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <VideoPlayer video={selectedVideo} />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <KeyMoments video={selectedVideo} />
              <VideoMetrics video={selectedVideo} />
            </div>
          </div>
          
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">{selectedVideo.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-600 mb-4">{selectedVideo.description}</p>
                
                <div className="space-y-3">
                  <div className="flex items-center text-sm">
                    <Calendar className="h-4 w-4 mr-2 text-slate-500" />
                    {format(new Date(selectedVideo.matchDate), 'PPP')}
                  </div>
                  
                  {selectedVideo.opponent && (
                    <div className="flex items-center text-sm">
                      <span className="mr-2 text-slate-500">Opponent:</span>
                      <span className="font-medium">{selectedVideo.opponent}</span>
                    </div>
                  )}
                  
                  <div className="flex items-center text-sm">
                    <Clock className="h-4 w-4 mr-2 text-slate-500" />
                    {formatDuration(selectedVideo.duration)}
                  </div>
                  
                  <div className="flex items-center text-sm">
                    <User className="h-4 w-4 mr-2 text-slate-500" />
                    {selectedVideo.uploadedBy}
                  </div>
                </div>
                
                <div className="mt-4">
                  <h4 className="font-medium text-sm mb-2">Tags</h4>
                  <div className="flex flex-wrap gap-1">
                    {selectedVideo.tags.map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Video Library */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Play className="h-5 w-5 mr-2 text-nh-blue" />
            Video Analysis Library
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="highlights" className="w-full">
            <TabsList className="grid w-full grid-cols-4 bg-gray-100 p-2 rounded-lg border border-gray-200 gap-1">
              <TabsTrigger 
                value="highlights"
                className="py-3 px-4 rounded-md font-medium text-gray-700 transition-all duration-200 hover:bg-white hover:shadow-md data-[state=active]:bg-nh-red data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:scale-105 border-0"
              >
                Highlights ({highlights.length})
              </TabsTrigger>
              <TabsTrigger 
                value="matches"
                className="py-3 px-4 rounded-md font-medium text-gray-700 transition-all duration-200 hover:bg-white hover:shadow-md data-[state=active]:bg-nh-red data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:scale-105 border-0"
              >
                Matches ({matchVideos.length})
              </TabsTrigger>
              <TabsTrigger 
                value="training"
                className="py-3 px-4 rounded-md font-medium text-gray-700 transition-all duration-200 hover:bg-white hover:shadow-md data-[state=active]:bg-nh-red data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:scale-105 border-0"
              >
                Training ({trainingVideos.length})
              </TabsTrigger>
              <TabsTrigger 
                value="skills"
                className="py-3 px-4 rounded-md font-medium text-gray-700 transition-all duration-200 hover:bg-white hover:shadow-md data-[state=active]:bg-nh-red data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:scale-105 border-0"
              >
                Skills ({skillAnalysis.length})
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="highlights" className="mt-4">
              {highlights.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {highlights.map((video) => (
                    <VideoCard key={video.id} video={video} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Play className="h-12 w-12 mx-auto mb-4 text-slate-300" />
                  <p className="text-slate-500">No highlight videos available</p>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="matches" className="mt-4">
              {matchVideos.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {matchVideos.map((video) => (
                    <VideoCard key={video.id} video={video} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Play className="h-12 w-12 mx-auto mb-4 text-slate-300" />
                  <p className="text-slate-500">No match videos available</p>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="training" className="mt-4">
              {trainingVideos.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {trainingVideos.map((video) => (
                    <VideoCard key={video.id} video={video} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Play className="h-12 w-12 mx-auto mb-4 text-slate-300" />
                  <p className="text-slate-500">No training videos available</p>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="skills" className="mt-4">
              {skillAnalysis.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {skillAnalysis.map((video) => (
                    <VideoCard key={video.id} video={video} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Play className="h-12 w-12 mx-auto mb-4 text-slate-300" />
                  <p className="text-slate-500">No skill analysis videos available</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}