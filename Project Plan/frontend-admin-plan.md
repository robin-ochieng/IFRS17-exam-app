# Frontend-Admin Implementation Plan

## IRA IFRS 17 Exam System - Admin Dashboard

**Version:** 1.0  
**Created:** December 2024  
**Status:** Planning Phase

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Architecture Overview](#2-architecture-overview)
3. [Technology Stack](#3-technology-stack)
4. [Project Structure](#4-project-structure)
5. [Authentication & Authorization](#5-authentication--authorization)
6. [Page Specifications](#6-page-specifications)
7. [Component Library](#7-component-library)
8. [API Integration](#8-api-integration)
9. [State Management](#9-state-management)
10. [UI/UX Design Guidelines](#10-uiux-design-guidelines)
11. [Implementation Phases](#11-implementation-phases)
12. [Testing Strategy](#12-testing-strategy)
13. [Deployment Strategy](#13-deployment-strategy)
14. [Security Considerations](#14-security-considerations)
15. [Performance Optimization](#15-performance-optimization)

---

## 1. Executive Summary

### 1.1 Purpose

The Frontend-Admin dashboard provides administrators with comprehensive tools to manage the IRA IFRS 17 Examination System. It enables exam creation, question management, results analysis, and user administration.

### 1.2 Key Objectives

- **Exam Management:** Full CRUD operations for exams with configuration options
- **Question Bank:** Create, edit, import, and organize questions with multiple-choice options
- **Results & Analytics:** View, filter, and export examination results with statistical insights
- **User Management:** Manage user accounts, roles, and permissions

### 1.3 Target Users

| Role | Access Level | Capabilities |
|------|--------------|--------------|
| `admin` | Standard Admin | Manage exams, questions, view results |
| `super_admin` | Full Access | All admin capabilities + user role management |

---

## 2. Architecture Overview

### 2.1 System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Frontend-Admin                            │
│                     (Next.js App Router)                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │   Auth       │  │   Layout     │  │   Feature Modules    │  │
│  │   Context    │  │   Components │  │   (Pages)            │  │
│  └──────────────┘  └──────────────┘  └──────────────────────┘  │
│                                                                  │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                    Shared Components                       │  │
│  │   (Tables, Forms, Modals, Charts, Navigation)             │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                    Supabase Client                         │  │
│  │   (Auth, Database, Real-time, Storage)                     │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                         Supabase Backend                         │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────┐    │
│  │  Auth    │  │ Database │  │   RLS    │  │ Edge         │    │
│  │  Service │  │ (Postgres)│  │ Policies │  │ Functions    │    │
│  └──────────┘  └──────────┘  └──────────┘  └──────────────┘    │
└─────────────────────────────────────────────────────────────────┘
```

### 2.2 Data Flow

```
User Action → Component → API Call → Supabase → RLS Check → Database
                                                      ↓
User ← UI Update ← State Update ← Response ←──────────┘
```

---

## 3. Technology Stack

### 3.1 Core Technologies

| Technology | Version | Purpose |
|------------|---------|---------|
| Next.js | 14.x+ | React framework with App Router |
| TypeScript | 5.x | Type safety and developer experience |
| React | 18.x | UI component library |
| Tailwind CSS | 3.x | Utility-first CSS framework |

### 3.2 Backend Integration

| Service | Purpose |
|---------|---------|
| Supabase Auth | Authentication and session management |
| Supabase Database | PostgreSQL database access |
| Supabase RLS | Row-level security for access control |

### 3.3 Additional Libraries

| Library | Purpose |
|---------|---------|
| `@supabase/ssr` | Server-side Supabase client |
| `react-hook-form` | Form state management and validation |
| `zod` | Schema validation |
| `@tanstack/react-table` | Data table management |
| `recharts` | Charts and data visualization |
| `lucide-react` | Icon library |
| `date-fns` | Date manipulation |
| `papaparse` | CSV parsing for bulk import |
| `xlsx` | Excel export functionality |
| `sonner` | Toast notifications |

---

## 4. Project Structure

```
frontend-admin/
├── app/                           # Next.js App Router
│   ├── (auth)/                    # Auth group (public routes)
│   │   ├── login/
│   │   │   └── page.tsx          # Admin login page
│   │   └── layout.tsx            # Auth layout (no sidebar)
│   │
│   ├── (dashboard)/              # Dashboard group (protected routes)
│   │   ├── layout.tsx            # Dashboard layout with sidebar
│   │   ├── page.tsx              # Dashboard home (overview)
│   │   │
│   │   ├── exams/                # Exam management
│   │   │   ├── page.tsx          # Exams list
│   │   │   ├── new/
│   │   │   │   └── page.tsx      # Create new exam
│   │   │   └── [id]/
│   │   │       ├── page.tsx      # Edit exam
│   │   │       └── questions/
│   │   │           └── page.tsx  # Manage exam questions
│   │   │
│   │   ├── questions/            # Question bank
│   │   │   ├── page.tsx          # All questions list
│   │   │   ├── new/
│   │   │   │   └── page.tsx      # Create new question
│   │   │   ├── [id]/
│   │   │   │   └── page.tsx      # Edit question
│   │   │   └── import/
│   │   │       └── page.tsx      # Bulk import questions
│   │   │
│   │   ├── results/              # Results & analytics
│   │   │   ├── page.tsx          # Results overview
│   │   │   ├── attempts/
│   │   │   │   ├── page.tsx      # All attempts list
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx  # Attempt detail view
│   │   │   └── analytics/
│   │   │       └── page.tsx      # Analytics dashboard
│   │   │
│   │   └── users/                # User management
│   │       ├── page.tsx          # Users list
│   │       ├── [id]/
│   │       │   └── page.tsx      # User detail/edit
│   │       └── invite/
│   │           └── page.tsx      # Bulk invite users
│   │
│   ├── api/                      # API routes (if needed)
│   │   └── export/
│   │       └── route.ts          # Export endpoints
│   │
│   ├── globals.css               # Global styles
│   └── layout.tsx                # Root layout
│
├── components/
│   ├── ui/                       # Base UI components
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Select.tsx
│   │   ├── Textarea.tsx
│   │   ├── Checkbox.tsx
│   │   ├── Switch.tsx
│   │   ├── Card.tsx
│   │   ├── Badge.tsx
│   │   ├── Modal.tsx
│   │   ├── Alert.tsx
│   │   ├── Dropdown.tsx
│   │   ├── Tabs.tsx
│   │   ├── Tooltip.tsx
│   │   ├── Skeleton.tsx
│   │   └── Loading.tsx
│   │
│   ├── layout/                   # Layout components
│   │   ├── Sidebar.tsx
│   │   ├── Header.tsx
│   │   ├── Breadcrumb.tsx
│   │   └── PageHeader.tsx
│   │
│   ├── forms/                    # Form components
│   │   ├── ExamForm.tsx
│   │   ├── QuestionForm.tsx
│   │   ├── OptionForm.tsx
│   │   ├── UserForm.tsx
│   │   └── FormField.tsx
│   │
│   ├── tables/                   # Table components
│   │   ├── DataTable.tsx
│   │   ├── ExamsTable.tsx
│   │   ├── QuestionsTable.tsx
│   │   ├── AttemptsTable.tsx
│   │   ├── UsersTable.tsx
│   │   ├── Pagination.tsx
│   │   └── TableFilters.tsx
│   │
│   ├── charts/                   # Chart components
│   │   ├── ScoreDistribution.tsx
│   │   ├── AttemptsTimeline.tsx
│   │   ├── PassRateChart.tsx
│   │   └── StatCard.tsx
│   │
│   └── features/                 # Feature-specific components
│       ├── exam/
│       │   ├── ExamCard.tsx
│       │   ├── ExamSettings.tsx
│       │   └── ExamPreview.tsx
│       ├── question/
│       │   ├── QuestionCard.tsx
│       │   ├── OptionEditor.tsx
│       │   ├── QuestionPreview.tsx
│       │   └── BulkImporter.tsx
│       ├── results/
│       │   ├── AttemptSummary.tsx
│       │   ├── AnswerReview.tsx
│       │   └── ExportButton.tsx
│       └── users/
│           ├── UserCard.tsx
│           ├── RoleSelector.tsx
│           └── BulkInvite.tsx
│
├── contexts/                     # React contexts
│   └── AuthContext.tsx           # Admin authentication context
│
├── hooks/                        # Custom hooks
│   ├── useAuth.ts
│   ├── useExams.ts
│   ├── useQuestions.ts
│   ├── useAttempts.ts
│   ├── useUsers.ts
│   ├── useDebounce.ts
│   └── usePagination.ts
│
├── lib/                          # Utilities and configurations
│   ├── supabase/
│   │   ├── client.ts            # Browser Supabase client
│   │   ├── server.ts            # Server Supabase client
│   │   └── middleware.ts        # Auth middleware helpers
│   ├── utils.ts                 # General utilities
│   ├── validators.ts            # Zod schemas
│   └── constants.ts             # App constants
│
├── types/                        # TypeScript types
│   ├── database.ts              # Database types
│   ├── forms.ts                 # Form types
│   └── api.ts                   # API response types
│
├── middleware.ts                 # Next.js middleware
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── package.json
└── README.md
```

---

## 5. Authentication & Authorization

### 5.1 Authentication Flow

```
┌─────────────────────────────────────────────────────────────┐
│                     Admin Login Flow                         │
└─────────────────────────────────────────────────────────────┘

1. User navigates to /login
              │
              ▼
2. Enter credentials (email/password)
              │
              ▼
3. Supabase Auth validates credentials
              │
              ├──── Invalid ────► Show error message
              │
              ▼
4. Fetch user profile from profiles table
              │
              ▼
5. Check role: is admin or super_admin?
              │
              ├──── No ────► "Unauthorized" - redirect to student portal
              │
              ▼
6. Set session cookie, redirect to /dashboard
```

### 5.2 Middleware Protection

```typescript
// middleware.ts
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Public routes
  const publicRoutes = ['/login'];
  if (publicRoutes.includes(pathname)) {
    return NextResponse.next();
  }

  // Check authentication
  const supabase = createMiddlewareClient(request);
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Check admin role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', session.user.id)
    .single();

  if (!profile || !['admin', 'super_admin'].includes(profile.role)) {
    return NextResponse.redirect(new URL('/unauthorized', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api).*)']
};
```

### 5.3 Role-Based Access Control

| Feature | `admin` | `super_admin` |
|---------|---------|---------------|
| View Dashboard | ✅ | ✅ |
| Create/Edit Exams | ✅ | ✅ |
| Manage Questions | ✅ | ✅ |
| View Results | ✅ | ✅ |
| Export Data | ✅ | ✅ |
| View Users | ✅ | ✅ |
| Edit User Profiles | ❌ | ✅ |
| Change User Roles | ❌ | ✅ |
| Delete Users | ❌ | ✅ |
| System Settings | ❌ | ✅ |

---

## 6. Page Specifications

### 6.1 Login Page (`/login`)

**Purpose:** Admin authentication entry point

**UI Components:**
- Kenbright/IRA logo
- Email input field
- Password input field
- "Sign In" button
- Error message display
- Loading state indicator

**Functionality:**
- Form validation (email format, password required)
- Supabase authentication
- Role verification
- Session management
- Redirect to dashboard on success

**Design:**
- Centered card layout
- Blue gradient background (consistent with user portal)
- Responsive for all screen sizes

---

### 6.2 Dashboard Home (`/dashboard`)

**Purpose:** Overview of system statistics and quick actions

**UI Sections:**

#### 6.2.1 Statistics Cards
- Total Active Exams
- Total Questions
- Total Candidates
- Attempts This Week
- Average Pass Rate

#### 6.2.2 Recent Activity
- Latest exam attempts (5 most recent)
- Quick links to view details

#### 6.2.3 Quick Actions
- Create New Exam
- Import Questions
- Export Results
- View All Users

#### 6.2.4 Charts
- Attempts Over Time (line chart, last 30 days)
- Pass/Fail Distribution (pie chart)
- Score Distribution (histogram)

**Data Sources:**
```sql
-- Statistics queries
SELECT * FROM public.exam_statistics;

-- Recent attempts
SELECT a.*, p.full_name, e.title 
FROM attempts a
JOIN profiles p ON a.user_id = p.id
JOIN exams e ON a.exam_id = e.id
WHERE a.status = 'submitted'
ORDER BY a.submitted_at DESC
LIMIT 5;
```

---

### 6.3 Exams Management (`/exams`)

#### 6.3.1 Exams List Page

**UI Components:**
- Page header with "Create Exam" button
- Search input (by title)
- Status filter (Active/Inactive/All)
- Data table with columns:
  - Title
  - Status (badge)
  - Questions count
  - Duration
  - Pass Mark
  - Attempts
  - Actions (Edit, Questions, Delete)
- Pagination

**Actions:**
- Create new exam
- Edit exam settings
- Manage questions
- Toggle active status
- Delete exam (with confirmation)

#### 6.3.2 Create/Edit Exam Page (`/exams/new`, `/exams/[id]`)

**Form Fields:**

| Field | Type | Validation | Default |
|-------|------|------------|---------|
| Title | Text | Required, max 200 chars | - |
| Description | Textarea | Optional, max 2000 chars | - |
| Duration (minutes) | Number | Required, min 1, max 480 | 60 |
| Total Marks | Number | Required, min 1 | 100 |
| Pass Mark (%) | Number | Required, 0-100 | 60 |
| Max Attempts | Number | Optional, min 1 or null for unlimited | null |
| Randomize Questions | Switch | - | false |
| Allow Review | Switch | - | true |
| Instructions | Rich Text | Optional | - |
| Is Active | Switch | - | false |

**Form Validation Schema:**
```typescript
const examSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  description: z.string().max(2000).optional(),
  duration_minutes: z.number().min(1).max(480),
  total_marks: z.number().min(1),
  pass_mark_percent: z.number().min(0).max(100),
  max_attempts: z.number().min(1).nullable(),
  randomize_questions: z.boolean(),
  allow_review: z.boolean(),
  instructions: z.string().optional(),
  is_active: z.boolean()
});
```

#### 6.3.3 Exam Questions Page (`/exams/[id]/questions`)

**Purpose:** Manage questions for a specific exam

**UI Components:**
- Exam title and info header
- "Add Question" button
- "Import Questions" button
- Questions list with:
  - Question number
  - Prompt preview (truncated)
  - Marks
  - Options count
  - Actions (Edit, Delete, Reorder)
- Drag-and-drop reordering

**Features:**
- Inline question preview
- Quick edit modal
- Bulk delete selected
- Auto-renumber on delete/reorder

---

### 6.4 Question Bank (`/questions`)

#### 6.4.1 Questions List Page

**UI Components:**
- Page header with actions
- Search input (search in prompt text)
- Filter by exam
- Filter by status (Active/Inactive)
- Data table with columns:
  - #
  - Prompt (truncated to 100 chars)
  - Exam Title
  - Marks
  - Options
  - Status
  - Actions

**Bulk Actions:**
- Delete selected
- Move to another exam
- Change status

#### 6.4.2 Create/Edit Question Page (`/questions/new`, `/questions/[id]`)

**Form Structure:**
```
┌─────────────────────────────────────────────────────────────┐
│  Question Details                                            │
├─────────────────────────────────────────────────────────────┤
│  Exam:        [Select Exam Dropdown]                        │
│  Question #:  [Auto-generated or manual]                    │
│  Marks:       [Number Input]                                │
│  Status:      [Active/Inactive Toggle]                      │
├─────────────────────────────────────────────────────────────┤
│  Question Prompt:                                            │
│  [Rich Text Editor / Textarea]                              │
├─────────────────────────────────────────────────────────────┤
│  Answer Options:                                             │
│  ┌─────────────────────────────────────────────────────────┐│
│  │ A [●] [Option text input                              ] ││
│  │ B [ ] [Option text input                              ] ││
│  │ C [ ] [Option text input                              ] ││
│  │ D [ ] [Option text input                              ] ││
│  │ [+ Add Option]                                         ││
│  └─────────────────────────────────────────────────────────┘│
│  ● = Correct answer (radio selection)                       │
├─────────────────────────────────────────────────────────────┤
│  Explanation (shown after answer):                          │
│  [Textarea for explanation]                                 │
├─────────────────────────────────────────────────────────────┤
│  [Cancel]                              [Save Question]      │
└─────────────────────────────────────────────────────────────┘
```

**Validation:**
- Exam selection required
- Prompt required (min 10 chars)
- At least 2 options required
- Exactly one correct answer required
- Marks must be positive integer

#### 6.4.3 Bulk Import Page (`/questions/import`)

**Process Flow:**
1. Select target exam
2. Upload CSV/JSON file
3. Preview imported data
4. Validate and show errors
5. Confirm import

**CSV Format:**
```csv
question_number,prompt,marks,option_a,option_b,option_c,option_d,correct_answer,explanation
1,"What is IFRS 17?",2,"Insurance standard","Accounting standard","Banking regulation","Tax law","B","IFRS 17 is an accounting standard..."
```

**JSON Format:**
```json
{
  "questions": [
    {
      "question_number": 1,
      "prompt": "What is IFRS 17?",
      "marks": 2,
      "options": [
        { "label": "A", "text": "Insurance standard", "is_correct": false },
        { "label": "B", "text": "Accounting standard", "is_correct": true },
        { "label": "C", "text": "Banking regulation", "is_correct": false },
        { "label": "D", "text": "Tax law", "is_correct": false }
      ],
      "explanation": "IFRS 17 is an accounting standard..."
    }
  ]
}
```

**Import Preview Table:**
- Row number
- Validation status (✓ or ✗ with error)
- Question preview
- Option A-D preview
- Correct answer

---

### 6.5 Results & Analytics (`/results`)

#### 6.5.1 Results Overview Page

**Statistics Summary:**
- Total Attempts (all time)
- Submitted This Week
- Average Score
- Pass Rate

**Charts:**
- Score Distribution (histogram)
- Attempts Over Time (line chart)
- Pass/Fail Ratio (donut chart)
- Top Performers Table

#### 6.5.2 Attempts List Page (`/results/attempts`)

**UI Components:**
- Filters:
  - Exam (dropdown)
  - Date range (date picker)
  - Status (in_progress, submitted, expired)
  - Score range (slider)
  - Pass/Fail (checkbox)
- Search by candidate name
- Data table columns:
  - Candidate Name
  - Email
  - Organisation
  - Exam Title
  - Started At
  - Submitted At
  - Score
  - Percentage
  - Status (badge)
  - Pass/Fail (badge)
  - Actions (View)
- Export button (CSV/Excel)
- Pagination

**Export Options:**
- All results (with current filters)
- Selected rows only
- Include/exclude answer details

#### 6.5.3 Attempt Detail Page (`/results/attempts/[id]`)

**Sections:**

1. **Candidate Info**
   - Name, Email, Organisation
   - Attempt ID

2. **Attempt Summary**
   - Exam Title
   - Started At / Submitted At
   - Time Taken
   - Score / Total Marks
   - Percentage
   - Pass/Fail Status

3. **Answer Review**
   - For each question:
     - Question number and prompt
     - All options with indicators:
       - ✓ Green: Correct answer
       - ✗ Red: Candidate's wrong selection
       - ○ Gray: Unselected options
     - Marks awarded / Total marks
     - Explanation (collapsible)

4. **Actions**
   - Export to PDF
   - Print

---

### 6.6 User Management (`/users`)

#### 6.6.1 Users List Page

**UI Components:**
- Search by name/email
- Filter by role (student, admin, super_admin)
- Filter by organisation
- Data table columns:
  - Name
  - Email
  - Organisation
  - Role (badge)
  - Attempts Count
  - Joined Date
  - Actions (View, Edit Role*)
- Pagination

*Edit Role only visible to super_admin

**Super Admin Actions:**
- Change user role
- Delete user (with confirmation)

#### 6.6.2 User Detail Page (`/users/[id]`)

**Sections:**

1. **Profile Information**
   - Name, Email, Organisation
   - Role
   - Member Since

2. **Exam History**
   - List of all attempts
   - Per-exam statistics

3. **Actions (super_admin only)**
   - Edit role
   - Reset password (send email)
   - Delete account

#### 6.6.3 Bulk Invite Page (`/users/invite`)

**Process:**
1. Enter email addresses (textarea, one per line)
2. Or upload CSV with emails
3. Select role for new users
4. Preview list
5. Send invitations

**Email Format:**
```
Subject: You've been invited to IRA IFRS 17 Exam System

Body:
You have been invited to the IRA IFRS 17 Examination System.

Click below to set up your account:
[Create Account Button]

This invitation expires in 7 days.
```

---

## 7. Component Library

### 7.1 Base UI Components

#### Button Component
```typescript
interface ButtonProps {
  variant: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline';
  size: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  children: React.ReactNode;
  onClick?: () => void;
}
```

#### Input Component
```typescript
interface InputProps {
  type: 'text' | 'email' | 'password' | 'number';
  label?: string;
  placeholder?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  disabled?: boolean;
}
```

#### DataTable Component
```typescript
interface DataTableProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  loading?: boolean;
  searchable?: boolean;
  searchPlaceholder?: string;
  selectable?: boolean;
  pagination?: {
    pageSize: number;
    pageIndex: number;
    totalPages: number;
    onPageChange: (page: number) => void;
  };
  onRowClick?: (row: T) => void;
  emptyMessage?: string;
}
```

### 7.2 Form Components

All forms use `react-hook-form` with `zod` validation:

```typescript
// Example: Exam Form
const ExamForm = ({ exam, onSubmit, onCancel }) => {
  const form = useForm<ExamFormData>({
    resolver: zodResolver(examSchema),
    defaultValues: exam || defaultExamValues
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {/* ... other fields */}
      </form>
    </Form>
  );
};
```

### 7.3 Layout Components

#### Sidebar
```typescript
const sidebarItems = [
  { 
    title: 'Dashboard', 
    href: '/dashboard', 
    icon: LayoutDashboard 
  },
  { 
    title: 'Exams', 
    href: '/exams', 
    icon: BookOpen,
    children: [
      { title: 'All Exams', href: '/exams' },
      { title: 'Create New', href: '/exams/new' }
    ]
  },
  { 
    title: 'Questions', 
    href: '/questions', 
    icon: HelpCircle,
    children: [
      { title: 'Question Bank', href: '/questions' },
      { title: 'Import', href: '/questions/import' }
    ]
  },
  { 
    title: 'Results', 
    href: '/results', 
    icon: BarChart3,
    children: [
      { title: 'Overview', href: '/results' },
      { title: 'All Attempts', href: '/results/attempts' },
      { title: 'Analytics', href: '/results/analytics' }
    ]
  },
  { 
    title: 'Users', 
    href: '/users', 
    icon: Users 
  }
];
```

---

## 8. API Integration

### 8.1 Supabase Client Setup

```typescript
// lib/supabase/client.ts
import { createBrowserClient } from '@supabase/ssr';

export const createClient = () => {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
};
```

### 8.2 Data Fetching Patterns

#### Server Components (Recommended)
```typescript
// app/exams/page.tsx
export default async function ExamsPage() {
  const supabase = createServerClient();
  
  const { data: exams, error } = await supabase
    .from('exams')
    .select(`
      *,
      questions:questions(count)
    `)
    .order('created_at', { ascending: false });

  return <ExamsTable exams={exams} />;
}
```

#### Client Components with SWR Pattern
```typescript
// hooks/useExams.ts
export function useExams(filters?: ExamFilters) {
  const supabase = createClient();
  const [data, setData] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchExams = async () => {
      setLoading(true);
      let query = supabase.from('exams').select('*');
      
      if (filters?.isActive !== undefined) {
        query = query.eq('is_active', filters.isActive);
      }
      
      const { data, error } = await query.order('created_at', { ascending: false });
      
      if (error) setError(error);
      else setData(data || []);
      setLoading(false);
    };

    fetchExams();
  }, [filters]);

  return { data, loading, error };
}
```

### 8.3 CRUD Operations

#### Create
```typescript
const createExam = async (data: ExamInsert) => {
  const supabase = createClient();
  const { data: exam, error } = await supabase
    .from('exams')
    .insert(data)
    .select()
    .single();
  
  if (error) throw error;
  return exam;
};
```

#### Update
```typescript
const updateExam = async (id: string, data: ExamUpdate) => {
  const supabase = createClient();
  const { data: exam, error } = await supabase
    .from('exams')
    .update(data)
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  return exam;
};
```

#### Delete
```typescript
const deleteExam = async (id: string) => {
  const supabase = createClient();
  const { error } = await supabase
    .from('exams')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
};
```

### 8.4 Key API Queries

#### Get Exam with Questions and Options
```typescript
const { data: exam } = await supabase
  .from('exams')
  .select(`
    *,
    questions (
      *,
      options (*)
    )
  `)
  .eq('id', examId)
  .single();
```

#### Get Attempt with Full Details
```typescript
const { data: attempt } = await supabase
  .from('attempts')
  .select(`
    *,
    exam:exams(*),
    user:profiles(full_name, email, organisation),
    answers:attempt_answers(
      *,
      question:questions(
        *,
        options(*)
      )
    )
  `)
  .eq('id', attemptId)
  .single();
```

#### Get Exam Statistics
```typescript
const { data: stats } = await supabase
  .from('exam_statistics')
  .select('*')
  .eq('exam_id', examId)
  .single();
```

---

## 9. State Management

### 9.1 Auth Context

```typescript
// contexts/AuthContext.tsx
interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const isAdmin = profile?.role === 'admin' || profile?.role === 'super_admin';
  const isSuperAdmin = profile?.role === 'super_admin';

  // ... implementation

  return (
    <AuthContext.Provider value={{
      user,
      profile,
      loading,
      isAdmin,
      isSuperAdmin,
      signIn,
      signOut
    }}>
      {children}
    </AuthContext.Provider>
  );
};
```

### 9.2 Form State (react-hook-form)

- All forms use `react-hook-form` for local form state
- Validation with `zod` schemas
- Optimistic UI updates where appropriate

### 9.3 Server State (URL-based)

- Filters and pagination stored in URL search params
- Enables shareable filtered views
- Back button preserves state

```typescript
// Example: Using URL params for filters
const searchParams = useSearchParams();
const router = useRouter();

const filters = {
  exam: searchParams.get('exam') || undefined,
  status: searchParams.get('status') || undefined,
  page: parseInt(searchParams.get('page') || '1')
};

const updateFilter = (key: string, value: string | undefined) => {
  const params = new URLSearchParams(searchParams);
  if (value) params.set(key, value);
  else params.delete(key);
  router.push(`?${params.toString()}`);
};
```

---

## 10. UI/UX Design Guidelines

### 10.1 Color Palette

```css
:root {
  /* Primary - Blue (consistent with user portal) */
  --primary-50: #eff6ff;
  --primary-100: #dbeafe;
  --primary-500: #3b82f6;
  --primary-600: #2563eb;
  --primary-700: #1d4ed8;
  --primary-800: #1e40af;
  --primary-900: #1e3a8a;

  /* Success - Green */
  --success-500: #22c55e;
  --success-600: #16a34a;

  /* Warning - Yellow */
  --warning-500: #eab308;
  --warning-600: #ca8a04;

  /* Danger - Red */
  --danger-500: #ef4444;
  --danger-600: #dc2626;

  /* Neutral - Gray */
  --gray-50: #f9fafb;
  --gray-100: #f3f4f6;
  --gray-200: #e5e7eb;
  --gray-300: #d1d5db;
  --gray-400: #9ca3af;
  --gray-500: #6b7280;
  --gray-600: #4b5563;
  --gray-700: #374151;
  --gray-800: #1f2937;
  --gray-900: #111827;
}
```

### 10.2 Typography

```css
/* Font Family */
font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;

/* Font Sizes */
--text-xs: 0.75rem;    /* 12px */
--text-sm: 0.875rem;   /* 14px */
--text-base: 1rem;     /* 16px */
--text-lg: 1.125rem;   /* 18px */
--text-xl: 1.25rem;    /* 20px */
--text-2xl: 1.5rem;    /* 24px */
--text-3xl: 1.875rem;  /* 30px */
```

### 10.3 Spacing System

Using Tailwind's default spacing scale:
- `space-1`: 0.25rem (4px)
- `space-2`: 0.5rem (8px)
- `space-3`: 0.75rem (12px)
- `space-4`: 1rem (16px)
- `space-6`: 1.5rem (24px)
- `space-8`: 2rem (32px)

### 10.4 Component Styling

#### Cards
```css
.card {
  @apply bg-white rounded-lg border border-gray-200 shadow-sm;
}
.card-header {
  @apply px-6 py-4 border-b border-gray-200;
}
.card-body {
  @apply px-6 py-4;
}
```

#### Badges
```css
.badge {
  @apply inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium;
}
.badge-success { @apply bg-green-100 text-green-800; }
.badge-warning { @apply bg-yellow-100 text-yellow-800; }
.badge-danger { @apply bg-red-100 text-red-800; }
.badge-info { @apply bg-blue-100 text-blue-800; }
```

### 10.5 Responsive Breakpoints

```css
/* Tailwind defaults */
sm: 640px   /* Mobile landscape */
md: 768px   /* Tablet */
lg: 1024px  /* Desktop */
xl: 1280px  /* Large desktop */
2xl: 1536px /* Extra large */
```

### 10.6 Layout Guidelines

- **Sidebar:** 256px width, collapsible on mobile
- **Main Content:** Fluid width with max-width of 1400px
- **Tables:** Horizontal scroll on small screens
- **Forms:** Single column on mobile, two columns on desktop for long forms

---

## 11. Implementation Phases

### Phase 1: Foundation (Week 1)
**Duration:** 5 days

#### Tasks:
1. **Project Setup**
   - Initialize Next.js project with TypeScript
   - Configure Tailwind CSS
   - Set up ESLint and Prettier
   - Configure environment variables

2. **Authentication**
   - Supabase client setup
   - Auth context implementation
   - Login page
   - Middleware for route protection
   - Role verification

3. **Layout Components**
   - Sidebar navigation
   - Header with user menu
   - Base page layout
   - Loading states

#### Deliverables:
- [ ] Working authentication flow
- [ ] Protected dashboard route
- [ ] Basic layout structure

---

### Phase 2: Exam Management (Week 2)
**Duration:** 5 days

#### Tasks:
1. **Exams List**
   - Data table component
   - Search and filters
   - Pagination

2. **Exam CRUD**
   - Create exam form
   - Edit exam form
   - Delete with confirmation
   - Toggle active status

3. **UI Components**
   - Form components (Input, Select, Switch, Textarea)
   - Button variants
   - Modal component
   - Toast notifications

#### Deliverables:
- [ ] Exams list page with filters
- [ ] Create/Edit exam functionality
- [ ] Reusable form components

---

### Phase 3: Question Management (Week 3)
**Duration:** 5 days

#### Tasks:
1. **Questions List**
   - Questions table
   - Filter by exam
   - Search functionality

2. **Question CRUD**
   - Create question form with options
   - Edit question
   - Delete question
   - Question preview

3. **Exam Questions Page**
   - View questions for specific exam
   - Reorder questions (drag-and-drop)
   - Quick actions

#### Deliverables:
- [ ] Question bank page
- [ ] Create/Edit question with options
- [ ] Exam-specific question management

---

### Phase 4: Bulk Import (Week 4, Days 1-3)
**Duration:** 3 days

#### Tasks:
1. **Import Interface**
   - File upload component
   - CSV/JSON parser
   - Validation engine

2. **Preview & Import**
   - Preview table with validation status
   - Error highlighting
   - Batch insert

#### Deliverables:
- [ ] Bulk import page
- [ ] CSV and JSON support
- [ ] Validation and error handling

---

### Phase 5: Results & Analytics (Week 4, Days 4-5 + Week 5, Days 1-3)
**Duration:** 5 days

#### Tasks:
1. **Results Overview**
   - Statistics cards
   - Charts (score distribution, pass rate)
   - Recent attempts

2. **Attempts List**
   - Full attempts table
   - Advanced filters
   - Export to CSV/Excel

3. **Attempt Detail**
   - Full attempt review
   - Answer analysis
   - PDF export

#### Deliverables:
- [ ] Results overview with charts
- [ ] Attempts list with export
- [ ] Detailed attempt view

---

### Phase 6: User Management (Week 5, Days 4-5)
**Duration:** 2 days

#### Tasks:
1. **Users List**
   - Users table
   - Role filters
   - Search

2. **User Actions**
   - View user details
   - Role management (super_admin)
   - User attempt history

#### Deliverables:
- [ ] Users list page
- [ ] Role management for super_admin
- [ ] User detail view

---

### Phase 7: Polish & Testing (Week 6)
**Duration:** 5 days

#### Tasks:
1. **UI Polish**
   - Responsive design fixes
   - Loading states
   - Error handling
   - Empty states

2. **Testing**
   - Component testing
   - Integration testing
   - User acceptance testing

3. **Documentation**
   - Admin user guide
   - API documentation

#### Deliverables:
- [ ] Polished, responsive UI
- [ ] Test coverage
- [ ] Documentation

---

## 12. Testing Strategy

### 12.1 Unit Testing

**Framework:** Jest + React Testing Library

**Coverage Targets:**
- UI Components: 80%
- Utility Functions: 90%
- Custom Hooks: 85%

**Example Test:**
```typescript
describe('Button Component', () => {
  it('renders with correct variant styles', () => {
    render(<Button variant="primary">Click me</Button>);
    expect(screen.getByRole('button')).toHaveClass('bg-blue-600');
  });

  it('shows loading spinner when loading', () => {
    render(<Button loading>Submit</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
    expect(screen.getByTestId('spinner')).toBeInTheDocument();
  });
});
```

### 12.2 Integration Testing

**Focus Areas:**
- Authentication flow
- Form submissions
- Data table interactions
- CRUD operations

### 12.3 E2E Testing

**Framework:** Playwright

**Critical Paths:**
1. Admin login → Dashboard
2. Create exam → Add questions → Activate
3. View results → Export
4. Manage users (super_admin)

---

## 13. Deployment Strategy

### 13.1 Environment Setup

```env
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_APP_URL=http://localhost:3001
```

### 13.2 Vercel Deployment

1. **Connect Repository**
   - Link GitHub repository
   - Set root directory to `frontend-admin`

2. **Environment Variables**
   - Add all required env vars in Vercel dashboard
   - Set different values for preview/production

3. **Build Settings**
   ```
   Build Command: npm run build
   Output Directory: .next
   Install Command: npm install
   ```

4. **Domain Configuration**
   - Production: `admin.ifrs17exam.com`
   - Preview: `admin-preview.ifrs17exam.com`

### 13.3 CI/CD Pipeline

```yaml
# GitHub Actions workflow
name: Deploy Admin Dashboard

on:
  push:
    branches: [main]
    paths:
      - 'frontend-admin/**'

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
        working-directory: frontend-admin
      - run: npm run lint
        working-directory: frontend-admin
      - run: npm run test
        working-directory: frontend-admin
      - run: npm run build
        working-directory: frontend-admin
```

---

## 14. Security Considerations

### 14.1 Authentication Security

- ✅ Supabase handles password hashing (bcrypt)
- ✅ Session tokens stored in HTTP-only cookies
- ✅ CSRF protection via SameSite cookies
- ✅ Rate limiting on auth endpoints

### 14.2 Authorization Security

- ✅ Server-side role verification in middleware
- ✅ RLS policies enforce database-level access
- ✅ Client-side role checks for UI only
- ✅ Sensitive operations require re-authentication

### 14.3 Data Security

- ✅ All API calls over HTTPS
- ✅ Input validation with Zod schemas
- ✅ SQL injection prevention via Supabase client
- ✅ XSS prevention via React's auto-escaping

### 14.4 RLS Policy Examples

```sql
-- Only admins can modify exams
CREATE POLICY "Admins can manage exams" ON exams
  FOR ALL
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- Only super_admins can modify user roles
CREATE POLICY "Super admins can manage profiles" ON profiles
  FOR UPDATE
  USING (public.is_super_admin(auth.uid()));
```

---

## 15. Performance Optimization

### 15.1 Data Loading

- **Server Components:** Use for initial page data
- **Pagination:** Limit results to 20-50 per page
- **Lazy Loading:** Load charts and heavy components on demand
- **Caching:** Use Next.js data cache for static data

### 15.2 Bundle Optimization

- **Code Splitting:** Automatic with Next.js App Router
- **Tree Shaking:** Ensure proper imports
- **Image Optimization:** Use Next.js Image component

### 15.3 Database Optimization

- **Indexes:** Already defined in schema
- **Select Columns:** Only fetch needed columns
- **Avoid N+1:** Use joins and nested selects

```typescript
// Good: Single query with relations
const { data } = await supabase
  .from('exams')
  .select(`
    id, title, is_active,
    questions(count)
  `);

// Bad: N+1 queries
const { data: exams } = await supabase.from('exams').select('*');
for (const exam of exams) {
  const { count } = await supabase
    .from('questions')
    .select('*', { count: 'exact' })
    .eq('exam_id', exam.id);
}
```

---

## Appendix A: File Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Pages | `page.tsx` | `app/exams/page.tsx` |
| Layouts | `layout.tsx` | `app/(dashboard)/layout.tsx` |
| Components | PascalCase | `ExamForm.tsx` |
| Hooks | camelCase with `use` prefix | `useExams.ts` |
| Utilities | camelCase | `formatDate.ts` |
| Types | PascalCase | `ExamFormData` |
| Constants | SCREAMING_SNAKE_CASE | `MAX_FILE_SIZE` |

---

## Appendix B: Git Workflow

```bash
# Feature branch
git checkout -b feature/exam-management

# Commit conventions
git commit -m "feat(exams): add create exam form"
git commit -m "fix(auth): handle session expiry"
git commit -m "chore: update dependencies"

# Types: feat, fix, docs, style, refactor, test, chore
```

---

## Appendix C: Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key | Yes |
| `NEXT_PUBLIC_APP_URL` | Application URL | Yes |
| `NEXT_PUBLIC_USER_PORTAL_URL` | User portal URL (for links) | No |

---

**Document Version:** 1.0  
**Last Updated:** December 2024  
**Author:** Development Team
