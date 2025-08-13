import { express } from '../../helper/index.js'
import {
  getNotificationsByUser,
  getUnreadCount,
  markAsRead,
  deleteNotification
} from './Notification.Controller.js'
import { validateGetByUser, validateMarkRead } from './Notification.Validator.js'

const router = express.Router()

router.post('/list', validateGetByUser, getNotificationsByUser) // body: { userId, page, limit, isRead }
router.post('/unreadCount', validateGetByUser, getUnreadCount)
router.put('/markRead', validateMarkRead, markAsRead) // body: { userId, notificationIds? }
router.delete('/delete', deleteNotification) // body: { notificationId }

export default router
