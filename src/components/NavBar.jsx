import React from 'react';

const NavBar = ({ active, setActive, isAdmin }) => {
  const navItems = isAdmin 
    ? [
        { label: "Home", icon: "🏠" },
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
      padding: "10px 8px", 
      display: "flex", 
      justifyContent: "space-around", 
      alignItems: "center",
      zIndex: 1000,
    }}>
      {navItems.map(({ icon, label }) => {
        const isActive = active === label;
        return (
          <div 
            key={label} 
            onClick={() => setActive(label)}
            className="tap-effect"
            style={{ 
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 4,
              padding: "8px 4px",
              borderRadius: 16,
              background: isActive ? "#5B3FC8" : "transparent",
              cursor: "pointer",
              transition: "background 0.3s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.3s ease",
              boxShadow: isActive ? "0 4px 12px rgba(91, 63, 200, 0.3)" : "none",
            }}
          >
            <span style={{ fontSize: 18, lineHeight: 1 }}>{icon}</span>
            <span style={{ 
              fontSize: 9, 
              fontWeight: isActive ? 800 : 600, 
              color: isActive ? "#fff" : "#94A3B8",
              letterSpacing: 0.3,
              lineHeight: 1,
              whiteSpace: "nowrap",
            }}>
              {label.toUpperCase()}
            </span>
          </div>
        );
      })}
    </div>
  );
};

export default NavBar;
