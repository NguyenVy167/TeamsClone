import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Video, Phone, Users, MoreHorizontal, Plus, Smile, Paperclip, Send, ThumbsUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { formatDistanceToNow } from "date-fns";
import type { Team, Channel, MessageWithUser } from "@shared/schema";

interface ChatAreaProps {
  team: Team;
  channel: Channel;
  onStartVideoCall: () => void;
}

export function ChatArea({ team, channel, onStartVideoCall }: ChatAreaProps) {
  const [newMessage, setNewMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: messages, isLoading } = useQuery<MessageWithUser[]>({
    queryKey: ["/api/channels", channel.id, "messages"],
    queryFn: () => fetch(`/api/channels/${channel.id}/messages`).then(res => res.json()),
    refetchInterval: 5000, // Poll for new messages
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      const response = await apiRequest("POST", `/api/channels/${channel.id}/messages`, { content });
      return response.json();
    },
    onSuccess: () => {
      setNewMessage("");
      queryClient.invalidateQueries({ queryKey: ["/api/channels", channel.id, "messages"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
    },
  });

  const addReactionMutation = useMutation({
    mutationFn: async ({ messageId, reaction }: { messageId: number, reaction: string }) => {
      const response = await apiRequest("POST", `/api/messages/${messageId}/reactions`, { reaction });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/channels", channel.id, "messages"] });
    },
  });

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim() && !sendMessageMutation.isPending) {
      sendMessageMutation.mutate(newMessage.trim());
    }
  };

  const handleAddReaction = (messageId: number, reaction: string) => {
    addReactionMutation.mutate({ messageId, reaction });
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2);
  };

  const getUserColor = (userId: number) => {
    const colors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-orange-500', 'bg-pink-500', 'bg-indigo-500'];
    return colors[userId % colors.length];
  };

  const formatTime = (date: Date | string) => {
    const messageDate = new Date(date);
    return messageDate.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="flex-1 flex flex-col bg-white">
      {/* Chat Header */}
      <div className="h-16 bg-white border-b border-gray-200 flex items-center px-6">
        <div className="flex items-center flex-1">
          <div 
            className="w-8 h-8 rounded mr-3 flex items-center justify-center text-white text-sm font-semibold"
            style={{ backgroundColor: team.color }}
          >
            {getInitials(team.name)}
          </div>
          <div>
            <h2 className="text-lg font-semibold teams-dark">{team.name}</h2>
            <div className="text-sm teams-medium">{channel.name} • {team.memberCount} members</div>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <Button variant="ghost" size="sm" onClick={onStartVideoCall}>
            <Video className="h-4 w-4 teams-medium" />
          </Button>
          <Button variant="ghost" size="sm">
            <Phone className="h-4 w-4 teams-medium" />
          </Button>
          <Button variant="ghost" size="sm">
            <Users className="h-4 w-4 teams-medium" />
          </Button>
          <Button variant="ghost" size="sm">
            <MoreHorizontal className="h-4 w-4 teams-medium" />
          </Button>
        </div>
      </div>
      
      {/* Chat Messages */}
      <ScrollArea className="flex-1 p-6" ref={scrollAreaRef}>
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="w-6 h-6 border-2 border-teams-light-blue border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* System Message */}
            <div className="text-center">
              <div className="inline-block bg-teams-gray px-4 py-2 rounded-full text-sm teams-medium">
                Today
              </div>
            </div>
            
            {/* Messages */}
            {messages?.map((message) => (
              <div key={message.id} className="flex items-start space-x-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${getUserColor(message.userId)}`}>
                  <span className="text-white text-sm font-semibold">
                    {getInitials(message.user.displayName)}
                  </span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="font-semibold teams-dark">{message.user.displayName}</span>
                    <span className="text-xs teams-light">{formatTime(message.createdAt!)}</span>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3 max-w-2xl">
                    <p className="teams-dark">{message.content}</p>
                    
                    {/* File attachment */}
                    {message.type === 'file' && message.fileUrl && (
                      <div className="mt-3 p-3 border border-gray-200 rounded-lg bg-white flex items-center space-x-3">
                        <div className="w-10 h-10 teams-light-blue rounded flex items-center justify-center">
                          <Paperclip className="h-5 w-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <div className="font-medium teams-dark">{message.fileName}</div>
                          <div className="text-sm teams-medium">
                            {message.fileSize ? `${(message.fileSize / 1024 / 1024).toFixed(1)} MB` : 'File'}
                          </div>
                        </div>
                        <Button variant="ghost" size="sm" className="text-teams-light-blue hover:text-teams-blue">
                          <Paperclip className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center space-x-4 mt-2">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-teams-light hover:text-teams-medium text-sm flex items-center space-x-1"
                      onClick={() => handleAddReaction(message.id, "👍")}
                    >
                      <ThumbsUp className="h-3 w-3" />
                      <span>{message.reactions?.length || 0}</span>
                    </Button>
                    <Button variant="ghost" size="sm" className="text-teams-light hover:text-teams-medium text-sm">
                      Reply
                    </Button>
                  </div>
                </div>
              </div>
            ))}
            
            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex items-start space-x-3">
                <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-sm font-semibold">JS</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="font-semibold teams-dark">John Smith</span>
                    <span className="text-xs teams-light">is typing...</span>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3 max-w-xs">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-teams-medium rounded-full typing-dot"></div>
                      <div className="w-2 h-2 bg-teams-medium rounded-full typing-dot"></div>
                      <div className="w-2 h-2 bg-teams-medium rounded-full typing-dot"></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </ScrollArea>
      
      {/* Message Input */}
      <div className="p-4 border-t border-gray-200">
        <form onSubmit={handleSendMessage} className="flex items-center space-x-3">
          <Button type="button" variant="ghost" size="sm">
            <Plus className="h-4 w-4 teams-medium" />
          </Button>
          <div className="flex-1 relative">
            <Input 
              placeholder="Type a new message"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              className="pr-20 py-3 border-gray-300 focus:border-teams-light-blue"
            />
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-2">
              <Button type="button" variant="ghost" size="sm">
                <Smile className="h-4 w-4 teams-medium" />
              </Button>
              <Button type="button" variant="ghost" size="sm">
                <Paperclip className="h-4 w-4 teams-medium" />
              </Button>
            </div>
          </div>
          <Button 
            type="submit" 
            disabled={!newMessage.trim() || sendMessageMutation.isPending}
            className="teams-light-blue hover:teams-blue px-6 py-3"
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}
