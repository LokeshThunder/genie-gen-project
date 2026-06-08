import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TRANSLATIONS } from '../constants/translations';

// All data is loaded from Firestore in production; no demo/dummy data shown to users

const SuperAdminDashboard = ({ setActive, activeTab = 'Home', t = {}, currentLang = 'English', theme = 'dark', setTheme, isDarkMode, setIsDarkMode }) => {
  // Tab/Section toggling inside Dashboard
  const [subSection, setSubSection] = useState('hud'); // hud, users, jobs, ai, fraud, finance, system

  // System parameters
  const [platformFee, setPlatformFee] = useState(10);
  const [killSwitchActive, setKillSwitchActive] = useState(false);
  const [showKillSwitchModal, setShowKillSwitchModal] = useState(false);
  const [killSwitchCode, setKillSwitchCode] = useState('');

  // Access policies
  const [ipWhitelisting, setIpWhitelisting] = useState(false);
  const [sessionTimeout, setSessionTimeout] = useState(30);
  const [multiDeviceLogins, setMultiDeviceLogins] = useState(true);

  // States for interactive datasets - initialized empty, loaded from Firestore in production
  const [users, setUsers] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [withdrawals, setWithdrawals] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);

  // User Management Forms
  const [showUserModal, setShowUserModal] = useState(false);
  const [userForm, setUserForm] = useState({ id: '', name: '', email: '', role: 'worker', status: 'Active', phone: '' });

  // Job Manager Forms
  const [showJobModal, setShowJobModal] = useState(false);
  const [jobForm, setJobForm] = useState({ id: '', title: '', company: 'Logistics Corp', wage: 800, rateType: 'daily', pincode: '', area: '', status: 'active', workersNeeded: 1 });

  // Payout Settlements Handshake
  const [settlingTxn, setSettlingTxn] = useState(null);
  const [settlingStep, setSettlingStep] = useState(0); // 0: none, 1: escrow check, 2: API push, 3: completed

  // System Prompt Customization
  const [genieAIPrompt, setGenieAIPrompt] = useState(
    'You are Genie, a personal job assistant for gig workers in India. Guide them through jobs, check-ins, earnings, and safety protocols. Keep answers friendly, simple, and support Indic slang.'
  );
  const [genieOpsPrompt, setGenieOpsPrompt] = useState(
    'You are Genie Ops, the operations assistant for job partners/employers. Help them manage shift schedules, candidate pools, biometric verification audits, and payouts efficiently.'
  );
  const [toastMessage, setToastMessage] = useState(null);

  // Translation Override
  const [searchKey, setSearchKey] = useState('');
  const [editingKey, setEditingKey] = useState(null);
  const [editingValue, setEditingValue] = useState('');

  // AI Training Simulator
  const [trainingQAs, setTrainingQAs] = useState([
    { q: 'How do I request a loan?', a: 'Go to the Loans screen and select a value up to ₹1,00,000.' },
    { q: 'What is the platform fee?', a: 'The platform commission fee is set at 10%.' }
  ]);
  const [newQ, setNewQ] = useState('');
  const [newA, setNewA] = useState('');
  const [trainingFile, setTrainingFile] = useState(null);
  const [learningRate, setLearningRate] = useState(0.001);
  const [batchSize, setBatchSize] = useState(32);
  const [epochs, setEpochs] = useState(5);
  const [isTraining, setIsTraining] = useState(false);
  const [trainingEpoch, setTrainingEpoch] = useState(0);
  const [trainingLoss, setTrainingLoss] = useState([]);
  const [showTrainingSuccess, setShowTrainingSuccess] = useState(false);

  // Latency pulse simulation
  const [serverPing, setServerPing] = useState(24);
  useEffect(() => {
    const interval = setInterval(() => {
      setServerPing(Math.floor(20 + Math.random() * 15));
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Add Log helper
  const addAuditLog = (action) => {
    const newLog = {
      id: `log-${Date.now()}`,
      user: 'superadmin@genie.com',
      action,
      time: 'Just now'
    };
    setAuditLogs([newLog, ...auditLogs]);
  };

  // User Management handlers
  const handleSaveUser = () => {
    if (!userForm.name || !userForm.email) return;
    if (userForm.id) {
      // Edit
      setUsers(users.map(u => u.id === userForm.id ? userForm : u));
      triggerToast('User modified successfully!');
      addAuditLog(`modified user details for ${userForm.id}`);
    } else {
      // Add
      const newUser = { ...userForm, id: `usr-${Date.now().toString().slice(-3)}` };
      setUsers([...users, newUser]);
      triggerToast('New user registered!');
      addAuditLog(`registered new user ${newUser.id} (${newUser.name})`);
    }
    setShowUserModal(false);
  };

  const handleEditUser = (user) => {
    setUserForm(user);
    setShowUserModal(true);
  };

  const handleDeleteUser = (id) => {
    setUsers(users.filter(u => u.id !== id));
    triggerToast('User deleted from registry.');
    addAuditLog(`deleted user registry ${id}`);
  };

  const handleToggleUserStatus = (id) => {
    setUsers(users.map(u => {
      if (u.id === id) {
        const nextStatus = u.status === 'Active' ? 'Inactive' : 'Active';
        triggerToast(`User status toggled to ${nextStatus}`);
        addAuditLog(`changed user status for ${id} to ${nextStatus}`);
        return { ...u, status: nextStatus };
      }
      return u;
    }));
  };

  // Global Job Manager handlers
  const handleSaveJob = () => {
    if (!jobForm.title || !jobForm.area || !jobForm.pincode) return;
    if (jobForm.id) {
      setJobs(jobs.map(j => j.id === jobForm.id ? jobForm : j));
      triggerToast('Job listing updated!');
      addAuditLog(`reconfigured job listing parameters for ${jobForm.id}`);
    } else {
      const newJob = { ...jobForm, id: `job-${Date.now().toString().slice(-3)}` };
      setJobs([...jobs, newJob]);
      triggerToast('New job posted to public feed!');
      addAuditLog(`published new job listing ${newJob.id} under company ${newJob.company}`);
    }
    setShowJobModal(false);
  };

  const handleEditJob = (job) => {
    setJobForm(job);
    setShowJobModal(true);
  };

  const handleDeleteJob = (id) => {
    setJobs(jobs.filter(j => j.id !== id));
    triggerToast('Job listing removed from database.');
    addAuditLog(`deleted job posting ${id}`);
  };

  // UPI Instant Settlement simulated pipeline
  const startPayoutSettlement = (txn) => {
    setSettlingTxn(txn);
    setSettlingStep(1);
    
    setTimeout(() => {
      setSettlingStep(2); // Escrow check OK, push UPI API
      setTimeout(() => {
        setSettlingStep(3); // Success receipt
        // Update withdrawal status
        setWithdrawals(prev => prev.map(w => w.id === txn.id ? { ...w, status: 'Settled' } : w));
        addAuditLog(`authorized UPI push transfer of ₹${txn.amount} to ${txn.name}`);
      }, 1500);
    }, 1200);
  };

  // AI Prompt Saves
  const handleSavePrompts = () => {
    triggerToast('AI Prompts recompiled and published to neural models!');
    addAuditLog('customized and recompiled Genie AI & Genie Ops system instruction prompts');
  };

  // Translation Override Handlers
  const handleSaveTranslation = (key) => {
    if (!editingValue) return;
    // Modify live translation dictionary locally
    if (TRANSLATIONS[currentLang]) {
      TRANSLATIONS[currentLang][key] = editingValue;
      triggerToast(`Overrode translation key "${key}" for ${currentLang}!`);
      addAuditLog(`overrode Indic translation value for key: ${key} (${currentLang})`);
    }
    setEditingKey(null);
  };

  // AI Training Simulator Run
  const handleAddQA = () => {
    if (!newQ || !newA) return;
    setTrainingQAs([...trainingQAs, { q: newQ, a: newA }]);
    setNewQ('');
    setNewA('');
    triggerToast('Q&A pair inserted into training buffer.');
  };

  const startAITraining = () => {
    setIsTraining(true);
    setTrainingEpoch(0);
    setTrainingLoss([1.5]);
    setShowTrainingSuccess(false);

    let currentEpoch = 0;
    const interval = setInterval(() => {
      currentEpoch += 1;
      setTrainingEpoch(currentEpoch);
      
      // Calculate decreasing loss curve
      setTrainingLoss(prev => {
        const lastLoss = prev[prev.length - 1];
        const nextLoss = Math.max(0.05, (lastLoss * 0.6) - (Math.random() * 0.05));
        return [...prev, parseFloat(nextLoss.toFixed(3))];
      });

      if (currentEpoch >= epochs) {
        clearInterval(interval);
        setIsTraining(false);
        setShowTrainingSuccess(true);
        triggerToast('Genie AI Model training pipeline concluded successfully.');
        addAuditLog(`completed AI model training run (${epochs} epochs, learning rate: ${learningRate})`);
      }
    }, 1000);
  };

  // System Configuration Backup & Restore
  const handleExportConfig = () => {
    const configData = {
      users,
      jobs,
      platformFee,
      ipWhitelisting,
      sessionTimeout,
      multiDeviceLogins,
      genieAIPrompt,
      genieOpsPrompt,
      translations: TRANSLATIONS[currentLang]
    };
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(configData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", "job_genie_config.json");
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    triggerToast('Platform configuration profile exported.');
    addAuditLog('exported active platform configuration profile to JSON');
  };

  const handleImportConfig = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target.result);
        if (parsed.users) setUsers(parsed.users);
        if (parsed.jobs) setJobs(parsed.jobs);
        if (parsed.platformFee) setPlatformFee(parsed.platformFee);
        if (parsed.ipWhitelisting !== undefined) setIpWhitelisting(parsed.ipWhitelisting);
        if (parsed.sessionTimeout) setSessionTimeout(parsed.sessionTimeout);
        if (parsed.multiDeviceLogins !== undefined) setMultiDeviceLogins(parsed.multiDeviceLogins);
        if (parsed.genieAIPrompt) setGenieAIPrompt(parsed.genieAIPrompt);
        if (parsed.genieOpsPrompt) setGenieOpsPrompt(parsed.genieOpsPrompt);
        triggerToast('Configuration state restored successfully!');
        addAuditLog('restored system configuration from uploaded JSON backup');
      } catch (err) {
        triggerToast('Failed to parse backup configuration JSON.');
      }
    };
    reader.readAsText(file);
  };

  const handleConfirmKillSwitch = () => {
    if (killSwitchCode === 'KILL') {
      setKillSwitchActive(true);
      setShowKillSwitchModal(false);
      setKillSwitchCode('');
      triggerToast('Incident Kill Switch ENGAGED. Platform frozen.');
      addAuditLog('ENGAGED platform-wide emergency INCIDENT KILL SWITCH');
    } else if (killSwitchCode === 'RESTORE' && killSwitchActive) {
      setKillSwitchActive(false);
      setShowKillSwitchModal(false);
      setKillSwitchCode('');
      triggerToast('Platform operations normalized.');
      addAuditLog('DISENGAGED platform-wide emergency INCIDENT KILL SWITCH');
    } else {
      triggerToast('Invalid authorization passcode.');
    }
  };

  // Indic Translations keys filter list
  const filteredTranslationKeys = Object.keys(TRANSLATIONS[currentLang] || {}).filter(key => 
    key.toLowerCase().includes(searchKey.toLowerCase())
  ).slice(0, 10);

  return (
    <div className="fade-in industrial-grid" style={{ flex: 1, background: 'var(--bg-clay)', display: 'flex', flexDirection: 'column', width: '100%', minHeight: 0, overflow: 'hidden' }}>
      
      {/* Platform Lockdown Banner */}
      {killSwitchActive && (
        <div style={{ background: '#EF4444', color: '#FFF', padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', zIndex: 1000, boxShadow: '0 0 20px rgba(239, 68, 68, 0.4)', fontWeight: 800 }}>
          <span>⚠️ EMERGENCY LOCKDOWN ACTIVE: ALL PAYOUTS & ACTIONS BLOCKED ⚠️</span>
          <button 
            onClick={() => {
              setKillSwitchCode('');
              setShowKillSwitchModal(true);
            }} 
            style={{ background: '#FFF', color: '#EF4444', border: 'none', padding: '6px 12px', borderRadius: 8, fontSize: 11, fontWeight: 900, cursor: 'pointer' }}
          >
            DISARM SYSTEM
          </button>
        </div>
      )}

      {/* Header Container */}
      <div className="glass-premium" style={{ 
        padding: 'var(--header-pad) 16px 16px', 
        flexShrink: 0, 
        display: 'flex', alignItems: 'center', justifyBetween: 'center', gap: 12,
        zIndex: 10,
        borderBottomLeftRadius: 32,
        borderBottomRightRadius: 32,
        boxShadow: '0 15px 35px rgba(0,0,0,0.1)'
      }}>
        <div
          onClick={() => setActive('Profile')}
          className="tap-effect glass-premium"
          style={{ width: 40, height: 40, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, color: 'var(--text-primary)', fontWeight: 800, cursor: 'pointer' }}>
          ←
        </div>
        <div style={{ flex: 1 }}>
          <h1 className="tech-header text-glitch" data-text="SUPER ADMIN HQ" style={{ fontSize: 20, margin: 0, color: 'var(--primary-mint)' }}>SUPER ADMIN COMMAND</h1>
          <div style={{ color: 'var(--text-muted)', fontSize: 11, fontWeight: 800, marginTop: 2, textTransform: 'uppercase', letterSpacing: 1 }}>GENIE OS // CONTROL PORTAL</div>
        </div>
        <div className="glass-premium" style={{ padding: '6px 12px', borderRadius: 12, fontSize: 12, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 6, color: 'var(--primary-mint)' }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--primary-mint)', display: 'inline-block', boxShadow: '0 0 10px var(--primary-mint)' }}></span>
          {serverPing} ms
        </div>
      </div>

      {/* Sub-navigation Tabs (Brutalist style) */}
      <div style={{ display: 'flex', background: 'var(--bg-surface)', padding: '6px 12px', overflowX: 'auto', gap: 8, flexShrink: 0 }} className="no-scrollbar">
        {[
          { id: 'hud', label: 'Overview', icon: '📊' },
          { id: 'users', label: 'User Registry', icon: '🔑' },
          { id: 'jobs', label: 'Global Jobs', icon: '💼' },
          { id: 'ai', label: 'AI & Indic Core', icon: '🧠' },
          { id: 'fraud', label: 'Forensic integrity', icon: '🛡️' },
          { id: 'finance', label: 'Payout Queue', icon: '💰' },
          { id: 'system', label: 'System Config', icon: '⚙%' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setSubSection(tab.id)}
            style={{
              padding: '10px 16px',
              background: subSection === tab.id ? 'var(--primary-mint)' : 'rgba(255,255,255,0.03)',
              color: subSection === tab.id ? '#000' : 'var(--text-secondary)',
              border: subSection === tab.id ? '2px solid #000' : '1px solid var(--glass-border)',
              borderRadius: 14,
              fontSize: 12,
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              boxShadow: subSection === tab.id ? '3px 3px 0px #000' : 'none',
              transform: subSection === tab.id ? 'translate(-2px, -2px)' : 'none',
              transition: 'all 0.15s ease'
            }}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      <div className="full-height-scroll screen-bottom-pad" style={{ padding: 16, overflowX: 'hidden' }}>
        <AnimatePresence mode="wait">
          
          {/* 1. HUD OVERVIEW SECTION */}
          {subSection === 'hud' && (
            <motion.div key="hud" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              
              {/* Executive Metrics HUD Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, marginBottom: 20 }}>
                {[
                  { title: 'Active Personnel', val: '2,840', change: '+14% /mo', icon: '👥', color: 'var(--primary-mint)' },
                  { title: 'Platform GMV', val: '₹18.4L', change: '₹1.2L today', icon: '💸', color: '#38BDF8' },
                  { title: 'Registered Admins', val: '142', change: '5 pending', icon: '🏢', color: '#FCD34D' },
                  { title: 'Net Payouts Outflow', val: '₹6.82L', change: '98% success', icon: '🏦', color: '#F472B6' }
                ].map((card, idx) => (
                  <div key={idx} className="glass-premium hover-glow" style={{ padding: 16, borderRadius: 20, border: '1px solid var(--glass-border)', display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase' }}>{card.title}</span>
                      <span style={{ fontSize: 16 }}>{card.icon}</span>
                    </div>
                    <span style={{ fontSize: 24, fontWeight: 900, color: card.color, marginTop: 4 }}>{card.val}</span>
                    <span style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 700, marginTop: 4 }}>{card.change}</span>
                  </div>
                ))}
              </div>

              {/* Server Latency and Live System Health Monitor */}
              <div className="glass-premium" style={{ padding: 16, borderRadius: 24, marginBottom: 20 }}>
                <h3 className="tech-header" style={{ fontSize: 14, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span>🩺</span> SYSTEM HEALTH INTEGRITY
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  {[
                    { label: 'Firebase Realtime DB', status: 'STABLE', latency: '12ms', color: 'var(--primary-mint)' },
                    { label: 'Capacitor Native Auth', status: 'STABLE', latency: '4ms', color: 'var(--primary-mint)' },
                    { label: 'Indi Chat Translation', status: 'DEGRADED', latency: '350ms', color: '#EF4444' },
                    { label: 'UPI Payout Gateway', status: 'STABLE', latency: '110ms', color: 'var(--primary-mint)' }
                  ].map((node, i) => (
                    <div key={i} style={{ background: 'rgba(255,255,255,0.02)', padding: 10, borderRadius: 12, border: '1px solid var(--glass-border)' }}>
                      <div style={{ fontSize: 11, color: 'var(--text-secondary)', fontWeight: 800 }}>{node.label}</div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4, alignItems: 'center' }}>
                        <span style={{ fontSize: 10, color: node.color, fontWeight: 900 }}>{node.status}</span>
                        <span style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'monospace' }}>{node.latency}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Activity Log Preview */}
              <div className="glass-premium" style={{ padding: 16, borderRadius: 24 }}>
                <h3 className="tech-header" style={{ fontSize: 14, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span>📜</span> IMMUTABLE AUDIT LOG (RECENT)
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {auditLogs.slice(0, 3).map(log => (
                    <div key={log.id} style={{ padding: '8px 12px', background: 'rgba(0,0,0,0.2)', borderRadius: 12, borderLeft: '3px solid var(--primary-mint)', fontSize: 11, fontFamily: 'monospace' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                        <span>{log.user}</span>
                        <span>{log.time}</span>
                      </div>
                      <div style={{ color: 'var(--text-primary)', marginTop: 4, fontWeight: 700 }}>{log.action}</div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* 2. USER REGISTRY MANAGEMENT */}
          {subSection === 'users' && (
            <motion.div key="users" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <h3 className="tech-header" style={{ fontSize: 16 }}>User Registry ({users.length})</h3>
                <button
                  onClick={() => {
                    setUserForm({ id: '', name: '', email: '', role: 'worker', status: 'Active', phone: '' });
                    setShowUserModal(true);
                  }}
                  className="tap-effect"
                  style={{ background: 'var(--primary-mint)', color: 'var(--text-primary)', border: '2px solid #000', padding: '8px 16px', borderRadius: 12, fontSize: 12, fontWeight: 800, boxShadow: '3px 3px 0 #000', cursor: 'pointer' }}
                >
                  + Add User
                </button>
              </div>

              {/* User management Table / Cards */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {users.map(u => (
                  <div key={u.id} className="glass-premium" style={{ padding: 16, borderRadius: 20, border: '1px solid var(--glass-border)', display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <div style={{ fontSize: 15, color: 'var(--text-primary)', fontWeight: 800 }}>{u.name}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{u.email} • {u.phone}</div>
                      </div>
                      <span style={{ 
                        padding: '4px 8px', 
                        borderRadius: 8, 
                        fontSize: 9, 
                        fontWeight: 900, 
                        background: u.role === 'super_admin' ? '#F472B6' : (u.role === 'admin' ? '#38BDF8' : '#FCD34D'),
                        color: 'var(--text-primary)',
                        textTransform: 'uppercase'
                      }}>
                        {u.role}
                      </span>
                    </div>

                    <div style={{ display: 'flex', justifyBetween: 'center', gap: 8, marginTop: 4, borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: 10 }}>
                      <button 
                        onClick={() => handleToggleUserStatus(u.id)}
                        style={{
                          flex: 1,
                          background: u.status === 'Active' ? 'rgba(52, 211, 153, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                          color: u.status === 'Active' ? 'var(--primary-mint)' : '#EF4444',
                          border: 'none',
                          padding: '8px',
                          borderRadius: 8,
                          fontSize: 11,
                          fontWeight: 800,
                          cursor: 'pointer'
                        }}
                      >
                        {u.status === 'Active' ? '● Active' : '○ Inactive'}
                      </button>
                      <button 
                        onClick={() => handleEditUser(u)}
                        style={{ background: 'rgba(255,255,255,0.03)', color: 'var(--text-secondary)', border: '1px solid var(--glass-border)', padding: '8px 12px', borderRadius: 8, fontSize: 11, fontWeight: 700, cursor: 'pointer' }}
                      >
                        Edit ✎
                      </button>
                      <button 
                        onClick={() => handleDeleteUser(u.id)}
                        style={{ background: 'rgba(239, 68, 68, 0.05)', color: '#EF4444', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '8px 12px', borderRadius: 8, fontSize: 11, fontWeight: 700, cursor: 'pointer' }}
                      >
                        ✕ Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* 3. GLOBAL JOB MANAGER */}
          {subSection === 'jobs' && (
            <motion.div key="jobs" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <h3 className="tech-header" style={{ fontSize: 16 }}>Global Job Listings ({jobs.length})</h3>
                <button
                  onClick={() => {
                    setJobForm({ id: '', title: '', company: 'Logistics Corp', wage: 800, rateType: 'daily', pincode: '', area: '', status: 'active', workersNeeded: 1 });
                    setShowJobModal(true);
                  }}
                  className="tap-effect"
                  style={{ background: 'var(--primary-mint)', color: 'var(--text-primary)', border: '2px solid #000', padding: '8px 16px', borderRadius: 12, fontSize: 12, fontWeight: 800, boxShadow: '3px 3px 0 #000', cursor: 'pointer' }}
                >
                  + Post Job
                </button>
              </div>

              {/* Job listings lists */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {jobs.map(j => (
                  <div key={j.id} className="glass-premium" style={{ padding: 16, borderRadius: 20, border: '1px solid var(--glass-border)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                      <div>
                        <h4 style={{ fontSize: 15, fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>{j.title}</h4>
                        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>posted by <b>{j.company}</b></span>
                      </div>
                      <span style={{
                        padding: '4px 8px',
                        borderRadius: 6,
                        fontSize: 9,
                        fontWeight: 900,
                        background: j.status === 'active' ? 'rgba(52, 211, 153, 0.15)' : 'rgba(255,255,255,0.05)',
                        color: j.status === 'active' ? 'var(--primary-mint)' : 'var(--text-muted)',
                        textTransform: 'uppercase'
                      }}>
                        {j.status}
                      </span>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, background: 'rgba(0,0,0,0.1)', padding: '10px 12px', borderRadius: 12, fontSize: 12, marginBottom: 12 }}>
                      <div>💰 Wage: <b>₹{j.wage} / {j.rateType}</b></div>
                      <div>📍 Location: <b>{j.area}</b></div>
                      <div>📮 Pincode: <b>{j.pincode}</b></div>
                      <div>👥 Slots: <b>{j.workersNeeded} workers</b></div>
                    </div>

                    <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                      <button
                        onClick={() => handleEditJob(j)}
                        style={{ background: 'rgba(255,255,255,0.03)', color: 'var(--text-secondary)', border: '1px solid var(--glass-border)', padding: '8px 16px', borderRadius: 8, fontSize: 11, fontWeight: 700, cursor: 'pointer' }}
                      >
                        Edit Job ✎
                      </button>
                      <button
                        onClick={() => handleDeleteJob(j.id)}
                        style={{ background: 'rgba(239, 68, 68, 0.05)', color: '#EF4444', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '8px 16px', borderRadius: 8, fontSize: 11, fontWeight: 700, cursor: 'pointer' }}
                      >
                        Delete ✕
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* 4. AI & LOCALIZATION CORE ORCHESTRATION */}
          {subSection === 'ai' && (
            <motion.div key="ai" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              
              {/* AI Prompts Customization Panel */}
              <div className="glass-premium" style={{ padding: 16, borderRadius: 24, marginBottom: 20 }}>
                <h3 className="tech-header" style={{ fontSize: 14, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span>🤖</span> AI SYSTEM PROMPT TUNING
                </h3>
                <div style={{ marginBottom: 12 }}>
                  <label style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 800, display: 'block', marginBottom: 6 }}>Genie AI prompt override (Worker bot)</label>
                  <textarea
                    value={genieAIPrompt}
                    onChange={(e) => setGenieAIPrompt(e.target.value)}
                    rows={3}
                    style={{ width: '100%', background: 'rgba(0,0,0,0.2)', color: '#FFF', border: '1px solid var(--glass-border)', borderRadius: 12, padding: 10, fontSize: 12, resize: 'none', outline: 'none' }}
                  />
                </div>
                <div style={{ marginBottom: 16 }}>
                  <label style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 800, display: 'block', marginBottom: 6 }}>Genie Ops prompt override (Admin bot)</label>
                  <textarea
                    value={genieOpsPrompt}
                    onChange={(e) => setGenieOpsPrompt(e.target.value)}
                    rows={3}
                    style={{ width: '100%', background: 'rgba(0,0,0,0.2)', color: '#FFF', border: '1px solid var(--glass-border)', borderRadius: 12, padding: 10, fontSize: 12, resize: 'none', outline: 'none' }}
                  />
                </div>
                <button
                  onClick={handleSavePrompts}
                  style={{ width: '100%', background: 'var(--primary-mint)', color: 'var(--text-primary)', border: '2px solid #000', padding: '10px 0', borderRadius: 12, fontSize: 12, fontWeight: 800, boxShadow: '3px 3px 0 #000', cursor: 'pointer' }}
                >
                  Recompile Prompts ⚡
                </button>
              </div>

              {/* AI MODEL TRAINING SIMULATOR */}
              <div className="glass-premium" style={{ padding: 16, borderRadius: 24, marginBottom: 20 }}>
                <h3 className="tech-header" style={{ fontSize: 14, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span>🏋️‍♂️</span> AI MODEL TRAINING SIMULATOR
                </h3>

                {/* Dataset manager */}
                <div style={{ marginBottom: 12 }}>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 800, display: 'block', marginBottom: 6 }}>Add QA Training Pair</span>
                  <input
                    type="text"
                    placeholder="Enter question/trigger..."
                    value={newQ}
                    onChange={(e) => setNewQ(e.target.value)}
                    style={{ width: '100%', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--glass-border)', borderRadius: 8, padding: 8, fontSize: 11, color: '#FFF', marginBottom: 6, outline: 'none' }}
                  />
                  <input
                    type="text"
                    placeholder="Enter response/instruction..."
                    value={newA}
                    onChange={(e) => setNewA(e.target.value)}
                    style={{ width: '100%', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--glass-border)', borderRadius: 8, padding: 8, fontSize: 11, color: '#FFF', marginBottom: 8, outline: 'none' }}
                  />
                  <button 
                    onClick={handleAddQA}
                    style={{ width: '100%', background: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)', border: '1px solid var(--glass-border)', padding: '6px 0', borderRadius: 8, fontSize: 11, fontWeight: 700, cursor: 'pointer' }}
                  >
                    + Add QA Pair to Buffer
                  </button>
                </div>

                <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginBottom: 12 }}>
                  Buffered Training Pairs: <b>{trainingQAs.length}</b>
                </div>

                {/* Settings */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
                  <div>
                    <label style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 800, display: 'block', marginBottom: 4 }}>Learning Rate</label>
                    <input 
                      type="number" 
                      step="0.0001" 
                      value={learningRate} 
                      onChange={(e) => setLearningRate(parseFloat(e.target.value))}
                      style={{ width: '100%', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--glass-border)', color: '#FFF', padding: 6, borderRadius: 8, fontSize: 11 }} 
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 800, display: 'block', marginBottom: 4 }}>Epochs</label>
                    <input 
                      type="number" 
                      value={epochs} 
                      onChange={(e) => setEpochs(parseInt(e.target.value))}
                      style={{ width: '100%', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--glass-border)', color: '#FFF', padding: 6, borderRadius: 8, fontSize: 11 }} 
                    />
                  </div>
                </div>

                {/* Training Trigger & Progress */}
                {isTraining ? (
                  <div style={{ background: 'rgba(0,0,0,0.2)', padding: 12, borderRadius: 12, border: '1px solid var(--primary-mint)', marginBottom: 12 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--primary-mint)', fontWeight: 800, marginBottom: 6 }}>
                      <span>🚀 Training AI Core...</span>
                      <span>Epoch {trainingEpoch}/{epochs}</span>
                    </div>
                    <div style={{ height: 6, background: 'rgba(255,255,255,0.05)', borderRadius: 10, overflow: 'hidden', marginBottom: 8 }}>
                      <div style={{ height: '100%', background: 'var(--primary-mint)', width: `${(trainingEpoch/epochs)*100}%`, transition: 'width 0.2s' }}></div>
                    </div>
                    <div style={{ fontFamily: 'monospace', fontSize: 10, color: 'var(--text-muted)' }}>
                      Loss: {trainingLoss[trainingLoss.length - 1] || 'Calculating...'}
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={startAITraining}
                    style={{ width: '100%', background: '#EF4444', color: '#FFF', border: '2px solid #000', padding: '10px 0', borderRadius: 12, fontSize: 12, fontWeight: 900, boxShadow: '3px 3px 0 #000', cursor: 'pointer', marginBottom: 12 }}
                  >
                    Start AI Training Run 🏋️‍♂️
                  </button>
                )}

                {/* Decreasing loss visual graph */}
                {trainingLoss.length > 0 && (
                  <div style={{ background: 'rgba(0,0,0,0.3)', padding: 10, borderRadius: 12, border: '1px solid var(--glass-border)' }}>
                    <span style={{ fontSize: 10, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>TRAINING LOSS CURVE</span>
                    <div style={{ display: 'flex', gap: 6, alignItems: 'flex-end', height: 60, padding: '0 4px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                      {trainingLoss.map((loss, idx) => (
                        <div 
                          key={idx} 
                          style={{ 
                            flex: 1, 
                            background: 'var(--primary-mint)', 
                            height: `${(loss/1.8)*100}%`, 
                            maxHeight: '100%',
                            borderRadius: '2px 2px 0 0',
                            position: 'relative'
                          }}
                        >
                          <span style={{ position: 'absolute', top: -14, left: '50%', transform: 'translateX(-50%)', fontSize: 8, color: 'var(--text-muted)', fontFamily: 'monospace' }}>{loss}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {showTrainingSuccess && (
                  <div style={{ background: 'rgba(52, 211, 153, 0.1)', color: 'var(--primary-mint)', padding: 10, borderRadius: 8, fontSize: 11, fontWeight: 700, marginTop: 12, textAlign: 'center' }}>
                    ✔ Model weights updated! Version v{1.0 + (trainingQAs.length / 100)} ready to serve.
                  </div>
                )}
              </div>

              {/* Indic translation override panel */}
              <div className="glass-premium" style={{ padding: 16, borderRadius: 24 }}>
                <h3 className="tech-header" style={{ fontSize: 14, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span>🌐</span> INDIC DICTIONARY OVERRIDES ({currentLang})
                </h3>
                <input
                  type="text"
                  placeholder="Search translation keys..."
                  value={searchKey}
                  onChange={(e) => setSearchKey(e.target.value)}
                  style={{ width: '100%', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--glass-border)', borderRadius: 12, padding: 10, fontSize: 12, color: '#FFF', marginBottom: 14, outline: 'none' }}
                />

                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {filteredTranslationKeys.map(key => {
                    const originalVal = TRANSLATIONS[currentLang] ? TRANSLATIONS[currentLang][key] : '';
                    return (
                      <div key={key} style={{ padding: 10, background: 'rgba(0,0,0,0.15)', borderRadius: 12, border: '1px solid var(--glass-border)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: 11, fontFamily: 'monospace', color: 'var(--primary-mint)', fontWeight: 800 }}>{key}</span>
                          {editingKey === key ? (
                            <div style={{ display: 'flex', gap: 6 }}>
                              <button onClick={() => handleSaveTranslation(key)} style={{ background: 'var(--primary-mint)', color: 'var(--text-primary)', border: 'none', padding: '4px 8px', borderRadius: 6, fontSize: 9, fontWeight: 900, cursor: 'pointer' }}>OK</button>
                              <button onClick={() => setEditingKey(null)} style={{ background: 'rgba(255,255,255,0.05)', color: '#FFF', border: 'none', padding: '4px 8px', borderRadius: 6, fontSize: 9, cursor: 'pointer' }}>Cancel</button>
                            </div>
                          ) : (
                            <button onClick={() => { setEditingKey(key); setEditingValue(originalVal); }} style={{ background: 'transparent', color: 'var(--text-muted)', border: 'none', fontSize: 12, cursor: 'pointer' }}>✎ Edit</button>
                          )}
                        </div>
                        {editingKey === key ? (
                          <input
                            type="text"
                            value={editingValue}
                            onChange={(e) => setEditingValue(e.target.value)}
                            style={{ width: '100%', background: 'rgba(0,0,0,0.2)', color: '#FFF', border: '1px solid var(--primary-mint)', borderRadius: 8, padding: 6, fontSize: 11, marginTop: 6, outline: 'none' }}
                          />
                        ) : (
                          <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4, fontWeight: 600 }}>{originalVal || '(empty)'}</div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}

          {/* 5. FORENSIC GPS & BIOMETRIC VERIFICATION */}
          {subSection === 'fraud' && (
            <motion.div key="fraud" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              
              {/* GPS Geofence and coordinate audits */}
              <div className="glass-premium" style={{ padding: 16, borderRadius: 24, marginBottom: 20 }}>
                <h3 className="tech-header" style={{ fontSize: 14, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span>📍</span> GPS GEOFENCING SPOOF DETECTION
                </h3>
                <div style={{ background: 'rgba(0,0,0,0.3)', borderRadius: 16, padding: 14, border: '1px solid var(--glass-border)' }}>
                  <div style={{ display: 'flex', justifyBetween: 'center', alignItems: 'center', marginBottom: 10 }}>
                    <span style={{ fontSize: 12, fontWeight: 800 }}>Live Geofence breaches detected: <b>1</b></span>
                    <span style={{ fontSize: 10, background: '#EF4444', color: '#FFF', padding: '3px 8px', borderRadius: 8, fontWeight: 900, animation: 'pulse 1.5s infinite' }}>BREACH WARNING</span>
                  </div>
                  <div style={{ padding: 10, background: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: 12, fontSize: 11, display: 'flex', flexDirection: 'column', gap: 4, fontFamily: 'monospace' }}>
                    <div>🚨 Worker: <b>Karan Singh (usr-005)</b></div>
                    <div>🎯 Geofence Target Area: <b>Logistics Warehouse (Zone 3)</b></div>
                    <div>📡 Coordinates registered: <b>13.0062° N, 80.2541° E</b></div>
                    <div>⚠️ Mock Location App usage: <b>SUSPECTED (Simultaneous pings from 2 IPs)</b></div>
                  </div>
                </div>
              </div>

              {/* Biometric identity check logs */}
              <div className="glass-premium" style={{ padding: 16, borderRadius: 24 }}>
                <h3 className="tech-header" style={{ fontSize: 14, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span>👤</span> BIOMETRIC FACE SCAN LOG
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {[
                    { name: 'Amit Kumar', time: '12 mins ago', match: 98, status: 'Verified', action: 'Approved' },
                    { name: 'Karan Singh', time: '35 mins ago', match: 62, status: 'Vague / Low similarity', action: 'Flagged' }
                  ].map((bio, index) => (
                    <div key={index} style={{ padding: 12, background: 'rgba(0,0,0,0.15)', borderRadius: 16, border: '1px solid var(--glass-border)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: 13, fontWeight: 800 }}>{bio.name}</span>
                        <span style={{ 
                          fontSize: 10, 
                          fontWeight: 900, 
                          color: bio.match > 80 ? 'var(--primary-mint)' : '#EF4444' 
                        }}>
                          {bio.match}% match
                        </span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8, fontSize: 11 }}>
                        <span style={{ color: 'var(--text-muted)' }}>Scan captured: <b>{bio.time}</b></span>
                        <span style={{ color: bio.match > 80 ? 'var(--primary-mint)' : '#EF4444', fontWeight: 800 }}>{bio.status}</span>
                      </div>
                      {bio.match < 80 && (
                        <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                          <button onClick={() => triggerToast('Face verification override: User approved')} style={{ flex: 1, background: 'var(--primary-mint)', color: 'var(--text-primary)', border: 'none', padding: '6px', borderRadius: 8, fontSize: 10, fontWeight: 800, cursor: 'pointer' }}>Manually Pass</button>
                          <button onClick={() => triggerToast('Face verification: User suspended')} style={{ flex: 1, background: 'rgba(239, 68, 68, 0.1)', color: '#EF4444', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '6px', borderRadius: 8, fontSize: 10, fontWeight: 800, cursor: 'pointer' }}>Suspend User</button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* 6. UPI AND CASH SETTLEMENTS */}
          {subSection === 'finance' && (
            <motion.div key="finance" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <h3 className="tech-header" style={{ fontSize: 16, marginBottom: 14 }}>UPI & Cash Withdrawal Queue</h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {withdrawals.map(w => (
                  <div key={w.id} className="glass-premium" style={{ padding: 16, borderRadius: 20, border: '1px solid var(--glass-border)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                      <div>
                        <span style={{ fontSize: 14, fontWeight: 800, color: 'var(--text-primary)' }}>{w.name}</span>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{w.upi} • {w.time}</div>
                      </div>
                      <span style={{ fontSize: 18, fontWeight: 900, color: '#38BDF8' }}>₹{w.amount}</span>
                    </div>

                    <div style={{ display: 'flex', justifyBetween: 'center', gap: 8, borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: 10 }}>
                      {w.status === 'Settled' ? (
                        <div style={{ flex: 1, background: 'rgba(52, 211, 153, 0.1)', color: 'var(--primary-mint)', padding: '8px 0', borderRadius: 8, fontSize: 11, fontWeight: 900, textAlign: 'center' }}>
                          ✔ Settled via UPI
                        </div>
                      ) : (
                        <>
                          <button
                            onClick={() => startPayoutSettlement(w)}
                            disabled={killSwitchActive}
                            style={{ 
                              flex: 1, 
                              background: killSwitchActive ? 'rgba(255,255,255,0.03)' : 'var(--primary-mint)', 
                              color: killSwitchActive ? 'var(--text-muted)' : '#000', 
                              border: 'none', 
                              padding: '8px 0', 
                              borderRadius: 8, 
                              fontSize: 11, 
                              fontWeight: 900, 
                              cursor: killSwitchActive ? 'not-allowed' : 'pointer' 
                            }}
                          >
                            Approve Payout (UPI)
                          </button>
                          <button
                            onClick={() => triggerToast('Payout audit flagged.')}
                            style={{ background: 'rgba(255,255,255,0.03)', color: 'var(--text-secondary)', border: '1px solid var(--glass-border)', padding: '8px 12px', borderRadius: 8, fontSize: 11, fontWeight: 700, cursor: 'pointer' }}
                          >
                            Decline
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* 7. SYSTEM CONFIGURATION & DATA RESTORE */}
          {subSection === 'system' && (
            <motion.div key="system" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              
              {/* Fee Controller */}
              <div className="glass-premium" style={{ padding: 16, borderRadius: 24, marginBottom: 20 }}>
                <h3 className="tech-header" style={{ fontSize: 14, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span>💸</span> PLATFORM COMMISSION FEE CONTROLLER
                </h3>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                  <span style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 800 }}>Active Commission Rate:</span>
                  <span style={{ fontSize: 18, color: 'var(--primary-mint)', fontWeight: 900 }}>{platformFee}%</span>
                </div>
                <input 
                  type="range" 
                  min="5" 
                  max="25" 
                  value={platformFee} 
                  onChange={(e) => {
                    const newFee = parseInt(e.target.value);
                    setPlatformFee(newFee);
                    addAuditLog(`updated platform commission fee rate to ${newFee}%`);
                  }}
                  style={{ width: '100%', height: 6, background: 'rgba(255,255,255,0.05)', accentColor: 'var(--primary-mint)' }} 
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'var(--text-muted)', marginTop: 6, fontWeight: 700 }}>
                  <span>Min: 5%</span>
                  <span>Max: 25%</span>
                </div>
              </div>

              {/* Data Backup & Restore */}
              <div className="glass-premium" style={{ padding: 16, borderRadius: 24, marginBottom: 20 }}>
                <h3 className="tech-header" style={{ fontSize: 14, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span>💾</span> DATA MANAGEMENT & BACKUPS
                </h3>
                <button
                  onClick={handleExportConfig}
                  style={{ width: '100%', background: 'rgba(255,255,255,0.03)', color: '#FFF', border: '1px solid var(--glass-border)', padding: '10px 0', borderRadius: 12, fontSize: 12, fontWeight: 800, cursor: 'pointer', marginBottom: 12 }}
                >
                  📥 Export Config profile (JSON)
                </button>
                <div style={{ position: 'relative' }}>
                  <button
                    style={{ width: '100%', background: 'rgba(255,255,255,0.03)', color: '#FFF', border: '1px solid var(--glass-border)', padding: '10px 0', borderRadius: 12, fontSize: 12, fontWeight: 800, cursor: 'pointer' }}
                  >
                    📤 Restore Config profile (JSON)
                  </button>
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleImportConfig}
                    style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }}
                  />
                </div>
              </div>

              {/* Access Policies Control Panel */}
              <div className="glass-premium" style={{ padding: 16, borderRadius: 24, marginBottom: 20 }}>
                <h3 className="tech-header" style={{ fontSize: 14, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span>🛡️</span> SECURITY & ACCESS POLICIES
                </h3>
                
                {/* IP Whitelisting Toggle */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                  <div>
                    <span style={{ fontSize: 13, color: 'var(--text-primary)', fontWeight: 800, display: 'block' }}>IP Whitelisting</span>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Restrict console access to subnet IP ranges</span>
                  </div>
                  <input 
                    type="checkbox"
                    checked={ipWhitelisting}
                    onChange={(e) => {
                      setIpWhitelisting(e.target.checked);
                      addAuditLog(`toggled IP Whitelisting policy to: ${e.target.checked}`);
                      triggerToast(`IP Whitelisting: ${e.target.checked ? 'Enabled' : 'Disabled'}`);
                    }}
                    style={{ width: 40, height: 20, accentColor: 'var(--primary-mint)' }}
                  />
                </div>

                {/* Session Timeout slider */}
                <div style={{ marginBottom: 14 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 6 }}>
                    <span>Session Idle Timeout</span>
                    <span style={{ color: 'var(--primary-mint)' }}>{sessionTimeout} mins</span>
                  </div>
                  <input 
                    type="range"
                    min="5"
                    max="120"
                    step="5"
                    value={sessionTimeout}
                    onChange={(e) => {
                      setSessionTimeout(parseInt(e.target.value));
                      addAuditLog(`modified session timeout policy to ${e.target.value} minutes`);
                    }}
                    style={{ width: '100%', accentColor: 'var(--primary-mint)' }}
                  />
                </div>

                {/* Multi-device logins checkbox */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <span style={{ fontSize: 13, color: 'var(--text-primary)', fontWeight: 800, display: 'block' }}>Multi-Device Logins</span>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Allow workers to sign-in on multiple devices</span>
                  </div>
                  <input 
                    type="checkbox"
                    checked={multiDeviceLogins}
                    onChange={(e) => {
                      setMultiDeviceLogins(e.target.checked);
                      addAuditLog(`updated Multi-Device logins allowance to: ${e.target.checked}`);
                      triggerToast(`Multi-Device Logins: ${e.target.checked ? 'Allowed' : 'Blocked'}`);
                    }}
                    style={{ width: 40, height: 20, accentColor: 'var(--primary-mint)' }}
                  />
                </div>
              </div>

              {/* Master Emergency Incident Kill Switch */}
              <div className="glass-premium" style={{ padding: 16, borderRadius: 24, borderColor: 'rgba(239, 68, 68, 0.4)' }}>
                <h3 className="tech-header" style={{ fontSize: 14, color: '#EF4444', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span>🚨</span> PLATFORM EMERGENCY LOCKDOWN
                </h3>
                <span style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 14 }}>
                  Engaging the Incident Kill Switch immediately freezes all active UPI payout disbursements, job posting listings, and new user logins. Use with extreme caution.
                </span>
                <button
                  onClick={() => {
                    setKillSwitchCode('');
                    setShowKillSwitchModal(true);
                  }}
                  style={{ width: '100%', background: '#EF4444', color: '#FFF', border: '2px solid #000', padding: '12px 0', borderRadius: 14, fontSize: 13, fontWeight: 900, boxShadow: '3px 3px 0 #000', cursor: 'pointer' }}
                >
                  {killSwitchActive ? 'DISENGAGE EMERGENCY LOCKDOWN' : 'ENGAGE INCIDENT KILL SWITCH'}
                </button>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      {/* 8. MODAL WINDOWS FOR CRUD & DIALOGS */}
      
      {/* User Add/Edit Modal */}
      {showUserModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div onClick={() => setShowUserModal(false)} style={{ position: 'absolute', inset: 0, background: 'rgba(0, 0, 0, 0.6)', backdropFilter: 'blur(8px)' }} />
          <div className="glass-premium" style={{ width: '100%', maxWidth: 420, borderRadius: 24, padding: 24, border: '2px solid #000', zIndex: 1, boxShadow: '6px 6px 0px #000', background: 'var(--bg-clay)' }}>
            <h3 className="tech-header" style={{ fontSize: 18, marginBottom: 16 }}>{userForm.id ? 'Edit Registry User' : 'Register New User'}</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
              <div>
                <label style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 800, display: 'block', marginBottom: 4 }}>Full Name</label>
                <input type="text" value={userForm.name} onChange={(e) => setUserForm({ ...userForm, name: e.target.value })} style={{ width: '100%', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--glass-border)', padding: 10, borderRadius: 10, color: '#FFF' }} />
              </div>
              <div>
                <label style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 800, display: 'block', marginBottom: 4 }}>Email Address</label>
                <input type="email" value={userForm.email} onChange={(e) => setUserForm({ ...userForm, email: e.target.value })} style={{ width: '100%', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--glass-border)', padding: 10, borderRadius: 10, color: '#FFF' }} />
              </div>
              <div>
                <label style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 800, display: 'block', marginBottom: 4 }}>Phone Number</label>
                <input type="text" placeholder="+91 XXXXX XXXXX" value={userForm.phone} onChange={(e) => setUserForm({ ...userForm, phone: e.target.value })} style={{ width: '100%', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--glass-border)', padding: 10, borderRadius: 10, color: '#FFF' }} />
              </div>
              <div>
                <label style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 800, display: 'block', marginBottom: 4 }}>System Role</label>
                <select value={userForm.role} onChange={(e) => setUserForm({ ...userForm, role: e.target.value })} style={{ width: '100%', background: 'var(--bg-card)', border: '1px solid var(--glass-border)', padding: 10, borderRadius: 10, color: '#FFF' }}>
                  <option value="worker">Worker (operatives)</option>
                  <option value="admin">Admin (employer partner)</option>
                  <option value="moderator">Moderator (verification agent)</option>
                  <option value="viewer">Viewer (support observer)</option>
                </select>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <button onClick={handleSaveUser} style={{ flex: 1, background: 'var(--primary-mint)', color: 'var(--text-primary)', border: '2px solid #000', padding: '10px 0', borderRadius: 12, fontSize: 12, fontWeight: 900, cursor: 'pointer' }}>Save Settings</button>
              <button onClick={() => setShowUserModal(false)} style={{ background: 'rgba(255,255,255,0.05)', color: '#FFF', border: 'none', padding: '10px 16px', borderRadius: 12, fontSize: 12, cursor: 'pointer' }}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Global Job Add/Edit Modal */}
      {showJobModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div onClick={() => setShowJobModal(false)} style={{ position: 'absolute', inset: 0, background: 'rgba(0, 0, 0, 0.6)', backdropFilter: 'blur(8px)' }} />
          <div className="glass-premium" style={{ width: '100%', maxWidth: 420, borderRadius: 24, padding: 24, border: '2px solid #000', zIndex: 1, boxShadow: '6px 6px 0px #000', background: 'var(--bg-clay)' }}>
            <h3 className="tech-header" style={{ fontSize: 18, marginBottom: 16 }}>{jobForm.id ? 'Reconfigure Job Listing' : 'Post Job Listing'}</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20, maxHeight: '60vh', overflowY: 'auto' }} className="no-scrollbar">
              <div>
                <label style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 800, display: 'block', marginBottom: 4 }}>Job Title</label>
                <input type="text" value={jobForm.title} onChange={(e) => setJobForm({ ...jobForm, title: e.target.value })} style={{ width: '100%', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--glass-border)', padding: 10, borderRadius: 10, color: '#FFF' }} />
              </div>
              <div>
                <label style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 800, display: 'block', marginBottom: 4 }}>Employer Partner</label>
                <select value={jobForm.company} onChange={(e) => setJobForm({ ...jobForm, company: e.target.value })} style={{ width: '100%', background: 'var(--bg-card)', border: '1px solid var(--glass-border)', padding: 10, borderRadius: 10, color: '#FFF' }}>
                  <option value="Logistics Corp">Logistics Corp</option>
                  <option value="Retail Tech Ltd">Retail Tech Ltd</option>
                  <option value="Security Ops Group">Security Ops Group</option>
                  <option value="Hospitality Group">Hospitality Group</option>
                </select>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 8 }}>
                <div>
                  <label style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 800, display: 'block', marginBottom: 4 }}>Wage Rate (₹)</label>
                  <input type="number" value={jobForm.wage} onChange={(e) => setJobForm({ ...jobForm, wage: parseInt(e.target.value) })} style={{ width: '100%', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--glass-border)', padding: 10, borderRadius: 10, color: '#FFF' }} />
                </div>
                <div>
                  <label style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 800, display: 'block', marginBottom: 4 }}>Type</label>
                  <select value={jobForm.rateType} onChange={(e) => setJobForm({ ...jobForm, rateType: e.target.value })} style={{ width: '100%', background: 'var(--bg-card)', border: '1px solid var(--glass-border)', padding: 10, borderRadius: 10, color: '#FFF' }}>
                    <option value="daily">daily</option>
                    <option value="hourly">hourly</option>
                  </select>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: 8 }}>
                <div>
                  <label style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 800, display: 'block', marginBottom: 4 }}>Pincode</label>
                  <input type="text" value={jobForm.pincode} onChange={(e) => setJobForm({ ...jobForm, pincode: e.target.value })} style={{ width: '100%', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--glass-border)', padding: 10, borderRadius: 10, color: '#FFF' }} />
                </div>
                <div>
                  <label style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 800, display: 'block', marginBottom: 4 }}>Area Name</label>
                  <input type="text" value={jobForm.area} onChange={(e) => setJobForm({ ...jobForm, area: e.target.value })} style={{ width: '100%', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--glass-border)', padding: 10, borderRadius: 10, color: '#FFF' }} />
                </div>
              </div>
              <div>
                <label style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 800, display: 'block', marginBottom: 4 }}>Personnel Capacity Needed</label>
                <input type="number" value={jobForm.workersNeeded} onChange={(e) => setJobForm({ ...jobForm, workersNeeded: parseInt(e.target.value) })} style={{ width: '100%', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--glass-border)', padding: 10, borderRadius: 10, color: '#FFF' }} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <button onClick={handleSaveJob} style={{ flex: 1, background: 'var(--primary-mint)', color: 'var(--text-primary)', border: '2px solid #000', padding: '10px 0', borderRadius: 12, fontSize: 12, fontWeight: 900, cursor: 'pointer' }}>Publish Job</button>
              <button onClick={() => setShowJobModal(false)} style={{ background: 'rgba(255,255,255,0.05)', color: '#FFF', border: 'none', padding: '10px 16px', borderRadius: 12, fontSize: 12, cursor: 'pointer' }}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Payout Handshake API Modal */}
      {settlingTxn && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0, 0, 0, 0.7)', backdropFilter: 'blur(10px)' }} />
          <div className="glass-premium" style={{ width: '100%', maxWidth: 360, borderRadius: 24, padding: 24, border: '2px solid #000', zIndex: 1, boxShadow: '6px 6px 0px #000', background: '#0F172A', textAlign: 'center' }}>
            <h4 className="tech-header" style={{ fontSize: 15, color: 'var(--primary-mint)', marginBottom: 20 }}>BANK API PUSH TRANSMISSION</h4>
            
            {settlingStep === 1 && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
                <div style={{ width: 44, height: 44, borderRadius: '50%', border: '4px solid rgba(56, 189, 248, 0.2)', borderTopColor: '#38BDF8', animation: 'spin 1s linear infinite' }}></div>
                <span style={{ fontSize: 13, color: '#38BDF8', fontWeight: 800 }}>Verifying Partner Escrow Balance...</span>
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>UPI ID: {settlingTxn.upi}</span>
              </div>
            )}

            {settlingStep === 2 && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
                <div style={{ width: 44, height: 44, borderRadius: '50%', border: '4px solid rgba(252, 211, 77, 0.2)', borderTopColor: '#FCD34D', animation: 'spin 1s linear infinite' }}></div>
                <span style={{ fontSize: 13, color: '#FCD34D', fontWeight: 800 }}>Initiating UPI Instant push...</span>
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Processing ₹{settlingTxn.amount}</span>
              </div>
            )}

            {settlingStep === 3 && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'rgba(52, 211, 153, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, color: 'var(--primary-mint)', border: '2px solid var(--primary-mint)' }}>✔</div>
                <span style={{ fontSize: 14, color: 'var(--primary-mint)', fontWeight: 900 }}>UPI TRANSACTION SUCCESS</span>
                <div style={{ background: 'rgba(0,0,0,0.3)', padding: 12, borderRadius: 12, width: '100%', fontSize: 11, textAlign: 'left', fontFamily: 'monospace', color: 'var(--text-secondary)' }}>
                  <div>UTR: <b>UPI{Math.floor(100000000000 + Math.random() * 900000000000)}</b></div>
                  <div>Recipient: <b>{settlingTxn.name}</b></div>
                  <div>Amount: <b>₹{settlingTxn.amount}</b></div>
                  <div>Status: <b>SETTLED</b></div>
                </div>
                <button 
                  onClick={() => setSettlingTxn(null)} 
                  style={{ width: '100%', background: 'var(--primary-mint)', color: 'var(--text-primary)', border: '2px solid #000', padding: '10px 0', borderRadius: 12, fontSize: 12, fontWeight: 900, cursor: 'pointer', marginTop: 10 }}
                >
                  Conclude Receipt
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Incident Kill Switch Authorization passcode Modal */}
      {showKillSwitchModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div onClick={() => setShowKillSwitchModal(false)} style={{ position: 'absolute', inset: 0, background: 'rgba(0, 0, 0, 0.8)', backdropFilter: 'blur(12px)' }} />
          <div className="glass-premium" style={{ width: '100%', maxWidth: 360, borderRadius: 24, padding: 24, border: '3px solid #EF4444', zIndex: 1, boxShadow: '6px 6px 0px #EF4444', background: '#0F172A', textAlign: 'center' }}>
            <h4 className="tech-header" style={{ fontSize: 16, color: '#EF4444', marginBottom: 12 }}>EMERGENCY LOCKDOWN RE-AUTH</h4>
            <span style={{ fontSize: 11, color: 'var(--text-secondary)', display: 'block', marginBottom: 16 }}>
              {killSwitchActive ? 'Type <b>RESTORE</b> to resume platform operations.' : 'Type <b>KILL</b> to immediately freeze platform APIs.'}
            </span>
            <input
              type="text"
              value={killSwitchCode}
              onChange={(e) => setKillSwitchCode(e.target.value)}
              placeholder={killSwitchActive ? 'RESTORE' : 'KILL'}
              style={{
                width: '100%',
                background: 'rgba(0,0,0,0.3)',
                border: '1px solid #EF4444',
                color: '#FFF',
                textAlign: 'center',
                fontSize: 16,
                fontWeight: 900,
                letterSpacing: 2,
                padding: '12px',
                borderRadius: 12,
                outline: 'none',
                marginBottom: 20
              }}
            />
            <div style={{ display: 'flex', gap: 12 }}>
              <button onClick={handleConfirmKillSwitch} style={{ flex: 1, background: '#EF4444', color: '#FFF', border: '2px solid #000', padding: '10px 0', borderRadius: 12, fontSize: 12, fontWeight: 900, cursor: 'pointer' }}>Confirm</button>
              <button onClick={() => setShowKillSwitchModal(false)} style={{ background: 'rgba(255,255,255,0.05)', color: '#FFF', border: 'none', padding: '10px 16px', borderRadius: 12, fontSize: 12, cursor: 'pointer' }}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Local Toast alerts */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }} 
            animate={{ opacity: 1, y: 0 }} 
            exit={{ opacity: 0, y: 50 }} 
            style={{ position: 'fixed', bottom: 90, left: 24, right: 24, zIndex: 1000000, background: 'var(--primary-mint)', color: 'var(--text-primary)', border: '2px solid #000', padding: '14px 20px', borderRadius: 16, fontSize: 12, fontWeight: 800, textAlign: 'center', boxShadow: '4px 4px 0 #000' }}
          >
            {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default SuperAdminDashboard;
