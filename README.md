# IRA IFRS 17 Exam Application

An online examination system for IFRS 17 knowledge assessment, built for the Insurance Regulatory Authority (IRA).

## Overview

This application enables insurance industry participants to take IFRS 17 certification exams online. Students can log in, complete timed exams, and receive immediate results with detailed explanations.

## Features

### For Students
- 📧 Email-based authentication (magic link/OTP)
- 📝 Timed multiple-choice exams
- ⏱️ Auto-save and auto-submit on timer expiry
- 📊 Instant results with pass/fail status
- 📖 Detailed review with correct answers and explanations
- 🏆 Downloadable certificates for passing candidates

### For Administrators
- 📋 Exam and question management
- ✏️ CRUD for questions with bulk import
- 📈 Results analytics and exports
- 👥 User and role management

## Tech Stack

- **Frontend**: Next.js 14+, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, Edge Functions, Storage)
- **Deployment**: Vercel (frontends), Supabase Cloud (backend)

## Project Structure

```
ira-ifrs17-exam/
├── backend/                 # Supabase backend
│   └── supabase/
│       ├── migrations/      # Database schema migrations
│       ├── seed/            # Initial exam data
│       └── functions/       # Edge Functions
│
├── frontend-user/           # Student-facing exam site
│   ├── app/                 # Next.js App Router
│   ├── components/          # UI components
│   ├── lib/                 # Utilities & Supabase client
│   └── types/               # TypeScript types
│
├── frontend-admin/          # Admin dashboard
│   ├── app/                 # Next.js App Router
│   ├── components/          # UI components
│   ├── lib/                 # Utilities & Supabase client
│   └── types/               # TypeScript types
│
├── shared/                  # Shared code
│   ├── types/               # Common TypeScript types
│   ├── utils/               # Helper functions
│   └── config/              # Configuration constants
│
├── Project Plan/            # Project documentation
│   ├── projectplan1.md      # Main project plan
│   ├── project_phases.md    # Development phases
│   └── copilotPromptPhases.md # Copilot prompts
│
└── Resources/               # Additional resources
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm or pnpm
- Supabase CLI
- A Supabase project

### Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ira-ifrs17-exam
   ```

2. **Set up the backend**
   ```bash
   cd backend
   supabase link --project-ref your-project-ref
   supabase db push
   supabase functions deploy
   ```

3. **Set up the student frontend**
   ```bash
   cd frontend-user
   npm install
   cp .env.example .env.local
   # Edit .env.local with your Supabase credentials
   npm run dev
   ```

4. **Set up the admin frontend**
   ```bash
   cd frontend-admin
   npm install
   cp .env.example .env.local
   # Edit .env.local with your Supabase credentials
   npm run dev
   ```

## Environment Variables

Each frontend requires:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

The backend Edge Functions use:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

## Development Phases

1. **Phase 1**: Discovery, Requirements & UX Concept
2. **Phase 2**: Architecture, Supabase Setup & Data Model
3. **Phase 3**: Student Frontend (MVP Exam Experience)
4. **Phase 4**: Explanations, Review Mode & Certificates
5. **Phase 5**: Admin Frontend & Question Management
6. **Phase 6**: QA, Security, Compliance & Deployment

See `Project Plan/project_phases.md` for detailed phase descriptions.

## License

Proprietary - Insurance Regulatory Authority (IRA)

## Support

For technical support, contact the development team.
