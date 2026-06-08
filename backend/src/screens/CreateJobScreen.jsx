import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FirestoreService } from '../services/firestoreService';
import { aiService } from '../services/aiService';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import { validateJobForm } from '../utils/validation';
import { safeGet } from '../utils/safeGet';

const TEMPLATE_STORAGE_KEY = 'genie_job_templates';

const DEFAULT_TEMPLATES = [
  { id: 'def1', name: 'Warehouse Loader', wage: '850', startTime: '09:00', endTime: '18:00', workerCount: '5', category: 'Logistics', type: 'day', description: 'Loading and unloading goods in the warehouse.', pincode: '600020' },
  { id: 'def2', name: 'Delivery Agent', wage: '1200', startTime: '08:00', endTime: '20:00', workerCount: '2', category: 'Logistics', type: 'full-time', description: 'Delivering packages in local area.', pincode: '600091' },
];

const CreateJobScreen = ({ setActive, editData, user, t = {} }) => {
  const [jobType, setJobType] = useState('day');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    wage: '',
    workerCount: '',
    startDate: '',
    endDate: '',
    startTime: '08:00',
    endTime: '17:00',
    requirements: '',
    voiceNoteEnabled: false,
    category: 'Logistics',
    pricingModel: 'daily',
    pincode: '',
    locationName: '',
    requirementsTags: [],
    gender: 'Any',
    incentives: '',
    urgent: false,
    lat: null,
    lng: null,
    recurringDays: [],
    workplacePhoto: null,
    paymentDate: '',
    customTasks: []
  });
  const [taskInput, setTaskInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [showMagicModal, setShowMagicModal] = useState(false);
  const [magicPrompt, setMagicPrompt] = useState('');
  const [isMagicLoading, setIsMagicLoading] = useState(false);
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [templates, setTemplates] = useState([]);
  const [templateSaved, setTemplateSaved] = useState(false);

  // Conversational Voice Agent States
  const [missingFields, setMissingFields] = useState([]);
  const [questions, setQuestions] = useState({});
  const [currentFieldIdx, setCurrentFieldIdx] = useState(-1);
  const [chatHistory, setChatHistory] = useState([]);
  const [voiceMode, setVoiceMode] = useState(false);
  const [answerInput, setAnswerInput] = useState('');
  const [isAnswering, setIsAnswering] = useState(false);

  const chatEndRef = useRef(null);

  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition
  } = useSpeechRecognition();

  // Load saved templates from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(TEMPLATE_STORAGE_KEY);
      let loaded = [];
      if (raw) {
        loaded = JSON.parse(raw).filter(t => !String(t.id).startsWith('def'));
      }
      if (loaded.length > 0) {
        setTemplates(loaded);
      } else {
        setTemplates(DEFAULT_TEMPLATES);
      }
    } catch(e) {
      setTemplates(DEFAULT_TEMPLATES);
    }
  }, []);

  const saveAsTemplate = () => {
    if (!formData.title?.trim()) return;
    const template = {
      id: Date.now(),
      name: formData.title,
      wage: formData.wage,
      startTime: formData.startTime,
      endTime: formData.endTime,
      locationName: formData.locationName,
      workerCount: formData.workerCount,
      category: formData.category,
      type: jobType,
      description: formData.description,
      pincode: formData.pincode,
    };
    const userTemplates = templates.filter(t => !String(t.id).startsWith('def'));
    const updated = [template, ...userTemplates.slice(0, 4)]; // keep max 5
    setTemplates(updated);
    try { localStorage.setItem(TEMPLATE_STORAGE_KEY, JSON.stringify(updated)); } catch(e) {}
    setTemplateSaved(true);
    setTimeout(() => setTemplateSaved(false), 2000);
  };

  const applyTemplate = (tpl) => {
    setFormData(prev => ({
      ...prev,
      title: tpl.name,
      wage: tpl.wage,
      startTime: tpl.startTime,
      endTime: tpl.endTime,
      locationName: tpl.locationName || prev.locationName,
      workerCount: tpl.workerCount,
      category: tpl.category || prev.category,
      description: tpl.description || prev.description,
      pincode: tpl.pincode || prev.pincode,
      startDate: new Date().toISOString().slice(0, 10), // default to today
    }));
    setJobType(tpl.type || 'day');
    setStep(2);
  };

  const deleteTemplate = (id) => {
    const userTemplates = templates.filter(t => !String(t.id).startsWith('def'));
    const updated = userTemplates.filter(t => t.id !== id);
    if (updated.length > 0) {
      setTemplates(updated);
      try { localStorage.setItem(TEMPLATE_STORAGE_KEY, JSON.stringify(updated)); } catch(e) {}
    } else {
      setTemplates(DEFAULT_TEMPLATES);
      try { localStorage.removeItem(TEMPLATE_STORAGE_KEY); } catch(e) {}
    }
  };

  useEffect(() => {
    if (editData) {
      setJobType(editData.type || 'day');
      setFormData({
        ...editData,
        voiceNoteEnabled: !!editData.voiceNoteEnabled,
        urgent: !!editData.urgent,
        recurringDays: editData.recurringDays || [],
        workplacePhoto: editData.workplacePhoto || null,
        customTasks: editData.customTasks || []
      });
      setStep(2);
    }
  }, [editData]);

  const formatDateDisplay = (dateStr) => {
    if (!dateStr) return 'Pending Date...';
    try {
      const parts = dateStr.split('-');
      if (parts.length === 3) {
        const year = parts[0];
        const monthNum = parseInt(parts[1], 10) - 1;
        const day = parseInt(parts[2], 10);
        const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        const monthName = monthNames[monthNum];
        if (monthName) return `${day} ${monthName} ${year}`;
      }
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return dateStr;
      const day = date.getDate();
      const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
      const month = monthNames[date.getMonth()];
      const year = date.getFullYear();
      return `${day} ${month} ${year}`;
    } catch (e) {
      return dateStr;
    }
  };

  const handleCloseMagicModal = () => {
    setShowMagicModal(false);
    setMissingFields([]);
    setQuestions({});
    setCurrentFieldIdx(-1);
    setChatHistory([]);
    setAnswerInput('');
    if (listening) {
      SpeechRecognition.stopListening();
    }
  };

  const speak = (text) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-IN';
    utterance.rate = 0.95;
    utterance.pitch = 1.05;
    window.speechSynthesis.speak(utterance);
  };

  // Sync mic transcript into answer text box in real-time
  useEffect(() => {
    if (listening) {
      setAnswerInput(transcript);
    }
  }, [transcript, listening]);

  // Read out question when voice mode is active
  useEffect(() => {
    if (showMagicModal && currentFieldIdx >= 0 && currentFieldIdx < missingFields.length) {
      const activeField = missingFields[currentFieldIdx];
      const activeQuestion = questions[activeField];
      if (activeQuestion && voiceMode) {
        speak(activeQuestion);
        const speakTimeout = setTimeout(() => {
          resetTranscript();
          SpeechRecognition.startListening({ language: 'en-IN', continuous: false });
        }, 2200); // 2.2s delay to speak fully and reset
        return () => clearTimeout(speakTimeout);
      }
    }
  }, [currentFieldIdx, showMagicModal, voiceMode, missingFields, questions]);

  // Scroll to bottom of chat
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatHistory, isAnswering]);

  const toggleListening = () => {
    if (listening) {
      SpeechRecognition.stopListening();
    } else {
      resetTranscript();
      setAnswerInput('');
      SpeechRecognition.startListening({ language: 'en-IN', continuous: false });
    }
  };

  const getSuggestionsForField = (fieldName) => {
    switch (fieldName) {
      case 'title':
        return ['Warehouse Loader', 'Logistics Packer', 'Delivery Agent', 'General Helper', 'Security Guard'];
      case 'wage':
        return ['400', '500', '650', '800', '1000'];
      case 'workerCount':
        return ['3', '5', '10', '15', '20'];
      case 'pincode':
        return ['600091', '600020', '600042', '600100'];
      case 'locationName':
        return ['Madipakkam', 'Adyar', 'Velachery', 'Guindy', 'Ambattur'];
      case 'startDate':
        const todayStr = new Date().toISOString().slice(0, 10);
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const tomorrowStr = tomorrow.toISOString().slice(0, 10);
        return [
          { label: 'Today', value: todayStr },
          { label: 'Tomorrow', value: tomorrowStr }
        ];
      case 'startTime':
        return ['08:00', '09:00', '10:00', '18:00'];
      case 'endTime':
        return ['17:00', '18:00', '05:00', '06:00'];
      case 'gender':
        return ['Any', 'Male', 'Female'];
      case 'description':
        return ['Loading and unloading goods', 'Security and monitoring', 'General housekeeping tasks'];
      default:
        return [];
    }
  };

  const handleMagicCreate = async () => {
    if (!magicPrompt.trim()) return;
    setIsMagicLoading(true);
    setError(null);
    try {
      const result = await aiService.magicCreateJob(magicPrompt);
      if (result) {
        // Set initial parsed details
        const initialForm = {
          ...formData,
          ...result.parsed,
          requirementsTags: result.parsed.requirementsTags || []
        };
        setFormData(initialForm);
        setJobType(result.parsed.type || 'day');

        // Check for missing required fields
        if (result.missingFields && result.missingFields.length > 0) {
          setMissingFields(result.missingFields);
          setQuestions(result.questions);
          setCurrentFieldIdx(0);
          
          setChatHistory([
            { sender: 'user', text: magicPrompt },
            { sender: 'bot', text: `I've drafted your gig! Let's fill in a few missing details to complete the post.` },
            { sender: 'bot', text: result.questions[result.missingFields[0]], field: result.missingFields[0] }
          ]);
          setVoiceMode(true); // Automatically engage voice feedback mode for premium flow
        } else {
          // All complete! Advance directly to details step
          setShowMagicModal(false);
          setStep(2);
        }
      }
    } catch (err) {
      console.error("Magic Create Error:", err);
      setError(t.magic_create_help || "Failed to parse prompt. Try typing normal terms.");
    } finally {
      setIsMagicLoading(false);
    }
  };

  const handleAnswerSubmit = async (customAnswer = null) => {
    const answer = (customAnswer || answerInput || "").trim();
    if (!answer) return;

    if (listening) {
      SpeechRecognition.stopListening();
    }

    setIsAnswering(true);
    const activeField = missingFields[currentFieldIdx];
    
    // Add user answer to chat history immediately
    setChatHistory(prev => [...prev, { sender: 'user', text: answer }]);
    setAnswerInput('');
    resetTranscript();

    try {
      // Parse using aiService
      const parsedValue = await aiService.parseFieldAnswer(activeField, answer, formData);
      
      // Update form
      setFormData(prev => ({
        ...prev,
        [activeField]: parsedValue
      }));

      // Confirm parse response
      const displayField = activeField.toUpperCase();
      let confirmText = `Understood! Set ${displayField} to: "${parsedValue}".`;
      if (activeField === 'wage') confirmText = `Got it! Set wage to ₹${parsedValue}.`;
      if (activeField === 'workerCount') confirmText = `Headcount is set to ${parsedValue} workers.`;
      if (activeField === 'startDate') confirmText = `Start date is locked to ${formatDateDisplay(parsedValue)}.`;
      if (activeField === 'startTime') confirmText = `Shift will start at ${parsedValue}.`;
      if (activeField === 'endTime') confirmText = `Shift will end at ${parsedValue}.`;
      if (activeField === 'gender') confirmText = `Gender preference noted as: ${parsedValue}.`;
      
      setChatHistory(prev => [...prev, { sender: 'bot', text: confirmText }]);

      // Move to next
      const nextIdx = currentFieldIdx + 1;
      if (nextIdx < missingFields.length) {
        setCurrentFieldIdx(nextIdx);
        const nextField = missingFields[nextIdx];
        const nextQuestion = questions[nextField];
        
        setChatHistory(prev => [...prev, { sender: 'bot', text: nextQuestion, field: nextField }]);
      } else {
        // Complete!
        setCurrentFieldIdx(-1);
        setMissingFields([]);
        setChatHistory(prev => [...prev, { sender: 'bot', text: `✨ Brilliant! Your gig details are fully complete and validated!`, isComplete: true }]);
        if (voiceMode) {
          speak("Brilliant! Your gig details are fully complete and validated.");
        }
      }
    } catch (e) {
      console.error(e);
      setChatHistory(prev => [...prev, { sender: 'bot', text: `Sorry, I couldn't parse that. Can you please specify again?` }]);
      if (voiceMode) {
        speak("Sorry, I couldn't parse that. Can you please specify again?");
      }
    } finally {
      setIsAnswering(false);
    }
  };

  const handleDirectPost = async () => {
    setLoading(true);
    try {
      const jobData = {
        ...formData,
        wage: Number(formData.wage),
        workerCount: Number(formData.workerCount),
        pincode: Number(formData.pincode) || formData.pincode,
        paymentDate: formData.paymentDate ? Number(formData.paymentDate) : null,
        type: jobType,
        companyId: user?.uid || 'anonymous',
        companyName: user?.displayName || 'JobGenie Partner',
        status: 'active',
        createdAt: new Date().toISOString(),
        applicants: []
      };

      if (editData?.id) {
        await FirestoreService.updateJob(editData.id, jobData);
      } else {
        await FirestoreService.addJob(jobData);
      }
      handleCloseMagicModal();
      setActive('Home');
    } catch (err) {
      console.error(err);
      setError(t.error_sync_failed || "Failed to post job. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const validateStep2 = () => {
    const { valid, errors } = validateJobForm(formData, 'all');
    // Map to boolean flags for existing field highlight logic
    const boolErrors = Object.fromEntries(Object.keys(errors).map(k => [k, true]));
    setFieldErrors(boolErrors);
    if (!valid) {
      // Show the first specific error message instead of a generic one
      const firstMsg = Object.values(errors)[0];
      setError(firstMsg);
      setTimeout(() => setError(null), 4000);
      return false;
    }
    setError(null);
    return true;
  };

  const handleCreate = async () => {
    if (!validateStep2()) return;
    setLoading(true);
    try {
      const jobData = {
        ...formData,
        wage: Number(formData.wage),
        workerCount: Number(formData.workerCount),
        pincode: Number(formData.pincode) || formData.pincode,
        paymentDate: formData.paymentDate ? Number(formData.paymentDate) : null,
        type: jobType,
        companyId: user?.uid || 'anonymous',
        companyName: user?.displayName || 'JobGenie Partner',
        status: 'active',
        createdAt: new Date().toISOString(),
        applicants: []
      };

      // We do not await this so the UI updates instantly! Firebase will sync in the background.
      if (editData?.id) {
        FirestoreService.updateJob(editData.id, jobData);
      } else {
        FirestoreService.addJob(jobData);
      }
      
      // Give a tiny delay just for visual feedback that a button was pressed
      setTimeout(() => {
        setActive('Home');
        setLoading(false);
      }, 300);
      
    } catch (err) {
      setError(t.post_failed || "Failed to post job. Check your connection.");
      setLoading(false);
    }
  };

  return (
    <div className="fade-in" style={{ height: '100%', background: 'var(--bg)', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>
      {/* Header Container */}
      <div style={{ 
        padding: 'var(--header-pad) 20px 16px', 
        flexShrink: 0, 
        zIndex: 10,
        borderBottom: '1px solid var(--border-light)',
        background: 'var(--bg-card)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div
            onClick={() => step === 1 ? setActive('Home') : setStep(s => s - 1)}
            className="tap-effect"
            style={{ 
              width: 36, 
              height: 36, 
              borderRadius: '50%', 
              border: '1px solid var(--border)', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              fontSize: 16, 
              color: 'var(--text-primary)', 
              cursor: 'pointer',
              background: 'var(--bg-card)'
            }}>
            ←
          </div>
          <div style={{ flex: 1 }}>
            <h1 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
              {step === 1 ? (t.create_job_title || 'Post New Gig') : (t.create_job_title || 'Job Details')}
            </h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-secondary)', background: 'var(--bg-surface)', padding: "2px 8px", borderRadius: 6, border: '1px solid var(--border)' }}>
                STEP 0{step} OF 03
              </div>
              {step === 2 && (
                <div 
                  onClick={() => {
                    setFormData({
                      ...formData,
                      title: 'Warehouse Loader',
                      pincode: '600020',
                      startDate: new Date().toISOString().slice(0, 10),
                      workerCount: '5',
                      locationName: 'Adyar Sector 4',
                      wage: '850',
                      startTime: '00:00',
                      endTime: '23:59',
                      description: 'Warehouse operations involving inventory scanning and manual sorting of packages.'
                    });
                  }}
                  className="tap-effect"
                  style={{ padding: '2px 8px', background: 'var(--bg-surface)', borderRadius: 6, fontSize: 10, fontWeight: 700, color: 'var(--text-primary)', cursor: 'pointer', border: '1px solid var(--border)' }}
                >
                  AUTO-FILL
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="full-height-scroll screen-bottom-pad" style={{ padding: '20px 16px', background: 'var(--bg)' }}>
        {/* Step Indicator */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 24 }}>
          {[1, 2, 3].map(s => (
            <div key={s} style={{ flex: 1, height: 4, borderRadius: 10, background: step >= s ? '#0D0D0D' : 'var(--border)' }} />
          ))}
        </div>

        {step === 1 && (
          <div className="fade-in">

            {/* 🚨 Emergency Urgent Mode Toggle */}
            <div onClick={() => setFormData(f => ({...f, urgent: !f.urgent}))} className="tap-effect cred-card" style={{ marginBottom: 20, padding: '16px', borderRadius: 16, background: formData.urgent ? '#FFF5F5' : '#FFFFFF', border: `1.5px solid ${formData.urgent ? '#E8302A' : 'var(--border)'}`, display: 'flex', alignItems: 'center', gap: 14, cursor: 'pointer' }}>
              <div style={{ fontSize: 24 }}>🚨</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: formData.urgent ? '#E8302A' : '#0D0D0D' }}>Emergency / Urgent Gig</div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 500 }}>Posts instantly & alerts nearby pre-verified workers</div>
              </div>
              <div style={{ width: 44, height: 24, borderRadius: 12, background: formData.urgent ? '#E8302A' : '#F2F2F0', position: 'relative', transition: 'all 0.2s' }}>
                <div style={{ position: 'absolute', top: 3, left: formData.urgent ? 22 : 3, width: 18, height: 18, borderRadius: '50%', background: '#FFF', transition: 'all 0.2s', boxShadow: '0 1px 4px rgba(0,0,0,0.15)' }} />
              </div>
            </div>

            {/* 📦 Saved Templates */}
            {templates.length > 0 && (
              <div style={{ marginBottom: 24 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 }}>📦 Quick Post Templates</div>
                <div style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 8 }} className="no-scrollbar">
                  {templates.map(tpl => (
                    <div key={tpl.id} style={{ flexShrink: 0, width: 160 }}>
                      <div onClick={() => applyTemplate(tpl)} className="tap-effect cred-card" style={{ padding: '14px', borderRadius: 16, background: 'var(--bg-card)', border: '1px solid var(--border)', cursor: 'pointer' }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{tpl.name}</div>
                        <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>₹{tpl.wage} · {tpl.startTime}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{tpl.workerCount} worker{tpl.workerCount !== '1' ? 's' : ''}</div>
                        <div style={{ marginTop: 10, padding: '8px 0', background: 'var(--text-primary)', borderRadius: 8, textAlign: 'center', fontSize: 11, fontWeight: 600, color: '#FFF' }}>Use Template</div>
                      </div>
                      {!String(tpl.id).startsWith('def') && (
                        <div onClick={() => deleteTemplate(tpl.id)} style={{ textAlign: 'center', fontSize: 11, color: 'var(--text-muted)', marginTop: 6, cursor: 'pointer', fontWeight: 500 }}>✕ Delete</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <h3 style={{ color: 'var(--text-muted)', marginBottom: 12, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }}><bdi>{t.sector_label || 'Select Job Type'}</bdi></h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { id: 'day', title: t.day_shift || 'Single Shift', desc: t.daily_payout || 'Day-to-day work', icon: '☀️' },
                { id: 'part-time', title: t.part_time || 'Part Time', desc: t.flexible || 'Fixed recurring shifts', icon: '📅' },
                { id: 'full-time', title: t.full_time || 'Full Time', desc: t.active_status || 'Monthly permanent role', icon: '🏢' }
              ].map(opt => {
                const isSelected = jobType === opt.id;
                return (
                  <div 
                    key={opt.id} 
                    onClick={() => setJobType(opt.id)} 
                    className="tap-effect cred-card" 
                    style={{ 
                      padding: '16px', 
                      borderRadius: 16, 
                      background: isSelected ? '#F4F4F5' : 'var(--bg-card)',
                      border: isSelected ? '2px solid #0D0D0D' : '1px solid var(--border)', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'space-between',
                      gap: 12, 
                      cursor: 'pointer',
                      boxShadow: isSelected ? '0 4px 12px rgba(0,0,0,0.05)' : 'none'
                    }}
                  >
                     <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
                       <div style={{ fontSize: 24, flexShrink: 0 }}>{opt.icon}</div>
                       <div style={{ minWidth: 0 }}>
                         <div style={{ fontSize: 14, color: 'var(--text-primary)', fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}><bdi>{opt.title}</bdi></div>
                         <div style={{ color: 'var(--text-secondary)', fontSize: 12, fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}><bdi>{opt.desc}</bdi></div>
                       </div>
                     </div>
                     {isSelected && (
                       <div style={{ width: 24, height: 24, borderRadius: '50%', background: '#0D0D0D', color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800, flexShrink: 0 }}>
                         ✓
                       </div>
                     )}
                  </div>
                );
              })}
            </div>

            <h3 style={{ color: 'var(--text-muted)', marginTop: 24, marginBottom: 12, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }}><bdi>{t.sector_sync || 'Job Category'}</bdi></h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 8 }}>
              {['Logistics', 'Construction', 'Manufacturing', 'Hospitality', 'Security', 'Cleaning', 'Retail', 'Office'].map(cat => {
                const isSelected = formData.category === cat;
                return (
                  <div 
                    key={cat} 
                    onClick={() => setFormData({...formData, category: cat})} 
                    className="tap-effect cred-card" 
                    style={{ 
                      padding: '12px 10px', 
                      borderRadius: 12, 
                      border: isSelected ? '1px solid #0D0D0D' : '1px solid var(--border)', 
                      background: isSelected ? '#0D0D0D' : '#FFFFFF', 
                      color: isSelected ? '#FFFFFF' : '#0D0D0D', 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 8, 
                      cursor: 'pointer', 
                      justifyContent: 'center' 
                    }}
                  >
                      <span style={{ fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap' }}><bdi>{safeGet(t, `skill_${cat.toLowerCase().replace(' ', '_')}`) || cat}</bdi></span>
                  </div>
                );
              })}
            </div>
            
            <button onClick={() => setStep(2)} className="cred-btn-black" style={{ marginTop: 32, width: '100%', padding: '16px' }}>
              <bdi>{t.continue || 'Continue'} ➔</bdi>
            </button>

            <div onClick={() => setShowMagicModal(true)} className="tap-effect cred-card" style={{ marginTop: 16, padding: '20px', cursor: 'pointer', border: '1px solid #0D0D0D', background: 'var(--bg-card)', borderRadius: 16, textAlign: 'center' }}>
              <div style={{ fontSize: 15, marginBottom: 4, color: 'var(--text-primary)', fontWeight: 700 }}><bdi>🪄 {t.magic_gen || 'Magic Post'}</bdi></div>
              <div style={{ color: 'var(--text-secondary)', fontSize: 12, fontWeight: 500 }}><bdi>{t.init_gig_ai || 'Describe the job in plain words and let AI fill the details.'}</bdi></div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="fade-in">
             <h3 style={{ color: 'var(--text-muted)', marginBottom: 16, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }}><bdi>{t.loan_step_details || 'Job Details'}</bdi></h3>
             
             <div style={{ marginBottom: 16 }}>
                <label style={{ color: 'var(--text-secondary)', marginBottom: 8, display: 'block', paddingLeft: 4, fontSize: 12, fontWeight: 600 }}><bdi>{t.title_label || 'JOB TITLE'}</bdi></label>
                <input type="text" placeholder={t.placeholder_title || "e.g. Warehouse Worker"} value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="cred-card" style={{ width: '100%', padding: '14px', borderRadius: 12, background: 'var(--bg)', color: 'var(--text-primary)', fontSize: 14, fontWeight: 600, outline: 'none', border: '1px solid var(--border)' }} />
             </div>

              <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
                <div style={{ flex: 1 }}>
                    <label style={{ color: 'var(--text-secondary)', marginBottom: 8, display: 'block', paddingLeft: 4, fontSize: 12, fontWeight: 600 }}><bdi>{t.pricing_model || 'PAY TYPE'}</bdi></label>
                    <div className="cred-tab-bar" style={{ display: 'flex', gap: 4, padding: 3, borderRadius: 12, background: 'var(--bg-surface)' }}>
                        {['daily', 'hourly'].map(m => (
                            <div 
                              key={m} 
                              onClick={() => setFormData({...formData, pricingModel: m})} 
                              className={`cred-tab ${formData.pricingModel === m ? 'active' : ''}`}
                              style={{ flex: 1, padding: '8px 0', fontSize: 11, justifyContent: 'center' }}
                            >
                              <bdi>{(safeGet(t, m) || m).toUpperCase()}</bdi>
                            </div>
                        ))}
                    </div>
                </div>
                <div style={{ flex: 1.5 }}>
                   <label style={{ color: 'var(--text-secondary)', marginBottom: 8, display: 'block', paddingLeft: 4, fontSize: 12, fontWeight: 600 }}><bdi>{formData.pricingModel === 'daily' ? (t.daily_wage || 'WAGE (₹)') : (t.hourly_rate || 'RATE (₹)')}</bdi></label>
                   <input type="number" placeholder="800" value={formData.wage} onChange={(e) => setFormData({ ...formData, wage: e.target.value })} className="cred-card" style={{ width: '100%', padding: '14px', borderRadius: 12, background: 'var(--bg)', color: 'var(--text-primary)', fontSize: 14, fontWeight: 600, outline: 'none', border: '1px solid var(--border)' }} />
                </div>
              </div>

              <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
                 <div style={{ flex: 1 }}>
                    <label style={{ color: 'var(--text-secondary)', marginBottom: 8, display: 'block', paddingLeft: 4, fontSize: 12, fontWeight: 600 }}><bdi>{t.pincode_label || 'PINCODE'}</bdi></label>
                    <input type="number" placeholder={t.placeholder_pincode || "6-digit"} value={formData.pincode} onChange={(e) => setFormData({ ...formData, pincode: e.target.value })} className="cred-card" style={{ width: '100%', padding: '14px', borderRadius: 12, background: 'var(--bg)', color: 'var(--text-primary)', fontSize: 14, fontWeight: 600, outline: 'none', border: '1px solid var(--border)' }} />
                 </div>
                 <div style={{ flex: 1.5 }}>
                    <label style={{ color: 'var(--text-secondary)', marginBottom: 8, display: 'block', paddingLeft: 4, fontSize: 12, fontWeight: 600 }}><bdi>{t.area_label || 'AREA'}</bdi></label>
                    <input type="text" placeholder={t.placeholder_area || "e.g. Adyar"} value={formData.locationName} onChange={(e) => setFormData({ ...formData, locationName: e.target.value })} className="cred-card" style={{ width: '100%', padding: '14px', borderRadius: 12, background: 'var(--bg)', color: 'var(--text-primary)', fontSize: 14, fontWeight: 600, outline: 'none', border: '1px solid var(--border)' }} />
                 </div>
              </div>

              <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
                 <div style={{ flex: 1 }}>
                    <label style={{ color: 'var(--text-secondary)', marginBottom: 8, display: 'block', paddingLeft: 4, fontSize: 12, fontWeight: 600 }}><bdi>{t.workers_needed || 'WORKERS'}</bdi></label>
                    <input type="number" value={formData.workerCount} onChange={(e) => setFormData({ ...formData, workerCount: e.target.value })} className="cred-card" style={{ width: '100%', padding: '14px', borderRadius: 12, background: 'var(--bg)', color: 'var(--text-primary)', fontSize: 14, fontWeight: 600, outline: 'none', border: '1px solid var(--border)' }} />
                 </div>
                 <div style={{ flex: 1.5 }}>
                    <label style={{ color: 'var(--text-secondary)', marginBottom: 8, display: 'block', paddingLeft: 4, fontSize: 12, fontWeight: 600 }}><bdi>{t.date_label || 'DATE'}</bdi></label>
                    <input type="date" value={formData.startDate} onChange={(e) => setFormData({ ...formData, startDate: e.target.value })} className="cred-card" style={{ width: '100%', padding: '12px', borderRadius: 12, background: 'var(--bg)', color: 'var(--text-primary)', fontSize: 14, fontWeight: 600, outline: 'none', border: '1px solid var(--border)' }} />
                 </div>
              </div>

              <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
                <div style={{ flex: 1 }}>
                   <label style={{ color: 'var(--text-secondary)', marginBottom: 8, display: 'block', paddingLeft: 4, fontSize: 12, fontWeight: 600 }}><bdi>{t.start_time || 'START'}</bdi></label>
                   <input type="time" value={formData.startTime} onChange={(e) => setFormData({...formData, startTime: e.target.value})} className="cred-card" style={{ width: '100%', padding: '12px', borderRadius: 12, background: 'var(--bg)', color: 'var(--text-primary)', fontSize: 14, fontWeight: 600, border: '1px solid var(--border)', outline: 'none' }} />
                </div>
                <div style={{ flex: 1 }}>
                   <label style={{ color: 'var(--text-secondary)', marginBottom: 8, display: 'block', paddingLeft: 4, fontSize: 12, fontWeight: 600 }}><bdi>{t.end_time || 'END'}</bdi></label>
                   <input type="time" value={formData.endTime} onChange={(e) => setFormData({...formData, endTime: e.target.value})} className="cred-card" style={{ width: '100%', padding: '12px', borderRadius: 12, background: 'var(--bg)', color: 'var(--text-primary)', fontSize: 14, fontWeight: 600, border: '1px solid var(--border)', outline: 'none' }} />
                </div>
              </div>

              {['full-time', 'part-time'].includes(jobType) && (
                <div style={{ marginTop: 16, marginBottom: 16 }}>
                  <label style={{ color: 'var(--text-secondary)', marginBottom: 8, display: 'block', paddingLeft: 4, fontSize: 12, fontWeight: 600 }}><bdi>{t.working_days || 'WORKING DAYS'}</bdi></label>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => {
                      const isSelected = formData.recurringDays.includes(day);
                      return (
                        <div 
                          key={day} 
                          onClick={() => {
                            const days = formData.recurringDays.includes(day) 
                              ? formData.recurringDays.filter(d => d !== day) 
                              : [...formData.recurringDays, day];
                            setFormData({...formData, recurringDays: days});
                          }} 
                          className="tap-effect cred-card" 
                          style={{ 
                            flex: '1 1 calc(25% - 6px)', 
                            padding: '10px 0', 
                            textAlign: 'center', 
                            fontSize: 12, 
                            fontWeight: 600, 
                            borderRadius: 10,
                            background: isSelected ? '#0D0D0D' : '#FFFFFF', 
                            color: isSelected ? '#FFF' : '#0D0D0D', 
                            border: isSelected ? '1px solid #0D0D0D' : '1px solid var(--border)',
                            cursor: 'pointer'
                          }}
                        >
                          <bdi>{safeGet(t, day.toLowerCase()) || day}</bdi>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {jobType === 'full-time' && (
                <div style={{ marginTop: 16, marginBottom: 16 }}>
                  <label style={{ color: 'var(--text-secondary)', marginBottom: 8, display: 'block', paddingLeft: 4, fontSize: 12, fontWeight: 600 }}><bdi>{t.payment_date || 'PAYMENT DATE (1-31)'}</bdi></label>
                  <input type="number" min="1" max="31" placeholder={t.placeholder_payment_date || "e.g. 1 for 1st of month"} value={formData.paymentDate} onChange={(e) => setFormData({ ...formData, paymentDate: e.target.value })} className="cred-card" style={{ width: '100%', padding: '14px', borderRadius: 12, background: 'var(--bg)', color: 'var(--text-primary)', fontSize: 14, fontWeight: 600, outline: 'none', border: '1px solid var(--border)' }} />
                </div>
              )}

              <div style={{ display: 'flex', gap: 12, marginTop: 32 }}>
                <button onClick={() => setStep(1)} className="cred-btn-white" style={{ flex: 1, padding: '14px' }}>
                  <bdi>{t.back_label || 'Back'}</bdi>
                </button>
                <button onClick={() => { if (validateStep2()) setStep(3); }} className="cred-btn-black" style={{ flex: 1.5, padding: '14px' }}>
                  <bdi>{t.continue || 'Continue'} ➔</bdi>
                </button>
              </div>
              {error && <div style={{ color: '#E8302A', padding: '12px', background: '#FFF5F5', borderRadius: 12, marginTop: 16, fontSize: 13, fontWeight: 600, textAlign: 'center', border: '1px solid #FCA5A5' }}>🚨 {error}</div>}
          </div>
        )}

        {step === 3 && (
          <div className="fade-in">
             <h3 style={{ color: 'var(--text-muted)', marginBottom: 16, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }}><bdi>{t.extra_info || 'Additional Info'}</bdi></h3>
             
             <div style={{ marginBottom: 16 }}>
                <label style={{ color: 'var(--text-secondary)', marginBottom: 8, display: 'block', paddingLeft: 4, fontSize: 12, fontWeight: 600 }}><bdi>{t.description || 'DESCRIPTION'}</bdi></label>
                <textarea placeholder={t.placeholder_desc || "Tell workers about tasks, dress code, etc."} value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="cred-card" style={{ width: '100%', height: 100, padding: '14px', borderRadius: 12, background: 'var(--bg)', color: 'var(--text-primary)', fontSize: 14, fontWeight: 600, outline: 'none', border: '1px solid var(--border)', resize: 'none' }} />
             </div>

              <div style={{ marginBottom: 20 }}>
                <label style={{ color: 'var(--text-secondary)', marginBottom: 12, display: 'block', paddingLeft: 4, fontSize: 12, fontWeight: 600 }}><bdi>{t.requirements || 'REQUIREMENTS'}</bdi></label>
                 <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {['Aadhaar Verified', 'Smartphone', 'Heavy Lifting', 'English', 'Safety Gear', 'Uniform'].map(tag => {
                      const isSelected = formData.requirementsTags.includes(tag);
                      return (
                        <div 
                          key={tag} 
                          onClick={() => { 
                            const tags = formData.requirementsTags.includes(tag) 
                              ? formData.requirementsTags.filter(t => t !== tag) 
                              : [...formData.requirementsTags, tag]; 
                            setFormData({...formData, requirementsTags: tags}); 
                          }} 
                          className="tap-effect cred-card" 
                          style={{ 
                            padding: '8px 16px', 
                            borderRadius: 12, 
                            fontSize: 12, 
                            fontWeight: 600, 
                            background: isSelected ? '#0D0D0D' : '#FFFFFF', 
                            color: isSelected ? '#FFFFFF' : '#0D0D0D', 
                            border: isSelected ? '1px solid #0D0D0D' : '1px solid var(--border)',
                            cursor: 'pointer'
                          }}
                        >
                          <bdi>{safeGet(t, tag.toLowerCase().replace(' ', '_')) || tag}</bdi>
                        </div>
                      );
                    })}
                 </div>
              </div>

             <div style={{ marginBottom: 32 }}>
                <label style={{ color: 'var(--text-secondary)', marginBottom: 12, display: 'block', paddingLeft: 4, fontSize: 12, fontWeight: 600 }}><bdi>{t.gender_pref || 'GENDER PREFERENCE'}</bdi></label>
                <div style={{ display: 'flex', gap: 8 }}>
                   {['Any', 'Male', 'Female'].map(g => {
                     const isSelected = formData.gender === g;
                     return (
                        <div 
                          key={g} 
                          onClick={() => setFormData({...formData, gender: g})} 
                          className="tap-effect cred-card" 
                          style={{ 
                            flex: 1, 
                            padding: '12px', 
                            borderRadius: 12, 
                            textAlign: 'center', 
                            fontSize: 13, 
                            fontWeight: 600, 
                            background: isSelected ? '#0D0D0D' : '#FFFFFF', 
                            color: isSelected ? '#FFFFFF' : '#0D0D0D', 
                            border: isSelected ? '1px solid #0D0D0D' : '1px solid var(--border)',
                            cursor: 'pointer' 
                          }}
                        >
                          <bdi>{safeGet(t, g.toLowerCase()) || g}</bdi>
                        </div>
                     );
                   })}
                </div>
             </div>

             {/* 📋 Custom Tasks Checklist Section */}
             <div style={{ marginBottom: 32 }}>
                <label style={{ color: 'var(--text-secondary)', marginBottom: 8, display: 'block', paddingLeft: 4, fontSize: 12, fontWeight: 600 }}><bdi>CUSTOM TASKS CHECKLIST (OPTIONAL)</bdi></label>
                <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                  <input 
                    type="text" 
                    placeholder="e.g. Inspect loading dock" 
                    value={taskInput} 
                    onChange={(e) => setTaskInput(e.target.value)} 
                    className="cred-card" 
                    style={{ flex: 1, padding: '12px', borderRadius: 12, background: 'var(--bg)', color: 'var(--text-primary)', fontSize: 13, fontWeight: 600, outline: 'none', border: '1px solid var(--border)' }} 
                  />
                  <div 
                    onClick={() => {
                      if (taskInput.trim()) {
                        setFormData(prev => ({
                          ...prev,
                          customTasks: [...(prev.customTasks || []), taskInput.trim()]
                        }));
                        setTaskInput('');
                      }
                    }}
                    className="tap-effect cred-btn-black" 
                    style={{ padding: '12px 18px', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 800, cursor: 'pointer' }}
                  >
                    + Add
                  </div>
                </div>

                {formData.customTasks && formData.customTasks.length > 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {formData.customTasks.map((task, index) => (
                      <div 
                        key={index}
                        className="cred-card" 
                        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', borderRadius: 12, border: '1px solid var(--border)', background: 'var(--bg-subtle)' }}
                      >
                        <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>{index + 1}. {task}</span>
                        <div 
                          onClick={() => {
                            setFormData(prev => ({
                              ...prev,
                              customTasks: prev.customTasks.filter((_, idx) => idx !== index)
                            }));
                          }}
                          className="tap-effect" 
                          style={{ cursor: 'pointer', fontSize: 14, color: 'var(--text-muted)', fontWeight: 800 }}
                        >
                          ✕
                        </div>
                      </div>
                    ))}
                  </div>
                )}
             </div>

             {/* Save as Template */}
             <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
               <div 
                 onClick={saveAsTemplate} 
                 className="tap-effect cred-card" 
                 style={{ 
                   flex: 1, 
                   padding: '12px', 
                   borderRadius: 12, 
                   textAlign: 'center', 
                   fontSize: 13, 
                   fontWeight: 700, 
                   color: templateSaved ? '#16A34A' : '#5C5C5C', 
                   border: `1px solid ${templateSaved ? '#16A34A' : 'var(--border)'}`, 
                   background: templateSaved ? '#DCFCE7' : '#FFFFFF',
                   cursor: 'pointer'
                 }}
               >
                 {templateSaved ? '✓ Saved to Templates!' : '📦 Save as Template'}
               </div>
             </div>

             <button onClick={handleCreate} className="cred-btn-black" style={{ width: '100%', padding: '16px', opacity: loading ? 0.7 : 1 }}>
               <bdi>{loading ? (t.processing || 'Posting...') : (editData ? (t.update_job || 'Update Job') : (formData.urgent ? '🚨 Post Urgent Gig' : (t.post_job || 'Post Job')))}</bdi>
             </button>
          </div>
        )}
      </div>

      {/* Magic Create Modal */}
      <AnimatePresence>
        {showMagicModal && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={handleCloseMagicModal} style={{ position: 'absolute', inset: 0, background: 'rgba(0, 0, 0, 0.4)', backdropFilter: 'blur(8px)' }} />
            
            <motion.div 
              initial={{ scale: 0.95, y: 20 }} 
              animate={{ scale: 1, y: 0 }} 
              exit={{ scale: 0.95, y: 20 }} 
              className="cred-card" 
              style={{ 
                padding: '24px', 
                width: '100%', 
                maxWidth: 420, 
                maxHeight: '90vh',
                overflowY: 'auto',
                position: 'relative', 
                zIndex: 1, 
                borderRadius: 20, 
                border: '1px solid var(--border)',
                background: 'var(--bg-card)',
                boxShadow: '0 20px 40px rgba(0,0,0,0.15)'
              }}
            >
              {/* Modal Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ display: 'flex' }}>
                    {voiceMode && currentFieldIdx >= 0 ? (
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0D0D0D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="22"/></svg>
                    ) : (
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0D0D0D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.64 3.64-1.28-1.28a1.21 1.21 0 0 0-1.72 0L2.36 18.64a1.21 1.21 0 0 0 0 1.72l1.28 1.28a1.2 1.2 0 0 0 1.72 0L21.64 5.36a1.2 1.2 0 0 0 0-1.72"/><path d="m14 7 3 3"/><path d="M5 6v4"/><path d="M19 14v4"/><path d="M10 2v2"/><path d="M7 8H3"/><path d="M21 16h-4"/><path d="M11 3H9"/></svg>
                    )}
                  </div>
                  <div>
                    <h3 style={{ fontSize: 16, color: 'var(--text-primary)', margin: 0, fontWeight: 700 }}>
                      AI Gig Assistant
                    </h3>
                    <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-muted)', letterSpacing: 0.5, marginTop: 2, textTransform: 'uppercase' }}>
                      {chatHistory.length > 0 ? 'Conversational Setup' : 'Natural Language Generator'}
                    </div>
                  </div>
                </div>
                <div onClick={handleCloseMagicModal} className="tap-effect" style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--bg-surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, cursor: 'pointer', fontWeight: 600, color: 'var(--text-secondary)' }}>✕</div>
              </div>

              {chatHistory.length === 0 ? (
                /* Initial Prompt State */
                <div>
                  <div style={{ color: 'var(--text-secondary)', fontSize: 12, fontWeight: 600, marginBottom: 10 }}>Describe your hiring need</div>
                  <textarea 
                    placeholder="e.g. Need 5 warehouse loaders in Adyar for ₹500/day..." 
                    value={magicPrompt} 
                    onChange={e => setMagicPrompt(e.target.value)} 
                    className="cred-card" 
                    style={{ width: '100%', height: 110, borderRadius: 12, padding: '14px', fontSize: 14, outline: 'none', background: 'var(--bg)', marginBottom: 16, fontWeight: 500, color: 'var(--text-primary)', resize: 'none', border: '1px solid var(--border)' }} 
                  />
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
                    {['Need 10 logistics packers...', 'Looking for security guards...', 'Need 5 delivery boys...'].map((sug, i) => (
                      <div 
                        key={i} 
                        onClick={() => setMagicPrompt(sug)} 
                        className="tap-effect cred-card"
                        style={{ padding: '6px 12px', background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 12, fontSize: 11, fontWeight: 600, color: 'var(--text-primary)', cursor: 'pointer' }}
                      >
                        {sug}
                      </div>
                    ))}
                  </div>
                  <button onClick={handleMagicCreate} className="cred-btn-black" style={{ width: '100%', padding: '14px' }}>
                    <bdi>{isMagicLoading ? 'ANALYZING REQUIREMENTS...' : '⚡ GENERATE GIG'}</bdi>
                  </button>
                </div>
              ) : (
                /* Interactive Conversational Chat State */
                <div>
                  {/* Draft Progress HUD */}
                  <div style={{ background: 'var(--bg-subtle)', borderRadius: 12, padding: 12, border: '1px solid var(--border)', marginBottom: 16 }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 8, letterSpacing: 0.5, textTransform: 'uppercase' }}>DRAFT OVERVIEW</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, fontSize: 11, fontWeight: 600, color: 'var(--text-primary)' }}>
                      <span style={{ padding: '3px 8px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8 }}>💼 {formData.title || 'Pending Title...'}</span>
                      <span style={{ padding: '3px 8px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8 }}>💰 ₹{formData.wage || '0'}</span>
                      <span style={{ padding: '3px 8px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8 }}>📍 {formData.locationName || 'Pending Loc...'}</span>
                      <span style={{ padding: '3px 8px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8 }}>👥 {formData.workerCount || '0'} workers</span>
                      <span style={{ padding: '3px 8px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8 }}>📅 {formatDateDisplay(formData.startDate)}</span>
                      {(formData.startTime || formData.endTime) && <span style={{ padding: '3px 8px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8 }}>⏰ {formData.startTime || '??'} - {formData.endTime || '??'}</span>}
                      {formData.gender && formData.gender !== 'Any' && <span style={{ padding: '3px 8px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8 }}>🚻 {formData.gender}</span>}
                      {formData.pincode && <span style={{ padding: '3px 8px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8 }}>📮 {formData.pincode}</span>}
                    </div>
                  </div>

                  {/* Chat Message Box */}
                  <div style={{ flex: 1, minHeight: 160, maxHeight: '25vh', overflowY: 'auto', paddingRight: 6, display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 12 }} className="no-scrollbar">
                    {chatHistory.map((chat, idx) => (
                      <div key={idx} style={{ display: 'flex', justifyContent: chat.sender === 'user' ? 'flex-end' : 'flex-start' }}>
                        <div 
                          className="cred-card"
                          style={{
                            maxWidth: '85%',
                            padding: '10px 14px',
                            borderRadius: chat.sender === 'user' ? '14px 14px 2px 14px' : '14px 14px 14px 2px',
                            background: chat.sender === 'user' ? '#0D0D0D' : '#F2F2F0',
                            border: chat.sender === 'user' ? 'none' : '1px solid var(--border)',
                            color: chat.sender === 'user' ? '#FFFFFF' : '#0D0D0D',
                            fontSize: 13,
                            fontWeight: 600
                          }}
                        >
                          {chat.text}
                        </div>
                      </div>
                    ))}
                    {isAnswering && (
                      <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                        <div style={{ padding: '10px 14px', borderRadius: 12, background: 'var(--bg-surface)', color: 'var(--text-muted)', fontSize: 12, fontWeight: 500 }}>
                          <span> Genie is processing...</span>
                        </div>
                      </div>
                    )}
                    <div ref={chatEndRef} />
                  </div>

                  {/* Listening HUD Overlay */}
                  {listening && (
                    <div style={{ background: '#FFF5F5', border: '1px solid #E8302A', borderRadius: 12, padding: 10, display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                      <motion.div 
                        animate={{ scale: [1, 1.2, 1] }} 
                        transition={{ repeat: Infinity, duration: 1 }} 
                        style={{ width: 8, height: 8, borderRadius: '50%', background: '#E8302A' }} 
                      />
                      <div style={{ fontSize: 11, fontWeight: 700, color: '#E8302A', letterSpacing: 0.5 }}>🎙️ VOICE AGENT LISTENING... SPEAK NOW</div>
                    </div>
                  )}

                  {/* Suggestion Pills */}
                  {currentFieldIdx >= 0 && (
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
                      {getSuggestionsForField(missingFields[currentFieldIdx]).map((sug, sIdx) => {
                        const label = typeof sug === 'object' ? sug.label : sug;
                        const val = typeof sug === 'object' ? sug.value : sug;
                        return (
                          <div 
                            key={sIdx} 
                            onClick={() => handleAnswerSubmit(val)} 
                            className="tap-effect cred-card"
                            style={{ padding: '6px 12px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, fontSize: 11, fontWeight: 600, color: 'var(--text-primary)', cursor: 'pointer' }}
                          >
                            {label}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Input & Mic Panel */}
                  {currentFieldIdx >= 0 ? (
                    <div>
                      {/* Voice Settings Strip */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, padding: '0 4px' }}>
                        <div 
                          onClick={() => setVoiceMode(!voiceMode)} 
                          className="tap-effect"
                          style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}
                        >
                          <span style={{ fontSize: 12 }}>{voiceMode ? '🔊' : '🔇'}</span>
                          <span style={{ fontSize: 10, fontWeight: 700, color: voiceMode ? '#0D0D0D' : '#9B9B9B' }}>
                            VOICE FEEDBACK: {voiceMode ? 'ON' : 'OFF'}
                          </span>
                        </div>
                        {browserSupportsSpeechRecognition && (
                          <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-muted)' }}>
                            TAP MIC TO SPEAK
                          </div>
                        )}
                      </div>

                      {/* Text/Speech Input Row */}
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                        {browserSupportsSpeechRecognition && (
                          <motion.div 
                            onClick={toggleListening}
                            className="tap-effect"
                            animate={listening ? { scale: [1, 1.1, 1] } : {}}
                            transition={{ repeat: Infinity, duration: 1.2 }}
                            style={{ 
                              width: 44, 
                              height: 44, 
                              borderRadius: 12, 
                              background: listening ? '#E8302A' : '#FFFFFF', 
                              border: listening ? 'none' : '1px solid var(--border)',
                              color: listening ? '#FFFFFF' : '#0D0D0D',
                              display: 'flex', 
                              alignItems: 'center', 
                              justifyContent: 'center', 
                              fontSize: 18, 
                              cursor: 'pointer'
                            }}
                          >
                            {listening ? '🎤' : '🎙️'}
                          </motion.div>
                        )}
                        <input 
                          type="text" 
                          placeholder="Type or speak answer..." 
                          value={answerInput} 
                          onChange={e => setAnswerInput(e.target.value)} 
                          onKeyDown={e => e.key === 'Enter' && handleAnswerSubmit()}
                          className="cred-card"
                          style={{ flex: 1, padding: '12px', borderRadius: 12, fontSize: 13, fontWeight: 600, outline: 'none', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text-primary)' }}
                        />
                        <div 
                          onClick={() => handleAnswerSubmit()} 
                          className="tap-effect" 
                          style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--text-primary)', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}
                        >
                          ➔
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* Final Compilation Success State */
                    <div style={{ marginTop: 12 }}>
                      <div style={{ textAlign: 'center', padding: '16px 0', border: '1px dashed #16A34A', borderRadius: 16, background: '#DCFCE7', marginBottom: 16 }}>
                        <div style={{ fontSize: 28, marginBottom: 8 }}>⚡</div>
                        <div style={{ fontSize: 15, fontWeight: 700, color: '#16A34A' }}>COMPILATION SUCCESSFUL</div>
                        <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>Gig is complete and ready to deploy</div>
                      </div>

                      <div style={{ display: 'flex', gap: 10 }}>
                        <button onClick={handleCloseMagicModal} className="cred-btn-white" style={{ flex: 1, padding: '12px' }}>
                          Cancel
                        </button>
                        <button onClick={handleDirectPost} className="cred-btn-black" style={{ flex: 1.8, padding: '12px' }}>
                          ⚡ Post Gig Now
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CreateJobScreen;
