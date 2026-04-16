import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FirestoreService } from '../services/firestoreService';
import { aiService } from '../services/aiService';

const CreateJobScreen = ({ setActive, editData, user }) => {
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
    urgent: false
  });
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [showMagicModal, setShowMagicModal] = useState(false);
  const [magicPrompt, setMagicPrompt] = useState('');
  const [isMagicLoading, setIsMagicLoading] = useState(false);
  const [error, setError] = useState(null);
  const [bypassLeadTime, setBypassLeadTime] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

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
        voiceNoteEnabled: !!editData.voiceNoteEnabled,
        category: editData.category || 'Logistics',
        pricingModel: editData.pricingModel || 'daily',
        pincode: editData.pincode || '',
        locationName: editData.locationName || '',
        requirementsTags: editData.requirementsTags || [],
        gender: editData.gender || 'Any',
        incentives: editData.incentives || '',
        urgent: !!editData.urgent
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
        setFormData(prev => ({ 
          ...prev, 
          ...result,
          requirementsTags: result.requirementsTags || []
        }));
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

  const validateStep2 = () => {
    const errors = {};
    if (!formData.title.trim()) errors.title = 'Job title is required';
    if (!formData.wage) errors.wage = 'Wage is required';
    if (!formData.pincode) errors.pincode = 'Pincode is required';
    if (!formData.locationName.trim()) errors.locationName = 'Area name is required';
    if (!formData.workerCount) errors.workerCount = 'Number of workers is required';
    if (!formData.startDate) errors.startDate = 'Start date is required';
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCreate = async () => {
    // Inline validation — no alert
    const errors = {};
    if (!formData.title.trim()) errors.title = 'Job title is required';
    if (!formData.wage) errors.wage = 'Wage is required';
    if (!formData.pincode) errors.pincode = 'Pincode is required';
    if (!formData.locationName.trim()) errors.locationName = 'Area name is required';
    if (!formData.workerCount) errors.workerCount = 'Number of workers is required';
    if (!formData.startDate) errors.startDate = 'Start date is required';
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setStep(2); // Go back to step 2 where the errors are
      return;
    }

    setLoading(true);
    try {
      // 3-Hour Lead Time Enforcement
      const startDateTime = new Date(`${formData.startDate}T${formData.startTime}`);
      const now = new Date();
      const threeHoursFromNow = new Date(now.getTime() + (3 * 60 * 60 * 1000));

      if (!bypassLeadTime && startDateTime < threeHoursFromNow) {
        setError("Operationally, we require a 3-hour lead time for new gigs. Please adjust the start time or use Bypass mode. 🕒");
        setLoading(false);
        return;
      }

      setError(null);

      const jobData = {
        ...formData,
        wage: Number(formData.wage),
        workerCount: Number(formData.workerCount),
        pincode: Number(formData.pincode) || formData.pincode,
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
      
      setActive('Home');
    } catch (error) {
      console.error("Error saving job:", error);
      setError("Failed to save job. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  const renderInput = (label, name, type = 'text', placeholder = '') => {
    const hasError = !!fieldErrors[name];
    return (
      <div style={{ marginBottom: 18 }}>
        <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: hasError ? '#EF4444' : '#444', marginBottom: 6 }}>
          {label.toUpperCase()}
        </label>
        <input 
          type={type}
          placeholder={placeholder}
          value={formData[name]}
          onChange={(e) => {
            setFormData({ ...formData, [name]: e.target.value });
            if (fieldErrors[name]) setFieldErrors(prev => ({ ...prev, [name]: null }));
          }}
          style={{ 
            width: '100%', 
            padding: '14px 16px', 
            borderRadius: 14, 
            border: hasError ? '1.5px solid #EF4444' : '1.5px solid #F0F0F0', 
            background: hasError ? '#FFF5F5' : '#F9FAFB',
            fontSize: 14,
            color: '#111',
            outline: 'none',
            boxSizing: 'border-box',
            fontFamily: 'inherit'
          }}
        />
        {hasError && (
          <div style={{ marginTop: 5, fontSize: 11, color: '#EF4444', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>
            <span>⚠</span> {fieldErrors[name]}
          </div>
        )}
      </div>
    );
  };

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

            <div style={{ fontSize: 15, fontWeight: 800, color: '#111', marginTop: 25, marginBottom: 15 }}>Category</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
              {[
                { id: 'Logistics', icon: '📦' },
                { id: 'Hospitality', icon: '🍽️' },
                { id: 'Security', icon: '🛡️' },
                { id: 'Cleaning', icon: '🧹' },
                { id: 'Retail', icon: '🛍️' },
                { id: 'Office', icon: '💼' }
              ].map(cat => (
                <div 
                  key={cat.id}
                  onClick={() => setFormData({...formData, category: cat.id})}
                  style={{ 
                    padding: '12px', 
                    borderRadius: 14, 
                    border: formData.category === cat.id ? '2px solid #6366F1' : '1.5px solid #F0F0F0',
                    background: formData.category === cat.id ? '#F5F5FF' : '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    cursor: 'pointer'
                  }}
                >
                   <span style={{ fontSize: 18 }}>{cat.icon}</span>
                   <span style={{ fontSize: 12, fontWeight: 700, color: formData.category === cat.id ? '#6366F1' : '#444' }}>{cat.id}</span>
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
             
             {error && (
                <div style={{ background: '#FEF2F2', border: '1.5px solid #FEE2E2', borderRadius: 12, padding: '12px', marginBottom: 20, color: '#EF4444', fontSize: 13, fontWeight: 700 }}>
                  ⚠️ {error}
                </div>
              )}

             <div style={{ position: 'relative' }}>
                {renderInput('Job Title ⚡', 'title', 'text', 'e.g. Warehouse Packer')}
                {(editData?.fromVoice && !formData.title) && <div style={{ position: 'absolute', right: 10, top: 0, fontSize: 9, fontWeight: 900, color: '#EF4444', background: '#FEE2E2', padding: '2px 8px', borderRadius: 10 }}>PLEASE FILL</div>}
             </div>

              <div style={{ display: 'flex', gap: 12 }}>
                <div style={{ flex: 1, position: 'relative' }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: '#444', marginBottom: 6 }}>PRICING MODEL</div>
                    <div style={{ display: 'flex', gap: 4, background: '#F3F4F6', padding: 4, borderRadius: 12, marginBottom: 18 }}>
                        {['daily', 'hourly'].map(m => (
                            <div 
                                key={m}
                                onClick={() => setFormData({...formData, pricingModel: m})}
                                style={{ 
                                    flex: 1, padding: '8px 0', textAlign: 'center', fontSize: 11, fontWeight: 800, borderRadius: 10, cursor: 'pointer',
                                    background: formData.pricingModel === m ? '#fff' : 'transparent',
                                    color: formData.pricingModel === m ? '#6366F1' : '#888',
                                    boxShadow: formData.pricingModel === m ? '0 2px 8px rgba(0,0,0,0.05)' : 'none'
                                }}
                            >
                                {m.toUpperCase()}
                            </div>
                        ))}
                    </div>
                </div>
                <div style={{ flex: 1.5 }}>
                   {renderInput(formData.pricingModel === 'daily' ? 'Daily Wage (₹) ⚡' : 'Hourly Rate (₹) ⚡', 'wage', 'number', 'e.g. 700')}
                </div>
              </div>

              <div style={{ display: 'flex', gap: 12 }}>
                 <div style={{ flex: 1 }}>
                    {renderInput('Pincode ⚡', 'pincode', 'number', '6-digit')}
                 </div>
                 <div style={{ flex: 1.5 }}>
                    {renderInput('Area Name ⚡', 'locationName', 'text', 'e.g. Madipakkam')}
                 </div>
              </div>

              <div style={{ position: 'relative' }}>
                 {renderInput('Workers Needed ⚡', 'workerCount', 'number', 'e.g. 5')}
                 {(editData?.fromVoice && !formData.workerCount) && <div style={{ position: 'absolute', right: 10, top: 0, fontSize: 9, fontWeight: 900, color: '#EF4444', background: '#FEE2E2', padding: '2px 8px', borderRadius: 10 }}>PLEASE FILL</div>}
              </div>
              
              <div style={{ display: 'flex', gap: 12 }}>
                 <div style={{ flex: 1, position: 'relative' }}>
                    {jobType === 'day' && renderInput('Work Date ⚡', 'startDate', 'date')}
                    {jobType === 'part-time' && renderInput('Start Date ⚡', 'startDate', 'date')}
                    {jobType === 'full-time' && renderInput('Joining Date ⚡', 'startDate', 'date')}
                    {(editData?.fromVoice && !formData.startDate) && <div style={{ position: 'absolute', right: 10, top: 0, fontSize: 9, fontWeight: 900, color: '#EF4444', background: '#FEE2E2', padding: '2px 8px', borderRadius: 10 }}>PLEASE FILL</div>}
                 </div>
                 {(jobType === 'part-time' || jobType === 'full-time') && (
                    <div style={{ flex: 1, position: 'relative' }}>
                       {renderInput('Until Date', 'endDate', 'date')}
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
                  onClick={() => { if (validateStep2()) setStep(3); }}
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
             <div style={{ fontSize: 15, fontWeight: 800, color: '#111', marginBottom: 20 }}>Requirements & Workers</div>
             
             <div style={{ position: 'relative' }}>
                {renderInput('Detailed Description', 'description', 'text', 'Specific tasks, dress code, etc...')}
                {editData?.fromVoice && !formData.description && <div style={{ position: 'absolute', right: 10, top: 0, fontSize: 9, fontWeight: 900, color: '#EF4444', background: '#FEE2E2', padding: '2px 8px', borderRadius: 10 }}>PLEASE FILL</div>}
             </div>

             <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 11, fontWeight: 900, color: '#666', letterSpacing: 1, marginBottom: 12 }}>SKILL REQUIREMENTS</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                   {['Aadhaar Card', 'Driving License', 'Smartphone', 'Heavy Lifting', 'Good English', 'Safety Shoes', 'Uniform Provided'].map(tag => (
                      <div 
                         key={tag}
                         onClick={() => {
                            const tags = formData.requirementsTags.includes(tag) 
                               ? formData.requirementsTags.filter(t => t !== tag)
                               : [...formData.requirementsTags, tag];
                            setFormData({...formData, requirementsTags: tags});
                         }}
                         style={{ 
                            padding: '10px 16px', borderRadius: 14, fontSize: 13, fontWeight: 700, cursor: 'pointer', transition: '0.2s',
                            background: formData.requirementsTags.includes(tag) ? '#6366F1' : '#F3F4F6',
                            color: formData.requirementsTags.includes(tag) ? '#fff' : '#666',
                            border: `1.5px solid ${formData.requirementsTags.includes(tag) ? '#6366F1' : '#E5E7EB'}`
                         }}
                      >
                         {tag}
                      </div>
                   ))}
                </div>
             </div>

             <div style={{ marginBottom: 25 }}>
                <div style={{ fontSize: 11, fontWeight: 900, color: '#666', letterSpacing: 1, marginBottom: 12 }}>GENDER PREFERENCE</div>
                <div style={{ display: 'flex', gap: 10 }}>
                   {['Any', 'Male', 'Female'].map(g => (
                      <div 
                         key={g}
                         onClick={() => setFormData({...formData, gender: g})}
                         style={{ 
                            flex: 1, padding: '12px', borderRadius: 16, textAlign: 'center', fontSize: 13, fontWeight: 800, cursor: 'pointer', transition: '0.2s',
                            background: formData.gender === g ? '#F0F9FF' : '#fff',
                            color: formData.gender === g ? '#0EA5E9' : '#666',
                            border: `2px solid ${formData.gender === g ? '#0EA5E9' : '#F0F0F0'}`
                         }}
                      >
                         {g === 'Any' ? '👫 Any' : g === 'Male' ? '👨 Male' : '👩 Female'}
                      </div>
                   ))}
                </div>
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

             <div style={{ position: 'relative' }}>
                {renderInput('Incentives & Perks', 'incentives', 'text', 'e.g. Food, Travel, Bonus')}
             </div>

             <div 
               onClick={() => setFormData({...formData, urgent: !formData.urgent})}
               style={{ 
                 marginBottom: 25, 
                 padding: '16px', 
                 borderRadius: 18, 
                 background: formData.urgent ? '#FFF1F2' : '#F9FAFB',
                 border: `1.5px solid ${formData.urgent ? '#FECDD3' : '#F0F0F0'}`,
                 display: 'flex',
                 alignItems: 'center',
                 justifyContent: 'space-between',
                 cursor: 'pointer'
               }}
             >
               <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                 <div style={{ fontSize: 20 }}>🔥</div>
                 <div>
                    <div style={{ fontSize: 13, fontWeight: 800, color: formData.urgent ? '#BE123C' : '#111' }}>Mark as Urgent</div>
                    <div style={{ fontSize: 11, color: formData.urgent ? '#E11D48' : '#888' }}>Boost visibility for faster fulfillment</div>
                 </div>
               </div>
               <div style={{ width: 44, height: 24, background: formData.urgent ? '#EF4444' : '#D1D5DB', borderRadius: 12, position: 'relative', transition: '0.3s' }}>
                 <div style={{ width: 18, height: 18, background: '#fff', borderRadius: '50%', position: 'absolute', top: 3, left: formData.urgent ? 23 : 3, transition: '0.3s' }} />
               </div>
             </div>

             <div 
                onClick={() => {
                  setBypassLeadTime(!bypassLeadTime);
                  if (!bypassLeadTime) setError(null); // clear error when bypass is enabled
                }}
                style={{ 
                  marginBottom: 25, 
                  padding: '16px', 
                  borderRadius: 18, 
                  background: bypassLeadTime ? '#ECFDF5' : (error && error.includes('3-hour') ? '#FFFBEB' : '#F9FAFB'),
                  border: `2px solid ${bypassLeadTime ? '#A7F3D0' : (error && error.includes('3-hour') ? '#F59E0B' : '#F0F0F0')}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  transition: '0.3s all'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ fontSize: 20 }}>🔓</div>
                  <div>
                     <div style={{ fontSize: 13, fontWeight: 800, color: bypassLeadTime ? '#059669' : (error && error.includes('3-hour') ? '#B45309' : '#111') }}>Bypass Lead Time</div>
                     <div style={{ fontSize: 11, color: bypassLeadTime ? '#10B981' : (error && error.includes('3-hour') ? '#D97706' : '#888') }}>
                       {error && error.includes('3-hour') && !bypassLeadTime ? '⚡ Tap to override the 3-hour rule' : 'Ignore the 3-hour operation rule (Admin Only)'}
                     </div>
                  </div>
                </div>
                <div style={{ width: 44, height: 24, background: bypassLeadTime ? '#10B981' : '#D1D5DB', borderRadius: 12, position: 'relative', transition: '0.3s' }}>
                  <div style={{ width: 18, height: 18, background: '#fff', borderRadius: '50%', position: 'absolute', top: 3, left: bypassLeadTime ? 23 : 3, transition: '0.3s' }} />
                </div>
              </div>

             <div style={{ background: '#FFF7ED', border: '1px dashed #F59E0B', borderRadius: 18, padding: '18px', marginBottom: 25 }}>
                <div style={{ fontSize: 12, fontWeight: 800, color: '#C2410C' }}>PRO TIP 💡</div>
                <div style={{ fontSize: 11, color: '#C2410C', marginTop: 4, lineHeight: 1.5 }}>Jobs with detailed descriptions get 40% more applicants within the first hour.</div>
             </div>

             {/* Error Banner — shown above publish button */}
             {error && (
               <div style={{ 
                 marginBottom: 16, 
                 padding: '14px 18px', 
                 borderRadius: 16, 
                 background: '#FFF1F2', 
                 border: '1.5px solid #FECDD3',
                 display: 'flex',
                 gap: 10,
                 alignItems: 'flex-start'
               }}>
                 <div style={{ fontSize: 18, flexShrink: 0 }}>🚫</div>
                 <div>
                   <div style={{ fontSize: 12, fontWeight: 900, color: '#BE123C', marginBottom: 2 }}>CANNOT PUBLISH</div>
                   <div style={{ fontSize: 12, color: '#E11D48', fontWeight: 600, lineHeight: 1.5 }}>{error}</div>
                 </div>
               </div>
             )}

             <div 
               onClick={loading ? null : handleCreate}
               className="tap-effect"
               style={{ background: loading ? '#9CA3AF' : '#22c55e', borderRadius: 18, padding: '18px 0', textAlign: 'center', color: '#fff', fontWeight: 800, fontSize: 15, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1 }}
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
