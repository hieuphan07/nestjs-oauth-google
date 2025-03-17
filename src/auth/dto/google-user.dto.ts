/**
 * Data transfer object for Google user profile
 */
export class GoogleUserDto {
  /**
   * Google account ID
   */
  googleId: string;
  
  /**
   * User email address
   */
  email: string;
  
  /**
   * User first name
   */
  firstName: string;
  
  /**
   * User last name
   */
  lastName: string;
  
  /**
   * User profile picture URL
   */
  picture?: string | null;
}