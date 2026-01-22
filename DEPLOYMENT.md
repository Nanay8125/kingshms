# KingsHMS Deployment Guide

This guide details the steps to deploy the KingsHMS application to a production environment.

## Prerequisites

- **Node.js**: Version 18.0.0 or higher.
- **MySQL**: Version 8.0 or higher.
- **npm**: Version 9.0.0 or higher.

## Environment Configuration

1. Copy the `.env.example` file to `.env` (or create it manually).
2. Configure the following variables:

```env
# Server Configuration
PORT=3001
NODE_ENV=production

# Database Configuration
DB_HOST=localhost
DB_USER=kingshms_user
DB_PASSWORD=your_secure_password
DB_NAME=kingshms

# Security
JWT_SECRET=your_long_random_secret_string
CORS_ORIGIN=https://your-domain.com
```

## Installation & Setup

1. **Clone the repository:**

    ```bash
    git clone https://github.com/your-repo/kingshms.git
    cd kingshms
    ```

2. **Install dependencies:**

    ```bash
    npm install
    ```

3. **Database Initialization:**
    - Log in to your MySQL server.
    - Run the schema script to create tables:

      ```bash
      mysql -u root -p < database/schema.sql
      ```

    - (Optional) Seed initial data:

      ```bash
      npx tsx database/seed.ts
      ```

## Build & Run

1. **Build the Frontend:**
    This compiles the React application into static files in the `dist` directory.

    ```bash
    npm run build
    ```

2. **Start the Backend Server:**
    The server will serve the API *and* the static frontend files (if configured) or you can serve `dist` separately using Nginx/Apache.

    ```bash
    npm run server
    ```

    *Note: The current `server/index.ts` is configured to run the API. Ensure your web server points to the correct build output or that the backend is configured to serve static files from `dist`.*

## Troubleshooting

- **Database Connection Refused**: Check `DB_HOST` and credentials in `.env`. Ensure MySQL is running.
- **CORS Errors**: Update `CORS_ORIGIN` in `.env` to match your frontend domain.
- **Build Fails**: Ensure all peer dependencies are installed and Node.js version is compatible.

## Production Checklist

- [ ] `NODE_ENV` set to `production`
- [ ] Strong `JWT_SECRET` generated
- [ ] Database user has restricted permissions (not root)
- [ ] SSH/SSL certificates configured for the domain
