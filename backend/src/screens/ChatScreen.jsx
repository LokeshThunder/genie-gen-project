import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { aiService } from '../services/aiService.js';

const ChatScreen = ({ setActive, onNavigate, isAdmin = false, deepLinkJob = null, t = {}, currentLang }) => {
  const WORKER_CHIPS = [
    t.my_earnings_chip || 'My Earnings 💰', 
    t.check_in_help_chip || 'Check-in Help 📍', 
    t.find_gigs_chip || 'Find Gigs 🔍', 
    t.policies_chip || 'Policies 📜'
  ];
  
  const ADMIN_CHIPS = [
    t.predict_demand_chip || 'Predict Demand 📈', 
    t.hiring_health_chip || 'Hiring Health 🩺', 
    t.wage_opt_chip || 'Wage Optimization 💰', 
    t.worker_trends_chip || 'Worker Trends 📊'
  ];

  // Job-specific quick-chips when deep-linked from a job card
  const JOB_CHIPS = deepLinkJob ? [
    `Is "${deepLinkJob.title}" still available?`,
    'When does work start?',
    'What is the exact location?',
    'What should I bring/wear?',
    'Can I apply with a friend?',
  ] : null;

  const QUICK_CHIPS = JOB_CHIPS || (isAdmin ? ADMIN_CHIPS : WORKER_CHIPS);

  // Build conversation: if deep-linked, pre-populate worker intro + employer reply
  const buildInitialMessages = () => {
    if (deepLinkJob) {
      return [
        {
          id: 1,
          text: `Hi! I'm interested in the "${deepLinkJob.title}" position at ${deepLinkJob.company || deepLinkJob.companyName || 'your company'} (₹${deepLinkJob.wage}/day). Could you share more details?`,
          isBot: false,
          time: t.just_now || 'JUST NOW'
        },
        {
          id: 2,
          text: `Hello! Thanks for your interest in the ${deepLinkJob.title} role. The position is in ${deepLinkJob.locationName || 'your area'} paying ₹${deepLinkJob.wage}/day. Feel free to ask any questions! 😊`,
          isBot: true,
          time: t.just_now || 'JUST NOW'
        }
      ];
    }
    return [{
      id: 1,
      text: isAdmin
        ? (t.admin_bot_greeting || "Hello! I'm Genie Ops, your operations assistant. How can I help?")
        : (t.worker_bot_greeting || "Hi! I'm Genie, your personal job assistant. How can I help you today?"),
      isBot: true,
      time: t.just_now || 'JUST NOW'
    }];
  };

  const [messages, setMessages] = useState(buildInitialMessages);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showJobBanner, setShowJobBanner] = useState(!!deepLinkJob);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  useEffect(() => {
    // If the conversation only contains the initial greeting, re-localize it
    if (messages.length === 1 && messages[0].isBot && !deepLinkJob) {
      setMessages([{
        id: 1,
        text: isAdmin
          ? (t.admin_bot_greeting || "Hello! I'm Genie Ops, your operations assistant. How can I help?")
          : (t.worker_bot_greeting || "Hi! I'm Genie, your personal job assistant. How can I help you today?"),
        isBot: true,
        time: t.just_now || 'JUST NOW'
      }]);
    }
  }, [t, isAdmin]);

  const sendMessage = async (text) => {
    if (!text || !text.trim()) return;
    const userMsg = { id: Date.now(), text: text.trim(), isBot: false, time: t.just_now || 'JUST NOW' };
    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);
    try {
      const responseObj = await aiService.chat(text.trim(), messages, isAdmin, null, currentLang);
      let botText = t.done || "Done!";
      if (responseObj.type === 'navigation') {
        botText = responseObj.message || `Taking you to ${responseObj.screen}... 🚀`;
        setTimeout(() => {
          if (onNavigate) onNavigate(responseObj.screen, responseObj.params);
          else setActive(responseObj.screen);
        }, 1500);
      } else {
        botText = responseObj.content || responseObj.text || (t.processed_request || "I processed your request!");
      }
      setMessages(prev => [...prev, { id: Date.now() + 1, text: botText, isBot: true, time: t.just_now || 'JUST NOW' }]);
    } catch (error) {
      setMessages(prev => [...prev, { id: Date.now() + 1, text: t.brain_sync_error || "Brain sync error! 🧞", isBot: true, time: t.just_now || 'JUST NOW' }]);
    } finally {
      setIsTyping(false);
    }
  };

  const employerInitial = (deepLinkJob?.company || deepLinkJob?.companyName || 'E').charAt(0).toUpperCase();
  const isDeepLink = !!deepLinkJob;

  return (
    <div className="fade-in" style={{ height: '100%', background: 'var(--bg)', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>
      
      {/* Header */}
      <div style={{ padding: 'var(--header-pad) 16px 16px', borderBottom: '1px solid var(--cred-border)', zIndex: 10, background: 'var(--bg-card)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {/* Back arrow when launched from a job card */}
            {isDeepLink && (
              <div onClick={() => setActive('Find Job')} className="tap-effect" style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--bg-card)', border: '1px solid var(--cred-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 800, cursor: 'pointer' }}>←</div>
            )}
            <div style={{ width: 40, height: 40, borderRadius: 12, background: isDeepLink ? '#FAFAFA' : '#FFFFFF', border: '1px solid var(--cred-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: isDeepLink ? 18 : 22, fontWeight: 900, color: 'var(--text-primary)' }}>
              {isDeepLink ? employerInitial : isAdmin ? '🛰️' : '🧞'}
            </div>
            <div>
              <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                {isDeepLink ? (deepLinkJob.company || deepLinkJob.companyName || 'Employer') : isAdmin ? (t.genie_ops || 'Ops AI') : (t.genie_ai || 'Genie AI')}
              </div>
              <div style={{ color: 'var(--text-secondary)', fontSize: 10, fontWeight: 800 }}>
                {isDeepLink ? `${deepLinkJob.title} · ₹${deepLinkJob.wage}/day` : (t.ready_to_help || 'Ready to help')}
              </div>
            </div>
          </div>
          <div style={{ color: isDeepLink ? '#25D366' : '#0D0D0D', fontSize: 11, fontWeight: 800, background: isDeepLink ? 'rgba(37,211,102,0.1)' : '#F2F2F0', padding: '4px 10px', borderRadius: 10, border: isDeepLink ? '1px solid rgba(37,211,102,0.3)' : 'none' }}>
            {isDeepLink ? '💬 CHAT' : (t.online || 'ONLINE')}
          </div>
        </div>

        {/* Job context pill — dismissible */}
        {showJobBanner && isDeepLink && (
          <div className="fade-in" style={{ marginTop: 10, padding: '8px 12px', borderRadius: 12, background: deepLinkJob.urgent ? '#FEF2F2' : '#F7F7F5', border: `1px solid var(--cred-border)`, display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ fontSize: 14 }}>{deepLinkJob.urgent ? '🚨' : '📋'}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 11, fontWeight: 900, color: deepLinkJob.urgent ? '#E8302A' : 'var(--text-primary)' }}>{deepLinkJob.urgent ? 'URGENT GIG' : 'JOB ENQUIRY'} — {deepLinkJob.title}</div>
              <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)' }}>{deepLinkJob.locationName || 'Location TBD'} · ₹{deepLinkJob.wage}/day</div>
            </div>
            <div onClick={() => setShowJobBanner(false)} style={{ fontSize: 14, cursor: 'pointer', color: 'var(--text-muted)', fontWeight: 900 }}>✕</div>
          </div>
        )}
      </div>

      {/* Messages */}
      <div className="full-height-scroll" style={{ padding: '20px 16px 140px', flex: 1 }}>
        {messages.map((m) => (
          <div key={m.id} style={{ marginBottom: 12, display: 'flex', justifyContent: m.isBot ? 'flex-start' : 'flex-end', alignItems: 'flex-end', gap: 8 }}>
            {m.isBot && (
              <div style={{ width: 28, height: 28, borderRadius: 8, background: 'var(--bg-card)', border: '1px solid var(--cred-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: isDeepLink ? 13 : 16, fontWeight: 900, color: 'var(--text-primary)', flexShrink: 0 }}>
                {isDeepLink ? employerInitial : isAdmin ? '🛰️' : '🧞'}
              </div>
            )}
            <div className="cred-card" style={{ maxWidth: '78%', background: m.isBot ? '#FFFFFF' : '#F2F2F0', color: 'var(--text-primary)', padding: '12px 16px', borderRadius: m.isBot ? '4px 20px 20px 20px' : '20px 20px 4px 20px', border: '1px solid var(--cred-border)' }}>
              <div style={{ color: 'var(--text-primary)', lineHeight: 1.55, fontSize: 14, fontWeight: 600 }}><bdi>{m.text}</bdi></div>
              <div style={{ fontSize: 9, fontWeight: 700, marginTop: 4, color: 'var(--text-muted)', textTransform: 'uppercase' }}><bdi>{m.time}</bdi></div>
            </div>
          </div>
        ))}

        {isTyping && (
          <div style={{ marginBottom: 12, display: 'flex', alignItems: 'flex-end', gap: 8 }}>
            <div style={{ width: 28, height: 28, borderRadius: 8, background: 'var(--bg-card)', border: '1px solid var(--cred-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: isDeepLink ? 13 : 16, fontWeight: 900, color: 'var(--text-primary)' }}>
              {isDeepLink ? employerInitial : '🧞'}
            </div>
            <div className="cred-card" style={{ background: 'var(--bg-card)', padding: '10px 14px', borderRadius: '4px 16px 16px 16px', display: 'inline-flex', gap: 4 }}>
              <div className="pulse-active-green" style={{ width: 6, height: 6, background: 'var(--text-primary)', borderRadius: '50%' }} />
              <div className="pulse-active-green" style={{ width: 6, height: 6, background: 'var(--text-primary)', borderRadius: '50%' }} />
              <div className="pulse-active-green" style={{ width: 6, height: 6, background: 'var(--text-primary)', borderRadius: '50%' }} />
            </div>
          </div>
        )}
        <div ref={bottomRef} />

        {/* Quick Chips */}
        <div style={{ marginTop: 20 }}>
          <div style={{ color: 'var(--text-muted)', marginBottom: 8, fontSize: 10, fontWeight: 700, textTransform: 'uppercase', paddingLeft: 4 }}>
            {isDeepLink ? '💬 Quick Questions' : (t.suggestions || 'Suggestions')}
          </div>
          <div style={{ display: 'flex', gap: 8, overflowX: "auto", paddingBottom: 8 }} className="no-scrollbar">
            {QUICK_CHIPS.map(chip => (
              <div key={chip} onClick={() => sendMessage(chip)} className="tap-effect cred-card" style={{ flexShrink: 0, padding: '9px 14px', borderRadius: 16, fontSize: 12, fontWeight: 800, color: isDeepLink ? '#E06020' : 'var(--text-primary)', background: isDeepLink ? '#FFF8F0' : '#FFFFFF', border: '1px solid var(--cred-border)', whiteSpace: 'nowrap' }}><bdi>{chip}</bdi></div>
            ))}
          </div>
        </div>
      </div>

      {/* Input */}
      <div style={{ position: 'absolute', bottom: 84, left: 16, right: 16, zIndex: 60 }}>
        <div className="cred-card" style={{ borderRadius: 24, padding: '6px 6px 6px 20px', display: 'flex', alignItems: 'center', gap: 12, background: 'var(--bg-card)' }}>
          <input 
            type="text" 
            placeholder={isDeepLink ? `Ask about ${deepLinkJob.title}...` : isAdmin ? (t.ask_genie_ops || "Ask Genie Ops...") : (t.ask_me_anything || "Ask me anything...")}
            value={inputText} 
            onChange={e => setInputText(e.target.value)} 
            onKeyDown={e => e.key === 'Enter' && sendMessage(inputText)} 
            style={{ flex: 1, border: 'none', background: 'transparent', outline: 'none', color: 'var(--text-primary)', fontSize: 15, fontWeight: 600 }} 
          />
          <div onClick={() => sendMessage(inputText)} className="tap-effect" style={{ width: 44, height: 44, borderRadius: 16, background: isDeepLink ? '#25D366' : '#0D0D0D', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFF', fontSize: 18 }}>➔</div>
        </div>
      </div>

    </div>
  );
};

export default ChatScreen;
