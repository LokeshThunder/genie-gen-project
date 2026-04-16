import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const OnboardingScreen = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    dob: '',
    gender: '',
    experience: '',
    skills: [],
    preferredAreas: '',
  });

  const skillsList = ["Delivery", "Warehousing", "Retail", "Security", "Driving", "Data Entry", "Cooking"];

  const handleNext = () => {
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
    <div style={{ height: '100%', background: '#fff', display: 'flex', flexDirection: 'column', padding: '40px 24px', position: 'relative' }}>
      {/* Dev Bypass */}
      <div 
        onClick={() => onComplete({ name: 'Admin Demo', role: 'admin' })}
        style={{ position: 'absolute', top: 15, right: 24, fontSize: 10, fontWeight: 900, color: '#5B3FC8', cursor: 'pointer', padding: '8px 12px', background: '#F5F3FF', borderRadius: 10, zIndex: 100 }}>
        DEMO BYPASS
      </div>
      {/* Header */}
      <div style={{ marginBottom: 40 }}>
        <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
          {[1, 2, 3].map(i => (
            <div key={i} style={{ flex: 1, height: 4, borderRadius: 2, background: step >= i ? '#5B3FC8' : '#EEE' }} />
          ))}
        </div>
        <h1 style={{ fontSize: 28, fontWeight: 900, color: '#111', letterSpacing: -1 }}>
          {step === 1 && "Start your journey."}
          {step === 2 && "Brag a little."}
          {step === 3 && "Where to work?"}
        </h1>
        <p style={{ color: '#888', fontSize: 14, marginTop: 4 }}>
          {step === 1 && "Let's start with the basics."}
          {step === 2 && "Tell us what you're good at."}
          {step === 3 && "Final step! Where do you prefer?"}
        </p>
      </div>

      {/* Steps Content */}
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div 
              key="step1"
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -20, opacity: 0 }}
              className="onboarding-step"
            >
              <div style={{ marginBottom: 20 }}>
                <label style={{ fontSize: 13, fontWeight: 800, color: '#444', display: 'block', marginBottom: 8 }}>FULL NAME</label>
                <input 
                  type="text" 
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  style={{ width: '100%', padding: '16px', borderRadius: 16, border: '1.5px solid #EEE', fontSize: 15, fontWeight: 600, outline: 'none' }}
                />
              </div>
              <div style={{ marginBottom: 20 }}>
                <label style={{ fontSize: 13, fontWeight: 800, color: '#444', display: 'block', marginBottom: 8 }}>DATE OF BIRTH</label>
                <input 
                  type="date" 
                  value={formData.dob}
                  onChange={(e) => setFormData({...formData, dob: e.target.value})}
                  style={{ width: '100%', padding: '16px', borderRadius: 16, border: '1.5px solid #EEE', fontSize: 15, fontWeight: 600, outline: 'none', color: '#111' }}
                />
              </div>
              <div style={{ marginBottom: 20 }}>
                <label style={{ fontSize: 13, fontWeight: 800, color: '#444', display: 'block', marginBottom: 12 }}>GENDER</label>
                <div style={{ display: 'flex', gap: 10 }}>
                  {['Male', 'Female', 'Other'].map(g => (
                    <div 
                      key={g}
                      onClick={() => setFormData({...formData, gender: g})}
                      className="tap-effect"
                      style={{ 
                        flex: 1, 
                        padding: '14px 0', 
                        borderRadius: 14, 
                        textAlign: 'center', 
                        fontSize: 13, 
                        fontWeight: 700,
                        background: formData.gender === g ? '#F5F3FF' : '#fff',
                        border: formData.gender === g ? '2px solid #5B3FC8' : '1.5px solid #EEE',
                        color: formData.gender === g ? '#5B3FC8' : '#888',
                        cursor: 'pointer'
                      }}
                    >
                      {g}
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div 
              key="step2"
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -20, opacity: 0 }}
            >
              <div style={{ marginBottom: 24 }}>
                <label style={{ fontSize: 13, fontWeight: 800, color: '#444', display: 'block', marginBottom: 8 }}>EXPERIENCE (YEARS)</label>
                <div style={{ display: 'flex', gap: 10 }}>
                  {['0-1', '1-3', '3-5', '5+'].map(exp => (
                    <div 
                      key={exp}
                      onClick={() => setFormData({...formData, experience: exp})}
                      className="tap-effect"
                      style={{ 
                        flex: 1, 
                        padding: '14px 0', 
                        borderRadius: 14, 
                        textAlign: 'center', 
                        fontSize: 13, 
                        fontWeight: 700,
                        background: formData.experience === exp ? '#F5F3FF' : '#fff',
                        border: formData.experience === exp ? '2px solid #5B3FC8' : '1.5px solid #EEE',
                        color: formData.experience === exp ? '#5B3FC8' : '#888',
                        cursor: 'pointer'
                      }}
                    >
                      {exp}
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <label style={{ fontSize: 13, fontWeight: 800, color: '#444', display: 'block', marginBottom: 12 }}>SKILLS</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                  {skillsList.map(skill => (
                    <div 
                      key={skill}
                      onClick={() => toggleSkill(skill)}
                      className="tap-effect"
                      style={{ 
                        padding: '10px 20px', 
                        borderRadius: 20, 
                        fontSize: 12, 
                        fontWeight: 700,
                        background: formData.skills.includes(skill) ? '#5B3FC8' : '#F9FAFB',
                        color: formData.skills.includes(skill) ? '#fff' : '#444',
                        border: '1.5px solid ' + (formData.skills.includes(skill) ? '#5B3FC8' : '#EEE'),
                        cursor: 'pointer'
                      }}
                    >
                      {skill}
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div 
              key="step3"
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -20, opacity: 0 }}
            >
              <div style={{ marginBottom: 20 }}>
                <label style={{ fontSize: 13, fontWeight: 800, color: '#444', display: 'block', marginBottom: 8 }}>PREFERRED WORK AREAS</label>
                <input 
                  type="text" 
                  placeholder="e.g. Madipakkam, Velachery, Chennai"
                  value={formData.preferredAreas}
                  onChange={(e) => setFormData({...formData, preferredAreas: e.target.value})}
                  style={{ width: '100%', padding: '16px', borderRadius: 16, border: '1.5px solid #EEE', fontSize: 15, fontWeight: 600, outline: 'none' }}
                />
              </div>
              <div style={{ background: '#F0F9FF', border: '1.5px solid #BAE6FD', borderRadius: 16, padding: '16px', display: 'flex', gap: 12 }}>
                <span style={{ fontSize: 24 }}>🧞</span>
                <div>
                  <div style={{ fontWeight: 800, fontSize: 13, color: '#0369A1' }}>Genie Tip</div>
                  <div style={{ fontSize: 11, color: '#0369A1', marginTop: 2, lineHeight: 1.4 }}>Complete your profile to get 40% better job matches near you!</div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer Buttons */}
      <div style={{ paddingTop: 30, display: 'flex', gap: 12 }}>
        {step > 1 && (
          <div 
            onClick={() => setStep(step - 1)}
            className="tap-effect"
            style={{ flex: 1, padding: '18px', borderRadius: 20, textAlign: 'center', background: '#F8FAFC', color: '#111', fontWeight: 800, fontSize: 15, cursor: 'pointer', border: '1.5px solid #EEE' }}>
            BACK
          </div>
        )}
        <div 
          onClick={handleNext}
          className="tap-effect"
          style={{ flex: 2, padding: '18px', borderRadius: 20, textAlign: 'center', background: '#111', color: '#fff', fontWeight: 800, fontSize: 15, cursor: 'pointer', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}>
          {step === 3 ? "FINISH" : "CONTINUE"}
        </div>
      </div>
    </div>
  );
};

export default OnboardingScreen;
