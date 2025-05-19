import { User } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { Response } from 'express';
import httpStatus from 'http-status';
import config from '../../../config';
import QueryBuilder from '../../builder/QueryBuilder';
import AppError from '../../errors/AppError';
import { verification } from '../../errors/helpers/generateEmailVerificationLink';
import prisma from '../../utils/prisma';
import Email from '../../utils/sendMail';
import {
  failedEmailVerificationHTML,
  successEmailVerificationHTML,
} from './user.constant';
import { IUser } from './user.interface';

interface UserWithOptionalPassword extends Omit<User, 'password'> {
  password?: string;
}

const registerUserIntoDB = async (payload: IUser|any) => {

   const isUserExist = await prisma.user.findFirst({
    where: {email:payload.email

    },
  });



  if(isUserExist){

        throw new AppError(httpStatus.NOT_ACCEPTABLE, 'The email is already exist!');

  }

  const hashedPassword: string = await bcrypt.hash(payload.password, 12);
  const userData = {
    ...payload,
    password: hashedPassword,
  };
  const newUser = await prisma.user.create({
    data: {
      ...userData,
    },
  });

  // await resendUserVerificationEmail(newUser.email);
  const userWithOptionalPassword = newUser as UserWithOptionalPassword;
  delete userWithOptionalPassword.password;

  return userWithOptionalPassword;
};



const getAllUsersFromDB = async (query: any) => {
  const usersQuery = new QueryBuilder(prisma.user, query);
  const result = await usersQuery
    .search(['firstName', 'lastName', 'email'])
    .filter()
    .sort()
    .paginate()
    .execute();
  const pagination = await usersQuery.countTotal();

  return {
    meta: pagination,
    result,
  };
};

const updateUserFromDB = async (id: string, payload: IUser | any) => {
  const updatedUser = await prisma.user.update({
    where: { id },
    data: payload,
  });

  return updatedUser;
};


const getMyProfileFromDB = async (id: string) => {
  const Profile = await prisma.user.findUniqueOrThrow({
    where: {
      id: id,
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      image: true,
      phoneNumber: true,
      dateOfBirth: true,
      gender: true,
      language: true,
      school: true,
      interests: true,
      university: true,
      instagram: true,
      role: true,
      status: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return Profile;
};

const getUserDetailsFromDB = async (id: string) => {
  const user = await prisma.user.findUniqueOrThrow({
    where: { id },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      image: true,
      phoneNumber: true,
      dateOfBirth: true,
      gender: true,
      language: true,
      school: true,
      interests: true,
      university: true,
      instagram: true,
      role: true,
      status: true,
      createdAt: true,
      updatedAt: true,
    },
  });
  return user;
};


// const updateMyProfileIntoDB = async (id: string, payload: any) => {
//   const userProfileData = payload.Profile;
//   delete payload.Profile;

//   const userData = payload;

//   // update user data
//   await prisma.$transaction(async (transactionClient: any) => {
//     // Update user data
//     const updatedUser = await transactionClient.user.update({
//       where: { id },
//       data: userData,
//     });

//     // Update user profile data
//     const updatedUserProfile = await transactionClient.Profile.update({
//       where: { userId: id },
//       data: userProfileData,
//     });

//     return { updatedUser, updatedUserProfile };
//   });

//   // Fetch and return the updated user including the profile
//   const updatedUser = await prisma.user.findUniqueOrThrow({
//     where: { id },
//   });

//   const userWithOptionalPassword = updatedUser as UserWithOptionalPassword;
//   delete userWithOptionalPassword.password;

//   return userWithOptionalPassword;
// };

const updateUserRoleStatusIntoDB = async (id: string, payload: any) => {
  const result = await prisma.user.update({
    where: {
      id: id,
    },
    data: payload,
  });
  return result;
};




const changePassword = async (user: any, payload: any) => {
  const userData = await prisma.user.findUniqueOrThrow({
    where: {
      email: user.email,
      status: 'ACTIVE',
    },
  });

  const isCorrectPassword: boolean = await bcrypt.compare(
    payload.oldPassword,
    userData.password,
  );

  if (!isCorrectPassword) {
    throw new Error('Password incorrect!');
  }

  const hashedPassword: string = await bcrypt.hash(payload.newPassword, 12);

  await prisma.user.update({
    where: {
      id: userData.id,
    },
    data: {
      password: hashedPassword,
    },
  });

  return {
    message: 'Password changed successfully!',
  };
};

const resendUserVerificationEmail = async (email: string) => {
  const [emailVerificationLink, hashedToken] =
    verification.generateEmailVerificationLink();

  const user = await prisma.user.update({
    where: { email: email },
    data: {
      emailVerificationToken: hashedToken,
      emailVerificationTokenExpires: new Date(Date.now() + 3600 * 1000),
    },
  });

  const emailSender = new Email(user);
  await emailSender.sendEmailVerificationLink(
    'Email verification link',
    emailVerificationLink,
  );
  return user;
};

const verifyUserEmail = async (res: Response, token: string) => {
  const hashedToken = verification.generateHashedToken(token);
  const user = await prisma.user.findFirst({
    where: {
      emailVerificationToken: hashedToken,
    },
  });

  if (!user) {
    // throw new AppError(
    //   httpStatus.BAD_REQUEST,
    //   'Invalid email verification token.',
    // );

    res.send(failedEmailVerificationHTML(config.base_url_client as string));
    return;
  }

  if (
    user &&
    user.emailVerificationTokenExpires &&
    user.emailVerificationTokenExpires < new Date(Date.now())
  ) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'Email verification token has expired. Please try resending the verification email again.',
    );
  }
  const updatedUser = await prisma.user.update({
    where: { id: user.id },
    data: {
      isEmailVerified: true,
      emailVerificationToken: null,
      emailVerificationTokenExpires: null,
    },
  });

  if (updatedUser.isEmailVerified) {
    res.send(successEmailVerificationHTML());
    return updatedUser;
  }

  return updatedUser;
};


// Generate OTP and send to user's email
const sendPasswordResetOtp = async (email: string) => {
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found with this email');
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP
  const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  await prisma.user.update({
    where: { email },
    data: {
      otp,
      otpExpiry,
    },
  });

  const emailSender = new Email(user);
  await emailSender.sendCustomEmail(
    'Your Password Reset OTP',
    `Your password reset code is <b>${otp}</b>. It will expire in 10 minutes.`,
  );

  return { message: 'OTP sent to your email address.' };
};

// Verify OTP and reset password
const verifyOtpAndResetPassword = async (
  email: string,
  otp: string,
  newPassword: string,
) => {
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user || user.otp !== otp) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Invalid OTP');
  }

  if (user.otpExpiry && user.otpExpiry < new Date()) {
    throw new AppError(httpStatus.BAD_REQUEST, 'OTP has expired');
  }

  const hashedPassword = await bcrypt.hash(newPassword, 12);

  await prisma.user.update({
    where: { email },
    data: {
      password: hashedPassword,
      otp: null,
      otpExpiry: null,
    },
  });

  return { message: 'Password reset successful' };
};

//  start  

const requestPasswordReset = async (email: string) => {
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'No user found with this email');
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP
  const otpExpiry = new Date(Date.now() + 60 * 1000); // 60 seconds validity

  await prisma.user.update({
    where: { email },
    data: {
      otp,
      otpExpiry,
    },
  });

  const emailSender = new Email(user);
  await emailSender.sendCustomEmail(
    'Your Password Reset Code',
    `Your 6-digit OTP is <b>${otp}</b>. It will expire in 60 seconds.`
  );

  // You can return a token or just a success message
  return { message: 'OTP sent to email', redirect: `https://sapo-frontend.vercel.app/otp/${email}` };
};
// ---------------------

const verifyOtp = async (email: string, otp: string) => {
  

  const user = await prisma.user.findUnique({ where: { email } });

  if (!user || user.otp !== otp) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Invalid or expired OTP');
  }

  if (user.otpExpiry && user.otpExpiry < new Date()) {
    throw new AppError(httpStatus.BAD_REQUEST, 'OTP has expired');
  }
  // Invalidate OTP immediately
  await prisma.user.update({
    where: { email },
    data: {
      otp: null,
      otpExpiry: null,
    },
  });

  return { message: 'OTP verified', redirect: `https://sapo-frontend.vercel.app/reset-password/${email}` };
};
// -------------------------------------

const resetPassword = async (email: string, newPassword: string) => {

  console.log(email,newPassword)
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  }

  const hashedPassword = await bcrypt.hash(newPassword, 12);

  await prisma.user.update({
    where: { email },
    data: {
      password: hashedPassword,
      otp: null,
      otpExpiry: null,
    },
  });

  return { message: 'Password reset successful. You can now log in.' };
};



// end

export const UserServices = {
  registerUserIntoDB,
  getAllUsersFromDB,
  getMyProfileFromDB,
  getUserDetailsFromDB,
  // updateMyProfileIntoDB,
  updateUserRoleStatusIntoDB,
  changePassword,
  resendUserVerificationEmail,
  verifyUserEmail,
  verifyOtpAndResetPassword,
  sendPasswordResetOtp,
  updateUserFromDB,
  requestPasswordReset,
  verifyOtp,
  resetPassword
};
