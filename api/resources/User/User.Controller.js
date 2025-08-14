import {
  registerUserService,
  loginUserService,
  googleLoginService,
  resetPasswordService,
  verifyResetTokenService,
  updatePasswordService,
} from './User.Model.js'

import { USER_MESSAGES } from './User.Constant.js' 

const registerUser = async (req, res) => {
  const data = await registerUserService(req.body)
  res.status(201).json({ message: USER_MESSAGES.USER_CREATED, data: data })
}

const googleLogin = async (req, res) => {
  const { token } = req.body
  const data = await googleLoginService(token)
  res.status(201).json({ message: USER_MESSAGES.GOOGLE_LOGIN, data: data })
}

const loginUser = async (req, res) => {
  const data = await loginUserService(req.body)
  res.status(200).json({ message: USER_MESSAGES.USER_LOGIN, data: data })
}


const resetPassword = async (req, res) => {
  const data = await resetPasswordService(req.body)
  res.status(200).json({ message: USER_MESSAGES.RESET_PASSWORD, data: data })
}

const verifyResetToken = async (req, res) => {
  const data = await verifyResetTokenService(req.body)
  res.status(200).json({ message: USER_MESSAGES.VERIFY_RESET_TOKEN, data: data })
}

const updatePassword = async (req, res) => {
  const data = await updatePasswordService(req.body)
  res.status(200).json({ message: USER_MESSAGES.UPDATE_PASSWORD, data: data })

  // return res.success(data)
}

export {
  registerUser,
  loginUser,
  googleLogin,
  resetPassword,
  verifyResetToken,
  updatePassword
}
