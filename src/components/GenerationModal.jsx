import React, { useState, useRef, useEffect } from 'react';

const GenerationModal = ({ 
  show, 
  onClose, 
  isGenerating, 
  progress, 
  result,
  onViewProfile,
  onGenerateAnother 
}) => {

  console.log('GenerationModasfgsfgsl:', show, isGenerating, progress, result);
  // Audio player state
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef(null);

  // Audio player listeners
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
  }, [result?.conversion_path_1, result?.conversion_path_wav_1]);

  // Reset player when modal closes or result changes
  useEffect(() => {
    if (!show || !result) {
      setIsPlaying(false);
      setCurrentTime(0);
      setDuration(0);
    }
  }, [show, result]);

  // Format time helper
  const formatTime = (t) => {
    if (!t || isNaN(t)) return '0:00';
    const m = Math.floor(t / 60);
    const s = Math.floor(t % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  // Handle play/pause
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

  // Handle seek
  const handleSeek = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = (e.clientX - rect.left) / rect.width;
    const audio = audioRef.current;
    if (!audio || !duration) return;
    audio.currentTime = pct * duration;
  };

  if (!show) return null;

  return (
    <div className="modal show" style={{display:'block', background:'rgba(0,0,0,0.7)'}} tabIndex={-1}>
      <div className="modal-dialog modal-lg modal-dialog-centered">
        <div className="modal-content bg-dark text-white" style={{border:'1px solid #2b2b3a', fontFamily: "'Poppins', sans-serif"}}>
          <div className="modal-header" style={{borderBottom:'1px solid #2b2b3a'}}>
            <div>
              <h5 className="modal-title" style={{color:'#a78bfa', letterSpacing:'0.5px'}}>
                {isGenerating ? 'Processing Your Music...' : (result ? 'Generation Complete!' : 'Music Generation')}
              </h5>
            </div>
            <button 
              type="button" 
              className="btn-close btn-close-white" 
              onClick={onClose}
              disabled={isGenerating}
              style={{opacity: isGenerating ? 0.5 : 1, cursor: isGenerating ? 'not-allowed' : 'pointer'}}
            ></button>
          </div>

          <div className="modal-body">
            {/* Progress Bar */}
            {isGenerating && (
              <div className="text-center py-4">
                <div className="d-flex flex-column align-items-center justify-content-center" style={{gap: '1rem'}}>
                  {/* Progress percent in a circle badge */}
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
                  
                  {/* Custom progress bar */}
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
                    Hang tight! Your music is being created.<br/>
                    <span style={{fontSize:'0.9rem', color:'#9aa0b4'}}>This may take 2-3 minutes.</span>
                  </div>
                </div>
              </div>
            )}

            {/* Results */}
            {!isGenerating && result && (
              <div className="py-1">
                {/* Cover Image and Player Section */}
                <div className="mb-4 d-flex align-items-start" style={{gap: 16, padding: '0 1rem'}}>
                  {/* Album Cover */}
                  {result?.album_cover_path && (
                    <img
                      src={result.album_cover_path}
                      alt="Album Cover"
                      style={{
                        width: 120,
                        height: 120,
                        objectFit: 'cover',
                        borderRadius: 12,
                        boxShadow: '0 4px 12px rgba(0,0,0,0.4)'
                      }}
                    />
                  )}

                  {/* Custom Audio Player */}
                  {(result?.conversion_path_1 || result?.conversion_path_wav_1) && (
                    <div style={{flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center'}}>
                      <audio 
                        ref={audioRef} 
                        src={result?.conversion_path_1 || result?.conversion_path_wav_1} 
                        preload="metadata"
                        style={{display: 'none'}}
                      />
                      
                      {/* Track Info */}
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
                          {result?.description_prompt?.length > 50 
                            ? result.description_prompt.slice(0, 50) + '...' 
                            : result?.description_prompt || 'Generated Music'}
                        </div>
                        <div style={{fontSize: 13, color: '#9aa0b4'}}>
                          {result?.music_style || 'Unknown Style'}
                        </div>
                      </div>

                      {/* Player Controls */}
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
                          {/* Progress Bar */}
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
                          
                          {/* Time Display */}
                          <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            fontSize: 11,
                            color: '#9aa0b4'
                          }}>
                            <div>{formatTime(currentTime)}</div>
                       {/*      <div>{formatTime(duration)}</div> */}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Additional Details */}
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
                            <div style={{color: '#cbd2e6', fontWeight: 500, fontSize: 14}}>{result.status}</div>
                          </div>
                        </div>
                       {/*  {result.conversion_cost_user !== undefined && (
                          <div style={{background: '#1a1d2e', padding: '0.75rem 1rem', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                            <i className="bi bi-cash-coin" style={{color: '#a78bfa', fontSize: 16}}></i>
                            <div>
                              <div style={{fontSize: 11, color: '#9aa0b4', marginBottom: 2}}>Cost</div>
                              <div style={{color: '#cbd2e6', fontWeight: 500, fontSize: 14}}>${result.conversion_cost_user}</div>
                            </div>
                          </div>
                        )}
                        {result.conversion_duration !== undefined && (
                          <div style={{background: '#1a1d2e', padding: '0.75rem 1rem', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                            <i className="bi bi-clock-fill" style={{color: '#a78bfa', fontSize: 16}}></i>
                            <div>
                              <div style={{fontSize: 11, color: '#9aa0b4', marginBottom: 2}}>Duration</div>
                              <div style={{color: '#cbd2e6', fontWeight: 500, fontSize: 14}}>{result.conversion_duration}s</div>
                            </div>
                          </div>
                        )} */}
                      </>
                    )}
                  </div>
                </div>

                <div className="mt-4 d-flex gap-2 justify-content-center">
                  <button onClick={onViewProfile} className="btn btn-gradient" style={{background:'linear-gradient(90deg, var(--orange), var(--pink), var(--purple))', border:'none', padding: '0.6rem 1.5rem'}}>
                    View in Profile
                  </button>
                  <button onClick={onGenerateAnother} className="btn btn-outline-light" style={{padding: '0.6rem 1.5rem'}}>
                    Generate Another
                  </button>
                </div>
              </div>
            )}

            {/* Empty state when modal just opened */}
            {!isGenerating && !result && (
              <div className="text-center py-5" style={{color: '#9aa0b4'}}>
                <p>Ready to generate your music!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GenerationModal;

