import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { MessageCircle, Phone, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { TeamMemberWithUser, VideoCallWithParticipants } from "@shared/schema";

interface MembersSidebarProps {
  teamId: number;
  onStartVideoCall: () => void;
}

export function MembersSidebar({ teamId, onStartVideoCall }: MembersSidebarProps) {
  const { data: members } = useQuery<TeamMemberWithUser[]>({
    queryKey: ["/api/teams", teamId, "members"],
    queryFn: () => fetch(`/api/teams/${teamId}/members`).then(res => res.json()),
  });

  const { data: videoCall } = useQuery<VideoCallWithParticipants | null>({
    queryKey: ["/api/channels", 1, "video-call"], // Using channel 1 for demo
    queryFn: () => fetch(`/api/channels/1/video-call`).then(res => res.json()),
    refetchInterval: 3000, // Poll for video call updates
  });

  const getInitials = (name: string) => {
    return name.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2);
  };

  const getUserColor = (userId: number) => {
    const colors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-orange-500', 'bg-pink-500', 'bg-indigo-500'];
    return colors[userId % colors.length];
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'away': return 'bg-yellow-500';
      case 'busy': return 'bg-red-500';
      default: return 'bg-gray-400';
    }
  };

  return (
    <div className="w-80 bg-white border-l border-gray-200 flex flex-col">
      {/* Tab Navigation */}
      <Tabs defaultValue="members" className="flex-1 flex flex-col">
        <div className="border-b border-gray-200">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="members" className="text-sm font-medium">Members</TabsTrigger>
            <TabsTrigger value="files" className="text-sm font-medium">Files</TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value="members" className="flex-1 flex flex-col">
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-3">
              <div className="text-sm font-medium teams-dark mb-4">
                Team members ({members?.length || 0})
              </div>
              
              {/* Member Items */}
              {members?.map((member) => (
                <div key={member.id} className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded cursor-pointer">
                  <div className="relative">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getUserColor(member.userId)}`}>
                      <span className="text-white text-sm font-semibold">
                        {getInitials(member.user.displayName)}
                      </span>
                    </div>
                    <div className={`absolute -bottom-1 -right-1 w-4 h-4 ${getStatusColor(member.user.status)} rounded-full border-2 border-white`}></div>
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium teams-dark">{member.user.displayName}</div>
                    <div className="text-xs teams-medium">{member.role}</div>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Button variant="ghost" size="sm" className="p-1">
                      <MessageCircle className="h-3 w-3 teams-medium" />
                    </Button>
                    <Button variant="ghost" size="sm" className="p-1">
                      <Phone className="h-3 w-3 teams-medium" />
                    </Button>
                  </div>
                </div>
              ))}
              
              {/* Active Video Call Banner */}
              {videoCall && (
                <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-semibold teams-dark">Team Meeting</h3>
                    <span className="text-xs teams-medium">Now</span>
                  </div>
                  <p className="text-xs teams-medium mb-3">Weekly sync meeting in progress</p>
                  
                  {/* Video Call Participants */}
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    {videoCall.participantUsers.slice(0, 2).map((participant, index) => (
                      <div key={participant.id} className="aspect-video bg-gray-900 rounded overflow-hidden relative">
                        <div className="w-full h-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getUserColor(participant.id)}`}>
                            <span className="text-white text-xs font-semibold">
                              {getInitials(participant.displayName)}
                            </span>
                          </div>
                        </div>
                        <div className="absolute bottom-1 left-1 bg-black bg-opacity-75 text-white text-xs px-1 rounded">
                          {participant.displayName.split(' ')[0]}
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <Button 
                    onClick={onStartVideoCall}
                    className="w-full teams-light-blue hover:teams-blue text-white py-2 text-sm"
                  >
                    Join Meeting
                  </Button>
                </div>
              )}
            </div>
          </ScrollArea>
        </TabsContent>
        
        <TabsContent value="files" className="flex-1 flex flex-col">
          <div className="flex-1 p-4">
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📁</span>
              </div>
              <h3 className="text-sm font-medium teams-dark mb-2">No files yet</h3>
              <p className="text-xs teams-medium">Files shared in this team will appear here</p>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
