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
import Hyperspeed from './components/Hyperspeed';
import TrackingScreen from './screens/TrackingScreen';
import ReportsScreen from './screens/ReportsScreen';
import WorkerApplicationsScreen from './screens/WorkerApplicationsScreen';
import OnboardingScreen from './screens/OnboardingScreen';
import SafetyScreen from './screens/SafetyScreen';
import EarningsPlannerScreen from './screens/EarningsPlannerScreen';
import LiquidEther from './components/LiquidEther/LiquidEther';
import GenieActionBar from './components/GenieActionBar';
import { calculateLevel } from './constants/gamification';
import GenieVoiceAssistant from './components/GenieVoiceAssistant';

function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState('worker');
  const [activeTab, setActiveTab] = useState("Home");
  const [user, setUser] = useState(null);
  const [editJob, setEditJob] = useState(null);
  const [userProfile, setUserProfile] = useState(() => {
    const saved = localStorage.getItem('jobGenie_profile');
    return saved ? JSON.parse(saved) : null;
  });
  const [isSafetyModeActive, setIsSafetyModeActive] = useState(false);
  const [earningsGoal, setEarningsGoal] = useState(15000);
  const [userXP, setUserXP] = useState(() => Number(localStorage.getItem('jobGenie_xp')) || 0);
  const [isDarkMode, setIsDarkMode] = useState(() => localStorage.getItem('jobGenie_theme') === 'dark');
  const [offlineQueue, setOfflineQueue] = useState([]);
  const [activeSuggestions, setActiveSuggestions] = useState([]);
  const [isVoiceOpen, setIsVoiceOpen] = useState(false);
  const [searchParams, setSearchParams] = useState(null);

  const userLevel = calculateLevel(userXP);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        setIsLoggedIn(true);
      } else {
        setUser(null);
        setIsLoggedIn(false);
      }
      // Hide splash after auth state is determined + extra delay for effect
      setTimeout(() => setShowSplash(false), 2000);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    localStorage.setItem('jobGenie_xp', userXP);
  }, [userXP]);

  useEffect(() => {
    localStorage.setItem('jobGenie_theme', isDarkMode ? 'dark' : 'light');
    document.documentElement.setAttribute('data-theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  // Handle Contextual Suggestions
  useEffect(() => {
    if (!isLoggedIn) return;
    
    let suggestions = [];
    if (userRole === 'admin') {
      if (activeTab === 'Home') suggestions = [{ id: 'admin_insight', text: 'Worker demand peaking in Chennai South', actionLabel: 'REVIEW', target: 'Reports' }];
    } else {
      if (activeTab === 'Home') suggestions = [{ id: 'worker_find', text: '3 new high-pay gigs found nearby', actionLabel: 'FIND', target: 'Find Job' }];
      if (activeTab === 'Earnings') suggestions = [{ id: 'earnings_plan', text: 'You are ₹2k away from your weekly goal', actionLabel: 'PLAN', target: 'Earnings Planner' }];
    }
    setActiveSuggestions(suggestions);
  }, [activeTab, isLoggedIn, userRole]);

  const handleLogin = (role, firebaseUser) => {
    setUserRole(role);
    setUser(firebaseUser);
    setIsLoggedIn(true);
    setActiveTab("Home");
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
    setActiveTab('Home');
  };

  const startCreate = () => {
    setEditJob(null);
    setActiveTab("Create");
  };

  const startEdit = (job) => {
    setEditJob(job);
    setActiveTab("Create");
  };

  const handleOnboardingComplete = (data) => {
    setUserProfile(data);
    localStorage.setItem('jobGenie_profile', JSON.stringify(data));
    setActiveTab("Home");
  };

  // Simple routing logic based on state
  const renderScreen = () => {
    if (showSplash) {
      return (
        <div style={{ height: '100%', position: 'relative', overflow: 'hidden', background: '#000', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 0 }}>
             <Hyperspeed />
          </div>
          <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div className="fade-in" style={{ fontSize: 60, marginBottom: 20, animation: 'bounce 2s infinite' }}>🧞</div>
            <div className="fade-in" style={{ fontSize: 32, fontWeight: 800, letterSpacing: -1 }}>Job Genie</div>
            <div className="fade-in" style={{ fontSize: 13, opacity: 0.7, marginTop: 8, fontWeight: 600 }}>Find Work. Track Work. Grow.</div>
          </div>
          
          <style>{`
            @keyframes bounce {
              0%, 100% { transform: translateY(0); }
              50% { transform: translateY(-20px); }
            }
          `}</style>
        </div>
      );
    }

    if (!isLoggedIn) {
      return (
        <div style={{ height: '100%', position: 'relative' }}>
          <LiquidEther autoIntensity={1.5} colors={["#5B3FC8", "#9396FF", "#1F1B3D"]} />
          <LoginScreen onLogin={handleLogin} />
        </div>
      );
    }

    // Role-based routing
    if (userRole === 'admin') {
      switch (activeTab) {
        case "Home":
          return <AdminDashboard setActive={setActiveTab} onEditJob={startEdit} onCreateJob={startCreate} />;
        case "Create":
          return <CreateJobScreen setActive={setActiveTab} editData={editJob} />;
        case "Live":
          return <TrackingScreen setActive={setActiveTab} />;
        case "Applications":
          return <WorkerApplicationsScreen setActive={setActiveTab} />;
        case "Reports":
          return <ReportsScreen setActive={setActiveTab} />;
        case "Genie Ops":
          return <ChatScreen setActive={setActiveTab} isAdmin={true} onNavigate={(screen, params) => {
            setSearchParams(params);
            setActiveTab(screen);
          }} />;
        case "Profile":
          return <ProfileScreen setActive={setActiveTab} onLogout={handleLogout} isAdmin={userRole === 'admin'} />;
        default:
          return <AdminDashboard setActive={setActiveTab} onEditJob={startEdit} onCreateJob={startCreate} />;
      }
    }

    // Worker routing (Default)
    if (!userProfile && userRole === 'worker') {
      return <OnboardingScreen onComplete={handleOnboardingComplete} />;
    }

    switch (activeTab) {
      case "Home":
        return <HomeScreen setActive={setActiveTab} isSafetyModeActive={isSafetyModeActive} />;
      case "Find Job":
        return <FindGigScreen setActive={setActiveTab} initialSearch={searchParams?.search} />;
      case "My Jobs":
        return <MyJobsScreen setActive={setActiveTab} />;
      case "Attendance":
        return <AttendanceScreen setActive={setActiveTab} />;
      case "Tasks":
        return <TasksScreen setActive={setActiveTab} />;
      case "Earnings":
        return <EarningsScreen setActive={setActiveTab} />;
      case "Earnings Planner":
        return <EarningsPlannerScreen setActive={setActiveTab} earningsGoal={earningsGoal} setEarningsGoal={setEarningsGoal} />;
      case "Safety":
        return <SafetyScreen setActive={setActiveTab} isSafetyModeActive={isSafetyModeActive} setIsSafetyModeActive={setIsSafetyModeActive} />;
      case "Job Details":
        return <JobDetailsScreen setActive={setActiveTab} />;
      case "Genie AI":
        return <ChatScreen setActive={setActiveTab} onNavigate={(screen, params) => {
          setSearchParams(params);
          setActiveTab(screen);
        }} />;
      case "Profile":
        return <ProfileScreen setActive={setActiveTab} onLogout={handleLogout} userProfile={userProfile} />;
      case "Benefits":
        return <BenefitsScreen setActive={setActiveTab} />;
      case "Loans":
        return <LoansScreen setActive={setActiveTab} />;
      case "Onboarding":
        return <OnboardingScreen onComplete={handleOnboardingComplete} />;
      default:
        return <HomeScreen setActive={setActiveTab} isSafetyModeActive={isSafetyModeActive} />;
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
      
      {isLoggedIn && (
        <GenieActionBar 
          activeTab={activeTab} 
          userRole={userRole} 
          suggestions={activeSuggestions} 
          onAction={handleSuggestionAction}
          onVoiceOpen={() => setIsVoiceOpen(true)}
        />
      )}

      <GenieVoiceAssistant 
        isOpen={isVoiceOpen} 
        onClose={() => setIsVoiceOpen(false)} 
        onAction={handleVoiceAction} 
      />
    </div>
  );
}

export default App;
