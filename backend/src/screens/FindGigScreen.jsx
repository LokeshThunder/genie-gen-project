import React, { useState, useEffect, useRef, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format12h } from '../utils/timeUtils';
import { HapticService } from '../services/hapticService';
import QRScannerModal from '../components/QRScannerModal';

const calcDistance = (lat1, lng1, lat2, lng2) => {
  if (!lat1 || !lng1 || !lat2 || !lng2) return null;
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180) * Math.cos(lat2*Math.PI/180) * Math.sin(dLng/2)**2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

const CATEGORY_META = {
  All:        { icon: '✨', color: 'var(--border-light)' },
  Delivery:   { icon: '🚚', color: '#EEF2FF' },
  Security:   { icon: '🛡️', color: '#FEF2F2' },
  Warehousing:{ icon: '🏭', color: '#FFF7ED' },
  Retail:     { icon: '🛒', color: '#F0FDF4' },
  Logistics:  { icon: '📦', color: '#FFFBEB' },
};

const JOB_COLORS = ['#FFF3E0', '#E8F5E9', '#E3F2FD', '#FCE4EC', '#F3E5F5'];
const JOB_ICONS  = ['🏗️', '🚚', '🏪', '🏭', '🛒'];

const formatJobDate = (dateStr) => {
  if (!dateStr) return 'Today';
  try {
    const parts = dateStr.split('-');
    let d = parts.length === 3
      ? new Date(+parts[0], +parts[1] - 1, +parts[2])
      : new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const today = new Date(); today.setHours(0,0,0,0);
    const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate() + 1);
    d.setHours(0,0,0,0);
    const diff = Math.round((d - today) / 86400000);
    if (diff === 0) return 'Today';
    if (diff === 1) return 'Tomorrow';
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  } catch { return dateStr; }
};

const FindGigScreen = ({ setActive, initialSearch = '', jobs = [], applications = [], t = {}, user }) => {
  // Start loading. Dismiss only when jobs array is non-empty, OR after 5s fallback.
  const [loading, setLoading] = useState(true);
  const loadingDismissed = useRef(false);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [appliedJobs, setAppliedJobs]       = useState(() => (applications || []).map(a => a.jobId));
  const [searchQuery, setSearchQuery]       = useState(initialSearch || '');
  const [userLat, setUserLat]               = useState(null);
  const [userLng, setUserLng]               = useState(null);
  const [radiusFilter, setRadiusFilter]     = useState(null);
  const [locStatus, setLocStatus]           = useState('idle');
  const [sortBy, setSortBy]                 = useState('default');
  const [scannerOpen, setScannerOpen]       = useState(false);

  // Sync search query state
  useEffect(() => {
    setSearchQuery(initialSearch);
  }, [initialSearch]);

  // Dismiss skeleton only when jobs actually arrive (non-empty)
  useEffect(() => {
    if (jobs.length > 0 && !loadingDismissed.current) {
      loadingDismissed.current = true;
      setLoading(false);
    }
  }, [jobs]);

  // Hard fallback: if no jobs after 5s, show empty state anyway
  useEffect(() => {
    const id = setTimeout(() => {
      if (!loadingDismissed.current) {
        loadingDismissed.current = true;
        setLoading(false);
      }
    }, 5000);
    return () => clearTimeout(id);
  }, []);

  // Sync applied jobs without touching loading
  useEffect(() => {
    setAppliedJobs((applications || []).map(a => a.jobId));
  }, [applications]);

  const requestLocation = () => {
    setLocStatus('loading');
    if (!navigator.geolocation) { setLocStatus('error'); return; }
    navigator.geolocation.getCurrentPosition(
      pos => { setUserLat(pos.coords.latitude); setUserLng(pos.coords.longitude); setLocStatus('done'); setRadiusFilter(5); },
      () => setLocStatus('error'),
      { timeout: 8000 }
    );
  };

  const categories = ['All', 'Delivery', 'Security', 'Warehousing', 'Retail', 'Logistics'];

  const jobsWithDistance = (jobs || []).map(job => ({
    ...job,
    distanceKm: calcDistance(userLat, userLng, job.lat, job.lng),
  }));

  let filteredJobs = jobsWithDistance.filter(j => {
    const matchSearch   = (j.title || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchCategory = selectedCategory === 'All' || (j.category || '').toLowerCase().includes(selectedCategory.toLowerCase());
    const matchRadius   = radiusFilter === null || j.distanceKm === null || j.distanceKm <= radiusFilter;
    return matchSearch && matchCategory && matchRadius;
  });

  if (sortBy === 'pay') {
    filteredJobs = [...filteredJobs].sort((a, b) => {
      const pa = parseInt((a.pay || a.wage || '0').toString().replace(/\D/g, '')) || 0;
      const pb = parseInt((b.pay || b.wage || '0').toString().replace(/\D/g, '')) || 0;
      return pb - pa;
    });
  } else if (sortBy === 'distance') {
    filteredJobs = [...filteredJobs].sort((a, b) => {
      if (a.distanceKm !== null && b.distanceKm !== null) return a.distanceKm - b.distanceKm;
      if (a.distanceKm !== null) return -1;
      if (b.distanceKm !== null) return 1;
      return 0;
    });
  }

  const urgentJobs  = filteredJobs.filter(j => j.urgent);
  const regularJobs = filteredJobs.filter(j => !j.urgent);

  // ── JOB CARD ──
  const JobCard = ({ job, index }) => {
    const isApplied   = appliedJobs.includes(job.id);
    const displayPay  = job.pay || (job.wage ? `₹${job.wage}` : '₹500');
    const payLabel    = job.pricingModel === 'monthly' ? '/mo' : job.pricingModel === 'hourly' ? '/hr' : '/day';
    const displayLoc  = job.loc || job.locationName || 'Nearby';
    const displayCo   = job.company || job.companyName || 'JobGenie';
    const distLabel   = job.distanceKm !== null
      ? job.distanceKm < 1 ? `${Math.round(job.distanceKm * 1000)}m` : `${job.distanceKm.toFixed(1)}km`
      : null;
    const colorIdx    = Math.abs((job.title || '').charCodeAt(0)) % JOB_COLORS.length;
    const timeRange   = job.startTime && job.endTime ? `${format12h(job.startTime)} – ${format12h(job.endTime)}` : null;
    const dateLabel   = formatJobDate(job.startDate);
    const openings    = job.workerCount || 1;
    const shiftType   = job.type === 'night' ? 'Night' : job.type === 'flexible' ? 'Flex' : job.type === 'part-time' ? 'Part-time' : job.type === 'full-time' ? 'Full-time' : 'Day';

    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.04 }}
        onClick={() => setActive('Job Details', job)}
        className="tap-effect"
        style={{
          background: 'var(--bg-card)',
          border: `1.5px solid ${job.urgent ? '#FECACA' : 'var(--border)'}`,
          borderRadius: 18,
          padding: '16px',
          marginBottom: 10,
          cursor: 'pointer',
          boxShadow: job.urgent
            ? '0 4px 16px rgba(232,48,42,0.08)'
            : '0 2px 10px rgba(0,0,0,0.05)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Urgent accent line */}
        {job.urgent && (
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: 'linear-gradient(90deg, #E8302A, #FF6B6B)', borderRadius: '18px 18px 0 0' }} />
        )}

        {/* Top row */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 12 }}>
          <div style={{
            width: 46, height: 46, borderRadius: 13,
            background: JOB_COLORS[colorIdx],
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 22, flexShrink: 0,
          }}>
            {JOB_ICONS[colorIdx]}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'Sora, sans-serif', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: 3 }}>
              {job.title}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 12, color: 'var(--text-secondary)', fontFamily: 'Inter, sans-serif', fontWeight: 500 }}>{displayCo}</span>
              {distLabel && (
                <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', background: 'var(--bg-surface)', borderRadius: 999, padding: '2px 7px' }}>
                  📍 {distLabel}
                </span>
              )}
              {job.urgent && (
                <span style={{ fontSize: 9, fontWeight: 800, background: '#FEE2E2', color: '#E8302A', padding: '2px 7px', borderRadius: 999, letterSpacing: 0.3, textTransform: 'uppercase' }}>
                  ⚡ Urgent
                </span>
              )}
            </div>
          </div>
          <div style={{ textAlign: 'right', flexShrink: 0 }}>
            {isApplied ? (
              <div style={{ fontSize: 12, fontWeight: 700, color: '#16A34A', background: '#DCFCE7', borderRadius: 999, padding: '4px 10px', display: 'flex', alignItems: 'center', gap: 4 }}>
                <span>✓</span> Applied
              </div>
            ) : (
              <>
                <div style={{ fontSize: 17, fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'Sora, sans-serif', letterSpacing: '-0.3px' }}>{displayPay}</div>
                <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.5 }}>{payLabel}</div>
              </>
            )}
          </div>
        </div>

        {/* Details chips */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
          {[
            { icon: '📍', text: displayLoc },
            { icon: '📅', text: dateLabel },
            { icon: '🕒', text: timeRange || shiftType },
            { icon: '👤', text: `${openings} spot${openings !== 1 ? 's' : ''}` },
            job.category && { icon: '🏷️', text: job.category },
          ].filter(Boolean).map((chip, i) => (
            <div key={i} style={{
              display: 'inline-flex', alignItems: 'center', gap: 4,
              background: 'var(--bg-surface)', borderRadius: 999,
              padding: '4px 10px', fontSize: 11, fontWeight: 500, color: 'var(--text-secondary)',
              fontFamily: 'Inter, sans-serif',
            }}>
              <span style={{ fontSize: 10 }}>{chip.icon}</span>
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 90 }}>{chip.text}</span>
            </div>
          ))}
          {job.incentives && (
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: '#DCFCE7', borderRadius: 999, padding: '4px 10px', fontSize: 11, fontWeight: 600, color: '#16A34A', fontFamily: 'Inter, sans-serif' }}>
              <span>🎁</span><span>{job.incentives}</span>
            </div>
          )}
        </div>

        {/* CTA */}
        <div
          onClick={e => { e.stopPropagation(); if (!isApplied) setActive('Job Details', job); }}
          style={{
            background: isApplied ? 'var(--border-light)' : '#0D0D0D',
            color: isApplied ? '#9B9B9B' : '#FFFFFF',
            borderRadius: 12,
            padding: '11px 0',
            textAlign: 'center',
            fontSize: 13,
            fontWeight: 700,
            fontFamily: 'Sora, sans-serif',
            cursor: isApplied ? 'default' : 'pointer',
            border: isApplied ? '1px solid var(--border)' : 'none',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {!isApplied && (
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(255,255,255,0.06) 0%, transparent 60%)', pointerEvents: 'none' }} />
          )}
          {isApplied ? 'Applied ✓' : `Apply — ${displayPay}${payLabel}`}
        </div>
      </motion.div>
    );
  };

  const renderSkeleton = () => (
    <div style={{ padding: '16px' }}>
      {[1,2,3].map(i => (
        <div key={i} style={{ marginBottom: 12 }}>
          <div className="shimmer" style={{ height: 160, borderRadius: 18 }} />
        </div>
      ))}
    </div>
  );

  return (
    <div className="fade-in" style={{ flex: 1, background: 'var(--bg)', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden', width: '100%', minHeight: 0 }}>

      {/* ── HEADER ── */}
      <div style={{
        padding: 'var(--header-pad) 16px 12px',
        background: 'var(--overlay)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid var(--border-light)',
        flexShrink: 0, zIndex: 10,
      }}>
        {/* Title + actions */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', fontFamily: 'Inter, sans-serif', letterSpacing: '0.5px', marginBottom: 2 }}>
              {filteredJobs.length} {filteredJobs.length === 1 ? 'job' : 'jobs'} available
            </div>
            <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'Sora, sans-serif', letterSpacing: '-0.5px' }}>
              Find Jobs
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            {/* Sort */}
            <div
              onClick={() => setSortBy(s => s === 'pay' ? 'default' : 'pay')}
              className="tap-effect"
              style={{
                height: 36, borderRadius: 999,
                background: sortBy === 'pay' ? '#0D0D0D' : '#FFFFFF',
                border: `1.5px solid ${sortBy === 'pay' ? '#0D0D0D' : 'var(--border)'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: '0 12px', gap: 4, cursor: 'pointer',
              }}
            >
              <span style={{ fontSize: 12 }}>💰</span>
              <span style={{ fontSize: 11, fontWeight: 700, color: sortBy === 'pay' ? '#FFFFFF' : '#5C5C5C', fontFamily: 'Inter, sans-serif' }}>Pay</span>
            </div>
            {/* Location */}
            <div
              onClick={locStatus === 'idle' || locStatus === 'error' ? requestLocation : () => setRadiusFilter(r => r === null ? 5 : null)}
              className="tap-effect"
              style={{
                width: 36, height: 36, borderRadius: 999,
                background: locStatus === 'done' && radiusFilter ? '#0D0D0D' : '#FFFFFF',
                border: `1.5px solid ${locStatus === 'done' && radiusFilter ? '#0D0D0D' : 'var(--border)'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 16, cursor: 'pointer',
              }}
            >
              {locStatus === 'loading' ? '⌛' : locStatus === 'done' && radiusFilter ? '📍' : '📍'}
            </div>
            {/* Scan QR */}
            <div
              onClick={() => { HapticService.lightTap(); setScannerOpen(true); }}
              className="tap-effect"
              style={{
                width: 36, height: 36, borderRadius: 999,
                background: 'var(--bg-card)',
                border: '1.5px solid var(--border)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 16, cursor: 'pointer',
              }}
              title="Scan QR Code"
            >
              📷
            </div>
          </div>
        </div>

        {/* Search */}
        <div style={{
          display: 'flex', alignItems: 'center',
          background: 'var(--bg-card)', borderRadius: 14,
          padding: '0 14px', marginBottom: 12,
          border: '1.5px solid var(--border)',
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
        }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#9B9B9B" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginRight: 10 }}>
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            type="text"
            placeholder={t.search_placeholder || 'Search jobs, skills, locations...'}
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{
              flex: 1, background: 'transparent', border: 'none',
              fontSize: 14, fontWeight: 400, color: 'var(--text-primary)',
              padding: '12px 0', outline: 'none', boxShadow: 'none',
              fontFamily: 'Inter, sans-serif',
            }}
          />
          {searchQuery && (
            <div onClick={() => setSearchQuery('')} className="tap-effect" style={{ cursor: 'pointer', padding: '4px', color: 'var(--text-muted)', fontSize: 16, lineHeight: 1 }}>×</div>
          )}
        </div>

        {/* Category chips */}
        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 2 }} className="no-scrollbar">
          {categories.map(c => {
            const meta = CATEGORY_META[c] || { icon: '•', color: 'var(--border-light)' };
            const isActive = selectedCategory === c;
            return (
              <div
                key={c}
                onClick={() => setSelectedCategory(c)}
                className="tap-effect"
                style={{
                  flexShrink: 0,
                  display: 'flex', alignItems: 'center', gap: 5,
                  background: isActive ? '#0D0D0D' : '#FFFFFF',
                  color: isActive ? '#FFFFFF' : '#5C5C5C',
                  borderRadius: 999, padding: '7px 14px',
                  fontSize: 12, fontWeight: 700,
                  border: `1.5px solid ${isActive ? '#0D0D0D' : 'var(--border)'}`,
                  fontFamily: 'Inter, sans-serif',
                  transition: 'all 0.18s ease',
                }}
              >
                <span style={{ fontSize: 13 }}>{meta.icon}</span>
                {c}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── CONTENT ── */}
      <div style={{ flex: 1, position: 'relative', display: 'flex', flexDirection: 'column', minHeight: 0 }}>
        {loading ? renderSkeleton() : (
          <div className="full-height-scroll screen-bottom-pad" style={{ padding: '12px 16px 0' }}>

            {/* Radius filter pill */}
            {locStatus === 'done' && radiusFilter && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}
              >
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#EEF2FF', border: '1px solid #C7D2FE', borderRadius: 999, padding: '6px 12px' }}>
                  <span style={{ fontSize: 12 }}>📍</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#4F46E5', fontFamily: 'Inter, sans-serif' }}>Within {radiusFilter}km</span>
                  <div onClick={() => setRadiusFilter(null)} style={{ cursor: 'pointer', color: '#6366F1', fontSize: 14, lineHeight: 1, marginLeft: 2 }}>×</div>
                </div>
                <div onClick={() => setRadiusFilter(r => r === 2 ? 5 : r === 5 ? 10 : 2)} className="tap-effect" style={{ fontSize: 11, fontWeight: 700, color: '#6366F1', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>
                  Change radius
                </div>
              </motion.div>
            )}

            {/* Urgent section */}
            {urgentJobs.length > 0 && (
              <div style={{ marginBottom: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: 10, fontWeight: 800, color: '#E8302A', letterSpacing: '1px', textTransform: 'uppercase', fontFamily: 'Inter, sans-serif' }}>⚡ Urgent</span>
                    <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', fontFamily: 'Inter, sans-serif' }}>({urgentJobs.length})</span>
                  </div>
                  <span style={{ fontSize: 10, fontWeight: 700, color: '#E8302A', fontFamily: 'Inter, sans-serif' }}>Act fast</span>
                </div>
                {urgentJobs.map((job, i) => <JobCard key={job.id} job={job} index={i} />)}
              </div>
            )}

            {/* Regular jobs */}
            {regularJobs.length > 0 && (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                  <span style={{ fontSize: 10, fontWeight: 800, color: 'var(--text-muted)', letterSpacing: '1px', textTransform: 'uppercase', fontFamily: 'Inter, sans-serif' }}>
                    {locStatus === 'done' ? `Nearby jobs` : 'Available jobs'} ({regularJobs.length})
                  </span>
                  {sortBy !== 'default' && (
                    <div onClick={() => setSortBy('default')} className="tap-effect" style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>
                      Clear sort ×
                    </div>
                  )}
                </div>
                {regularJobs.map((job, i) => <JobCard key={job.id} job={job} index={i} />)}
              </div>
            )}

            {/* Empty state */}
            {filteredJobs.length === 0 && (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                className="empty-state"
              >
                <div className="empty-state-icon">🔍</div>
                <div className="empty-state-title">No jobs found</div>
                <div className="empty-state-sub">
                  {radiusFilter ? `No jobs within ${radiusFilter}km. Try expanding the radius.` : 'Try a different search or category.'}
                </div>
                {(radiusFilter || searchQuery || selectedCategory !== 'All') && (
                  <div
                    onClick={() => { setRadiusFilter(null); setSearchQuery(''); setSelectedCategory('All'); }}
                    className="tap-effect cred-btn-black"
                    style={{ marginTop: 20, borderRadius: 12, padding: '12px 24px', fontSize: 13 }}
                  >
                    Clear all filters
                  </div>
                )}
              </motion.div>
            )}
          </div>
        )}
      </div>



      <QRScannerModal 
        isOpen={scannerOpen}
        onClose={() => setScannerOpen(false)}
        user={user}
        jobs={jobs}
        onScanSuccess={(job) => {
          setActive('Tasks', { appId: `${user.uid}_${job.id}`, jobId: job.id });
        }}
      />
    </div>
  );
};

export default memo(FindGigScreen, (prev, next) => {
  // Custom comparison: re-render only if jobs, search filters, or relevant params changed
  return (
    prev.jobs === next.jobs &&
    prev.jobs?.length === next.jobs?.length &&
    prev.screenParams === next.screenParams &&
    JSON.stringify(prev.jobs?.map(j => j.id)) === JSON.stringify(next.jobs?.map(j => j.id))
  );
});
