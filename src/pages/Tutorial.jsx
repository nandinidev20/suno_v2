import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Tutorial = () => {
  const { isAuthenticated, logout } = useAuth();

  // Array of YouTube video IDs - you can replace these with actual video IDs
  const videos = [
    { id: 'SSk3_19VSpU', title: 'OneShot Mode - Creating a OneShot' },
    { id: 'uzaCUQVyowc', title: 'How to Recompose an existing loop' },
    { id: 'JnChJb7snSo', title: 'Get Stems using OpenBeat.AI' },
    { id: 'a4dM1fNr-jM', title: 'Creating A Song - OpenBeat.AI' },
    { id: 'YnMLNX5gkYA', title: 'Transform Voice into an Instrument' },
    { id: 'fK8JZYF-qJ4', title: 'Export Midi - OPENBEAT.AI' },
    { id: 'Ol9ypJaUbg0', title: 'Remix a song - OpenBeat.AI' },
    { id: 'eRL4uVt8e4I', title: 'Lyric Generator - OPENBEAT.AI' },
    { id: 'slbGRDDkwKs', title: 'Add instruments to music - OPENBEAT.AI' },
  ];

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

      {/* Tutorial Section */}
      <section className="section-padding" style={{ background: '#0f111a', minHeight: 'calc(100vh - 200px)', paddingTop: '4rem', paddingBottom: '4rem' }}>
        <div className="container">
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h1 className="section-title" style={{ fontSize: '2.5rem', fontWeight: 700, marginBottom: '1rem', color: '#fff' }}>
              Video Tutorials
            </h1>
            <p style={{ color: '#9aa0b4', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto' }}>
              Learn how to use OpenBeat.AI with our comprehensive video tutorials
            </p>
          </div>

          {/* Video Grid */}
          <div 
            className="video-grid"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '1.2rem',
              marginTop: '2rem'
            }}
          >
            {videos.map((video, index) => (
              <div
                key={index}
                className="video-box"
                style={{
                  background: '#181c2a',
                  borderRadius: '16px',
                  padding: '1rem',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)',
                  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                  overflow: 'hidden'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-5px)';
                  e.currentTarget.style.boxShadow = '0 8px 16px rgba(0, 0, 0, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.3)';
                }}
              >
                <div
                  style={{
                    position: 'relative',
                    width: '100%',
                    paddingBottom: '56.25%', // 16:9 aspect ratio
                    height: 0,
                    overflow: 'hidden',
                    borderRadius: '12px',
                    background: '#0f111a'
                  }}
                >
                  <iframe
                    width="100%"
                    height="100%"
                    src={`https://www.youtube.com/embed/${video.id}?si=r7rXb1fNwH4ndYmJ`}
                    title={`YouTube video player - ${video.title}`}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
                    referrerPolicy="strict-origin-when-cross-origin"
                    allowFullScreen
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      border: 'none'
                    }}
                  ></iframe>
                </div>
                <h3
                  style={{
                    marginTop: '1rem',
                    fontSize: '1.1rem',
                    fontWeight: 600,
                    color: '#fff',
                    textAlign: 'center'
                  }}
                >
                  {video.title}
                </h3>
              </div>
            ))}
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

      {/* Responsive CSS for better mobile experience */}
      <style>{`
        @media (max-width: 768px) {
          .video-grid {
            grid-template-columns: 1fr !important;
            gap: 1.5rem !important;
          }
        }
        
        @media (min-width: 769px) and (max-width: 1024px) {
          .video-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }
        
        @media (min-width: 1025px) {
          .video-grid {
            grid-template-columns: repeat(3, 1fr) !important;
          }
        }
      `}</style>
    </div>
  );
};

export default Tutorial;
