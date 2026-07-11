import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, LogOut, LayoutDashboard, Bell, Sun, Moon, CheckSquare } from 'lucide-react';
import { Button } from './Button.js';
import { Avatar } from './Avatar.js';
import { Logo } from './Logo.js';
import { useAuth } from '../hooks/useAuth.js';
import { useTheme } from '../context/ThemeContext.js';
import { useToast } from './Toast.js';

interface DemoNotification {
  id: string;
  title: string;
  desc: string;
  unread: boolean;
  time: string;
}

export const Navbar: React.FC = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const [notifications, setNotifications] = useState<DemoNotification[]>([]);

  React.useEffect(() => {
    if (!isAuthenticated || !user) {
      setNotifications([]);
      return;
    }

    const role = user.role;
    if (role === 'STUDENT') {
      setNotifications([
        {
          id: 's1',
          title: 'Assignment Due Tomorrow',
          desc: 'Homework 1: Practical implementation is due in 24 hours.',
          unread: true,
          time: '1h ago',
        },
        {
          id: 's2',
          title: 'New Course Available',
          desc: 'DevOps Engineering is now open for enrollment.',
          unread: true,
          time: '4h ago',
        },
        {
          id: 's3',
          title: 'Quiz Graded',
          desc: 'You scored 100% on the Module Assessment Quiz.',
          unread: true,
          time: '1d ago',
        },
      ]);
    } else if (role === 'INSTRUCTOR') {
      setNotifications([
        {
          id: 'i1',
          title: 'New Assignment Submission',
          desc: 'Student David Miller submitted Homework 1: Practical implementation.',
          unread: true,
          time: '2h ago',
        },
        {
          id: 'i2',
          title: 'Student Course Enrolled',
          desc: 'Student Emily Watson enrolled in Full Stack Web Development.',
          unread: true,
          time: '5h ago',
        },
        {
          id: 'i3',
          title: 'Curriculum Approved',
          desc: 'Your course DevOps Engineering was verified by the platform auditor.',
          unread: false,
          time: '1d ago',
        },
      ]);
    } else if (role === 'ADMIN') {
      setNotifications([
        {
          id: 'a1',
          title: 'Course Verification Queue',
          desc: 'Instructor Alex Rivera requested auditing for DevOps Engineering.',
          unread: true,
          time: '30m ago',
        },
        {
          id: 'a2',
          title: 'New Registration Alert',
          desc: 'New instructor Helen Chen completed platform sign-up.',
          unread: true,
          time: '3h ago',
        },
        {
          id: 'a3',
          title: 'Database Backup Complete',
          desc: 'Neon Cloud postgres database tables backup completed successfully.',
          unread: false,
          time: '12h ago',
        },
      ]);
    }
  }, [user, isAuthenticated]);

  const unreadCount = notifications.filter((n) => n.unread).length;

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/');
    setUserDropdownOpen(false);
  };

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
    toast.success('All notifications marked as read.');
  };

  const handleToggleRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, unread: !n.unread } : n))
    );
  };

  const isDashboardRoute = location.pathname.startsWith('/dashboard');

  return (
    <nav className="sticky top-0 z-40 w-full glass-panel border-b border-border shadow-soft transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo & Links */}
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center">
              <Logo size={32} showText={true} />
            </Link>

            {/* Desktop Navigation Links */}
            {!isDashboardRoute && (
              <div className="hidden md:flex items-center gap-6">
                <a href="#features" className="text-sm text-muted-text hover:text-foreground transition-colors font-medium">Features</a>
                <a href="#testimonials" className="text-sm text-muted-text hover:text-foreground transition-colors font-medium">Testimonials</a>
                <a href="#pricing" className="text-sm text-muted-text hover:text-foreground transition-colors font-medium">Pricing</a>
                <a href="#faq" className="text-sm text-muted-text hover:text-foreground transition-colors font-medium">FAQ</a>
              </div>
            )}
          </div>

          {/* Desktop Right items */}
          <div className="hidden md:flex items-center gap-4">
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="p-2 text-muted-text hover:text-foreground rounded-full hover:bg-muted-bg/50 border border-transparent transition-all cursor-pointer"
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            {isAuthenticated && user ? (
              <div className="flex items-center gap-4">
                {/* Notification Bell */}
                <div className="relative">
                  <button
                    onClick={() => {
                      setNotificationsOpen(!notificationsOpen);
                      setUserDropdownOpen(false);
                    }}
                    className="p-2 text-muted-text hover:text-foreground rounded-full hover:bg-muted-bg/50 border border-transparent transition-all cursor-pointer relative"
                    title="Notifications"
                  >
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && (
                      <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-danger rounded-full border border-background animate-pulse" />
                    )}
                  </button>

                  {/* Notifications Dropdown */}
                  {notificationsOpen && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setNotificationsOpen(false)} />
                      <div className="absolute right-0 mt-3 w-80 rounded-md border border-border bg-sidebar shadow-glass z-20 overflow-hidden flex flex-col max-h-[450px]">
                        <div className="px-4 py-3 border-b border-border/60 flex justify-between items-center bg-[#1A2333]/20">
                          <div>
                            <p className="text-xs text-muted-text font-bold uppercase tracking-wider">Notifications</p>
                            <span className="text-[10px] text-primary font-semibold mt-0.5 block">{unreadCount} unread tasks</span>
                          </div>
                          {unreadCount > 0 && (
                            <button
                              onClick={handleMarkAllRead}
                              className="text-[10px] text-primary hover:underline font-bold flex items-center gap-1 cursor-pointer"
                            >
                              <CheckSquare className="w-3.5 h-3.5" /> Read All
                            </button>
                          )}
                        </div>
                        
                        <div className="overflow-y-auto divide-y divide-border/40 flex-1">
                          {notifications.map((notif) => (
                            <div
                              key={notif.id}
                              onClick={() => handleToggleRead(notif.id)}
                              className={`p-3.5 text-left transition-colors cursor-pointer hover:bg-muted-bg/35 flex gap-2.5 ${
                                notif.unread ? 'bg-primary/5' : ''
                              }`}
                            >
                              <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                                notif.unread ? 'bg-primary' : 'bg-transparent'
                              }`} />
                              <div className="space-y-1 pr-1 flex-1">
                                <p className="text-xs font-semibold text-foreground leading-snug">{notif.title}</p>
                                <p className="text-[11px] text-muted-text leading-relaxed">{notif.desc}</p>
                                <span className="text-[9px] text-muted-text block pt-0.5">{notif.time}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {/* User Dropdown Profile trigger */}
                <div className="relative">
                  <button
                    onClick={() => {
                      setUserDropdownOpen(!userDropdownOpen);
                      setNotificationsOpen(false);
                    }}
                    className="flex items-center gap-2.5 p-1.5 rounded-full hover:bg-muted-bg border border-transparent hover:border-border transition-all duration-200 cursor-pointer"
                  >
                    <Avatar
                      src={user.avatarUrl}
                      alt={`${user.firstName} ${user.lastName}`}
                      size="sm"
                    />
                    <span className="text-sm font-medium text-foreground pr-1">
                      {user.firstName}
                    </span>
                  </button>

                  {/* User Dropdown Menu */}
                  {userDropdownOpen && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setUserDropdownOpen(false)} />
                      <div className="absolute right-0 mt-3 w-56 rounded-md border border-border bg-sidebar shadow-glass z-20 overflow-hidden">
                        <div className="px-4 py-3 border-b border-border/60">
                          <p className="text-xs text-muted-text">Signed in as</p>
                          <p className="text-sm font-semibold text-foreground truncate">{user.email}</p>
                          <span className="inline-block mt-1 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-primary/20 text-primary border border-primary/30">
                            {user.role}
                          </span>
                        </div>
                        <div className="py-1">
                          <Link
                            to="/dashboard"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2 text-sm text-foreground hover:bg-muted-bg transition-colors"
                          >
                            <LayoutDashboard className="w-4 h-4 text-muted-text" />
                            Dashboard
                          </Link>
                          <button
                            onClick={handleLogout}
                            className="flex w-full items-center gap-2.5 px-4 py-2 text-sm text-danger hover:bg-danger/10 transition-colors cursor-pointer"
                          >
                            <LogOut className="w-4 h-4" />
                            Logout
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link to="/login">
                  <Button variant="ghost" size="sm">Sign In</Button>
                </Link>
                <Link to="/register">
                  <Button variant="primary" size="sm">Get Started</Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Hamburger menu */}
          <div className="flex items-center gap-2 md:hidden">
            {/* Mobile Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 text-muted-text hover:text-foreground rounded-full hover:bg-muted-bg/50"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-muted-text hover:text-foreground p-2 rounded-md hover:bg-muted-bg/50 focus:outline-none transition-colors"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border bg-background/95 backdrop-blur-md px-4 pt-2 pb-4 space-y-2">
          {!isDashboardRoute && (
            <div className="flex flex-col space-y-1 py-2 border-b border-border/40">
              <a
                href="#features"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-md text-base font-medium text-muted-text hover:text-foreground hover:bg-muted-bg/40 transition-colors"
              >
                Features
              </a>
              <a
                href="#testimonials"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-md text-base font-medium text-muted-text hover:text-foreground hover:bg-muted-bg/40 transition-colors"
              >
                Testimonials
              </a>
              <a
                href="#pricing"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-md text-base font-medium text-muted-text hover:text-foreground hover:bg-muted-bg/40 transition-colors"
              >
                Pricing
              </a>
              <a
                href="#faq"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-md text-base font-medium text-muted-text hover:text-foreground hover:bg-muted-bg/40 transition-colors"
              >
                FAQ
              </a>
            </div>
          )}

          <div className="pt-2">
            {isAuthenticated && user ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3 px-3 py-2">
                  <Avatar
                    src={user.avatarUrl}
                    alt={`${user.firstName} ${user.lastName}`}
                    size="md"
                  />
                  <div>
                    <p className="text-sm font-semibold text-foreground">{user.firstName} {user.lastName}</p>
                    <p className="text-xs text-muted-text">{user.email}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 px-3">
                  <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="secondary" size="sm" className="w-full">
                      Dashboard
                    </Button>
                  </Link>
                  <Button variant="outline" size="sm" onClick={handleLogout} className="w-full text-danger border-danger/30 hover:bg-danger/10">
                    Logout
                  </Button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3 px-3">
                <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="ghost" size="sm" className="w-full">Sign In</Button>
                </Link>
                <Link to="/register" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="primary" size="sm" className="w-full">Get Started</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};
