import {
  registerUser,
  loginUser,
  googleLogin,
  resetPassword,
  verifyResetToken,
  updatePassword
} from './User.Controller.js'
import { express, expressAsync } from '../../helper/index.js'

const router = express.Router()
router.post('/google-login', googleLogin)
router.post('/register', expressAsync(registerUser))
router.post('/login', loginUser)
router.post('/reset-password', resetPassword)
router.post('/verify-reset-token', verifyResetToken)
router.post('/update-password', updatePassword)

export default router
