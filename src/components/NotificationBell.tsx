
import React, { useState } from 'react';
import { Bell } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from '../contexts/AuthContext';

interface Notification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  type: 'info' | 'success' | 'warning';
  targetRoles: string[];
}

const NotificationBell: React.FC = () => {
  const { user } = useAuth();
  
  const [allNotifications] = useState<Notification[]>([
    // Vendor notifications
    {
      id: '1',
      title: 'Submission Approved',
      message: 'Your calculation CALC-002 has been approved by all levels',
      timestamp: '2025-01-03T10:30:00Z',
      read: false,
      type: 'success',
      targetRoles: ['vendor']
    },
    {
      id: '2',
      title: 'Partial Invoice Accepted',
      message: 'Your 75% invoice request has been accepted for processing',
      timestamp: '2025-01-03T09:15:00Z',
      read: false,
      type: 'success',
      targetRoles: ['vendor']
    },
    {
      id: '3',
      title: 'Comment Added',
      message: 'Level 1 reviewer added a comment to your submission CALC-005',
      timestamp: '2025-01-02T16:45:00Z',
      read: true,
      type: 'info',
      targetRoles: ['vendor']
    },
    
    // Level 1 notifications
    {
      id: '4',
      title: 'New Submission Received',
      message: 'CALC-006 submitted by ABC Construction Ltd awaiting review',
      timestamp: '2025-01-03T11:20:00Z',
      read: false,
      type: 'info',
      targetRoles: ['level1']
    },
    {
      id: '5',
      title: 'Vendor Response',
      message: 'Vendor responded to your comment on CALC-003',
      timestamp: '2025-01-02T14:30:00Z',
      read: false,
      type: 'warning',
      targetRoles: ['level1']
    },
    
    // Level 2 notifications
    {
      id: '6',
      title: 'Reviewed Submission Ready',
      message: 'CALC-004 has been reviewed and is ready for validation',
      timestamp: '2025-01-03T08:45:00Z',
      read: false,
      type: 'info',
      targetRoles: ['level2']
    },
    {
      id: '7',
      title: 'Urgent Validation Required',
      message: 'High-priority submission CALC-001 requires immediate validation',
      timestamp: '2025-01-02T13:15:00Z',
      read: true,
      type: 'warning',
      targetRoles: ['level2']
    },
    
    // Level 3 notifications
    {
      id: '8',
      title: 'Validated Submission',
      message: 'CALC-002 has been validated and awaits final approval',
      timestamp: '2025-01-03T07:30:00Z',
      read: false,
      type: 'info',
      targetRoles: ['level3']
    },
    {
      id: '9',
      title: 'Invoice Approval Required',
      message: 'Partial invoice request requires your final approval',
      timestamp: '2025-01-02T12:00:00Z',
      read: false,
      type: 'warning',
      targetRoles: ['level3']
    }
  ]);

  // Filter notifications based on user role
  const notifications = allNotifications.filter(notification => 
    notification.targetRoles.includes(user?.role || '')
  );

  const [readNotifications, setReadNotifications] = useState<Set<string>>(new Set());

  const unreadCount = notifications.filter(n => !n.read && !readNotifications.has(n.id)).length;

  const markAsRead = (id: string) => {
    setReadNotifications(prev => new Set(prev).add(id));
  };

  const markAllAsRead = () => {
    const allIds = notifications.map(n => n.id);
    setReadNotifications(new Set(allIds));
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'success': return 'text-green-600';
      case 'warning': return 'text-yellow-600';
      default: return 'text-blue-600';
    }
  };

  const isNotificationRead = (notification: Notification) => {
    return notification.read || readNotifications.has(notification.id);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-red-600 text-white text-xs"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Notifications</CardTitle>
              {unreadCount > 0 && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={markAllAsRead}
                  className="text-xs text-blue-600 hover:text-blue-800"
                >
                  Mark all read
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="max-h-96 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  No notifications
                </div>
              ) : (
                notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${
                      !isNotificationRead(notification) ? 'bg-blue-50' : ''
                    }`}
                    onClick={() => markAsRead(notification.id)}
                  >
                    <div className="flex items-start space-x-3">
                      <div className={`w-2 h-2 rounded-full mt-2 ${
                        !isNotificationRead(notification) ? 'bg-blue-600' : 'bg-gray-300'
                      }`} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className={`text-sm font-medium ${getTypeColor(notification.type)}`}>
                            {notification.title}
                          </h4>
                          <span className="text-xs text-gray-500">
                            {formatTimestamp(notification.timestamp)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700 leading-relaxed">
                          {notification.message}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </PopoverContent>
    </Popover>
  );
};

export default NotificationBell;
