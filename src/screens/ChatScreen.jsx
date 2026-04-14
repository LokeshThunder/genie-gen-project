import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { aiService } from '../services/aiService';
import NavBar from '../components/NavBar';

const WORKER_CHIPS = ['My Earnings 💰', 'Check-in Help 📍', 'Find Gigs 🔍', 'Policies 📜'];
const ADMIN_CHIPS = ['Predict Demand 📈', 'Hiring Health 🩺', 'Wage Optimization 💰', 'Worker Trends 📊'];

const ChatScreen = ({ setActive, onNavigate, isAdmin = false }) => {
  const QUICK_CHIPS = isAdmin ? ADMIN_CHIPS : WORKER_CHIPS;
  
  const theme = isAdmin ? {
    primary: '#10B981',
    accent: '#059669',
    bg: '#F9FAFB',
    text: '#064E3B',
    card: '#ffffff',
    icon: '🛰️'
  } : {
    primary: 'var(--primary-purple)',
    accent: '#5B3FC8',
    bg: 'var(--bg-light)',
    text: 'var(--primary-purple)',
    card: 'var(--card-bg)',
    icon: '🧞'
  };

  const [messages, setMessages] = useState([
    { 
      id: 1, 
      text: isAdmin 
        ? "Systems Online. I'm Genie Ops, your Lead Operations Strategist. How shall we optimize the workforce today?" 
        : "Hello! I'm Genie, your operations assistant. How can I help you today?", 
      isBot: true, 
      time: 'JUST NOW' 
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const sendMessage = async (text) => {
    if (!text || !text.trim()) return;
    
    const userMsg = { id: Date.now(), text: text.trim(), rawText: text.trim(), isBot: false, time: 'JUST NOW' };
    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);

    try {
      const responseObj = await aiService.chat(text.trim(), messages, isAdmin);
      
      let botText = "Done!";
      
      if (responseObj.type === 'file') {
        botText = responseObj.message || "File generated successfully! Downloading now... 📥";
        
        const blob = new Blob([responseObj.content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = responseObj.filename || 'genie_export.txt';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } else if (responseObj.type === 'navigation') {
        botText = responseObj.message || `Taking you to ${responseObj.screen}... 🚀`;
        setTimeout(() => {
          if (onNavigate) onNavigate(responseObj.screen, responseObj.params);
          else setActive(responseObj.screen);
        }, 1500);
      } else {
        botText = responseObj.content || responseObj.text || "I processed your request!";
      }

      // Final UI Sanitization: If botText somehow contains raw JSON, try to clean it
      if (typeof botText === 'string' && botText.includes('{"') && botText.includes('"}')) {
         try {
            const nested = JSON.parse(botText.substring(botText.indexOf('{'), botText.lastIndexOf('}') + 1));
            botText = nested.content || nested.message || botText;
         } catch(e) {}
      }

      const botMsg = { id: Date.now() + 1, text: botText, rawText: botText, isBot: true, time: 'JUST NOW' };
      setMessages(prev => [...prev, botMsg]);
    } catch (error) {
      console.error("Chat Error:", error);
      const errorMsg = { id: Date.now() + 1, text: "I'm having trouble connecting to my brain! 🧞", rawText: "I'm having trouble connecting to my brain! 🧞", isBot: true, time: 'JUST NOW' };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="fade-in" style={{ height: '100%', background: theme.bg, display: 'flex', flexDirection: 'column' }}>
      
      {/* Header */}
      <div style={{ padding: '24px 20px', background: theme.card, borderBottom: `1px solid ${isAdmin ? '#E5E7EB' : 'var(--border-color)'}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 44, height: 44, borderRadius: '50%', background: theme.primary, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, border: '2px solid #fff', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}>{theme.icon}</div>
          <div>
            <div style={{ fontWeight: 900, fontSize: 16, color: theme.text }}>{isAdmin ? 'Genie Ops' : 'Genie AI'}</div>
            <div style={{ fontSize: 10, fontWeight: 800, color: 'var(--text-muted)' }}>{isAdmin ? 'PRECISION LOGISTICS BRAIN' : 'OPERATIONS AGENTIC AI'}</div>
          </div>
        </div>
        {isAdmin && (
           <div style={{ display: 'flex', gap: 15 }}>
              <div style={{ textAlign: 'right' }}>
                 <div style={{ fontSize: 9, fontWeight: 900, color: '#10B981' }}>SYSTEM HEALTH</div>
                 <div style={{ fontSize: 12, fontWeight: 800, color: '#111' }}>98.4%</div>
              </div>
           </div>
        )}
      </div>

      {isAdmin && (
        <div style={{ background: '#111827', padding: '8px 20px', display: 'flex', gap: 20, overflowX: 'auto' }} className="no-scrollbar">
           <div style={{ whiteSpace: 'nowrap', fontSize: 10, fontWeight: 700, color: '#9CA3AF' }}>⚡ <span style={{ color: '#fff' }}>FULFILLMENT:</span> 92%</div>
           <div style={{ whiteSpace: 'nowrap', fontSize: 10, fontWeight: 700, color: '#9CA3AF' }}>👥 <span style={{ color: '#fff' }}>RETENTION:</span> 88%</div>
           <div style={{ whiteSpace: 'nowrap', fontSize: 10, fontWeight: 700, color: '#9CA3AF' }}>🏗️ <span style={{ color: '#fff' }}>DEMAND:</span> PEAK</div>
        </div>
      )}

      <div className="full-height-scroll" style={{ padding: '20px 20px 100px' }}>
        {messages.map((m) => (
          <div key={m.id} style={{ marginBottom: 24, display: 'flex', justifyContent: m.isBot ? 'flex-start' : 'flex-end' }}>
            <div style={{ 
              maxWidth: '85%', 
              background: m.isBot ? theme.card : theme.primary, 
              color: m.isBot ? 'var(--text-main)' : '#fff',
              padding: '16px 20px', 
              borderRadius: m.isBot ? '20px 20px 20px 4px' : '20px 20px 4px 20px',
              border: m.isBot ? `1px solid ${isAdmin ? '#E5E7EB' : 'var(--border-color)'}` : 'none',
              boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
            }}>
              <div style={{ fontSize: 14, lineHeight: 1.5, fontWeight: 500 }}>{m.text}</div>
              <div style={{ fontSize: 8, fontWeight: 800, marginTop: 6, opacity: 0.5 }}>{m.time}</div>
            </div>
          </div>
        ))}
        {isTyping && (
           <div style={{ marginBottom: 24 }}>
              <div style={{ background: theme.card, padding: '12px 18px', borderRadius: 20, display: 'inline-flex', gap: 4, border: `1px solid ${isAdmin ? '#E5E7EB' : 'var(--border-color)'}` }}>
                 <div className="loading-dot" style={{ width: 6, height: 6, background: theme.primary, borderRadius: '50%' }} />
                 <div className="loading-dot" style={{ width: 6, height: 6, background: theme.primary, borderRadius: '50%', animationDelay: '0.2s' }} />
                 <div className="loading-dot" style={{ width: 6, height: 6, background: theme.primary, borderRadius: '50%', animationDelay: '0.4s' }} />
              </div>
           </div>
        )}
        <div ref={bottomRef} />

        {/* Suggestions */}
        <div style={{ marginTop: 20 }}>
          <div style={{ fontSize: 10, fontWeight: 900, color: 'var(--text-muted)', marginBottom: 12 }}>{isAdmin ? 'OPERATIONAL COMMANDS' : 'SUGGESTIONS'}</div>
          <div style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 10 }} className="no-scrollbar">
            {QUICK_CHIPS.map(chip => (
              <div 
                key={chip} 
                onClick={() => sendMessage(chip)}
                className="tap-effect"
                style={{ flexShrink: 0, background: theme.card, padding: '10px 16px', borderRadius: 12, border: `1px solid ${isAdmin ? '#E5E7EB' : 'var(--border-color)'}`, fontSize: 12, fontWeight: 700, cursor: 'pointer', color: isAdmin ? theme.text : 'inherit' }}>
                {chip}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Input */}
      <div style={{ position: 'fixed', bottom: 100, left: 20, right: 20, zIndex: 60 }}>
        <div style={{ background: theme.card, borderRadius: 40, padding: '8px 8px 8px 20px', boxShadow: '0 10px 30px rgba(0,0,0,0.1)', border: `1px solid ${isAdmin ? '#E5E7EB' : 'var(--border-color)'}`, display: 'flex', alignItems: 'center', gap: 12 }}>
          <input 
            type="text" 
            placeholder={isAdmin ? "Issue command..." : "Ask anything..."}
            value={inputText}
            onChange={e => setInputText(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && sendMessage(inputText)}
            style={{ flex: 1, border: 'none', background: 'transparent', outline: 'none', fontSize: 15, fontWeight: 600, color: 'var(--text-main)' }} 
          />
          <div 
            onClick={() => sendMessage(inputText)}
            className="tap-effect"
            style={{ width: 44, height: 44, borderRadius: '50%', background: theme.primary, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', cursor: 'pointer' }}>
            {isAdmin ? '⚡' : '🚀'}
          </div>
        </div>
      </div>

      <NavBar active={isAdmin ? "Genie Ops" : "Genie AI"} setActive={setActive} isAdmin={isAdmin} />
    </div>
  );
};

export default ChatScreen;
