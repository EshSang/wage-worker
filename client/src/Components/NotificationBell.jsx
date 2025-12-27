import React, { useState, useEffect, useRef } from 'react';
import { Badge, Dropdown, ListGroup, Spinner } from 'react-bootstrap';
import { FaBell, FaCheck, FaTrash, FaBriefcase, FaStar, FaClipboard } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axios';
import { toast } from 'react-toastify';
import './NotificationBell.css';

export default function NotificationBell() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [show, setShow] = useState(false);
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  useEffect(() => {
    fetchUnreadCount();
    // Poll for new notifications every 30 seconds
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (show) {
      fetchNotifications();
    }
  }, [show]);

  const fetchUnreadCount = async () => {
    try {
      const response = await axiosInstance.get('/api/notifications/unread-count');
      setUnreadCount(response.data.count);
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/api/notifications');
      setNotifications(response.data.notifications || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setLoading(false);
    }
  };

  const handleNotificationClick = async (notification) => {
    try {
      // Mark as read
      if (!notification.isRead) {
        await axiosInstance.patch(`/api/notifications/${notification.id}/read`);
        setUnreadCount(prev => Math.max(0, prev - 1));
      }

      // Navigate based on notification type and related type
      if (notification.relatedType === 'APPLICATION') {
        navigate('/customerorders');
      } else if (notification.relatedType === 'ORDER') {
        navigate('/workerorders');
      } else if (notification.relatedType === 'REVIEW') {
        navigate('/workerorders');
      }

      setShow(false);
    } catch (error) {
      console.error('Error handling notification click:', error);
      toast.error('Failed to process notification');
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await axiosInstance.patch('/api/notifications/mark-all-read');
      setUnreadCount(0);
      fetchNotifications();
      toast.success('All notifications marked as read');
    } catch (error) {
      console.error('Error marking all as read:', error);
      toast.error('Failed to mark notifications as read');
    }
  };

  const handleDeleteNotification = async (e, notificationId) => {
    e.stopPropagation();
    try {
      await axiosInstance.delete(`/api/notifications/${notificationId}`);
      fetchNotifications();
      fetchUnreadCount();
      toast.success('Notification deleted');
    } catch (error) {
      console.error('Error deleting notification:', error);
      toast.error('Failed to delete notification');
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'JOB_APPLIED':
        return <FaBriefcase className="text-primary" />;
      case 'APPLICATION_ACCEPTED':
      case 'ORDER_ACCEPTED':
        return <FaCheck className="text-success" />;
      case 'APPLICATION_REJECTED':
        return <FaTrash className="text-danger" />;
      case 'REVIEW_RECEIVED':
      case 'FEEDBACK_RECEIVED':
        return <FaStar className="text-warning" />;
      case 'ORDER_STARTED':
      case 'ORDER_COMPLETED':
        return <FaClipboard className="text-info" />;
      default:
        return <FaBell className="text-secondary" />;
    }
  };

  const formatRelativeTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <Dropdown show={show} onToggle={setShow} ref={dropdownRef} align="end">
      <Dropdown.Toggle
        variant="link"
        className="position-relative text-decoration-none notification-bell-toggle"
        style={{ border: 'none', padding: '0.5rem' }}
      >
        <FaBell size={22} className="text-dark" />
        {unreadCount > 0 && (
          <Badge
            bg="danger"
            pill
            className="position-absolute top-0 start-100 translate-middle"
            style={{ fontSize: '0.65rem' }}
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </Badge>
        )}
      </Dropdown.Toggle>

      <Dropdown.Menu
        className="notification-dropdown shadow-lg border-0"
        style={{ width: '380px', maxHeight: '500px', overflowY: 'auto' }}
      >
        <div className="d-flex justify-content-between align-items-center px-3 py-2 border-bottom bg-light">
          <h6 className="mb-0 fw-bold">Notifications</h6>
          {unreadCount > 0 && (
            <button
              className="btn btn-sm btn-link text-decoration-none p-0"
              onClick={handleMarkAllRead}
            >
              Mark all read
            </button>
          )}
        </div>

        {loading ? (
          <div className="text-center py-5">
            <Spinner animation="border" size="sm" variant="primary" />
            <p className="text-muted small mt-2 mb-0">Loading notifications...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-5">
            <FaBell size={40} className="text-muted mb-2" />
            <p className="text-muted mb-0">No notifications yet</p>
          </div>
        ) : (
          <ListGroup variant="flush">
            {notifications.map((notification) => (
              <ListGroup.Item
                key={notification.id}
                className={`notification-item ${!notification.isRead ? 'notification-unread' : ''}`}
                style={{ cursor: 'pointer' }}
                onClick={() => handleNotificationClick(notification)}
              >
                <div className="d-flex gap-3">
                  <div className="notification-icon mt-1">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-grow-1">
                    <div className="d-flex justify-content-between align-items-start">
                      <h6 className="mb-1 fw-bold" style={{ fontSize: '0.9rem' }}>
                        {notification.title}
                      </h6>
                      <button
                        className="btn btn-sm btn-link text-muted p-0"
                        onClick={(e) => handleDeleteNotification(e, notification.id)}
                        style={{ fontSize: '0.75rem' }}
                      >
                        <FaTrash />
                      </button>
                    </div>
                    <p className="mb-1 text-muted" style={{ fontSize: '0.85rem' }}>
                      {notification.message}
                    </p>
                    <small className="text-muted">
                      {formatRelativeTime(notification.createdAt)}
                    </small>
                  </div>
                </div>
              </ListGroup.Item>
            ))}
          </ListGroup>
        )}

        {notifications.length > 0 && (
          <div className="text-center border-top py-2">
            <button
              className="btn btn-sm btn-link text-decoration-none"
              onClick={() => {
                navigate('/notifications');
                setShow(false);
              }}
            >
              View all notifications
            </button>
          </div>
        )}
      </Dropdown.Menu>
    </Dropdown>
  );
}
