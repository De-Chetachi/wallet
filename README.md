# Demo-Credit Wallet API System

![wallet schema - architecture](wallet_1.png)


A comprehensive RESTful wallet API system built with Node.js, Express, and TypeScript that provides complete user management, account operations, and transaction processing with robust authentication and validation.

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [API Endpoints](#api-endpoints)
- [Controllers](#controllers)
- [Routes](#routes)
- [Middleware](#middleware)
- [Error Handling](#error-handling)
- [Authentication](#authentication)
- [Usage Examples](#usage-examples)
- [Testing](#testing)
- [Deployment](#deployment)

## Features

### Core Features

- **User Management**: Registration, and login
- **Account Operations**: Account creation and retrieval
- **Transaction Processing**: Deposits, withdrawals, and transfers with real-time balance updates
- **Authentication**: JWT-based authentication with session management
- **Validation**: Comprehensive input validation and sanitization
- **External Integration**: Lendsqr Karma API for user verification
- **Error Handling**: Structured error responses with proper HTTP status codes

### Security Features

- Password hashing with bcrypt
- JWT token authentication
- Session management with cookie-session
- Input validation and sanitization
- External user verification (Karma API)

### Database Features

- Knex.js ORM for database operations
- Migration support
- Connection pooling
- Environment-based configuration

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: SQL database with Knex.js ORM
- **Authentication**: JWT (JSON Web Tokens)
- **Session Management**: cookie-session
- **Validation**: express-validator
- **Password Security**: bcrypt
- **External APIs**: Lendsqr Karma API
- **UUID**: UUID v4 for unique identifiers

## Project Structure

```
banking-wallet-api/
├── src/
│   ├── models/
│   │   ├── account.ts              # Account model with banking operations
│   │   ├── user.ts                 # User model with authentication
│   │   └── transaction.ts          # Transaction and Transfer models
│   ├── controllers/
│   │   ├── account.ts              # Account management endpoints
│   │   ├── user.ts                 # User authentication endpoints
│   │   └── transaction.ts          # Transaction processing endpoints
│   ├── routes/
│   │   ├── account.ts              # Account route definitions
│   │   ├── user.ts                 # User route definitions
│   │   └── transaction.ts          # Transaction route definitions
│   ├── middlewares/
│   │   ├── current_user.ts         # JWT token verification
│   │   ├── require_auth.ts         # Authentication requirement
│   │   ├── karma.ts                # External karma verification
│   │   ├── error_handler.ts        # Global error handling
│   │   └── validation_handler.ts   # Input validation processing
│   ├── errors/
│   │   ├── custom_error.ts         # Base custom error class
│   │   ├── authorization_error.ts  # 401 unauthorized errors
│   │   ├── badrequest_error.ts     # 400 bad request errors
│   │   ├── notfound_error.ts       # 404 not found errors
│   │   ├── karma_error.ts          # 403 karma verification errors
│   │   └── validation_error.ts     # Input validation errors
│   ├── utils/
│   │   ├── jwt.ts                  # JWT utility functions
│   │   └── password.ts             # Password hashing utilities
│   ├── knex_db/
│   │   └── knexfile.ts             # Database configuration
│   ├── app.ts                      # Express application setup
│   ├── server.ts                   # Server startup and database connection
│   └── knex.ts                     # Database client configuration
├── migrations/                     # Database migrations
├── package.json
├── tsconfig.json
└── README.md
```

## Installation

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- MySQL database
- Git

### Step-by-Step Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd banking-wallet-api
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Required dependencies**
   ```bash
   # Core dependencies
   npm install 
4. **Set up TypeScript configuration**
   ```bash
   npx tsc --init
   ```

## Environment Variables

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=banking_wallet
DB_USER=your_db_user
DB_PASSWORD=your_db_password

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_here

# Application Configuration
NODE_ENV=development
PORT=3000

# External APIs
KARMA_API_URL=https://adjutor.lendsqr.com/v2/verification/karma
```


## API Endpoints

### Base URL
```
https://chetachi-lendsqr-be-test.up.railway.app/api/wallet

note always use https, to prevent redirection to https which might also lead to change of request method to get
```

### Authentication Endpoints
#### Register User
```http
POST https://chetachi-lendsqr-be-test.up.railway.app/api/wallet/users
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepassword123"
}

Response:
{
  "message": "User created successfully",
  "object": {
    "id": "uuid",
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

#### Login User
```http
POST https://chetachi-lendsqr-be-test.up.railway.app/api/wallet/users/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "securepassword123"
}

Response:
{
  "message": "User logged in successfully",
  "object": {
    "id": "uuid",
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

### Account Endpoints

#### Get User Account
```http
GET https://chetachi-lendsqr-be-test.up.railway.app/api/wallet/accounts
Authorization: Bearer <token>

Response:
{
  "message": "Account fetched successfully",
  "object": {
    "id": "account-uuid",
    "user": "user-uuid",
    "account_number": "1234567890",
    "balance": 1000.00,
    "currency": "#"
  }
}
```

#### Create Account
```http
POST https://chetachi-lendsqr-be-test.up.railway.app/api/wallet/accounts
Authorization: Bearer <token>

Response:
{
  "message": "Account created successfully",
  "object": {
    "id": "account-uuid",
    "user": "user-uuid",
    "account_number": "1234567890",
    "balance": 0.00,
    "currency": "#"
  }
}
```

### Transaction Endpoints

#### Get All Transactions
```http
GET https://chetachi-lendsqr-be-test.up.railway.app/api/wallet/transactions
Authorization: Bearer <token>

Response:
{
  "message": "transactions retrieved",
  "object": [
    {
      "id": "transaction-uuid",
      "account": "account-uuid",
      "type": "DEPOSIT",
      "amount": 1000.00,
      "status": "COMPLETED",
      "created_at": "2023-01-01T00:00:00Z"
    }
  ]
}
```

#### Get Transaction by ID
```http
GET https://chetachi-lendsqr-be-test.up.railway.app/api/wallet/transactions/:id
Authorization: Bearer <token>

Response:
{
  "message": "transaction retrieved",
  "object": {
    "id": "transaction-uuid",
    "account": "account-uuid",
    "type": "DEPOSIT",
    "amount": 1000.00,
    "status": "COMPLETED"
  }
}
```

#### Make Deposit
```http
POST https://chetachi-lendsqr-be-test.up.railway.app/api/wallet/transactions/deposit
Authorization: Bearer <token>
Content-Type: application/json

{
  "amount": 1000.00
}

Response:
{
  "message": "deposit successful",
  "object": {
    "id": "transaction-uuid",
    "account": "account-uuid",
    "type": "DEPOSIT",
    "amount": 1000.00,
    "status": "COMPLETED"
  }
}
```

#### Make Withdrawal
```http
POST https://chetachi-lendsqr-be-test.up.railway.app/api/wallet/transactions/withdraw
Authorization: Bearer <token>
Content-Type: application/json

{
  "amount": 500.00
}

Response:
{
  "message": "withdrawal successful",
  "object": {
    "id": "transaction-uuid",
    "account": "account-uuid",
    "type": "WITHDRAWAL",
    "amount": 500.00,
    "status": "COMPLETED"
  }
}
```

#### Transfer Money
```http
POST https://chetachi-lendsqr-be-test.up.railway.app/api/wallet/transactions/transfer
Authorization: Bearer <token>
Content-Type: application/json

{
  "amount": 250.00,
  "receiver": "1234567890"
}

Response:
{
  "message": "transfer successful",
  "object": {
    "id": "transaction-uuid",
    "account": "sender-account-uuid",
    "type": "TRANSFER",
    "amount": 250.00,
    "receiver": "receiver-account-uuid",
    "status": "COMPLETED"
  }
}
```

### UserController
Manages user operations:

**Features:**
- User registration with validation
- Duplicate email check
- Password hashing
- JWT token generation
- Session management

### AccountController
Manages account operations:


**Features:**
- Account creation for authenticated users
- Account retrieval with user validation
- Automatic account number generation

### TransactionController
Processes all financial transactions:
**Features:**
- Transaction history retrieval
- Real-time balance updates
- Transaction status management
- Transfer between accounts
- Comprehensive error handling

## Routes

### User Routes (`https://chetachi-lendsqr-be-test.up.railway.app/api/wallet/users`)


### Account Routes (`https://chetachi-lendsqr-be-test.up.railway.app/api/wallet/accounts`)


### Transaction Routes(`https://chetachi-lendsqr-be-test.up.railway.app/api/wallet/transactions`)


## Middleware

### Authentication Middleware

#### currentUser
```
    Extracts JWT token from session
    Verifies token and sets req.currentUser
```

#### requireAuth
```
    Ensures user is authenticated
    Throws AuthorizationError if not authenticated
```

### Validation Middleware

#### validationHandler
```
    Processes express-validator results
    Throws ValidationError for invalid inputs
```

#### karma
```
    Validates user against Lendsqr Karma API
    Skips validation in test environment
```

### Error Handling

#### errorHandler
```
    Global error handler
    Formats error responses consistently
```

## Error Handling

### Error Hierarchy
```typescript
// Base custom error class
export abstract class CustomError extends Error {
  abstract statusCode: number;
  abstract serializeErrors(): {message: string; field?: string}[];
}

// Specific error types
export class BadRequestError extends CustomError       // 400
export class AuthorizationError extends CustomError   // 401
export class KarmaError extends CustomError          // 403
export class NotFoundError extends CustomError       // 404
export class ValidationError extends CustomError     // 400
```

### Error Response Format
```json
{
  "errors": [
    {
      "message": "Error description",
      "field": "fieldName" // Optional for validation errors
    }
  ]
}
```

## Authentication

### Authentication Flow
1. User registers/logs in
2. System validates credentials
3. JWT token generated and stored in session
4. Protected routes verify token via middleware
5. User information attached to request object



## Usage Examples

### Complete User Journey

1. **Register a new user**
   ```bash
   curl -X POST https://chetachi-lendsqr-be-test.up.railway.app/api/wallet/users \
     -H "Content-Type: application/json" \
     -d '{
       "name": "John Doe",
       "email": "john@example.com",
       "password": "password123"
     }'
   ```

2. **Login user**
   ```bash
   curl -X POST https://chetachi-lendsqr-be-test.up.railway.app/api/wallet/users/login \
     -H "Content-Type: application/json" \
     -d '{
       "email": "john@example.com",
       "password": "password123"
     }'
   ```

3. **Create account**
   ```bash
   curl -X POST https://chetachi-lendsqr-be-test.up.railway.app/api/wallet/accounts \
     -H "Authorization: Bearer <your-token>" \
     -b "session=<session-cookie>"
   ```

4. **Make deposit**
   ```bash
   curl -X POST https://chetachi-lendsqr-be-test.up.railway.app/api/wallet/transactions/deposit \
     -H "Authorization: Bearer <your-token>" \
     -H "Content-Type: application/json" \
     -b "session=<session-cookie>" \
     -d '{"amount": 1000}'
   ```

5. **Transfer money**
   ```bash
   curl -X POST https://chetachi-lendsqr-be-test.up.railway.app/api/wallet/transactions/transfer \
     -H "Authorization: Bearer <your-token>" \
     -H "Content-Type: application/json" \
     -b "session=<session-cookie>" \
     -d '{
       "amount": 250,
       "receiver": "1234567890"
     }'
   ```

### Error Handling Examples

**Invalid credentials:**
```json
{
  "errors": [
    {
      "message": "invalid credentials"
    }
  ]
}
```

**Validation error:**
```json
{
  "errors": [
    {
      "message": "email must be valid",
      "field": "email"
    },
    {
      "message": "password must be at least 8 characters long",
      "field": "password"
    }
  ]
}
```

## Testing


### Run Tests
```bash
npm run test
```



```
## Security Best Practices

1. **Password Security**
   - Passwords hashed with bcrypt (10 rounds)
   - Minimum password length: 8 characters
   - No plain text password storage

2. **Authentication**
   - JWT tokens with expiration
   - Session-based token storage
   - Protected routes with middleware

3. **Input Validation**
   - express-validator for all inputs
   - Email format validation
   - Required field validation

4. **Error Handling**
   - No sensitive data in error messages
   - Consistent error response format
   - Proper HTTP status codes

5. **External Verification**
   - Karma API integration for user validation
   - Environment-based configuration

```

## Deployment

### Environment Configuration
```bash
# Production environment variables
NODE_ENV=production
JWT_SECRET=super_secure_production_secret
DB_HOST=database_host
DB_USER=database_user
DB_NAME=database_name
DB_PASSWORD=user_password
KARMA_API_KEY=adjuter_api_key
```

### Build and Deploy
```bash
# Build TypeScript
npm run build

# Start production server
npm run dev


