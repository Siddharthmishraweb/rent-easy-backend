import jwt from 'jsonwebtoken'
import { userModel } from '../resources/User/User.Schema.js'

const JWT_SECRET = process.env.JWT_SECRET || 'secret_key'

export const authMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1]
    if (!token) throw new Error('No token provided')

    const decoded = jwt.verify(token, JWT_SECRET)
    const user = await userModel.findById(decoded.userId)
    if (!user) throw new Error('Invalid token')

    req.user = user
    next()
  } catch (err) {
    return res.fail(err.message, 401)
  }
}
