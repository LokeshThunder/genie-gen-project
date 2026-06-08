import React, { useState, useEffect, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FirestoreService } from '../services/firestoreService';
import { HapticService } from '../services/hapticService';
import { JobService } from '../services/jobService';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { safeGet, escapeHtml } from '../utils/safeGet';


const AdminDashboard = ({ setActive, onCreateJob, jobs = [], applications = [], attendance = [], timeOffRequests = [], userProfile, t = {} }) => {
  const [loading, setLoading] = useState(true);
  const [pipelineTab, setPipelineTab] = useState('Pending');
  const [selectedWorker, setSelectedWorker] = useState(null);
  const [workerProfile, setWorkerProfile] = useState(null);
  const [adminRatings, setAdminRatings] = useState({}); // appId -> star rating
  const [blacklistedWorkers, setBlacklistedWorkers] = useState(new Set());
  const [payNotifications, setPayNotifications] = useState([]);

  // Dynamic Excel Export for a single worker dossier
  const downloadWorkerExcelReport = async (app) => {
    if (!app) return;
    const profile = await FirestoreService.getUserProfile(app.workerId);
    const now = new Date();
    const dateStr = now.toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' });

    const wAttendance = (attendance || []).find(att => att.workerId === app.workerId && att.jobId === app.jobId) 
      || (attendance || []).find(att => att.workerId === app.workerId)
      || {
        checkInTime: "",
        checkOutTime: "",
        checkInLoc: "",
        checkOutLoc: ""
      };

    const wHistory = (applications || []).filter(a => a.workerId === app.workerId && a.status === 'Completed').slice(0, 3);

    const sections = [
      { title: 'WORKER IDENTITY', rows: [
        ['Full Name', app.name || 'N/A'],
        ['Worker ID', app.workerId || 'N/A'],
        ['Phone', profile?.phone || 'N/A'],
        ['Date of Birth', profile?.dob || 'N/A'],
        ['Gender', profile?.gender || 'N/A'],
        ['Trust Score', `${profile?.trustScore || '100'} / 100`],
        ['Star Rating', `${profile?.rating || '5.0'} ★`],
        ['KYC Status', 'VERIFIED ✓'],
      ]},
      { title: 'PROFESSIONAL PROFILE', rows: [
        ['Experience', profile?.experience || profile?.exp || app.exp || 'N/A'],
        ['Preferred Areas', profile?.preferredAreas || 'N/A'],
        ['Skills', profile?.skills?.join(', ') || 'N/A'],
        ['About Me', profile?.aboutMe || 'N/A'],
      ]},
    ];

    let html = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
      <head><meta charset="UTF-8">
      <style>
        td, th { padding: 6px 12px; font-family: Calibri, sans-serif; font-size: 11pt; border: 1px solid #ddd; }
        th { background-color: #0a0f14; color: #00ffb4; font-weight: bold; }
        .section-header { background-color: #1e2028; color: #00e6a0; font-weight: bold; font-size: 12pt; }
        .report-title { background-color: #121218; color: #f0f0f5; font-weight: bold; font-size: 14pt; }
      </style></head><body>
      <table>
        <tr><td class="report-title" colspan="2">JOB GENIE — WORKER PROFILE REPORT</td></tr>
        <tr><td>Report Date</td><td>${dateStr}</td></tr>
        <tr><td>Worker ID</td><td>${app.workerId || 'N/A'}</td></tr>
        <tr><td colspan="2"></td></tr>`;

    sections.forEach(section => {
      html += `<tr><th class="section-header" colspan="2">${escapeHtml(section.title)}</th></tr>`;
      html += `<tr><th>Field</th><th>Value</th></tr>`;
      section.rows.forEach(([field, value]) => {
        html += `<tr><td>${escapeHtml(field)}</td><td>${escapeHtml(value)}</td></tr>`;
      });
      html += `<tr><td colspan="2"></td></tr>`;
    });

    if (wHistory && wHistory.length > 0) {
      html += `<tr><th class="section-header" colspan="2">WORK HISTORY</th></tr>`;
      html += `<tr><th>Job Title</th><th>Status</th></tr>`;
      wHistory.forEach(h => {
        html += `<tr><td>${escapeHtml(h.jobTitle || h.title || 'Mission')}</td><td>${escapeHtml(h.status || 'Completed')}</td></tr>`;
      });
    }

    html += `</table></body></html>`;

    const blob = new Blob([html], { type: 'application/vnd.ms-excel;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `JobGenie_Report_${app.name?.replace(/\s+/g, '_')}_${now.toISOString().slice(0,10)}.xls`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Master Excel Export for all workers in currently selected pipeline state
  const downloadPipelineExcelReport = (tabName) => {
    HapticService.success();
    const now = new Date();
    const dateStr = now.toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' });

    const filteredApps = (applications || []).filter(a => 
      tabName === 'Active' ? ['Approved', 'Active'].includes(a.status) : 
      tabName === 'Completed' ? ['Completed', 'PAID'].includes(a.status) : 
      a.status === tabName
    );

    let html = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
      <head><meta charset="UTF-8">
      <style>
        td, th { padding: 6px 12px; font-family: Calibri, sans-serif; font-size: 10pt; border: 1px solid #ddd; text-align: left; }
        th { background-color: #0a0f14; color: #00ffb4; font-weight: bold; }
        .report-title { background-color: #121218; color: #f0f0f5; font-weight: bold; font-size: 14pt; text-align: center; }
        .tab-title { background-color: #1e2028; color: #00e6a0; font-weight: bold; font-size: 11pt; }
      </style></head><body>
      <table>
        <tr><td class="report-title" colspan="10">JOB GENIE — HIRING PIPELINE MASTER REPORT</td></tr>
        <tr><td colspan="10"><b>Pipeline State:</b> ${tabName.toUpperCase()}</td></tr>
        <tr><td colspan="10"><b>Report Date:</b> ${dateStr}</td></tr>
        <tr><td colspan="10"><b>Total Records:</b> ${filteredApps.length}</td></tr>
        <tr><td colspan="10"></td></tr>
        <tr>
          <th>Worker Name</th>
          <th>Worker ID</th>
          <th>Job/Mission</th>
          <th>Base Wage</th>
          <th>Payment Status</th>
          <th>Trust Score</th>
          <th>Check-In Time</th>
          <th>Check-Out Time</th>
          <th>Distance Diff (m)</th>
          <th>Applied At</th>
        </tr>`;

    filteredApps.forEach(app => {
      const wAttendance = (attendance || []).find(att => att.workerId === app.workerId && att.jobId === app.jobId) 
        || (attendance || []).find(att => att.workerId === app.workerId)
        || {};

      html += `
        <tr>
          <td>${escapeHtml(app.name || 'N/A')}</td>
          <td>${escapeHtml(app.workerId || 'N/A')}</td>
          <td>${escapeHtml(app.jobTitle || app.title || 'N/A')}</td>
          <td>₹ ${escapeHtml(app.wage || '550')}</td>
          <td>${escapeHtml(app.status || 'N/A')}</td>
          <td>${escapeHtml(app.trustScore || '80')}/100</td>
          <td>${escapeHtml(wAttendance.checkInTime || 'N/A')}</td>
          <td>${escapeHtml(wAttendance.checkOutTime || 'N/A')}</td>
          <td>${escapeHtml(wAttendance.distanceDiff !== undefined && wAttendance.distanceDiff !== null ? wAttendance.distanceDiff : 'N/A')}</td>
          <td>${app.createdAt ? new Date(app.createdAt).toLocaleDateString('en-IN') : 'N/A'}</td>
        </tr>`;
    });

    html += `</table></body></html>`;

    const blob = new Blob([html], { type: 'application/vnd.ms-excel;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `JobGenie_Pipeline_${tabName}_${now.toISOString().slice(0,10)}.xls`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };


  useEffect(() => {
    if (selectedWorker?.workerId) {
      FirestoreService.getUserProfile(selectedWorker.workerId).then(profile => {
        setWorkerProfile(prev => prev === profile ? prev : profile);
      });
    } else {
      setWorkerProfile(prev => prev === null ? prev : null);
    }
  }, [selectedWorker]);

  const workerHistory = (applications || []).filter(a => a.workerId === selectedWorker?.workerId && a.status === 'Completed').slice(0, 3);
  const workerAttendance = (attendance || []).find(a => a.workerId === selectedWorker?.workerId && a.jobId === selectedWorker?.jobId) 
    || (attendance || []).find(a => a.workerId === selectedWorker?.workerId)
    || {
      checkInTime: "",
      checkOutTime: "",
      checkInPhoto: "",
      checkOutPhoto: "",
      checkInLoc: "",
      checkOutLoc: ""
    };

  useEffect(() => {
    const timer = setTimeout(() => setLoading(prev => prev === false ? prev : false), 600);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const triggerAbsentCheck = async () => {
      const activeApps = (applications || []).filter(a => ['Approved', 'Active'].includes(a.status));
      for (const app of activeApps) {
        const job = (jobs || []).find(j => j.id === app.jobId);
        if (job) {
          await JobService.markMissedDaysAsAbsent(app.workerId, app.jobId, job);
        }
      }
    };
    if ((applications || []).length > 0 && (jobs || []).length > 0) {
      triggerAbsentCheck();
    }
  }, [applications, jobs]);

  // Feature 5: Job Expiry Auto-Close
  useEffect(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    (jobs || []).forEach(job => {
      if (job.endDate && new Date(job.endDate) < today && ['active', 'Live', 'live'].includes(job.status)) {
        FirestoreService.updateJob(job.id, { status: 'archived' }).catch(() => {});
      }
    });
  }, [jobs]);

  const renderSkeleton = () => (
    <div className="full-height-scroll" style={{ padding: '8px' }}>
      <div className="skeleton border-precise" style={{ height: 60, marginBottom: 6, borderRadius: 10 }} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
        <div className="skeleton border-precise" style={{ height: 44, borderRadius: 10 }} />
        <div className="skeleton border-precise" style={{ height: 44, borderRadius: 10 }} />
      </div>
    </div>
  );

  if (loading) return (
    <div className="fade-in" style={{ height: '100%', background: 'var(--bg-clay)', display: 'flex', flexDirection: 'column' }}>
      <div className="glass" style={{ padding: 'var(--header-pad) 16px 10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-soft)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 22, height: 22, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary-mint)', fontSize: 9, fontWeight: 800, background: 'var(--bg-card)' }}>AD</div>
          <h1 className="tech-header" style={{ fontSize: 13 }}><bdi>{t.admin_dashboard || 'Dashboard'}</bdi></h1>
        </div>
      </div>
      {renderSkeleton()}
    </div>
  );

  const activeJobs = (jobs || []).filter(j => j?.status === 'Live' || j?.status === 'active' || j?.status === 'live');
  const pendingApps = (applications || []).filter(a => a?.status === 'Pending');

  const today = new Date().getDate();
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowDate = tomorrow.getDate();
  const duePayrollJobs = (jobs || []).filter(j => j.paymentDate && (Number(j.paymentDate) === today || Number(j.paymentDate) === tomorrowDate));

  // Feature 3: Analytics computed values
  const completedApps = (applications || []).filter(a => ['Completed', 'PAID'].includes(a.status));
  const absentApps = (applications || []).filter(a => a.status === 'Absent');
  const totalClosed = completedApps.length + absentApps.length;
  const absenteeRate = totalClosed > 0 ? Math.round((absentApps.length / totalClosed) * 100) : 0;
  const topWorkers = [...(applications || [])]
    .filter(a => a.trustScore)
    .sort((x, y) => (y.trustScore || 0) - (x.trustScore || 0))
    .slice(0, 3);

  // Total Payment & Platform Fee calculations
  const paidApps = (applications || []).filter(a => a.status === 'PAID');
  const totalWagesPaid = paidApps.reduce((sum, a) => sum + (Number(a.wage) || 0), 0);
  const PLATFORM_FEE_RATE = 0.10; // 10% platform fee
  const platformFeeEarned = Math.round(totalWagesPaid * PLATFORM_FEE_RATE);
  const netWorkerPayout = totalWagesPaid - platformFeeEarned;

  return (
    <div className="fade-in" style={{ height: '100%', background: 'var(--bg)', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>
      {/* Header Container */}
      <div style={{ 
        padding: 'var(--header-pad) 20px 16px', 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        flexShrink: 0, 
        zIndex: 10,
        borderBottom: '1px solid var(--border-light)',
        background: 'var(--bg-card)',
        direction: 'ltr'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--bg-surface)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-primary)', fontSize: 14, fontWeight: 700 }}>AD</div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}><bdi>{t.admin_dashboard || 'Dashboard'}</bdi></h1>
        </div>
        <div
          onClick={() => {
            HapticService.lightTap();
            setActive('Profile');
          }}
          className="tap-effect"
          style={{ width: 36, height: 36, borderRadius: '50%', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, color: 'var(--text-primary)', background: 'var(--bg-card)' }}>
          👤
        </div>
      </div>

      <div className="full-height-scroll screen-bottom-pad" style={{ paddingTop: '20px', paddingLeft: '16px', paddingRight: '16px', background: 'var(--bg)' }}>

        {duePayrollJobs.length > 0 && (
          <div className="cred-card fade-in" style={{ marginBottom: 20, padding: '16px', borderRadius: 16, background: '#FFF5F5', border: '1px solid #FCA5A5', display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ fontSize: 22 }}>⚠️</div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#E8302A' }}><bdi>{t.upcoming_payroll || 'Upcoming Payroll'}</bdi></div>
              <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-primary)', marginTop: 2 }}><bdi>Payments are due soon for {duePayrollJobs.length} job(s).</bdi></div>
            </div>
          </div>
        )}

        <div style={{ marginBottom: 20, textAlign: 'inherit' }}>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
            <bdi>{userProfile?.name || t.genie_partner || 'Genie Partner'}</bdi>
          </h2>
          <div style={{ color: 'var(--text-secondary)', marginTop: 4, display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 600 }}>
            <span style={{ color: '#E06020', fontSize: 14 }}>📍</span>
            <bdi>{userProfile?.companyHq || t.global_hq || 'Global HQ'}</bdi>
          </div>
        </div>

        {/* Action Items / Pending Approvals */}
        {timeOffRequests.filter(r => r.status === 'PENDING').length > 0 && (
          <div 
            onClick={() => setActive('AdminApprovals')}
            className="tap-effect cred-card" 
            style={{ marginBottom: 16, padding: '16px', borderRadius: 16, background: '#FEF3C7', border: '1px solid #FCD34D', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 40, height: 40, borderRadius: 12, background: '#F59E0B', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>📬</div>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700, color: '#92400E' }}>Pending Approvals</div>
                <div style={{ fontSize: 13, color: '#B45309', fontWeight: 500 }}>{timeOffRequests.filter(r => r.status === 'PENDING').length} time-off request(s)</div>
              </div>
            </div>
            <div style={{ fontSize: 20, color: '#B45309' }}>›</div>
          </div>
        )}

        <div
          onClick={() => setActive('Jobs')}
          className="tap-effect cred-card"
          style={{ marginBottom: 16, padding: '20px', borderRadius: 16, background: 'var(--bg-card)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div className="cred-badge cred-badge-green" style={{ display: 'inline-flex', alignItems: 'center' }}>
              <span className="pulse-active-green" style={{ width: 6, height: 6, borderRadius: '50%', background: '#16A34A', marginRight: 6 }} />
              {t.system_live || 'Operational'}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: 36, color: 'var(--text-primary)', fontWeight: 700, lineHeight: 1 }}>{activeJobs.length}</div>
              <div style={{ color: 'var(--text-secondary)', marginTop: 6, fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}><bdi>{t.active_gigs || 'Active Jobs'}</bdi></div>
            </div>
            <button className="cred-btn-black" style={{ padding: '8px 16px', fontSize: 12 }}>
              <bdi>{t.details_btn || 'Details ➔'}</bdi>
            </button>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, marginBottom: 16 }}>
          <div
            onClick={() => setActive('Applications')}
            className="tap-effect cred-card"
            style={{ padding: '16px', borderRadius: 16 }}>
            <div style={{ fontSize: 24, marginBottom: 8 }}>📄</div>
            <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-primary)' }}>{pendingApps.length}</div>
            <div style={{ color: 'var(--text-secondary)', marginTop: 4, fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}><bdi>{t.pending || 'Pending'}</bdi></div>
          </div>
          <div className="cred-card" style={{ padding: '16px', borderRadius: 16 }}>
            <div style={{ fontSize: 24, marginBottom: 8 }}>📈</div>
            <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-primary)' }}>{(jobs || []).length > 0 ? Math.round(((applications || []).length / jobs.length) * 100) : 0}%</div>
            <div style={{ color: 'var(--text-secondary)', marginTop: 4, fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}><bdi>{t.fulfillment_rate || 'Fulfillment'}</bdi></div>
          </div>
        </div>

        <div
          onClick={onCreateJob}
          className="tap-effect cred-card"
          style={{ background: 'var(--bg-card)', textAlign: 'center', marginBottom: 20, border: '1.5px solid #0D0D0D', padding: '24px 20px', borderRadius: 16 }}>
          <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'var(--bg-surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', fontSize: 24, border: '1px solid var(--border)' }}>🪄</div>
          <h3 style={{ fontSize: 16, color: 'var(--text-primary)', justifyContent: 'center', marginBottom: 4, fontWeight: 700 }}><bdi>{t.magic_gen || 'MAGIC POST'}</bdi></h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 16, fontSize: 12, fontWeight: 500 }}><bdi>{t.init_gig_ai || 'Automated Workforce Deployment'}</bdi></p>
          <button className="cred-btn-black" style={{ margin: '0 auto', padding: '12px 24px' }}>
            <bdi>{t.summon_operatives || 'INITIALIZE ⚡'}</bdi>
          </button>
        </div>

        {/* Feature 3: Analytics Dashboard */}
        <div className="cred-card" style={{ marginBottom: 20, padding: '16px', background: 'var(--bg-card)' }}>
          <div style={{ color: 'var(--text-muted)', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 14 }}><bdi>📊 {t.workforce_analytics || 'Workforce Analytics'}</bdi></div>

          {/* Total Payment Summary */}
          <div style={{ marginBottom: 16, padding: '14px', borderRadius: 12, background: 'var(--bg-subtle)', border: '1px solid var(--border)' }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10 }}><bdi>💰 {t.total_payment_summary || 'Total Payment Summary'}</bdi></div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
              <div>
                <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)' }}>₹{totalWagesPaid.toLocaleString('en-IN')}</div>
                <div style={{ fontSize: 9, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', marginTop: 2 }}><bdi>{t.total_paid || 'Total Paid'}</bdi></div>
              </div>
              <div>
                <div style={{ fontSize: 18, fontWeight: 700, color: '#E06020' }}>₹{platformFeeEarned.toLocaleString('en-IN')}</div>
                <div style={{ fontSize: 9, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', marginTop: 2 }}><bdi>{t.platform_fee || 'Platform Fee (10%)'}</bdi></div>
              </div>
              <div>
                <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)' }}>₹{netWorkerPayout.toLocaleString('en-IN')}</div>
                <div style={{ fontSize: 9, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', marginTop: 2 }}><bdi>{t.net_to_workers || 'Net to Workers'}</bdi></div>
              </div>
            </div>
            <div style={{ marginTop: 12, height: 6, background: 'var(--border)', borderRadius: 3, overflow: 'hidden' }}>
              <div style={{ width: `${totalWagesPaid > 0 ? 100 : 0}%`, height: '100%', background: 'var(--text-primary)', borderRadius: 3 }} />
            </div>
            <div style={{ fontSize: 9, fontWeight: 600, color: 'var(--text-muted)', marginTop: 6 }}><bdi>{paidApps.length} {paidApps.length === 1 ? (t.settled_transaction || 'settled transaction') : (t.settled_transactions || 'settled transactions')}</bdi></div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, marginBottom: 16 }}>
            <div className="cred-card" style={{ padding: '14px', background: 'var(--bg-card)' }}>
              <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)' }}>{completedApps.length}</div>
              <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}><bdi>{t.completions || 'Completions'}</bdi></div>
            </div>
            <div className="cred-card" style={{ padding: '14px', background: 'var(--bg-card)' }}>
              <div style={{ fontSize: 22, fontWeight: 700, color: absenteeRate > 20 ? '#E8302A' : '#0D0D0D' }}>{absenteeRate}%</div>
              <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}><bdi>{t.absentee_rate || 'Absentee Rate'}</bdi></div>
            </div>
          </div>
          {topWorkers.length > 0 && (
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 10 }}><bdi>🏆 {t.top_workers || 'Top Workers'}</bdi></div>
              {topWorkers.map((w, i) => (
                <div key={w.id} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                  <div style={{ width: 20, fontSize: 11, fontWeight: 700, color: 'var(--text-primary)' }}>#{i + 1}</div>
                  <div style={{ flex: 1, fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}><bdi>{w.name || 'Worker'}</bdi></div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-primary)' }}><bdi>{t.trust_label || 'Trust'} {w.trustScore}</bdi></div>
                  <div style={{ width: 60, height: 4, background: 'var(--border)', borderRadius: 2, overflow: 'hidden' }}>
                    <div style={{ width: `${w.trustScore}%`, height: '100%', background: 'var(--text-primary)' }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Operational Pipeline */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, paddingLeft: 4, paddingRight: 4 }}>
            <h3 style={{ fontSize: 16, margin: 0, fontWeight: 700 }}><bdi>{t.hiring_pipeline || 'Operational Pipeline'}</bdi></h3>
            <button 
              onClick={(e) => { e.stopPropagation(); downloadPipelineExcelReport(pipelineTab); }}
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
                color: 'var(--text-primary)',
                fontSize: 11,
                fontWeight: 700,
                padding: '6px 12px',
                borderRadius: 8,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                letterSpacing: 0.5
              }}
              className="tap-effect"
            >
              <span>📊</span>
              <span>{t.export || 'EXPORT'} ({safeGet(t, pipelineTab.toLowerCase()) ? safeGet(t, pipelineTab.toLowerCase()).toUpperCase() : pipelineTab.toUpperCase()})</span>
            </button>
          </div>
          
          {/* Pipeline Tab Switcher */}
          <div className="cred-tab-bar" style={{ display: 'flex', gap: 6, marginBottom: 20, padding: '3px' }}>
            {['Pending', 'Active', 'Completed'].map(tab => (
              <div
                key={tab}
                onClick={() => {
                  HapticService.lightTap();
                  setPipelineTab(tab);
                }}
                className={`cred-tab ${pipelineTab === tab ? 'active' : ''}`}
                style={{ flex: 1, justifyContent: 'center' }}
              >
                <bdi>{safeGet(t, tab.toLowerCase()) || tab}</bdi>
              </div>
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={pipelineTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {applications.filter(a => pipelineTab === 'Active' ? ['Approved', 'Active'].includes(a.status) : pipelineTab === 'Completed' ? ['Completed', 'PAID'].includes(a.status) : a.status === pipelineTab).length > 0 ? (
                applications.filter(a => pipelineTab === 'Active' ? ['Approved', 'Active'].includes(a.status) : pipelineTab === 'Completed' ? ['Completed', 'PAID'].includes(a.status) : a.status === pipelineTab).map(app => (
                  <div 
                    key={app.id} 
                    onClick={() => setSelectedWorker(app)}
                    className="tap-effect cred-card" 
                    style={{ padding: '16px', display: 'flex', flexDirection: 'column', background: 'var(--bg-card)', gap: 12 }}>
                    
                    {/* Top Row: Details on Left, Report Button + Status on Right */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                        <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--bg-surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, border: '1px solid var(--border)', flexShrink: 0 }}>👤</div>
                        <div>
                          <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}><bdi>{app.name || t.default_worker || 'Worker'}</bdi></div>
                          <div style={{ color: 'var(--text-secondary)', fontSize: 12, fontWeight: 500, marginTop: 2 }}><bdi>{app.jobTitle || t.default_task || 'General Task'}</bdi></div>
                        </div>
                        {app.dispute && (
                          <div className="cred-badge cred-badge-red" style={{ marginLeft: 8, fontSize: 10, fontWeight: 600, flexShrink: 0 }}>⚑ DISPUTE</div>
                        )}
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                        <div 
                          onClick={async (e) => {
                            e.stopPropagation();
                            HapticService.success();
                            await downloadWorkerExcelReport(app);
                          }}
                          className="tap-effect"
                          style={{ 
                            width: 32, 
                            height: 32, 
                            borderRadius: '50%', 
                            background: 'var(--bg-card)', 
                            border: '1px solid var(--border)', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center', 
                            cursor: 'pointer',
                            fontSize: 14 
                          }}
                          title="Download Excel Report"
                        >
                          📊
                        </div>

                        {app.status === 'PAID' && (
                          <div className="cred-badge cred-badge-green" style={{ fontSize: 12, fontWeight: 600 }}>
                            <bdi>PAID ✓</bdi>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Bottom Row: Actions (Approve, Absent/Done, UPI/Cash, or Rating) */}
                    {pipelineTab === 'Pending' && (
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 4, paddingTop: 12, borderTop: '1px solid var(--border-light)', width: '100%' }}>
                        <button
                          onClick={async (e) => {
                            e.stopPropagation();
                            HapticService.success();
                            await FirestoreService.updateApplicationStatus(app.id, 'Approved');
                            await FirestoreService.initializeTasks(app.id, app.category || 'General');
                          }}
                          className="cred-btn-black"
                          style={{ padding: '8px 16px', fontSize: 12, borderRadius: 8, whiteSpace: 'nowrap', flexShrink: 0 }}>
                          <bdi>{t.authorize_entry || 'Approve'}</bdi>
                        </button>
                      </div>
                    )}

                    {pipelineTab === 'Active' && (
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 4, paddingTop: 12, borderTop: '1px solid var(--border-light)', width: '100%' }}>
                        <button
                          onClick={(e) => { e.stopPropagation(); FirestoreService.markAbsent(app.id); }}
                          className="cred-btn-white"
                          style={{ padding: '8px 16px', fontSize: 12, color: '#E8302A', borderRadius: 8, fontWeight: 600, borderColor: '#FCA5A5', whiteSpace: 'nowrap', flexShrink: 0 }}>
                          <bdi>{t.absent_btn || 'Absent'}</bdi>
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); FirestoreService.completeApplication(app.id, app.workerId); }}
                          className="cred-btn-black"
                          style={{ padding: '8px 16px', fontSize: 12, borderRadius: 8, whiteSpace: 'nowrap', flexShrink: 0 }}>
                          <bdi>{t.complete_btn || 'Done'}</bdi>
                        </button>
                      </div>
                    )}

                    {app.status === 'PAID' && (
                      <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginTop: 4, paddingTop: 12, borderTop: '1px solid var(--border-light)', width: '100%' }}>
                        {!(safeGet(adminRatings, app.id) || app.adminRating) ? (
                          <div style={{ display: 'flex', gap: 4 }}>
                            {[1,2,3,4,5].map(star => (
                              <span key={star} onClick={async (e) => {
                                e.stopPropagation();
                                setAdminRatings(r => {
                                  if (typeof app.id === 'string' && app.id !== '__proto__' && app.id !== 'constructor' && app.id !== 'prototype') {
                                    return { ...r, [app.id]: star };
                                  }
                                  return r;
                                });
                                await FirestoreService.updateApplicationStatus(app.id, 'PAID', { adminRating: star });
                                HapticService.success();
                              }} style={{ fontSize: 20, cursor: 'pointer', color: 'var(--border)' }}>★</span>
                            ))}
                          </div>
                        ) : (
                          <div style={{ fontSize: 12, fontWeight: 600, color: '#C9A84C' }}>
                             {'★'.repeat(safeGet(adminRatings, app.id) || app.adminRating)} Rated
                          </div>
                        )}
                      </div>
                    )}

                    {pipelineTab === 'Completed' && app.status !== 'PAID' && (
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 4, paddingTop: 12, borderTop: '1px solid var(--border-light)', width: '100%' }}>
                        <button
                          onClick={async (e) => { 
                            e.stopPropagation(); 
                            HapticService.success();
                            try {
                              await FirestoreService.updateApplicationStatus(app.id, 'PAID');
                              // Feature 4: Store in-app notification for worker
                              const notif = { workerId: app.workerId, message: `₹${app.wage || '550'} received via UPI! Mission Closed. ✓`, read: false, createdAt: new Date().toISOString() };
                              setPayNotifications(n => [...n, notif]);
                              try { localStorage.setItem(`notif_${app.workerId}`, JSON.stringify(notif)); } catch(e) {}
                              // Feature 2: Generate worker payslip PDF
                              const doc2 = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
                              const MINT2=[13,13,13],DARK2=[255,255,255],SURF2=[242,242,240],MUT2=[92,92,92];
                              doc2.setFillColor(...DARK2); doc2.rect(0,0,210,297,'F');
                              doc2.setFillColor(...SURF2); doc2.roundedRect(0,0,210,50,0,0,'F');
                              doc2.setFillColor(...MINT2); doc2.rect(0,0,4,50,'F');
                              doc2.setFont('helvetica','bold'); doc2.setFontSize(20); doc2.setTextColor(13,13,13);
                              doc2.text('SALARY SLIP', 14, 16);
                              doc2.setFontSize(8); doc2.setTextColor(...MINT2);
                              doc2.text('JOB GENIE INDUSTRIAL OS', 14, 23);
                              doc2.setFontSize(7); doc2.setTextColor(...MUT2);
                              doc2.text(`Date: ${new Date().toLocaleDateString('en-IN')}  |  Mode: UPI`, 14, 30);
                              doc2.setFontSize(24); doc2.setTextColor(...MINT2); doc2.setFont('helvetica','bold');
                              doc2.text('PAID ✓', 155, 22);
                              autoTable(doc2, { startY: 60, margin:{left:10,right:10}, head:[['Field','Details']], body:[
                                ['Worker Name', app.name || 'N/A'],
                                ['Job Title', app.jobTitle || 'General Task'],
                                ['Company', app.company || 'Job Genie Corp'],
                                ['Payment Date', new Date().toLocaleDateString('en-IN')],
                                ['Base Wage', `₹ ${app.wage || '550'}`],
                                ['Payment Mode', 'UPI'],
                                ['Net Payable', `₹ ${app.wage || '550'}`],
                                ['Status', 'PAID ✓']
                              ], theme:'plain',
                                headStyles:{fillColor:SURF2,textColor:MINT2,fontSize:7,fontStyle:'bold'},
                                bodyStyles:{fillColor:DARK2,textColor:[13,13,13],fontSize:8},
                                alternateRowStyles:{fillColor:[247,247,245]},
                                columnStyles:{0:{textColor:MUT2,cellWidth:50}}
                              });
                              doc2.setFillColor(...SURF2); doc2.rect(0,287,210,10,'F');
                              doc2.setFont('helvetica','normal'); doc2.setFontSize(6); doc2.setTextColor(...MUT2);
                              doc2.text('Job Genie Industrial OS  •  Official Salary Slip  •  Confidential', 10, 293);
                              doc2.save(`PaySlip_${(app.name||'Worker').replace(/\s+/g,'_')}_${new Date().toISOString().slice(0,10)}.pdf`);
                            } catch(err) {}
                          }}
                          className="cred-btn-black"
                          style={{ padding: '8px 16px', fontSize: 12, borderRadius: 8, whiteSpace: 'nowrap', flexShrink: 0 }}>
                          <bdi>UPI</bdi>
                        </button>
                        <button
                          onClick={async (e) => { 
                            e.stopPropagation(); 
                            HapticService.success();
                            try {
                              await FirestoreService.updateApplicationStatus(app.id, 'PAID');
                              // Feature 4: Store in-app notification for worker
                              const notif = { workerId: app.workerId, message: `₹${app.wage || '550'} received as Cash! Mission Closed. ✓`, read: false, createdAt: new Date().toISOString() };
                              setPayNotifications(n => [...n, notif]);
                              try { localStorage.setItem(`notif_${app.workerId}`, JSON.stringify(notif)); } catch(e) {}
                              // Feature 2: Generate worker payslip PDF (Cash)
                              const doc3 = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
                              const MINT3=[13,13,13],DARK3=[255,255,255],SURF3=[242,242,240],MUT3=[92,92,92];
                              doc3.setFillColor(...DARK3); doc3.rect(0,0,210,297,'F');
                              doc3.setFillColor(...SURF3); doc3.roundedRect(0,0,210,50,0,0,'F');
                              doc3.setFillColor(...MINT3); doc3.rect(0,0,4,50,'F');
                              doc3.setFont('helvetica','bold'); doc3.setFontSize(20); doc3.setTextColor(13,13,13);
                              doc3.text('SALARY SLIP', 14, 16);
                              doc3.setFontSize(8); doc3.setTextColor(...MINT3);
                              doc3.text('JOB GENIE INDUSTRIAL OS', 14, 23);
                              doc3.setFontSize(7); doc3.setTextColor(...MUT3);
                              doc3.text(`Date: ${new Date().toLocaleDateString('en-IN')}  |  Mode: CASH`, 14, 30);
                              doc3.setFontSize(24); doc3.setTextColor(...MINT3); doc3.setFont('helvetica','bold');
                              doc3.text('PAID ✓', 155, 22);
                              autoTable(doc3, { startY: 60, margin:{left:10,right:10}, head:[['Field','Details']], body:[
                                ['Worker Name', app.name || 'N/A'],
                                ['Job Title', app.jobTitle || 'General Task'],
                                ['Company', app.company || 'Job Genie Corp'],
                                ['Payment Date', new Date().toLocaleDateString('en-IN')],
                                ['Base Wage', `₹ ${app.wage || '550'}`],
                                ['Payment Mode', 'CASH'],
                                ['Net Payable', `₹ ${app.wage || '550'}`],
                                ['Status', 'PAID ✓']
                              ], theme:'plain',
                                headStyles:{fillColor:SURF3,textColor:MINT3,fontSize:7,fontStyle:'bold'},
                                bodyStyles:{fillColor:DARK3,textColor:[13,13,13],fontSize:8},
                                alternateRowStyles:{fillColor:[247,247,245]},
                                columnStyles:{0:{textColor:MUT3,cellWidth:50}}
                              });
                              doc3.setFillColor(...SURF3); doc3.rect(0,287,210,10,'F');
                              doc3.setFont('helvetica','normal'); doc3.setFontSize(6); doc3.setTextColor(...MUT3);
                              doc3.text('Job Genie Industrial OS  •  Official Salary Slip  •  Confidential', 10, 293);
                              doc3.save(`PaySlip_${(app.name||'Worker').replace(/\s+/g,'_')}_${new Date().toISOString().slice(0,10)}.pdf`);
                            } catch(err) {}
                          }}
                          className="cred-btn-white"
                          style={{ padding: '8px 16px', fontSize: 12, borderRadius: 8, whiteSpace: 'nowrap', flexShrink: 0 }}>
                          <bdi>CASH</bdi>
                        </button>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="cred-card" style={{ padding: '32px 20px', textAlign: 'center', background: 'var(--bg-card)', borderStyle: 'dashed' }}>
                  <div style={{ color: 'var(--text-muted)', fontSize: 13, fontWeight: 600 }}><bdi>{t.pipeline_clear || 'No records found'}</bdi></div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>


      </div>

      <AnimatePresence>
        {selectedWorker && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedWorker(null)}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0, 0, 0, 0.4)', backdropFilter: 'blur(12px)', zIndex: 3000, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
            <motion.div
              initial={{ y: 200 }}
              animate={{ y: 0 }}
              exit={{ y: 200 }}
              onClick={e => e.stopPropagation()}
              className="cred-card"
              style={{ 
                width: '100%', 
                maxWidth: 500, 
                maxHeight: '90vh',
                overflowY: 'auto',
                padding: '32px 24px 120px 24px', 
                borderBottomLeftRadius: 0, 
                borderBottomRightRadius: 0, 
                borderTopLeftRadius: 40, 
                borderTopRightRadius: 40, 
                background: 'var(--bg-clay)', 
                boxShadow: '0 -15px 50px rgba(0,0,0,0.2)',
                position: 'relative'
              }}>
              
              <div style={{ width: 40, height: 4, background: 'var(--border-soft)', borderRadius: 10, margin: '0 auto 24px', opacity: 0.5 }} />

              {/* Profile Header */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 24 }}>
                <div 
                  onClick={() => setSelectedWorker(null)} 
                  className="tap-effect"
                  style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--bg-surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: 20, color: 'var(--text-muted)', boxShadow: 'var(--clay-shadow-inset)' }}>✕</div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 32 }}>
                <div className="cred-card" style={{ width: 84, height: 84, borderRadius: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 42, background: 'var(--cred-bg-surface)', border: '1px solid var(--cred-border)' }}>
                  {workerProfile?.photoURL ? <img loading="lazy" decoding="async" src={workerProfile.photoURL} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 28 }} /> : '👤'}
                </div>
                <div>
                  <h2 style={{ fontSize: 28, marginBottom: 4, fontWeight: 900, color: 'var(--text-primary)' }}><bdi>{selectedWorker.name || selectedWorker.workerName || 'Worker'}</bdi></h2>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ background: 'var(--bg-surface)', color: 'var(--text-primary)', padding: '4px 12px', borderRadius: 10, fontSize: 12, fontWeight: 900, border: '1px solid var(--cred-border)' }}>
                      ⭐ <bdi>{workerProfile?.rating || '5.0'}</bdi>
                    </div>
                    <div style={{ color: 'var(--cred-text-sub)', fontSize: 13, fontWeight: 800 }}>
                      <bdi>{workerProfile?.exp || (t.verified_label || 'Verified Expert')}</bdi>
                    </div>
                  </div>
                </div>
              </div>

              {/* Stats Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 32 }}>
                <div className="cred-card" style={{ padding: '16px 12px', textAlign: 'center', background: 'var(--cred-bg-surface)' }}>
                  <div style={{ fontSize: 18, fontWeight: 900, color: 'var(--text-primary)' }}>{workerProfile?.trustScore || 100}%</div>
                  <div style={{ fontSize: 9, fontWeight: 800, color: 'var(--cred-text-muted)', marginTop: 4, textTransform: 'uppercase' }}>TRUST</div>
                </div>
                <div className="cred-card" style={{ padding: '16px 12px', textAlign: 'center', background: 'var(--cred-bg-surface)' }}>
                  <div style={{ fontSize: 18, fontWeight: 900, color: 'var(--cred-orange)' }}>{workerProfile?.jobsCompleted || '12'}</div>
                  <div style={{ fontSize: 9, fontWeight: 800, color: 'var(--cred-text-muted)', marginTop: 4, textTransform: 'uppercase' }}>MISSIONS</div>
                </div>
                <div className="cred-card" style={{ padding: '16px 12px', textAlign: 'center', background: 'var(--cred-bg-surface)' }}>
                  <div style={{ fontSize: 18, fontWeight: 900, color: 'var(--cred-text-primary)' }}>LVL {workerProfile?.level || 1}</div>
                  <div style={{ fontSize: 9, fontWeight: 800, color: 'var(--cred-text-muted)', marginTop: 4, textTransform: 'uppercase' }}>RANK</div>
                </div>
              </div>

              {/* Profile Dossier Details */}
              <div style={{ marginBottom: 32 }}>
                <div style={{ color: 'var(--cred-text-muted)', fontSize: 11, fontWeight: 900, textTransform: 'uppercase', marginBottom: 12, letterSpacing: 1, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ color: 'var(--text-primary)' }}>👤</span> {t.profile_dossier || 'Profile Dossier'}
                </div>
                <div className="cred-card border-precise" style={{ padding: '20px', background: 'var(--cred-bg-surface)', display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
                    <div>
                      <div style={{ fontSize: 9, color: 'var(--cred-text-muted)', fontWeight: 900, textTransform: 'uppercase', letterSpacing: 0.5 }}>{t.dob || 'Date of Birth'}</div>
                      <div style={{ fontSize: 13, color: 'var(--text-primary)', fontWeight: 700, marginTop: 4 }}>
                        {workerProfile?.dob ? (isNaN(Date.parse(workerProfile.dob)) ? workerProfile.dob : new Date(workerProfile.dob).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })) : '—'}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: 9, color: 'var(--cred-text-muted)', fontWeight: 900, textTransform: 'uppercase', letterSpacing: 0.5 }}>{t.gender || 'Gender'}</div>
                      <div style={{ fontSize: 13, color: 'var(--text-primary)', fontWeight: 700, marginTop: 4 }}>
                        {workerProfile?.gender || '—'}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: 9, color: 'var(--cred-text-muted)', fontWeight: 900, textTransform: 'uppercase', letterSpacing: 0.5 }}>{t.experience || 'Experience'}</div>
                      <div style={{ fontSize: 13, color: 'var(--text-primary)', fontWeight: 700, marginTop: 4 }}>
                        {workerProfile?.experience || workerProfile?.exp || selectedWorker.exp || '—'}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: 9, color: 'var(--cred-text-muted)', fontWeight: 900, textTransform: 'uppercase', letterSpacing: 0.5 }}>{t.phone || 'Phone Contact'}</div>
                      <div style={{ fontSize: 13, color: 'var(--text-primary)', fontWeight: 700, marginTop: 4 }}>
                        {workerProfile?.phone || '—'}
                      </div>
                    </div>
                  </div>
                  <hr style={{ border: 'none', borderTop: '1px solid var(--cred-border)', margin: '4px 0' }} />
                  <div>
                    <div style={{ fontSize: 9, color: 'var(--cred-text-muted)', fontWeight: 900, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>{t.preferred_areas || 'Preferred Areas'}</div>
                    <div style={{ fontSize: 13, color: 'var(--text-primary)', fontWeight: 700 }}>
                      {workerProfile?.preferredAreas || '—'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Skills & Bio */}
              {(workerProfile?.skills?.length > 0 || workerProfile?.aboutMe) && (
                <div style={{ marginBottom: 32 }}>
                  <div style={{ color: 'var(--cred-text-muted)', fontSize: 11, fontWeight: 900, textTransform: 'uppercase', marginBottom: 12, letterSpacing: 1 }}>{t.capability_sync || 'Verified Capabilities'}</div>
                  {workerProfile?.skills && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
                      {workerProfile.skills.map((skill, idx) => (
                        <div key={idx} style={{ 
                          background: 'var(--bg-card)', 
                          padding: '6px 14px', 
                          borderRadius: 12, 
                          fontSize: 11, 
                          fontWeight: 800, 
                          color: 'var(--cred-text-primary)',
                          border: '1px solid var(--cred-border)'
                        }}>
                          {skill}
                        </div>
                      ))}
                    </div>
                  )}
                  {workerProfile?.aboutMe && (
                    <div style={{ padding: '16px', background: 'var(--bg-subtle)', borderRadius: 16, borderLeft: '3px solid #0D0D0D' }}>
                      <p style={{ color: 'var(--cred-text-sub)', fontSize: 14, fontWeight: 700, margin: 0, fontStyle: 'italic', lineHeight: 1.6 }}>
                        "{workerProfile.aboutMe}"
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Compliance Status */}
              <div style={{ marginBottom: 32 }}>
                <div style={{ color: 'var(--cred-text-muted)', fontSize: 11, fontWeight: 900, textTransform: 'uppercase', marginBottom: 12, letterSpacing: 1 }}>{t.identity_layer || 'Compliance Status'}</div>
                <div style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 8 }} className="hide-scrollbar">
                  {[
                    { label: 'KYC', icon: '🆔', active: true },
                    { label: 'BIO', icon: '✋', active: true },
                    { label: 'BANK', icon: '🏦', active: workerProfile?.bankSynced },
                    { label: 'DRIVE', icon: '🚗', active: workerProfile?.skills?.includes('DRIVING') }
                  ].map((item, idx) => (
                    <div key={idx} style={{ 
                      flexShrink: 0,
                      padding: '10px 16px', 
                      borderRadius: 16, 
                      background: item.active ? '#F2F2F0' : '#FFFFFF', 
                      border: `1px solid ${item.active ? '#0D0D0D' : 'var(--cred-border)'}`,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      opacity: item.active ? 1 : 0.4
                    }}>
                      <span style={{ fontSize: 14 }}>{item.icon}</span>
                      <span style={{ fontSize: 11, fontWeight: 900, color: item.active ? '#0D0D0D' : 'var(--cred-text-muted)' }}>{item.label}</span>
                    </div>
                  ))}
                </div>
              </div>



              {/* Feature 1: Dispute Section */}
              {selectedWorker?.dispute && (
                <div className="cred-card" style={{ marginBottom: 24, padding: '16px', background: '#FEF2F2', border: '1px solid var(--cred-red)', borderRadius: 16 }}>
                  <div style={{ fontSize: 12, fontWeight: 900, color: 'var(--cred-red)', marginBottom: 6 }}>⚑ DISPUTE RAISED BY WORKER</div>
                  <div style={{ fontSize: 13, color: 'var(--cred-text-primary)', fontWeight: 700, marginBottom: 12 }}>{selectedWorker.disputeReason || 'Worker has raised a dispute for this assignment.'}</div>
                  <button onClick={async () => {
                    await FirestoreService.updateApplicationStatus(selectedWorker.id, selectedWorker.status, { dispute: false, disputeReason: '' });
                    setSelectedWorker(w => ({...w, dispute: false}));
                    HapticService.success();
                  }} className="cred-btn-black" style={{ padding: '10px 20px', fontSize: 12, borderRadius: 12, fontWeight: 900 }}>
                    ✓ Mark Resolved
                  </button>
                </div>
              )}

              {/* Feature 6: Block Worker */}
              <div onClick={async () => {
                if (blacklistedWorkers.has(selectedWorker.workerId)) return;
                HapticService.lightTap();
                await FirestoreService.updateUserProfile(selectedWorker.workerId, { blacklisted: true }).catch(() => {});
                setBlacklistedWorkers(s => new Set([...s, selectedWorker.workerId]));
              }} className="tap-effect cred-card" style={{ marginBottom: 16, padding: '16px', display: 'flex', alignItems: 'center', gap: 12, border: `1px solid ${blacklistedWorkers.has(selectedWorker?.workerId) ? 'var(--cred-border)' : 'var(--cred-red)'}`, background: blacklistedWorkers.has(selectedWorker?.workerId) ? '#F2F2F0' : '#FEF2F2', cursor: blacklistedWorkers.has(selectedWorker?.workerId) ? 'not-allowed' : 'pointer', borderRadius: 16, opacity: blacklistedWorkers.has(selectedWorker?.workerId) ? 0.5 : 1 }}>
                <div style={{ fontSize: 20 }}>🚫</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 900, color: blacklistedWorkers.has(selectedWorker?.workerId) ? 'var(--cred-text-muted)' : 'var(--cred-red)' }}>
                    {blacklistedWorkers.has(selectedWorker?.workerId) ? 'Worker Blocked' : 'Block This Worker'}
                  </div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--cred-text-muted)' }}>Prevent future applications from this worker</div>
                </div>
              </div>

              {/* Report Download Action — PDF Dossier */}
              <div 
                onClick={() => {
                  HapticService.success();
                  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
                  const MINT = [13, 13, 13];
                  const DARK = [255, 255, 255];
                  const SURFACE = [242, 242, 240];
                  const MUTED = [92, 92, 92];
                  const now = new Date();
                  const dateStr = now.toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' });

                  // ── Header Banner ──
                  doc.setFillColor(...DARK);
                  doc.rect(0, 0, 210, 297, 'F');
                  doc.setFillColor(...SURFACE);
                  doc.roundedRect(0, 0, 210, 42, 0, 0, 'F');
                  doc.setFillColor(...MINT);
                  doc.rect(0, 0, 4, 42, 'F');
                  doc.setFont('helvetica', 'bold');
                  doc.setFontSize(18);
                  doc.setTextColor(13, 13, 13);
                  doc.text('JOB GENIE', 14, 14);
                  doc.setFontSize(8);
                  doc.setTextColor(...MINT);
                  doc.text('WORKER PROFILE DOSSIER — CONFIDENTIAL', 14, 20);
                  doc.setFontSize(7);
                  doc.setTextColor(...MUTED);
                  doc.text(`Generated: ${dateStr}  |  Worker ID: ${selectedWorker.workerId}`, 14, 27);
                  doc.text(`KYC Status: VERIFIED`, 14, 33);
                  doc.setTextColor(22, 163, 74);
                  doc.setFont('helvetica', 'bold');
                  doc.setFontSize(9);
                  doc.text(`● ACTIVE`, 160, 14);

                  let y = 52;
                  const sectionHeader = (label, icon) => {
                    doc.setFillColor(...SURFACE);
                    doc.roundedRect(10, y, 190, 8, 2, 2, 'F');
                    doc.setFillColor(...MINT);
                    doc.rect(10, y, 2, 8, 'F');
                    doc.setFont('helvetica', 'bold');
                    doc.setFontSize(7.5);
                    doc.setTextColor(...MINT);
                    doc.text(`${icon}  ${label}`, 15, y + 5.5);
                    y += 12;
                  };

                  // ── Section 1: Worker Identity ──
                  sectionHeader('WORKER IDENTITY', '👤');
                  autoTable(doc, {
                    startY: y,
                    margin: { left: 10, right: 10 },
                    head: [['Field', 'Value']],
                    body: [
                      ['Full Name', selectedWorker.name || 'N/A'],
                      ['Worker ID', selectedWorker.workerId || 'N/A'],
                      ['Phone', workerProfile?.phone || 'N/A'],
                      ['Date of Birth', workerProfile?.dob || 'N/A'],
                      ['Gender', workerProfile?.gender || 'N/A'],
                      ['Trust Score', `${workerProfile?.trustScore || '100'} / 100`],
                      ['Star Rating', `${workerProfile?.rating || '5.0'} ★`],
                      ['KYC Status', 'VERIFIED ✓'],
                    ],
                    theme: 'plain',
                    headStyles: { fillColor: SURFACE, textColor: MINT, fontSize: 7, fontStyle: 'bold' },
                    bodyStyles: { fillColor: DARK, textColor: [13, 13, 13], fontSize: 7.5, fontStyle: 'normal' },
                    alternateRowStyles: { fillColor: [247, 247, 245] },
                    columnStyles: { 0: { textColor: MUTED, cellWidth: 45 } },
                  });
                  y = doc.lastAutoTable.finalY + 10;

                  // ── Section 2: Professional Profile ──
                  sectionHeader('PROFESSIONAL PROFILE', '💼');
                  autoTable(doc, {
                    startY: y,
                    margin: { left: 10, right: 10 },
                    head: [['Field', 'Value']],
                    body: [
                      ['Experience', workerProfile?.experience || workerProfile?.exp || selectedWorker.exp || 'N/A'],
                      ['Preferred Areas', workerProfile?.preferredAreas || 'N/A'],
                      ['Skills', workerProfile?.skills?.join(', ') || 'N/A'],
                      ['About Me', workerProfile?.aboutMe || 'N/A'],
                    ],
                    theme: 'plain',
                    headStyles: { fillColor: SURFACE, textColor: MINT, fontSize: 7, fontStyle: 'bold' },
                    bodyStyles: { fillColor: DARK, textColor: [13, 13, 13], fontSize: 7.5 },
                    alternateRowStyles: { fillColor: [247, 247, 245] },
                    columnStyles: { 0: { textColor: MUTED, cellWidth: 45 } },
                  });

                  // ── Footer ──
                  const pageCount = doc.internal.getNumberOfPages();
                  for (let i = 1; i <= pageCount; i++) {
                    doc.setPage(i);
                    doc.setFillColor(...SURFACE);
                    doc.rect(0, 287, 210, 10, 'F');
                    doc.setFont('helvetica', 'normal');
                    doc.setFontSize(6);
                    doc.setTextColor(...MUTED);
                    doc.text('Job Genie Industrial OS  •  Worker Profile Dossier  •  Confidential', 10, 293);
                    doc.text(`Page ${i} of ${pageCount}`, 190, 293, { align: 'right' });
                  }

                  doc.save(`JobGenie_Profile_${selectedWorker.name?.replace(/\s+/g, '_')}_${now.toISOString().slice(0,10)}.pdf`);
                }}
                className="tap-effect cred-card" 
                style={{ 
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border)',
                  padding: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 16,
                  cursor: 'pointer',
                  marginBottom: 16
                }}>
                <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--bg-surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, border: '1px solid var(--border)' }}>📄</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>Report Download</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>PDF Dossier • Identity · Profile · Skills</div>
                </div>
                <div style={{ fontSize: 18, color: 'var(--text-primary)' }}>➔</div>
              </div>

              {/* Excel Report Download */}
              <div 
                onClick={() => {
                  HapticService.success();
                  downloadWorkerExcelReport(selectedWorker);
                }}
                className="tap-effect cred-card" 
                style={{ 
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border)',
                  padding: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 16,
                  cursor: 'pointer',
                  marginBottom: 16
                }}>
                <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--bg-surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, border: '1px solid var(--border)' }}>📊</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>Excel Report Download</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>Spreadsheet • Identity · Profile · Skills</div>
                </div>
                <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-secondary)', background: 'var(--bg-surface)', padding: '4px 10px', borderRadius: 6, border: '1px solid var(--border)' }}>.XLS</div>
              </div>
              {workerHistory.length > 0 && (
                <div style={{ marginBottom: 24 }}>
                  <div style={{ color: 'var(--text-muted)', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', marginBottom: 12, letterSpacing: 0.5, display: 'flex', justifyContent: 'space-between' }}>
                    <span>{t.history_module || 'Operational History'}</span>
                    <span style={{ color: 'var(--text-primary)' }}>{workerHistory.length} UNITS</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {workerHistory.map((hist, idx) => (
                      <div key={idx} className="cred-card" style={{ 
                        padding: '12px 16px', 
                        background: 'var(--bg-card)', 
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--bg-surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, border: '1px solid var(--border)' }}>✓</div>
                          <div>
                            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>{hist.jobTitle}</div>
                            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{new Date(hist.appliedAt).toLocaleDateString()}</div>
                          </div>
                        </div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>₹{hist.wage || '---'}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, marginTop: 20 }}>
                <button 
                  onClick={() => setSelectedWorker(null)} 
                  className="cred-btn-white" 
                  style={{ padding: '14px' }}>
                  <bdi>{t.dismiss_btn || 'Dismiss'}</bdi>
                </button>
                <button 
                  onClick={() => {
                    if (window.HapticService) window.HapticService.success();
                    const headers = [
                      "Worker ID", "Full Name", "Phone", "Date of Birth", "Gender", 
                      "Trust Score", "Star Rating", "Experience", "Preferred Areas", "Skills", "About Me"
                    ];
                    
                    const data = [
                      selectedWorker.workerId,
                      selectedWorker.name,
                      workerProfile?.phone || "N/A",
                      workerProfile?.dob || "N/A",
                      workerProfile?.gender || "N/A",
                      workerProfile?.trustScore || "100",
                      workerProfile?.rating || "5.0",
                      workerProfile?.experience || workerProfile?.exp || selectedWorker.exp || "N/A",
                      workerProfile?.preferredAreas || "N/A",
                      `"${(workerProfile?.skills || []).join('; ')}"`,
                      `"${(workerProfile?.aboutMe || '').replace(/"/g, '""')}"`
                    ];

                    const csvContent = "data:text/csv;charset=utf-8," + headers.join(",") + "\n" + data.join(",");
                    const encodedUri = encodeURI(csvContent);
                    const link = document.createElement("a");
                    link.setAttribute("href", encodedUri);
                    link.setAttribute("download", `Worker_Profile_${selectedWorker.name.replace(/\s+/g, '_')}.csv`);
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                  }}
                  className="cred-btn-black" 
                  style={{ padding: '14px' }}>
                  <bdi>PROFILE DOWNLOAD</bdi>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default memo(AdminDashboard, (prev, next) => {
  // Custom comparison: only re-render if admin data changed
  return (
    prev.adminJobs === next.adminJobs &&
    prev.applications === next.applications &&
    prev.userRole === next.userRole &&
    prev.screenParams === next.screenParams
  );
});
