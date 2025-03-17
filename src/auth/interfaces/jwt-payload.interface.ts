/**
 * Interface for JWT payload structure
 */
export interface JwtPayload {
  /**
   * User ID (subject)
   */
  sub: string;
  
  /**
   * User email
   */
  email: string;
  
  /**
   * Token issued at timestamp (added by JWT library)
   */
  iat?: number;
  
  /**
   * Token expiration timestamp (added by JWT library)
   */
  exp?: number;
}