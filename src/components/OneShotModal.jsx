import React, { useState, useRef, useEffect } from 'react';

const OneShotModal = ({
  show,
  onClose,
  status,
  progress,
  result,
  error,
  prompt,
  onGenerateAnother
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onTimeUpdate = () => setCurrentTime(audio.currentTime || 0);
    const onLoadedMetadata = () => setDuration(audio.duration || 0);
    const onEnded = () => setIsPlaying(false);

    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('loadedmetadata', onLoadedMetadata);
    audio.addEventListener('ended', onEnded);

    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('loadedmetadata', onLoadedMetadata);
      audio.removeEventListener('ended', onEnded);
    };
  }, [result?.conversion_path]);

  useEffect(() => {
    if (!show || !result) {
      setIsPlaying(false);
      setCurrentTime(0);
      setDuration(0);
    }
  }, [show, result]);

  const formatTime = (t) => {
    if (!t || isNaN(t)) return '0:00';
    const m = Math.floor(t / 60);
    const s = Math.floor(t % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const handlePlayPause = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.play();
      setIsPlaying(true);
    }
  };

  const handleSeek = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = (e.clientX - rect.left) / rect.width;
    const audio = audioRef.current;
    if (!audio || !duration) return;
    audio.currentTime = pct * duration;
  };

  const handleDownload = async (url, format) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `oneshot-${Date.now()}.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  if (!show) return null;

  return (
    <div className="modal show" style={{display:'block', background:'rgba(0,0,0,0.7)'}} tabIndex={-1}>
      <div className="modal-dialog modal-lg modal-dialog-centered">
        <div className="modal-content bg-dark text-white" style={{border:'1px solid #2b2b3a', fontFamily: "'Poppins', sans-serif"}}>
          <div className="modal-header" style={{borderBottom:'1px solid #2b2b3a'}}>
            <div>
              <h5 className="modal-title" style={{color:'#a78bfa', letterSpacing:'0.5px'}}>
                {status === 'generating' ? 'Processing Sound Effect...' :
                 status === 'completed' ? 'Generation Complete!' :
                 status === 'failed' ? 'Generation Failed' : 'OneShot Sound Generator'}
              </h5>
            </div>
            <button
              type="button"
              className="btn-close btn-close-white"
              onClick={onClose}
              disabled={status === 'generating'}
              style={{opacity: status === 'generating' ? 0.5 : 1, cursor: status === 'generating' ? 'not-allowed' : 'pointer'}}
            ></button>
          </div>

          <div className="modal-body">
            {status === 'generating' && (
              <div className="text-center py-4">
                <div className="d-flex flex-column align-items-center justify-content-center" style={{gap: '1rem'}}>
                  <div style={{
                    background:'#181c2a',
                    color:'#a78bfa',
                    border:'3px solid #a78bfa',
                    borderRadius:'50%',
                    width:'5rem',
                    height:'5rem',
                    display:'flex',
                    alignItems:'center',
                    justifyContent:'center',
                    fontWeight:700,
                    fontSize:'1.8rem',
                    boxShadow:'0 0 20px #a78bfa44'
                  }}>{progress}%</div>

                  <div style={{width: '100%', maxWidth: 500, height: '1.2rem', background:'#23263a', borderRadius:12, overflow:'hidden', boxShadow:'0 2px 8px #0003'}}>
                    <div
                      style={{
                        width: `${progress}%`,
                        height: '100%',
                        background: 'linear-gradient(90deg, #a78bfa 0%, #6366f1 100%)',
                        borderRadius:12,
                        transition:'width 0.4s cubic-bezier(.4,2,.6,1)',
                        boxShadow:'0 0 12px #a78bfa66'
                      }}
                    />
                  </div>

                  <div className="fw-semibold mt-3" style={{color:'#cbd2e6', fontSize:'1rem', letterSpacing:'0.5px', textAlign:'center'}}>
                    Hang tight! Your sound effect is being created.<br/>
                    <span style={{fontSize:'0.9rem', color:'#9aa0b4'}}>This may take 1-2 minutes.</span>
                  </div>
                </div>
              </div>
            )}

            {status === 'completed' && result && (
              <div className="py-1">
                <div className="mb-4 d-flex align-items-start" style={{gap: 16, padding: '0 1rem'}}>
                  <div style={{
                    width: 120,
                    height: 120,
                    borderRadius: 12,
                    background: 'linear-gradient(135deg, #a78bfa 0%, #6366f1 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
                    flexShrink: 0
                  }}>
                    <i className="bi bi-soundwave" style={{fontSize: 48, color: '#fff'}}></i>
                  </div>

                  {(result?.conversion_path || result?.track?.audio_url) && (
                    <div style={{flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center'}}>
                      <audio
                        ref={audioRef}
                        src={result?.conversion_path || result?.track?.audio_url}
                        preload="metadata"
                        style={{display: 'none'}}
                      />

                      <div style={{marginBottom: 12}}>
                        <div style={{
                          fontSize: 15,
                          color: '#fff',
                          fontWeight: 600,
                          marginBottom: 4,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}>
                          {prompt?.length > 50
                            ? prompt.slice(0, 50) + '...'
                            : prompt || 'Generated Sound Effect'}
                        </div>
                        <div style={{fontSize: 13, color: '#9aa0b4'}}>
                          OneShot Sound Effect
                        </div>
                      </div>

                      <div style={{display: 'flex', alignItems: 'center', gap: 12}}>
                        <button
                          onClick={handlePlayPause}
                          className="btn btn-sm"
                          style={{
                            width: 42,
                            height: 42,
                            background: 'linear-gradient(135deg, var(--orange), var(--pink), var(--purple))',
                            border: 'none',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 2px 8px rgba(167, 139, 250, 0.4)',
                            cursor: 'pointer'
                          }}
                        >
                          <i
                            className={`bi ${isPlaying ? 'bi-pause-fill' : 'bi-play-fill'}`}
                            style={{fontSize: 20, color: '#fff'}}
                          />
                        </button>

                        <div style={{flex: 1}}>
                          <div
                            onClick={handleSeek}
                            style={{
                              height: 8,
                              background: '#23263a',
                              borderRadius: 8,
                              overflow: 'hidden',
                              cursor: 'pointer',
                              marginBottom: 6
                            }}
                          >
                            <div
                              style={{
                                width: `${duration ? (currentTime / duration) * 100 : 0}%`,
                                height: '100%',
                                background: 'linear-gradient(90deg, var(--orange), var(--pink), var(--purple))',
                                transition: 'width 0.1s linear'
                              }}
                            />
                          </div>

                          <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            fontSize: 11,
                            color: '#9aa0b4'
                          }}>
                            <div>{formatTime(currentTime)}</div>
                            <div>{formatTime(duration)}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-4 mb-4" style={{padding: '0 1rem'}}>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '0.75rem'
                  }}>
                    {result && (
                      <>
                        <div style={{background: '#1a1d2e', padding: '0.75rem 1rem', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                          <i className="bi bi-check-circle-fill" style={{color: '#a78bfa', fontSize: 16}}></i>
                          <div>
                            <div style={{fontSize: 11, color: '#9aa0b4', marginBottom: 2}}>Status</div>
                            <div style={{color: '#cbd2e6', fontWeight: 500, fontSize: 14}}>Completed</div>
                          </div>
                        </div>
                        {duration > 0 && (
                          <div style={{background: '#1a1d2e', padding: '0.75rem 1rem', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                            <i className="bi bi-clock-fill" style={{color: '#a78bfa', fontSize: 16}}></i>
                            <div>
                              <div style={{fontSize: 11, color: '#9aa0b4', marginBottom: 2}}>Duration</div>
                              <div style={{color: '#cbd2e6', fontWeight: 500, fontSize: 14}}>{Math.floor(duration)}s</div>
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>

                <div className="mt-4 mb-3" style={{padding: '0 1rem'}}>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: (result?.conversion_path_wav || result?.track?.audio_url_wav) ? '1fr 1fr' : '1fr',
                    gap: '0.75rem'
                  }}>
                    <button
                      onClick={() => handleDownload(result.conversion_path || result.track?.audio_url, 'mp3')}
                      className="btn"
                      style={{
                        padding: '0.6rem 1.5rem',
                        background: '#1a1d2e',
                        border: '1px solid #2b2b3a',
                        color: '#cbd2e6',
                        borderRadius: '8px',
                        fontSize: '0.9rem',
                        fontWeight: 500,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem'
                      }}
                    >
                      <i className="bi bi-download" style={{fontSize: 16}}></i>
                      Download MP3
                    </button>

                    {(result?.conversion_path_wav || result?.track?.audio_url_wav) && (
                      <button
                        onClick={() => handleDownload(result.conversion_path_wav || result.track?.audio_url_wav, 'wav')}
                        className="btn"
                        style={{
                          padding: '0.6rem 1.5rem',
                          background: '#1a1d2e',
                          border: '1px solid #2b2b3a',
                          color: '#cbd2e6',
                          borderRadius: '8px',
                          fontSize: '0.9rem',
                          fontWeight: 500,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '0.5rem'
                        }}
                      >
                        <i className="bi bi-download" style={{fontSize: 16}}></i>
                        Download WAV
                      </button>
                    )}
                  </div>
                </div>

                <div className="mt-4 d-flex gap-2 justify-content-center">
                  <button
                    onClick={onGenerateAnother}
                    className="btn btn-gradient"
                    style={{background:'linear-gradient(90deg, var(--orange), var(--pink), var(--purple))', border:'none', padding: '0.6rem 1.5rem'}}
                  >
                    Generate Another
                  </button>
                  <button
                    onClick={onClose}
                    className="btn btn-outline-light"
                    style={{padding: '0.6rem 1.5rem'}}
                  >
                    Close
                  </button>
                </div>
              </div>
            )}

            {status === 'failed' && (
              <div className="text-center py-4">
                <div style={{fontSize: '3rem', marginBottom: '1rem'}}>😞</div>
                <h5 style={{color: '#ff6b6b', marginBottom: '1rem'}}>Generation Failed</h5>
                <p style={{color: '#9aa0b4', marginBottom: '2rem'}}>
                  {error || 'An error occurred while generating your sound effect. Please try again.'}
                </p>
                <div className="d-flex gap-2 justify-content-center">
                  <button
                    onClick={onGenerateAnother}
                    className="btn btn-gradient"
                    style={{background:'linear-gradient(90deg, var(--orange), var(--pink), var(--purple))', border:'none', padding: '0.6rem 1.5rem'}}
                  >
                    Try Again
                  </button>
                  <button
                    onClick={onClose}
                    className="btn btn-outline-light"
                    style={{padding: '0.6rem 1.5rem'}}
                  >
                    Close
                  </button>
                </div>
              </div>
            )}

            {status !== 'generating' && !result && status !== 'failed' && (
              <div className="text-center py-5" style={{color: '#9aa0b4'}}>
                <p>Ready to generate your sound effect!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OneShotModal;
