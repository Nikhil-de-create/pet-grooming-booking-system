# PawPerfect - Pet Grooming Booking System

A full-stack web application for a pet grooming service that allows customers to book appointments online and administrators to manage those appointments.

## Features

### Customer-Facing Booking System
- Multi-step booking process with intuitive UI
- Service selection with pricing and duration details
- Date and time selection
- Pet and owner information collection
- Booking confirmation

### Admin Dashboard
- Secure login system for administrators
- View all appointments with filtering options
- Approve or cancel appointments
- View customer and pet details

## Tech Stack

### Frontend
- React.js with TypeScript
- Tailwind CSS for styling
- Shadcn UI components
- React Hook Form for form management
- TanStack Query for data fetching
- React Router for navigation

### Backend
- Node.js with Express.js
- PostgreSQL database (with in-memory option for development)
- Drizzle ORM for database operations
- Express sessions for authentication

## Getting Started

### Prerequisites
- Node.js (v14 or later)
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone https://github.com/your-username/pet-grooming-booking-system.git
cd pet-grooming-booking-system
```

2. Install dependencies
```bash
npm install
```

3. Start the development server
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5000`

## Usage

### Customer Booking Flow
1. Visit the homepage
2. Select a service
3. Choose a date and time
4. Enter pet and owner details
5. Submit booking and receive confirmation

### Admin Access
1. Navigate to `/admin/login`
2. Use the following credentials:
   - Email: admin@example.com
   - Password: password
3. Access the dashboard to manage appointments

## Project Structure

```
├── client/               # Frontend code
│   ├── src/
│   │   ├── components/   # Reusable UI components
│   │   ├── hooks/        # Custom React hooks
│   │   ├── lib/          # Utility functions and services
│   │   ├── pages/        # Page components
│   │   ├── App.tsx       # Main application component
│   │   └── main.tsx      # Entry point
│   └── index.html        # HTML template
├── server/               # Backend code
│   ├── types/            # TypeScript type definitions
│   ├── index.ts          # Server entry point
│   ├── routes.ts         # API routes
│   ├── storage.ts        # Data storage interface
│   └── vite.ts           # Vite configuration for server
├── shared/               # Shared code between frontend and backend
│   └── schema.ts         # Database schema and types
└── ... configuration files
```

## License

[MIT](LICENSE)

## Acknowledgments

- Built with [Replit](https://replit.com)
- UI components from [shadcn/ui](https://ui.shadcn.com/)