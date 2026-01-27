import React, { useState, useEffect, Suspense } from 'react';
import Layout from './components/Layout';
import LoginForm from './components/LoginForm';
import { dbService } from './services/dbService';
import { authService } from './services/authService';
import {
  Room,
  Booking,
  Guest,
  RoomCategory,
  Task,
  TaskTemplate,
  StaffMember,
  Feedback,
  StaffEmail,
  InAppNotification,
  Conversation,
  ChatMessage,
  MenuItem,
  UserRole,
  Language,
  TaskType,
  TaskPriority,
  TaskStatus
} from './types';
import { TRANSLATIONS } from './constants';

// Lazy-loaded components for code-splitting
const Dashboard = React.lazy(() => import('./components/Dashboard'));
const RoomGrid = React.lazy(() => import('./components/RoomGrid'));
const RoomDetailsModal = React.lazy(() => import('./components/RoomDetailsModal'));
const BookingForm = React.lazy(() => import('./components/BookingForm'));
const StaffManagement = React.lazy(() => import('./components/StaffManagement'));
const StaffForm = React.lazy(() => import('./components/StaffForm'));
const TaskBoard = React.lazy(() => import('./components/TaskBoard'));
const TaskForm = React.lazy(() => import('./components/TaskForm'));
const FeedbackTab = React.lazy(() => import('./components/FeedbackTab'));
const RevenueManagement = React.lazy(() => import('./components/RevenueManagement'));
const AnalyticsDashboard = React.lazy(() => import('./components/AnalyticsDashboard'));
const Settings = React.lazy(() => import('./components/Settings'));
const MessagingHub = React.lazy(() => import('./components/MessagingHub'));
const StaffInbox = React.lazy(() => import('./components/StaffInbox'));
const CategoryManagement = React.lazy(() => import('./components/CategoryManagement'));
const MenuManagement = React.lazy(() => import('./components/MenuManagement'));
const PublicBookingPortal = React.lazy(() => import('./components/PublicBookingPortal'));

// Preload critical components
const preloadCriticalComponents = () => {
  // Preload Dashboard and RoomGrid as they are most commonly used
  import('./components/Dashboard');
  import('./components/RoomGrid');
};

// Preload on app start
if (typeof window !== 'undefined') {
  // Use requestIdleCallback if available, otherwise setTimeout
  const schedulePreload = (window as any).requestIdleCallback ||
    ((cb: () => void) => setTimeout(cb, 1));
  schedulePreload(preloadCriticalComponents);
}

const App: React.FC = () => {
  // Check for public booking access
  const [isPublicBooking, setIsPublicBooking] = useState(false);

  useEffect(() => {
    // Only access window after component mounts
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      setIsPublicBooking(urlParams.get('booking') === 'public');
    }
  }, []);

  const [activeTab, setActiveTab] = useState('dashboard');
  const [language, setLanguage] = useState<Language>('en');
  const [isLoading, setIsLoading] = useState(true);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [showStaffForm, setShowStaffForm] = useState(false);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<StaffMember | null>(null);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [guests, setGuests] = useState<Guest[]>([]);
  const [categories, setCategories] = useState<RoomCategory[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [templates, setTemplates] = useState<TaskTemplate[]>([]);
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [staffEmails, setStaffEmails] = useState<StaffEmail[]>([]);
  const [notifications, setNotifications] = useState<InAppNotification[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [currentCompanyId, setCurrentCompanyId] = useState<string>('luxestay');

  // Initialize DB - Load essential data first for faster initial load
  useEffect(() => {
    const initEssential = async () => {
      setIsLoading(true);

      // Load only critical data first (rooms, categories, staff for login)
      const [r, c, s] = await Promise.all([
        dbService.getAll('rooms'),
        dbService.getAll('categories'),
        dbService.getAll('staff')
      ]);

      setRooms(r as Room[]);
      setCategories(c as RoomCategory[]);
      setStaff(s as StaffMember[]);
      setIsLoading(false);

      // Load remaining data in background with lower priority
      setTimeout(async () => {
        const [
          b, t, g, tpl, f, e, n, conv, m
        ] = await Promise.all([
          dbService.getAll('bookings'),
          dbService.getAll('tasks'),
          dbService.getAll('guests', currentCompanyId),
          dbService.getAll('templates'),
          dbService.getAll('feedback', currentCompanyId),
          dbService.getAll('emails'),
          dbService.getAll('notifications'),
          dbService.getAll('conversations', currentCompanyId),
          dbService.getAll('menu', currentCompanyId)
        ]);

        setBookings(b as Booking[]);
        setTasks(t as Task[]);
        setGuests(g as Guest[]);
        setTemplates(tpl as TaskTemplate[]);
        setFeedback(f as Feedback[]);
        setStaffEmails(e as StaffEmail[]);
        setNotifications(n as InAppNotification[]);
        setConversations(conv as Conversation[]);
        setMenu(m as MenuItem[]);
      }, 100); // Small delay to prioritize initial render
    };
    initEssential();
  }, [currentCompanyId]);

  const handleLogin = (user: StaffMember) => {
    setCurrentUser(user);
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentUser(null);
  };

  const handleMarkNotificationRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
    // Also update in DB
    const notification = notifications.find(n => n.id === id);
    if (notification) {
      dbService.update('notifications', id, { ...notification, read: true }).catch(console.error);
    }
  };

  const handleNewBooking = (booking: Booking, newGuest?: Guest) => {
    setBookings(prev => [...prev, booking]);
    if (newGuest) {
      setGuests(prev => [...prev, newGuest]);
    }

    const frontDeskStaff = staff.filter(s => s.permissionRole === UserRole.FRONT_DESK);
    const bookedRoom = rooms.find(r => r.id === booking.roomId);
    const roomNumber = bookedRoom ? bookedRoom.number : 'Unknown';

    const newNotifications: InAppNotification[] = frontDeskStaff.map(staffMember => ({
      id: `n${Math.random().toString(36).substr(2, 9)}`,
      staffId: staffMember.id,
      title: 'New Booking Received',
      message: `New booking received for Room ${roomNumber}. Check-in: ${booking.checkIn}`,
      type: 'booking',
      timestamp: new Date().toISOString(),
      read: false
    }));

    setNotifications(prev => [...newNotifications, ...prev]);
    newNotifications.forEach(n => {
      dbService.create('notifications', n).catch(console.error);
    });
  };

  const handleSendMessage = (conversationId: string, text: string) => {
    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      sender: 'staff',
      text,
      timestamp: new Date().toISOString()
    };

    setConversations(prev => prev.map(conv => {
      if (conv.id === conversationId) {
        const updatedConv = {
          ...conv,
          messages: [...conv.messages, newMessage],
          lastMessage: text,
          lastTimestamp: newMessage.timestamp
        };
        dbService.update('conversations', conversationId, updatedConv).catch(console.error);
        return updatedConv;
      }
      return conv;
    }));
  };

  const handleMarkConversationRead = (conversationId: string) => {
    setConversations(prev => prev.map(conv => {
      if (conv.id === conversationId && conv.unreadCount > 0) {
        const updatedConv = { ...conv, unreadCount: 0 };
        dbService.update('conversations', conversationId, updatedConv).catch(console.error);
        return updatedConv;
      }
      return conv;
    }));
  };

  const handlePreviewWebsite = () => {
    setIsPreviewMode(true);
  };

  const handleExitPreview = () => {
    setIsPreviewMode(false);
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center h-full">
          <div className="text-white">Loading...</div>
        </div>
      );
    }

    if (isPreviewMode) {
      return (
        <PublicBookingPortal
          rooms={rooms}
          categories={categories}
          bookings={bookings}
          menu={menu}
          onBookingComplete={handleNewBooking}
          onFoodRequest={async (roomId, items) => {
            try {
              const room = rooms.find(r => r.id === roomId);
              const orderDetails = items.map(i => `${i.quantity}x ${i.item.name}`).join(', ');

              const taskPayload = {
                companyId: currentCompanyId,
                title: `Food Order: Room ${room?.number || 'Unknown'}`,
                description: `Order Items: ${orderDetails}`,
                type: TaskType.DINING,
                priority: TaskPriority.HIGH,
                status: TaskStatus.PENDING,
                roomId: roomId,
                createdAt: new Date().toISOString()
              };

              const createdTask = await dbService.create<Task>('tasks', taskPayload);
              setTasks(prev => [...prev, createdTask]);
              alert('Order sent to kitchen!');
            } catch (error) {
              console.error('Failed to create dining task:', error);
              alert('Failed to send order. Please try again.');
            }
          }}
          onServiceRequest={async (roomNumber, type, details, priority) => {
            try {
              const room = rooms.find(r => r.number === roomNumber);

              const taskPayload = {
                companyId: currentCompanyId,
                title: `${type.toString().replace('-', ' ').toUpperCase()}: Room ${roomNumber}`,
                description: details,
                type: type as unknown as TaskType,
                priority: priority as unknown as TaskPriority,
                status: TaskStatus.PENDING,
                roomId: room?.id,
                createdAt: new Date().toISOString()
              };

              const createdTask = await dbService.create<Task>('tasks', taskPayload);
              setTasks(prev => [...prev, createdTask]);
            } catch (error) {
              console.error('Failed to create service request:', error);
            }
          }}
          onExit={handleExitPreview}
        />
      );
    }

    switch (activeTab) {
      case 'dashboard':
        return (
          <Dashboard
            rooms={rooms}
            bookings={bookings}
            tasks={tasks}
            feedback={feedback}
            onPreviewWebsite={handlePreviewWebsite}
            language={language}
          />
        );
      case 'rooms':
        return (
          <RoomGrid
            rooms={rooms}
            categories={categories}
            bookings={bookings}
            onStatusChange={async (roomId, newStatus) => {
              try {
                const updatedRoom = await dbService.update<Room>('rooms', roomId, { status: newStatus });
                if (updatedRoom) {
                  setRooms(prev => prev.map(r => r.id === roomId ? updatedRoom : r));
                }
              } catch (error) {
                console.error('Failed to update room status:', error);
              }
            }}
            onRoomClick={(room) => {
              // In a full implementation, this could open RoomDetailsModal
              console.log('Room clicked:', room);
            }}
            onAddRoom={async (roomData) => {
              try {
                const newRoomPayload = {
                  ...roomData,
                  companyId: currentCompanyId
                };
                const createdRoom = await dbService.create<Room>('rooms', newRoomPayload);
                setRooms(prev => [...prev, createdRoom]);
              } catch (error) {
                console.error('Failed to create room:', error);
              }
            }}
          />
        );
      case 'bookings':
        return (
          <BookingForm
            rooms={rooms}
            guests={guests}
            allBookings={bookings}
            categories={categories}
            onClose={() => setActiveTab('dashboard')}
            onSubmit={({ booking, newGuest }) => handleNewBooking(booking, newGuest)}
          />
        );
      case 'staff':
        return (
          <StaffManagement
            staff={staff}
            tasks={tasks}
            onUpdateStaffStatus={async (id, status) => {
              try {
                const updatedStaff = await dbService.update<StaffMember>('staff', id, { status });
                if (updatedStaff) {
                  setStaff(prev => prev.map(s => s.id === id ? updatedStaff : s));
                }
              } catch (error) {
                console.error('Failed to update staff status:', error);
              }
            }}
            onAddStaff={() => setShowStaffForm(true)}
            onDeleteStaff={async (id) => {
              if (window.confirm('Are you sure you want to remove this staff member?')) {
                try {
                  const success = await dbService.delete('staff', id);
                  if (success) {
                    setStaff(prev => prev.filter(s => s.id !== id));
                  }
                } catch (error) {
                  console.error('Failed to delete staff:', error);
                }
              }
            }}
            onGenerateAccessKey={async (staffId, description) => {
              try {
                const staffMember = staff.find(s => s.id === staffId);
                if (!staffMember) return;

                const key = `${staffMember.department.toLowerCase().substring(0, 2) || 'xx'}_${Math.random().toString(36).substring(2, 15)}`;
                const newKey = {
                  id: `ak${Math.random().toString(36).substr(2, 5)}`,
                  key,
                  createdAt: new Date().toISOString(),
                  description: description || 'Generated Access Key',
                  active: true
                };

                const updatedKeys = [...(staffMember.accessKeys || []), newKey];
                const updatedStaff = await dbService.update<StaffMember>('staff', staffId, { accessKeys: updatedKeys });

                if (updatedStaff) {
                  setStaff(prev => prev.map(s => s.id === staffId ? updatedStaff : s));
                }
              } catch (error) {
                console.error('Failed to generate access key:', error);
              }
            }}
            onRevokeAccessKey={async (staffId, keyId) => {
              try {
                const staffMember = staff.find(s => s.id === staffId);
                if (!staffMember) return;

                const updatedKeys = staffMember.accessKeys?.map(k =>
                  k.id === keyId ? { ...k, active: false } : k
                );

                const updatedStaff = await dbService.update<StaffMember>('staff', staffId, { accessKeys: updatedKeys });

                if (updatedStaff) {
                  setStaff(prev => prev.map(s => s.id === staffId ? updatedStaff : s));
                }
              } catch (error) {
                console.error('Failed to revoke access key:', error);
              }
            }}
            currentUser={currentUser}
          />
        );
      case 'categories':
        return (
          <CategoryManagement
            categories={categories}
            onUpdateCategories={setCategories}
          />
        );
      case 'menu':
        return (
          <MenuManagement
            menu={menu}
            onUpdateMenu={setMenu}
          />
        );
      case 'tasks':
        return (
          <TaskBoard
            tasks={tasks}
            rooms={rooms}
            staff={staff}
            templates={templates}
            onUpdateStatus={async (taskId, status) => {
              try {
                const updatedTask = await dbService.update<Task>('tasks', taskId, { status });
                if (updatedTask) {
                  setTasks(prev => prev.map(t => t.id === taskId ? updatedTask : t));
                }
              } catch (error) {
                console.error('Failed to update task status:', error);
              }
            }}
            onUpdatePriority={async (taskId, priority) => {
              try {
                const updatedTask = await dbService.update<Task>('tasks', taskId, { priority });
                if (updatedTask) {
                  setTasks(prev => prev.map(t => t.id === taskId ? updatedTask : t));
                }
              } catch (error) {
                console.error('Failed to update task priority:', error);
              }
            }}
            onUpdateAssignedStaff={async (taskId, staffId) => {
              try {
                const updatedTask = await dbService.update<Task>('tasks', taskId, { assignedStaffId: staffId });
                if (updatedTask) {
                  setTasks(prev => prev.map(t => t.id === taskId ? updatedTask : t));
                }
              } catch (error) {
                console.error('Failed to update task assignment:', error);
              }
            }}
            onReorderTask={(taskId, newStatus, targetTaskId) => {
              console.log('Reorder task:', taskId, newStatus, targetTaskId);
            }}
            onAddTask={() => setShowTaskForm(true)}
            onAddTemplate={() => {
              console.log('Add template');
            }}
            onDeleteTemplate={(id) => {
              setTemplates(prev => prev.filter(t => t.id !== id));
            }}
            onEditTemplate={(template) => {
              console.log('Edit template:', template);
            }}
            onUseTemplate={(template) => {
              console.log('Use template:', template);
            }}
          />
        );
      case 'feedback':
        return <FeedbackTab feedback={feedback} guests={guests} rooms={rooms} />;
      case 'revenue':
        return <RevenueManagement rooms={rooms} bookings={bookings} categories={categories} />;
      case 'analytics':
        return <AnalyticsDashboard bookings={bookings} rooms={rooms} categories={categories} guests={guests} tasks={tasks} staff={staff} />;
      case 'messages':
        return (
          <MessagingHub
            conversations={conversations}
            onSendMessage={handleSendMessage}
            onMarkAsRead={handleMarkConversationRead}
            currentLanguage={language}
          />
        );
      case 'inbox':
        return <StaffInbox emails={staffEmails} />;
      case 'settings':
        return (
          <Settings
            staff={staff}
            onAddStaff={() => setShowStaffForm(true)}
            onDeleteStaff={(id) => {
              setStaff(prev => prev.filter(s => s.id !== id));
            }}
            currentUser={currentUser}
          />
        );
      default:
        return <Dashboard rooms={rooms} bookings={bookings} tasks={tasks} feedback={feedback} language={language} />;
    }
  };

  if (isPublicBooking) {
    return (
      <Suspense fallback={<div className="flex items-center justify-center h-screen bg-slate-50"><div className="text-slate-600">Loading Booking Portal...</div></div>}>
        <PublicBookingPortal
          rooms={rooms}
          categories={categories}
          bookings={bookings}
          menu={menu}
          onBookingComplete={handleNewBooking}
          onFoodRequest={(roomId, items) => {
            console.log('Food request:', roomId, items);
          }}
          onServiceRequest={(roomNumber, type, details, priority) => {
            console.log('Service request:', roomNumber, type, details, priority);
          }}
          onExit={() => {
            if (typeof window !== 'undefined') {
              window.location.href = window.location.pathname;
            }
          }}
        />
      </Suspense>
    );
  }

  if (!isLoggedIn || !currentUser) {
    return (
      <LoginForm
        staffMembers={staff}
        onLogin={handleLogin}
      />
    );
  }

  return (
    <Layout
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      notificationCount={notifications.filter(n => !n.read).length}
      inAppNotifications={notifications}
      onMarkNotifRead={handleMarkNotificationRead}
      staff={staff}
      currentUser={currentUser}
      onLogout={handleLogout}
      language={language}
      onLanguageChange={setLanguage}
    >
      <Suspense fallback={<div className="flex items-center justify-center h-full text-white">Loading...</div>}>
        {renderContent()}
      </Suspense>
    </Layout>
  );
};

export default App;
