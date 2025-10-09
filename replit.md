# Legal Case Management System

## Overview
This project is a bilingual (Arabic/English) legal case management system built with React, designed to manage legal records, cases, and documentation. Its primary purpose is to provide role-based access control and an RTL (right-to-left) interface for Arabic legal contexts, with all data stored in and synced with Google Sheets. The system supports multi-sheet management, dynamic data fetching, advanced analytics, pagination for performance optimization, and Excel export functionality, aiming for an enterprise utility aesthetic with a focus on data clarity and speed.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
The frontend is built with React 18 and TypeScript, utilizing Wouter for routing, React Context API for authentication and sheet management, and TanStack Query for server state. UI components are built using shadcn/ui with Radix UI primitives, styled with Tailwind CSS to create a Material Design-inspired, RTL-first interface with a professional blue color scheme. Form handling is managed by React Hook Form with Zod validation, and data visualization is powered by Recharts. Key architectural decisions include a component-based structure, protected routes with role-based access, and a multi-sheet management system allowing dynamic switching between data sources.

### Backend Architecture
The application is frontend-only. It directly interacts with the Google Sheets API from the browser. There is no server-side code, and authentication is handled via localStorage.

### Data Storage
Google Sheets serves as the primary data storage. Each sheet configuration includes a Spreadsheet ID, a main sheet name for records, and an updates sheet name for change logs. The system supports multiple sheet configurations with dynamic switching and real-time data fetching via Google Sheets API v4.

### Authentication & Authorization
Authentication is handled via localStorage with predefined credentials (admin/admin123, user/user123). Authorization is role-based: Admins have full CRUD access and can edit all fields. Regular users have append-only editing capabilities for 37 specific fields, meaning they can add new data but cannot modify existing data. Protected routes enforce authentication and role requirements.

## External Dependencies

### Frontend Libraries
- `react`, `react-dom`: UI framework
- `wouter`: Lightweight routing
- `@tanstack/react-query`: Async state management
- `react-hook-form`: Form state management
- `zod`: Runtime type validation
- `@hookform/resolvers`: Zod integration for React Hook Form
- `recharts`: Chart and graph library for data visualization

### UI Component Libraries
- Radix UI: Accessible, unstyled components (Dialog, Dropdown, Popover, Toast, Select, etc.)
- `lucide-react`: Icon library

### Styling & Utilities
- `tailwindcss`: Utility-first CSS framework
- `class-variance-authority`: Component variant management
- `clsx`, `tailwind-merge`: Class name utilities

### Build & Development Tools
- `vite`: Frontend build tool and dev server
- `@vitejs/plugin-react`: React fast refresh support

### Date Handling
- `date-fns`: Date manipulation and formatting

### Data Export
- `xlsx` (SheetJS): Excel file generation and export functionality

### Performance Optimizations
- **Pagination**: Records and updates are paginated (10/25/50/100 items per page) for improved performance with large datasets
- **Debounced Search**: 300ms debounce on search inputs to reduce unnecessary re-renders and filtering operations
- **Memoization**: useMemo and useCallback hooks for optimized rendering and function references
- **Smart Filtering**: Filtered data is computed only when search term or records change

### Key Features (October 2025)
- **Enhanced Update Logs**: Update logs now include National ID alongside serial numbers for better record identification
- **Excel-like Column Filtering**: Advanced filtering system allowing users to filter records by any column with dropdown menus showing unique values
- **Bulk Selection & Editing**: Multi-select capability with checkboxes to select multiple records and apply bulk edits simultaneously
- **Smart Filter Management**: Combined column filters work alongside global search with clear visual indicators of active filters

### Key Integrations
- Google Sheets API v4: Primary data source for reading and writing.
- Google Apps Script: Used for specific write operations to Google Sheets.