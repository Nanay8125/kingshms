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
  MenuItem,
  UserRole,
  Language
} from './types';
import { TRANSLATIONS } from './constants';

// Lazy-loaded components for code-splitting
const Dashboard = React.lazy(() => import('./components/Dashboard'));
const RoomGrid = React.lazy(() => import('./components/RoomGrid'));
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
const MenuManagement = React.lazy(() => import('./components/MenuManagement'));
const PublicBookingPortal = React.lazy(() => import('./components/PublicBookingPortal'));

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

  // Initialize DB - Load essential data first for faster initial load
  useEffect(() => {
    const initEssential = async () => {
      setIsLoading(true);
      const [
        r, b, c, t, s
      ] = await Promise.all([
        dbService.getAll('rooms'),
        dbService.getAll('bookings'),
        dbService.getAll('categories'),
        dbService.getAll('tasks'),
        dbService.getAll('staff')
      ]);

      setRooms(r);
      setBookings(b);
      setCategories(c);
      setTasks(t);
      setStaff(s);
      setIsLoading(false);

      // Load non-essential data in background
      const loadNonEssential = async () => {
        const [
          g, tpl, f, e, n, conv, m
        ] = await Promise.all([
          dbService.getAll('guests'),
          dbService.getAll('templates'),
          dbService.getAll('feedback'),
          dbService.getAll('emails'),
          dbService.getAll('notifications'),
          dbService.getAll('conversations'),
          dbService.getAll('menu')
        ]);

        setGuests(g);
        setTemplates(tpl);
        setFeedback(f);
        setStaffEmails(e);
        setNotifications(n);
        setConversations(conv);
        setMenu(m);
      };
      loadNonEssential();
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
          onBookingComplete={(booking, guest) => {
            setBookings(prev => [...prev, booking]);
            setGuests(prev => [...prev, guest]);
          }}
          onFoodRequest={(roomId, items) => {
            // TODO: Implement food request logic
            console.log('Food request:', roomId, items);
          }}
          onServiceRequest={(roomNumber, type, details, priority) => {
            // TODO: Implement service request logic
            console.log('Service request:', roomNumber, type, details, priority);
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
            onSubmit={({ booking, newGuest }) => {
              setBookings(prev => [...prev, booking]);
              if (newGuest) {
                setGuests(prev => [...prev, newGuest]);
              }
            }}
          />
        );
      case 'staff':
        return (
          <StaffManagement
            staff={staff}
            tasks={tasks}
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
            }}
            currentUser={currentUser}
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
            onUpdateStatus={(taskId, status) => {
              setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status } : t));
            }}
            onUpdatePriority={(taskId, priority) => {
              setTasks(prev => prev.map(t => t.id === taskId ? { ...t, priority } : t));
            }}
            onUpdateAssignedStaff={(taskId, staffId) => {
              setTasks(prev => prev.map(t => t.id === taskId ? { ...t, assignedStaffId: staffId } : t));
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
            onSendMessage={(conversationId, text) => {
              // TODO: Implement send message logic
              console.log('Send message:', conversationId, text);
            }}
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
          onBookingComplete={(booking, guest) => {
            setBookings(prev => [...prev, booking]);
            setGuests(prev => [...prev, guest]);
          }}
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
            onSubmit={(newStaff) => {
              setStaff(prev => [...prev, newStaff]);
              setShowStaffForm(false);
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
            onSubmit={(newTask) => {
              setTasks(prev => [...prev, newTask]);
              setShowTaskForm(false);
            }}
          />
        </Suspense>
      )}
    </>
  );
};

export default App;
