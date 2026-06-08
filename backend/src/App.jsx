import React, { useState, useEffect, lazy, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TRANSLATIONS, LANGUAGES } from './constants/translations';
import { calculateLevel } from './constants/gamification';
// Custom hooks
import { useAuth }        from './hooks/useAuth';
import { useDataStreams } from './hooks/useDataStreams';
import { useNavigation }  from './hooks/useNavigation';

// Eagerly loaded — LoginScreen only (always the first screen on cold start)
import LoginScreen from './screens/LoginScreen';

// Components
import LoadingScreen       from './components/LoadingScreen';
import GenieVoiceAssistant from './components/GenieVoiceAssistant';
import { TutorialModal, NotificationBanner } from './components/TutorialModal';
import ScreenErrorBoundary from './components/ScreenErrorBoundary';
import ScreenCarousel      from './components/ScreenCarousel';
import NavBar              from './components/NavBar';

// Auth-gated screens — lazy loaded (only shown after login resolves)
const HomeScreen    = lazy(() => import('./screens/HomeScreen'));
const FindGigScreen = lazy(() => import('./screens/FindGigScreen'));
const ProfileScreen = lazy(() => import('./screens/ProfileScreen'));

// Lazy loaded — all other screens
const OnboardingScreen         = lazy(() => import('./screens/OnboardingScreen'));
const ChatScreen               = lazy(() => import('./screens/ChatScreen'));
const WorkerAIScreen           = lazy(() => import('./screens/WorkerAIScreen'));
const AdminDashboard           = lazy(() => import('./screens/AdminDashboard'));
const SuperAdminDashboard      = lazy(() => import('./screens/SuperAdminDashboard'));
const BenefitsScreen           = lazy(() => import('./screens/BenefitsScreen'));
const LoansScreen              = lazy(() => import('./screens/LoansScreen'));
const AttendanceScreen         = lazy(() => import('./screens/AttendanceScreen'));
const MyJobsScreen             = lazy(() => import('./screens/MyJobsScreen'));
const TasksScreen              = lazy(() => import('./screens/TasksScreen'));
const EarningsScreen           = lazy(() => import('./screens/EarningsScreen'));
const JobDetailsScreen         = lazy(() => import('./screens/JobDetailsScreen'));
const CreateJobScreen          = lazy(() => import('./screens/CreateJobScreen'));
const TrackingScreen           = lazy(() => import('./screens/TrackingScreen'));
const ReportsScreen            = lazy(() => import('./screens/ReportsScreen'));
const WorkerApplicationsScreen = lazy(() => import('./screens/WorkerApplicationsScreen'));
const SafetyScreen             = lazy(() => import('./screens/SafetyScreen'));
const AdminJobsScreen          = lazy(() => import('./screens/AdminJobsScreen'));
const EarningsPlannerScreen    = lazy(() => import('./screens/EarningsPlannerScreen'));
const SkillTreeScreen          = lazy(() => import('./screens/SkillTreeScreen'));
const LeaderboardScreen        = lazy(() => import('./screens/LeaderboardScreen'));
const ScheduleScreen           = lazy(() => import('./screens/ScheduleScreen'));
const TimesheetsScreen         = lazy(() => import('./screens/TimesheetsScreen'));
const DocumentsScreen          = lazy(() => import('./screens/DocumentsScreen'));
const SupportScreen            = lazy(() => import('./screens/SupportScreen'));
const TimeOffScreen            = lazy(() => import('./screens/TimeOffScreen'));
const TrainingScreen           = lazy(() => import('./screens/TrainingScreen'));
const EWAScreen                = lazy(() => import('./screens/EWAScreen'));
const DemoJobScreen            = lazy(() => import('./screens/DemoJobScreen'));

function App() {
  // ── Device Detection (for performance optimization) ────────────────────────
  const [deviceTier, setDeviceTier] = useState('high');
  
  useEffect(() => {
    // Detect device capability for 3D effect disabling
    const ua = navigator.userAgent.toLowerCase();
    const hasLowRAM = navigator.deviceMemory && navigator.deviceMemory <= 4;
    const isLowEndPhone = ua.includes('galaxy a') || ua.includes('redmi') || ua.includes('poco') || ua.includes('samsung');
    const isMobile = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(ua);
    
    // Low-end detection: low RAM, budget phone, or mobile with low RAM
    if (hasLowRAM || isLowEndPhone) {
      setDeviceTier('low');
      console.log('[Performance] Low-end device detected (RAM:', navigator.deviceMemory, 'GB): disabling 3D effects');
    }
    // Mobile-only: disable heavy 3D on all mobile by default for better performance
    else if (isMobile) {
      setDeviceTier('medium');
      console.log('[Performance] Mobile device detected: reducing 3D intensity');
    }
  }, []);

  // ── Custom hooks ──────────────────────────────────────────────────────────
  const {
    isLoggedIn, user, userProfile, userRole, initializing,
    handleLogin, handleLogout, handleOnboardingComplete, updateProfile, forceReady,
  } = useAuth();

  const { activeTab, screenParams, navigateTo } = useNavigation('Home');

  const { adminJobs, applications, attendance, timeOffRequests } = useDataStreams({
    isLoggedIn, user, userRole,
  });

  // ── Local UI state ────────────────────────────────────────────────────────
  const [isSafetyModeActive, setIsSafetyModeActive] = useState(false);
  const [earningsGoal, setEarningsGoal]             = useState(15000);
  const [userXP]                                    = useState(0);
  const [isVoiceOpen, setIsVoiceOpen]               = useState(false);
  const [showTutorial]                              = useState(false);
  const [currentLang, setCurrentLang]               = useState(localStorage.getItem('GENIE_LANG') || 'English');
  const theme = 'light';

  // Demo banner: show for first-time workers who haven't completed demo yet
  const [showDemoBanner, setShowDemoBanner] = useState(
    () => !localStorage.getItem('GENIE_DEMO_DONE')
  );
  const handleDismissDemo = () => {
    localStorage.setItem('GENIE_DEMO_DONE', 'true');
    setShowDemoBanner(false);
  };
  
  // 3D effects are only shown on high-end devices for performance
  const enable3D = deviceTier === 'high';

  const t          = TRANSLATIONS[currentLang] || TRANSLATIONS.English;
  const userLevel  = calculateLevel(userXP);
  const isDarkMode = false;
  const setIsDarkMode = () => {};

  // Sync theme + lang side effects
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', 'light');
    localStorage.removeItem('GENIE_THEME');
  }, []);

  useEffect(() => {
    localStorage.setItem('GENIE_LANG', currentLang);
    const langObj = LANGUAGES?.find(l => l.label === currentLang) || { code: 'en' };
    const isRTL = langObj.code === 'ur';
    document.documentElement.dir  = isRTL ? 'rtl' : 'ltr';
    document.documentElement.lang = langObj.code;
    document.body.classList.toggle('rtl-active', isRTL);
  }, [currentLang]);

  // Measure and clamp safe area top inset to avoid giant whitespace layout bugs in WebViews
  useEffect(() => {
    const temp = document.createElement('div');
    temp.style.position = 'absolute';
    temp.style.top = 'env(safe-area-inset-top, 0px)';
    temp.style.height = '0px';
    temp.style.visibility = 'hidden';
    temp.style.pointerEvents = 'none';
    document.body.appendChild(temp);

    const measureSafeTop = () => {
      if (!temp.parentNode) return;
      const computed = window.getComputedStyle(temp).top;
      const val = parseFloat(computed) || 0;
      
      // Typical notch/status bar safe top is between 0px and 60px.
      // If it is reported as larger than 60px, it's a buggy WebView layout.
      // We clamp it to a standard 24px status bar size in that case.
      const safeTop = val > 60 ? 24 : val;
      const headerPad = safeTop > 0 ? Math.max(44, safeTop + 8) : 16;
      
      document.documentElement.style.setProperty('--safe-area-top', `${safeTop}px`);
      document.documentElement.style.setProperty('--safe-top', `${safeTop}px`);
      document.documentElement.style.setProperty('--header-pad', `${headerPad}px`);
      
      if (temp.parentNode) {
        document.body.removeChild(temp);
      }
    };

    requestAnimationFrame(measureSafeTop);
  }, []);

  // ── Shared profile update handler ─────────────────────────────────────────
  const onUpdateProfile = (newData) => updateProfile(newData, user?.uid);

  // ── Shared ProfileScreen props ────────────────────────────────────────────
  const profileProps = (extra = {}) => ({
    setActive: navigateTo,
    onLogout: handleLogout,
    userProfile,
    isDarkMode, setIsDarkMode,
    theme,
    currentLang, setCurrentLang,
    t,
    onUpdateProfile,
    ...extra,
  });

  // ── Voice handler ─────────────────────────────────────────────────────────
  const handleVoiceAction = async (data) => {
    switch (data.intent) {
      case 'VIEW_EARNINGS': navigateTo('Earnings'); break;
      case 'FIND_JOBS':     navigateTo('Find Job'); break;
      case 'CHECK_IN':      navigateTo('Attendance'); break;
      case 'CREATE_JOB':
        if (userRole === 'admin') {
          const { aiService } = await import('./services/aiService');
          const draft = await aiService.magicCreateJob(data.transcript);
          navigateTo('Create', { editData: { ...draft, fromVoice: true } });
        }
        break;
      default: break;
    }
  };

  // ── Screen renderer ───────────────────────────────────────────────────────
  const renderScreen = (tabId = activeTab) => {
    if (initializing) return <LoadingScreen onForceSkip={forceReady} />;

    if (!isLoggedIn) return <LoginScreen onLogin={handleLogin} t={t} currentLang={currentLang} />;

    // --- Onboarding Bypassed ---
    // Users will now go directly to their dashboards.
    // Ensure we handle cases where userProfile might be briefly missing.
    if (!userProfile) return <LoadingScreen />;

    // ── Super Admin ──
    if (userRole === 'super_admin') {
      const saProps = { setActive: navigateTo, user, userProfile, t, currentLang, setCurrentLang, theme, isDarkMode, setIsDarkMode };
      if (tabId === 'Profile') {
        return <ProfileScreen {...profileProps({ isAdmin: true, role: 'super_admin', jobsCount: 0, applicationsCount: 0 })} />;
      }
      return <SuperAdminDashboard {...saProps} activeTab={tabId} />;
    }

    // ── Admin ──
    if (userRole === 'admin') {
      switch (tabId) {
        case 'Home':
          return <AdminDashboard setActive={navigateTo} onEditJob={j => navigateTo('Create', { editData: j })} onCreateJob={() => navigateTo('Create')} jobs={adminJobs} applications={applications} attendance={attendance} timeOffRequests={timeOffRequests} userProfile={userProfile} t={t} currentLang={currentLang} />;
        case 'Create':
          return <CreateJobScreen setActive={navigateTo} editData={screenParams?.editData} user={user} t={t} currentLang={currentLang} />;
        case 'Jobs': case 'Campaigns':
          return <AdminJobsScreen setActive={navigateTo} onEditJob={j => navigateTo('Create', { editData: j })} onCreateJob={() => navigateTo('Create')} jobs={adminJobs} t={t} currentLang={currentLang} />;
        case 'Reports':
          return <ReportsScreen setActive={navigateTo} isAdmin jobs={adminJobs} applications={applications} attendance={attendance} t={t} currentLang={currentLang} />;
        case 'Profile':
          return <ProfileScreen {...profileProps({ isAdmin: true, jobsCount: adminJobs.length, applicationsCount: applications.length })} />;
        case 'Applications':
          return <WorkerApplicationsScreen setActive={navigateTo} t={t} currentLang={currentLang} />;
        case 'Genie Ops':
          return <ChatScreen setActive={navigateTo} onNavigate={navigateTo} isAdmin t={t} currentLang={currentLang} />;
        case 'Tracking':
          return <TrackingScreen setActive={navigateTo} t={t} currentLang={currentLang} />;
        case 'AdminApprovals':
          return <AdminApprovalsScreen setActive={navigateTo} timeOffRequests={timeOffRequests} t={t} />;
        default:
          return <AdminDashboard setActive={navigateTo} onEditJob={j => navigateTo('Create', { editData: j })} onCreateJob={() => navigateTo('Create')} jobs={adminJobs} applications={applications} attendance={attendance} timeOffRequests={timeOffRequests} userProfile={userProfile} t={t} />;
      }
    }

    // ── Worker ──
    switch (tabId) {
      case 'Home':
        return <HomeScreen setActive={navigateTo} isSafetyModeActive={isSafetyModeActive} userXP={userXP} userLevel={userLevel} userProfile={userProfile} user={user} jobs={adminJobs} applications={applications} userRole={userRole} t={t} theme={theme} showDemoBanner={showDemoBanner && userRole === 'worker'} onDismissDemo={handleDismissDemo} />;
      case 'Find Job':
        return <FindGigScreen setActive={navigateTo} userXP={userXP} initialSearch={screenParams?.search || ''} jobs={adminJobs} applications={applications} openVoice={() => setIsVoiceOpen(true)} t={t} currentLang={currentLang} user={user} />;
      case 'My Jobs':
        return <MyJobsScreen setActive={navigateTo} params={screenParams} t={t} currentLang={currentLang} />;
      case 'Attendance':
        return <AttendanceScreen setActive={navigateTo} screenParams={screenParams} setIsVoiceOpen={setIsVoiceOpen} setScreenParams={(p) => navigateTo(tabId, p)} t={t} currentLang={currentLang} />;
      case 'Tasks':
        return <TasksScreen setActive={navigateTo} params={screenParams} t={t} currentLang={currentLang} />;
      case 'Earnings':
        return <EarningsScreen setActive={navigateTo} t={t} currentLang={currentLang} />;
      case 'Earnings Planner':
        return <EarningsPlannerScreen setActive={navigateTo} earningsGoal={earningsGoal} setEarningsGoal={setEarningsGoal} t={t} currentLang={currentLang} />;
      case 'Safety':
        return <SafetyScreen setActive={navigateTo} isSafetyModeActive={isSafetyModeActive} setIsSafetyModeActive={setIsSafetyModeActive} t={t} currentLang={currentLang} />;
      case 'Job Details':
        return <JobDetailsScreen setActive={navigateTo} params={screenParams} user={user} userProfile={userProfile} jobs={adminJobs} t={t} currentLang={currentLang} />;
      case 'Loans':
        return <LoansScreen setActive={navigateTo} t={t} currentLang={currentLang} />;
      case 'Benefits':
        return <BenefitsScreen setActive={navigateTo} t={t} currentLang={currentLang} />;
      case 'Profile':
        return <ProfileScreen {...profileProps({ userXP, userLevel, applicationsCount: applications.length })} />;
      case 'Genie AI':
        return <WorkerAIScreen setActive={navigateTo} onNavigate={navigateTo} applications={applications} userXP={userXP} userProfile={userProfile} t={t} currentLang={currentLang} />;
      case 'Worker Chat':
        return <ChatScreen setActive={navigateTo} onNavigate={navigateTo} deepLinkJob={screenParams?.deepLinkJob} t={t} currentLang={currentLang} />;
      case 'Skill Tree':
        return <SkillTreeScreen setActive={navigateTo} userXP={userXP} userLevel={userLevel} t={t} currentLang={currentLang} />;
      case 'Leaderboard':
        return <LeaderboardScreen setActive={navigateTo} userProfile={userProfile} t={t} currentLang={currentLang} applicationsCount={applications.length} />;
      case 'Schedule':
        return <ScheduleScreen setActive={navigateTo} t={t} currentLang={currentLang} />;
      case 'Timesheets':
        return <TimesheetsScreen setActive={navigateTo} t={t} currentLang={currentLang} />;
      case 'Documents':
        return <DocumentsScreen setActive={navigateTo} t={t} currentLang={currentLang} />;
      case 'Support':
        return <SupportScreen setActive={navigateTo} t={t} currentLang={currentLang} />;
      case 'Time Off':
        return <TimeOffScreen setActive={navigateTo} user={user} timeOffRequests={timeOffRequests} t={t} currentLang={currentLang} />;
      case 'Training':
        return <TrainingScreen setActive={navigateTo} t={t} currentLang={currentLang} />;
      case 'EWA':
        return <EWAScreen setActive={navigateTo} t={t} currentLang={currentLang} />;
      case 'Demo Job':
        return <DemoJobScreen setActive={(screen) => { if (screen === 'Find Job' || screen === 'Home') handleDismissDemo(); navigateTo(screen); }} t={t} />;
      default:
        return <HomeScreen setActive={navigateTo} isSafetyModeActive={isSafetyModeActive} userXP={userXP} userLevel={userLevel} userProfile={userProfile} t={t} />;
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────
  const WORKER_MAIN_TABS = ['Home', 'Find Job', 'Genie AI', 'Earnings', 'Profile'];
  const ADMIN_MAIN_TABS = ['Home', 'Genie Ops', 'Create', 'Reports', 'Profile'];
  const SUPER_ADMIN_MAIN_TABS = ['Home', 'Profile'];

  const mainTabs = userRole === 'admin'
    ? ADMIN_MAIN_TABS
    : userRole === 'super_admin'
      ? SUPER_ADMIN_MAIN_TABS
      : WORKER_MAIN_TABS;

  const isMainTab = isLoggedIn && userProfile && mainTabs.includes(activeTab);

  return (
    <div className={`mobile-container ${userRole}`} style={{ height: '100dvh', minHeight: 0 }}>
      <div className="cyber-hud-overlay"><div className="scanline" /></div>

      <AnimatePresence mode="popLayout">
        {isMainTab ? (
          <motion.div
            key={`main-tabs-carousel-${userRole}-${user?.uid || ''}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.12, ease: 'easeOut' }}
            style={{ flex: 1, width: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative', zIndex: 1, minHeight: 0 }}
          >
            <div style={{ flex: 1, width: '100%', overflow: 'hidden', position: 'relative', minHeight: 0 }}>
              <ScreenCarousel
                activeTab={activeTab}
                setActiveTab={navigateTo}
                mainTabs={mainTabs}
                renderScreen={renderScreen}
              />
            </div>
            <NavBar
              active={activeTab}
              setActive={navigateTo}
              role={userRole}
              isAdmin={userRole === 'admin'}
              t={t}
            />
          </motion.div>
        ) : (
          <motion.div
            key={activeTab}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.12, ease: 'easeOut' }}
            style={{ flex: 1, width: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative', zIndex: 1, minHeight: 0 }}
          >
            <ScreenErrorBoundary key={activeTab} screenName={activeTab} onGoHome={() => navigateTo('Home')}>
              <Suspense fallback={<LoadingScreen />}>
                {renderScreen()}
              </Suspense>
            </ScreenErrorBoundary>
          </motion.div>
        )}
      </AnimatePresence>

      <NotificationBanner />
      <GenieVoiceAssistant isOpen={isVoiceOpen} onClose={() => setIsVoiceOpen(false)} onAction={handleVoiceAction} />
      {showTutorial && <TutorialModal onClose={() => {}} />}
    </div>
  );
}

export default App;
 
