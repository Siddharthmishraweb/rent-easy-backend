import { NotificationModel } from './Notification.Model.js'
import { NOTIFICATION_MESSAGES as MSG } from './Notification.Constant.js'

/**
 * @swagger
 * tags:
 *   name: Notifications
 *   description: User notification management endpoints
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Notification:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         userId:
 *           type: string
 *         title:
 *           type: string
 *         message:
 *           type: string
 *         type:
 *           type: string
 *           enum: [payment, agreement, property, system]
 *         isRead:
 *           type: boolean
 *         createdAt:
 *           type: string
 *           format: date-time
 *         data:
 *           type: object
 *           description: Additional data related to the notification
 */

/**
 * @swagger
 * /api/notifications/user/{userId}:
 *   get:
 *     summary: Get notifications for a user
 *     tags: [Notifications]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *         description: Items per page
 *       - in: query
 *         name: isRead
 *         schema:
 *           type: boolean
 *         description: Filter by read status
 *     responses:
 *       200:
 *         description: List of notifications
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Notification'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Can only view own notifications
 *       500:
 *         description: Server Error
 */
const getNotificationsByUser = async (req, res) => {
  try {
    const { userId, page, limit, isRead } = req.body
    const notifications = await NotificationModel.getNotificationsByUser(userId, { page, limit, isRead })
    return res.success(200, MSG.FETCHED, notifications)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

/**
 * @swagger
 * /api/notifications/user/{userId}/unread-count:
 *   get:
 *     summary: Get count of unread notifications
 *     tags: [Notifications]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: Unread notifications count
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 count:
 *                   type: integer
 *                   description: Number of unread notifications
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Can only check own notifications
 *       500:
 *         description: Server Error
 */
const getUnreadCount = async (req, res) => {
  try {
    const { userId } = req.params;
    const count = await NotificationModel.getUnreadCount(userId);
    return res.success(200, MSG.UNREAD_COUNT, { count });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

/**
 * @swagger
 * /api/notifications/mark-read:
 *   post:
 *     summary: Mark notifications as read
 *     tags: [Notifications]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *             properties:
 *               userId:
 *                 type: string
 *                 description: User ID
 *               notificationIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Array of notification IDs to mark as read. If empty, marks all as read.
 *     responses:
 *       200:
 *         description: Notifications marked as read
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 modifiedCount:
 *                   type: integer
 *                   description: Number of notifications updated
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Can only modify own notifications
 *       500:
 *         description: Server Error
 */
const markAsRead = async (req, res) => {
  try {
    const { userId, notificationIds } = req.body;
    const result = await NotificationModel.markAsRead(userId, notificationIds || []);
    return res.success(200, MSG.MARKED_READ, result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

const deleteNotification = async (req, res) => {
  try {
    const { notificationId } = req.body
    const deleted = await NotificationModel.deleteNotificationById(notificationId)
    if (!deleted) return res.status(404).json({ message: MSG.DELETED })
    return res.success(200, MSG.DELETED, deleted)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

const NotificationController = {
  getNotificationsByUser,
  getUnreadCount,
  markAsRead,
  deleteNotification
}
export default NotificationController
