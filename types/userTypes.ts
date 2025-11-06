export interface User {
  id?: string;
  fullName: string;
  email: string;
  password: string;

  confirmPassword?: string;
  phoneNumber?: string;
  location?: string;
  skills: string;
  role?: 'worker' | 'recruiter';

  createdAt?: string;
}

export interface currentUser {
  $id: string;
  accountId: string;
  [key: string]: any;
}

export type SignUpPayload = Pick<
  User,
  | 'fullName'
  | 'email'
  | 'password'
  | 'phoneNumber'
  | 'location'
  | 'role'
  | 'skills'
>;
export type SignUpVerificationPayload = Pick<User, 'phoneNumber' | 'location'>;
export type SignInPayload = Pick<User, 'email' | 'password'>;

export type UpdateUserPayload = Partial<
  Pick<User, 'fullName' | 'phoneNumber' | 'location' | 'email'>
>;
