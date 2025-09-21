export interface User {
  id?: string;
  fullName: string;
  email: string;
  password: string;

  confirmPassword?: string;
  phoneNumber?: string;
  location?: string;
  role?: 'worker' | 'recruiter';

  createdAt?: string;
}

export interface currentUser {
  $id: string;
  accountId: string;
  userRole: 'worker' | 'recruiter';
  [key: string]: any;
}

export type SignUpPayload = Pick<
  User,
  'fullName' | 'email' | 'password' | 'phoneNumber' | 'location' | 'role'
>;
export type SignUpVerificationPayload = Pick<User, 'phoneNumber' | 'location'>;
export type SignInPayload = Pick<User, 'phoneNumber' | 'password'>;

export type UpdateUserPayload = Partial<
  Pick<User, 'fullName' | 'phoneNumber' | 'location' | 'email'>
>;
