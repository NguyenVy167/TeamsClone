import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertMessageSchema, insertVideoCallSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Current user (simplified - in real app would use authentication)
  const CURRENT_USER_ID = 1;

  // Get user's teams
  app.get("/api/teams", async (req, res) => {
    try {
      const teams = await storage.getTeamsForUser(CURRENT_USER_ID);
      res.json(teams);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch teams" });
    }
  });

  // Get team details
  app.get("/api/teams/:teamId", async (req, res) => {
    try {
      const teamId = parseInt(req.params.teamId);
      const team = await storage.getTeam(teamId);
      
      if (!team) {
        return res.status(404).json({ message: "Team not found" });
      }

      // Check if user is member
      const isMember = await storage.isTeamMember(teamId, CURRENT_USER_ID);
      if (!isMember) {
        return res.status(403).json({ message: "Access denied" });
      }

      res.json(team);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch team" });
    }
  });

  // Get team members
  app.get("/api/teams/:teamId/members", async (req, res) => {
    try {
      const teamId = parseInt(req.params.teamId);
      
      // Check if user is member
      const isMember = await storage.isTeamMember(teamId, CURRENT_USER_ID);
      if (!isMember) {
        return res.status(403).json({ message: "Access denied" });
      }

      const members = await storage.getTeamMembers(teamId);
      res.json(members);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch team members" });
    }
  });

  // Get channel messages
  app.get("/api/channels/:channelId/messages", async (req, res) => {
    try {
      const channelId = parseInt(req.params.channelId);
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
      
      // Check if channel exists and user has access
      const channel = await storage.getChannel(channelId);
      if (!channel) {
        return res.status(404).json({ message: "Channel not found" });
      }

      const isMember = await storage.isTeamMember(channel.teamId, CURRENT_USER_ID);
      if (!isMember) {
        return res.status(403).json({ message: "Access denied" });
      }

      const messages = await storage.getMessagesForChannel(channelId, limit);
      res.json(messages);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  });

  // Send message
  app.post("/api/channels/:channelId/messages", async (req, res) => {
    try {
      const channelId = parseInt(req.params.channelId);
      
      // Check if channel exists and user has access
      const channel = await storage.getChannel(channelId);
      if (!channel) {
        return res.status(404).json({ message: "Channel not found" });
      }

      const isMember = await storage.isTeamMember(channel.teamId, CURRENT_USER_ID);
      if (!isMember) {
        return res.status(403).json({ message: "Access denied" });
      }

      const messageData = insertMessageSchema.parse({
        ...req.body,
        channelId,
        userId: CURRENT_USER_ID,
      });

      const message = await storage.createMessage(messageData);
      res.status(201).json(message);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid message data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to send message" });
    }
  });

  // Add reaction to message
  app.post("/api/messages/:messageId/reactions", async (req, res) => {
    try {
      const messageId = parseInt(req.params.messageId);
      const { reaction } = req.body;

      if (!reaction || typeof reaction !== "string") {
        return res.status(400).json({ message: "Invalid reaction" });
      }

      await storage.addReaction(messageId, reaction);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to add reaction" });
    }
  });

  // Get active video call for channel
  app.get("/api/channels/:channelId/video-call", async (req, res) => {
    try {
      const channelId = parseInt(req.params.channelId);
      
      // Check if channel exists and user has access
      const channel = await storage.getChannel(channelId);
      if (!channel) {
        return res.status(404).json({ message: "Channel not found" });
      }

      const isMember = await storage.isTeamMember(channel.teamId, CURRENT_USER_ID);
      if (!isMember) {
        return res.status(403).json({ message: "Access denied" });
      }

      const videoCall = await storage.getActiveVideoCall(channelId);
      res.json(videoCall);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch video call" });
    }
  });

  // Start video call
  app.post("/api/channels/:channelId/video-call", async (req, res) => {
    try {
      const channelId = parseInt(req.params.channelId);
      
      // Check if channel exists and user has access
      const channel = await storage.getChannel(channelId);
      if (!channel) {
        return res.status(404).json({ message: "Channel not found" });
      }

      const isMember = await storage.isTeamMember(channel.teamId, CURRENT_USER_ID);
      if (!isMember) {
        return res.status(403).json({ message: "Access denied" });
      }

      // Check if there's already an active call
      const existingCall = await storage.getActiveVideoCall(channelId);
      if (existingCall) {
        return res.status(409).json({ message: "Video call already active" });
      }

      const callData = insertVideoCallSchema.parse({
        ...req.body,
        channelId,
        hostUserId: CURRENT_USER_ID,
      });

      const videoCall = await storage.createVideoCall(callData);
      res.status(201).json(videoCall);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid video call data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to start video call" });
    }
  });

  // Join video call
  app.post("/api/video-calls/:callId/join", async (req, res) => {
    try {
      const callId = parseInt(req.params.callId);
      await storage.joinVideoCall(callId, CURRENT_USER_ID);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to join video call" });
    }
  });

  // Leave video call
  app.post("/api/video-calls/:callId/leave", async (req, res) => {
    try {
      const callId = parseInt(req.params.callId);
      await storage.leaveVideoCall(callId, CURRENT_USER_ID);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to leave video call" });
    }
  });

  // End video call
  app.post("/api/video-calls/:callId/end", async (req, res) => {
    try {
      const callId = parseInt(req.params.callId);
      await storage.endVideoCall(callId);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to end video call" });
    }
  });

  // Update user status
  app.patch("/api/user/status", async (req, res) => {
    try {
      const { status } = req.body;
      if (!status || typeof status !== "string") {
        return res.status(400).json({ message: "Invalid status" });
      }
      
      await storage.updateUserStatus(CURRENT_USER_ID, status);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to update status" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
