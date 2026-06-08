import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { aiService } from '../services/aiService.js';
import { TRANSLATIONS } from '../constants/translations.js';

const AIChatbot = ({ onNavigate, isAdmin = false, userContext = null, currentLang }) => {
  const [isOpen, setIsOpen] = useState(false);
  const activeLang = currentLang || localStorage.getItem('genie_language') || 'English';

  const getGreetingText = (lang) => {
    const dict = TRANSLATIONS[lang] || TRANSLATIONS['English'];
    if (isAdmin) {
      return dict.admin_bot_greeting || "GENIE_CORE ONLINE. STANDING BY FOR OPERATIONAL QUERIES. 🧞";
    } else {
      return dict.worker_bot_greeting || "GENIE_CORE ONLINE. STANDING BY FOR OPERATIONAL QUERIES. 🧞";
    }
  };

  const [messages, setMessages] = useState(() => {
    const greeting = getGreetingText(activeLang);
    return [{ isBot: true, text: greeting.toUpperCase(), rawText: greeting }];
  });
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  useEffect(() => {
    const greeting = getGreetingText(activeLang);
    setMessages([
      { isBot: true, text: greeting.toUpperCase(), rawText: greeting }
    ]);
  }, [currentLang, isAdmin]);

  const dict = TRANSLATIONS[activeLang] || TRANSLATIONS['English'];
  const suggestions = isAdmin ? [
    dict.predict_demand_chip || "PREDICT DEMAND 📈",
    dict.hiring_health_chip || "HIRING HEALTH 🩺",
    dict.wage_opt_chip || "WAGE OPTIMIZATION 💰",
    dict.worker_trends_chip || "WORKER TRENDS 📊"
  ] : [
    dict.my_earnings_chip || "MY EARNINGS 💰",
    dict.check_in_help_chip || "CHECK-IN HELP 📍",
    dict.find_gigs_chip || "FIND GIGS 🔍",
    dict.policies_chip || "POLICIES 📜"
  ];

  const handleSend = async (textInput = input) => {
    const trimmedInput = textInput.trim();
    if (!trimmedInput) return;
    
    const userMsg = { isBot: false, text: trimmedInput, rawText: trimmedInput };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);
    
    try {
      const response = await aiService.chat(trimmedInput, messages, isAdmin, userContext, activeLang);
      let displayText;
      if (typeof response === 'string') {
        displayText = response;
      } else if (response.type === 'navigation') {
        displayText = response.message || `REROUTING TO ${response.screen.toUpperCase()}...`;
        if (onNavigate) {
          setTimeout(() => {
            onNavigate(response.screen, response.params || {});
            setIsOpen(false);
          }, 1000);
        }
      } else if (response.type === 'file') {
        displayText = response.message || 'DATA_NODE_GENERATED.';
      } else {
        displayText = response.content || JSON.stringify(response);
      }
      setMessages(prev => [...prev, { isBot: true, text: displayText.toUpperCase(), rawText: displayText }]);
    } catch (error) {
      setMessages(prev => [...prev, { isBot: true, text: "GENIE_CORE_FAULT: RECALIBRATING_NEURAL_LINK. 🧞", rawText: '' }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <>
      <div 
        onClick={() => setIsOpen(true)}
        className="tap-effect pulse-glow"
        style={{ 
          position: 'fixed', bottom: 100, right: 24, width: 64, height: 64, 
          borderRadius: 20, background: 'var(--primary-cyan)', color: 'var(--bg-cyber)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32,
          cursor: 'pointer', zIndex: 10000, boxShadow: '0 0 20px rgba(0, 240, 255, 0.4)'
        }}>
        🧞
      </div>

      <AnimatePresence>
        {isOpen && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 10001, pointerEvents: 'none' }}>
             <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              style={{ position: 'absolute', inset: 0, background: 'rgba(15, 23, 42, 0.8)', backdropFilter: 'blur(10px)', pointerEvents: 'auto' }}
            />
            <motion.div 
              initial={{ opacity: 0, y: 40, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 40, scale: 0.95 }}
              style={{ 
                position: 'absolute', bottom: 32, right: 24, left: 24, height: 600, 
                borderRadius: 24, display: 'flex', flexDirection: 'column', overflow: 'hidden',
                maxWidth: 450, margin: '0 auto', background: 'var(--bg-cyber)',
                border: '1px solid var(--border-steel)',
                boxShadow: 'var(--cyber-shadow)',
                pointerEvents: 'auto'
              }}
            >
              {/* Header */}
              <div style={{ padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-steel)', background: 'rgba(255,255,255,0.02)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(0, 240, 255, 0.1)', border: '1px solid var(--primary-cyan)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>
                    🧞
                  </div>
                  <div>
                    <div className="tech-header" style={{ fontSize: 18 }}>GENIE_ASSISTANT.</div>
                    <div style={{ fontSize: 9, color: 'var(--primary-cyan)', fontWeight: 800, letterSpacing: 1.5 }}>CORE_ACTIVE • v2.5</div>
                  </div>
                </div>
                <div 
                  onClick={() => setIsOpen(false)}
                  className="tap-effect"
                  style={{ width: 40, height: 40, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, color: 'var(--text-muted)', cursor: 'pointer', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-steel)', fontWeight: 800 }}
                >
                  ✕
                </div>
              </div>

              {/* Chat Area */}
              <div className="no-scrollbar" style={{ flex: 1, padding: '24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 20 }}>
                {messages.map((m, i) => (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    key={i} 
                    style={{ 
                      alignSelf: !m.isBot ? 'flex-end' : 'flex-start',
                      background: !m.isBot ? 'var(--primary-cyan)' : 'rgba(255,255,255,0.03)',
                      color: !m.isBot ? 'var(--bg-cyber)' : 'var(--text-primary)',
                      padding: '16px 20px', 
                      borderRadius: m.isBot ? '4px 16px 16px 16px' : '16px 16px 4px 16px', 
                      fontSize: 13, maxWidth: '85%', lineHeight: 1.5,
                      fontWeight: 700,
                      border: `1px solid ${!m.isBot ? 'var(--primary-cyan)' : 'var(--border-steel)'}`,
                      letterSpacing: 0.5
                    }}>
                    {typeof m.text === 'string' ? m.text : JSON.stringify(m.text)}
                  </motion.div>
                ))}
                {isTyping && (
                  <div style={{ alignSelf: 'flex-start', padding: '12px 18px', borderRadius: 8, background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-steel)', display: 'flex', gap: 6 }}>
                     {[1, 2, 3].map(i => (
                       <motion.div 
                         key={i}
                         animate={{ opacity: [0.3, 1, 0.3] }}
                         transition={{ repeat: Infinity, duration: 0.8, delay: i * 0.15 }}
                         style={{ width: 4, height: 4, background: 'var(--primary-cyan)', borderRadius: '50%' }}
                       />
                     ))}
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Suggestions */}
              <div style={{ display: 'flex', gap: 10, padding: '16px 24px', overflowX: 'auto', flexShrink: 0, borderTop: '1px solid var(--border-steel)', background: 'rgba(0,0,0,0.2)' }} className="no-scrollbar">
                {suggestions.map(s => (
                  <div 
                    key={s} 
                    onClick={() => handleSend(s)}
                    className="tap-effect"
                    style={{ 
                      padding: '10px 16px', borderRadius: 6, 
                      fontSize: 9, fontWeight: 800, whiteSpace: 'nowrap', cursor: 'pointer',
                      color: 'var(--text-primary)', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-steel)',
                      letterSpacing: 1
                    }}
                  >
                    {s.toUpperCase()}
                  </div>
                ))}
              </div>

              {/* Input */}
              <div style={{ padding: '24px', display: 'flex', gap: 12, alignItems: 'center', borderTop: '1px solid var(--border-steel)', background: 'rgba(255,255,255,0.02)' }}>
                <div style={{ flex: 1, borderRadius: 12, padding: '0 20px', display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-steel)' }}>
                  <input 
                    type="text" 
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                    placeholder={(isAdmin ? (dict.ask_genie_ops || "ASK GENIE OPS...") : (dict.ask_me_anything || "ASK ME ANYTHING...")).toUpperCase()}
                    style={{ flex: 1, border: 'none', background: 'transparent', padding: '16px 0', fontSize: 13, outline: 'none', color: 'var(--text-primary)', fontWeight: 700, letterSpacing: 1 }}
                  />
                </div>
                <motion.div 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleSend()}
                  className="tap-effect"
                  style={{ 
                    width: 52, height: 52, borderRadius: 12, background: 'var(--primary-cyan)', color: 'var(--bg-cyber)', 
                    display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                    boxShadow: '0 0 15px rgba(0, 240, 255, 0.3)'
                  }}
                >
                  <div style={{ fontSize: 20 }}>➔</div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AIChatbot;
