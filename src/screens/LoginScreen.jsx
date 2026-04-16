import React, { useState } from 'react';
import { AuthService } from '../services/authService';
import Galaxy from '../components/Galaxy';

const LoginScreen = ({ onLogin }) => {
  const [role, setRole] = useState('worker');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [verificationId, setVerificationId] = useState(null);
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  const handleGoogleLogin = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const user = await AuthService.signInWithGoogle();
      if (user) {
        setShowSuccess(true);
        setTimeout(() => {
          onLogin(role, user);
        }, 1200);
      }
    } catch (err) {
      setErrorMessage("Google Login Failed: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSendOTP = async () => {
    if (!phoneNumber) return alert("Please enter a valid mobile number");
    setLoading(true);
    setErrorMessage(null);
    try {
      const fullNumber = phoneNumber.startsWith('+') ? phoneNumber : `+91${phoneNumber}`;
      const vId = await AuthService.signInWithPhone(fullNumber);
      setVerificationId(vId);
      setIsCodeSent(true);
    } catch (err) {
      setErrorMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!verificationCode) return alert("Please enter the verification code");
    setLoading(true);
    setErrorMessage(null);
    try {
      const user = await AuthService.confirmVerificationCode(verificationId, verificationCode);
      if (user) {
        setShowSuccess(true);
        setTimeout(() => {
          onLogin(role, user);
        }, 1200);
      }
    } catch (err) {
      setErrorMessage("Invalid Code: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fade-in" style={{ height: "100%", background: "#fff", display: "flex", flexDirection: "column", position: "relative", overflow: "hidden" }}>
      {/* Background Galaxy */}
      <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "600px", background: "#0c021a", zIndex: 0 }}>
        <Galaxy
          density={1.5}
          glowIntensity={0.5}
          twinkleIntensity={0.4}
          speed={1.0}
          mouseInteraction={true}
        />
      </div>

      {/* Content Container */}
      <div style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", height: "100%" }}>
        {/* Header/Logo */}
        <div style={{ padding: "28px 20px 0" }}>
          <div style={{ width: 48, height: 48, borderRadius: 14, background: "linear-gradient(135deg,#5BC8FA,#3B82F6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>⚡</div>
        </div>

        {/* Hero Text */}
        <div style={{ padding: "24px 20px 0" }}>
          <div style={{ fontSize: 32, fontWeight: 800, color: "#fff", lineHeight: 1.1, letterSpacing: "-0.5px" }}>The Future<br />of Work.</div>
          <div style={{ fontSize: 13, color: "rgba(255,255,255,0.7)", marginTop: 12, lineHeight: 1.6, fontWeight: 500 }}>Connecting India's top talent<br />with enterprise-grade opportunities.</div>
        </div>

        <div style={{ flex: 1 }} />

        {/* Login Card */}
        <div style={{ background: "#fff", borderRadius: "28px 28px 0 0", padding: "24px 20px 60px", boxShadow: "0 -10px 25px rgba(0,0,0,0.1)" }}>
          {errorMessage && (
            <div style={{ background: "#FEE2E2", border: "1px solid #FCA5A5", color: "#B91C1C", padding: "12px", borderRadius: 12, fontSize: 11, marginBottom: 16, lineHeight: 1.4 }}>
              <strong>Configuration Error:</strong><br/>
              {errorMessage}
            </div>
          )}

          <div style={{ fontSize: 20, fontWeight: 800, color: "#111" }}>Welcome Back</div>
          <div style={{ fontSize: 12, color: "#888", marginTop: 4 }}>Select your account type to continue.</div>
          
          <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
            <div 
              onClick={() => setRole('worker')}
              style={{ flex: 1, border: role === 'worker' ? "2px solid #5B3FC8" : "1.5px solid #eee", background: role === 'worker' ? "#F5F3FF" : "#fff", borderRadius: 14, padding: "11px 0", textAlign: "center", fontWeight: 700, color: role === 'worker' ? "#5B3FC8" : "#bbb", fontSize: 12, display: "flex", alignItems: "center", justifyContent: "center", gap: 5, cursor: "pointer" }}
            >
              👤 WORKER
            </div>
            <div 
              onClick={() => setRole('admin')}
              style={{ flex: 1, border: role === 'admin' ? "2px solid #5B3FC8" : "1.5px solid #eee", background: role === 'admin' ? "#F5F3FF" : "#fff", borderRadius: 14, padding: "11px 0", textAlign: "center", fontWeight: 700, color: role === 'admin' ? "#5B3FC8" : "#bbb", fontSize: 12, display: "flex", alignItems: "center", justifyContent: "center", gap: 5, cursor: "pointer" }}
            >
              💼 COMPANY
            </div>
          </div>

          <div 
            onClick={loading ? null : handleGoogleLogin}
            style={{ marginTop: 12, border: "1.5px solid #ddd", borderRadius: 14, padding: "12px 0", textAlign: "center", fontWeight: 700, fontSize: 13, color: "#111", cursor: "pointer", opacity: loading ? 0.6 : 1 }}
          >
            {loading ? "Processing..." : "Continue with Google"}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "12px 0" }}>
            <div style={{ flex: 1, height: 1, background: "#eee" }} />
            <span style={{ color: "#bbb", fontSize: 11 }}>OR</span>
            <div style={{ flex: 1, height: 1, background: "#eee" }} />
          </div>

          {!isCodeSent ? (
            <>
              <div style={{ background: "#F5F5F5", borderRadius: 12, padding: "4px 14px", display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 18 }}>📞</span>
                <input 
                  type="tel"
                  placeholder="Enter Mobile Number"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  style={{ border: "none", background: "transparent", outline: "none", width: "100%", padding: "12px 0", fontSize: 13, color: "#111" }}
                />
              </div>
              <div 
                onClick={loading ? null : handleSendOTP}
                style={{ marginTop: 10, background: "#1A1A3E", borderRadius: 14, padding: "14px 0", textAlign: "center", fontWeight: 700, fontSize: 14, color: "#fff", cursor: "pointer", opacity: loading ? 0.6 : 1 }}
              >
                {loading ? "Sending..." : "Send OTP"}
              </div>
            </>
          ) : (
            <>
              <div style={{ background: "#F5F3FF", border: "1.5px solid #5B3FC8", borderRadius: 12, padding: "4px 14px", display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 18 }}>🔑</span>
                <input 
                  type="number"
                  placeholder="Enter Verification Code"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  style={{ border: "none", background: "transparent", outline: "none", width: "100%", padding: "12px 0", fontSize: 13, color: "#111" }}
                />
              </div>
              <div 
                onClick={loading ? null : handleVerifyOTP}
                style={{ marginTop: 10, background: "#5B3FC8", borderRadius: 14, padding: "14px 0", textAlign: "center", fontWeight: 700, fontSize: 14, color: "#fff", cursor: "pointer", opacity: loading ? 0.6 : 1 }}
              >
                {loading ? "Verifying..." : "Verify & Login"}
              </div>
              <div 
                onClick={() => setIsCodeSent(false)}
                style={{ textAlign: "center", fontSize: 11, color: "#5B3FC8", fontWeight: 700, marginTop: 12, cursor: "pointer" }}
              >
                 Change Phone Number?
              </div>
            </>
          )}
        </div>
      </div>
      
      {/* Success Overlay */}
      {showSuccess && (
        <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(255,255,255,0.95)", zIndex: 100, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
          <div className="success-checkmark">
            <span style={{ fontSize: 32 }}>✅</span>
          </div>
          <div style={{ marginTop: 20, fontWeight: 800, fontSize: 18, color: "#111" }}>Login Successful!</div>
          <div style={{ marginTop: 5, color: "#888", fontSize: 13 }}>Welcome to JobGenie</div>
        </div>
      )}
    </div>
  );
};

export default LoginScreen;
