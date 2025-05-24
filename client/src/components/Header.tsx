import React, { useEffect, useState, useRef } from "react";
import { Menu, Phone, MessageSquare, Bell, X, Check } from "lucide-react";
import { useAuth } from "@/lib/auth";

type NotificationType = 'success' | 'warning' | 'info' | 'error';

interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  time: string;
  read: boolean;
}

export default function Header() {
  const { user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userName, setUserName] = useState("User");
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const notificationRef = useRef<HTMLDivElement>(null);

  // Sample notifications - in a real app, these would come from an API
  useEffect(() => {
    setNotifications([
      {
        id: '1',
        type: 'success',
        title: 'Task Completed',
        message: 'Your report has been successfully generated.',
        time: '2 min ago',
        read: false
      },
      {
        id: '2',
        type: 'warning',
        title: 'Update Required',
        message: 'Please update your profile information to continue.',
        time: '1 hour ago',
        read: false
      },
      {
        id: '3',
        type: 'info',
        title: 'New Feature',
        message: 'Check out our latest updates in the dashboard.',
        time: '3 hours ago',
        read: true
      },
    ]);
  }, []);

  // Close notifications when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
    
    // Mark all notifications as read when opening
    if (!showNotifications) {
      setNotifications(notifications.map(n => ({ ...n, read: true })));
    }
  };

  const getNotificationIcon = (type: NotificationType) => {
    const baseClass = "w-6 h-6 rounded-full flex items-center justify-center";
    switch (type) {
      case 'success':
        return (
          <div className={`${baseClass} bg-green-100`}>
            <Check className="w-3 h-3 text-green-600" />
          </div>
        );
      case 'warning':
        return (
          <div className={`${baseClass} bg-yellow-100`}>
            <span className="text-yellow-600">!</span>
          </div>
        );
      case 'error':
        return (
          <div className={`${baseClass} bg-red-100`}>
            <X className="w-3 h-3 text-red-600" />
          </div>
        );
      case 'info':
      default:
        return (
          <div className={`${baseClass} bg-blue-100`}>
            <span className="text-blue-600">i</span>
          </div>
        );
    }
  }

  useEffect(() => {
    const storedName = sessionStorage.getItem("signupName")
    if (storedName) {
      setUserName(storedName)
    }

  }, [])




  return (
    <header className="bg-white border-b border-neutral-200 sticky top-0 z-10">
      <div className="flex items-center justify-between px-4 md:px-6 py-3">
        <div className="flex items-center">
          <button
            className="text-neutral-500 hover:text-neutral-700 md:hidden mr-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>

        <div className="flex items-center space-x-4">
          <div className="relative" ref={notificationRef}>
            <button
              className="relative text-gray-600 hover:text-gray-900 p-1"
              onClick={toggleNotifications}
              aria-label="Notifications"
            >
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 h-3 w-3 flex items-center justify-center text-[10px] font-medium text-white bg-red-500 rounded-full">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>
            
            {showNotifications && (
              <div className="fixed top-0 right-0 h-full w-80 bg-white shadow-lg z-50">
                <div className="flex justify-between items-center p-4 border-b">
                  <h3 className="text-lg font-medium">Notifications</h3>
                  <button 
                    onClick={() => setShowNotifications(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
                <div className="h-[calc(100%-60px)] overflow-y-auto">
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                          <div className="text-green-600 text-sm">✓</div>
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium">Blog post published</h4>
                        </div>
                      </div>
                      <button className="text-gray-400 hover:text-gray-600">
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                    <p className="text-sm text-gray-600 pl-8 mb-4">This blog post has been published. Team members will be able to edit this post and republish changes.</p>
                  </div>
                </div>
              </div>
            )}
          </div>
          <div className="relative">
            <button className="flex items-center space-x-2">
              {user?.identities?.[0]?.identity_data?.avatar_url ? (
                <img
                  src={user.identities[0].identity_data.avatar_url}
                  alt="Profile"
                  className="w-8 h-8 rounded-full object-cover"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium">
                  {user?.identities?.[0]?.identity_data?.full_name?.substring(0, 2).toUpperCase() || 'U'}
                </div>
              )}
              <div className="text-sm text-left hidden sm:block">
                <div className="font-medium">{user?.identities?.[0]?.identity_data?.full_name || user?.user_metadata?.full_name || userName || "User"}</div>
                <div className="text-xs text-neutral-500">
                  {user?.email || "user@example.com"}
                </div>
              </div>

            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu - would be implemented in a real app */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-neutral-200 px-4 py-2">
          {/* Mobile menu items */}
        </div>
      )}
    </header>
  );
}

