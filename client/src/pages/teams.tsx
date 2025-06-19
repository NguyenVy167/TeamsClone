import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "wouter";
import { Sidebar } from "@/components/sidebar";
import { TeamsSidebar } from "@/components/teams-sidebar";
import { ChatArea } from "@/components/chat-area";
import { MembersSidebar } from "@/components/members-sidebar";
import { VideoCallModal } from "@/components/video-call-modal";
import type { TeamWithChannels } from "@shared/schema";

export default function TeamsPage() {
  const { teamId } = useParams();
  const [selectedTeamId, setSelectedTeamId] = useState<number | null>(
    teamId ? parseInt(teamId) : null
  );
  const [selectedChannelId, setSelectedChannelId] = useState<number | null>(null);
  const [isVideoCallOpen, setIsVideoCallOpen] = useState(false);

  const { data: teams, isLoading } = useQuery<TeamWithChannels[]>({
    queryKey: ["/api/teams"],
  });

  // Auto-select first team and channel if none selected
  if (teams && !selectedTeamId && teams.length > 0) {
    setSelectedTeamId(teams[0].id);
    if (teams[0].channels.length > 0) {
      setSelectedChannelId(teams[0].channels[0].id);
    }
  }

  const selectedTeam = teams?.find(t => t.id === selectedTeamId);
  const selectedChannel = selectedTeam?.channels.find(c => c.id === selectedChannelId);

  const handleTeamSelect = (teamId: number) => {
    setSelectedTeamId(teamId);
    const team = teams?.find(t => t.id === teamId);
    if (team && team.channels.length > 0) {
      setSelectedChannelId(team.channels[0].id);
    }
  };

  const handleChannelSelect = (channelId: number) => {
    setSelectedChannelId(channelId);
  };

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-teams-gray">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-teams-light-blue border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="teams-medium">Loading Teams...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-teams-gray overflow-hidden">
      <Sidebar />
      
      <TeamsSidebar 
        teams={teams || []}
        selectedTeamId={selectedTeamId}
        selectedChannelId={selectedChannelId}
        onTeamSelect={handleTeamSelect}
        onChannelSelect={handleChannelSelect}
      />
      
      {selectedChannel ? (
        <>
          <ChatArea 
            team={selectedTeam!}
            channel={selectedChannel}
            onStartVideoCall={() => setIsVideoCallOpen(true)}
          />
          
          <MembersSidebar 
            teamId={selectedTeamId!}
            onStartVideoCall={() => setIsVideoCallOpen(true)}
          />
        </>
      ) : (
        <div className="flex-1 flex items-center justify-center bg-white">
          <div className="text-center">
            <div className="w-16 h-16 bg-teams-purple rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-white text-2xl">👥</span>
            </div>
            <h2 className="text-xl font-semibold teams-dark mb-2">Welcome to Microsoft Teams</h2>
            <p className="teams-medium">Select a team and channel to start collaborating</p>
          </div>
        </div>
      )}
      
      {isVideoCallOpen && selectedChannelId && (
        <VideoCallModal 
          channelId={selectedChannelId}
          onClose={() => setIsVideoCallOpen(false)}
        />
      )}
    </div>
  );
}
