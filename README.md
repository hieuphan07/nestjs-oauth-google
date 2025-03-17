# NestJS Authentication with Google OAuth

A complete authentication system built with NestJS and TypeScript, featuring dual authentication methods: traditional email/password login and Google OAuth integration.

## Features

- **Dual Authentication Methods**:
  - Traditional email/password authentication
  - Google OAuth 2.0 integration
- **Security Features**:
  - JWT-based authentication
  - Password hashing with bcrypt
  - Rate limiting protection
  - Security headers with Helmet
  - Comprehensive validation
- **Clean Architecture**:
  - Proper separation of concerns
  - Dependency injection
  - Modular design
  - Error handling with custom filters
- **Developer Experience**:
  - TypeScript for type safety
  - Detailed logging
  - Environment-based configuration
  - Validation with class-validator

## Prerequisites

- Node.js (v16 or later)
- PostgreSQL database
- Google Developer Account (for OAuth configuration)

## Installation

```bash
# Clone the repository
git clone https://github.com/hieuphan07/nestjs-oauth-google.git
cd nestjs-oauth-google

# Install dependencies
npm install
```

## Configuration

1. **Environment Setup**

Copy the example environment file and update it with your settings:

```bash
cp .env.example .env
```

Edit the `.env` file with your database credentials, JWT secret, and Google OAuth details.

2. **Google OAuth Setup**

   - Go to the [Google Developer Console](https://console.developers.google.com/)
   - Create a new project
   - Navigate to "Credentials" and create an OAuth 2.0 Client ID
   - Configure the consent screen with necessary permissions
   - Add authorized redirect URIs:
     - For development: `http://localhost:3000/api/auth/google/callback`
     - Add your production callback URL if deploying
   - Copy the Client ID and Client Secret to your `.env` file

## Running the Application

```bash
# Development mode
npm run start:dev

# Production build
npm run build

# Production mode
npm run start:prod
```

## Database Setup

The application uses TypeORM with PostgreSQL. Make sure you have PostgreSQL installed and running, then configure your connection details in the `.env` file.

The application will automatically create the necessary tables when it starts (via TypeORM's synchronize option in development mode).

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register a new user
  - Body: `{ "email": "user@example.com", "password": "Password123", "firstName": "John", "lastName": "Doe" }`

- `POST /api/auth/login` - Login with email and password
  - Body: `{ "email": "user@example.com", "password": "Password123" }`

- `GET /api/auth/google` - Initiate Google OAuth login
  - Redirects to Google authentication page

- `GET /api/auth/google/callback` - Google OAuth callback (internal use)
  - Handles the OAuth response from Google

- `GET /api/auth/profile` - Get current user profile (protected route)
  - Requires authentication via JWT token

## Authentication Flow

### Manual Login Flow

1. Register a user via `POST /api/auth/register`
2. Login with credentials via `POST /api/auth/login`
3. Store the returned JWT token
4. For authenticated requests, include the token in the Authorization header:
   ```
   Authorization: Bearer your_jwt_token_here
   ```

### Google OAuth Flow

1. Redirect the user to `GET /api/auth/google`
2. User completes Google authentication
3. Google redirects back to your callback URL with authorization code
4. The server exchanges the code for tokens and creates/updates the user record
5. User is redirected to the frontend with JWT token
6. Use the JWT token for authenticated requests as in the manual flow

## Project Structure

```
src/
├── auth/                  # Authentication module
│   ├── controllers/       # API endpoints
│   ├── dto/               # Data transfer objects
│   ├── guards/            # Authentication guards
│   ├── strategies/        # Passport strategies
│   ├── decorators/        # Custom decorators
│   ├── interfaces/        # TypeScript interfaces
│   └── services/          # Business logic
├── users/                 # Users module
│   └── entities/          # Database entities
├── common/                # Shared components
│   ├── filters/           # Exception filters
│   ├── interceptors/      # Request/response interceptors
│   └── services/          # Common services (logging, etc.)
├── app.module.ts          # Main application module
└── main.ts                # Application entry point
```

## Setting Up the Project

1. **Initial Setup**
   ```bash
   # Install NestJS CLI
   npm i -g @nestjs/cli
   
   # Create a new NestJS project
   nest new nestjs-oauth-google
   cd nestjs-oauth-google
   
   # Install required dependencies
   npm install --save @nestjs/passport passport passport-local passport-jwt passport-google-oauth20 @nestjs/jwt @nestjs/config @nestjs/typeorm typeorm pg bcrypt class-transformer class-validator helmet compression
   
   # Install dev dependencies
   npm install --save-dev @types/passport-local @types/passport-jwt @types/passport-google-oauth20 @types/bcrypt @types/compression
   ```

2. **Create Required Folders**
   ```bash
   # Create folder structure
   mkdir -p src/auth/{controllers,dto,guards,strategies,decorators,interfaces,services}
   mkdir -p src/users/entities
   mkdir -p src/common/{filters,interceptors,services}
   ```

3. **Configure Environment**
   ```bash
   # Create environment file
   cp .env.example .env
   ```

4. **Start Development**
   ```bash
   # Start development server
   npm run start:dev
   ```

## Security Considerations

- The JWT secret should be a strong, unique value in production
- Enable HTTPS in production
- Consider adding additional security measures like CSRF protection
- Review and adjust the rate limiting settings based on your needs
- Implement email verification for new user registrations

## License

This project is licensed under the MIT License - see the LICENSE file for details.
