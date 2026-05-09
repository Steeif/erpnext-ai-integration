<img width="1450" height="948" alt="image" src="https://github.com/user-attachments/assets/4a0dea33-ee41-4afe-844b-743729bc4a33" />


# ERPNext AI Integration

## Overview

This is a secure web application that enables users to connect to their self-hosted ERPNext instances, verify user IDs, and retrieve user-specific data through a modern, elegant interface. The application prioritizes security, usability, and reliability.

## Features

### 1. Secure ERPNext Connection Configuration
- **Encrypted Credential Storage**: API keys and secrets are encrypted using AES-256-GCM before storage in the database
- **Connection Verification**: Tests the connection before saving to ensure credentials are valid
- **Connection Status Display**: Shows the current connection status and last tested timestamp
- **Update Capability**: Users can update their connection credentials at any time

### 2. User ID Verification
- **Real-time Verification**: Verifies user IDs against the ERPNext instance
- **User Information Display**: Shows verified user details including name, email, type, and status
- **Error Handling**: Clear error messages for non-existent users or connection issues

### 3. Data Retrieval Interface
- **Dynamic DocType Selection**: Fetches available document types from ERPNext
- **Flexible Data Retrieval**: Supports querying various ERPNext document types (Users, Employees, Customers, etc.)
- **Structured Table Display**: Presents data in a clean, organized table format
- **Data Caching**: Implements 1-hour caching to reduce API calls and improve performance
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices

### 4. Security Features
- **Token-Based Authentication**: Uses ERPNext's token-based authentication (API Key + API Secret)
- **Encrypted Storage**: All credentials are encrypted at rest using AES-256-GCM
- **HTTPS Only**: All API calls to ERPNext use HTTPS
- **User Authentication**: OAuth integration ensures only authenticated users can access the application
- **Role-Based Access**: User roles are managed through the database

## Architecture

### Technology Stack
- **Frontend**: React 19 with TypeScript, Tailwind CSS 4, shadcn/ui components
- **Backend**: Express 4 with tRPC 11 for type-safe API procedures
- **Database**: MySQL with Drizzle ORM for type-safe queries
- **Authentication**: OAuth for user authentication
- **Encryption**: Node.js crypto module (AES-256-GCM)

### Project Structure

```
erpnext-integration/
├── client/
│   └── src/
│       ├── pages/
│       │   ├── Home.tsx              # Landing and main navigation
│       │   ├── ERPNextConfig.tsx      # Connection configuration form
│       │   └── DataRetrieval.tsx      # User verification and data retrieval
│       ├── components/               # Reusable UI components
│       ├── lib/trpc.ts              # tRPC client setup
│       └── App.tsx                  # Main app router
├── server/
│   ├── routers.ts                   # tRPC procedure definitions
│   ├── db.ts                        # Database query helpers
│   ├── erpnext.ts                   # ERPNext API client
│   ├── crypto.ts                    # Encryption utilities
│   └── _core/                       # Framework core (OAuth, context, etc.)
├── drizzle/
│   └── schema.ts                    # Database schema definitions
└── package.json
```

## Database Schema

### `users` Table
Stores authenticated user information from OAuth.

### `erpnext_connections` Table
Stores ERPNext connection credentials per user:
- `userId`: Reference to authenticated user
- `erpnextUrl`: Base URL of ERPNext instance
- `apiKey`: Encrypted API Key
- `apiSecret`: Encrypted API Secret
- `isActive`: Connection status flag
- `lastTestedAt`: Timestamp of last successful connection test

### `erpnext_data_cache` Table
Caches retrieved ERPNext data to reduce API calls:
- `connectionId`: Reference to ERPNext connection
- `userId`: Reference to authenticated user
- `verifiedUserId`: The ERPNext user ID that was verified
- `doctype`: Document type (e.g., "User", "Employee")
- `data`: JSON-encoded retrieved data
- `expiresAt`: Cache expiration timestamp (1 hour)

## API Endpoints

### tRPC Procedures

#### `erpnext.configureConnection`
**Type**: Mutation  
**Input**: `{ erpnextUrl: string, apiKey: string, apiSecret: string }`  
**Output**: `{ success: boolean, message: string }`  
**Description**: Configures a new ERPNext connection with automatic verification

#### `erpnext.getConnection`
**Type**: Query  
**Output**: `{ configured: boolean, erpnextUrl?: string, lastTestedAt?: Date }`  
**Description**: Retrieves current connection status (without exposing credentials)

#### `erpnext.verifyUserId`
**Type**: Mutation  
**Input**: `{ userId: string }`  
**Output**: `{ success: boolean, user?: ERPNextUser }`  
**Description**: Verifies a user ID exists in ERPNext and returns user details

#### `erpnext.getUserData`
**Type**: Query  
**Input**: `{ userId: string, doctype: string }`  
**Output**: `{ success: boolean, data?: unknown, cached?: boolean }`  
**Description**: Retrieves user-specific data from ERPNext (with caching)

#### `erpnext.getAvailableDoctypes`
**Type**: Query  
**Output**: `string[]`  
**Description**: Returns list of available document types for data retrieval

## Security Considerations

### Credential Encryption
Credentials are encrypted using AES-256-GCM:
- **Algorithm**: AES-256-GCM (authenticated encryption)
- **Key Management**: Uses `ENCRYPTION_KEY` environment variable (must be 64 hex characters)
- **Format**: `IV:AuthTag:EncryptedData` (all hex-encoded)
- **Decryption**: Only performed server-side when making API calls to ERPNext

### Best Practices Implemented
1. **Never expose credentials to frontend**: Credentials are stored server-side only
2. **HTTPS enforcement**: All external API calls use HTTPS
3. **Token-based auth**: Uses ERPNext's built-in token authentication
4. **Input validation**: All user inputs are validated with Zod schemas
5. **Error handling**: Sensitive error details are not exposed to frontend
6. **Session management**: OAuth handles user session security

## Getting Started

### Prerequisites
- Node.js 22.13.0 or later
- MySQL database
- Self-hosted ERPNext instance with API access enabled

### Setup Instructions

1. **Configure Environment Variables**
   ```bash
   # Required for encryption
   ENCRYPTION_KEY=<64-character-hex-string>
   
   # Database connection
   DATABASE_URL=mysql://user:password@localhost:3306/erpnext_integration
   
   # OAuth configuration 
   VITE_APP_ID=<your-app-id>
   OAUTH_SERVER_URL=<oauth-url>
   JWT_SECRET=<jwt-secret>
   ```

2. **Install Dependencies**
   ```bash
   pnpm install
   ```

3. **Run Database Migrations**
   ```bash
   pnpm drizzle-kit migrate
   ```

4. **Start Development Server**
   ```bash
   pnpm dev
   ```

5. **Build for Production**
   ```bash
   pnpm build
   pnpm start
   ```

## Usage Guide

### Step 1: Configure ERPNext Connection
1. Sign in with your account
2. Click "Configure Connection"
3. Enter your ERPNext instance URL (e.g., `https://erpnext.example.com`)
4. Enter your API Key and API Secret (generated in ERPNext User settings)
5. Click "Configure Connection" - the system will verify the credentials

### Step 2: Verify User ID
1. Click "Retrieve Data"
2. Enter the ERPNext user ID (email or username)
3. Click "Verify User"
4. The system will display the verified user's information

### Step 3: Retrieve Data
1. Select a document type from the dropdown (User, Employee, Customer, etc.)
2. The system will fetch and display the user's associated data
3. Data is cached for 1 hour to improve performance

## Testing

### Run Tests
```bash
pnpm test
```

### Test Coverage
- **Encryption**: Verify encrypt/decrypt functionality with various inputs
- **Authentication**: Test connection verification with valid/invalid credentials
- **Error Handling**: Verify proper error messages for edge cases

## Troubleshooting

### Connection Failed
- Verify ERPNext URL is accessible from your network
- Check API Key and API Secret are correct
- Ensure the user has API access enabled in ERPNext
- Verify HTTPS certificate is valid (if using self-signed, may need configuration)

### User Not Found
- Verify the user ID is correct (case-sensitive in ERPNext)
- Ensure the user exists in ERPNext
- Check user permissions in ERPNext

### Data Not Displaying
- Verify the user has access to the selected document type in ERPNext
- Check if the document type is available in your ERPNext instance
- Try clearing browser cache and refreshing

## Performance Optimization

### Data Caching
- Retrieved data is cached for 1 hour
- Cache is stored in the database for persistence across sessions
- Cache is automatically invalidated after expiration

### API Rate Limiting
- Consider implementing rate limiting for ERPNext API calls
- Monitor API usage to avoid hitting ERPNext rate limits

## Future Enhancements

1. **Advanced Filtering**: Add custom filters for data retrieval
2. **Export Functionality**: Export retrieved data to CSV/Excel
3. **Audit Logging**: Log all data access for compliance
4. **Multi-Instance Support**: Support multiple ERPNext instances per user
5. **Webhooks**: Real-time data synchronization with ERPNext
6. **API Documentation**: Auto-generated API documentation

## Support & Maintenance

### Monitoring
- Monitor database performance, especially the cache table
- Track API response times to ERPNext
- Monitor encryption/decryption performance

### Updates
- Keep dependencies updated regularly
- Monitor ERPNext API changes
- Review security advisories

## Additional Resources

- [ERPNext REST API Documentation](https://docs.frappe.io/framework/user/en/api/rest)
- [Frappe Framework Documentation](https://docs.frappe.io)
- [tRPC Documentation](https://trpc.io)
- [React Documentation](https://react.dev)
