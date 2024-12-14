# NestJS JWT Auth Template

## Authentication System Overview

The authentication system implements secure token-based authentication using 
JWT (JSON Web Tokens) with token rotation and chain tracking for enhanced security.

## Token Strategy

### Access Token
- Short-lived token (30 minutes)
- Used for API authentication
- Contains minimal payload (user ID, app ID, token ID)
- Stateless validation

### Refresh Token
- Longer-lived token (2 weeks)
- Single-use only (implements token rotation)
- Used to obtain new token pairs
- Enhances security through rotation pattern

### Token Chain
- Internal tracking mechanism
- Links all tokens from a single session
- Enables efficient token revocation
- Supports multi-device session management

## Authentication Flows

### Sign-in Process
1. User provides credentials
2. System validates credentials
3. System generates:
   - New chain ID (tracks session)
   - Access token (30min validity)
   - Refresh token (2 weeks validity)
4. Tokens are returned to client

### Token Refresh Process
1. Client uses refresh token to request new tokens
2. Previous refresh token is invalidated
3. New token pair is generated
4. Tokens remain in same chain for session tracking

### Sign-up Process
Follows the same token generation process as sign-in

### Sign-out Process
1. Client initiates logout
2. System revokes the entire token chain
3. All tokens in the chain become invalid
4. Affects only the current device/session

### Password Change/Reset
1. System revokes all token chains for the user
2. User is logged out from all devices
3. Optional: UI prompt to choose between:
   - Global logout (all devices)
   - Current device only logout

## Security Features
- Token rotation for refresh tokens
- Chain-based token tracking
- Efficient token revocation
- Device-specific session management
- Protection against token reuse
- Audit trail capabilities


## Scratch pad

user sign-in/sign-up
  -> create token pair
  -> start session chainid
  -> start token chainid
user refresh token
  -> create token pair
  -> revoke prev token chanid (*rotation*)
  -> start new token chainid
user sign-out
  -> revoke session chainid
user reset password
  -> revoke all session chainids

