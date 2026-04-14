import React, { useState, useEffect } from 'react';
import NavBar from '../components/NavBar';

const HomeScreen = ({ setActive, isSafetyModeActive }) => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  const renderSkeleton = () => (
    <div className="full-height-scroll" style={{ padding: "10px 14px 0" }}>
       <div className="skeleton" style={{ height: 100, borderRadius: 14, marginBottom: 15 }} />
       <div className="skeleton" style={{ height: 40, borderRadius: 8, marginBottom: 10 }} />
       <div className="skeleton" style={{ height: 140, borderRadius: 14, marginBottom: 15 }} />
       <div style={{ display: "flex", gap: 8, marginBottom: 15 }}>
          <div className="skeleton" style={{ flex: 1, height: 80, borderRadius: 12 }} />
          <div className="skeleton" style={{ flex: 1, height: 80, borderRadius: 12 }} />
          <div className="skeleton" style={{ flex: 1, height: 80, borderRadius: 12 }} />
       </div>
       <div className="skeleton" style={{ height: 60, borderRadius: 14, marginBottom: 10 }} />
       <div className="skeleton" style={{ height: 80, borderRadius: 14, marginBottom: 10 }} />
    </div>
  );

  return (
    <div className="fade-in" style={{ height: "100%", background: "#fff", display: "flex", flexDirection: "column" }}>
      <div style={{ padding: "14px 14px 0", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
          <div 
            className={isSafetyModeActive ? "pulse-glow" : ""}
            onClick={() => setActive("Safety")}
            style={{ width: 40, height: 40, borderRadius: "50%", background: isSafetyModeActive ? "#EF4444" : "linear-gradient(135deg,#f4a261,#e76f51)", position: "relative", flexShrink: 0, border: isSafetyModeActive ? '2px solid #fff' : 'none', cursor: 'pointer' }}>
            {isSafetyModeActive ? (
              <div style={{ position: "absolute", top: '50%', left: '50%', transform: 'translate(-50%,-50%)', fontSize: 18 }}>🛡️</div>
            ) : (
              <div style={{ position: "absolute", bottom: 0, right: 0, width: 12, height: 12, background: "#22c55e", borderRadius: "50%", border: "2px solid #fff" }} />
            )}
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 12 }}>{isSafetyModeActive ? "SAFETY ACTIVE" : "JOB"}</div>
            <div style={{ fontSize: 10, color: isSafetyModeActive ? "#EF4444" : "#888", fontWeight: isSafetyModeActive ? 700 : 400 }}>{isSafetyModeActive ? "Live Tracking..." : "📍 New Delhi"}</div>
          </div>
        </div>
        <div style={{ width: 30, height: 30, borderRadius: "50%", background: "#EF4444", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 12 }}>0</div>
      </div>
      
      {loading ? renderSkeleton() : (
        <div className="full-height-scroll" style={{ padding: "10px 14px 0" }}>
          <div style={{ marginBottom: 10 }}>
            <div style={{ fontSize: 11, color: "#22c55e", fontWeight: 600 }}>Welcome Back,</div>
            <div style={{ fontSize: 19, fontWeight: 800, color: "#5B3FC8" }}>Genie User</div>
            <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 5, fontSize: 10, color: "#888" }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#22c55e", display: "inline-block" }} />
              Available for new opportunities...
            </div>
          </div>
          
          <div
            onClick={() => setActive("Loans")}
            className="tap-effect"
            style={{ background: "#1a1200", borderRadius: 14, padding: "14px", position: "relative", overflow: "hidden", marginBottom: 10, cursor: "pointer", boxShadow: "0 4px 18px rgba(0,0,0,0.4), 0 0 0 1px rgba(212,175,55,0.2)" }}>
            <div style={{ position: "absolute", top: 0, right: 0, width: "55%", height: "100%", background: "radial-gradient(circle at 70% 50%, rgba(212,175,55,0.2), transparent 70%)" }} />
            <div style={{ position: "absolute", bottom: -10, left: -10, width: 60, height: 60, borderRadius: "50%", background: "radial-gradient(circle, rgba(212,175,55,0.1), transparent)" }} />
            <div style={{ fontSize: 9, color: "#D4AF37", fontWeight: 700, marginBottom: 3, letterSpacing: 1, position: "relative" }}>⚡ GENIE LOANS</div>
            <div style={{ fontSize: 15, fontWeight: 800, color: "#D4AF37", position: "relative" }}>Instant Cash — Up to ₹1,00,000</div>
            <div style={{ fontSize: 10, color: "rgba(212,175,55,0.5)", marginTop: 3, position: "relative" }}>Zero processing fee · Apply in 2 minutes →</div>
          </div>
          
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
            <div style={{ width: 28, height: 28, background: "#EEF2FF", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13 }}>💼</div>
            <div style={{ fontWeight: 700, fontSize: 10, letterSpacing: 0.8, color: "#444", flex: 1 }}>CURRENT ASSIGNMENT</div>
            <span style={{ color: "#bbb", fontSize: 13 }}>›</span>
          </div>
          
          <div style={{ background: "#F5F7FF", borderRadius: 14, padding: "14px", textAlign: "center", marginBottom: 10 }}>
            <div style={{ fontSize: 22, marginBottom: 4 }}>✨</div>
            <div style={{ fontSize: 13, fontWeight: 800, color: "#111" }}>Ready for your next gig?</div>
            <div style={{ fontSize: 10, color: "#999", marginTop: 2 }}>Your skills are in high demand today!</div>
            <div 
              onClick={() => setActive("Find Job")}
              className="tap-effect"
              style={{ marginTop: 10, background: "#1A1A3E", borderRadius: 10, padding: "10px 0", color: "#fff", fontWeight: 700, fontSize: 10, letterSpacing: 1, cursor: "pointer" }}
            >
              🔍 DISCOVER GIGS
            </div>
          </div>
          
          <div style={{ display: "flex", gap: 7, marginBottom: 10 }}>
            {[{ c: "#5B3FC8", i: "📄", l: "APPLIED" }, { c: "#22c55e", i: "⚡", l: "ACTIVE" }, { c: "#F59E0B", i: "✅", l: "DONE" }].map(s => (
              <div 
                key={s.l} 
                onClick={() => setActive('My Jobs')}
                className="tap-effect" 
                style={{ flex: 1, background: s.c, borderRadius: 12, padding: "10px 4px", textAlign: "center", color: "#fff", cursor: "pointer" }}>
                <div style={{ fontSize: 14 }}>{s.i}</div>
                <div style={{ fontSize: 16, fontWeight: 800 }}>0</div>
                <div style={{ fontSize: 7, fontWeight: 600, opacity: 0.85 }}>{s.l}</div>
              </div>
            ))}
          </div>
          
          <div 
            onClick={() => setActive("Benefits")}
            className="tap-effect" 
            style={{ background: "#1a1a2e", borderRadius: 14, padding: "12px", display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10, cursor: "pointer" }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 30, height: 30, background: "#1F4D3A", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>🛡️</div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#fff" }}>Genie Benefits</div>
                <div style={{ fontSize: 9, color: "#777" }}>Health &amp; Accident Insurance</div>
              </div>
            </div>
            <span style={{ color: "#555", background: "#2a2a4a", width: 22, height: 22, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11 }}>›</span>
          </div>

          <div 
            onClick={() => setActive("Safety")}
            className="tap-effect" 
            style={{ 
              background: isSafetyModeActive ? "rgba(239, 68, 68, 0.1)" : "#fff", 
              borderRadius: 14, padding: "12px", display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10, cursor: "pointer",
              border: isSafetyModeActive ? "1.5px solid #EF4444" : "1.5px solid #EEE"
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 30, height: 30, background: isSafetyModeActive ? "#EF4444" : "#FEE2E2", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>🛡️</div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: isSafetyModeActive ? "#EF4444" : "#111" }}>Safety Shield</div>
                <div style={{ fontSize: 9, color: "#777" }}>{isSafetyModeActive ? "Live tracking active" : "Protect your journey"}</div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
               {isSafetyModeActive && <span className="pulse-glow" style={{ width: 8, height: 8, background: '#EF4444', borderRadius: '50%' }} />}
               <span style={{ color: "#aaa", fontSize: 11 }}>›</span>
            </div>
          </div>
          
          <div className="tap-effect" style={{ background: "#1a1a2e", borderRadius: 14, padding: "12px", marginBottom: 10 }}>
            <div style={{ fontSize: 8, color: "#F59E0B", letterSpacing: 1, fontWeight: 600 }}>🛡 GENIE PRO STATUS</div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 5 }}>
              <div>
                <div style={{ fontSize: 16, fontWeight: 800, color: "#fff" }}>Bronze L1</div>
                <div style={{ fontSize: 10, color: "#aaa", marginTop: 2 }}>0 / 20 jobs completed</div>
              </div>
              <div style={{ width: 42, height: 42, borderRadius: "50%", border: "3px solid #92400e", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ color: "#F59E0B", fontWeight: 700, fontSize: 11 }}>0%</span>
              </div>
            </div>
            <div style={{ marginTop: 7, height: 3, background: "#2a2a4a", borderRadius: 4 }}>
              <div style={{ width: "2%", height: "100%", background: "#5B3FC8", borderRadius: 4 }} />
            </div>
          </div>
          

          <div style={{ padding: "20px", textAlign: "center", color: "#888", fontSize: 13 }}>
            No top matches available yet. Start searching to see recommendations!
          </div>
        </div>
      )}
      
      <NavBar active="Home" setActive={setActive} />
      
      {/* Floating Genie AI shortcut */}
      <div 
        onClick={() => setActive('Genie AI')}
        className="tap-effect"
        style={{ position: 'absolute', right: 20, bottom: 85, width: 56, height: 56, borderRadius: '50%', background: 'linear-gradient(135deg, #5B3FC8, #7B5FE8)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, boxShadow: '0 8px 25px rgba(91,63,200,0.4)', cursor: 'pointer', zIndex: 100 }}>
        ✨
      </div>
    </div>
  );
};

export default HomeScreen;
