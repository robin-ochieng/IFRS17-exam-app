# IRA IFRS 17 Exam - Admin Dashboard

## Overview

This is the admin dashboard for managing the IRA IFRS 17 Exam system. Built with **Next.js** and **TypeScript**, it allows administrators to:

- Manage exams and questions
- View and export results
- Manage users and roles

## Tech Stack

- **Next.js 14+** (App Router)
- **TypeScript**
- **Tailwind CSS** for styling
- **Supabase** client for auth and data

## Getting Started

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local

# Run development server
npm run dev
```

Open [http://localhost:3001](http://localhost:3001) to view the admin dashboard.

## Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## Project Structure

```
frontend-admin/
├── app/                    # Next.js App Router pages
│   ├── (auth)/            # Admin login
│   ├── dashboard/         # Admin dashboard home
│   ├── exams/             # Exam management
│   ├── questions/         # Question bank
│   ├── results/           # Results & analytics
│   └── users/             # User management
├── components/            # Reusable UI components
│   ├── ui/               # Base UI components
│   ├── forms/            # Form components
│   └── tables/           # Data table components
├── lib/                   # Utilities and Supabase client
├── types/                 # TypeScript type definitions
└── README.md
```

## Key Features

### Exam Management
- Create, edit, and delete exams
- Configure duration, pass mark, randomization
- Activate/deactivate exams

### Question Bank
- CRUD for questions and options
- Mark correct answers and add explanations
- Bulk import from CSV/JSON
- Drag-and-drop reordering

### Results & Analytics
- View all attempts with filters
- Export to CSV/Excel
- Per-attempt detail view

### User Management
- View all user profiles
- Assign admin/super_admin roles
- Bulk invite via email

## Access Control

Only users with `role = 'admin'` or `role = 'super_admin'` in the `profiles` table can access this dashboard. RLS policies enforce this at the database level.
