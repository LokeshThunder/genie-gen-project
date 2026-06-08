import React, { useState, useEffect } from 'react';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import { motion, AnimatePresence } from 'framer-motion';
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

  // Restart listening if language changes while active
  useEffect(() => {
    if (listening) {
      SpeechRecognition.stopListening();
      setTimeout(() => {
        SpeechRecognition.startListening({ language: currentLang.code, continuous: true });
      }, 100);
    }
  }, [currentLang]);

  useEffect(() => {
    if (!isOpen) {
      resetTranscript();
      setResult(prev => prev === null ? prev : null);
      setProcessing(prev => prev === false ? prev : false);
    }
  }, [isOpen, resetTranscript]);

  const toggleListening = () => {
    if (listening) {
      SpeechRecognition.stopListening();
      if (transcript) handleProcess(transcript);
    } else {
      resetTranscript();
      setResult(null);
      SpeechRecognition.startListening({ language: currentLang.code, continuous: true });
    }
  };

  const speak = (text) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = currentLang.code;
    utterance.rate = 0.9;
    utterance.pitch = 1.1;
    window.speechSynthesis.speak(utterance);
  };

  const handleProcess = async (text) => {
    if (!text) return;
    setProcessing(true);
    const { aiService } = await import('../services/aiService');
    const intentData = await aiService.processVoiceCommand(text);
    const finalData = { ...intentData, transcript: text };
    setResult(finalData);
    setProcessing(false);
    
    // Speak feedback
    if (finalData.feedback) {
      speak(finalData.feedback);
    }

    // Auto-onAction after 2s if successful
    if (finalData.intent !== 'UNKNOWN') {
       setTimeout(() => {
         onAction(finalData);
         onClose();
       }, 2500);
    }
  };

  if (!browserSupportsSpeechRecognition) {
    return null;
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'var(--overlay)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            style={{ 
              background: 'var(--bg)', 
              borderRadius: 20, 
              width: '100%', 
              maxWidth: 400, 
              padding: '40px 24px',
              border: '4px solid var(--text-primary)',
              boxShadow: '16px 16px 0px var(--text-primary)',
              position: 'relative'
            }}
          >
            {/* Close */}
            <div onClick={onClose} style={{ position: 'absolute', top: 20, right: 20, fontSize: 20, color: 'var(--text-muted)', cursor: 'pointer' }}>✕</div>

            {/* Language Picker */}
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginBottom: 40 }}>
              {LANGUAGES.map(l => (
                <div 
                  key={l.code}
                  onClick={() => setCurrentLang(l)}
                  className="tap-effect"
                  style={{ 
                    padding: '12px 18px', 
                    borderRadius: 12, 
                    background: currentLang.code === l.code ? 'var(--text-primary)' : 'var(--bg)',
                    color: currentLang.code === l.code ? 'var(--bg)' : 'var(--text-primary)',
                    fontSize: 11,
                    fontWeight: 950,
                    cursor: 'pointer',
                    border: '2.5px solid var(--text-primary)',
                    boxShadow: currentLang.code === l.code ? '2px 2px 0px rgba(128,128,128,0.2)' : '4px 4px 0px var(--text-primary)',
                    letterSpacing: 1.5
                  }}
                >
                  {l.flag} {l.label.toUpperCase()}
                </div>
              ))}
            </div>

            <div style={{ textAlign: 'center' }}>
              <div style={{ 
                width: 100, 
                height: 100, 
                borderRadius: 24, 
                background: listening ? '#ef4444' : 'var(--bg)', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                margin: '0 auto 24px',
                cursor: 'pointer',
                position: 'relative',
                border: '3.5px solid var(--text-primary)',
                boxShadow: listening ? '4px 4px 0px var(--text-primary)' : '8px 8px 0px var(--text-primary)',
              }}
              onClick={toggleListening}
              >
                {listening ? (
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ repeat: Infinity, duration: 1 }}
                    style={{ fontSize: 44 }}
                  >🎤</motion.div>
                ) : (
                  <div style={{ fontSize: 44 }}>🎙️</div>
                )}
              </div>
              
               <div style={{ fontWeight: 950, color: 'var(--text-primary)', marginBottom: 16, height: 20, letterSpacing: 1.5, fontSize: 14 }}>
                {listening ? 'LISTENING...' : result ? 'READY!' : 'TAP TO SPEAK.'}
              </div>

               {/* Transcript */}
              <div style={{ 
                minHeight: 120, 
                background: 'var(--bg)', 
                borderRadius: 16, 
                padding: '24px', 
                fontSize: 16, 
                lineHeight: 1.5, 
                color: 'var(--text-primary)',
                textAlign: 'left',
                border: '3px solid var(--text-primary)',
                marginBottom: 24,
                fontWeight: 950,
                boxShadow: '6px 6px 0px var(--text-primary)'
              }}>
                {transcript || (listening ? <span style={{ opacity: 0.3 }}>SPEAK NOW...</span> : <span style={{ opacity: 0.3 }}>YOUR WORDS WILL APPEAR HERE...</span>)}
              </div>

               {/* AI Result */}
              <AnimatePresence>
                {(processing || result) && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{ 
                      background: 'var(--text-primary)', 
                      borderRadius: 16, 
                      padding: '20px', 
                      color: 'var(--bg)',
                      textAlign: 'left',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 16,
                      border: '3px solid var(--bg)',
                      boxShadow: '6px 6px 0px rgba(128,128,128,0.3)'
                    }}
                  >
                    <div style={{ fontSize: 32 }}>🧞</div>
                    <div style={{ flex: 1 }}>
                       <div style={{ fontSize: 10, fontWeight: 950, color: '#9396FF', letterSpacing: 1.5, marginBottom: 4 }}>GENIE UNDERSTOOD.</div>
                       <div style={{ fontSize: 14, fontWeight: 950 }}>{processing ? 'PROCESSING MAGICAL INTENT...' : result.feedback.toUpperCase()}</div>
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
