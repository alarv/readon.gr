# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build for production
- `npm run start` - Start production server  
- `npm run lint` - Run ESLint

## Environment Setup

Required environment variables in `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

Database schema must be initialized using `database/schema.sql` in Supabase SQL Editor.

## Architecture Overview

This is a Greek public forum built with Next.js 15 App Router and Supabase. The application uses a multi-layered architecture:

### Data Layer
- **Supabase**: PostgreSQL database with Row Level Security
- **Core entities**: profiles, posts, comments, votes
- **Vote counting**: Automated via PostgreSQL triggers and functions
- **Authentication**: Supabase Auth extending to user profiles

### Application Layer  
- **Client creation**: Use `createClient()` for browser, `createServerSupabaseClient()` for server
- **Path alias**: `@/*` maps to `./src/*`
- **Type definitions**: All database entities typed in `src/lib/types.ts`

### UI Layer
- **Styling**: Tailwind CSS with custom design system
- **Components**: Radix UI primitives in `src/components/ui/`
- **Layout**: Header component with main content area
- **Fonts**: Geist Sans and Geist Mono
- **Language**: Greek (`lang="el"`)

### Post System
- **Types**: text, link, image posts
- **Communities**: Posts belong to communities (default: 'general')
- **Voting**: Democratic upvote/downvote system with automatic count updates
- **Moderation**: Built-in flags for content moderation

### Comment System
- **Threading**: Hierarchical comments with depth tracking
- **Voting**: Independent vote counts on comments
- **Relations**: Parent-child relationships for nested discussions