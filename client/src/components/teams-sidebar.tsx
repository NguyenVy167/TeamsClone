import { useState } from "react";
import { ChevronDown, Search, MoreHorizontal, Hash, Volume2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { TeamWithChannels } from "@shared/schema";

interface TeamsSidebarProps {
  teams: TeamWithChannels[];
  selectedTeamId: number | null;
  selectedChannelId: number | null;
  onTeamSelect: (teamId: number) => void;
  onChannelSelect: (channelId: number) => void;
}

export function TeamsSidebar({ 
  teams, 
  selectedTeamId, 
  selectedChannelId,
  onTeamSelect,
  onChannelSelect 
}: TeamsSidebarProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedTeams, setExpandedTeams] = useState<Set<number>>(new Set([selectedTeamId].filter(Boolean)));

  const toggleTeamExpansion = (teamId: number) => {
    const newExpanded = new Set(expandedTeams);
    if (newExpanded.has(teamId)) {
      newExpanded.delete(teamId);
    } else {
      newExpanded.add(teamId);
    }
    setExpandedTeams(newExpanded);
  };

  const getTeamInitials = (name: string) => {
    return name.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2);
  };

  const filteredTeams = teams.filter(team => 
    team.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    team.channels.some(channel => channel.name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-semibold teams-dark">Teams</h1>
          <Button variant="ghost" size="sm" className="p-2">
            <MoreHorizontal className="h-4 w-4 teams-medium" />
          </Button>
        </div>
        
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 teams-light" />
          <Input 
            placeholder="Search" 
            className="pl-10 teams-gray border-gray-300 focus:border-teams-light-blue"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>
      
      {/* Teams List */}
      <ScrollArea className="flex-1">
        <div className="p-2">
          <div className="flex items-center p-2 hover:bg-gray-50 rounded cursor-pointer">
            <ChevronDown className="h-3 w-3 teams-medium mr-2" />
            <span className="text-sm font-medium teams-dark">Your teams</span>
          </div>
          
          {/* Team Items */}
          <div className="ml-4 space-y-1">
            {filteredTeams.map((team) => (
              <div key={team.id}>
                <div 
                  className={`flex items-center p-2 hover:bg-gray-50 rounded cursor-pointer ${
                    selectedTeamId === team.id ? 'bg-blue-50 border-l-4 border-teams-light-blue' : ''
                  }`}
                  onClick={() => {
                    onTeamSelect(team.id);
                    toggleTeamExpansion(team.id);
                  }}
                >
                  <div 
                    className="w-6 h-6 rounded mr-3 flex items-center justify-center text-white text-xs font-semibold"
                    style={{ backgroundColor: team.color }}
                  >
                    {getTeamInitials(team.name)}
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium teams-dark">{team.name}</div>
                    <div className="text-xs teams-medium">{team.channels[0]?.name || 'No channels'}</div>
                  </div>
                  {selectedTeamId === team.id && (
                    <div className="w-2 h-2 teams-light-blue rounded-full"></div>
                  )}
                </div>
                
                {/* Channels */}
                {expandedTeams.has(team.id) && (
                  <div className="ml-8 space-y-1">
                    {team.channels.map((channel) => (
                      <div
                        key={channel.id}
                        className={`flex items-center p-1 hover:bg-gray-50 rounded cursor-pointer ${
                          selectedChannelId === channel.id ? 'bg-blue-50' : ''
                        }`}
                        onClick={() => onChannelSelect(channel.id)}
                      >
                        {channel.type === 'voice' ? (
                          <Volume2 className="h-3 w-3 teams-medium mr-2" />
                        ) : (
                          <Hash className="h-3 w-3 teams-medium mr-2" />
                        )}
                        <span className="text-sm teams-dark">{channel.name}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
        
        {/* Recent Chats Section */}
        <div className="p-2 mt-4">
          <div className="flex items-center p-2 hover:bg-gray-50 rounded cursor-pointer">
            <ChevronDown className="h-3 w-3 teams-medium mr-2" />
            <span className="text-sm font-medium teams-dark">Recent</span>
          </div>
          
          <div className="ml-4 space-y-1">
            <div className="flex items-center p-2 hover:bg-gray-50 rounded cursor-pointer">
              <div className="w-8 h-8 bg-blue-500 rounded-full mr-3 flex items-center justify-center">
                <span className="text-white text-sm font-semibold">SA</span>
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium teams-dark">Sarah Anderson</div>
                <div className="text-xs teams-medium truncate">Great work on the presentation! Let's...</div>
              </div>
              <div className="text-xs teams-light">2m</div>
            </div>
            
            <div className="flex items-center p-2 hover:bg-gray-50 rounded cursor-pointer">
              <div className="w-8 h-8 bg-green-500 rounded-full mr-3 flex items-center justify-center">
                <span className="text-white text-sm font-semibold">MJ</span>
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium teams-dark">Mike Johnson</div>
                <div className="text-xs teams-medium truncate">Can we schedule a meeting for...</div>
              </div>
              <div className="text-xs teams-light">15m</div>
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
