import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

/**
 * Data transfer object for user login credentials
 */
export class LoginDto {
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsNotEmpty({ message: 'Email is required' })
  readonly email: string;

  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @IsNotEmpty({ message: 'Password is required' })
  readonly password: string;
}