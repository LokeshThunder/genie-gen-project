import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { aiService } from '../services/aiService';

const TypingDots = () => (
  <div style={{ display: 'flex', gap: 6, alignItems: 'center', padding: '8px 0' }}>
    {[0, 1, 2].map(i => (
      <motion.div
        key={i}
        animate={{ y: [0, -6, 0] }}
        transition={{ repeat: Infinity, duration: 0.8, delay: i * 0.15 }}
        style={{ width: 6, height: 6, borderRadius: '50%', background: '#9B9B9B' }}
      />
    ))}
  </div>
);

const Bubble = ({ msg, t }) => {
  const isBot = msg.isBot;
  return (
    <motion.div
      initial={{ opacity: 0, x: isBot ? -20 : 20, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      style={{
        display: 'flex',
        flexDirection: isBot ? 'row' : 'row-reverse',
        alignItems: 'flex-end',
        gap: 12,
        marginBottom: 16,
      }}
    >
      {isBot && (
        <div style={{
          width: 32, height: 32, borderRadius: '50%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 14, flexShrink: 0,
          background: 'var(--bg-subtle)',
          border: '1.5px solid var(--border)'
        }}>✨</div>
      )}

      <div className="cred-card" style={{
        maxWidth: '80%',
        padding: '12px 18px',
        borderRadius: isBot ? '16px 16px 16px 4px' : '16px 16px 4px 16px',
        background: isBot ? '#FFFFFF' : '#0D0D0D',
        color: isBot ? '#0D0D0D' : '#FFFFFF',
        fontSize: 14,
        fontWeight: 500,
        lineHeight: 1.5,
        border: isBot ? '1px solid var(--border)' : 'none',
        boxShadow: 'none',
      }}>
        {msg.text}
        {msg.action && (
          <button
            onClick={msg.action.fn}
            className="cred-btn-black"
            style={{ 
              marginTop: 10, 
              padding: '8px 14px', 
              fontSize: 12, 
              borderRadius: 8,
              width: '100%'
            }}>
            {msg.action.label} ➔
          </button>
        )}
      </div>
    </motion.div>
  );
};

const WorkerAIScreen = ({ setActive, onNavigate, applications = [], userXP, userProfile, t = {}, currentLang }) => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      isBot: true,
      text: t.assistant_greeting || "Hello. How may I assist you with your career plans today? ✨",
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  const QUICK_CHIPS = [
    { icon: '💰', label: t.my_earnings || 'Earnings', prompt: t.prompt_earnings || 'Show me my earnings summary.' },
    { icon: '📍', label: t.check_in_help || 'Work Site', prompt: t.prompt_checkin || 'How do I check in for my shift?' },
    { icon: '🔍', label: t.find_jobs || 'Gigs', prompt: t.prompt_find_jobs || 'Best gigs near me right now?' },
    { icon: '🛡️', label: t.safety_guide || 'Safety', prompt: t.prompt_safety || 'What are the safety rules?' },
  ];

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  useEffect(() => {
    if (messages.length === 1 && messages[0].isBot) {
      setMessages([{
        id: 1,
        isBot: true,
        text: t.assistant_greeting || "Hello. How may I assist you with your career plans today? ✨",
      }]);
    }
  }, [t]);

  const send = async (text) => {
    const trimmed = (text || input).trim();
    if (!trimmed) return;
    setInput('');

    const userMsg = { id: Date.now(), isBot: false, text: trimmed };
    setMessages(prev => [...prev, userMsg]);
    setIsTyping(true);

    try {
      const userContext = {
        role: userProfile?.role || 'worker',
        xp: userXP,
        availableJobs: [],
        name: userProfile?.name
      };
      const res = await aiService.chat(trimmed, messages, false, userContext, currentLang);
      let botText = '';
      let action = null;

      if (res.type === 'navigation') {
        botText = res.message || `Sure, navigating you to ${res.screen}...`;
        action = { label: `${t.go_to || 'Go to'} ${res.screen}`, fn: () => { if (onNavigate) onNavigate(res.screen, res.params); else setActive(res.screen); } };
      } else {
        botText = res.content || res.text || (t.bot_default || "I'm here to assist.");
      }

      setMessages(prev => [...prev, { id: Date.now() + 1, isBot: true, text: botText, action }]);
    } catch (err) {
      setMessages(prev => [...prev, {
        id: Date.now() + 1, isBot: true,
        text: t.trouble_connecting || "Failed to connect. Please retry.",
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
  };

  const activeJobs = (applications || []).filter(a => ['Approved','Active'].includes(a.status)).length;

  return (
    <div className="fade-in" style={{ height: '100%', background: 'var(--bg)', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{
        padding: 'var(--header-pad) 20px 16px',
        flexShrink: 0,
        zIndex: 10,
        background: 'var(--bg-card)',
        borderBottom: '1px solid var(--border-light)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div
            onClick={() => setActive('Home')}
            className="tap-effect"
            style={{ width: 40, height: 40, borderRadius: '50%', border: '1.5px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, color: 'var(--text-primary)', fontWeight: 700, background: 'var(--bg-subtle)' }}>
            ←
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1 }}>
            <div style={{
              width: 40, height: 40, borderRadius: '50%',
              background: 'var(--bg-subtle)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20,
              border: '1.5px solid var(--border)'
            }}>✨</div>
            <div>
              <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>{t.genie_assistant || 'Genie AI'}</div>
              <div style={{ color: '#16A34A', display: 'flex', alignItems: 'center', gap: 4, marginTop: 2, fontSize: 11, fontWeight: 600 }}>
                <span className="pulse-active-green" style={{ width: 6, height: 6 }} />
                {t.online_ready || 'online'}
              </div>
            </div>
          </div>
          <div className="cred-badge cred-badge-gray" style={{ padding: '6px 12px', border: '1px solid var(--border)' }}>
            <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{activeJobs}</span>
            <span style={{ color: 'var(--text-muted)', fontSize: 10, fontWeight: 600, marginLeft: 4, textTransform: 'uppercase' }}>{t.active_label || 'Gigs'}</span>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="full-height-scroll" style={{ padding: '20px 16px', flex: 1 }}>
        {messages.map(msg => <Bubble key={msg.id} msg={msg} t={t} />)}

        <AnimatePresence>
          {isTyping && (
            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} style={{ display: 'flex', alignItems: 'flex-end', gap: 12, marginBottom: 16 }}>
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--bg-subtle)', border: '1.5px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>✨</div>
              <div className="cred-card" style={{ padding: '8px 16px', background: 'var(--bg-card)' }}>
                <TypingDots />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div ref={bottomRef} style={{ height: 20 }} />
      </div>

      {/* Input Bar */}
      <div className="screen-bottom-pad" style={{
        padding: '16px 20px 20px',
        zIndex: 20,
        background: 'var(--bg-card)',
        borderTop: '1px solid var(--border-light)'
      }}>
        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', marginBottom: 16, paddingBottom: 2 }} className="no-scrollbar">
          {QUICK_CHIPS.map(chip => (
            <div key={chip.label} onClick={() => send(chip.prompt)} className="cred-pill-action" style={{ flexShrink: 0, padding: '8px 14px' }}>
              <span className="cred-pill-action-icon">{chip.icon}</span> 
              <span className="cred-pill-action-label" style={{ fontSize: 12 }}>{chip.label}</span>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end' }}>
          <div style={{ flex: 1, background: 'var(--bg-subtle)', borderRadius: 20, padding: '10px 14px', display: 'flex', alignItems: 'flex-end', border: '1px solid var(--border)' }}>
            <textarea
              ref={inputRef}
              value={input}
              onChange={e => { setInput(e.target.value); e.target.style.height = 'auto'; e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px'; }}
              onKeyDown={handleKeyDown}
              placeholder={t.ask_me_anything || "Ask me anything..."}
              rows={1}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              style={{
                flex: 1, background: 'transparent', border: 'none', outline: 'none',
                color: 'var(--text-primary)', fontSize: 14, fontWeight: 500, resize: 'none',
                lineHeight: 1.4, maxHeight: 120, overflowY: 'auto', padding: 0,
                fontFamily: 'inherit'
              }}
            />
          </div>

          <button
            onClick={() => send()}
            className="tap-effect"
            style={{
              width: 44, height: 44, borderRadius: '50%', flexShrink: 0,
              background: input.trim() ? '#0D0D0D' : '#F2F2F0',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20,
              color: input.trim() ? '#FFFFFF' : '#9B9B9B',
              border: 'none',
              cursor: 'pointer'
            }}>
            {isTyping ? '⏳' : '↑'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default WorkerAIScreen;
