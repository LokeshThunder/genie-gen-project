import React from 'react';

const BenefitsScreen = ({ setActive }) => {
  return (
    <div className="fade-in" style={{ height: "100%", background: "#F2F4F8", fontFamily: "'Sora', sans-serif", display: "flex", justifyContent: "center", overflow: "hidden" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&display=swap'); * { box-sizing: border-box; margin: 0; padding: 0; }`}</style>
      <div style={{ width: "100%", maxWidth: 420, background: "#F2F4F8", height: "100%", display: "flex", flexDirection: "column" }}>

        {/* Header */}
        <div style={{ padding: "20px 20px 12px", display: "flex", alignItems: "center", justifyContent: "center", position: "relative", flexShrink: 0 }}>
          <span 
            onClick={() => setActive("Home")}
            className="tap-effect"
            style={{ position: "absolute", left: 20, fontSize: 24, color: "#1a1a4e", fontWeight: 700, cursor: "pointer" }}
          >
            ‹
          </span>
          <span style={{ fontWeight: 800, fontSize: 18, color: "#1a1a4e" }}>Genie Benefits</span>
        </div>

        <div className="full-height-scroll" style={{ padding: "8px 20px 32px", overflowY: "auto" }}>
          {/* Hero */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: "#3B7FE0", letterSpacing: 1.5, marginBottom: 8 }}>YOUR WELLNESS</div>
            <div style={{ fontSize: 28, fontWeight: 800, color: "#1a1a4e", lineHeight: 1.25 }}>Protection for every<br />step you take.</div>
          </div>

          {/* Member Status */}
          <div style={{ background: "#5B3FC8", borderRadius: 20, padding: "18px 20px", display: "flex", alignItems: "center", gap: 16, marginBottom: 24 }}>
            <div style={{ width: 52, height: 52, background: "rgba(255,255,255,0.15)", borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <span style={{ fontSize: 22 }}>⭐</span>
            </div>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.65)", letterSpacing: 1.2, marginBottom: 3 }}>MEMBER STATUS</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: "#fff" }}>Starter Member</div>
            </div>
          </div>

          {/* Card: Accidental Work Cover */}
          <div style={{ background: "#fff", borderRadius: 20, padding: "20px", marginBottom: 16, boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 14 }}>
              <div style={{ width: 46, height: 46, background: "#FFF3E0", borderRadius: 13, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>🛡️</div>
              <div style={{ background: "#FFF3E0", borderRadius: 20, padding: "5px 12px", fontSize: 10, fontWeight: 800, color: "#F59E0B", letterSpacing: 1 }}>COMING SOON</div>
            </div>
            <div style={{ fontSize: 20, fontWeight: 800, color: "#1a1a4e", marginBottom: 4 }}>Accidental Work Cover</div>
            <div style={{ fontSize: 13, color: "#999", marginBottom: 10 }}>via Job Genie Protection</div>
            <div style={{ fontSize: 14, color: "#888", lineHeight: 1.6, marginBottom: 16 }}>Our new accidental coverage plan is arriving soon to provide you with peace of mind.</div>
            {["₹1,00,000 Coverage", "Active during work hours", "Accident & Injury Cover"].map(f => (
              <div key={f} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                <span style={{ color: "#F59E0B", fontSize: 15 }}>✓</span>
                <span style={{ fontWeight: 700, fontSize: 14, color: "#1a1a4e" }}>{f}</span>
              </div>
            ))}
            <div className="tap-effect" style={{ marginTop: 18, background: "#F59E0B", borderRadius: 14, padding: "14px 0", textAlign: "center", fontWeight: 800, fontSize: 13, color: "#fff", letterSpacing: 1.2, cursor: "pointer" }}>
              VIEW GUIDELINES
            </div>
          </div>

          {/* Card: Healthcare Plan */}
          <div style={{ background: "#fff", borderRadius: 20, padding: "20px", marginBottom: 16, boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 14 }}>
              <div style={{ width: 46, height: 46, background: "#EEF4FF", borderRadius: 13, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>🏥</div>
              <div className="tap-effect" style={{ background: "#EEF4FF", borderRadius: 20, padding: "5px 12px", fontSize: 10, fontWeight: 800, color: "#3B7FE0", letterSpacing: 1, cursor: "pointer" }}>ENROLL NOW</div>
            </div>
            <div style={{ fontSize: 20, fontWeight: 800, color: "#1a1a4e", marginBottom: 4 }}>Healthcare Plan</div>
            <div style={{ fontSize: 13, color: "#999", marginBottom: 10 }}>via GenieCare (Digit Insurance)</div>
            <div style={{ fontSize: 14, color: "#888", lineHeight: 1.6, marginBottom: 16 }}>Special affordable health insurance for you and your family.</div>
            {["Family Floater Option", "Cashless Hospitalization", "OPD Discounts"].map(f => (
              <div key={f} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                <span style={{ width: 20, height: 20, background: "#EEF4FF", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, color: "#3B7FE0", flexShrink: 0 }}>✓</span>
                <span style={{ fontWeight: 700, fontSize: 14, color: "#1a1a4e" }}>{f}</span>
              </div>
            ))}
            <div className="tap-effect" style={{ marginTop: 18, border: "2px solid #E0E0E0", borderRadius: 14, padding: "14px 0", textAlign: "center", fontWeight: 800, fontSize: 13, color: "#1a1a4e", letterSpacing: 1.2, cursor: "pointer" }}>
              EXPLORE PLANS
            </div>
          </div>

          {/* Wellness Portal */}
          <div className="tap-effect" style={{ background: "#EEF8F2", borderRadius: 18, padding: "16px 18px", display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 13 }}>
              <span style={{ fontSize: 22 }}>🌿</span>
              <span style={{ fontWeight: 800, fontSize: 16, color: "#1a1a4e" }}>Wellness Portal</span>
            </div>
            <span style={{ color: "#3B7FE0", fontSize: 18, fontWeight: 700 }}>›</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BenefitsScreen;
