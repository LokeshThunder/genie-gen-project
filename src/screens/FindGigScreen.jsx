import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import NavBar from '../components/NavBar';
import { JobService } from '../services/jobService';

const FindGigScreen = ({ setActive, initialSearch = "", jobs = [], applications = [] }) => {
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [appliedJobs, setAppliedJobs] = useState([]);
  const [activePanel, setActivePanel] = useState(null); // 'map', 'voice', 'settings'
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [isListening, setIsListening] = useState(false);
  useEffect(() => {
    setAppliedJobs((applications || []).map(a => a.jobId));
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, [applications]);

  const handleVoiceSearch = () => {
    setIsListening(true);
    setTimeout(() => {
      setIsListening(false);
      setSearchQuery("Warehouse Packer");
      setActivePanel(null);
    }, 2000);
  };

  const categories = ["All", "Delivery", "Security", "Warehousing", "Retail", "Logistics"];


  const renderSkeleton = () => (
    <div className="full-height-scroll" style={{ padding: "6px 14px 8px" }}>
        {[1, 2, 3].map(i => (
            <div key={i} className="skeleton" style={{ height: 180, borderRadius: 24, marginBottom: 12 }} />
        ))}
    </div>
  );

  return (
    <div className="fade-in" style={{ height: "100%", background: "#F5F7FF", display: "flex", flexDirection: "column", position: 'relative', overflow: 'hidden' }}>
      
      {/* Search Header Container */}
      <div style={{ padding: "14px 14px 8px", flexShrink: 0, background: "#F5F7FF" }}>
        <h2 style={{ fontSize: 24, fontWeight: 900, color: '#111', marginBottom: 16, letterSpacing: -0.5 }}>Find Your Next Gig</h2>
        
        {/* Advanced Search Row */}
        <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
          <div style={{ 
            flex: 1, 
            background: "#fff", 
            borderRadius: 20, 
            padding: "12px 16px", 
            display: "flex", 
            alignItems: "center", 
            gap: 10, 
            fontSize: 14, 
            color: "#64748B",
            boxShadow: '0 2px 10px rgba(0,0,0,0.02)',
            border: '1.5px solid #F1F5F9'
          }}>
            <span>🔍</span>
            <input 
              type="text" 
              placeholder="Search..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', fontSize: 13, fontWeight: 500 }}
            />
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            {[ 
              { icon: "🗺️", label: "map" }, 
              { icon: "🎤", label: "voice" }, 
              { icon: "⚙️", label: "settings" } 
            ].map(item => (
              <div 
                key={item.label}
                onClick={() => setActivePanel(activePanel === item.label ? null : item.label)}
                className="tap-effect" 
                style={{ 
                  width: 44, 
                  height: 44, 
                  background: activePanel === item.label ? "#5B3FC8" : "#fff", 
                  color: activePanel === item.label ? "#fff" : "#111",
                  borderRadius: '50%', 
                  display: "flex", 
                  alignItems: "center", 
                  justifyContent: "center", 
                  fontSize: 18,
                  boxShadow: '0 2px 10px rgba(0,0,0,0.02)',
                  border: '1.5px solid #F1F5F9',
                  transition: '0.3s'
                }}>
                {item.icon}
              </div>
            ))}
          </div>
        </div>

        {/* Categories Horizontal Scroll */}
        <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 6, marginBottom: 16, scrollbarWidth: 'none' }}>
           <style>{`.no-scrollbar::-webkit-scrollbar { display: none; }`}</style>
          {categories.map((c) => (
            <div 
              key={c} 
              onClick={() => setSelectedCategory(c)}
              className="tap-effect" 
              style={{ 
                flexShrink: 0, 
                background: selectedCategory === c ? "#5B3FC8" : "#fff", 
                color: selectedCategory === c ? "#fff" : "#475569", 
                borderRadius: 22, 
                padding: "10px 20px", 
                fontWeight: 700, 
                fontSize: 13, 
                border: selectedCategory === c ? "none" : "1.5px solid #E2E8F0",
                transition: '0.2s all'
              }}>
              {c}
            </div>
          ))}
        </div>
      </div>
      
      {/* Main Content Area */}
      <div style={{ flex: 1, position: 'relative', display: 'flex', flexDirection: 'column', minHeight: 0 }}>
        {activePanel === 'map' ? (
          <div className="fade-in" style={{ height: '100%', background: '#E2E8F0', position: 'relative' }}>
             {/* Mock Map View */}
             <div style={{ width: '100%', height: '100%', background: 'url(https://maps.googleapis.com/maps/api/staticmap?center=12.9647,80.1911&zoom=14&size=600x600&scale=2) center/cover' }}>
               {jobs.map((j, i) => (
                 <div key={i} style={{ position: 'absolute', top: `${40 + (i*15)}%`, left: `${40 + (i*10)}%`, background: '#5B3FC8', color: '#fff', padding: '6px 12px', borderRadius: 20, fontSize: 10, fontWeight: 800, boxShadow: '0 4px 10px rgba(0,0,0,0.2)' }}>
                    {j.pay}
                 </div>
               ))}
             </div>
             <div 
               onClick={() => setActivePanel(null)}
               style={{ position: 'absolute', bottom: 100, left: '50%', transform: 'translateX(-50%)', background: '#fff', padding: '12px 24px', borderRadius: 30, fontWeight: 800, fontSize: 12, boxShadow: '0 10px 25px rgba(0,0,0,0.1)', cursor: 'pointer' }}>
               BACK TO LIST
             </div>
          </div>
        ) : (
          loading ? renderSkeleton() : (
            <div className="full-height-scroll" style={{ padding: "6px 16px 120px", overflowY: 'auto', WebkitOverflowScrolling: 'touch', flex: 1, minHeight: 0 }}>
                {(jobs || []).filter(j => (j.title || '').toLowerCase().includes(searchQuery.toLowerCase())).map((job) => {
                  const isApplied = (appliedJobs || []).includes(job.id);
                  const displayPay = job.pay || `₹${job.wage}`;
                  const displayPayFreq = job.payFreq || `PER ${job.pricingModel?.toUpperCase() || 'DAY'}`;
                  const displayLoc = job.loc || job.locationName;
                  const displayTime = job.time || `${job.startTime} - ${job.endTime}`;
                  const displayShift = job.shift || (job.startTime > '17:00' ? 'NIGHT' : 'DAY');
                  const displayColor = job.color || (job.category === 'Security' ? '#1E293B' : job.category === 'Delivery' ? '#F59E0B' : '#E11D48');
                  const displayCompany = job.company || job.companyName || 'JobGenie Partner';

                  return (
                  <div key={job.id} style={{ 
                    background: "#fff", 
                    borderRadius: 24, 
                    padding: "20px", 
                    marginBottom: 16,
                    boxShadow: '0 10px 30px rgba(0,0,0,0.03)',
                    border: '1.5px solid #F1F5F9'
                  }}>
                      {/* Badge Row */}
                      <div style={{ display: "flex", gap: 8, marginBottom: 16, alignItems: "center" }}>
                        {(job.perfectMatch || job.wage > 900) && (
                          <div style={{ background: "#ECFDF5", border: "1.5px solid #6EE7B7", borderRadius: 20, padding: "5px 12px", fontSize: 10, fontWeight: 900, color: "#059669", letterSpacing: 0.5 }}>✨ PERFECT MATCH!</div>
                        )}
                        {job.urgent && (
                          <div style={{ background: "#FFF7ED", border: "1.5px solid #FDBA74", borderRadius: 20, padding: "5px 12px", fontSize: 10, fontWeight: 900, color: "#C2410C", letterSpacing: 0.5 }}>⚡ URGENT</div>
                        )}
                        <span style={{ color: "#22c55e", fontWeight: 900, fontSize: 13, marginLeft: "auto" }}>{job.match || '95%'}</span>
                      </div>
    
                      {/* Info Row */}
                      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                        <div style={{ width: 44, height: 44, borderRadius: "50%", background: displayColor, display: "flex", alignItems: 'center', justifyContent: 'center', fontWeight: 900, color: "#fff", fontSize: 18, boxShadow: `0 4px 12px ${displayColor}44` }}>
                            {displayCompany.charAt(0)}
                        </div>
                        <div>
                            <div style={{ fontWeight: 900, fontSize: 16, color: '#0F172A' }}>{job.title}</div>
                            <div style={{ fontSize: 11, color: "#6366F1", fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0.5 }}>{displayCompany}</div>
                        </div>
                      </div>
    
                      {/* Location & Pay Details */}
                      <div style={{ display: "grid", gridTemplateColumns: '1.2fr 1.8fr', gap: 16, marginBottom: 16, background: '#F8FAFC', padding: '12px', borderRadius: 16 }}>
                        <div>
                            <div style={{ fontSize: 18, fontWeight: 900, color: "#0F172A" }}>{displayPay}</div>
                            <div style={{ fontSize: 9, color: "#64748B", fontWeight: 800, letterSpacing: 1 }}>{displayPayFreq}</div>
                        </div>
                        <div>
                            <div style={{ fontWeight: 800, fontSize: 13, color: '#0F172A' }}>📍 {displayLoc}</div>
                            <div style={{ fontSize: 9, color: "#64748B", fontWeight: 800, letterSpacing: 1 }}>{job.distance || 'Near you'}</div>
                        </div>
                      </div>
    
                      {/* Timing Row */}
                      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
                        <div style={{ background: "#F1F5F9", borderRadius: 12, padding: "8px 14px", fontSize: 11, fontWeight: 700, color: '#334155', display: 'flex', alignItems: 'center', gap: 6 }}>
                            🕒 {displayTime}
                        </div>
                        <div style={{ background: "#F1F5F9", borderRadius: 12, padding: "8px 14px", fontSize: 11, fontWeight: 700, color: '#334155', display: 'flex', alignItems: 'center', gap: 6 }}>
                            {displayShift === "NIGHT" ? "🌙" : "☀️"} {displayShift}
                        </div>
                      </div>
    
                      {/* Apply Button */}
                      <div 
                        onClick={() => !isApplied && setActive('Job Details', job)}
                        className="tap-effect" 
                        style={{ 
                          background: isApplied ? "#E2E8F0" : "#1E1B4B", 
                          borderRadius: 16, 
                          padding: "16px 0", 
                          textAlign: "center", 
                          fontWeight: 900, 
                          fontSize: 13, 
                          color: isApplied ? "#64748B" : "#fff", 
                          letterSpacing: 1.5, 
                          cursor: isApplied ? "default" : "pointer",
                          boxShadow: isApplied ? 'none' : '0 8px 20px rgba(30,27,75,0.2)',
                          border: isApplied ? '1.5px solid #CBD5E1' : 'none'
                        }}>
                        {isApplied ? "✅ APPLIED" : "⚡ APPLY FOR ROLE"}
                      </div>
                  </div>
                  );
                })}
            </div>
          )
        )}
      </div>

      {/* Voice Search Overlay */}
      <AnimatePresence>
        {activePanel === 'voice' && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ position: 'absolute', inset: 0, background: 'rgba(91, 63, 200, 0.95)', zIndex: 2000, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 40, textAlign: 'center' }}>
            <div 
              onClick={() => setActivePanel(null)}
              style={{ position: 'absolute', top: 30, right: 30, fontSize: 24, color: '#fff', cursor: 'pointer' }}>✕</div>
            
            <div style={{ fontSize: 80, marginBottom: 30 }}>{isListening ? "🎙️" : "✨"}</div>
            <h3 style={{ fontSize: 32, fontWeight: 900, color: '#fff', marginBottom: 10 }}>{isListening ? "Listening..." : "I heard you!"}</h3>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 18, fontWeight: 600 }}>{isListening ? "Try saying 'Find me a packing job near me'" : "'Warehouse Packer in Madipakkam'"}</p>
            
            {!isListening && (
              <div 
                onClick={handleVoiceSearch}
                style={{ marginTop: 40, background: '#fff', color: '#5B3FC8', padding: '16px 40px', borderRadius: 30, fontWeight: 900, fontSize: 16, cursor: 'pointer' }}>
                START LISTENING
              </div>
            )}
            
            {isListening && (
               <div style={{ width: 100, height: 100, borderRadius: '50%', border: '4px solid #fff', borderTopColor: 'transparent', animation: 'spin 1s linear infinite', marginTop: 30 }} />
            )}
            <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Settings / Filter Panel Overlay */}
      <AnimatePresence>
        {activePanel === 'settings' && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActivePanel(null)}
              style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 1500 }}
            />
            <motion.div 
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              style={{ position: 'absolute', left: 0, right: 0, bottom: 0, background: '#fff', borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: '30px 24px 80px', zIndex: 1600, boxShadow: '0 -10px 40px rgba(0,0,0,0.1)' }}>
              <div style={{ width: 40, height: 4, background: '#E2E8F0', borderRadius: 10, margin: '0 auto 24px' }} />
              <h3 style={{ fontSize: 24, fontWeight: 900, color: '#0F172A', marginBottom: 24 }}>Advanced Filters</h3>
              
              <div style={{ marginBottom: 24 }}>
                 <label style={{ fontSize: 13, fontWeight: 800, color: '#64748B', display: 'block', marginBottom: 12 }}>WAGE RANGE (DAILY)</label>
                 <div style={{ display: 'flex', gap: 12 }}>
                    {['₹300+', '₹500+', '₹700+', '₹1000+'].map(w => (
                      <div key={w} style={{ flex: 1, padding: '10px', borderRadius: 14, background: '#F8FAFC', border: '1.5px solid #E2E8F0', textAlign: 'center', fontSize: 13, fontWeight: 700, color: '#475569' }}>{w}</div>
                    ))}
                 </div>
              </div>

              <div style={{ marginBottom: 32 }}>
                 <label style={{ fontSize: 13, fontWeight: 800, color: '#64748B', display: 'block', marginBottom: 12 }}>MAX DISTANCE (KM)</label>
                 <div style={{ height: 6, background: '#F1F5F9', borderRadius: 10, position: 'relative' }}>
                    <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '60%', background: '#5B3FC8', borderRadius: 10 }} />
                    <div style={{ position: 'absolute', left: '60%', top: '50%', transform: 'translate(-50%, -50%)', width: 24, height: 24, background: '#fff', border: '4px solid #5B3FC8', borderRadius: '50%', boxShadow: '0 4px 10px rgba(91, 63, 200, 0.3)' }} />
                 </div>
                 <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 12, fontSize: 12, fontWeight: 700, color: '#94A3B8' }}>
                    <span>0 KM</span>
                    <span style={{ color: '#5B3FC8' }}>12 KM</span>
                    <span>25 KM</span>
                 </div>
              </div>

              <div 
                onClick={() => setActivePanel(null)}
                className="tap-effect"
                style={{ background: '#1E1B4B', padding: '18px', borderRadius: 20, textAlign: 'center', color: '#fff', fontWeight: 900, fontSize: 15, letterSpacing: 1, cursor: 'pointer' }}>
                APPLY FILTERS
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
      
      <NavBar active="Find Job" setActive={setActive} />
    </div>
  );
};

export default FindGigScreen;
