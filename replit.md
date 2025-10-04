# Legal Case Management System

## Overview

A bilingual (Arabic/English) legal case management system built with React and Google Sheets. The application provides role-based access control for managing legal records, cases, and documentation with a focus on Arabic legal context and RTL (right-to-left) interface design. All data is stored in and synced with Google Sheets.

## Recent Changes

### October 4, 2025 - Multi-Sheet Support & Advanced Analytics
**Major Features Added:**
- ✅ **Multi-Sheet Management System**: 
  - Added ability to manage and switch between multiple Google Sheets
  - Created `SheetsContext` for centralized sheet management
  - Sheet configurations stored in localStorage for persistence
  - Users can add, remove, and switch between different sheets
  - Each sheet can have its own spreadsheet ID and sheet names
  
- ✅ **Sheet Selector Component**:
  - Visual interface to select active sheet
  - Add new sheets with custom names and IDs
  - Remove sheets (minimum 1 sheet required)
  - Shows active sheet indicator with checkmark
  
- ✅ **Enhanced Analytics Page**:
  - Interactive bar charts for company distribution
  - Pie chart for litigation level breakdown
  - Horizontal bar chart for lawyer performance
  - Bar chart for governorate distribution
  - Advanced statistics cards showing:
    - Total records, companies, lawyers, and document value
    - Number of governorates and archive statuses
    - Average document value calculation
  - Uses Recharts library for professional data visualization
  
- ✅ **Updated All Pages**:
  - All pages now respect the active sheet selection
  - Records page fetches data from selected sheet
  - Analytics calculates stats from selected sheet
  - Updates history shows logs from selected sheet's UpdatesLog
  
**Technical Implementation:**
- Created `SheetsContext.tsx` for global sheet state management
- Updated `googleSheets.ts` to accept `SheetConfig` parameter
- Modified `useSheetRecords` hook to use active sheet from context
- Added `SheetSelector.tsx` component with dialog interface
- Integrated sheet selector into Navigation component
- Enhanced `AnalyticsPage.tsx` with Recharts visualizations
- All functions now support dynamic sheet selection

### October 4, 2025 - Updates History & Analytics Enhancement
**Major Features Added:**
- ✅ **Updates History Page**: Admin-only page to view all record modifications
- ✅ **Automatic Update Logging**: All changes are automatically saved to `UpdatesLog` sheet in Google Sheets
- ✅ **Analytics Page**: Fixed and enhanced analytics showing:
  - Total records count
  - Distribution by governorate
  - Distribution by lawyer
  - Total document value
- ✅ **Navigation Updates**: Added "سجل التعديلات" tab (admin-only)
- ✅ **Data Duplication Fix**: Resolved issue where existing data was being duplicated when adding new information
- ✅ **User Experience**: Regular users now start with empty form fields (append-only mode)

**Technical Implementation:**
- Created `UpdatesLog` sheet functionality in Google Sheets
- Modified `googleSheets.ts` to support multiple sheets (Sheet1 + UpdatesLog)
- Updated Google Apps Script to handle two actions: `updateRow` and `logUpdate`
- Enhanced `useSheetRecords` hook to log all changes with old/new values
- Added proper change tracking with username, timestamp, field name, and values

### October 4, 2025 - Complete Replit Environment Setup
**GitHub Import & Full Configuration:**
- Successfully imported fresh clone from GitHub repository
- Application configured as **frontend-only** (no backend required)
- Configured Google Sheets API credentials securely in Replit Secrets:
  - `VITE_GOOGLE_SHEETS_API_KEY`: API key for reading Google Sheets data
  - `VITE_GOOGLE_APPS_SCRIPT_URL`: Apps Script URL for updating sheet data
- Configured development workflow on port 5000 with webview output
- Deployment configuration set for autoscale:
  - Build command: `npm run build`
  - Run command: `npx serve -s dist/public`
- All npm dependencies installed successfully
- Application verified running with Vite dev server

**Architecture Details:**
- Direct Google Sheets API integration from frontend
- Authentication using localStorage (hardcoded users: admin/admin123, user/user123)
- Dynamic headers loaded from Google Sheet (first row)
- Vite development server with HMR enabled
- Ready for production deployment on Replit

### October 4, 2025 - Frontend-Only Conversion (Pre-Replit)
**Major Architecture Change:**
- Converted application to **frontend-only** (no backend)
- Removed all backend code (Express, server routes, etc.)
- Added `.env.example` with Google Sheets API key template
- Updated workflows to run Vite dev server only
- Ready for deployment on static hosting platforms

### October 2, 2025 - Google Sheets Integration
**Google Sheets Integration:**
- Integrated with Google Sheets as the primary data source
- All records are now fetched directly from Google Sheets spreadsheet
- Real-time data synchronization with 120-second cache for performance
- Spreadsheet ID: 1osNFfmWeDLb39IoAcylhxkMmxVoj0WTIAFxpkA1ghO4
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
  - React Context API for authentication and sheet management
  - TanStack Query (React Query) for server state management
- **UI Framework**: shadcn/ui components with Radix UI primitives
- **Styling**: Tailwind CSS with custom Material Design-inspired theme
- **Form Handling**: React Hook Form with Zod validation
- **Data Visualization**: Recharts for interactive charts and graphs

**Design System**:
- RTL-first design with Arabic fonts (Cairo, Tajawal via Google Fonts)
- Enterprise utility aesthetic prioritizing data clarity over aesthetics
- Professional blue color scheme (HSL 220 70% 45%) for trust and authority
- Light mode primary with dark mode support
- Responsive breakpoints using Tailwind's mobile-first approach

**Key Architectural Decisions**:
- Component-based architecture with separation of concerns
- Context providers for authentication and sheet management
- Protected routes with role-based access control (admin vs. user)
- Toast notifications for user feedback
- Reusable UI components following shadcn/ui patterns
- Conditional rendering of edit forms based on user role (append-only vs full edit)
- Multi-sheet support with dynamic switching between data sources

### Backend Architecture (REMOVED - Frontend Only)

**Previous Architecture**: The application previously used Node.js/Express backend but has been converted to frontend-only.

**Current Architecture**:
- Direct Google Sheets API calls from frontend
- No server-side code - all logic in browser
- localStorage-based authentication
- Google Sheets API key for data access
- Vercel/Netlify compatible static site

### Data Storage

**Primary Storage**: Google Sheets
- Each sheet configuration includes:
  - Spreadsheet ID
  - Main sheet name (for records)
  - Updates sheet name (for change logs)
- Support for multiple sheets with easy switching
- Real-time data fetching via Google Sheets API v4

**Database Schema (Legacy - not used)**:

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

### Authentication & Authorization

**Current Implementation**: localStorage-based authentication
- Admin user: `admin/admin123`
- Regular user: `user/user123`
- Role-based access control (admin, user)

**Authorization Model**:
- **Admins**: Full CRUD access to all records, can edit all fields (old and new data)
- **Regular Users**: 
  - Can edit any record (not restricted by creator)
  - Append-only editing: can add new data to existing fields but cannot modify old data
  - Limited to 37 editable fields defined in EDITABLE_FIELDS constant
  - New data is appended with newline separator
- Protected routes enforce authentication and role requirements

### External Dependencies

**Core Runtime Dependencies**:
- `@neondatabase/serverless`: Neon PostgreSQL serverless driver (legacy)
- `drizzle-orm`: Type-safe ORM with PostgreSQL dialect (legacy)
- `drizzle-zod`: Schema-to-Zod validation generator
- `express`: Web application framework (legacy)
- `express-session`: Session middleware for Express (legacy)

**Frontend Libraries**:
- `react` & `react-dom`: UI framework
- `wouter`: Lightweight routing
- `@tanstack/react-query`: Async state management
- `react-hook-form`: Form state management
- `zod`: Runtime type validation
- `@hookform/resolvers`: Zod integration for react-hook-form
- `recharts`: Chart and graph library for data visualization

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
- No external authentication service (localStorage-based auth)
- No cloud storage integration (file storage not implemented)
- No external notification services (toast notifications only)
- No analytics or monitoring services in current implementation
- Google Sheets as primary data source

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
- Uses direct Google Sheets API v4 calls from frontend
- API Key configured in environment variables
- Google Apps Script URL for write operations
- Spreadsheet ID configured in code
- Support for multiple sheets with dynamic switching

**Testing Credentials:**
- Admin: `admin / admin123`
- User: `user / user123`
