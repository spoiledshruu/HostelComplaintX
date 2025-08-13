# Hostel Complaint Management System

## Overview

A fully functional hostel complaint management system built with React, Express.js, and PostgreSQL. Successfully deployed with complete authentication, role-based access control, and comprehensive management features. The system provides dual interfaces: students can submit and track complaints while administrators have full management capabilities including user administration and complaint resolution workflows.

## Status: COMPLETED ✓
- Authentication system fully operational with admin and student roles
- Database with sample users and complaints populated
- Complete CRUD operations for complaints and user management
- Real-time dashboard updates and statistics tracking
- Responsive Material Design interface implemented

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript using Vite as the build tool
- **UI Library**: Shadcn/ui components built on Radix UI primitives for accessibility
- **Styling**: Tailwind CSS with custom design tokens and CSS variables
- **State Management**: TanStack React Query for server state management and caching
- **Routing**: Wouter for lightweight client-side routing
- **Form Handling**: React Hook Form with Zod validation for type-safe forms
- **Component Structure**: Modular component architecture with separate UI components, pages, and business logic

### Backend Architecture
- **Framework**: Express.js with TypeScript using ES modules
- **Authentication**: Passport.js with local strategy using scrypt for password hashing
- **Session Management**: Express sessions with PostgreSQL session store
- **API Design**: RESTful API with role-based middleware for access control
- **Database ORM**: Drizzle ORM for type-safe database operations
- **Validation**: Zod schemas shared between frontend and backend for consistent validation

### Data Storage Solutions
- **Primary Database**: PostgreSQL with Neon serverless hosting
- **Schema Design**: 
  - Users table with role-based access (student/admin)
  - Complaints table with categorization and status tracking
  - Relational design with foreign key constraints
- **Migration Management**: Drizzle Kit for database schema migrations
- **Session Storage**: PostgreSQL-based session store for user authentication

### Authentication and Authorization
- **Strategy**: Session-based authentication using Passport.js
- **Password Security**: Scrypt hashing with salt for secure password storage
- **Role-Based Access**: Middleware functions for student and admin route protection
- **Session Security**: Secure session configuration with PostgreSQL persistence

### Development and Deployment
- **Build System**: Vite for frontend bundling with esbuild for backend compilation
- **Development Tools**: Hot reload, runtime error overlay, and TypeScript checking
- **Path Resolution**: Absolute imports with custom path aliases for clean code organization
- **Environment Configuration**: Environment-based configuration for database and session secrets

## External Dependencies

### Core Framework Dependencies
- **React Ecosystem**: React 18, React DOM, React Hook Form with Zod resolvers
- **Backend Framework**: Express.js with TypeScript support (tsx for development)
- **Build Tools**: Vite with React plugin and esbuild for production builds

### Database and ORM
- **Database**: Neon PostgreSQL serverless with connection pooling
- **ORM**: Drizzle ORM with PostgreSQL dialect and Zod integration
- **Session Store**: connect-pg-simple for PostgreSQL session persistence

### UI and Styling
- **Component Library**: Comprehensive Radix UI primitive collection
- **Styling**: Tailwind CSS with PostCSS and Autoprefixer
- **Icons**: Lucide React for consistent iconography
- **Utility Libraries**: clsx and tailwind-merge for conditional styling

### Authentication and Security
- **Authentication**: Passport.js with local strategy
- **Password Hashing**: Node.js crypto module with scrypt
- **Session Management**: Express session with secure configuration

### Development Tools
- **Type Safety**: TypeScript with strict configuration
- **Validation**: Zod for runtime type checking and form validation
- **Date Handling**: date-fns for date formatting and manipulation
- **State Management**: TanStack React Query for server state caching