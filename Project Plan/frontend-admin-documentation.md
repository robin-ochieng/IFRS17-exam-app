# IRA IFRS 17 Exam Admin Dashboard - Implementation Documentation

## Table of Contents

1. [Overview](#overview)
2. [Technology Stack](#technology-stack)
3. [Project Structure](#project-structure)
4. [Authentication & Authorization](#authentication--authorization)
5. [User Roles & Permissions](#user-roles--permissions)
6. [Implemented Features](#implemented-features)
7. [UI Components](#ui-components)
8. [Database Integration](#database-integration)
9. [Environment Configuration](#environment-configuration)
10. [Running the Application](#running-the-application)

---

## Overview

The **IRA IFRS 17 Exam Admin Dashboard** is a comprehensive web application designed for administrators to manage the IFRS 17 examination system. It provides a complete suite of tools for managing exams, questions, users, and viewing analytics and results.

### Key Capabilities

- **Exam Management**: Create, edit, activate/deactivate, and delete exams
- **Question Management**: Full CRUD operations for questions with support for multiple-choice answers
- **Bulk Import**: CSV-based question import functionality
- **User Management**: View and manage user accounts and roles
- **Results & Analytics**: View exam results and performance analytics
- **System Settings**: Configure system-wide settings

---

## Technology Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| **Next.js** | 16.0.4 | React framework with App Router |
| **React** | 19.2.0 | UI library |
| **TypeScript** | 5.x | Type-safe JavaScript |
| **Tailwind CSS** | 4.x | Utility-first CSS framework |
| **Supabase** | SSR 0.7.0 | Backend-as-a-Service (Auth, Database) |
| **React Hook Form** | 7.54.2 | Form state management |
| **Zod** | 3.24.1 | Schema validation |
| **TanStack Table** | 8.20.5 | Data table component |
| **Recharts** | 2.15.0 | Charts and analytics |
| **Sonner** | 1.7.1 | Toast notifications |
| **Lucide React** | 0.555.0 | Icon library |
| **date-fns** | 4.1.0 | Date utilities |
| **PapaParse** | 5.4.1 | CSV parsing |

---

## Project Structure

```
frontend-admin/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── (auth)/                   # Auth route group
│   │   │   ├── layout.tsx            # Centered auth layout
│   │   │   └── login/
│   │   │       └── page.tsx          # Login page with Suspense
│   │   ├── (dashboard)/              # Dashboard route group
│   │   │   ├── layout.tsx            # Dashboard layout with sidebar
│   │   │   ├── page.tsx              # Main dashboard
│   │   │   ├── analytics/
│   │   │   │   └── page.tsx          # Analytics dashboard
│   │   │   ├── exams/
│   │   │   │   ├── page.tsx          # Exams list
│   │   │   │   ├── new/
│   │   │   │   │   └── page.tsx      # Create new exam
│   │   │   │   └── [id]/
│   │   │   │       ├── page.tsx      # Edit exam
│   │   │   │       └── questions/
│   │   │   │           └── page.tsx  # Manage exam questions
│   │   │   ├── questions/
│   │   │   │   ├── page.tsx          # All questions list
│   │   │   │   ├── new/
│   │   │   │   │   └── page.tsx      # Create new question
│   │   │   │   ├── [id]/
│   │   │   │   │   └── page.tsx      # Edit question
│   │   │   │   └── import/
│   │   │   │       └── page.tsx      # Bulk CSV import
│   │   │   ├── results/
│   │   │   │   ├── page.tsx          # Results overview
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx      # Detailed result view
│   │   │   ├── users/
│   │   │   │   ├── page.tsx          # Users list
│   │   │   │   ├── [id]/
│   │   │   │   │   └── page.tsx      # User details
│   │   │   │   └── invite/
│   │   │   │       └── page.tsx      # Invite new user
│   │   │   └── settings/
│   │   │       └── page.tsx          # System settings
│   │   ├── unauthorized/
│   │   │   └── page.tsx              # Access denied page
│   │   ├── globals.css               # Global styles
│   │   └── layout.tsx                # Root layout
│   ├── components/
│   │   ├── charts/
│   │   │   ├── index.ts              # Chart exports
│   │   │   ├── AreaChart.tsx         # Area chart component
│   │   │   ├── BarChart.tsx          # Bar chart component
│   │   │   ├── LineChart.tsx         # Line chart component
│   │   │   ├── PieChart.tsx          # Pie chart component
│   │   │   └── StatCard.tsx          # Statistics card
│   │   ├── forms/
│   │   │   ├── index.ts              # Form exports
│   │   │   ├── ExamForm.tsx          # Exam create/edit form
│   │   │   └── QuestionForm.tsx      # Question create/edit form
│   │   ├── layout/
│   │   │   ├── index.ts              # Layout exports
│   │   │   ├── Sidebar.tsx           # Navigation sidebar
│   │   │   ├── Header.tsx            # Top header bar
│   │   │   ├── PageHeader.tsx        # Page title component
│   │   │   └── Breadcrumb.tsx        # Breadcrumb navigation
│   │   ├── tables/
│   │   │   ├── index.ts              # Table exports
│   │   │   └── DataTable.tsx         # Reusable data table
│   │   └── ui/
│   │       ├── index.ts              # UI exports
│   │       ├── Alert.tsx             # Alert messages
│   │       ├── Badge.tsx             # Status badges
│   │       ├── Button.tsx            # Button component
│   │       ├── Card.tsx              # Card container
│   │       ├── Input.tsx             # Text input
│   │       ├── LoadingSpinner.tsx    # Loading indicator
│   │       ├── Modal.tsx             # Modal dialog
│   │       ├── Select.tsx            # Dropdown select
│   │       ├── Switch.tsx            # Toggle switch
│   │       ├── Tabs.tsx              # Tab navigation
│   │       └── Textarea.tsx          # Multi-line text input
│   ├── contexts/
│   │   └── AuthContext.tsx           # Authentication context
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts             # Browser Supabase client
│   │   │   ├── server.ts             # Server Supabase client
│   │   │   ├── middleware.ts         # Auth middleware
│   │   │   └── queries.ts            # Query helpers
│   │   └── utils.ts                  # Utility functions
│   └── types/
│       ├── database.ts               # Database types
│       ├── forms.ts                  # Form schemas
│       └── api.ts                    # API types
├── .env.local                        # Environment variables
├── middleware.ts                     # Next.js middleware
├── next.config.ts                    # Next.js configuration
├── package.json                      # Dependencies
├── tailwind.config.ts                # Tailwind configuration
└── tsconfig.json                     # TypeScript configuration
```

---

## Authentication & Authorization

### Authentication Flow

1. **Middleware Protection**: All routes except `/login`, `/auth/callback`, and `/unauthorized` are protected
2. **Session Management**: Uses Supabase SSR for secure session handling
3. **Role Verification**: After authentication, user role is verified from the `profiles` table

### Middleware Logic

```typescript
// Protected route check flow:
1. User visits any route
2. Middleware checks for valid session
3. If no session → redirect to /login
4. If session exists → check user role in profiles table
5. If role is 'admin' or 'super_admin' → allow access
6. If role is 'student' → redirect to /unauthorized
```

### Login Process

1. User enters email and password
2. Supabase Auth validates credentials
3. On success, user profile is fetched to verify admin role
4. If admin → redirect to dashboard
5. If not admin → sign out and show error

---

## User Roles & Permissions

The system implements three user roles with distinct permission levels:

### Role Hierarchy

```
┌─────────────────────────────────────────────────────────────────┐
│                        SUPER ADMIN                               │
│  Full system access - Can do everything including:               │
│  • All Admin capabilities                                        │
│  • Manage other admins' roles                                    │
│  • Access system settings                                        │
│  • Enable/disable maintenance mode                               │
│  • Configure registration settings                               │
│  • Manage notification settings                                  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                          ADMIN                                   │
│  Exam management access - Can:                                   │
│  • Create, edit, delete exams                                    │
│  • Create, edit, delete questions                                │
│  • Import questions via CSV                                      │
│  • View all exam results                                         │
│  • View analytics and reports                                    │
│  • View user list and details                                    │
│  • Cannot change system settings                                 │
│  • Cannot promote users to admin/super_admin                     │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                         STUDENT                                  │
│  No admin dashboard access - Can only:                           │
│  • Access the student portal (frontend-user)                     │
│  • Take exams                                                    │
│  • View own results                                              │
│  • Redirected to /unauthorized if accessing admin                │
└─────────────────────────────────────────────────────────────────┘
```

### Detailed Permission Matrix

| Feature | Super Admin | Admin | Student |
|---------|:-----------:|:-----:|:-------:|
| **Dashboard** |
| View dashboard statistics | ✅ | ✅ | ❌ |
| View recent activity | ✅ | ✅ | ❌ |
| **Exam Management** |
| View all exams | ✅ | ✅ | ❌ |
| Create new exam | ✅ | ✅ | ❌ |
| Edit exam details | ✅ | ✅ | ❌ |
| Delete exam | ✅ | ✅ | ❌ |
| Activate/Deactivate exam | ✅ | ✅ | ❌ |
| **Question Management** |
| View all questions | ✅ | ✅ | ❌ |
| Create new question | ✅ | ✅ | ❌ |
| Edit question | ✅ | ✅ | ❌ |
| Delete question | ✅ | ✅ | ❌ |
| Bulk import questions (CSV) | ✅ | ✅ | ❌ |
| **Results & Analytics** |
| View all exam results | ✅ | ✅ | ❌ |
| View detailed attempt info | ✅ | ✅ | ❌ |
| View analytics dashboard | ✅ | ✅ | ❌ |
| Export results | ✅ | ✅ | ❌ |
| **User Management** |
| View all users | ✅ | ✅ | ❌ |
| View user details | ✅ | ✅ | ❌ |
| Change user to Student | ✅ | ❌ | ❌ |
| Change user to Admin | ✅ | ❌ | ❌ |
| Change user to Super Admin | ✅ | ❌ | ❌ |
| Invite new users | ✅ | ✅ | ❌ |
| **System Settings** |
| View settings | ✅ | ✅ (read-only) | ❌ |
| Modify settings | ✅ | ❌ | ❌ |
| Enable maintenance mode | ✅ | ❌ | ❌ |
| Configure registration | ✅ | ❌ | ❌ |
| Manage notifications | ✅ | ❌ | ❌ |

### Role Implementation in Code

```typescript
// AuthContext provides role checking
const { user, profile, isAdmin, isSuperAdmin } = useAuth();

// Example usage in components
if (isSuperAdmin) {
  // Show super admin only features
}

// Settings page example
<Switch
  checked={watchMaintenanceMode}
  onChange={(e) => setValue('maintenance_mode', e.target.checked)}
  disabled={!isSuperAdmin}  // Only super_admin can toggle
/>
```

---

## Implemented Features

### 1. Dashboard (`/`)

The main dashboard provides an at-a-glance overview of the system:

- **Statistics Cards**:
  - Total Exams (with active count)
  - Total Questions
  - Total Students
  - Overall Pass Rate
  
- **Recent Exam Attempts**: Table showing the 5 most recent completed attempts with:
  - Candidate name
  - Exam title
  - Score and percentage
  - Pass/Fail status
  - Timestamp

- **Quick Actions**:
  - Create New Exam
  - Import Questions
  - View All Results

### 2. Exam Management (`/exams`)

#### Exam List Page
- Paginated, searchable table of all exams
- Filter by status (All, Active, Inactive)
- Columns: Title, Status, Questions, Duration, Pass Mark, Max Attempts, Actions
- Actions: Edit, Manage Questions, Toggle Active, Delete

#### Create/Edit Exam (`/exams/new`, `/exams/[id]`)
- Form fields:
  - Title (required)
  - Description
  - Duration (minutes)
  - Total Marks
  - Pass Mark Percentage
  - Max Attempts (null = unlimited)
  - Instructions (rich text)
  - Settings: Randomize Questions, Allow Review, Is Active

#### Exam Questions (`/exams/[id]/questions`)
- View all questions for a specific exam
- Expandable rows showing question details and options
- Quick add question button
- Reorder questions (drag-drop ready)
- Delete questions

### 3. Question Management (`/questions`)

#### Questions List Page
- Paginated table of all questions across exams
- Filter by exam
- Columns: #, Question (truncated), Exam, Marks, Options Count, Status, Actions
- Actions: Edit, Delete

#### Create/Edit Question (`/questions/new`, `/questions/[id]`)
- Form fields:
  - Select Exam
  - Question Number
  - Question Prompt (text)
  - Marks
  - Explanation (shown after exam)
  - Is Active toggle
  
- Options Management:
  - Add up to 6 options (A-F)
  - Each option: Label, Text, Is Correct checkbox
  - At least one correct answer required
  - Dynamic add/remove options

#### Bulk Import (`/questions/import`)
- CSV file upload with drag-and-drop
- Template download
- Preview parsed questions before import
- Validation with error highlighting
- Skip duplicates option
- Progress indicator during import

**CSV Format:**
```csv
question_number,prompt,option_a,option_b,option_c,option_d,option_e,option_f,correct_answer,marks,explanation
1,"What is IFRS 17?","Insurance standard","Banking standard","Tax regulation","None","","",A,2,"IFRS 17 is..."
```

### 4. Results Management (`/results`)

#### Results Overview
- Paginated table of all exam attempts
- Filters: Status (All, Passed, Failed, In Progress), Date Range
- Columns: Candidate, Email, Organisation, Exam, Score, Status, Date, Actions
- Export to Excel functionality

#### Result Detail (`/results/[id]`)
- Candidate information card
- Exam attempt summary:
  - Score and percentage
  - Pass/Fail status
  - Time taken
  - Questions answered
  
- Question-by-question breakdown:
  - Question prompt
  - Selected answer
  - Correct answer
  - Whether correct or incorrect
  - Explanation (if available)

### 5. Analytics Dashboard (`/analytics`)

Visual analytics with interactive charts:

- **Summary Stats Row**:
  - Total Attempts
  - Average Score
  - Pass Rate
  - Active Exams

- **Charts**:
  - **Score Distribution**: Bar chart showing score ranges
  - **Pass/Fail Breakdown**: Pie chart
  - **Attempts Over Time**: Line chart (last 30 days)
  - **Top Performing Exams**: Horizontal bar chart

### 6. User Management (`/users`)

#### Users List
- Paginated, searchable table
- Filter by role
- Columns: Name/Email, Organisation, Role, Attempts, Joined, Actions
- Role badges with color coding
- Change role functionality (Super Admin only)

#### User Detail (`/users/[id]`)
- Profile information card
- Statistics: Total attempts, Pass rate, Average score
- Exam history table with all attempts
- Change role button (Super Admin only)

#### Invite User (`/users/invite`)
- Send email invitation
- Pre-assign role
- Custom welcome message

### 7. Settings (`/settings`)

System configuration page (Super Admin only can modify):

- **General Settings**:
  - System name
  - Support email
  - Default timezone

- **Registration Settings**:
  - Allow public registration toggle
  - Require email verification toggle

- **Exam Defaults**:
  - Default duration
  - Default pass percentage
  - Default max attempts

- **Notifications**:
  - Enable email notifications toggle

- **Maintenance**:
  - Maintenance mode toggle
  - Warning banner when enabled

---

## UI Components

### Layout Components

#### Sidebar (`components/layout/Sidebar.tsx`)
- Collapsible navigation
- Active route highlighting
- Sections: Main, Content, Reports, Administration
- User profile at bottom
- Sign out button

#### Header (`components/layout/Header.tsx`)
- Mobile menu toggle
- Page breadcrumbs
- User dropdown menu

### Form Components

#### Input (`components/ui/Input.tsx`)
- Label support
- Error message display
- Helper text
- All standard input types

#### Select (`components/ui/Select.tsx`)
- Dropdown with options
- Placeholder support
- Error handling

#### Button (`components/ui/Button.tsx`)
- Variants: primary, secondary, outline, ghost, danger
- Sizes: sm, md, lg
- Loading state with spinner
- Icon support (left/right)

### Data Display

#### DataTable (`components/tables/DataTable.tsx`)
- Sorting (click column headers)
- Pagination with page size selector
- Global search
- Empty state handling
- Loading skeleton
- Row click handler

#### Badge (`components/ui/Badge.tsx`)
- Variants: success, warning, danger, info, default
- Used for status indicators

#### Card (`components/ui/Card.tsx`)
- Container with header, body, footer slots
- Shadow and border options

### Charts

All charts use Recharts and are responsive:

- **StatCard**: Number display with icon and trend
- **BarChart**: Vertical bar chart
- **LineChart**: Time series data
- **PieChart**: Proportional data
- **AreaChart**: Filled line chart

---

## Database Integration

### Supabase Client Setup

Three client configurations for different contexts:

```typescript
// Browser client (client components)
import { createClient } from '@/lib/supabase/client';

// Server client (server components, API routes)
import { createClient } from '@/lib/supabase/server';

// Middleware client (edge runtime)
import { updateSession } from '@/lib/supabase/middleware';
```

### Database Tables Used

| Table | Purpose |
|-------|---------|
| `profiles` | User profiles with roles |
| `exams` | Exam definitions |
| `questions` | Exam questions |
| `options` | Question answer options |
| `attempts` | User exam attempts |
| `attempt_answers` | Individual question answers |

### Type Safety

All database operations use TypeScript types from `types/database.ts`:

```typescript
// Example types
type Profile = Database['public']['Tables']['profiles']['Row'];
type Exam = Database['public']['Tables']['exams']['Row'];
type Question = Database['public']['Tables']['questions']['Row'];
```

---

## Environment Configuration

### Required Environment Variables

```env
# Supabase Configuration (Required)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# App Configuration (Optional)
NEXT_PUBLIC_APP_NAME=IRA IFRS 17 Admin
NEXT_PUBLIC_APP_URL=http://localhost:3001
NEXT_PUBLIC_USER_PORTAL_URL=http://localhost:3000
```

---

## Running the Application

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase project with database schema applied

### Installation

```bash
# Navigate to frontend-admin directory
cd frontend-admin

# Install dependencies
npm install

# Create environment file
cp .env.local.example .env.local
# Edit .env.local with your Supabase credentials
```

### Development

```bash
# Start development server on port 3001
npm run dev

# Application will be available at http://localhost:3001
```

### Production Build

```bash
# Create production build
npm run build

# Start production server
npm run start
```

### Creating Admin Users

1. **Create user in Supabase Dashboard**:
   - Go to Authentication → Users → Add user
   - Enter email and password
   - Check "Auto Confirm User"

2. **Set admin role via SQL Editor**:
   ```sql
   UPDATE public.profiles 
   SET role = 'super_admin'
   WHERE email = 'admin@example.com';
   ```

---

## Security Considerations

1. **Authentication**: All routes protected via middleware
2. **Authorization**: Role-based access control on frontend and database (RLS)
3. **Session Management**: Secure, HTTP-only cookies via Supabase SSR
4. **Input Validation**: Zod schemas for all forms
5. **SQL Injection**: Protected via Supabase parameterized queries
6. **XSS Protection**: React's built-in escaping + Next.js security headers

---

## Future Enhancements

Potential features for future development:

1. **Audit Logging**: Track all admin actions
2. **Two-Factor Authentication**: Additional security layer
3. **Bulk User Import**: CSV import for users
4. **Email Templates**: Customizable notification emails
5. **Advanced Analytics**: More detailed reporting
6. **Question Bank**: Reusable question pools
7. **Exam Scheduling**: Time-based exam availability
8. **Certificate Generation**: PDF certificates for passed candidates

---

## Support

For technical support or questions about the admin dashboard:

- Review this documentation
- Check the code comments
- Contact the development team

---

*Documentation generated: December 8, 2025*
*Version: 1.0.0*
