import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const MeetMyguymars = () => {
  const { isAuthenticated, logout } = useAuth();

  return (
    <div>
      {/* Hero Section with Navigation */}
      <header className="hero">
        <div className="container">
          <div className="nav">
            <Link to="/">
              <h1 className="logo"><img src="/img/logo.png" alt="OPENBEAT" /></h1>
            </Link>
            <div className="nav-buttons">
              {!isAuthenticated ? (
                <>
                  <Link to="/login" className="btn-fill btn-sign">Sign In</Link>
                  <Link to="/register" className="btn-outline btn-sign">Sign Up</Link>
                </>
              ) : (
                <>
                  <Link to="/profile" className="btn-fill btn-sign">My Profile</Link>
                  <Link to="#" onClick={(e) => { e.preventDefault(); logout(); }} className="btn-fill btn-sign">Logout</Link>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Meet MyGuyMars Section */}
      <section className="section-padding" style={{ background: '#0f111a', minHeight: 'calc(100vh - 200px)', paddingTop: '4rem', paddingBottom: '4rem' }}>
        <div className="container">
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h1 className="section-title" style={{ fontSize: '2.5rem', fontWeight: 700, marginBottom: '0.5rem', color: '#fff', textTransform: 'uppercase', letterSpacing: '2px' }}>
              MEET MYGUYMARS
            </h1>
            <p style={{ color: '#9aa0b4', fontSize: '1.1rem', marginTop: '0.5rem' }}>
              Musician | Producer | Artist
            </p>
          </div>

          {/* Content Section - 2 Column Layout */}
          <div 
            className="content-wrapper"
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 2fr',
              gap: '0.5rem',
              marginTop: '2rem',
              alignItems: 'start'
            }}
          >
            {/* Left Side - Image (4 columns equivalent) */}
            <div 
              className="image-section"
              style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center'
              }}
            >
              <div
                style={{
                  width: '100%',
                  maxWidth: '400px',
                  overflow: 'hidden',
                  boxShadow: '0 8px 16px rgba(0, 0, 0, 0.4)'
                }}
              >
                <img
                  src="/img/myguymars.png"
                  alt="MyGuyMars"
                  style={{
                    width: '100%',
                    height: 'auto',
                    display: 'block',
                    objectFit: 'cover'
                  }}
                />
              </div>
            </div>

            {/* Right Side - Text Content (8 columns equivalent) */}
            <div 
              className="text-section"
              style={{
                textAlign: 'left',
                background: '#181c2a',
                padding: '12px',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)'
              }}
            >
              <h2 style={{ fontSize: '1.8rem', fontWeight: 700, marginBottom: '0.5rem', color: '#fff' }}>
                Meet MyGuyMars
              </h2>
              <p style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1.5rem', color: '#a78bfa' }}>
                Creative Director of OpenBeat.AI
              </p>
              
              <div style={{ color: '#c3c7d1', lineHeight: '1.8', fontSize: '1rem' }}>
                <p style={{ marginBottom: '1.5rem' }}>
                  OpenBeat.AI proudly welcomes <strong style={{ color: '#fff' }}>Lamar "MyGuyMars" Edwards</strong> as our Creative Director — bringing his Grammy-winning musicianship, industry-defining sound, and visionary creativity directly into the heart of our next-generation music AI platform.
                </p>
                
                <p style={{ marginBottom: '1.5rem' }}>
                  As a founding member of <strong style={{ color: '#fff' }}>1500 or Nothin'</strong>, MyGuyMars has shaped the sound of modern music, producing and composing for legends such as <strong style={{ color: '#fff' }}>Nipsey Hussle</strong>, <strong style={{ color: '#fff' }}>Jay-Z</strong>, <strong style={{ color: '#fff' }}>Snoop Dogg</strong>, <strong style={{ color: '#fff' }}>T.I.</strong>, <strong style={{ color: '#fff' }}>Brandy</strong>, <strong style={{ color: '#fff' }}>Rick Ross</strong>, and many more. His musical DNA spans hip-hop, R&B, soul, gospel, and cinematic composition — making him one of the most versatile producers of our time.
                </p>
                
                <p style={{ marginBottom: '1.5rem' }}>
                  Now, he's bringing that same creative excellence to OpenBeat.AI.
                </p>
                
                <p style={{ marginBottom: '1rem', fontWeight: 600, color: '#fff' }}>
                  In his role as Creative Director, MyGuyMars will:
                </p>
                
                <ul style={{ marginBottom: '1.5rem', paddingLeft: '1.5rem', listStyleType: 'disc' }}>
                  <li style={{ marginBottom: '0.75rem' }}>Guide the artistic direction of OpenBeat's AI model</li>
                  <li style={{ marginBottom: '0.75rem' }}>Train the next wave of AI-enhanced musical intelligence using his original sounds, chords, and copyrighted songs</li>
                  <li style={{ marginBottom: '0.75rem' }}>Lead creator partnerships and talent recruitment</li>
                  <li style={{ marginBottom: '0.75rem' }}>Shape the brand voice and cultural identity of OpenBeat</li>
                  <li style={{ marginBottom: '0.75rem' }}>Produce exclusive content showcasing how humans and AI can create together</li>
                </ul>
                
                <p style={{ marginBottom: '1.5rem' }}>
                  This partnership marks a powerful step toward a future where AI supports creativity — not replaces it.
                </p>
                
                <p style={{ marginBottom: '1.5rem' }}>
                  With Mars at the helm, OpenBeat.AI is building tools rooted in authenticity, soul, and real musicianship.
                </p>
                
                <p style={{ marginBottom: '1rem', fontStyle: 'italic', color: '#a78bfa' }}>
                  Welcome to the future of human-powered AI music.
                </p>
                
                <p style={{ fontWeight: 600, color: '#fff' }}>
                  Meet MyGuyMars — and meet the new era of OpenBeat.AI.
                </p>
              </div>
            </div>
          </div>

          {/* Return to Home Button */}
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: '3rem' }}>
            <Link
              to="/"
              className="btn-gradient"
              style={{
                textDecoration: 'none',
                padding: '0.75rem 1.5rem',
                borderRadius: '8px',
                color: '#fff',
                fontWeight: 600,
                letterSpacing: '0.5px'
              }}
            >
              Return to Home
            </Link>
          </div>
        </div>
      </section>

      {/* Responsive CSS */}
      <style>{`
        @media (max-width: 768px) {
          .content-wrapper {
            grid-template-columns: 1fr !important;
            gap: 2rem !important;
          }
          
          .text-section {
            padding: 1.5rem !important;
          }
        }
        
        @media (min-width: 769px) and (max-width: 1024px) {
          .content-wrapper {
            grid-template-columns: 1fr 1.5fr !important;
            gap: 2rem !important;
          }
        }
      `}</style>
    </div>
  );
};

export default MeetMyguymars;

