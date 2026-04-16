import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from './services/firebaseConfig';
import LoginScreen from './screens/LoginScreen';
import HomeScreen from './screens/HomeScreen';
import FindGigScreen from './screens/FindGigScreen';
import ChatScreen from './screens/ChatScreen';
import ProfileScreen from './screens/ProfileScreen';
import AdminDashboard from './screens/AdminDashboard';
import BenefitsScreen from './screens/BenefitsScreen';
import LoansScreen from './screens/LoansScreen';
import AttendanceScreen from './screens/AttendanceScreen';
import MyJobsScreen from './screens/MyJobsScreen';
import TasksScreen from './screens/TasksScreen';
import EarningsScreen from './screens/EarningsScreen';
import JobDetailsScreen from './screens/JobDetailsScreen';
import CreateJobScreen from './screens/CreateJobScreen';
import TrackingScreen from './screens/TrackingScreen';
import { aiService } from './services/aiService';
import { FirestoreService } from './services/firestoreService';
import { JobService } from './services/jobService';
import ReportsScreen from './screens/ReportsScreen';
import WorkerApplicationsScreen from './screens/WorkerApplicationsScreen';
import OnboardingScreen from './screens/OnboardingScreen';
import SafetyScreen from './screens/SafetyScreen';
import AdminJobsScreen from './screens/AdminJobsScreen';
import EarningsPlannerScreen from './screens/EarningsPlannerScreen';
import LiquidEther from './components/LiquidEther/LiquidEther';
import GenieActionBar from './components/GenieActionBar';
import { calculateLevel } from './constants/gamification';
import GenieVoiceAssistant from './components/GenieVoiceAssistant';
import AIChatbot from './components/AIChatbot';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState('worker');
  const [activeTab, setActiveTab] = useState("Home");
  const [user, setUser] = useState(null);
  const [editJob, setEditJob] = useState(null);
  const [userProfile, setUserProfile] = useState(() => {
    try {
      const saved = localStorage.getItem('jobGenie_profile');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      console.error("Error parsing user profile:", e);
      return null;
    }
  });
  const [isSafetyModeActive, setIsSafetyModeActive] = useState(false);
  const [earningsGoal, setEarningsGoal] = useState(15000);
  const [userXP, setUserXP] = useState(() => {
    try {
      return Number(localStorage.getItem('jobGenie_xp')) || 0;
    } catch (e) {
      return 0;
    }
  });
  const [isDarkMode, setIsDarkMode] = useState(() => {
    try {
      return localStorage.getItem('jobGenie_theme') === 'dark';
    } catch (e) {
      return false;
    }
  });
  const [offlineQueue, setOfflineQueue] = useState([]);
  const [activeSuggestions, setActiveSuggestions] = useState([]);
  const [isVoiceOpen, setIsVoiceOpen] = useState(false);
  const [screenParams, setScreenParams] = useState({});
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  const [adminJobs, setAdminJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [attendance, setAttendance] = useState([]);

  useEffect(() => {
    if (!isLoggedIn || !user) return;

    const unsubJobs = FirestoreService.streamJobs(setAdminJobs);
    const unsubApps = FirestoreService.streamApplications(setApplications);
    const unsubAttendance = FirestoreService.streamAttendance(setAttendance);
    
    // Sync Profile & XP from Firestore
    const unsubProfile = FirestoreService.getUserProfile(user.uid).then(data => {
      if (data) {
        setUserProfile(data);
        setUserXP(data.xp || 0);
      }
    });

    return () => {
      unsubJobs();
      unsubApps();
      unsubAttendance();
    };
  }, [isLoggedIn, user]);

  // Background Sync Engine
  useEffect(() => {
    const handleStatusChange = () => setIsOnline(navigator.onLine);
    window.addEventListener('online', handleStatusChange);
    window.addEventListener('offline', handleStatusChange);

    if (isOnline && isLoggedIn && user) {
      JobService.processSync(user.uid);
    }

    return () => {
      window.removeEventListener('online', handleStatusChange);
      window.removeEventListener('offline', handleStatusChange);
    };
  }, [isOnline, isLoggedIn, user]);

  const userLevel = calculateLevel(userXP);

  // Helper to handle navigation with params
  const navigateTo = (screen, params = {}) => {
    setScreenParams(params);
    setActiveTab(screen);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        setIsLoggedIn(true);
      } else {
        setUser(null);
        setIsLoggedIn(false);
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    localStorage.setItem('jobGenie_xp', userXP);
  }, [userXP]);

  useEffect(() => {
    localStorage.setItem('jobGenie_theme', isDarkMode ? 'dark' : 'light');
    document.documentElement.setAttribute('data-theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  // Contextual suggestions disabled by user request for a cleaner UI
  useEffect(() => {
    setActiveSuggestions([]);
  }, [activeTab, isLoggedIn]);

  const handleLogin = (role, firebaseUser) => {
    setUserRole(role);
    setUser(firebaseUser);
    setIsLoggedIn(true);
    navigateTo("Home");
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (e) {
      console.error('Logout error:', e);
    }
    setIsLoggedIn(false);
    setUser(null);
    setUserRole('worker');
    navigateTo('Home');
  };

  const startCreate = () => {
    setEditJob(null);
    navigateTo("Create");
  };

  const startEdit = (job) => {
    setEditJob(job);
    navigateTo("Create");
  };

  const handleOnboardingComplete = (data) => {
    if (data?.role === 'admin') setUserRole('admin');
    setUserProfile(data);
    localStorage.setItem('jobGenie_profile', JSON.stringify(data));
    navigateTo("Home");
  };

  // Simple routing logic based on state
  const renderScreen = () => {
    if (!isLoggedIn) {
      return (
        <div style={{ height: '100%', background: '#fff', display: 'flex', flexDirection: 'column', padding: 0, position: 'relative' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 0 }}>
            <LiquidEther autoIntensity={1.5} colors={["#5B3FC8", "#9396FF", "#1F1B3D"]} />
          </div>
          <div style={{ position: 'relative', zIndex: 1, height: '100%' }}>
            <LoginScreen onLogin={handleLogin} />
          </div>
        </div>
      );
    }

    // Role-based routing
    if (userRole === 'admin') {
      switch (activeTab) {
        case "Home":
          return <AdminDashboard setActive={navigateTo} onEditJob={startEdit} onCreateJob={startCreate} jobs={adminJobs} applications={applications} />;
        case "Create":
          return <CreateJobScreen setActive={navigateTo} editData={editJob} user={user} />;
        case "Jobs":
        case "Campaigns":
          return <AdminJobsScreen setActive={navigateTo} onEditJob={startEdit} onCreateJob={startCreate} jobs={adminJobs} />;
        case "Reports":
          return <ReportsScreen setActive={navigateTo} isAdmin={true} jobs={adminJobs} applications={applications} attendance={attendance} />;
        case "Genie Ops":
          return <ChatScreen setActive={navigateTo} isAdmin={true} onNavigate={(screen, params) => {
            navigateTo(screen, params);
          }} />;
        case "Profile":
          return <ProfileScreen setActive={navigateTo} onLogout={handleLogout} isAdmin={true} jobsCount={adminJobs.length} applicationsCount={applications.length} isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} />;
        default:
          return <AdminDashboard setActive={navigateTo} onEditJob={startEdit} onCreateJob={startCreate} jobs={adminJobs} applications={applications} />;
      }
    }

    // Worker routing (Default)
    if (!userProfile && userRole === 'worker') {
      return <OnboardingScreen onComplete={handleOnboardingComplete} />;
    }

    switch (activeTab) {
      case "Home":
        return <HomeScreen setActive={navigateTo} isSafetyModeActive={isSafetyModeActive} userXP={userXP} userLevel={userLevel} userProfile={userProfile} jobs={adminJobs} applications={applications} />;
      case "Find Job":
        return <FindGigScreen setActive={navigateTo} initialSearch={screenParams?.search} jobs={adminJobs} applications={applications} />;
      case "My Jobs":
        return <MyJobsScreen setActive={navigateTo} params={screenParams} />;
      case "Attendance":
        return <AttendanceScreen setActive={navigateTo} screenParams={screenParams} />;
      case "Tasks":
        return <TasksScreen setActive={navigateTo} params={screenParams} />;
      case "Earnings":
        return <EarningsScreen setActive={navigateTo} />;
      case "Earnings Planner":
        return <EarningsPlannerScreen setActive={navigateTo} earningsGoal={earningsGoal} setEarningsGoal={setEarningsGoal} />;
      case "Safety":
        return <SafetyScreen setActive={navigateTo} isSafetyModeActive={isSafetyModeActive} setIsSafetyModeActive={setIsSafetyModeActive} />;
      case "Job Details":
        return <JobDetailsScreen setActive={navigateTo} params={screenParams} user={user} userProfile={userProfile} />;
      case "Genie AI":
        return <ChatScreen setActive={navigateTo} onNavigate={(screen, params) => {
          navigateTo(screen, params);
        }} />;
      case "Profile":
        return <ProfileScreen 
          setActive={navigateTo} 
          onLogout={handleLogout} 
          userProfile={userProfile} 
          userXP={userXP} 
          userLevel={userLevel} 
          isDarkMode={isDarkMode} 
          setIsDarkMode={setIsDarkMode} 
          applicationsCount={applications.length}
        />;
      case "Benefits":
        return <BenefitsScreen setActive={navigateTo} />;
      case "Loans":
        return <LoansScreen setActive={navigateTo} />;
      case "Onboarding":
        return <OnboardingScreen onComplete={handleOnboardingComplete} />;
      default:
        return <HomeScreen setActive={navigateTo} isSafetyModeActive={isSafetyModeActive} userXP={userXP} userLevel={userLevel} userProfile={userProfile} />;
    }
  };

  const handleSuggestionAction = (suggestion) => {
    setActiveTab(suggestion.target);
    setActiveSuggestions([]);
  };

  const handleVoiceAction = async (data) => {
    switch (data.intent) {
      case 'VIEW_EARNINGS':
        setActiveTab('Earnings');
        break;
      case 'FIND_JOBS':
        setActiveTab('Find Job');
        break;
      case 'CHECK_IN':
      case 'CHECK_OUT':
        setActiveTab('Attendance');
        break;
      case 'CREATE_JOB':
        if (userRole === 'admin') {
           const draft = await aiService.magicCreateJob(data.transcript);
           setEditJob({ ...draft, fromVoice: true });
           setActiveTab('Create');
        }
        break;
      default:
        break;
    }
  };

  return (
    <div className="mobile-container">
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab + (isLoggedIn ? 'logged-in' : 'logged-out')}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          style={{ height: '100%', width: '100%' }}
        >
          {renderScreen()}
        </motion.div>
      </AnimatePresence>
      

      <GenieVoiceAssistant 
        isOpen={isVoiceOpen} 
        onClose={() => setIsVoiceOpen(false)} 
        onAction={handleVoiceAction} 
      />

      {/* Persistent AI Assistant */}
      <AIChatbot 
        onNavigate={navigateTo} 
        isAdmin={userRole === 'admin'} 
        userContext={{
          role: userRole,
          xp: userXP,
          level: userLevel?.level,
          onboardingStatus: userProfile ? 'complete' : 'pending',
          activeTab: activeTab,
          availableJobs: adminJobs // Provide live jobs for context
        }}
      />
    </div>
  );
}

export default App;
