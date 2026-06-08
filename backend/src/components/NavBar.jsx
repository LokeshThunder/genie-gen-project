import React from 'react';

const S = {
  width: 22, height: 22,
  viewBox: '0 0 24 24', fill: 'none',
  stroke: 'currentColor', strokeWidth: 1.8,
  strokeLinecap: 'round', strokeLinejoin: 'round'
};

const icons = {
  home:     <svg {...S}><path d="M3 10.5 12 3l9 7.5"/><path d="M5 10v10h14V10"/><path d="M9.5 20v-6h5v6"/></svg>,
  jobs:     <svg {...S}><rect x="3" y="7" width="18" height="13" rx="2"/><path d="M8 7V5.5A2.5 2.5 0 0 1 10.5 3h3A2.5 2.5 0 0 1 16 5.5V7"/><path d="M3 12h18"/></svg>,
  earnings: <svg {...S} viewBox="0 0 24 24"><path d="M6 3h12M6 8h12M6 13l8.5 8M6 13h3M9 13c6.667 0 6.667-10 0-10"/></svg>,
  profile:  <svg {...S}><circle cx="12" cy="8" r="4"/><path d="M5 21a7 7 0 0 1 14 0"/></svg>,
  reports:  <svg {...S}><path d="M4 19V5"/><path d="M4 19h16"/><rect x="7" y="11" width="3" height="5" rx="1"/><rect x="12" y="8" width="3" height="8" rx="1"/><rect x="17" y="5" width="3" height="11" rx="1"/></svg>,
  ops:      <svg {...S}><path d="m13 2-9 12h7l-1 8 10-13h-7l0-7Z"/></svg>,
  sparkles: <svg {...S} viewBox="0 0 24 24"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1-1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>,
  plus:     <svg {...S} viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
};

const NavBar = ({ active, setActive, role, isAdmin, t = {} }) => {
  const r = role || (isAdmin ? 'admin' : 'worker');

  const allTabs = r === 'admin'
    ? [
        { id: 'Home',      label: t.home    || 'HOME',    icon: icons.home    },
        { id: 'Genie Ops', label: 'OPS',                  icon: icons.ops     },
        { id: 'Create',    label: t.create  || 'CREATE',  icon: icons.plus    },
        { id: 'Reports',   label: t.reports || 'REPORTS', icon: icons.reports },
        { id: 'Profile',   label: t.profile || 'PROFILE', icon: icons.profile }
      ]
    : r === 'super_admin'
      ? [
          { id: 'Home',    label: t.home    || 'HOME',    icon: icons.home    },
          { id: 'Profile', label: t.profile || 'PROFILE', icon: icons.profile }
        ]
      : [
          { id: 'Home',     label: t.home     || 'HOME',       icon: icons.home     },
          { id: 'Find Job', label: t.find_gig || 'MISSION',    icon: icons.jobs     },
          { id: 'Genie AI', label: t.genie_ai || 'GENIE AI',   icon: icons.sparkles },
          { id: 'Earnings', label: t.earnings || 'EARNINGS',   icon: icons.earnings },
          { id: 'Profile',  label: t.profile  || 'PROFILE',    icon: icons.profile  }
        ];

  const orderedTabs = [...allTabs];
  const activeIdx = orderedTabs.findIndex(t => t.id === active);
  if (activeIdx !== -1) {
    const centerIdx = Math.floor(orderedTabs.length / 2);
    const shift = activeIdx - centerIdx;
    
    if (shift > 0) {
      // Shift left (move first 'shift' elements to end)
      const toMove = orderedTabs.splice(0, shift);
      orderedTabs.push(...toMove);
    } else if (shift < 0) {
      // Shift right (move last '|shift|' elements to beginning)
      const toMove = orderedTabs.splice(orderedTabs.length + shift, Math.abs(shift));
      orderedTabs.unshift(...toMove);
    }
  }

  const n = orderedTabs.length;
  // To create the "3 icon loop" effect, we only display the active center item and its two immediate neighbors
  const displayTabs = n >= 5 ? orderedTabs.slice(Math.floor(n / 2) - 1, Math.floor(n / 2) + 2) : orderedTabs;
  const nDisplay = displayTabs.length;

  return (
    <nav className="bottom-nav" aria-label="Primary navigation">

      {/* Static curved black background */}
      <div className="bottom-nav-svg-container">
        <svg className="bottom-nav-svg" viewBox="0 0 400 85" preserveAspectRatio="none">
          <path className="bottom-nav-bg"     d="M 0 20 Q 200 -5 400 20 L 400 85 L 0 85 Z" />
          <path className="bottom-nav-border" d="M 0 20 Q 200 -5 400 20" fill="none" />
        </svg>
      </div>

      <div
        className="bottom-nav-inner"
        style={{ 
          display: 'flex', 
          justifyContent: 'space-around', 
          alignItems: 'flex-start',
          paddingTop: '22px',
          paddingLeft: '10px',
          paddingRight: '10px'
        }}
      >
        {displayTabs.map((tab, idx) => {
          const isCenter = nDisplay === 5 ? idx === 2 : (nDisplay === 3 ? idx === 1 : false);
          const isActive = active === tab.id;

          if (isCenter) {
            return (
              <div key={tab.id} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '-27px', zIndex: 10 }}>
                <button
                  type="button"
                  className={`nav-upi-btn ${isActive ? 'active' : ''}`}
                  onClick={() => setActive(tab.id)}
                  aria-label={tab.label}
                  aria-current={isActive ? 'page' : 'false'}
                >
                  <span className="nav-upi-icon-container">
                    {tab.icon}
                  </span>
                </button>
                <span className="nav-upi-label-text" style={{ color: isActive ? 'var(--bottom-nav-text-active)' : 'var(--bottom-nav-text)' }}>
                  {tab.label}
                </span>
              </div>
            );
          }

          return (
            <button
              key={tab.id}
              type="button"
              className={`nav-item ${isActive ? 'active' : ''}`}
              onClick={() => setActive(tab.id)}
              aria-label={tab.label}
              aria-current={isActive ? 'page' : 'false'}
              style={{ zIndex: 5, flex: 1, padding: '6px 2px' }}
            >
              <span className="nav-item-icon">{tab.icon}</span>
              <span className="nav-item-label">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default NavBar;
