# Design Guidelines: Legal Case Management System

## Design Approach: Enterprise Utility System
**Selected Framework:** Material Design principles adapted for Arabic legal context
**Rationale:** Data-heavy legal application requiring clarity, professionalism, and efficient information processing. Prioritizes functionality over aesthetics while maintaining visual polish.

---

## Core Design Elements

### A. Color Palette

**Light Mode (Primary):**
- Primary: 220 70% 45% (Professional blue - trust and authority)
- Primary Hover: 220 70% 40%
- Background: 0 0% 98% (Soft white)
- Surface: 0 0% 100% (Pure white cards/tables)
- Border: 220 15% 90%
- Text Primary: 220 15% 20%
- Text Secondary: 220 10% 45%
- Success: 145 65% 45% (Completed cases)
- Warning: 35 90% 55% (Pending actions)
- Danger: 0 75% 50% (Urgent/Deletions)

**Dark Mode:**
- Background: 220 15% 10%
- Surface: 220 15% 15%
- Border: 220 10% 25%
- Text Primary: 0 0% 95%

### B. Typography
**Font Stack:** 'Cairo', 'Tajawal', system-ui, sans-serif (via Google Fonts CDN)
- **Headers:** font-bold, text-2xl to text-4xl
- **Body:** font-normal, text-base (16px)
- **Labels:** font-medium, text-sm
- **Table Data:** font-normal, text-sm
- **Direction:** RTL throughout with `dir="rtl"` on root

### C. Layout System
**Spacing Scale:** Use Tailwind units: 2, 4, 6, 8, 12, 16, 24
- Component padding: p-6 or p-8
- Section gaps: gap-6 or gap-8
- Card spacing: space-y-4
- Form field gaps: gap-4
- Table cell padding: px-4 py-3

**Container Strategy:**
- Login: max-w-md mx-auto (centered, 400px)
- Dashboard: max-w-7xl mx-auto px-6 (full-width content area)
- Forms: max-w-4xl mx-auto (optimal for multi-column forms)
- Tables: w-full with horizontal scroll on mobile

---

## Component Library

### 1. Authentication (Login.jsx)
**Layout:** Centered card on neutral background
- Card: white bg, rounded-lg, shadow-lg, p-8
- Logo/Title area: mb-8, text-center
- Form fields: space-y-4
- Input styling: border, rounded-md, px-4 py-2, focus:ring-2 focus:ring-primary
- Submit button: w-full, bg-primary, text-white, py-3, rounded-md, font-medium
- Error messages: text-danger, text-sm, mt-1

### 2. Dashboard Layout (Shared)
**Structure:**
- Top Navigation Bar: sticky top-0, bg-surface, shadow-sm, px-6 py-4
  - Right: Logo/Title
  - Left: User info + Logout button
- Main Content Area: py-8 px-6
  - Page Title: text-3xl font-bold mb-6
  - Action Bar: flex justify-between items-center mb-6
    - Left: "إضافة سجل جديد" button (Admin/User as applicable)
    - Right: Search/Filter controls
  - Data Table: bg-surface, rounded-lg, shadow, overflow-hidden

### 3. Data Tables
**Styling:**
- Header row: bg-gray-100 dark:bg-gray-800, font-semibold, text-right
- Data rows: border-b, hover:bg-gray-50, text-right
- Cell alignment: text-right for Arabic text
- Action column: text-center, min-width
- Action buttons: Inline icon buttons (تعديل/حذف) with text-primary and text-danger
- Responsive: Horizontal scroll on mobile with sticky first column
- Pagination: Bottom center, gap-2 between page numbers

### 4. Record Form (RecordForm.jsx)
**Layout:** Modal overlay or dedicated page with sidebar return
- Form container: max-w-4xl, bg-surface, rounded-lg, p-8
- Grid layout: grid-cols-1 md:grid-cols-2 gap-6 for field pairs
- Full-width fields: col-span-full for notes/descriptions
- Field groups: Visually separated with border-t pt-6 mt-6
  - Group 1: معلومات المحضر (نوع المحضر، تاريخ، رقم حصر)
  - Group 2: محكمة أول درجة
  - Group 3: المعارضة
  - Group 4: الاستئناف
  - Group 5: التصالح والمتابعة
  - Group 6: المحامون والمستخرجات

**Field Components:**
- Labels: block, font-medium, mb-2, text-right
- Text inputs: w-full, border, rounded-md, px-4 py-2
- Textareas: min-h-24 for notes fields
- Date inputs: Properly styled with calendar icon
- Select dropdowns: Native select with custom arrow
- Submit section: border-t pt-6 mt-8, buttons gap-4

### 5. Admin-Specific UI
- Delete confirmation modal: Overlay with warning icon, centered dialog
- Bulk actions toolbar: Appears when rows selected (checkbox column)
- Edit mode: Inline editing or modal form with pre-filled data
- User activity log: Collapsed accordion at bottom of page

---

## Interaction Patterns

### Navigation Flow
1. Login → Role detection → Redirect to appropriate dashboard
2. Dashboard → View records in table → Click row/edit → Form modal/page
3. Protected routes: Redirect to login if not authenticated, show 403 if User tries Admin page

### Form Validation
- Real-time validation on blur
- Required fields marked with red asterisk (*)
- Error messages appear below fields in red
- Success toast notification on save (top-left, 3s duration)

### Loading States
- Skeleton loaders for table rows during data fetch
- Button loading spinner with disabled state
- Form submission: Button shows "جاري الحفظ..." with spinner

### Responsive Behavior
- Mobile (<768px): Single column forms, hamburger menu for navigation
- Tablet (768-1024px): 2-column forms maintained
- Desktop (>1024px): Full layout with comfortable spacing

---

## Images
**No hero images required** - This is a utility application focused on data management. All visual elements should support functionality:
- User avatar placeholder in navigation (circle, bg-gray-300, initials)
- Empty state illustration when no records exist (simple SVG icon with text)
- Icons via Heroicons (CDN) for actions: PlusIcon, PencilIcon, TrashIcon, XMarkIcon, CheckIcon

---

## Accessibility & Arabic Support
- All text right-aligned
- Proper RTL layout flow (flexbox with flex-row-reverse where needed)
- ARIA labels in Arabic
- Keyboard navigation support (Tab order right-to-left)
- High contrast maintained (WCAG AA minimum)
- Focus indicators visible on all interactive elements

---

## Professional Polish
- Consistent shadows: shadow-sm for subtle depth, shadow-md for cards, shadow-lg for modals
- Smooth transitions: transition-colors duration-200 on hover states
- No distracting animations - only purposeful micro-interactions
- Print-friendly table styles (@media print)
- Toast notifications system for feedback (success/error/warning)

This design creates a professional, efficient legal case management interface that prioritizes usability and data clarity while maintaining visual consistency and Arabic language support throughout.