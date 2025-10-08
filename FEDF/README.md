# Campus Connect (React + Vite + TailwindCSS)

A centralized extracurricular management website with role-based access for Admin and Students.

## Tech
- React (Vite)
- TailwindCSS
- React Router v6
- Mock API (in-memory)

## Quick Start
```bash
npm install
npm run dev
```

Login with any of these mock users:
- admin: admin@hub.com / admin123 (role: admin)
- student: student@hub.com / student123 (role: student)

## Structure
- `src/contexts/AuthContext.jsx`: simple auth with roles
- `src/pages/`: Login + dashboards
- `src/components/`: Sidebar, Topbar, EventCard, NotificationsPanel
- `src/services/api.js`: mock data + conflict checking

## Features
- **Student Dashboard**: Explore events, view calendar, manage activities, certificates, and feedback
- **Admin Dashboard**: Manage events, clubs, calendar, approve/reject registrations, view reports and announcements
- **Registration Approval System**: Students register for events → Admin receives notification → Admin can approve or reject → Student gets notified of decision
- **Calendar View**: Both admin and students can view event calendar
- **Notifications**: Real-time notifications for registration status updates

## Notes
- All data is in-memory; replace `src/services/api.js` with real API later.
- Includes sample calendar widget and notifications system.
- Registration requests require admin approval before being confirmed.
