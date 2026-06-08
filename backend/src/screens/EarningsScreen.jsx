import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { JobService } from '../services/jobService';
import { auth } from '../services/firebaseConfig';

const WEEKLY_DATA = [
  { day: 'Mon', amount: 0 },
  { day: 'Tue', amount: 0 },
  { day: 'Wed', amount: 0 },
  { day: 'Thu', amount: 0 },
  { day: 'Fri', amount: 0 },
  { day: 'Sat', amount: 0 },
  { day: 'Sun', amount: 0 },
];

const Icon = ({ name, size = 20, color = 'currentColor' }) => {
  const common = {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: color,
    strokeWidth: 2,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    'aria-hidden': true,
  };

  const paths = {
    arrowLeft: <><path d="M19 12H5" /><path d="m12 19-7-7 7-7" /></>,
    trend: <><path d="m3 17 6-6 4 4 8-8" /><path d="M14 7h7v7" /></>,
    wallet: <><path d="M3 7a3 3 0 0 1 3-3h13v16H6a3 3 0 0 1-3-3Z" /><path d="M16 12h3" /></>,
    export: <><path d="M12 3v12" /><path d="m7 8 5-5 5 5" /><path d="M5 21h14" /></>,
    calendar: <><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M16 3v4" /><path d="M8 3v4" /><path d="M3 11h18" /></>,
    clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
    chart: <><path d="M4 19V5" /><path d="M4 19h16" /><path d="M8 16v-4" /><path d="M12 16V8" /><path d="M16 16v-6" /></>,
    target: <><circle cx="12" cy="12" r="8" /><circle cx="12" cy="12" r="4" /><circle cx="12" cy="12" r="1" /></>,
    briefcase: <><rect x="3" y="7" width="18" height="13" rx="2" /><path d="M8 7V5.5A2.5 2.5 0 0 1 10.5 3h3A2.5 2.5 0 0 1 16 5.5V7" /><path d="M3 12h18" /></>,
    truck: <><path d="M3 6h11v10H3z" /><path d="M14 10h4l3 3v3h-7z" /><circle cx="7" cy="18" r="2" /><circle cx="17" cy="18" r="2" /></>,
    shield: <><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" /></>,
  };

  return <svg {...common}>{paths[name]}</svg>;
};

const BarChart = ({ data }) => {
  const max = Math.max(...data.map(d => d.amount), 1);
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 9, height: 112, padding: '4px 2px 0' }}>
      {data.map((d) => {
        const isEmpty = d.amount === 0;
        return (
          <div key={d.day} style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
            <div style={{
              width: '100%',
              height: 84,
              display: 'flex',
              alignItems: 'flex-end',
              borderRadius: 999,
              background: 'var(--bg-surface)',
              overflow: 'hidden',
            }}>
              <div style={{
                width: '100%',
                height: `${Math.max((d.amount / max) * 100, isEmpty ? 5 : 14)}%`,
                background: isEmpty ? 'var(--border)' : 'linear-gradient(180deg, #2A2A2A 0%, #0D0D0D 100%)',
                borderRadius: 999,
                boxShadow: isEmpty ? 'none' : 'inset 0 1px 0 rgba(255,255,255,0.18)',
                transition: 'height 0.6s cubic-bezier(0.2, 0.8, 0.2, 1)',
              }} />
            </div>
            <div style={{ fontSize: 10, color: '#7A7A7A', fontWeight: 700 }}>{d.day}</div>
          </div>
        );
      })}
    </div>
  );
};

const formatDate = (value) => {
  if (!value) return 'Recent';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Recent';
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
};

const EarningsScreen = ({ setActive, t = {} }) => {
  const [earningsData, setEarningsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('week');
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);

  useEffect(() => {
    const loadEarnings = async () => {
      setLoading(true);
      const userId = auth.currentUser?.uid;
      const data = await JobService.getEarnings(userId);
      setEarningsData(data);
      setLoading(false);
    };
    loadEarnings();
  }, []);

  const weeklyTotal = WEEKLY_DATA.reduce((sum, d) => sum + d.amount, 0);
  const daysWorked = WEEKLY_DATA.filter(d => d.amount > 0).length;
  const avgPerDay = daysWorked > 0 ? Math.round(weeklyTotal / daysWorked) : 0;
  const displayTotal = earningsData?.total || weeklyTotal;
  const payouts = earningsData?.breakdown || [];

  const exportReport = () => {
    const data = { total: weeklyTotal, days: daysWorked, avg: avgPerDay, breakdown: WEEKLY_DATA };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'earnings_report.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fade-in" style={{ height: '100%', background: 'var(--bg)', display: 'flex', flexDirection: 'column' }}>
      <div style={{
        padding: 'var(--header-pad) 20px 18px',
        background: 'var(--overlay)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--border-light)',
        flexShrink: 0,
        zIndex: 10,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
          <button
            type="button"
            onClick={() => setActive('Home')}
            className="tap-effect"
            aria-label="Back to home"
            style={{ width: 36, height: 36, borderRadius: 18, border: '1px solid var(--border)', background: 'var(--bg-card)', display: 'grid', placeItems: 'center', color: 'var(--text-primary)' }}
          >
            <Icon name="arrowLeft" size={18} />
          </button>
          <div>
            <div style={{ fontSize: 21, fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.1 }}>{t.my_earnings || 'My Earnings'}</div>
            <div style={{ color: '#7A7A7A', fontSize: 12, fontWeight: 500, marginTop: 4 }}>{t.track_income || 'Track your income and payouts'}</div>
          </div>
        </div>

        <div style={{
          borderRadius: 22,
          padding: '18px',
          background: 'var(--text-primary)',
          color: '#FFFFFF',
          boxShadow: '0 14px 34px rgba(0,0,0,0.18)',
          position: 'relative',
          overflow: 'hidden',
        }}>
          <div style={{ position: 'absolute', right: -34, top: -44, width: 132, height: 132, borderRadius: '50%', background: 'rgba(244,196,48,0.14)' }} />
          <div style={{ fontSize: 11, fontWeight: 800, color: 'rgba(255,255,255,0.58)', textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 8 }}>Total earned</div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 5 }}>
            <span style={{ color: 'rgba(255,255,255,0.62)', fontSize: 22, fontWeight: 700 }}>&#8377;</span>
            <span style={{ fontSize: 40, lineHeight: 1, fontWeight: 900, letterSpacing: -0.5 }}>
              <bdi>{loading ? '---' : displayTotal.toLocaleString()}</bdi>
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 10, color: '#7EE0A1', fontSize: 12, fontWeight: 700 }}>
            <Icon name="trend" size={15} color="#7EE0A1" />
            {t.increase_last_week || '+12% from last week'}
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
          <button
            type="button"
            onClick={() => setShowWithdrawModal(true)}
            className="tap-effect cred-btn-yellow"
            style={{ flex: 2, padding: '14px', fontSize: 14, borderRadius: 14, boxShadow: '0 2px 0 #D4A017' }}
          >
            <Icon name="wallet" size={17} color="#0D0D0D" /> <span style={{ marginLeft: 8 }}>{t.withdraw_cash || 'Withdraw Cash'}</span>
          </button>
          <button
            type="button"
            className="tap-effect"
            onClick={exportReport}
            style={{
              flex: 1,
              padding: '14px',
              fontSize: 13,
              fontWeight: 800,
              borderRadius: 14,
              border: '1.5px solid #E3E3E0',
              color: 'var(--text-primary)',
              background: 'var(--bg)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
            }}
          >
            <Icon name="export" size={16} />
            {t.export || 'Export'}
          </button>
        </div>
      </div>

      <div className="full-height-scroll" style={{ padding: '18px 20px 140px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 18 }}>
          {[
            { label: t.week || 'Week', value: `${weeklyTotal.toLocaleString()}`, icon: 'calendar', prefix: true },
            { label: t.days || 'Days', value: daysWorked, icon: 'clock' },
            { label: t.avg || 'Avg', value: `${avgPerDay}`, icon: 'chart', prefix: true },
          ].map((stat) => (
            <div key={stat.label} className="card-surface" style={{ padding: '13px 9px', textAlign: 'left', minHeight: 96, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div style={{ width: 32, height: 32, borderRadius: 10, background: 'var(--bg-subtle)', display: 'grid', placeItems: 'center', color: 'var(--text-primary)' }}>
                <Icon name={stat.icon} size={17} />
              </div>
              <div>
                <div style={{ fontSize: 16, color: 'var(--text-primary)', fontWeight: 900, whiteSpace: 'nowrap' }}>
                  {stat.prefix && <span style={{ color: 'var(--text-secondary)', fontWeight: 800 }}>&#8377;</span>}<bdi>{stat.value}</bdi>
                </div>
                <div style={{ fontSize: 10, color: '#8A8A8A', marginTop: 2, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0.5 }}><bdi>{stat.label}</bdi></div>
              </div>
            </div>
          ))}
        </div>

        <div className="card-flat" style={{ marginBottom: 20, padding: '18px 16px 16px', borderRadius: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, gap: 10 }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--text-primary)' }}>{t.weekly_performance || 'Weekly Performance'}</div>
              <div style={{ fontSize: 11, color: '#8A8A8A', fontWeight: 600, marginTop: 2 }}>6 earning days this cycle</div>
            </div>
            <div className="cred-tab-bar">
              {['week', 'month'].map(f => (
                <button
                  type="button"
                  key={f}
                  onClick={() => setActiveFilter(f)}
                  className={`cred-tab${activeFilter === f ? ' active' : ''}`}
                  style={{ border: 0, fontFamily: 'inherit' }}
                >
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>
          </div>
          <BarChart data={WEEKLY_DATA} />
        </div>

        <div style={{ marginBottom: 20 }}>
          <div className="cred-section-label" style={{ marginBottom: 12 }}>{t.recent_payouts || 'Recent Payouts'}</div>
          {loading ? (
            [1, 2, 3].map(i => <div key={i} className="skeleton" style={{ height: 74, borderRadius: 16, marginBottom: 10 }} />)
          ) : (
            <div className="card-flat" style={{ borderRadius: 20 }}>
              {payouts.map((item, idx) => (
                <div key={`${item?.job || 'payout'}-${idx}`} className="cred-bill-row" style={{ padding: '15px 16px' }}>
                  <div className="cred-bill-logo" style={{ background: ['#E8F1FF', '#EAF8EF', '#FFF4D8'][idx % 3], color: 'var(--text-primary)' }}>
                    <Icon name={item.icon || ['briefcase', 'truck', 'shield'][idx % 3]} size={20} />
                  </div>
                  <div className="cred-bill-info">
                    <div className="cred-bill-name"><bdi>{item?.job || 'Gig Completed'}</bdi></div>
                    <div className="cred-bill-number"><bdi>{formatDate(item?.date)}</bdi></div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 15, color: 'var(--text-primary)', fontWeight: 900 }}>+&#8377;<bdi>{item?.amount || 0}</bdi></div>
                    <div className="cred-active" style={{ marginTop: 2 }}>Paid</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div
          onClick={() => setActive('Earnings Planner')}
          className="tap-effect"
          style={{
            width: '100%',
            background: 'linear-gradient(135deg, #121316 0%, #1A1C20 100%)',
            border: '1px solid var(--border)',
            borderRadius: 20,
            padding: '16px 20px',
            marginBottom: 40,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 14,
            boxShadow: '0 8px 24px rgba(0,0,0,0.15)'
          }}
        >
          <div style={{ width: 46, height: 46, borderRadius: 16, background: 'rgba(244,196,48,0.14)', display: 'grid', placeItems: 'center', color: '#F4C430', flexShrink: 0 }}>
            <Icon name="target" size={24} color="#F4C430" />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 14, fontWeight: 800, color: '#FFFFFF', marginBottom: 4 }}>{t.set_earnings_goal || 'Set Earnings Goal'}</div>
            <div style={{ fontSize: 12, color: '#A0A2A6', fontWeight: 500 }}>{t.plan_with_ai || 'Plan your schedule with AI helper'}</div>
          </div>
          <span className="cred-btn-yellow" style={{ fontSize: 12, padding: '10px 18px', borderRadius: 10, whiteSpace: 'nowrap', flexShrink: 0, boxShadow: '0 2px 0 #D4A017' }}>Plan</span>
        </div>
      </div>

      <AnimatePresence>
        {showWithdrawModal && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowWithdrawModal(false)}
              style={{ position: 'absolute', inset: 0, background: 'rgba(0, 0, 0, 0.42)', backdropFilter: 'blur(8px)' }}
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              style={{
                width: '100%',
                maxWidth: 500,
                background: 'var(--bg)',
                borderTopLeftRadius: 24,
                borderTopRightRadius: 24,
                padding: '24px',
                position: 'relative',
                zIndex: 1,
                boxShadow: '0 -4px 30px rgba(0,0,0,0.08)'
              }}
            >
              <div style={{ width: 40, height: 5, background: 'var(--cred-border)', borderRadius: 10, margin: '0 auto 20px' }} />
              <h3 style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 8, textAlign: 'center' }}>{t.withdraw_funds || 'Withdraw Funds'}</h3>
              <p style={{ color: 'var(--cred-text-sub)', marginBottom: 24, fontSize: 14, fontWeight: 600, textAlign: 'center' }}>
                {t.withdraw_subtitle || 'Transfer your earnings to your bank account instantly.'}
              </p>

              <div className="cred-card" style={{ padding: '20px', marginBottom: 24, background: 'var(--cred-bg-surface)', border: '1px solid var(--cred-border)' }}>
                <div style={{ color: 'var(--cred-text-sub)', fontSize: 13, fontWeight: 800, textAlign: 'center' }}>{t.available_balance || 'Available Balance'}</div>
                <div style={{ fontSize: 32, color: 'var(--text-primary)', marginTop: 8, fontWeight: 900, textAlign: 'center' }}>&#8377;<bdi>{weeklyTotal.toLocaleString()}</bdi></div>
              </div>

              <div style={{ display: 'flex', gap: 12 }}>
                <button type="button" onClick={() => setShowWithdrawModal(false)} className="tap-effect" style={{ flex: 1, padding: '16px', fontSize: 15, border: '1px solid var(--cred-border)', borderRadius: 12, background: 'var(--bg)', color: 'var(--text-primary)', textAlign: 'center', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>{t.cancel || 'Cancel'}</button>
                <button type="button" onClick={() => { setShowWithdrawModal(false); alert(t.withdrawal_initiated || 'Withdrawal initiated! Funds will arrive shortly.'); }} className="tap-effect cred-btn-black" style={{ flex: 2, padding: '16px', fontSize: 15, borderRadius: 12 }}>{t.withdraw_now || 'Withdraw Now'}</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default EarningsScreen;
