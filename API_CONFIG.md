# API Configuration

## Current Configuration

The frontend is currently configured to use the production API at:
**https://avrek-calls.onrender.com**

## How to Change API Endpoint

### Option 1: Edit Configuration File
Edit `src/config/api.ts` and change the `CURRENT` value:

```typescript
export const API_CONFIG = {
  PRODUCTION: 'https://avrek-calls.onrender.com',
  DEVELOPMENT: 'http://localhost:3001',
  CURRENT: 'http://localhost:3001' // Change this line
};
```

### Option 2: Direct Edit
Edit `src/services/api.ts` and change the import:

```typescript
// For production
import { API_BASE_URL } from '../config/api';

// Or hardcode directly
const API_BASE_URL = 'https://avrek-calls.onrender.com';
```

## Available Endpoints

- **Production**: `https://avrek-calls.onrender.com`
- **Development**: `http://localhost:3001`

## After Making Changes

1. Save the file
2. Run `npm run build` to rebuild the frontend
3. Deploy the new build

## Notes

- The configuration is centralized in `src/config/api.ts`
- Both main and backup services use the same configuration
- Changes require a rebuild to take effect




