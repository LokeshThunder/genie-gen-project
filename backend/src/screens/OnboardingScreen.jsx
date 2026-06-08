import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { aiService } from '../services/aiService';
import { safeGet } from '../utils/safeGet';

const OnboardingScreen = ({ onComplete, onLogout, role = 'worker', t = {}, initialData = {} }) => {
  const [step, setStep] = useState(1);
  const isAdmin = role === 'admin' || role === 'super_admin';
  const [formData, setFormData] = useState({
    name: initialData.name || '',
    dob: initialData.dob || '',
    gender: initialData.gender || '',
    experience: initialData.experience || '',
    skills: initialData.skills || [],
    preferredAreas: initialData.preferredAreas || '',
    companyHq: initialData.companyHq || '',
    sector: initialData.sector || '',
    companyDescription: initialData.companyDescription || '',
    operationalScale: initialData.operationalScale || '50-100',
    role: role
  });

  const [isGenerating, setIsGenerating] = useState(false);

  const generateAIContent = async () => {
    setIsGenerating(true);
    try {
      if (isAdmin) {
        const vision = await aiService.generateVision(formData.name, formData.sector, formData.operationalScale);
        setFormData(prev => ({ ...prev, companyDescription: vision }));
      } else {
        const bio = await aiService.generateBio(formData.name, role, formData.skills, formData.experience);
        setFormData(prev => ({ ...prev, preferredAreas: bio }));
      }
    } catch (error) {
      console.error("AI Generation failed", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const skillsList = ["DELIVERY", "WAREHOUSING", "RETAIL", "SECURITY", "DRIVING", "DATA_ENTRY", "COOKING"];
  const sectorList = ["LOGISTICS", "HOSPITALITY", "RETAIL_TECH", "SECURITY_OPS", "CONSTRUCTION"];

  const isStepValid = () => {
    if (step === 1) {
      if (isAdmin) return formData.name.trim() !== '' && formData.companyHq.trim() !== '';
      return formData.name.trim() !== '' && formData.dob !== '' && formData.gender !== '';
    }
    if (step === 2) {
      if (isAdmin) return formData.operationalScale !== '' && formData.sector !== '';
      return formData.experience !== '' && formData.skills.length > 0;
    }
    if (step === 3) {
      if (isAdmin) return formData.companyDescription.trim() !== '';
      return formData.preferredAreas.trim() !== '';
    }
    return true;
  };

  const handleNext = () => {
    if (!isStepValid()) return;
    if (step < 3) setStep(step + 1);
    else onComplete(formData);
  };

  const toggleSkill = (skill) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.includes(skill) 
        ? prev.skills.filter(s => s !== skill) 
        : [...prev.skills, skill]
    }));
  };

  return (
    <div className="fade-in" style={{ height: '100%', background: 'var(--bg)', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>
      {/* Dev Bypass */}
      <div 
        onClick={() => onComplete({ name: isAdmin ? 'Genie Partner' : 'Genie Worker', role: role, companyHq: 'NEW DELHI', sector: 'LOGISTICS' })}
        className="tap-effect"
        style={{ position: 'absolute', top: 12, right: 12, fontSize: 10, fontWeight: 800, color: 'var(--cred-text-sub)', cursor: 'pointer', padding: '6px 12px', borderRadius: 12, zIndex: 100, background: 'var(--bg-card)', border: '1px solid var(--cred-border)' }}>
        Bypass
      </div>
      
      {/* Header Container */}
      <div style={{ 
        padding: 'var(--header-pad) 16px 20px', 
        flexShrink: 0, 
        borderBottom: '1px solid var(--cred-border)', 
        zIndex: 10,
        background: 'var(--bg-card)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, background: 'var(--bg-card)', color: 'var(--text-primary)', fontWeight: 800, border: '1px solid var(--cred-border)' }}>✨</div>
            <div>
              <h1 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>{t.welcome || 'Welcome!'}</h1>
              <div style={{ color: 'var(--cred-text-sub)', fontSize: 12, fontWeight: 600, marginTop: 2 }}>{t.setup_profile || "Let's set up your profile"}</div>
            </div>
          </div>
          {onLogout && (
            <div onClick={onLogout} className="tap-effect" style={{ fontSize: 12, fontWeight: 700, color: '#ff4d4d', cursor: 'pointer', padding: '6px 10px', borderRadius: 8, border: '1px solid #ff4d4d22', background: '#ff4d4d11' }}>
              Logout
            </div>
          )}
        </div>
      </div>

      <div className="full-height-scroll" style={{ padding: '24px 16px' }}>
        {/* Progress Bar */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 32, padding: '0 4px' }}>
            {[1, 2, 3].map(i => (
              <div key={i} style={{ flex: 1, height: 8, background: step >= i ? '#0D0D0D' : '#F2F2F0', borderRadius: 4 }} />
            ))}
        </div>

        <div style={{ marginBottom: 24, paddingLeft: 4 }}>
          <h2 style={{ color: 'var(--text-primary)', margin: 0, fontSize: 22, fontWeight: 800 }}>
            {step === 1 && (isAdmin ? (t.about_company || "About your Company") : (t.about_you || "Tell us about you"))}
            {step === 2 && (isAdmin ? (t.industry_sectors || "Industry Sectors") : (t.skills_exp || "Skills & Experience"))}
            {step === 3 && (isAdmin ? (t.company_vision || "Company Vision") : (t.your_preferences || "Your Preferences"))}
          </h2>
          <div style={{ color: 'var(--cred-text-sub)', marginTop: 4, fontSize: 14, fontWeight: 600 }}>
            {step === 1 && (t.onboarding_step1_desc || "Start by sharing your basic details.")}
            {step === 2 && (t.onboarding_step2_desc || "Help us find the best matches for you.")}
            {step === 3 && (t.onboarding_step3_desc || "Final details to get you started.")}
          </div>
        </div>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div key="step1" initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }}>
              <div style={{ marginBottom: 20 }}>
                <label style={{ color: 'var(--cred-text-sub)', display: 'block', marginBottom: 8, paddingLeft: 4, fontSize: 13, fontWeight: 700 }}>
                  {isAdmin ? (t.company_name || "Company Name") : (t.full_name || "Full Name")}
                  <span style={{ color: '#ff4d4d', marginLeft: 4 }}>*</span>
                </label>
                <input type="text" placeholder={isAdmin ? (t.company_name_placeholder || "E.g. Logistics Corp") : (t.full_name_placeholder || "Enter your full name")} value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="cred-card" style={{ width: '100%', padding: '16px', borderRadius: 16, fontSize: 16, fontWeight: 600, outline: 'none', background: 'var(--bg)', color: 'var(--text-primary)', border: '1px solid var(--cred-border)' }} />
              </div>
              
              {isAdmin ? (
                <div style={{ marginBottom: 20 }}>
                  <label style={{ color: 'var(--cred-text-sub)', display: 'block', marginBottom: 8, paddingLeft: 4, fontSize: 13, fontWeight: 700 }}>
                    {t.headquarters || 'Headquarters'}
                    <span style={{ color: '#ff4d4d', marginLeft: 4 }}>*</span>
                  </label>
                  <input type="text" placeholder={t.headquarters_placeholder || "E.g. Mumbai, Delhi"} value={formData.companyHq} onChange={(e) => setFormData({...formData, companyHq: e.target.value})} className="cred-card" style={{ width: '100%', padding: '16px', borderRadius: 16, fontSize: 16, fontWeight: 600, outline: 'none', background: 'var(--bg)', color: 'var(--text-primary)', border: '1px solid var(--cred-border)' }} />
                </div>
              ) : (
                <>
                  <div style={{ marginBottom: 20 }}>
                    <label style={{ color: 'var(--cred-text-sub)', display: 'block', marginBottom: 8, paddingLeft: 4, fontSize: 13, fontWeight: 700 }}>
                      {t.dob || 'Date of Birth'}
                      <span style={{ color: '#ff4d4d', marginLeft: 4 }}>*</span>
                    </label>
                    <input type="date" max={new Date().toISOString().split('T')[0]} value={formData.dob} onChange={(e) => setFormData({...formData, dob: e.target.value})} className="cred-card" style={{ width: '100%', padding: '16px', borderRadius: 16, fontSize: 16, fontWeight: 600, outline: 'none', background: 'var(--bg)', color: 'var(--text-primary)', border: '1px solid var(--cred-border)' }} />
                  </div>
                  <div style={{ marginBottom: 20 }}>
                    <label style={{ color: 'var(--cred-text-sub)', display: 'block', marginBottom: 8, paddingLeft: 4, fontSize: 13, fontWeight: 700 }}>
                      {t.gender || 'Gender'}
                      <span style={{ color: '#ff4d4d', marginLeft: 4 }}>*</span>
                    </label>
                    <div style={{ display: 'flex', gap: 10 }}>
                      {[t.male || 'Male', t.female || 'Female', t.other || 'Other'].map(g => (
                        <div 
                          key={g} 
                          onClick={() => setFormData({...formData, gender: g})} 
                          className="tap-effect cred-card" 
                          style={{ 
                            flex: 1, padding: '14px 0', textAlign: 'center', fontSize: 14, fontWeight: 800, 
                            background: formData.gender === g ? '#0D0D0D' : '#FFFFFF', 
                            color: formData.gender === g ? '#FFFFFF' : 'var(--cred-text-sub)',
                            border: formData.gender === g ? '1px solid #0D0D0D' : '1px solid var(--cred-border)',
                            borderRadius: 16
                          }}>
                          {g}
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="step2" initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }}>
               {isAdmin ? (
                <>
                  <div style={{ marginBottom: 24 }}>
                    <label style={{ color: 'var(--cred-text-sub)', display: 'block', marginBottom: 12, paddingLeft: 4, fontSize: 13, fontWeight: 700 }}>
                      {t.operational_scale || 'Operational Scale (Workers)'}
                      <span style={{ color: '#ff4d4d', marginLeft: 4 }}>*</span>
                    </label>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
                      {['10-50', '50-200', '200-500', '500+'].map(scale => (
                        <div 
                          key={scale} 
                          onClick={() => setFormData({...formData, operationalScale: scale})} 
                          className="tap-effect cred-card" 
                          style={{ 
                            padding: '16px 0', textAlign: 'center', fontSize: 14, fontWeight: 800, 
                            background: formData.operationalScale === scale ? '#0D0D0D' : '#FFFFFF', 
                            color: formData.operationalScale === scale ? '#FFFFFF' : 'var(--cred-text-sub)',
                            border: formData.operationalScale === scale ? '1px solid #0D0D0D' : '1px solid var(--cred-border)',
                            borderRadius: 16
                          }}>
                          {scale}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label style={{ color: 'var(--cred-text-sub)', display: 'block', marginBottom: 12, paddingLeft: 4, fontSize: 13, fontWeight: 700 }}>
                      {t.primary_sector || 'Primary Sector'}
                      <span style={{ color: '#ff4d4d', marginLeft: 4 }}>*</span>
                    </label>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                      {sectorList.map(sector => (
                        <div 
                          key={sector} 
                          onClick={() => setFormData({...formData, sector: sector})} 
                          className="tap-effect cred-card" 
                          style={{ 
                            padding: '10px 16px', borderRadius: 16, fontSize: 13, fontWeight: 800, 
                            background: formData.sector === sector ? '#0D0D0D' : '#FFFFFF', 
                            color: formData.sector === sector ? '#FFFFFF' : 'var(--cred-text-sub)', 
                            border: `1px solid ${formData.sector === sector ? '#0D0D0D' : 'var(--cred-border)'}`
                          }}>
                          {safeGet(t, sector.toLowerCase()) || sector.replace('_', ' ')}
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div style={{ marginBottom: 24 }}>
                    <label style={{ color: 'var(--cred-text-sub)', display: 'block', marginBottom: 12, paddingLeft: 4, fontSize: 13, fontWeight: 700 }}>
                      {t.experience_level || 'Experience Level (Years)'}
                      <span style={{ color: '#ff4d4d', marginLeft: 4 }}>*</span>
                    </label>
                    <div style={{ display: 'flex', gap: 10 }}>
                      {['0-1', '1-3', '3-5', '5+'].map(exp => (
                        <div 
                          key={exp} 
                          onClick={() => setFormData({...formData, experience: exp})} 
                          className="tap-effect cred-card" 
                          style={{ 
                            flex: 1, padding: '16px 0', textAlign: 'center', fontSize: 14, fontWeight: 800, 
                            background: formData.experience === exp ? '#0D0D0D' : '#FFFFFF', 
                            color: formData.experience === exp ? '#FFFFFF' : 'var(--cred-text-sub)',
                            border: formData.experience === exp ? '1px solid #0D0D0D' : '1px solid var(--cred-border)',
                            borderRadius: 16
                          }}>
                          {exp}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label style={{ color: 'var(--cred-text-sub)', display: 'block', marginBottom: 12, paddingLeft: 4, fontSize: 13, fontWeight: 700 }}>
                      {t.my_skills || 'My Skills'}
                      <span style={{ color: '#ff4d4d', marginLeft: 4 }}>*</span>
                    </label>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                      {skillsList.map(skill => (
                        <div 
                          key={skill} 
                          onClick={() => toggleSkill(skill)} 
                          className="tap-effect cred-card" 
                          style={{ 
                            padding: '10px 16px', borderRadius: 16, fontSize: 13, fontWeight: 800, 
                            background: formData.skills.includes(skill) ? '#0D0D0D' : '#FFFFFF', 
                            color: formData.skills.includes(skill) ? '#FFFFFF' : 'var(--cred-text-sub)', 
                            border: `1px solid ${formData.skills.includes(skill) ? '#0D0D0D' : 'var(--cred-border)'}`
                          }}>
                          {safeGet(t, skill.toLowerCase()) || skill.replace('_', ' ')}
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </motion.div>
          )}

          {step === 3 && (
            <motion.div key="step3" initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }}>
              <div style={{ marginBottom: 24 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <label style={{ color: 'var(--cred-text-sub)', marginBottom: 0, paddingLeft: 4, fontSize: 13, fontWeight: 700 }}>
                    {isAdmin ? (t.company_vision || "Company Vision") : (t.preferred_areas || "Preferred Areas")}
                    <span style={{ color: '#ff4d4d', marginLeft: 4 }}>*</span>
                  </label>
                  <div 
                    onClick={generateAIContent}
                    className="tap-effect"
                    style={{ 
                      fontSize: 11, fontWeight: 800, color: 'var(--text-primary)', 
                      background: 'var(--bg-surface)', padding: '4px 10px', 
                      borderRadius: 8, display: 'flex', alignItems: 'center', gap: 4,
                      border: '1px solid var(--cred-border)',
                      opacity: isGenerating ? 0.5 : 1
                    }}>
                    {isGenerating ? '⌛' : '✨'} {isAdmin ? 'Generate Vision' : 'Generate Bio'}
                  </div>
                </div>
                {isAdmin ? (
                  <textarea placeholder={t.company_vision_placeholder || "Describe your company culture and mission..."} value={formData.companyDescription} onChange={(e) => setFormData({...formData, companyDescription: e.target.value})} className="cred-card" style={{ width: '100%', padding: '16px', borderRadius: 16, fontSize: 15, fontWeight: 600, outline: 'none', background: 'var(--bg)', color: 'var(--text-primary)', minHeight: 120, resize: 'none', border: '1px solid var(--cred-border)' }} />
                ) : (
                  <input type="text" placeholder={t.preferred_areas_placeholder || "E.g. Bangalore, Chennai..."} value={formData.preferredAreas} onChange={(e) => setFormData({...formData, preferredAreas: e.target.value})} className="cred-card" style={{ width: '100%', padding: '16px', borderRadius: 16, fontSize: 16, fontWeight: 600, outline: 'none', background: 'var(--bg)', color: 'var(--text-primary)', border: '1px solid var(--cred-border)' }} />
                )}
              </div>
              <div className="cred-card" style={{ padding: '20px', display: 'flex', gap: 16, borderRadius: 16, background: 'var(--bg-subtle)', border: '1px solid var(--cred-border)' }}>
                <span style={{ fontSize: 32 }}>{isAdmin ? '🏢' : '🤖'}</span>
                <div>
                  <div style={{ fontSize: 16, color: 'var(--text-primary)', fontWeight: 800 }}>{isAdmin ? (t.smart_matching || "Smart Matching") : (t.personalized_helper || "Personalized Helper")}</div>
                  <div style={{ color: 'var(--cred-text-sub)', marginTop: 4, fontSize: 13, fontWeight: 600 }}>{isAdmin ? (t.smart_matching_desc || "We'll help you find the best workers.") : (t.personalized_helper_desc || "I'll help you find the best jobs near you.")}</div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div style={{ padding: '16px 20px 40px', display: 'flex', gap: 12, borderTop: '1px solid var(--cred-border)', background: 'var(--bg-card)' }}>
        {step > 1 && (
          <div onClick={() => setStep(step - 1)} className="tap-effect" style={{ flex: 1, padding: '18px 0', fontSize: 16, fontWeight: 800, borderRadius: 12, border: '1px solid var(--cred-border)', textAlign: 'center', background: 'var(--bg)', color: 'var(--text-primary)', cursor: 'pointer' }}>{t.back || 'Back'}</div>
        )}
        <div 
          onClick={handleNext} 
          className="tap-effect cred-btn-black" 
          style={{ 
            flex: 2, padding: '18px 0', fontSize: 16, fontWeight: 800, borderRadius: 12,
            background: isStepValid() ? '#0D0D0D' : '#F2F2F0',
            color: isStepValid() ? '#FFFFFF' : 'var(--cred-text-muted)',
            cursor: isStepValid() ? 'pointer' : 'not-allowed',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
          {step === 3 ? (t.complete_setup || "Complete Setup") : (t.continue || "Continue")}
        </div>
      </div>
    </div>
  );
};

export default OnboardingScreen;
