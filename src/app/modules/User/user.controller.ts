import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { UserServices } from './user.service';

const registerUser = catchAsync(async (req, res) => {
  const result = await UserServices.registerUserIntoDB(req.body);

  

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    message:
      'User registered successfully. Please check your email for the verification link.',
    data: result,
  });
});

const getAllUsers = catchAsync(async (req, res) => {
  const result = await UserServices.getAllUsersFromDB(req.query);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    message: 'Users Retrieve successfully',
    data: result,
  });
});


const updateUser = catchAsync(async (req, res) => {

  const result = await UserServices.updateUserFromDB(req.user.userId,req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'User updated  successfully',
    data: result,
  });
});
const resendUserVerificationEmail = catchAsync(async (req, res) => {
  const { email } = req.body;
  const result = await UserServices.resendUserVerificationEmail(email);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Verification email sent successfully',
    data: result,
  });
});

const verifyUserEmail = catchAsync(async (req, res) => {
  const { token } = req.params;
  const verifiedUser = await UserServices.verifyUserEmail(res, token);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'User verified successfully.',
    data: verifiedUser,
  });
});

const getMyProfile = catchAsync(async (req, res) => {
   
  const result = await UserServices.getMyProfileFromDB(req.user.userId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Profile retrieved successfully',
    data: result,
  });
});


// const updateMyProfile = catchAsync(async (req, res) => {
//   const id = req.user.id;
//   const result = await UserServices.updateMyProfileIntoDB(id, req.body);

//   sendResponse(res, {
//     statusCode: httpStatus.OK,
//     message: 'User profile updated successfully',
//     data: result,
//   });
// });

const updateUserRoleStatus = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await UserServices.updateUserRoleStatusIntoDB(id, req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'User updated successfully',
    data: result,
  });
});

const changePassword = catchAsync(async (req, res) => {
  const user = req.user;
  const result = await UserServices.changePassword(user, req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Password changed successfully',
    data: result,
  });
});



const sendResetOtp = catchAsync(async (req, res) => {
  const { email } = req.body;
  const result = await UserServices.sendPasswordResetOtp(email);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'OTP sent successfully to your email address.',
    data: result,
  });
});

const resetPasswordWithOtp = catchAsync(async (req, res) => {
  const { email, otp, newPassword } = req.body;
  const result = await UserServices.verifyOtpAndResetPassword(email, otp, newPassword);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Password reset successfully.',
    data: result,
  });
});



//  start

const requestPasswordReset = catchAsync(async (req, res) => {
  const { email } = req.body;
  const result = await UserServices.requestPasswordReset(email);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'OTP sent successfully to your email address.',
    data: result,
  });
});

// ----------
const verifyOtp = catchAsync(async (req, res) => {
  const { email, otp } = req.body;
  const result = await UserServices.verifyOtp(email, otp);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'OTP verified successfully.',
    data: result,
  });
});
// -----------------------
const resetPassword = catchAsync(async (req, res) => {
  const { email, newPassword } = req.body;
  const result = await UserServices.resetPassword(email, newPassword);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Password reset successfully.',
    data: result,
  });
});




// end


export const UserControllers = {
  registerUser,
  getAllUsers,
  getMyProfile,
  updateUser,
  // updateMyProfile,
  updateUserRoleStatus,
  changePassword,
  resendUserVerificationEmail,
  verifyUserEmail,
  sendResetOtp,
  resetPasswordWithOtp,
  requestPasswordReset,
  verifyOtp,
  resetPassword
};
