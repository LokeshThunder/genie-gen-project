import React from 'react';
import NavBar from '../components/NavBar';
import { BADGES, getProgressToNextLevel } from '../constants/gamification';

const ProfileScreen = ({ setActive, onLogout, isAdmin, userProfile, userXP = 0, userLevel = { level: 1, label: 'Beginner' }, isDarkMode, setIsDarkMode }) => {
  const progress = getProgressToNextLevel(userXP);
  return (
    <div className="fade-in" style={{ height: "100%", background: "var(--bg-light)", display: "flex", flexDirection: "column" }}>
      <div style={{ padding: "16px 14px 0", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 34, height: 34, background: "#fff", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>👤</div>
          <div style={{ fontWeight: 800, fontSize: 15 }}>My Profile</div>
        </div>
        <div 
          onClick={onLogout}
          className="tap-effect"
          style={{ fontSize: 10, fontWeight: 900, color: '#EF4444', background: '#FFF0F0', padding: '6px 12px', borderRadius: 20, cursor: 'pointer', letterSpacing: 1 }}>
          LOGOUT
        </div>
      </div>
      
      <div className="full-height-scroll" style={{ padding: "14px 14px 0" }}>
          <div style={{ background: "var(--primary-purple)", borderRadius: 24, padding: "20px", display: "inline-block", marginBottom: 6, position: 'relative' }}>
            <div style={{ fontSize: 36 }}>{isAdmin ? "🏢" : "👤"}</div>
            {/* Level Badge Overlay */}
            <div style={{ position: 'absolute', bottom: -10, right: -10, background: '#F59E0B', color: '#fff', padding: '4px 10px', borderRadius: 12, fontSize: 10, fontWeight: 900, border: '3px solid var(--bg-light)' }}>
              LVL {userLevel.level}
            </div>
          </div>
          <br />
          <div style={{ fontWeight: 800, fontSize: 20, marginTop: 12, color: 'var(--text-main)' }}>{userProfile?.name || (isAdmin ? "Genie Corp" : "Worker")}</div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{userProfile?.gender} • {userProfile?.dob ? new Date().getFullYear() - new Date(userProfile.dob).getFullYear() + ' years' : 'New Member'}</div>
          
          {/* XP Progress Bar (Worker Only) */}
          {!isAdmin && (
            <div style={{ maxWidth: 200, margin: '15px auto 0' }}>
               <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9, fontWeight: 800, color: 'var(--primary-purple)', marginBottom: 5 }}>
                  <span>{userLevel.label.toUpperCase()}</span>
                  <span>{Math.round(progress)}%</span>
               </div>
               <div style={{ height: 6, background: 'rgba(0,0,0,0.05)', borderRadius: 10, overflow: 'hidden' }}>
                  <div style={{ width: `${progress}%`, height: '100%', background: 'var(--primary-purple)', borderRadius: 10 }} />
               </div>
            </div>
          )}
          
        <div style={{ background: "var(--card-bg)", borderRadius: 16, padding: "14px", marginBottom: 12, border: '1px solid var(--border-color)' }}>
          <div style={{ display: "flex", justifyContent: "space-around" }}>
            {(isAdmin 
              ? [ { v: "0", l: "POSTED" }, { v: "₹0", l: "SPENT", ic: "💳" }, { v: "0.0", l: "RATING", ic: "⭐" } ]
              : [ { v: "0", l: "JOBS" }, { v: "₹0", l: "EARNINGS", ic: "💳" }, { v: "0.0", l: "RATING", ic: "⭐" } ]
            ).map(s => (
              <div key={s.l} style={{ textAlign: "center" }}>
                {s.ic && <div style={{ fontSize: 16 }}>{s.ic}</div>}
                <div style={{ fontWeight: 800, fontSize: 16, color: 'var(--text-main)' }}>{s.v}</div>
                <div style={{ fontSize: 9, color: "var(--text-muted)" }}>{s.l}</div>
              </div>
            ))}
          </div>
        </div>
        
        <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: 1, color: "#888", marginBottom: 7 }}>LOYALTY STATUS</div>
        <div style={{ background: "#E8E4FF", borderRadius: 14, padding: "12px", display: "flex", alignItems: "center", gap: 9, marginBottom: 12 }}>
          <div style={{ width: 34, height: 34, background: "#fff", borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15 }}>✨</div>
          <div>
            <div style={{ fontWeight: 800, color: "#5B3FC8", fontSize: 13 }}>STARTER</div>
            <div style={{ fontSize: 10, color: "#5B3FC8" }}>LOYALTY SCORE: 0</div>
          </div>
          <span style={{ color: "#aaa", marginLeft: "auto" }}>›</span>
        </div>
        
        {!isAdmin && (
          <>
            <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: 1, color: "var(--text-muted)", marginBottom: 7 }}>MY BADGES</div>
            <div style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 10, marginBottom: 5 }} className="no-scrollbar">
              {BADGES.map((badge, idx) => (
                <div key={badge.id} style={{ 
                  flexShrink: 0, 
                  width: 80, 
                  background: idx < 2 ? 'var(--card-bg)' : 'rgba(0,0,0,0.03)', 
                  border: idx < 2 ? '1px solid var(--primary-purple)' : '1px solid var(--border-color)',
                  borderRadius: 14, 
                  padding: '12px 6px', 
                  textAlign: 'center',
                  opacity: idx < 2 ? 1 : 0.4
                }}>
                  <div style={{ fontSize: 24, marginBottom: 4 }}>{badge.icon}</div>
                  <div style={{ fontSize: 8, fontWeight: 900, color: 'var(--text-main)' }}>{badge.label.toUpperCase()}</div>
                </div>
              ))}
            </div>
            
            <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: 1, color: "var(--text-muted)", marginBottom: 7 }}>PLATFORM FEES</div>
            <div style={{ background: "var(--card-bg)", borderRadius: 14, padding: "12px 14px", marginBottom: 12, display: "flex", justifyContent: "space-between", alignItems: "center", border: '1px solid var(--border-color)' }}>
              <span style={{ fontWeight: 700, fontSize: 13, color: 'var(--text-main)' }}>Service Fee</span>
              <div style={{ background: "var(--primary-purple)", borderRadius: 9, padding: "5px 12px", color: "#fff", fontWeight: 700, fontSize: 13 }}>10%</div>
            </div>
          </>
        )}
        
        {/* Sections */}
        <div>
          <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: 1, color: "#888", marginBottom: 7 }}>ABOUT ME</div>
          <div style={{ background: "#fff", borderRadius: 14, padding: "14px", color: userProfile?.experience ? "#111" : "#bbb", fontSize: 12, marginBottom: 12 }}>
            {userProfile?.experience ? `Professional with ${userProfile.experience} years of experience in preferred areas: ${userProfile.preferredAreas || 'N/A'}.` : "No bio added yet."}
          </div>
        </div>
        
        {!isAdmin && (
          <div>
            <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: 1, color: "#888", marginBottom: 7 }}>MY SKILLS</div>
            <div style={{ background: "#fff", borderRadius: 14, padding: "14px", marginBottom: 12 }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {userProfile?.skills?.length > 0 ? userProfile.skills.map(skill => (
                  <div key={skill} style={{ background: '#F5F3FF', color: '#5B3FC8', padding: '6px 12px', borderRadius: 8, fontSize: 10, fontWeight: 800, border: '1px solid #DDD6FE' }}>{skill}</div>
                )) : <span style={{ color: '#bbb', fontSize: 12 }}>No skills added yet.</span>}
              </div>
            </div>
          </div>
        )}
        
        <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: 1, color: "var(--text-muted)", marginBottom: 7 }}>SETTINGS</div>
        <div style={{ background: "var(--card-bg)", borderRadius: 14, overflow: "hidden", marginBottom: 12, border: '1px solid var(--border-color)' }}>
          <div 
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="tap-effect" 
            style={{ padding: "13px 14px", display: "flex", alignItems: "center", gap: 11, borderBottom: "1px solid var(--border-color)", cursor: "pointer" }}>
            <div style={{ width: 32, height: 32, background: isDarkMode ? "#333" : "#EEEEFF", borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15 }}>{isDarkMode ? "🌙" : "☀️"}</div>
            <div style={{ flex: 1, fontWeight: 600, fontSize: 13, color: 'var(--text-main)' }}>Shadow Mode</div>
            <div style={{ width: 36, height: 20, background: isDarkMode ? 'var(--primary-purple)' : '#ccc', borderRadius: 20, position: 'relative', transition: '0.3s' }}>
              <div style={{ width: 14, height: 14, background: '#fff', borderRadius: '50%', position: 'absolute', top: 3, left: isDarkMode ? 19 : 3, transition: '0.3s' }} />
            </div>
          </div>
          {[{ icon: "🌐", label: "Language" }, { icon: "🏅", label: "My Loyalty" }, { icon: "🛡️", label: "Privacy & Safety" }].map((item, i, arr) => (
            <div key={item.label} className="tap-effect" style={{ padding: "13px 14px", display: "flex", alignItems: "center", gap: 11, borderBottom: i < arr.length - 1 ? "1px solid var(--border-color)" : "none", cursor: "pointer" }}>
              <div style={{ width: 32, height: 32, background: "rgba(0,0,0,0.03)", borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15 }}>{item.icon}</div>
              <div style={{ flex: 1, fontWeight: 600, fontSize: 13, color: 'var(--text-main)' }}>{item.label}</div>
              <span style={{ color: "var(--text-muted)" }}>›</span>
            </div>
          ))}
        </div>
        
        <div 
          onClick={onLogout}
          className="tap-effect"
          style={{ background: "#FFF0F0", borderRadius: 14, padding: "14px", textAlign: "center", fontWeight: 700, fontSize: 13, color: "#EF4444", letterSpacing: 1, marginBottom: 20, cursor: "pointer" }}
        >
          LOGOUT
        </div>
      </div>
      
      <NavBar active="Profile" setActive={setActive} isAdmin={isAdmin} />
    </div>
  );
};

export default ProfileScreen;
