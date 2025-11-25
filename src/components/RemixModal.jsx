import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';

/**
 * RemixModal Component
 * Shows remix progress with audio player (same UI as AudioTranscribeModal)
 */
const RemixModal = ({ 
  show, 
  onClose, 
  progress, 
  status, 
  etaRemaining, 
  error, 
  remixAudioUrls,  // Changed to array
  remixFileNames,  // Changed to array
  remixAlbumCovers // Added album covers array
}) => {
  // Debug logging
  //console.log('RemixModal props:', { show, progress, status, etaRemaining, error, remixAudioUrls, remixFileNames, remixAlbumCovers });
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [audioUrl, setAudioUrl] = useState(null);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0); // Track which version is currently playing
  
  const audioRef = useRef(null);

  // Audio player event listeners
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onTimeUpdate = () => setCurrentTime(audio.currentTime || 0);
    const onLoadedMetadata = () => setDuration(audio.duration || 0);
    const onEnded = () => {
      setIsPlaying(false);
      // Auto-play next track if available
      if (remixAudioUrls && remixAudioUrls.length > 1) {
        const nextIndex = (currentTrackIndex + 1) % remixAudioUrls.length;
        setCurrentTrackIndex(nextIndex);
      }
    };

    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('loadedmetadata', onLoadedMetadata);
    audio.addEventListener('ended', onEnded);

    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('loadedmetadata', onLoadedMetadata);
      audio.removeEventListener('ended', onEnded);
    };
  }, [audioUrl, currentTrackIndex, remixAudioUrls]);

  // Auto-play when audio is loaded
  useEffect(() => {
    if (isPlaying && audioRef.current) {
      audioRef.current.play().catch(e => {
        console.error('Error playing audio:', e);
        setIsPlaying(false);
      });
    } else if (!isPlaying && audioRef.current) {
      audioRef.current.pause();
    }
  }, [isPlaying]);

  // Set audio URL when remix is completed
  useEffect(() => {
    if (remixAudioUrls && remixAudioUrls.length > 0 && status === 'completed') {
      setAudioUrl(remixAudioUrls[currentTrackIndex]);
    }
  }, [remixAudioUrls, status, currentTrackIndex]);

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

  const togglePlayPause = () => {
    if (!audioUrl) return;
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (e) => {
    if (!audioRef.current || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    const newTime = percent * duration;
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleTrackChange = (index) => {
    setCurrentTrackIndex(index);
    setIsPlaying(false); // Pause when changing tracks
    setCurrentTime(0); // Reset to start of track
  };

  const handleClose = () => {
    // Cleanup
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
    setAudioUrl(null);
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
    setCurrentTrackIndex(0);
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
                  {status === 'completed' ? 'Remix Complete!' : 'Remix in Progress'}
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
                      {status === 'processing' && 'Creating Your Remix...'}
                      {!status && 'Starting Remix...'}
                    </h6>
                  </div>

                  {/* Progress bar - Same style as stems modal */}
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
                        ? 'Your remix request has been queued. Processing will begin shortly...'
                        : 'Please wait while we create your remix. This may take several minutes depending on the audio length.'
                      }
                    </p>
                  </div>
                </div>
              )}

              {/* Completed section with audio player */}
              {!error && status === 'completed' && audioUrl && (
                <div className="mb-4">
                  {/* Track selection and file info */}
                  {remixAudioUrls && remixAudioUrls.length > 0 && (
                    <div className="mb-3 p-3" style={{ background: '#18192a', borderRadius: '8px' }}>
                      {/* Track list if multiple versions */}
                      {remixAudioUrls.length > 1 && (
                        <div className="mb-3" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                          <div style={{ fontSize: '14px', fontWeight: 600, color: '#fff', marginBottom: '8px' }}>
                            Remix Versions ({remixAudioUrls.length})
                          </div>
                          <div className="list-group" style={{ borderRadius: '6px', overflow: 'hidden' }}>
                            {remixAudioUrls.map((url, index) => (
                              <div
                                key={index}
                                onClick={() => handleTrackChange(index)}
                                className={`list-group-item d-flex align-items-center p-2 ${currentTrackIndex === index ? 'bg-primary' : 'bg-dark'}`}
                                style={{
                                  cursor: 'pointer',
                                  border: currentTrackIndex === index ? '1px solid var(--orange)' : '1px solid #3a3f5a',
                                  borderRadius: '6px',
                                  marginBottom: '4px'
                                }}
                              >
                                <i className={`bi ${currentTrackIndex === index ? 'bi-music-note-beamed text-white' : 'bi-music-note text-muted'}`} style={{ marginRight: '8px' }}></i>
                                <div style={{ flex: 1 }}>
                                  <div style={{ fontSize: '14px', color: currentTrackIndex === index ? '#fff' : '#9aa0b4' }}>
                                    {remixFileNames && remixFileNames[index] ? remixFileNames[index] : `Remix Version ${index + 1}`}
                                  </div>
                                </div>
                                {currentTrackIndex === index && (
                                  <i className="bi bi-play-fill text-white" style={{ fontSize: '16px' }}></i>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      {/* Current track info */}
                      <div className="d-flex align-items-center gap-3 mt-2">
                        <i className="bi bi-music-note-beamed" style={{ fontSize: '32px', color: '#a78bfa' }}></i>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: '14px', fontWeight: 600, color: '#fff' }}>
                            {remixFileNames && remixFileNames[currentTrackIndex] ? remixFileNames[currentTrackIndex] : `Remix Version ${currentTrackIndex + 1}`}
                          </div>
                          <div style={{ fontSize: '12px', color: '#9aa0b4' }}>
                            Remix Complete {remixAudioUrls.length > 1 ? `(${currentTrackIndex + 1} of ${remixAudioUrls.length})` : ''}
                          </div>
                        </div>
                        <div className="text-success">
                          <i className="bi bi-check-circle-fill" style={{ fontSize: '24px' }}></i>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Audio element */}
                  <audio ref={audioRef} src={audioUrl} preload="metadata" />

                  {/* Player controls */}
                  <div className="mb-3">
                    <div className="d-flex align-items-center gap-3 mb-3">
                      <button
                        onClick={togglePlayPause}
                        className="btn btn-outline-light"
                        style={{ 
                          width: 48, 
                          height: 48, 
                          borderRadius: '50%'
                        }}
                      >
                        <i className={`bi ${isPlaying ? 'bi-pause-fill' : 'bi-play-fill'}`} style={{ fontSize: 20 }}></i>
                      </button>
                      <div style={{ flex: 1 }}>
                        <div
                          onClick={handleSeek}
                          style={{
                            height: 8,
                            background: 'rgba(167, 139, 250, 0.2)',
                            borderRadius: 6,
                            overflow: 'hidden',
                            cursor: 'pointer'
                          }}
                        >
                          <div
                            style={{
                              width: `${duration ? (currentTime / duration) * 100 : 0}%`,
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
                          <div>{formatTime(currentTime)}</div>
                          <div>{formatTime(duration)}</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Success message */}
                  <div className="text-center">
                    <p className="text-success mb-3" style={{ fontSize: '14px' }}>
                      Your remix has been created successfully! You can now listen to it above.
                    </p>
                  </div>
                </div>
              )}

              {/* Action buttons */}
              <div className="d-flex gap-2 justify-content-end">
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
                      // Dispatch event to refresh tracks
                      const event = new CustomEvent('remix-completed');
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

export default RemixModal;
