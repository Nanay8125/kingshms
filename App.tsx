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
<<<<<<< HEAD
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
=======
  ChatMessage,
  MenuItem,
  UserRole,
  Language
} from './types';
import { TRANSLATIONS } from './constants';

// Lazy-loaded components for code-splitting with preloading
const Dashboard = React.lazy(() => import('./components/Dashboard'));
const RoomGrid = React.lazy(() => import('./components/RoomGrid'));
>>>>>>> gh-pages-local
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
<<<<<<< HEAD
const MenuManagement = React.lazy(() => import('./components/MenuManagement'));
const PublicBookingPortal = React.lazy(() => import('./components/PublicBookingPortal'));

=======
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
  const schedulePreload = window.requestIdleCallback ||
    ((cb: () => void) => setTimeout(cb, 1));
  schedulePreload(preloadCriticalComponents);
}

>>>>>>> gh-pages-local
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
<<<<<<< HEAD
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
=======
>>>>>>> gh-pages-local
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
<<<<<<< HEAD
  const [currentCompanyId, setCurrentCompanyId] = useState<string>('luxestay'); // Default to LuxeStay for now
=======
>>>>>>> gh-pages-local

  // Initialize DB - Load essential data first for faster initial load
  useEffect(() => {
    const initEssential = async () => {
      setIsLoading(true);
<<<<<<< HEAD
      const [
        r, b, c, t, s
      ] = await Promise.all([
        dbService.getAll('rooms'),
        dbService.getAll('bookings'),
        dbService.getAll('categories'),
        dbService.getAll('tasks'),
=======

      // Load only critical data first (rooms, categories, staff for login)
      const [r, c, s] = await Promise.all([
        dbService.getAll('rooms'),
        dbService.getAll('categories'),
>>>>>>> gh-pages-local
        dbService.getAll('staff')
      ]);

      setRooms(r as Room[]);
<<<<<<< HEAD
      setBookings(b as Booking[]);
      setCategories(c as RoomCategory[]);
      setTasks(t as Task[]);
      setStaff(s as StaffMember[]);
      setIsLoading(false);

      // Load non-essential data in background
      const loadNonEssential = async () => {
        const [
          g, tpl, f, e, n, conv, m
        ] = await Promise.all([
          dbService.getAll('guests', currentCompanyId),
          dbService.getAll('templates'),
          dbService.getAll('feedback', currentCompanyId),
          dbService.getAll('emails'),
          dbService.getAll('notifications'),
          dbService.getAll('conversations', currentCompanyId),
          dbService.getAll('menu', currentCompanyId)
        ]);

=======
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
          dbService.getAll('guests'),
          dbService.getAll('templates'),
          dbService.getAll('feedback'),
          dbService.getAll('emails'),
          dbService.getAll('notifications'),
          dbService.getAll('conversations'),
          dbService.getAll('menu')
        ]);

        setBookings(b as Booking[]);
        setTasks(t as Task[]);
>>>>>>> gh-pages-local
        setGuests(g as Guest[]);
        setTemplates(tpl as TaskTemplate[]);
        setFeedback(f as Feedback[]);
        setStaffEmails(e as StaffEmail[]);
        setNotifications(n as InAppNotification[]);
        setConversations(conv as Conversation[]);
        setMenu(m as MenuItem[]);
<<<<<<< HEAD
      };
      loadNonEssential();
=======
      }, 100); // Small delay to prioritize initial render
>>>>>>> gh-pages-local
    };
    initEssential();
  }, []);

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
<<<<<<< HEAD
=======
    // Also update in DB
    const notification = notifications.find(n => n.id === id);
    if (notification) {
      dbService.update('notifications', id, { ...notification, read: true }).catch(console.error);
    }
  };

  const handleNewBooking = (booking: Booking, newGuest?: Guest) => {
    // 1. Update bookings state
    setBookings(prev => [...prev, booking]);
    
    // 2. Update guests state if new guest
    if (newGuest) {
      setGuests(prev => [...prev, newGuest]);
    }

    // 3. Create notifications for Front Desk staff
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

    // 4. Update notifications state
    setNotifications(prev => [...newNotifications, ...prev]);

    // 5. Persist notifications to DB
    newNotifications.forEach(n => {
      // Add companyId if the interface supports it, but currently InAppNotification doesn't seem to have it in the type definition I saw earlier.
      // Let's check type definition again. InAppNotification doesn't have companyId in the file I read.
      // However, dbService might expect it for scoping? 
      // dbService.create takes payload.
      // If InAppNotification table is company scoped, we should add companyId if possible.
      // But looking at types.ts earlier:
      /*
      export interface InAppNotification {
        id: string;
        staffId: string;
        title: string;
        message: string;
        type: 'task' | 'booking' | 'system';
        timestamp: string;
        read: boolean;
      }
      */
      // It doesn't have companyId. But dbService marks 'notifications' as companyScoped.
      // This might be a missing field in the interface or handled implicitly?
      // For now, I'll just follow the interface.
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
        // Persist update
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
>>>>>>> gh-pages-local
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

    // Preview Guest Portal mode
    if (isPreviewMode) {
      return (
        <PublicBookingPortal
          rooms={rooms}
          categories={categories}
          bookings={bookings}
          menu={menu}
<<<<<<< HEAD
          onBookingComplete={(booking, guest) => {
            setBookings(prev => [...prev, booking]);
            setGuests(prev => [...prev, guest]);
          }}
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
                title: `${type.replace('-', ' ').toUpperCase()}: Room ${roomNumber}`,
                description: details,
                type: type,
                priority: priority,
                status: TaskStatus.PENDING,
                roomId: room?.id,
                createdAt: new Date().toISOString()
              };

              const createdTask = await dbService.create<Task>('tasks', taskPayload);
              setTasks(prev => [...prev, createdTask]);
            } catch (error) {
              console.error('Failed to create service request:', error);
            }
=======
          onBookingComplete={handleNewBooking}
          onFoodRequest={(roomId, items) => {
            // TODO: Implement food request logic
            console.log('Food request:', roomId, items);
          }}
          onServiceRequest={(roomNumber, type, details, priority) => {
            // TODO: Implement service request logic
            console.log('Service request:', roomNumber, type, details, priority);
>>>>>>> gh-pages-local
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
<<<<<<< HEAD
            onStatusChange={async (roomId, newStatus) => {
              try {
                const updatedRoom = await dbService.update<Room>('rooms', roomId, { status: newStatus });
                if (updatedRoom) {
                  setRooms(prev => prev.map(r => r.id === roomId ? updatedRoom : r));
                }
              } catch (error) {
                console.error('Failed to update room status:', error);
                alert('Failed to update room status');
              }
            }}
            onRoomClick={(room) => {
              setSelectedRoom(room);
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
                alert('Failed to create room');
              }
=======
            onStatusChange={(roomId, newStatus) => {
              setRooms(prev => prev.map(r => r.id === roomId ? { ...r, status: newStatus } : r));
            }}
            onRoomClick={(room) => {
              // TODO: Implement room details modal or navigation
              console.log('Room clicked:', room);
            }}
            onAddRoom={(roomData) => {
              const newRoom: Room = {
                ...roomData,
                id: `r${Math.random().toString(36).substr(2, 9)}`
              };
              setRooms(prev => [...prev, newRoom]);
>>>>>>> gh-pages-local
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
<<<<<<< HEAD
            onSubmit={({ booking, newGuest }) => {
              setBookings(prev => [...prev, booking]);
              if (newGuest) {
                setGuests(prev => [...prev, newGuest]);
              }
            }}
=======
            onSubmit={({ booking, newGuest }) => handleNewBooking(booking, newGuest)}
>>>>>>> gh-pages-local
          />
        );
      case 'staff':
        return (
          <StaffManagement
            staff={staff}
            tasks={tasks}
<<<<<<< HEAD
            onUpdateStaffStatus={async (id, status) => {
              try {
                const updatedStaff = await dbService.update<StaffMember>('staff', id, { status });
                if (updatedStaff) {
                  setStaff(prev => prev.map(s => s.id === id ? updatedStaff : s));
                }
              } catch (error) {
                console.error('Failed to update staff status:', error);
                alert('Failed to update status');
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
                  alert('Failed to delete staff member');
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
                alert('Failed to generate access key');
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
                alert('Failed to revoke access key');
              }
=======
            onUpdateStaffStatus={(id, status) => {
              setStaff(prev => prev.map(s => s.id === id ? { ...s, status } : s));
            }}
            onAddStaff={() => setShowStaffForm(true)}
            onDeleteStaff={(id) => {
              setStaff(prev => prev.filter(s => s.id !== id));
            }}
            onGenerateAccessKey={(staffId, description) => {
              const key = `${staff.find(s => s.id === staffId)?.department.toLowerCase().substring(0, 2) || 'xx'}_${Math.random().toString(36).substring(2, 15)}`;
              const newKey = {
                id: `ak${Math.random().toString(36).substr(2, 5)}`,
                key,
                createdAt: new Date().toISOString(),
                description: description || 'Generated Access Key',
                active: true
              };
              setStaff(prev => prev.map(s =>
                s.id === staffId
                  ? { ...s, accessKeys: [...(s.accessKeys || []), newKey] }
                  : s
              ));
            }}
            onRevokeAccessKey={(staffId, keyId) => {
              setStaff(prev => prev.map(s =>
                s.id === staffId
                  ? {
                      ...s,
                      accessKeys: s.accessKeys?.map(k =>
                        k.id === keyId ? { ...k, active: false } : k
                      )
                    }
                  : s
              ));
>>>>>>> gh-pages-local
            }}
            currentUser={currentUser}
          />
        );
<<<<<<< HEAD
=======
      case 'categories':
        return (
          <CategoryManagement
            categories={categories}
            onUpdateCategories={setCategories}
          />
        );
>>>>>>> gh-pages-local
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
<<<<<<< HEAD
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
=======
            onUpdateStatus={(taskId, status) => {
              setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status } : t));
            }}
            onUpdatePriority={(taskId, priority) => {
              setTasks(prev => prev.map(t => t.id === taskId ? { ...t, priority } : t));
            }}
            onUpdateAssignedStaff={(taskId, staffId) => {
              setTasks(prev => prev.map(t => t.id === taskId ? { ...t, assignedStaffId: staffId } : t));
>>>>>>> gh-pages-local
            }}
            onReorderTask={(taskId, newStatus, targetTaskId) => {
              // TODO: Implement task reordering logic
              console.log('Reorder task:', taskId, newStatus, targetTaskId);
            }}
            onAddTask={() => setShowTaskForm(true)}
            onAddTemplate={() => {
              // TODO: Implement add template modal
              console.log('Add template');
            }}
            onDeleteTemplate={(id) => {
              setTemplates(prev => prev.filter(t => t.id !== id));
            }}
            onEditTemplate={(template) => {
              // TODO: Implement edit template modal
              console.log('Edit template:', template);
            }}
            onUseTemplate={(template) => {
              // TODO: Implement use template logic
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
<<<<<<< HEAD
            onSendMessage={(conversationId, text) => {
              // TODO: Implement send message logic
              console.log('Send message:', conversationId, text);
            }}
=======
            onSendMessage={handleSendMessage}
            onMarkAsRead={handleMarkConversationRead}
            currentLanguage={language}
>>>>>>> gh-pages-local
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

  // Public booking portal access (no authentication required)
  if (isPublicBooking) {
    return (
      <Suspense fallback={<div className="flex items-center justify-center h-screen bg-slate-50"><div className="text-slate-600">Loading Booking Portal...</div></div>}>
        <PublicBookingPortal
          rooms={rooms}
          categories={categories}
          bookings={bookings}
          menu={menu}
<<<<<<< HEAD
          onBookingComplete={(booking, guest) => {
            setBookings(prev => [...prev, booking]);
            setGuests(prev => [...prev, guest]);
          }}
=======
          onBookingComplete={handleNewBooking}
>>>>>>> gh-pages-local
          onFoodRequest={(roomId, items) => {
            // TODO: Implement food request logic
            console.log('Food request:', roomId, items);
          }}
          onServiceRequest={(roomNumber, type, details, priority) => {
            // TODO: Implement service request logic
            console.log('Service request:', roomNumber, type, details, priority);
          }}
          onExit={() => {
            // Redirect to staff portal or home
            if (typeof window !== 'undefined') {
              window.location.href = window.location.pathname;
            }
          }}
        />
      </Suspense>
    );
  }

  // Show login form if not logged in
  if (!isLoggedIn || !currentUser) {
    return (
      <LoginForm
        staffMembers={staff}
        onLogin={handleLogin}
      />
    );
  }

  if (isPreviewMode) {
    return (
      <Suspense fallback={<div className="flex items-center justify-center h-full min-h-screen bg-slate-50"><div className="text-slate-600">Loading Preview...</div></div>}>
        {renderContent()}
      </Suspense>
    );
  }

  return (
    <>
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
        <Suspense fallback={<div className="flex items-center justify-center h-full"><div className="text-white">Loading...</div></div>}>
          {renderContent()}
        </Suspense>
      </Layout>

      {showStaffForm && (
        <Suspense fallback={<div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-[70]"><div className="text-white">Loading...</div></div>}>
          <StaffForm
            onClose={() => setShowStaffForm(false)}
<<<<<<< HEAD
            onSubmit={async (newStaffData) => {
              try {
                const staffPayload = {
                  ...newStaffData,
                  companyId: currentCompanyId,
                  // Ensure default fields are set if needed
                  accessKeys: [],
                  avatar: newStaffData.avatar || `https://i.pravatar.cc/150?u=${newStaffData.email}`
                };
                const createdStaff = await dbService.create<StaffMember>('staff', staffPayload);
                setStaff(prev => [...prev, createdStaff]);
                setShowStaffForm(false);
              } catch (error) {
                console.error('Failed to create staff member:', error);
                alert('Failed to create staff member');
              }
=======
            onSubmit={(newStaff) => {
              setStaff(prev => [...prev, newStaff]);
              setShowStaffForm(false);
>>>>>>> gh-pages-local
            }}
          />
        </Suspense>
      )}

      {showTaskForm && (
        <Suspense fallback={<div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-[70]"><div className="text-white">Loading...</div></div>}>
          <TaskForm
            rooms={rooms}
            staff={staff}
            tasks={tasks}
            templates={templates}
            onClose={() => setShowTaskForm(false)}
<<<<<<< HEAD
            onSubmit={async (newTaskData) => {
              try {
                const taskPayload = {
                  ...newTaskData,
                  companyId: currentCompanyId
                };
                const createdTask = await dbService.create<Task>('tasks', taskPayload);
                setTasks(prev => [...prev, createdTask]);
                setShowTaskForm(false);
              } catch (error) {
                console.error('Failed to create task:', error);
                alert('Failed to create task');
              }
=======
            onSubmit={(newTask) => {
              setTasks(prev => [...prev, newTask]);
              setShowTaskForm(false);
>>>>>>> gh-pages-local
            }}
          />
        </Suspense>
      )}
<<<<<<< HEAD

      {selectedRoom && (
        <Suspense fallback={<div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-[70]"><div className="text-white">Loading...</div></div>}>
          <RoomDetailsModal
            room={selectedRoom}
            category={categories.find(c => c.id === selectedRoom.categoryId)}
            bookings={bookings.filter(b => b.roomId === selectedRoom.id)}
            feedback={feedback.filter(f => f.roomId === selectedRoom.id)}
            onClose={() => setSelectedRoom(null)}
          />
        </Suspense>
      )}
=======
>>>>>>> gh-pages-local
    </>
  );
};

export default App;
