import { createClient } from '@base44/sdk';
// import { getAccessToken } from '@base44/sdk/utils/auth-utils';

// Create a client with authentication required
export const base44 = createClient({
  appId: "6882a5e945c2714d5c889959", 
  requiresAuth: true // Ensure authentication is required for all operations
});
