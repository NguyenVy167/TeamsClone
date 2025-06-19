# Microsoft Teams Clone

## Overview

This is a full-stack Microsoft Teams clone built with React, Express, PostgreSQL, and Drizzle ORM. The application provides team-based chat functionality with channels, video calling capabilities, and real-time messaging features.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript
- **Build Tool**: Vite for development and production builds
- **UI Framework**: Tailwind CSS with shadcn/ui components
- **State Management**: TanStack Query for server state management
- **Routing**: Wouter for client-side routing
- **Styling**: CSS variables for theming with Teams-inspired color scheme

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ES modules
- **API Pattern**: RESTful API endpoints under `/api` prefix
- **Middleware**: Custom logging and error handling middleware

### Data Storage
- **Database**: PostgreSQL (configured via Drizzle)
- **ORM**: Drizzle ORM with type-safe queries
- **Connection**: Neon Database serverless driver
- **Schema Location**: Shared schema definitions in `/shared/schema.ts`

## Key Components

### Database Schema
The application uses a relational database structure with the following main entities:
- **Users**: User profiles with status and role management
- **Teams**: Team containers with metadata and customization
- **Channels**: Communication channels within teams (text/voice)
- **Team Members**: Many-to-many relationship between users and teams
- **Messages**: Chat messages with support for replies and reactions
- **Video Calls**: Video call sessions with participant tracking

### API Endpoints
- `GET /api/teams` - Retrieve user's teams
- `GET /api/teams/:teamId` - Get team details
- `GET /api/teams/:teamId/members` - Get team members
- `GET /api/channels/:channelId/messages` - Get channel messages
- `POST /api/channels/:channelId/messages` - Send new message
- Video call management endpoints for creating and managing calls

### Component Structure
- **Sidebar**: Main navigation with Teams branding
- **TeamsSidebar**: Team and channel navigation
- **ChatArea**: Message display and composition
- **MembersSidebar**: Team member list and video call participants
- **VideoCallModal**: Video call interface

## Data Flow

1. **Authentication**: Simplified with hardcoded current user (ID: 1)
2. **Team Loading**: Fetch user's teams on app initialization
3. **Auto-selection**: Automatically selects first team and channel
4. **Real-time Updates**: Polling-based updates for messages (5s interval) and video calls (3s interval)
5. **Message Flow**: Client → API → Database → Response back to client
6. **Video Calls**: Session management with participant tracking

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: Database connection
- **drizzle-orm**: Database ORM and query builder
- **@tanstack/react-query**: Server state management
- **@radix-ui/***: Accessible UI primitives
- **wouter**: Lightweight routing
- **date-fns**: Date manipulation utilities

### Development Tools
- **tsx**: TypeScript execution for development
- **esbuild**: Production bundling for server
- **vite**: Frontend build tool and dev server

## Deployment Strategy

### Development
- **Command**: `npm run dev`
- **Server**: Node.js with tsx for hot reloading
- **Port**: 5000 (configured in .replit)
- **Environment**: NODE_ENV=development

### Production Build
- **Frontend**: Vite builds to `dist/public`
- **Backend**: esbuild bundles server to `dist/index.js`
- **Start Command**: `npm run start`
- **Environment**: NODE_ENV=production

### Platform Configuration
- **Replit Modules**: nodejs-20, web, postgresql-16
- **Auto-scaling**: Configured for deployment target
- **Port Mapping**: Internal 5000 → External 80

### Database Management
- **Migrations**: Drizzle Kit with `npm run db:push`
- **Configuration**: PostgreSQL via environment variable `DATABASE_URL`
- **Schema**: Shared TypeScript definitions with Zod validation

## Changelog
- June 19, 2025. Initial setup

## User Preferences

Preferred communication style: Simple, everyday language.