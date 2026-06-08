import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AccessibleModal from './AccessibleModal';
import { FirestoreService } from '../services/firestoreService';

const StarPicker = ({ value, onChange, color = '#FBBF24' }) => (
  <div style={{ display: 'flex', gap: 8 }}>
    {[1, 2, 3, 4, 5].map(i => (
      <button
        key={i}
        type="button"
        onClick={() => onChange(i)}
        aria-label={`Rate ${i} out of 5 stars`}
        aria-pressed={i <= value}
        style={{ fontSize: 36, cursor: 'pointer', color: i <= value ? color : 'var(--text-muted)', opacity: i <= value ? 1 : 0.4, transition: '0.15s', filter: i <= value ? 'drop-shadow(0 0 6px rgba(251,191,36,0.5))' : 'none', border: 'none', background: 'transparent', padding: 0 }}>
        ★
      </button>
    ))}
  </div>
);

const RatingModal = ({ isOpen, onClose, context }) => {
  // context = { type: 'worker_rates_company' | 'admin_rates_worker', jobTitle, targetName, appId }
  const [workerStars, setWorkerStars] = useState(0);
  const [companyStars, setCompanyStars] = useState(0);
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const isWorkerRating = context?.type === 'worker_rates_company';
  const stars = isWorkerRating ? companyStars : workerStars;
  const setStars = isWorkerRating ? setCompanyStars : setWorkerStars;

  const handleSubmit = async () => {
    if (stars === 0) return;
    setLoading(true);
    try {
      const ratingData = {
        type: context?.type,
        targetName: context?.targetName,
        jobTitle: context?.jobTitle,
        stars,
        comment,
        createdAt: new Date().toISOString(),
      };
      // Save to localStorage for mock mode
      const existing = JSON.parse(localStorage.getItem('genie_ratings') || '[]');
      existing.push({ id: `rating_${Date.now()}`, ...ratingData });
      localStorage.setItem('genie_ratings', JSON.stringify(existing));
      setSubmitted(true);
      setTimeout(() => { setSubmitted(false); onClose(); }, 1800);
    } catch (err) {
      console.error('Rating error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 2000, display: isOpen ? 'flex' : 'none', alignItems: 'flex-end', background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)' }}>
      <AccessibleModal isOpen={isOpen} onClose={onClose} titleId="rating-modal-title">
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          style={{ width: '100%', background: 'var(--bg-card)', borderRadius: '24px 24px 0 0', padding: '36px 28px 48px', border: '1px solid var(--border-steel)' }}>

          {submitted ? (
            <div style={{ textAlign: 'center', padding: '20px 0' }} role="status" aria-live="polite">
              <div style={{ fontSize: 56, marginBottom: 16 }}>🎉</div>
              <div style={{ fontSize: 20, fontWeight: 800, color: '#22C55E' }}>Rating Submitted!</div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 8 }}>Thank you for your feedback.</div>
            </div>
          ) : (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
                <div>
                  <h3 id="rating-modal-title" style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                    {isWorkerRating ? 'Rate This Employer' : 'Rate This Worker'}
                  </h3>
                  <div style={{ fontSize: 13, color: 'var(--primary-cyan)', fontWeight: 700, marginTop: 6 }}>
                    {context?.targetName} · {context?.jobTitle}
                  </div>
                </div>
                <button
                  onClick={onClose}
                  type="button"
                  aria-label="Close rating modal"
                  style={{ fontSize: 22, cursor: 'pointer', color: 'var(--text-muted)', padding: '4px 8px', border: 'none', background: 'transparent' }}>
                  ✕
                </button>
              </div>

              <div style={{ textAlign: 'center', marginBottom: 28 }}>
                <StarPicker value={stars} onChange={setStars} />
                <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 12, fontWeight: 600, minHeight: 20 }} aria-live="polite">
                  {stars === 1 ? '😞 Poor experience' :
                   stars === 2 ? '😐 Below expectations' :
                   stars === 3 ? '🙂 Okay' :
                   stars === 4 ? '😊 Good experience' :
                   stars === 5 ? '🌟 Excellent!' : 'Tap a star to rate'}
                </div>
              </div>

              <textarea
                placeholder={`What did you think of ${isWorkerRating ? 'working here?' : 'this worker?'}`}
                value={comment}
                onChange={e => setComment(e.target.value)}
                aria-label="Additional feedback"
                style={{ width: '100%', height: 90, padding: '14px 16px', borderRadius: 10, border: '1px solid var(--border-steel)', background: 'rgba(255,255,255,0.02)', color: 'var(--text-primary)', fontSize: 13, fontWeight: 600, outline: 'none', resize: 'none', boxSizing: 'border-box', marginBottom: 20 }}
              />

              <div style={{ display: 'flex', gap: 12 }}>
                <button
                  onClick={onClose}
                  type="button"
                  className="tap-effect button-outline"
                  style={{ flex: 1, padding: '14px', textAlign: 'center', fontSize: 13, borderRadius: 12, cursor: 'pointer', border: '1.5px solid var(--border)', background: 'transparent', color: 'var(--text-primary)', fontWeight: 600, fontFamily: 'Sora, sans-serif' }}>
                  Skip
                </button>
                <button
                  onClick={stars > 0 ? handleSubmit : null}
                  type="button"
                  disabled={stars === 0}
                  className="tap-effect button-cyan"
                  aria-label={stars > 0 ? 'Submit rating' : 'Please select a rating first'}
                  style={{ flex: 2, padding: '14px', textAlign: 'center', fontSize: 13, borderRadius: 12, cursor: stars > 0 ? 'pointer' : 'not-allowed', opacity: stars > 0 ? 1 : 0.4, border: 'none', background: 'var(--text-primary)', color: '#FFF', fontWeight: 600, fontFamily: 'Sora, sans-serif' }}>
                  {loading ? 'Submitting...' : 'Submit Rating →'}
                </button>
              </div>
            </>
          )}
        </motion.div>
      </AccessibleModal>
    </div>
  );
};

export default RatingModal;
