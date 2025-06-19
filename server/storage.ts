import { 
  users, teams, channels, teamMembers, messages, videoCalls,
  type User, type InsertUser,
  type Team, type InsertTeam,
  type Channel, type InsertChannel,
  type TeamMember, type InsertTeamMember,
  type Message, type InsertMessage, type MessageWithUser,
  type VideoCall, type InsertVideoCall,
  type TeamWithChannels, type TeamMemberWithUser, type VideoCallWithParticipants
} from "@shared/schema";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserStatus(userId: number, status: string): Promise<void>;
  
  // Teams
  getTeam(id: number): Promise<Team | undefined>;
  getTeamsForUser(userId: number): Promise<TeamWithChannels[]>;
  createTeam(team: InsertTeam): Promise<Team>;
  
  // Channels
  getChannel(id: number): Promise<Channel | undefined>;
  getChannelsForTeam(teamId: number): Promise<Channel[]>;
  createChannel(channel: InsertChannel): Promise<Channel>;
  
  // Team Members
  getTeamMembers(teamId: number): Promise<TeamMemberWithUser[]>;
  addTeamMember(teamMember: InsertTeamMember): Promise<TeamMember>;
  isTeamMember(teamId: number, userId: number): Promise<boolean>;
  
  // Messages
  getMessagesForChannel(channelId: number, limit?: number): Promise<MessageWithUser[]>;
  createMessage(message: InsertMessage): Promise<MessageWithUser>;
  addReaction(messageId: number, reaction: string): Promise<void>;
  
  // Video Calls
  getActiveVideoCall(channelId: number): Promise<VideoCallWithParticipants | undefined>;
  createVideoCall(videoCall: InsertVideoCall): Promise<VideoCall>;
  joinVideoCall(callId: number, userId: number): Promise<void>;
  leaveVideoCall(callId: number, userId: number): Promise<void>;
  endVideoCall(callId: number): Promise<void>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User> = new Map();
  private teams: Map<number, Team> = new Map();
  private channels: Map<number, Channel> = new Map();
  private teamMembers: Map<number, TeamMember> = new Map();
  private messages: Map<number, Message> = new Map();
  private videoCalls: Map<number, VideoCall> = new Map();
  
  private currentId = 1;

  constructor() {
    this.seedData();
  }

  private seedData() {
    // Create users
    const user1: User = { id: 1, username: "sarah.anderson", displayName: "Sarah Anderson", email: "sarah@company.com", avatar: null, status: "online", role: "admin" };
    const user2: User = { id: 2, username: "mike.johnson", displayName: "Mike Johnson", email: "mike@company.com", avatar: null, status: "online", role: "member" };
    const user3: User = { id: 3, username: "emma.thompson", displayName: "Emma Thompson", email: "emma@company.com", avatar: null, status: "away", role: "member" };
    const user4: User = { id: 4, username: "john.smith", displayName: "John Smith", email: "john@company.com", avatar: null, status: "offline", role: "member" };
    
    this.users.set(1, user1);
    this.users.set(2, user2);
    this.users.set(3, user3);
    this.users.set(4, user4);

    // Create teams
    const team1: Team = { id: 1, name: "Marketing Team", description: "Marketing and promotion activities", avatar: null, color: "#0078D4", createdAt: new Date() };
    const team2: Team = { id: 2, name: "Design Team", description: "Creative and design work", avatar: null, color: "#107C10", createdAt: new Date() };
    const team3: Team = { id: 3, name: "Engineering Team", description: "Development and technical work", avatar: null, color: "#8764B8", createdAt: new Date() };
    
    this.teams.set(1, team1);
    this.teams.set(2, team2);
    this.teams.set(3, team3);

    // Create channels
    const channel1: Channel = { id: 1, teamId: 1, name: "General", description: "General team discussions", type: "text", createdAt: new Date() };
    const channel2: Channel = { id: 2, teamId: 2, name: "Creative Hub", description: "Creative discussions", type: "text", createdAt: new Date() };
    const channel3: Channel = { id: 3, teamId: 3, name: "Development", description: "Development discussions", type: "text", createdAt: new Date() };
    
    this.channels.set(1, channel1);
    this.channels.set(2, channel2);
    this.channels.set(3, channel3);

    // Create team memberships
    this.teamMembers.set(1, { id: 1, teamId: 1, userId: 1, role: "admin", joinedAt: new Date() });
    this.teamMembers.set(2, { id: 2, teamId: 1, userId: 2, role: "member", joinedAt: new Date() });
    this.teamMembers.set(3, { id: 3, teamId: 1, userId: 3, role: "member", joinedAt: new Date() });
    this.teamMembers.set(4, { id: 4, teamId: 1, userId: 4, role: "member", joinedAt: new Date() });

    // Create some messages
    const now = new Date();
    const msg1: Message = { 
      id: 1, channelId: 1, userId: 1, content: "Good morning team! I wanted to share the latest updates on our Q4 marketing campaign. We've seen a 25% increase in engagement across all social media platforms.", 
      type: "text", fileUrl: null, fileName: null, fileSize: null, replyToId: null, reactions: ["👍", "👍", "👍"], 
      createdAt: new Date(now.getTime() - 1000 * 60 * 30) 
    };
    const msg2: Message = { 
      id: 2, channelId: 1, userId: 2, content: "That's fantastic news, Sarah! 🎉 The new video content strategy is really paying off. Here's the performance dashboard I mentioned:", 
      type: "file", fileUrl: "/files/Q4_Marketing_Dashboard.xlsx", fileName: "Q4_Marketing_Dashboard.xlsx", fileSize: 2457600, 
      replyToId: null, reactions: ["👍"], createdAt: new Date(now.getTime() - 1000 * 60 * 15) 
    };
    const msg3: Message = { 
      id: 3, channelId: 1, userId: 3, content: "Here's a sneak peek of our new workspace setup! The team collaboration area is finally ready. 📸", 
      type: "text", fileUrl: null, fileName: null, fileSize: null, replyToId: null, reactions: ["👍", "👍", "👍", "👍", "👍"], 
      createdAt: new Date(now.getTime() - 1000 * 60 * 5) 
    };
    
    this.messages.set(1, msg1);
    this.messages.set(2, msg2);
    this.messages.set(3, msg3);

    this.currentId = 10;
  }

  // Users
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId++;
    const user: User = { ...insertUser, id, status: "offline" };
    this.users.set(id, user);
    return user;
  }

  async updateUserStatus(userId: number, status: string): Promise<void> {
    const user = this.users.get(userId);
    if (user) {
      user.status = status;
      this.users.set(userId, user);
    }
  }

  // Teams
  async getTeam(id: number): Promise<Team | undefined> {
    return this.teams.get(id);
  }

  async getTeamsForUser(userId: number): Promise<TeamWithChannels[]> {
    const userTeamIds = Array.from(this.teamMembers.values())
      .filter(tm => tm.userId === userId)
      .map(tm => tm.teamId);
    
    const teams: TeamWithChannels[] = [];
    for (const teamId of userTeamIds) {
      const team = this.teams.get(teamId);
      if (team) {
        const channels = Array.from(this.channels.values())
          .filter(c => c.teamId === teamId);
        const memberCount = Array.from(this.teamMembers.values())
          .filter(tm => tm.teamId === teamId).length;
        
        teams.push({ ...team, channels, memberCount });
      }
    }
    return teams;
  }

  async createTeam(insertTeam: InsertTeam): Promise<Team> {
    const id = this.currentId++;
    const team: Team = { ...insertTeam, id, createdAt: new Date() };
    this.teams.set(id, team);
    return team;
  }

  // Channels
  async getChannel(id: number): Promise<Channel | undefined> {
    return this.channels.get(id);
  }

  async getChannelsForTeam(teamId: number): Promise<Channel[]> {
    return Array.from(this.channels.values()).filter(c => c.teamId === teamId);
  }

  async createChannel(insertChannel: InsertChannel): Promise<Channel> {
    const id = this.currentId++;
    const channel: Channel = { ...insertChannel, id, createdAt: new Date() };
    this.channels.set(id, channel);
    return channel;
  }

  // Team Members
  async getTeamMembers(teamId: number): Promise<TeamMemberWithUser[]> {
    const members = Array.from(this.teamMembers.values())
      .filter(tm => tm.teamId === teamId);
    
    const membersWithUsers: TeamMemberWithUser[] = [];
    for (const member of members) {
      const user = this.users.get(member.userId);
      if (user) {
        membersWithUsers.push({ ...member, user });
      }
    }
    return membersWithUsers;
  }

  async addTeamMember(insertTeamMember: InsertTeamMember): Promise<TeamMember> {
    const id = this.currentId++;
    const teamMember: TeamMember = { ...insertTeamMember, id, joinedAt: new Date() };
    this.teamMembers.set(id, teamMember);
    return teamMember;
  }

  async isTeamMember(teamId: number, userId: number): Promise<boolean> {
    return Array.from(this.teamMembers.values())
      .some(tm => tm.teamId === teamId && tm.userId === userId);
  }

  // Messages
  async getMessagesForChannel(channelId: number, limit = 50): Promise<MessageWithUser[]> {
    const channelMessages = Array.from(this.messages.values())
      .filter(m => m.channelId === channelId)
      .sort((a, b) => a.createdAt!.getTime() - b.createdAt!.getTime())
      .slice(-limit);

    const messagesWithUsers: MessageWithUser[] = [];
    for (const message of channelMessages) {
      const user = this.users.get(message.userId);
      if (user) {
        let replyTo: MessageWithUser | undefined;
        if (message.replyToId) {
          const replyMessage = this.messages.get(message.replyToId);
          if (replyMessage) {
            const replyUser = this.users.get(replyMessage.userId);
            if (replyUser) {
              replyTo = { ...replyMessage, user: replyUser };
            }
          }
        }
        messagesWithUsers.push({ ...message, user, replyTo });
      }
    }
    return messagesWithUsers;
  }

  async createMessage(insertMessage: InsertMessage): Promise<MessageWithUser> {
    const id = this.currentId++;
    const message: Message = { ...insertMessage, id, reactions: [], createdAt: new Date() };
    this.messages.set(id, message);
    
    const user = this.users.get(message.userId);
    if (!user) throw new Error("User not found");
    
    return { ...message, user };
  }

  async addReaction(messageId: number, reaction: string): Promise<void> {
    const message = this.messages.get(messageId);
    if (message) {
      message.reactions = [...(message.reactions || []), reaction];
      this.messages.set(messageId, message);
    }
  }

  // Video Calls
  async getActiveVideoCall(channelId: number): Promise<VideoCallWithParticipants | undefined> {
    const call = Array.from(this.videoCalls.values())
      .find(vc => vc.channelId === channelId && vc.status === "active");
    
    if (!call) return undefined;
    
    const host = this.users.get(call.hostUserId);
    if (!host) return undefined;
    
    const participantUsers = call.participants?.map(id => this.users.get(id)).filter(Boolean) as User[] || [];
    
    return { ...call, host, participantUsers };
  }

  async createVideoCall(insertVideoCall: InsertVideoCall): Promise<VideoCall> {
    const id = this.currentId++;
    const videoCall: VideoCall = { 
      ...insertVideoCall, 
      id, 
      participants: [insertVideoCall.hostUserId], 
      startedAt: new Date(),
      endedAt: null 
    };
    this.videoCalls.set(id, videoCall);
    return videoCall;
  }

  async joinVideoCall(callId: number, userId: number): Promise<void> {
    const call = this.videoCalls.get(callId);
    if (call && !call.participants?.includes(userId)) {
      call.participants = [...(call.participants || []), userId];
      this.videoCalls.set(callId, call);
    }
  }

  async leaveVideoCall(callId: number, userId: number): Promise<void> {
    const call = this.videoCalls.get(callId);
    if (call) {
      call.participants = call.participants?.filter(id => id !== userId) || [];
      this.videoCalls.set(callId, call);
    }
  }

  async endVideoCall(callId: number): Promise<void> {
    const call = this.videoCalls.get(callId);
    if (call) {
      call.status = "ended";
      call.endedAt = new Date();
      this.videoCalls.set(callId, call);
    }
  }
}

export const storage = new MemStorage();
