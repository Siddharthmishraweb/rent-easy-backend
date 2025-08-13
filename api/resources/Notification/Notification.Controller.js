import { NotificationModel } from './Notification.Model.js'
import { NOTIFICATION_MESSAGES as MSG } from './Notification.Constant.js'

const getNotificationsByUser = async (req, res) => {
  try {
    const { userId, page, limit, isRead } = req.body
    const notifications = await NotificationModel.getNotificationsByUser(userId, { page, limit, isRead })
    res.json({ message: MSG.FETCHED, data: notifications })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

const getUnreadCount = async (req, res) => {
  try {
    const { userId } = req.body
    const count = await NotificationModel.getUnreadCount(userId)
    res.json({ count })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

const markAsRead = async (req, res) => {
  try {
    const { userId, notificationIds } = req.body
    const result = await NotificationModel.markAsRead(userId, notificationIds || [])
    res.json({ message: MSG.MARKED_READ, result })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

const deleteNotification = async (req, res) => {
  try {
    const { notificationId } = req.body
    const deleted = await NotificationModel.deleteNotificationById(notificationId)
    if (!deleted) return res.status(404).json({ message: MSG.DELETED })
    res.json({ message: MSG.DELETED })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

export { getNotificationsByUser, getUnreadCount, markAsRead, deleteNotification }
