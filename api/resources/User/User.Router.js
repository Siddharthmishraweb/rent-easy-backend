import { express, configureRouter } from '../../helper/index.js'
import UserController from './User.Controller.js'

const {
  registerUser,
  loginUser,
  googleLogin,
  resetPassword,
  verifyResetToken,
  updatePassword
} = UserController

const config = {
  preMiddlewares: [],
  postMiddlewares: [],
  routesConfig: {
    googleLogin: {
      method: 'post',
      path: '/google-login',
      enabled: true,
      prePipeline: [],
      pipeline: [googleLogin]
    },
    registerUser: {
      method: 'post',
      path: '/register',
      enabled: true,
      prePipeline: [],
      pipeline: [registerUser]
    },
    loginUser: {
      method: 'post',
      path: '/login',
      enabled: true,
      prePipeline: [],
      pipeline: [loginUser]
    },
    resetPassword: {
      method: 'post',
      path: '/reset-password',
      enabled: true,
      prePipeline: [],
      pipeline: [resetPassword]
    },
    verifyResetToken: {
      method: 'post',
      path: '/verify-reset-token',
      enabled: true,
      prePipeline: [],
      pipeline: [verifyResetToken]
    },
    updatePassword: {
      method: 'post',
      path: '/update-password',
      enabled: true,
      prePipeline: [],
      pipeline: [updatePassword]
    }
  }
}

const UserRouter = configureRouter(express.Router(), config)

export default UserRouter

