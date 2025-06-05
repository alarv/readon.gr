# readon.gr

A modern Greek community platform featuring posts, comments, voting system, and AI-powered moderation.

## Features

- 📱 Modern, responsive design
- 🔐 User authentication with Supabase
- 📝 Text, link, and image posts
- 💬 Threaded comments system
- ⬆️⬇️ Democratic voting (upvotes/downvotes)
- 🤖 AI-powered content moderation
- 🇬🇷 Greek language support

## Tech Stack

- **Frontend & Backend**: Next.js 15 (App Router)
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI
- **Language**: TypeScript

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/readon.gr.git
cd readon.gr
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.local.example .env.local
```

Edit `.env.local` with your Supabase credentials:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

4. Set up the database:
   - Go to your Supabase project dashboard
   - Navigate to SQL Editor
   - Run the SQL script from `database/schema.sql`

5. Start the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Database Schema

The application uses the following main tables:

- **profiles**: User profiles extending Supabase auth
- **posts**: Text, link, and image posts
- **comments**: Threaded comments with depth tracking
- **votes**: User votes on posts and comments

## Development

### Available Scripts

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Project Structure

```
src/
├── app/                 # Next.js app router pages
├── components/          # React components
│   ├── layout/         # Layout components (header, footer)
│   ├── post/           # Post-related components
│   └── ui/             # Reusable UI components
├── lib/                # Utilities and configuration
│   ├── supabase.ts     # Supabase client setup
│   ├── types.ts        # TypeScript type definitions
│   └── utils.ts        # Utility functions
database/
└── schema.sql          # Database schema and policies
```

## Features Roadmap

### MVP (Current Phase)
- [x] Basic project setup
- [x] Database schema
- [x] UI components and layout
- [ ] User authentication
- [ ] Post creation and display
- [ ] Voting system
- [ ] Comment system

### Phase 2
- [ ] User profiles
- [ ] Communities/subreddits
- [ ] Image upload
- [ ] Search functionality
- [ ] Real-time notifications

### Phase 3
- [ ] AI moderation system
- [ ] Content filtering
- [ ] Spam detection
- [ ] Advanced analytics

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Support

For support, create an issue on GitHub.
