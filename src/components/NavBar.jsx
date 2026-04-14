import React from 'react';

const NavBar = ({ active, setActive, isAdmin }) => {
  const navItems = isAdmin 
    ? [
        { label: "Home", icon: "🏠" },
        { label: "Live", icon: "🛰️" },
        { label: "Genie Ops", icon: "✨" },
        { label: "Reports", icon: "📊" },
        { label: "Profile", icon: "👤" }
      ]
    : [
        { label: "Home", icon: "🏠" },
        { label: "Find Job", icon: "🔍" },
        { label: "Genie AI", icon: "✨" },
        { label: "Profile", icon: "👤" }
      ];

  return (
    <div style={{ 
      position: "fixed",
      bottom: 25,
      left: 15,
      right: 15,
      borderRadius: 24,
      background: "rgba(255, 255, 255, 0.95)",
      backdropFilter: "blur(20px)",
      WebkitBackdropFilter: "blur(20px)",
      boxShadow: "0 10px 35px rgba(91, 63, 200, 0.2)", 
      border: "1px solid rgba(255, 255, 255, 0.5)",
      padding: "10px 12px", 
      display: "flex", 
      justifyContent: "space-between", 
      alignItems: "center",
      zIndex: 1000,
    }}>
      {navItems.map(({ icon, label }) => (
        <div 
          key={label} 
          onClick={() => setActive(label)}
          className="tap-effect"
          style={active === label
            ? { 
                background: "#5B3FC8", 
                borderRadius: 20, 
                padding: "10px 18px", 
                color: "#fff", 
                fontSize: 11, 
                fontWeight: 800, 
                display: "flex", 
                alignItems: "center", 
                gap: 8, 
                cursor: "pointer", 
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                boxShadow: "0 4px 12px rgba(91, 63, 200, 0.3)"
              }
            : { 
                padding: "10px 18px", 
                color: "#94A3B8", 
                display: "flex", 
                alignItems: "center", 
                cursor: "pointer", 
                fontSize: 20, 
                transition: "all 0.3s ease",
                opacity: 0.8
              }}
        >
          <span style={{ fontSize: active === label ? 14 : 20 }}>{icon}</span>
          {active === label && (
             <span style={{ fontSize: 11, letterSpacing: 0.3 }}>{label}</span>
          )}
        </div>
      ))}
    </div>
  );
};

export default NavBar;
