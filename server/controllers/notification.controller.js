const notificationService = require('../services/notification.service');

class NotificationController {
  /**
   * Get all notifications for the logged-in user
   * GET /api/notifications?isRead=true/false (optional)
   */
  async getNotifications(req, res) {
    try {
      const userId = req.user.id;
      const { isRead } = req.query;

      console.log(`[${new Date().toISOString()}] Fetching notifications for user ${req.user.email}`);

      // Convert isRead query param to boolean if provided
      let isReadFilter = null;
      if (isRead === 'true') isReadFilter = true;
      if (isRead === 'false') isReadFilter = false;

      const notifications = await notificationService.getUserNotifications(userId, isReadFilter);

      res.status(200).json({
        message: 'Notifications retrieved successfully',
        notifications,
      });
    } catch (error) {
      console.error(`[${new Date().toISOString()}] Get notifications error:`, error);
      res.status(500).json({
        message: error.message || 'Failed to retrieve notifications',
      });
    }
  }

  /**
   * Get unread notification count
   * GET /api/notifications/unread-count
   */
  async getUnreadCount(req, res) {
    try {
      const userId = req.user.id;

      const count = await notificationService.getUnreadCount(userId);

      res.status(200).json({
        message: 'Unread count retrieved successfully',
        count,
      });
    } catch (error) {
      console.error(`[${new Date().toISOString()}] Get unread count error:`, error);
      res.status(500).json({
        message: error.message || 'Failed to retrieve unread count',
      });
    }
  }

  /**
   * Mark a notification as read
   * PATCH /api/notifications/:id/read
   */
  async markAsRead(req, res) {
    try {
      const userId = req.user.id;
      const notificationId = parseInt(req.params.id);

      console.log(`[${new Date().toISOString()}] Marking notification ${notificationId} as read for user ${req.user.email}`);

      const notification = await notificationService.markAsRead(notificationId, userId);

      res.status(200).json({
        message: 'Notification marked as read',
        notification,
      });
    } catch (error) {
      console.error(`[${new Date().toISOString()}] Mark as read error:`, error);
      res.status(error.message.includes('not found') ? 404 : 500).json({
        message: error.message || 'Failed to mark notification as read',
      });
    }
  }

  /**
   * Mark all notifications as read
   * PATCH /api/notifications/mark-all-read
   */
  async markAllAsRead(req, res) {
    try {
      const userId = req.user.id;

      console.log(`[${new Date().toISOString()}] Marking all notifications as read for user ${req.user.email}`);

      const result = await notificationService.markAllAsRead(userId);

      res.status(200).json({
        message: 'All notifications marked as read',
        count: result.count,
      });
    } catch (error) {
      console.error(`[${new Date().toISOString()}] Mark all as read error:`, error);
      res.status(500).json({
        message: error.message || 'Failed to mark all notifications as read',
      });
    }
  }

  /**
   * Delete a notification
   * DELETE /api/notifications/:id
   */
  async deleteNotification(req, res) {
    try {
      const userId = req.user.id;
      const notificationId = parseInt(req.params.id);

      console.log(`[${new Date().toISOString()}] Deleting notification ${notificationId} for user ${req.user.email}`);

      await notificationService.deleteNotification(notificationId, userId);

      res.status(200).json({
        message: 'Notification deleted successfully',
      });
    } catch (error) {
      console.error(`[${new Date().toISOString()}] Delete notification error:`, error);
      res.status(error.message.includes('not found') ? 404 : 500).json({
        message: error.message || 'Failed to delete notification',
      });
    }
  }

  /**
   * Delete all read notifications
   * DELETE /api/notifications/read
   */
  async deleteReadNotifications(req, res) {
    try {
      const userId = req.user.id;

      console.log(`[${new Date().toISOString()}] Deleting read notifications for user ${req.user.email}`);

      const result = await notificationService.deleteReadNotifications(userId);

      res.status(200).json({
        message: 'Read notifications deleted successfully',
        count: result.count,
      });
    } catch (error) {
      console.error(`[${new Date().toISOString()}] Delete read notifications error:`, error);
      res.status(500).json({
        message: error.message || 'Failed to delete read notifications',
      });
    }
  }
}

module.exports = new NotificationController();
