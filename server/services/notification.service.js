const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class NotificationService {
  /**
   * Create a new notification
   * @param {number} userId - User ID to receive notification
   * @param {string} type - NotificationType enum value
   * @param {string} title - Notification title
   * @param {string} message - Notification message
   * @param {number} relatedId - Optional ID of related entity
   * @param {string} relatedType - Optional type of related entity
   * @returns {Promise<Object>} Created notification
   */
  async createNotification(userId, type, title, message, relatedId = null, relatedType = null) {
    try {
      const notification = await prisma.notification.create({
        data: {
          userId,
          type,
          title,
          message,
          relatedId,
          relatedType,
          isRead: false,
        },
      });

      console.log(`[${new Date().toISOString()}] Notification created: ${type} for user ${userId}`);
      return notification;
    } catch (error) {
      console.error(`[${new Date().toISOString()}] Create notification error:`, error);
      throw error;
    }
  }

  /**
   * Get all notifications for a user
   * @param {number} userId - User ID
   * @param {boolean} isRead - Optional filter by read status
   * @returns {Promise<Array>} List of notifications
   */
  async getUserNotifications(userId, isRead = null) {
    try {
      const where = { userId };
      if (isRead !== null) {
        where.isRead = isRead;
      }

      const notifications = await prisma.notification.findMany({
        where,
        orderBy: {
          createdAt: 'desc',
        },
      });

      return notifications;
    } catch (error) {
      console.error(`[${new Date().toISOString()}] Get notifications error:`, error);
      throw error;
    }
  }

  /**
   * Mark a notification as read
   * @param {number} notificationId - Notification ID
   * @param {number} userId - User ID (for authorization)
   * @returns {Promise<Object>} Updated notification
   */
  async markAsRead(notificationId, userId) {
    try {
      // Verify notification belongs to user
      const notification = await prisma.notification.findFirst({
        where: {
          id: notificationId,
          userId,
        },
      });

      if (!notification) {
        throw new Error('Notification not found or access denied');
      }

      const updated = await prisma.notification.update({
        where: { id: notificationId },
        data: { isRead: true },
      });

      return updated;
    } catch (error) {
      console.error(`[${new Date().toISOString()}] Mark notification as read error:`, error);
      throw error;
    }
  }

  /**
   * Mark all notifications as read for a user
   * @param {number} userId - User ID
   * @returns {Promise<Object>} Update result
   */
  async markAllAsRead(userId) {
    try {
      const result = await prisma.notification.updateMany({
        where: {
          userId,
          isRead: false,
        },
        data: {
          isRead: true,
        },
      });

      console.log(`[${new Date().toISOString()}] Marked ${result.count} notifications as read for user ${userId}`);
      return result;
    } catch (error) {
      console.error(`[${new Date().toISOString()}] Mark all as read error:`, error);
      throw error;
    }
  }

  /**
   * Delete a notification
   * @param {number} notificationId - Notification ID
   * @param {number} userId - User ID (for authorization)
   * @returns {Promise<Object>} Deleted notification
   */
  async deleteNotification(notificationId, userId) {
    try {
      // Verify notification belongs to user
      const notification = await prisma.notification.findFirst({
        where: {
          id: notificationId,
          userId,
        },
      });

      if (!notification) {
        throw new Error('Notification not found or access denied');
      }

      const deleted = await prisma.notification.delete({
        where: { id: notificationId },
      });

      return deleted;
    } catch (error) {
      console.error(`[${new Date().toISOString()}] Delete notification error:`, error);
      throw error;
    }
  }

  /**
   * Get unread notification count for a user
   * @param {number} userId - User ID
   * @returns {Promise<number>} Count of unread notifications
   */
  async getUnreadCount(userId) {
    try {
      const count = await prisma.notification.count({
        where: {
          userId,
          isRead: false,
        },
      });

      return count;
    } catch (error) {
      console.error(`[${new Date().toISOString()}] Get unread count error:`, error);
      throw error;
    }
  }

  /**
   * Delete all read notifications for a user (cleanup)
   * @param {number} userId - User ID
   * @returns {Promise<Object>} Delete result
   */
  async deleteReadNotifications(userId) {
    try {
      const result = await prisma.notification.deleteMany({
        where: {
          userId,
          isRead: true,
        },
      });

      console.log(`[${new Date().toISOString()}] Deleted ${result.count} read notifications for user ${userId}`);
      return result;
    } catch (error) {
      console.error(`[${new Date().toISOString()}] Delete read notifications error:`, error);
      throw error;
    }
  }
}

module.exports = new NotificationService();
