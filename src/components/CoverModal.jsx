import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';

/**
 * CoverModal Component
 * Shows cover progress with audio players for multiple versions (same UI as RemixModal)
 */
const CoverModal = ({ 
  show, 
  onClose, 
  progress, 
  status,
  etaRemaining,
  error,
  coverAudioUrls, // Array of audio URLs
  coverFileNames, // Array of file names
  coverAlbumCovers // Array of album cover URLs
}) => {
  const [playingTracks, setPlayingTracks] = useState({}); // Track which audio is playing: { 0: true, 1: false }
  const [currentTimes, setCurrentTimes] = useState({}); // Track current time for each audio
  const [durations, setDurations] = useState({}); // Track duration for each audio
  const [imageErrors, setImageErrors] = useState({}); // Track image load errors: { 0: true }
  const audioRefs = useRef({}); // Refs for each audio element

  // Initialize audio refs
  useEffect(() => {
    if (coverAudioUrls && coverAudioUrls.length > 0) {
      coverAudioUrls.forEach((_, index) => {
        if (!audioRefs.current[index]) {
          audioRefs.current[index] = React.createRef();
        }
      });
    }
  }, [coverAudioUrls]);

  
  const prevPlayingTracksRef = useRef({});

  // Auto-play/pause when playing state changes
  useEffect(() => {
    if (!coverAudioUrls || coverAudioUrls.length === 0) return;

    // Check if playing state actually changed for any track
    let hasChanged = false;
    const allKeys = new Set([...Object.keys(prevPlayingTracksRef.current), ...Object.keys(playingTracks)]);
    for (const key of allKeys) {
      if (prevPlayingTracksRef.current[key] !== playingTracks[key]) {
        hasChanged = true;
        break;
      }
    }
    if (!hasChanged) return;

    // Update ref
    prevPlayingTracksRef.current = { ...playingTracks };

    coverAudioUrls.forEach((audioUrl, index) => {
      const audio = audioRefs.current[index]?.current;
      if (!audio) return;

      const shouldPlay = playingTracks[index];
      const isCurrentlyPlaying = !audio.paused;

      if (shouldPlay && !isCurrentlyPlaying) {
        // Pause all other tracks before playing this one
        coverAudioUrls.forEach((_, otherIndex) => {
          if (otherIndex !== index && audioRefs.current[otherIndex]?.current) {
            const otherAudio = audioRefs.current[otherIndex].current;
            if (!otherAudio.paused) {
              otherAudio.pause();
            }
          }
        });
        
        // Play current audio
        audio.play().catch(e => {
          console.error('Error playing audio:', e);
          setPlayingTracks(prev => ({
            ...prev,
            [index]: false
          }));
        });
      } else if (!shouldPlay && isCurrentlyPlaying) {
        // Pause audio if not playing
        audio.pause();
      }
    });
  }, [playingTracks, coverAudioUrls]);

  const formatTime = (time) => {
    if (!time || isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const formatETA = (seconds) => {
    if (!seconds || isNaN(seconds)) return '0:00';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const togglePlayPause = (index) => {
    setPlayingTracks(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const handleSeek = (e, index) => {
    const audio = audioRefs.current[index]?.current;
    if (!audio || !durations[index]) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    const newTime = percent * durations[index];
    audio.currentTime = newTime;
    setCurrentTimes(prev => ({
      ...prev,
      [index]: newTime
    }));
  };

  const handleClose = () => {
    // Cleanup - pause all audio
    Object.keys(audioRefs.current).forEach(index => {
      const audio = audioRefs.current[index]?.current;
      if (audio) {
        audio.pause();
      }
    });
    
    setPlayingTracks({});
    setCurrentTimes({});
    setDurations({});
    setImageErrors({});
    onClose();
  };

  if (!show) return null;

  return (
    <>
      {/* CSS for shimmer animation */}
      <style>
        {`
          @keyframes shimmer {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(100%); }
          }
        `}
      </style>
      
      <div className="modal show" style={{ display: 'block', background: 'rgba(0,0,0,0.6)' }} tabIndex={-1}>
        <div className="modal-dialog modal-lg modal-dialog-centered">
          <div className="modal-content bg-dark text-white" style={{ border: '1px solid #2b2b3a', fontFamily: "'Poppins', sans-serif" }}>
            <div className="modal-header" style={{ borderBottom: '1px solid #2b2b3a' }}>
              <div>
                <h5 className="modal-title">
                  {status === 'completed' ? 'Recompose Complete!' : 'Recompose in Progress'}
                </h5>
              </div>
              {status === 'completed' && (
                <button type="button" className="btn-close btn-close-white" onClick={handleClose}></button>
                )}
              </div>

            <div className="modal-body">
              {/* Error message */}
              {error && (
                <div className="alert alert-danger mb-3">
                  <i className="bi bi-exclamation-triangle me-2"></i>
                  {error}
                </div>
              )}

              {/* Processing section */}
              {!error && status !== 'completed' && (
                <div className="mb-4">
                  {/* Status indicator */}
                  <div className="text-center mb-4">
                    <div className="mb-3">
                      <div className="spinner-border text-light" style={{ width: 48, height: 48 }} role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                    </div>
                    <h6 className="mb-2">
                      {status === 'queued' && 'Queued for Processing...'}
                      {status === 'processing' && 'Creating Your Recompose...'}
                      {!status && 'Starting Recompose Generation...'}
                    </h6>
                  </div>

                  {/* Progress bar */}
                  <div className="mb-3">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <div>
                        <div style={{ fontSize: 14 }}>
                          <strong>Status:</strong> {status || 'processing'}
                        </div>
                        <div style={{ fontSize: 13, color: '#9aa0b4' }}>
                          Progress: {progress || 0}% 
                          {etaRemaining !== null ? ` • ETA: ${formatETA(etaRemaining)}` : ''}
                        </div>
                      </div>
                      {status !== 'completed' && (
                        <div style={{ 
                          height: 10, 
                          background: '#1f2230', 
                          borderRadius: 8, 
                          overflow: 'hidden', 
                          flex: 1, 
                          margin: '0 12px' 
                        }}>
                          <div style={{ 
                            width: `${progress || 0}%`, 
                            height: '100%', 
                            background: 'linear-gradient(90deg, var(--orange), var(--pink))', 
                            transition: 'width 600ms ease' 
                          }} />
                        </div>
          )}
        </div>
      </div>

                  {/* Processing message */}
                  <div className="text-center" style={{ fontSize: '13px', color: '#9aa0b4' }}>
                    <p className="mb-0">
                      {status === 'queued' 
                        ? 'Your recompose request has been queued. Processing will begin shortly...'
                        : 'Please wait while we create your recompose. This may take several minutes depending on the audio length.'
                      }
                    </p>
                  </div>
                </div>
              )}

              {/* Completed section with audio players */}
              {!error && status === 'completed' && coverAudioUrls && coverAudioUrls.length > 0 && (
                <div className="mb-4">
                  {/* Success message */}
                  <div className="text-center mb-4">
                    <p className="text-success mb-3" style={{ fontSize: '14px' }}>
                      Your recompose has been created successfully! You can now listen to both versions below.
                    </p>
                  </div>

                  {/* Render audio players for each track */}
                  {coverAudioUrls.map((audioUrl, index) => {
                    const fileName = coverAudioUrls.length > 1 
                      ? `Cover-${index + 1}` 
                      : (coverFileNames?.[index] || 'Generated Cover');
                    const albumCover = coverAlbumCovers?.[index] || null;
                    
                    return (
                      <div key={index} className="mb-4">
                        {/* File info with album cover */}
                        <div className="mb-3 p-3" style={{ background: '#18192a', borderRadius: '8px' }}>
                          <div className="d-flex align-items-center gap-3">
                            {/* Album cover image or icon */}
                            {albumCover && !imageErrors[index] ? (
                              <img 
                                src={albumCover} 
                                alt={fileName}
                                style={{ 
                                  width: '64px', 
                                  height: '64px', 
                                  borderRadius: '8px',
                                  objectFit: 'cover',
                                  flexShrink: 0
                                }}
                                onError={() => {
                                  // Mark image as failed to load
                                  setImageErrors(prev => ({ ...prev, [index]: true }));
                                }}
                              />
                            ) : (
                              <i 
                                className="bi bi-music-note-beamed" 
                                style={{ 
                                  fontSize: '32px', 
                                  color: '#a78bfa',
                                  flexShrink: 0
                                }}
                              ></i>
                            )}
                            <div style={{ flex: 1 }}>
                              <div style={{ fontSize: '14px', fontWeight: 600, color: '#fff' }}>
                                {fileName}
                              </div>
                              <div style={{ fontSize: '12px', color: '#9aa0b4' }}>
                                Cover Version {index + 1}
                              </div>
                            </div>
                            <div className="text-success">
                              <i className="bi bi-check-circle-fill" style={{ fontSize: '24px' }}></i>
                            </div>
                          </div>
                        </div>

                        {/* Audio element */}
                        <audio 
                          ref={audioRefs.current[index]} 
                          src={audioUrl} 
                          preload="metadata"
                          onLoadedMetadata={(e) => {
                            const audio = e.target;
                            if (audio && audio.duration) {
                              setDurations(prev => {
                                // Only update if duration actually changed
                                if (prev[index] === audio.duration) return prev;
                                return {
                                  ...prev,
                                  [index]: audio.duration
                                };
                              });
                            }
                          }}
                          onTimeUpdate={(e) => {
                            const audio = e.target;
                            if (audio) {
                              const newTime = audio.currentTime || 0;
                              setCurrentTimes(prev => {
                                // Only update if time changed significantly (avoid too many updates)
                                const prevTime = prev[index] || 0;
                                if (Math.abs(newTime - prevTime) < 0.1) return prev;
                                return {
                                  ...prev,
                                  [index]: newTime
                                };
                              });
                            }
                          }}
                          onEnded={() => {
                            setPlayingTracks(prev => ({
                              ...prev,
                              [index]: false
                            }));
                          }}
                        />

                        {/* Player controls */}
                        <div className="mb-3">
                          <div className="d-flex align-items-center gap-3 mb-3">
                            <button
                              onClick={() => togglePlayPause(index)}
                              className="btn btn-outline-light"
                              style={{ 
                                width: 48, 
                                height: 48, 
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                border: '1px solid rgba(255, 255, 255, 0.2)'
                              }}
                            >
                              <i className={`bi ${playingTracks[index] ? 'bi-pause-fill' : 'bi-play-fill'}`} style={{ fontSize: 20 }}></i>
                            </button>
                            <div style={{ flex: 1 }}>
                              <div
                                onClick={(e) => handleSeek(e, index)}
                                style={{
                                  height: 8,
                                  background: 'rgba(167, 139, 250, 0.2)',
                                  borderRadius: 6,
                                  overflow: 'hidden',
                                  cursor: 'pointer',
                                  position: 'relative'
                                }}
                              >
                              <div
                                style={{
                                  width: `${durations[index] ? ((currentTimes[index] || 0) / durations[index] * 100) : 0}%`,
                                  height: '100%',
                                  background: 'linear-gradient(90deg, var(--orange), var(--pink))',
                                  transition: 'width 0.1s linear'
                                }}
                              />
                              </div>
                              <div
                                className="d-flex justify-content-between mt-2"
                                style={{ fontSize: 12, color: '#9aa0b4' }}
                              >
                                <div>{formatTime(currentTimes[index] || 0)}</div>
                                <div>{formatTime(durations[index] || 0)}</div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Action buttons */}
            <div className="modal-footer" style={{ borderTop: '1px solid #2b2b3a' }}>
              <div className="d-flex gap-2 justify-content-end w-100">
                <button
                  className="btn btn-outline-light"
                  onClick={handleClose}
                >
                  {status === 'completed' ? 'Close' : 'Cancel'}
                </button>
                {status === 'completed' && (
                  <Link 
                    to="/library" 
                    className="btn"
                    style={{
                      background: 'linear-gradient(90deg, var(--orange), var(--pink), var(--purple))',
                      color: '#fff',
                      border: 'none',
                      padding: '10px 20px',
                      borderRadius: '8px',
                      textDecoration: 'none',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: '500',
                      fontSize: '14px',
                      transition: 'all 0.3s ease',
                      boxShadow: '0 2px 8px rgba(167, 139, 250, 0.3)'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.transform = 'translateY(-2px)';
                      e.target.style.boxShadow = '0 4px 12px rgba(167, 139, 250, 0.4)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.transform = 'translateY(0)';
                      e.target.style.boxShadow = '0 2px 8px rgba(167, 139, 250, 0.3)';
                    }}
                    onClick={() => {
                      // Dispatch event to reset modes before navigating
                      const resetEvent = new CustomEvent('reset-generation-modes');
                      window.dispatchEvent(resetEvent);

                      // Dispatch event to refresh tracks
                      const event = new CustomEvent('cover-completed');
                      window.dispatchEvent(event);
                      handleClose();
                    }}
                  >
                    <i className="bi bi-music-note-list me-2"></i>
                    View in Library
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
    </div>
    </>
  );
};

export default CoverModal;
