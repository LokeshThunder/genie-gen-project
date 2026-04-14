import React, { useState, useEffect } from 'react';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import { motion, AnimatePresence } from 'framer-motion';
import { aiService } from '../services/aiService';

const LANGUAGES = [
  { code: 'en-IN', label: 'English', flag: '🇮🇳' },
  { code: 'hi-IN', label: 'Hindi', flag: '🇮🇳' },
  { code: 'ta-IN', label: 'Tamil', flag: '🇮🇳' },
];

const GenieVoiceAssistant = ({ isOpen, onClose, onAction }) => {
  const [currentLang, setCurrentLang] = useState(LANGUAGES[0]);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState(null);

  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition
  } = useSpeechRecognition();

  useEffect(() => {
    if (!isOpen) {
      resetTranscript();
      setResult(null);
      setProcessing(false);
    }
  }, [isOpen, resetTranscript]);

  const toggleListening = () => {
    if (listening) {
      SpeechRecognition.stopListening();
      handleProcess(transcript);
    } else {
      resetTranscript();
      setResult(null);
      SpeechRecognition.startListening({ language: currentLang.code });
    }
  };

  const handleProcess = async (text) => {
    if (!text) return;
    setProcessing(true);
    const intentData = await aiService.processVoiceCommand(text);
    const finalData = { ...intentData, transcript: text };
    setResult(finalData);
    setProcessing(false);
    
    // Auto-onAction after 1.5s if successful
    if (finalData.intent !== 'UNKNOWN') {
       setTimeout(() => {
         onAction(finalData);
         onClose();
       }, 2000);
    }
  };

  if (!browserSupportsSpeechRecognition) {
    return null; // Or show non-supported UI
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            style={{ 
              background: 'var(--card-bg)', 
              borderRadius: 32, 
              width: '100%', 
              maxWidth: 400, 
              padding: '30px 24px',
              border: '1px solid var(--border-color)',
              boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
              position: 'relative'
            }}
          >
            {/* Close */}
            <div onClick={onClose} style={{ position: 'absolute', top: 20, right: 20, fontSize: 20, color: 'var(--text-muted)', cursor: 'pointer' }}>✕</div>

            {/* Language Picker */}
            <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 30 }}>
              {LANGUAGES.map(l => (
                <div 
                  key={l.code}
                  onClick={() => setCurrentLang(l)}
                  style={{ 
                    padding: '8px 12px', 
                    borderRadius: 12, 
                    background: currentLang.code === l.code ? 'var(--primary-purple)' : 'var(--bg-light)',
                    color: currentLang.code === l.code ? '#fff' : 'var(--text-main)',
                    fontSize: 10,
                    fontWeight: 800,
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  {l.flag} {l.label}
                </div>
              ))}
            </div>

            <div style={{ textAlign: 'center' }}>
              <div style={{ 
                width: 80, 
                height: 80, 
                borderRadius: '50%', 
                background: listening ? 'var(--primary-purple)' : 'var(--bg-light)', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                margin: '0 auto 20px',
                cursor: 'pointer',
                position: 'relative',
                boxShadow: listening ? '0 0 30px var(--primary-purple)' : 'none',
                transition: 'all 0.3s'
              }}
              onClick={toggleListening}
              >
                {listening ? (
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ repeat: Infinity, duration: 1 }}
                    style={{ fontSize: 32 }}
                  >🎤</motion.div>
                ) : (
                  <div style={{ fontSize: 32 }}>🎙️</div>
                )}
              </div>
              
              <div style={{ fontWeight: 900, color: 'var(--text-main)', marginBottom: 10, height: 20 }}>
                {listening ? 'LISTENING...' : result ? 'READY!' : 'TAP TO SPEAK'}
              </div>

              {/* Transcript */}
              <div style={{ 
                minHeight: 100, 
                background: 'var(--bg-light)', 
                borderRadius: 20, 
                padding: '20px', 
                fontSize: 14, 
                lineHeight: 1.6, 
                color: 'var(--text-main)',
                textAlign: 'left',
                border: '1px solid var(--border-color)',
                marginBottom: 20
              }}>
                {transcript || (listening ? <span style={{ opacity: 0.3 }}>Speak now...</span> : <span style={{ opacity: 0.3 }}>Your words will appear here...</span>)}
              </div>

              {/* AI Result */}
              <AnimatePresence>
                {(processing || result) && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{ 
                      background: 'var(--primary-purple)', 
                      borderRadius: 16, 
                      padding: '16px', 
                      color: '#fff',
                      textAlign: 'left',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12
                    }}
                  >
                    <div style={{ fontSize: 24 }}>🧞</div>
                    <div style={{ flex: 1 }}>
                       <div style={{ fontSize: 9, fontWeight: 800, opacity: 0.7 }}>GENIE UNDERSTOOD</div>
                       <div style={{ fontSize: 13, fontWeight: 700 }}>{processing ? 'Processing magical intent...' : result.feedback}</div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default GenieVoiceAssistant;
