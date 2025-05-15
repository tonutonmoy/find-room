  export interface IUser {
  id: string;
  firstName: string;
  lastName: string;
  image:string
  surname?: string;
  email: string;
  password: string;
  role: 'USER' | 'SUPERADMIN';
  status: 'ACTIVE' | 'INACTIVE' | 'BLOCKED';
  otp?: string;
  otpExpiry?: Date;
  isEmailVerified: boolean;
  rememberMe?: boolean;
  emailVerificationToken?: string;
  emailVerificationTokenExpires?: Date;
  birthDate?: Date;
  gender?: 'MALE' | 'FEMALE' | 'OTHER' | 'MIXED' | 'ANY';
  languages?: string;
  school?: string;
  profilePicture?: string;
  biography?: string;
  aboutMe: string[];
  instagram?: string;
  phoneNumber?: string;
  createdAt: Date;
  updatedAt: Date;
  termsAndConditions?: boolean;

  // relations (can be IDs or full objects depending on use case)
  listings?: any[];
  requestsSent?: any[];
  roommates?: any[];
  savedListings?: any[];
  userInterests?: any[];
}
