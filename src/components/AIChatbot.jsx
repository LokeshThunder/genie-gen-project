import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { aiService } from '../services/aiService';

const AIChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'bot', text: 'Hello! I am your Jitro Assistant. How can I help you today? 🧞' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const [suggestions] = useState([
    "How do I get paid?", 
    "Safety tips for night shifts", 
    "Who worked on Feb 2nd 2026?", 
    "Tell me a joke ✨"
  ]);

  const handleSend = async (textInput = input) => {
    const trimmedInput = textInput.trim();
    if (!trimmedInput) return;
    
    const userMsg = { role: 'user', text: trimmedInput };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);
    
    try {
      const response = await aiService.chat(trimmedInput, messages);
      setMessages(prev => [...prev, { role: 'bot', text: response }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'bot', text: "Service temporarily unavailable. Jitro Engine is recalibrating. 🧞" }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <>
      {/* Minimalist Floating Action Button */}
      {!isOpen && (
        <motion.div 
          onClick={() => setIsOpen(true)}
          whileHover={{ scale: 1.05, translateY: -4 }}
          whileTap={{ scale: 0.95 }}
          style={{ 
            position: 'fixed', bottom: 100, right: 30, width: 64, height: 64, borderRadius: '50%', 
            background: 'var(--primary-purple)', color: '#fff', 
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, 
            zIndex: 10000, cursor: 'pointer',
            boxShadow: '0 10px 25px -5px rgba(99, 102, 241, 0.4), 0 8px 10px -6px rgba(99, 102, 241, 0.3)'
          }}
        >
          <span>🧞</span>
        </motion.div>
      )}

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.95 }}
            style={{ 
              position: 'fixed', bottom: 30, right: 20, left: 20, height: 580, 
              borderRadius: 24, zIndex: 10001, display: 'flex', flexDirection: 'column', overflow: 'hidden',
              maxWidth: 450, margin: '0 auto', background: '#fff',
              border: '1px solid var(--border-color)',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
            }}
          >
            {/* Minimalist Header */}
            <div style={{ padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', background: 'var(--bg-subtle)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(99, 102, 241, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>
                  🧞
                </div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: 17, color: 'var(--text-main)', letterSpacing: -0.5 }}>Jitro Assistant</div>
                  <div style={{ fontSize: 10, color: 'var(--primary-purple)', fontWeight: 700, letterSpacing: 1 }}>ONLINE • v2.5</div>
                </div>
              </div>
              <div 
                onClick={() => setIsOpen(false)}
                style={{ width: 32, height: 32, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, color: 'var(--text-muted)', cursor: 'pointer', background: '#fff', border: '1px solid var(--border-color)' }}
              >
                ✕
              </div>
            </div>

            {/* Chat Area */}
            <div className="no-scrollbar" style={{ flex: 1, padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 16 }}>
              {messages.map((m, i) => (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  key={i} 
                  style={{ 
                    alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
                    background: m.role === 'user' ? 'var(--primary-purple)' : 'var(--bg-subtle)',
                    color: m.role === 'user' ? '#fff' : 'var(--text-main)',
                    padding: '12px 18px', 
                    borderRadius: m.role === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px', 
                    fontSize: 14, maxWidth: '85%', lineHeight: 1.5,
                    fontWeight: 500,
                    border: m.role === 'bot' ? '1px solid var(--border-color)' : 'none',
                    boxShadow: m.role === 'bot' ? 'var(--shadow-sm)' : '0 4px 12px rgba(99, 102, 241, 0.2)'
                  }}>
                  {m.text}
                </motion.div>
              ))}
              {isTyping && (
                <div style={{ alignSelf: 'flex-start', padding: '12px 18px', borderRadius: 18, background: 'var(--bg-subtle)', border: '1px solid var(--border-color)', display: 'flex', gap: 6 }}>
                   {[1, 2, 3].map(i => (
                     <motion.div 
                       key={i}
                       animate={{ opacity: [0.3, 1, 0.3] }}
                       transition={{ repeat: Infinity, duration: 0.8, delay: i * 0.15 }}
                       style={{ width: 6, height: 6, background: 'var(--primary-purple)', borderRadius: '50%' }}
                     />
                   ))}
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Suggestions Bar */}
            <div style={{ display: 'flex', gap: 8, padding: '12px 20px', overflowX: 'auto', flexShrink: 0, borderTop: '1px solid var(--border-color)' }} className="no-scrollbar">
              {suggestions.map(s => (
                <div 
                  key={s} 
                  onClick={() => handleSend(s)}
                  className="tap-effect"
                  style={{ 
                    padding: '8px 16px', borderRadius: 12, 
                    fontSize: 11, fontWeight: 700, whiteSpace: 'nowrap', cursor: 'pointer',
                    color: 'var(--text-muted)', background: '#fff', border: '1px solid var(--border-color)'
                  }}
                >
                  {s}
                </div>
              ))}
            </div>

            {/* Input Console */}
            <div style={{ padding: '16px 20px 24px', display: 'flex', gap: 12, alignItems: 'center' }}>
              <div style={{ flex: 1, borderRadius: 16, padding: '0 16px', display: 'flex', alignItems: 'center', background: 'var(--bg-subtle)', border: '1px solid var(--border-color)' }}>
                <input 
                  type="text" 
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Ask Jitro anything..."
                  style={{ flex: 1, border: 'none', background: 'transparent', padding: '14px 0', fontSize: 14, outline: 'none', color: 'var(--text-main)', fontWeight: 500 }}
                />
              </div>
              <motion.div 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleSend()}
                style={{ 
                  width: 48, height: 48, borderRadius: 14, background: 'var(--primary-purple)', color: '#fff', 
                  display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                  boxShadow: '0 8px 16px rgba(99, 102, 241, 0.3)'
                }}
              >
                <div style={{ transform: 'rotate(-45deg)', fontSize: 18, marginLeft: 2 }}>✈</div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AIChatbot;
