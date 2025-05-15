import express from 'express';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { UserControllers } from './user.controller';
import { UserValidations } from './user.validation';
const router = express.Router();

router.post(
  '/register',
  validateRequest(UserValidations.registerUser),
  UserControllers.registerUser,
);

router.post(
  '/resend-verification-email',
  UserControllers.resendUserVerificationEmail,
);

router.get('/', UserControllers.getAllUsers);

router.get('/me', auth(), UserControllers.getMyProfile);

router.put('/update',auth(), UserControllers.updateUser);
// router.put(
//   '/update-profile',
//   auth('USER', 'ADMIN'),
//   UserControllers.updateMyProfile,
// );
router.get('/verify-email/:token', UserControllers.verifyUserEmail);

router.put(
  '/update-user/:id',
  auth('ADMIN'),
  UserControllers.updateUserRoleStatus,
);

router.post(
  '/change-password',
  auth('USER', 'ADMIN'),
  UserControllers.changePassword,
);





// router.post('/reset-password/send-otp', UserControllers.sendResetOtp);
// router.post('/reset-password/verify-otp', UserControllers.resetPasswordWithOtp);



// strat
router.post('/reset-password/send-otp', UserControllers.requestPasswordReset);

// Step 2: Verify OTP
router.post('/reset-password/verify-otp', UserControllers.verifyOtp);

// Step 3: Reset password
router.post('/reset-password/update', UserControllers.resetPassword);


// end


export const UserRouters = router;
