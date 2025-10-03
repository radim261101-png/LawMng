# Legal Case Management System

## Overview

A bilingual (Arabic/English) legal case management system built with React, Express, and PostgreSQL. The application provides role-based access control for managing legal records, cases, and documentation with a focus on Arabic legal context and RTL (right-to-left) interface design.

## Recent Changes (October 2, 2025)

**Google Sheets Integration:**
- Integrated with Google Sheets as the primary data source
- All records are now fetched directly from Google Sheets spreadsheet
- Real-time data synchronization with 5-second cache for performance
- Spreadsheet ID: 1f0kcjIgFGQq3wLAF7yp_APJw3v-ZvcGfRs2QhjVexgA
- Automatic column mapping between sheet structure and application schema
- Used Replit's Google Sheets connector for secure authentication

**Updates History Feature (Admin-Only):**
- Added new "سجل التعديلات" (Updates History) page accessible only to admins
- Displays all record modifications made by users with timestamps and field changes
- Shows old vs. new values side-by-side for transparency
- Automatically tracks all user edits in real-time
- Navigation tab added for quick access to updates history
- Sample updates initialized in storage for demonstration

**Permission System Enhancement:**
- Implemented append-only editing for regular users on 37 editable fields
- Regular users can add new data to existing records but cannot modify old data
- Admins retain full editing rights on all fields (old and new)
- Any user can edit any record (not restricted by record creator)
- UI updated: Regular users see existing values as read-only with separate input for new additions
- Backend enforces permission rules with proper field filtering and append logic

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight client-side routing)
- **State Management**: 
  - React Context API for authentication
  - TanStack Query (React Query) for server state management
- **UI Framework**: shadcn/ui components with Radix UI primitives
- **Styling**: Tailwind CSS with custom Material Design-inspired theme
- **Form Handling**: React Hook Form with Zod validation

**Design System**:
- RTL-first design with Arabic fonts (Cairo, Tajawal via Google Fonts)
- Enterprise utility aesthetic prioritizing data clarity over aesthetics
- Professional blue color scheme (HSL 220 70% 45%) for trust and authority
- Light mode primary with dark mode support
- Responsive breakpoints using Tailwind's mobile-first approach

**Key Architectural Decisions**:
- Component-based architecture with separation of concerns
- Context providers for authentication
- Protected routes with role-based access control (admin vs. user)
- Toast notifications for user feedback
- Reusable UI components following shadcn/ui patterns
- Conditional rendering of edit forms based on user role (append-only vs full edit)

### Backend Architecture

**Runtime**: Node.js with Express
- **Language**: TypeScript with ESM modules
- **Build Tool**: esbuild for production bundling
- **Development**: tsx for development hot-reloading
- **API Pattern**: RESTful endpoints under `/api` prefix

**Server Setup**:
- Middleware-based request handling
- Request/response logging with duration tracking
- Error handling middleware for centralized error responses
- Session management using express-session (in-memory for development)

**Key Architectural Decisions**:
- Monolithic backend with modular route registration
- Separation of storage layer from route handlers
- Interface-based storage abstraction (IStorage) allowing multiple implementations
- Currently using Google Sheets as primary data source (SheetStorage) with local caching
- Permission enforcement at API level with field-level access control

### Data Storage

**Database**: PostgreSQL via Neon serverless
- **ORM**: Drizzle ORM with Drizzle Kit for migrations
- **Schema Location**: `shared/schema.ts`

**Database Schema**:

1. **users table**:
   - id (UUID, auto-generated)
   - username (unique text)
   - password (text, hashed)
   - role (text: "admin" or "user")

2. **valu_records table**:
   - Comprehensive legal case tracking with 85+ fields
   - id (UUID primary key)
   - serial (unique integer)
   - createdBy (username of creator)
   - Client info: company, accountNumber, clientName, nationalId, legalAgent
   - Document details: documentType, attachedDocumentsCount, documentValue
   - Report info: reportDate, crimeNumber, reportType, governorate, district
   - Court tracking: firstInstanceCourtLocation, firstSessionDate
   - Editable fields (37 total): reportType, postponementDate, postponementReason, ruling, inventoryNumber, firstInstanceCourtNotes, oppositionSessionDate, oppositionRuling, oppositionInventoryNumber, firstAppealSessionDate, appealCourtLocation, clientAppealNumber, appealRulingText, appealInventoryNumber, appealOppositionDate, appealOppositionRuling, appealOppositionInventoryNumber, settlementMailDate, settlementConfirmationDate, debtDocumentReturnDate, debtDocumentReturnReason, depositReceiptStatus, updateDate, lastUpdateLawyer, extract, invoice, notes, sessionUpdate, required, report, archived, paidCases, reportPreparationLawyer, sessionAttendanceLawyer, extractionLawyer, settlementLawyer, claimSent, branchesReceipt, receiptDate
   - Metadata: createdBy, lastModifiedBy, lastModifiedDate

3. **record_updates table**:
   - id (UUID primary key)
   - recordId (UUID, reference to valu_records)
   - updatedBy (username)
   - updatedAt (timestamp)
   - fieldName (text)
   - oldValue (text)
   - newValue (text)

**Key Architectural Decisions**:
- UUID primary keys for distributed system compatibility
- Text-based date storage (flexibility for partial dates and Arabic calendar formats)
- Denormalized schema prioritizing query simplicity over normalization
- All optional fields except id, serial, and createdBy for flexible data entry
- Audit trail via record_updates table for tracking all changes

### Authentication & Authorization

**Current Implementation**: Session-based authentication
- Admin user: `admin/admin123`
- Regular user: `user/user123`
- Session management via express-session
- Role-based access control (admin, user)

**Authorization Model**:
- **Admins**: Full CRUD access to all records, can edit all fields (old and new data)
- **Regular Users**: 
  - Can edit any record (not restricted by creator)
  - Append-only editing: can add new data to existing fields but cannot modify old data
  - Limited to 37 editable fields defined in EDITABLE_FIELDS constant
  - New data is appended with newline separator
- Protected routes enforce authentication and role requirements

**Migration Path**: Schema prepared for PostgreSQL-backed authentication with password hashing

### External Dependencies

**Core Runtime Dependencies**:
- `@neondatabase/serverless`: Neon PostgreSQL serverless driver
- `drizzle-orm`: Type-safe ORM with PostgreSQL dialect
- `drizzle-zod`: Schema-to-Zod validation generator
- `express`: Web application framework
- `express-session`: Session middleware for Express

**Frontend Libraries**:
- `react` & `react-dom`: UI framework
- `wouter`: Lightweight routing
- `@tanstack/react-query`: Async state management
- `react-hook-form`: Form state management
- `zod`: Runtime type validation
- `@hookform/resolvers`: Zod integration for react-hook-form

**UI Component Libraries** (Radix UI):
- Complete set of accessible, unstyled components
- Dialog, Dropdown, Popover, Toast, Select, and 20+ other primitives
- Customized with Tailwind CSS for Material Design aesthetic

**Styling & Utilities**:
- `tailwindcss`: Utility-first CSS framework
- `class-variance-authority`: Component variant management
- `clsx` & `tailwind-merge`: Class name utilities
- `lucide-react`: Icon library

**Build & Development Tools**:
- `vite`: Frontend build tool and dev server
- `@vitejs/plugin-react`: React fast refresh support
- `esbuild`: Backend bundler for production
- `tsx`: TypeScript execution for development
- `@replit/vite-plugin-*`: Replit-specific development plugins

**Date Handling**:
- `date-fns`: Date manipulation and formatting

**Key Integration Decisions**:
- No external authentication service (prepared for self-hosted auth)
- No cloud storage integration (file storage not implemented)
- No external notification services (toast notifications only)
- No analytics or monitoring services in current implementation
- Prepared for PostgreSQL migration but currently using in-memory storage

## Replit Environment Setup (October 3, 2025)

**Project Import & Configuration:**
- Successfully imported from GitHub as a fresh clone
- Configured for Replit environment with all necessary setup
- Frontend workflow configured to run on port 5000 with webview output
- Development server properly configured to bind to `0.0.0.0:5000`
- Vite configuration includes `allowedHosts: true` for Replit proxy compatibility
- All npm dependencies installed and verified

**Deployment Configuration:**
- Deployment target: `autoscale` (stateless frontend application)
- Build command: `npm run build`
- Start command: `npm run start`
- Production-ready setup for Replit deployments

**Development Workflow:**
- Workflow name: "Start application"
- Command: `npm run dev`
- Port: 5000 (webview mode)
- Hot module replacement (HMR) enabled via Vite
- Application serves both frontend and backend on same port

**Google Sheets Integration:**
- Uses Replit's Google Sheets connector (google-sheet==1.0.0)
- Authenticated via REPL_IDENTITY/WEB_REPL_RENEWAL tokens
- Spreadsheet ID configured in server/googleSheets.ts
- Automatic OAuth token management with expiry handling

**Testing Credentials:**
- Admin: `admin / admin123`
- User: `user / user123`
