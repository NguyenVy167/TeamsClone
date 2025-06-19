import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { X, Mic, MicOff, Video, VideoOff, Monitor, MessageCircle, PhoneOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { VideoCallWithParticipants } from "@shared/schema";

interface VideoCallModalProps {
  channelId: number;
  onClose: () => void;
}

export function VideoCallModal({ channelId, onClose }: VideoCallModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: videoCall } = useQuery<VideoCallWithParticipants | null>({
    queryKey: ["/api/channels", channelId, "video-call"],
    queryFn: () => fetch(`/api/channels/${channelId}/video-call`).then(res => res.json()),
    refetchInterval: 2000, // Poll for updates
  });

  const startCallMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", `/api/channels/${channelId}/video-call`, {
        title: "Team Meeting"
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/channels", channelId, "video-call"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to start video call",
        variant: "destructive",
      });
    },
  });

  const endCallMutation = useMutation({
    mutationFn: async () => {
      if (!videoCall) return;
      const response = await apiRequest("POST", `/api/video-calls/${videoCall.id}/end`, {});
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/channels", channelId, "video-call"] });
      onClose();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to end video call",
        variant: "destructive",
      });
    },
  });

  const getInitials = (name: string) => {
    return name.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2);
  };

  const getUserColor = (userId: number) => {
    const colors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-orange-500', 'bg-pink-500', 'bg-indigo-500'];
    return colors[userId % colors.length];
  };

  // Start call if none exists
  if (!videoCall && !startCallMutation.isPending) {
    startCallMutation.mutate();
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl h-[80vh] p-0 bg-gray-900">
        <div className="h-full bg-gray-900 relative">
          {videoCall ? (
            <>
              {/* Video Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 p-6 h-full">
                {/* Main participant */}
                <div className="lg:col-span-2 bg-gray-800 rounded-lg overflow-hidden relative">
                  <div className="w-full h-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center">
                    <div className={`w-24 h-24 rounded-full flex items-center justify-center ${getUserColor(videoCall.host.id)}`}>
                      <span className="text-white text-2xl font-semibold">
                        {getInitials(videoCall.host.displayName)}
                      </span>
                    </div>
                  </div>
                  <div className="absolute bottom-4 left-4 bg-black bg-opacity-75 text-white px-3 py-1 rounded">
                    {videoCall.host.displayName}
                  </div>
                  <div className="absolute top-4 right-4">
                    <Button size="sm" variant="destructive" className="rounded-full">
                      <MicOff className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                {/* Participant thumbnails */}
                <div className="space-y-4">
                  {videoCall.participantUsers.slice(1).map((participant) => (
                    <div key={participant.id} className="bg-gray-800 rounded-lg overflow-hidden relative aspect-video">
                      <div className="w-full h-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${getUserColor(participant.id)}`}>
                          <span className="text-white text-sm font-semibold">
                            {getInitials(participant.displayName)}
                          </span>
                        </div>
                      </div>
                      <div className="absolute bottom-2 left-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">
                        {participant.displayName}
                      </div>
                    </div>
                  ))}
                  
                  {/* Empty participant slot */}
                  {videoCall.participantUsers.length < 4 && (
                    <div className="bg-gray-700 rounded-lg flex items-center justify-center aspect-video">
                      <div className="text-center">
                        <div className="w-12 h-12 bg-gray-600 rounded-full mx-auto mb-2 flex items-center justify-center">
                          <span className="text-white font-semibold">+</span>
                        </div>
                        <div className="text-white text-sm">Waiting for others</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Video Controls */}
              <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2">
                <div className="flex items-center space-x-4 bg-black bg-opacity-75 px-6 py-3 rounded-full">
                  <Button size="sm" variant="destructive" className="rounded-full">
                    <MicOff className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="secondary" className="rounded-full">
                    <Video className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="secondary" className="rounded-full">
                    <Monitor className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="secondary" className="rounded-full">
                    <MessageCircle className="h-4 w-4" />
                  </Button>
                  <Button 
                    size="sm" 
                    variant="destructive" 
                    className="rounded-full"
                    onClick={() => endCallMutation.mutate()}
                    disabled={endCallMutation.isPending}
                  >
                    <PhoneOff className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-white">Starting video call...</p>
              </div>
            </div>
          )}
          
          {/* Close button */}
          <Button 
            variant="ghost" 
            size="sm" 
            className="absolute top-4 right-4 text-white hover:bg-white hover:bg-opacity-20"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
