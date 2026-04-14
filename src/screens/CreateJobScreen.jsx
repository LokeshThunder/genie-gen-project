import React, { useState, useEffect } from 'react';
import { aiService } from '../services/aiService';
import { motion, AnimatePresence } from 'framer-motion';

const CreateJobScreen = ({ setActive, editData }) => {
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
    voiceNoteEnabled: false
  });
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [showMagicModal, setShowMagicModal] = useState(false);
  const [magicPrompt, setMagicPrompt] = useState('');
  const [isMagicLoading, setIsMagicLoading] = useState(false);

  // Pre-fill form if editData is provided
  useEffect(() => {
    if (editData) {
      setJobType(editData.type || 'day');
      setFormData({
        title: editData.title || '',
        description: editData.description || '',
        wage: editData.wage || '',
        workerCount: editData.workerCount || '',
        startDate: editData.startDate || '',
        endDate: editData.endDate || '',
        startTime: editData.startTime || '08:00',
        endTime: editData.endTime || '17:00',
        requirements: editData.requirements || '',
        voiceNoteEnabled: !!editData.voiceNoteEnabled
      });
      setStep(2); // Jump to details if editing
    }
  }, [editData]);

  const handleMagicCreate = async () => {
    if (!magicPrompt.trim()) return;
    setIsMagicLoading(true);
    try {
      const result = await aiService.magicCreateJob(magicPrompt);
      if (result) {
        setFormData(prev => ({ ...prev, ...result }));
        setJobType(result.type || 'day');
        setShowMagicModal(false);
        setStep(2);
      }
    } catch (error) {
      console.error("Magic Create Error:", error);
    } finally {
      setIsMagicLoading(false);
    }
  };

  const handleCreate = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setActive('Home'); // Back to company dashboard
    }, 1500);
  };

  const renderInput = (label, name, type = 'text', placeholder = '') => (
    <div style={{ marginBottom: 18 }}>
      <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#444', marginBottom: 6 }}>{label.toUpperCase()}</label>
      <input 
        type={type}
        placeholder={placeholder}
        value={formData[name]}
        onChange={(e) => setFormData({ ...formData, [name]: e.target.value })}
        style={{ 
          width: '100%', 
          padding: '14px 16px', 
          borderRadius: 14, 
          border: '1.5px solid #F0F0F0', 
          background: '#F9FAFB',
          fontSize: 14,
          color: '#111',
          outline: 'none',
          boxSizing: 'border-box',
          fontFamily: 'inherit'
        }}
      />
    </div>
  );

  return (
    <div className="fade-in" style={{ height: '100%', background: '#fff', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ padding: '20px 20px 10px', flexShrink: 0, display: 'flex', alignItems: 'center', gap: 12 }}>
        <div 
          onClick={() => setActive('Home')}
          style={{ width: 32, height: 32, borderRadius: '50%', background: '#F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
        >
          <span style={{ fontSize: 14 }}>←</span>
        </div>
        <div style={{ fontSize: 22, fontWeight: 800, color: '#111' }}>{editData ? 'Edit Gig' : 'Create New Gig'}</div>
      </div>

      <div className="full-height-scroll" style={{ padding: '15px 20px' }}>
        {/* Step Indicator */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 25 }}>
          {[1, 2, 3].map(s => (
            <div key={s} style={{ flex: 1, height: 4, borderRadius: 10, background: step >= s ? '#6366F1' : '#F3F4F6' }} />
          ))}
        </div>

        {step === 1 && (
          <div className="fade-in">
            <div style={{ fontSize: 15, fontWeight: 800, color: '#111', marginBottom: 6 }}>What kind of help do you need?</div>
            <div style={{ fontSize: 12, color: '#888', marginBottom: 20 }}>Select the job type to continue.</div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { id: 'day', title: 'One Day Shift', desc: 'Single day requirement', icon: '☀️' },
                { id: 'part-time', title: 'Part-Time', desc: 'Regular for few days', icon: '📅' },
                { id: 'full-time', title: 'Full-Time', desc: 'Long term project', icon: '🏢' }
              ].map(opt => (
                <div 
                  key={opt.id}
                  onClick={() => setJobType(opt.id)}
                  className="tap-effect"
                  style={{ 
                    padding: '18px', 
                    borderRadius: 18, 
                    border: jobType === opt.id ? '2px solid #6366F1' : '1.5px solid #F0F0F0',
                    background: jobType === opt.id ? '#F5F5FF' : '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 15,
                    cursor: 'pointer'
                  }}
                >
                  <div style={{ fontSize: 24 }}>{opt.icon}</div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 800, color: jobType === opt.id ? '#6366F1' : '#111' }}>{opt.title}</div>
                    <div style={{ fontSize: 11, color: jobType === opt.id ? '#6366F1' : '#888', opacity: 0.8 }}>{opt.desc}</div>
                  </div>
                  <div style={{ flex: 1 }} />
                  {jobType === opt.id && <div style={{ width: 20, height: 20, borderRadius: '50%', background: '#6366F1', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 10 }}>✓</div>}
                </div>
              ))}
            </div>
            
            <div 
              onClick={() => setStep(2)}
              className="tap-effect"
              style={{ marginTop: 24, background: 'var(--primary-purple)', borderRadius: 16, padding: '16px 0', textAlign: 'center', color: '#fff', fontWeight: 800, fontSize: 14, cursor: 'pointer' }}
            >
              CONTINUE
            </div>

            <div style={{ textAlign: 'center', margin: '20px 0' }}>
               <span style={{ fontSize: 11, fontWeight: 900, color: '#BBB', letterSpacing: 1 }}>OR USE AI</span>
            </div>

            <div 
              onClick={() => setShowMagicModal(true)}
              className="tap-effect"
              style={{ background: '#1F1B3D', borderRadius: 16, padding: '20px', textAlign: 'left', color: '#fff', cursor: 'pointer', position: 'relative', overflow: 'hidden' }}
            >
              <div style={{ position: 'absolute', right: -20, bottom: -20, fontSize: 80, opacity: 0.1 }}>🪄</div>
              <div style={{ fontSize: 13, fontWeight: 800, marginBottom: 4 }}>Magic Create</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)' }}>Describe the job in one sentence...</div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="fade-in">
             {editData?.fromVoice && (
                <div style={{ background: '#F5F3FF', border: '1.5px solid #DDD6FE', borderRadius: 20, padding: '16px', marginBottom: 20, display: 'flex', gap: 12, alignItems: 'center' }}>
                    <div style={{ fontSize: 24 }}>🧞</div>
                    <div>
                        <div style={{ fontSize: 13, fontWeight: 900, color: '#5B21B6' }}>MAGIC DRAFT READY!</div>
                        <div style={{ fontSize: 11, color: '#6D28D9', fontWeight: 600 }}>I've pre-filled the details from your voice. Review & complete the rest. ✨</div>
                    </div>
                </div>
             )}
             <div style={{ fontSize: 15, fontWeight: 800, color: '#111', marginBottom: 20 }}>Job Details</div>
             
             <div style={{ position: 'relative' }}>
                {renderInput('Job Title', 'title', 'text', 'e.g. Warehouse Packer')}
                {editData?.fromVoice && !formData.title && <div style={{ position: 'absolute', right: 10, top: 0, fontSize: 9, fontWeight: 900, color: '#EF4444', background: '#FEE2E2', padding: '2px 8px', borderRadius: 10 }}>PLEASE FILL</div>}
             </div>

             <div style={{ position: 'relative' }}>
                {renderInput('Daily Wage (₹)', 'wage', 'number', 'e.g. 700')}
                {editData?.fromVoice && !formData.wage && <div style={{ position: 'absolute', right: 10, top: 0, fontSize: 9, fontWeight: 900, color: '#EF4444', background: '#FEE2E2', padding: '2px 8px', borderRadius: 10 }}>PLEASE FILL</div>}
             </div>

             <div style={{ position: 'relative' }}>
                {renderInput('Workers Needed', 'workerCount', 'number', 'e.g. 5')}
                {editData?.fromVoice && !formData.workerCount && <div style={{ position: 'absolute', right: 10, top: 0, fontSize: 9, fontWeight: 900, color: '#EF4444', background: '#FEE2E2', padding: '2px 8px', borderRadius: 10 }}>PLEASE FILL</div>}
             </div>
             
             <div style={{ display: 'flex', gap: 12 }}>
                <div style={{ flex: 1, position: 'relative' }}>
                   {jobType === 'day' && renderInput('Work Date', 'startDate', 'date')}
                   {jobType === 'part-time' && renderInput('Start Date', 'startDate', 'date')}
                   {jobType === 'full-time' && renderInput('Joining Date', 'startDate', 'date')}
                   {editData?.fromVoice && !formData.startDate && <div style={{ position: 'absolute', right: 10, top: 0, fontSize: 9, fontWeight: 900, color: '#EF4444', background: '#FEE2E2', padding: '2px 8px', borderRadius: 10 }}>PLEASE FILL</div>}
                </div>
                {jobType === 'part-time' && (
                   <div style={{ flex: 1, position: 'relative' }}>
                      {renderInput('End Date', 'endDate', 'date')}
                      {editData?.fromVoice && !formData.endDate && <div style={{ position: 'absolute', right: 10, top: 0, fontSize: 9, fontWeight: 900, color: '#EF4444', background: '#FEE2E2', padding: '2px 8px', borderRadius: 10 }}>PLEASE FILL</div>}
                   </div>
                )}
             </div>

             {/* Shift Timing Section */}
             <div style={{ fontSize: 12, fontWeight: 700, color: '#444', marginBottom: 10, letterSpacing: 0.5, marginTop: 4 }}>SHIFT TIMING</div>
             <div style={{ display: 'flex', gap: 12, marginBottom: 18 }}>
                <div style={{ flex: 1 }}>
                   <div style={{ position: 'relative' }}>
                      <span style={{ position: 'absolute', left: 14, top: 14, fontSize: 12, color: '#888' }}>START</span>
                      <input 
                        type="time" 
                        value={formData.startTime}
                        onChange={(e) => setFormData({...formData, startTime: e.target.value})}
                        style={{ width: '100%', padding: '14px 14px 14px 55px', borderRadius: 14, border: '1.5px solid #F0F0F0', background: '#F9FAFB', fontSize: 14, fontWeight: 600 }}
                      />
                   </div>
                </div>
                <div style={{ flex: 1 }}>
                   <div style={{ position: 'relative' }}>
                      <span style={{ position: 'absolute', left: 14, top: 14, fontSize: 12, color: '#888' }}>END</span>
                      <input 
                        type="time" 
                        value={formData.endTime}
                        onChange={(e) => setFormData({...formData, endTime: e.target.value})}
                        style={{ width: '100%', padding: '14px 14px 14px 45px', borderRadius: 14, border: '1.5px solid #F0F0F0', background: '#F9FAFB', fontSize: 14, fontWeight: 600 }}
                      />
                   </div>
                </div>
             </div>

             <div style={{ display: 'flex', gap: 12, marginTop: 10 }}>
                <div 
                  onClick={() => setStep(1)}
                  style={{ flex: 1, border: '1.5px solid #F0F0F0', borderRadius: 16, padding: '16px 0', textAlign: 'center', color: '#111', fontWeight: 800, fontSize: 14, cursor: 'pointer' }}
                >
                  BACK
                </div>
                <div 
                  onClick={() => setStep(3)}
                  style={{ flex: 1, background: '#6366F1', borderRadius: 16, padding: '16px 0', textAlign: 'center', color: '#fff', fontWeight: 800, fontSize: 14, cursor: 'pointer' }}
                >
                  NEXT
                </div>
             </div>
          </div>
        )}

        {step === 3 && (
          <div className="fade-in">
             {editData?.fromVoice && (
                <div style={{ background: '#F5F3FF', border: '1.5px solid #DDD6FE', borderRadius: 20, padding: '16px', marginBottom: 20, display: 'flex', gap: 12, alignItems: 'center' }}>
                    <div style={{ fontSize: 24 }}>🧞</div>
                    <div>
                        <div style={{ fontSize: 13, fontWeight: 900, color: '#5B21B6' }}>MAGIC DRAFT READY!</div>
                        <div style={{ fontSize: 11, color: '#6D28D9', fontWeight: 600 }}>I've filled what I could. Please review carefully. ✨</div>
                    </div>
                </div>
             )}
             <div style={{ fontSize: 15, fontWeight: 800, color: '#111', marginBottom: 20 }}>Requirements & Tasks</div>
             
             <div style={{ position: 'relative' }}>
                {renderInput('Description', 'description', 'text', 'Tell workers about the role...')}
                {editData?.fromVoice && !formData.description && <div style={{ position: 'absolute', right: 10, top: 0, fontSize: 9, fontWeight: 900, color: '#EF4444', background: '#FEE2E2', padding: '2px 8px', borderRadius: 10 }}>PLEASE FILL</div>}
             </div>
             
             <div style={{ position: 'relative' }}>
                {renderInput('Requirements', 'requirements', 'text', 'e.g. Physical fitness, Aadhaar...')}
                {editData?.fromVoice && !formData.requirements && <div style={{ position: 'absolute', right: 10, top: 0, fontSize: 9, fontWeight: 900, color: '#EF4444', background: '#FEE2E2', padding: '2px 8px', borderRadius: 10 }}>PLEASE FILL</div>}
             </div>

             {/* Voice Note Option */}
             <div style={{ marginBottom: 25, background: '#F8F9FF', border: '1.5px solid #E1E7FF', borderRadius: 20, padding: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                   <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>🎙️</div>
                      <div>
                         <div style={{ fontSize: 13, fontWeight: 800, color: '#1A1A3E' }}>Add Voice Instruction</div>
                         <div style={{ fontSize: 11, color: '#6366F1', fontWeight: 600 }}>Clarify job tasks via audio</div>
                      </div>
                   </div>
                   <div 
                      onClick={() => setFormData({...formData, voiceNoteEnabled: !formData.voiceNoteEnabled})}
                      style={{ 
                        width: 48, height: 26, background: formData.voiceNoteEnabled ? '#22c55e' : '#D1D5DB', borderRadius: 20, position: 'relative', cursor: 'pointer', transition: '0.3s'
                      }}
                   >
                      <div style={{ width: 22, height: 22, background: '#fff', borderRadius: '50%', position: 'absolute', top: 2, left: formData.voiceNoteEnabled ? 24 : 2, transition: '0.3s' }} />
                   </div>
                </div>
                {formData.voiceNoteEnabled && (
                  <div className="fade-in" style={{ textAlign: 'center', padding: '10px 0' }}>
                     <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 20 }}>
                        <div className="tap-effect" style={{ width: 54, height: 54, borderRadius: '50%', background: '#EF4444', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 24, boxShadow: '0 4px 15px rgba(239,68,68,0.3)' }}>⬤</div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: '#444' }}>0:00 / 0:30s</div>
                     </div>
                  </div>
                )}
             </div>

             <div style={{ background: '#FFF7ED', border: '1px dashed #F59E0B', borderRadius: 18, padding: '18px', marginBottom: 25 }}>
                <div style={{ fontSize: 12, fontWeight: 800, color: '#C2410C' }}>PRO TIP 💡</div>
                <div style={{ fontSize: 11, color: '#C2410C', marginTop: 4, lineHeight: 1.5 }}>Jobs with detailed descriptions get 40% more applicants within the first hour.</div>
             </div>

             <div 
               onClick={loading ? null : handleCreate}
               className="tap-effect"
               style={{ background: '#22c55e', borderRadius: 18, padding: '18px 0', textAlign: 'center', color: '#fff', fontWeight: 800, fontSize: 15, cursor: 'pointer', opacity: loading ? 0.7 : 1 }}
             >
               {loading ? 'POSTING...' : (editData ? 'UPDATE GIG 🚀' : 'PUBLISH GIG 🚀')}
             </div>
          </div>
        )}

        <div style={{ height: 100 }} />
      </div>

      {/* Magic Create Modal */}
      <AnimatePresence>
        {showMagicModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              style={{ background: '#fff', borderRadius: 24, padding: '28px', width: '100%', maxWidth: 400 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
                <h3 style={{ margin: 0, fontSize: 20, fontWeight: 900 }}>Magic Create 🪄</h3>
                <div onClick={() => setShowMagicModal(false)} style={{ fontSize: 20, cursor: 'pointer' }}>✕</div>
              </div>
              <p style={{ fontSize: 13, color: '#666', marginBottom: 20 }}>Describe what you need (e.g., "10 security guards for a 3-night shift starting Monday")</p>
              <textarea 
                placeholder="Describe your job..."
                value={magicPrompt}
                onChange={e => setMagicPrompt(e.target.value)}
                style={{ width: '100%', height: 100, borderRadius: 16, border: '1.5px solid #F0F0F0', padding: 16, fontSize: 14, outline: 'none', background: '#F9FAFB', marginBottom: 20 }}
              />
              <div 
                onClick={handleMagicCreate}
                className="tap-effect"
                style={{ background: '#6366F1', color: '#fff', borderRadius: 16, padding: '16px', textAlign: 'center', fontWeight: 800, cursor: 'pointer' }}>
                {isMagicLoading ? 'GENERATING...' : 'GENERATE GIG ⚡'}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CreateJobScreen;
