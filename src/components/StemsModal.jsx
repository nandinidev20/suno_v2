import React, { useEffect, useState, useRef } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import { useStemsManager } from '../contexts/StemsContext';

const StemsModal = ({ show, onClose, track }) => {
  const { startExtraction, jobs, setModalOpen } = useStemsManager();
  const [loading, setLoading] = useState(false);
  const [filterType, setFilterType] = useState('all');
  const [errorMsg, setErrorMsg] = useState(null);
  const [includeVocals, setIncludeVocals] = useState(false);
  const [isSmallPlaying, setIsSmallPlaying] = useState(false);
  const [smallCurrentTime, setSmallCurrentTime] = useState(0);
  const [smallDuration, setSmallDuration] = useState(0);
  const [isDownloading, setIsDownloading] = useState(false);
  const audioSmallRef = useRef(null);

  // Get current job status for this track - subscribe to jobs updates
  const trackId = track?._id || track?.id;
  const jobStatus = Object.values(jobs).find(j => j.trackId === trackId);

  // Update modal state when show changes
  useEffect(() => {
    if (show && jobStatus?.jobId) {
      setModalOpen(jobStatus.jobId, true);
    } else if (!show && jobStatus?.jobId) {
      setModalOpen(jobStatus.jobId, false);
    }
  }, [show, jobStatus?.jobId, setModalOpen]);

  // Small player listeners
  useEffect(() => {
    const audio = audioSmallRef.current;
    if (!audio) return;
    const onTime = () => setSmallCurrentTime(audio.currentTime || 0);
    const onMeta = () => setSmallDuration(audio.duration || 0);
    const onEnd = () => setIsSmallPlaying(false);
    audio.addEventListener('timeupdate', onTime);
    audio.addEventListener('loadedmetadata', onMeta);
    audio.addEventListener('ended', onEnd);
    return () => {
      audio.removeEventListener('timeupdate', onTime);
      audio.removeEventListener('loadedmetadata', onMeta);
      audio.removeEventListener('ended', onEnd);
    };
  }, [track?.audioUrl]);

  const handleStartExtraction = async () => {
    if (!track) return;
    setLoading(true);
    setErrorMsg(null);
    try {
      await startExtraction(track, includeVocals);
      setIncludeVocals(false);
    } catch (e) {
      console.error('Error starting extraction:', e);
      const msg = (e && e.response && e.response.data && e.response.data.message) 
        ? e.response.data.message 
        : (e && e.message) 
        ? e.message 
        : 'Failed to start extraction';
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setLoading(false);
    setErrorMsg(null);
    setFilterType('all');
    onClose();
  };

  const handleRetry = () => {
    setErrorMsg(null);
    handleStartExtraction();
  };

  const downloadFile = (fileUrl) => window.open(fileUrl, '_blank');

  const downloadAll = async (format) => {
    if (!jobStatus?.jobId) return;
    setIsDownloading(true);

    try {
      if (format === 'wav') {
        toast.loading('Converting stems to WAV format... This may take several minutes.', {
          duration: 5000,
          id: 'wav-conversion'
        });
      } else {
        toast.loading('Preparing MP3 download...', {
          duration: 3000,
          id: 'mp3-download'
        });
      }

      const link = document.createElement('a');
      link.href = `/api/stems/download/${jobStatus.jobId}?format=${format}`;
      link.download = `stems-${jobStatus.jobId}-${format}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setTimeout(() => {
        toast.dismiss('wav-conversion');
        toast.dismiss('mp3-download');
        toast.success(
          format === 'wav'
            ? 'WAV conversion complete! Your download should start shortly.'
            : 'Download started successfully!'
        );
        setIsDownloading(false);
      }, 2000);
    } catch (err) {
      console.error('Download error:', err);
      toast.dismiss('wav-conversion');
      toast.dismiss('mp3-download');
      toast.error('Failed to start download. Please try again.');
      setIsDownloading(false);
    }
  };

  const formatTime = (t) => {
    if (!t || isNaN(t)) return '0:00';
    const m = Math.floor(t / 60);
    const s = Math.floor(t % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  if (!show) return null;

  const isExtracting = jobStatus && (jobStatus.status === 'processing' || jobStatus.status === 'completed');
  const isCompleted = jobStatus && jobStatus.status === 'completed';
  const isFailed = jobStatus && jobStatus.status === 'failed';

  return (
    <div className="modal show" style={{display:'block', background:'rgba(0,0,0,0.6)'}} tabIndex={-1}>
      <Toaster position="top-right" />
      <div className="modal-dialog modal-lg modal-dialog-centered">
      <div className="modal-content bg-dark text-white" style={{border:'1px solid #2b2b3a', fontFamily: "'Poppins', sans-serif"}}>
          <div className="modal-header" style={{borderBottom:'1px solid #2b2b3a'}}>
            <div>
              <h5 className="modal-title">Extract Stems</h5>
            </div>
            <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>
          </div>

          <div className="modal-body">
            <div className="mb-5 d-flex align-items-center" style={{fontSize:'13px', gap:12}}>
              <img src={track?.album_cover_path || track?.albumCover || 'img/bg.jpg'} alt="cover" style={{width:85, height:85, objectFit:'cover', borderRadius:6}} />
              <div style={{display:'flex', flexDirection:'column', flex:1}}>
                <div style={{display:'flex', alignItems:'center', gap:8}}>
                  <i className="bi bi-music-note-list" style={{fontSize:14, color:'#cbd2e6'}} />
                  <div style={{fontSize:13, color:'#fff', fontWeight:600}} title={track?.prompt || track?.title || 'Unknown'}>
                    {(() => { const name = track?.prompt || track?.title || 'Unknown'; return name.length > 90 ? name.slice(0,90) + '...' : name; })()}
                  </div>
                </div>

                {track?.audioUrl && (
                  <div style={{marginTop:8, width:'100%'}}>
                    <audio ref={audioSmallRef} src={track.audioUrl} preload="metadata" />
                    <div style={{display:'flex', alignItems:'center', gap:10}}>
                      <button onClick={() => { const a = audioSmallRef.current; if (!a) return; if (isSmallPlaying) { a.pause(); setIsSmallPlaying(false); } else { a.play(); setIsSmallPlaying(true); } }} className="btn btn-sm btn-outline-light" style={{width:38, height:38}}>
                        <i className={`bi ${isSmallPlaying ? 'bi-pause-fill' : 'bi-play-fill'}`} />
                      </button>
                      <div style={{flex:1}}>
                        <div onClick={(e) => { const rect = e.currentTarget.getBoundingClientRect(); const pct = (e.clientX - rect.left) / rect.width; const a = audioSmallRef.current; if (!a || !smallDuration) return; a.currentTime = pct * smallDuration; }} style={{height:8, background:'radial-gradient(black, transparent)', borderRadius:6, overflow:'hidden', cursor:'pointer'}}>
                          <div style={{width:`${smallDuration ? (smallCurrentTime / smallDuration) * 100 : 0}%`, height:'100%', background:'var(--blue)'}} />
                        </div>
                        <div style={{display:'flex', justifyContent:'space-between', fontSize:11, color:'#9aa0b4', marginTop:6}}>
                          <div>{formatTime(smallCurrentTime)}</div>
                          <div>{formatTime(smallDuration)}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {!isExtracting && !isFailed && (
              <div>
                <div className="form-check mb-3" style={{paddingLeft: '1.5rem'}}>
                  <input 
                    className="form-check-input" 
                    type="checkbox" 
                    id="includeVocalsCheckbox"
                    checked={includeVocals}
                    onChange={(e) => setIncludeVocals(e.target.checked)}
                    style={{cursor: 'pointer'}}
                  />
                  <label 
                    className="form-check-label" 
                    htmlFor="includeVocalsCheckbox"
                    style={{cursor: 'pointer', fontSize: '14px'}}
                  >
                    Include Vocals
                  </label>
                </div>
                
                <div className="d-flex gap-2">
                  <button className="btn" onClick={handleStartExtraction} disabled={loading} style={{background:'linear-gradient(90deg, var(--orange), var(--pink), var(--purple))', color:'#fff', border:'none'}}>
                    {loading ? (<><span className="spinner-border spinner-border-sm me-2" role="status"/>Starting...</>) : 'Extract Stems'}
                  </button>
                  <button className="btn btn-outline-light" onClick={onClose}>Close</button>
                </div>
              </div>
            )}

            {isExtracting && (
              <div>
                {errorMsg && (
                  <div className="alert alert-danger d-flex justify-content-between align-items-start" style={{fontSize:13}}>
                    <div style={{flex:1}}>
                      <div style={{fontWeight:600}}>Error: {errorMsg}</div>
                      <div style={{fontSize:12, color:'#f8d7da', marginTop:6}}>This can happen if webhooks failed to deliver, the external conversion timed out, or there was a network error.</div>
                    </div>
                    <div style={{display:'flex', gap:8}}>
                      <button className="btn btn-sm btn-outline-light" onClick={handleRetry}>Retry</button>
                      <button className="btn btn-sm btn-light" onClick={handleCancel}>Cancel</button>
                    </div>
                  </div>
                )}

                <div className="d-flex justify-content-between align-items-center mb-2">
                  <div>
                    <div style={{fontSize:14}}><strong>Status:</strong> {jobStatus?.status}</div>
                    <div style={{fontSize:13, color:'#9aa0b4'}}>
                      Progress: {jobStatus?.progress || 0}%
                    </div>
                  </div>
                  {jobStatus?.status !== 'completed' && (
                    <div style={{height:10, background:'#1f2230', borderRadius:8, overflow:'hidden', flex:1, margin:'0 12px'}}>
                      <div style={{width:`${jobStatus?.progress || 0}%`, height:'100%', background:'linear-gradient(90deg,var(--orange),var(--pink))', transition:'width 600ms ease'}} />
                    </div>
                  )}
                  <div style={{minWidth:160, position:'relative'}}>
                    <select value={filterType} onChange={e => setFilterType(e.target.value)} className="form-select" style={{background:'rgb(24, 25, 42)', color:'#fff', border:'1px solid rgb(43, 43, 58)', paddingRight: '2.5rem'}}>
                      <option value="all">All</option>
                      <option value="mp3">MP3</option>
                      <option value="wav">WAV</option>
                    </select>
                    <i className="bi bi-caret-down-fill" style={{position:'absolute', right:10, top:'50%', transform:'translateY(-50%)', pointerEvents:'none', color:'#fff'}} />
                  </div>
                </div>

                {jobStatus?.status === 'processing' && (
                  <div className="text-center py-3 d-flex align-items-center justify-content-center" style={{color:'#9aa0b4', gap:10}}>
                    <div className="spinner-border text-light" role="status" style={{width:20, height:20}}>
                      <span className="visually-hidden">Loading...</span>
                    </div>
                    <div>Processing... please wait</div>
                  </div>
                )}

                {jobStatus?.status === 'processing' && (
                  <div style={{width:'100%', marginTop:8, color:'#9aa0b4', fontSize:13, textAlign:'center'}}>
                    <div>Processing your audio... this may take a little while</div>
                  </div>
                )}

                {isCompleted && (
                  <div>
                    <div className="alert alert-success d-flex align-items-center" style={{fontSize:13, marginBottom: 20}}>
                      <i className="bi bi-check-circle-fill me-2" style={{fontSize:16}}></i>
                      <div>
                        <strong>Extraction Complete!</strong>
                        <div style={{fontSize:12, marginTop:4}}>Your stems are ready. Choose how to download them below.</div>
                      </div>
                    </div>

                    <table className="table table-dark table-striped" style={{marginTop:20}}>
                      <thead>
                        <tr>
                          <th>Stem Name</th>
                          <th>Audio Type</th>
                          <th>Download</th>
                        </tr>
                      </thead>
                      <tbody>
                        {jobStatus?.stems && jobStatus.stems.filter(s => filterType==='all' ? true : s.type===filterType).map((s, i) => (
                          <tr key={i}>
                            <td>{s.name}</td>
                            <td>{s.type}</td>
                            <td>
                              <button className="btn btn-link text-white" onClick={() => downloadFile(s.url)}>
                                <i className="bi bi-download"></i>
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    <div className="mt-4">
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <div style={{fontSize: '14px', color: '#9aa0b4'}}>
                          Download all stems as a ZIP file
                        </div>
                      </div>
                      <div className="d-flex gap-2">
                        <button
                          className="btn d-flex align-items-center justify-content-center flex-1"
                          onClick={() => downloadAll('mp3')}
                          disabled={isDownloading}
                          style={{
                            background:'linear-gradient(90deg,var(--orange),var(--pink))',
                            color:'#fff',
                            border:'none',
                            flex: 1,
                            padding: '10px 20px'
                          }}
                        >
                          {isDownloading ? (
                            <>
                              <span className="spinner-border spinner-border-sm me-2" role="status" />
                              Preparing ZIP...
                            </>
                          ) : (
                            <>
                              <i className="bi bi-file-earmark-music me-2" /> Download as MP3 (Original)
                            </>
                          )}
                        </button>
                        <button
                          className="btn d-flex align-items-center justify-content-center flex-1"
                          onClick={() => downloadAll('wav')}
                          disabled={isDownloading}
                          style={{
                            background:'linear-gradient(90deg,var(--purple),var(--blue))',
                            color:'#fff',
                            border:'none',
                            flex: 1,
                            padding: '10px 20px'
                          }}
                        >
                          {isDownloading ? (
                            <>
                              <span className="spinner-border spinner-border-sm me-2" role="status" />
                              Converting to WAV...
                            </>
                          ) : (
                            <>
                              <i className="bi bi-file-earmark-music-fill me-2" /> Download as WAV (Converted)
                            </>
                          )}
                        </button>
                      </div>
                      <div style={{fontSize: '12px', color: '#7a7a8a', marginTop: '8px'}}>
                        <i className="bi bi-info-circle me-1" />
                        WAV conversion may take a few minutes depending on file size and number of stems
                      </div>
                    </div>

                    <div className="d-flex gap-2 mt-4">
                      <button className="btn btn-outline-light" onClick={handleCancel} style={{flex:1}}>
                        Close
                      </button>
                    </div>
                  </div>
                )}

                {!isCompleted && !isExtracting && !isFailed && (
                  <div className="d-flex gap-2 mt-3">
                    <button className="btn btn-outline-light" onClick={handleCancel} style={{flex:1}}>
                      Cancel
                    </button>
                  </div>
                )}

                {isExtracting && !isCompleted && (
                  <div className="d-flex gap-2 mt-3">
                    <button className="btn btn-outline-light" onClick={handleCancel} style={{flex:1}}>
                      {isCompleted ? 'Close' : 'Cancel'}
                    </button>
                  </div>
                )}
              </div>
            )}

            {isFailed && (
              <div>
                <div className="alert alert-danger d-flex justify-content-between align-items-start" style={{fontSize:13}}>
                  <div style={{flex:1}}>
                    <div style={{fontWeight:600}}>Error: {jobStatus?.error}</div>
                    <div style={{fontSize:12, color:'#f8d7da', marginTop:6}}>Failed to extract stems. Please try again.</div>
                  </div>
                  <div style={{display:'flex', gap:8}}>
                    <button className="btn btn-sm btn-outline-light" onClick={handleRetry}>Retry</button>
                    <button className="btn btn-sm btn-light" onClick={handleCancel}>Close</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StemsModal;
