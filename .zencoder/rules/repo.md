---
description: Repository Information Overview
alwaysApply: true
---

# KingsHMS Repository Information

## Repository Summary
KingsHMS (Kings Hotel Management System) is a comprehensive hotel management platform. It features a React-based frontend, a Node.js/Express backend, and integrates with Firebase for cloud functions and Data Connect. The system supports multi-tenancy, room management, bookings, staff operations, and AI-powered guest assistance using Google Gemini.

## Repository Structure
The repository is organized into several key components, combining a traditional frontend/backend setup with Firebase cloud services.

### Main Repository Components
- **Frontend (Root/components/services)**: A React 19 application built with Vite and TypeScript.
- **Express Server (`server/`)**: A Node.js backend providing a RESTful API for MySQL database operations.
- **Firebase Functions (`functions/`)**: Cloud functions for serverless logic, using Genkit for AI features.
- **Data Connect (`dataconnect/`)**: Firebase Data Connect configuration using PostgreSQL (Cloud SQL).
- **Database (`database/`)**: SQL schema definitions and seeding scripts for the MySQL database.

---

## Projects

### KingsHMS Main Application (Frontend & API Server)
**Configuration File**: [./package.json](./package.json)

#### Language & Runtime
**Language**: TypeScript  
**Version**: Node.js (Runtime), TypeScript 5.8  
**Build System**: Vite 6  
**Package Manager**: npm

#### Dependencies
**Main Dependencies**:
- `react` (^19.2.3): UI Framework
- `express` (^5.2.1): API Server
- `firebase` (^12.8.0): Client-side Firebase SDK
- `mysql2` (^3.16.1): MySQL client
- `@google/genai` (^1.34.0): Google Gemini AI integration
- `lucide-react`: Icon library
- `recharts`: Dashboard visualizations

**Development Dependencies**:
- `vite`: Build tool
- `tsx`: TypeScript execution for scripts
- `concurrently`: Running server and client simultaneously
- `puppeteer`: Headless browser for testing

#### Build & Installation
```bash
# Install dependencies
npm install

# Run development environment (Client + Server)
npm run dev

# Build frontend for production
npm run build
```

#### Testing
**Framework**: Custom Browser/Node testing
**Test Location**: Root directory (`test-*.js`, `test-*.ts`) and [./public/test-runner.html](./public/test-runner.html)
**Naming Convention**: `test-*.js`, `test-*.ts`
**Configuration**: [./QUICK_START_TESTING.txt](./QUICK_START_TESTING.txt)

**Run Command**:
```bash
# Run authentication tests
npm test

# Run all tests via visual runner
# 1. npm run dev
# 2. Open http://localhost:3000/test-runner.html
```

### Firebase Functions
**Configuration File**: [./functions/package.json](./functions/package.json)

#### Language & Runtime
**Language**: TypeScript  
**Version**: Node.js 24  
**Build System**: tsc (TypeScript Compiler)  
**Package Manager**: npm

#### Dependencies
**Main Dependencies**:
- `firebase-functions` (^7.0.0): Firebase Functions SDK
- `firebase-admin` (^13.6.0): Admin SDK
- `genkit` (^1.28.0): AI framework integration
- `graphql`: GraphQL support

#### Build & Installation
```bash
# Navigate to functions directory
cd functions

# Install dependencies
npm install

# Build functions
npm run build

# Start local emulator
npm run serve
```

### Data Connect (Backend Service)
**Type**: Non-traditional repository component

#### Specification & Tools
**Type**: Firebase Data Connect
**Version**: v1
**Required Tools**: Firebase CLI

#### Key Resources
**Main Files**:
- [./dataconnect/dataconnect.yaml](./dataconnect/dataconnect.yaml): Main service configuration.
- [./dataconnect/schema/](./dataconnect/schema/): GraphQL schema definitions for PostgreSQL.

#### Usage & Operations
**Integration Points**:
Connects to a PostgreSQL instance on Google Cloud SQL (`kingshms-fdc`).
