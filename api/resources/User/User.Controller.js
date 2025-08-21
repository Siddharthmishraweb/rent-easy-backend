import UserModel from './User.Model.js'
import { USER_MESSAGES } from './User.Constant.js' 

const registerUser = async (req, res) => {
  const data = await UserModel.registerUserService(req.body)
  return res.success(201, USER_MESSAGES.USER_CREATED, data)
}

const googleLogin = async (req, res) => {
  const { token } = req.body
  const data = await UserModel.googleLoginService(token)

  return res.success(201, USER_MESSAGES.GOOGLE_LOGIN, data)
}

const loginUser = async (req, res) => {
  const data = await UserModel.loginUserService(req.body)
  return res.success(200, USER_MESSAGES.USER_LOGIN, data)
}

const resetPassword = async (req, res) => {
  const data = await UserModel.resetPasswordService(req.body)
  return res.success(200, USER_MESSAGES.RESET_PASSWORD, data)
}

const verifyResetToken = async (req, res) => {
  const data = await UserModel.verifyResetTokenService(req.body)
  return res.success(200, USER_MESSAGES.VERIFY_RESET_TOKEN, data)
}

const updatePassword = async (req, res) => {
  const data = await UserModel.updatePasswordService(req.body)
  return res.success(200, USER_MESSAGES.UPDATE_PASSWORD, data)
}

const UserController = {
  registerUser,
  loginUser,
  googleLogin,
  resetPassword,
  verifyResetToken,
  updatePassword
}

export default UserController
