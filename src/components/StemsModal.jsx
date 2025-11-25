import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { io as ioClient } from 'socket.io-client';
import toast, { Toaster } from 'react-hot-toast';

// Minimal Bootstrap modal component for stems extraction
const StemsModal = ({ show, onClose, track }) => {
  const [loading, setLoading] = useState(false);
  const [jobId, setJobId] = useState(null);
  const [status, setStatus] = useState(null);
  const [stems, setStems] = useState([]);
  const [externalJobId, setExternalJobId] = useState(null);
  const [filterType, setFilterType] = useState('all');
  const [progress, setProgress] = useState(0);
  const [etaRemaining, setEtaRemaining] = useState(null);
  const [originalEta, setOriginalEta] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [lastErrorDetails, setLastErrorDetails] = useState(null);
  const [lastUpdateTime, setLastUpdateTime] = useState(null);
  // track which jobIds/keys we've shown a toast for to avoid duplicates
  const shownToasts = useRef(new Set());
  // Compact inline player state
  const [isSmallPlaying, setIsSmallPlaying] = useState(false);
  const [smallCurrentTime, setSmallCurrentTime] = useState(0);
  const [smallDuration, setSmallDuration] = useState(0);
  const audioSmallRef = useRef(null);
  // Download state
  const [isDownloading, setIsDownloading] = useState(false);
  // Vocals checkbox state
  const [includeVocals, setIncludeVocals] = useState(false);

  // Socket.io realtime events
  useEffect(() => {
    let SOCKET_URL;
    if(window.location.hostname === 'openbeat.ai') {
      SOCKET_URL = 'https://api.openbeat.ai';
    } else {
      SOCKET_URL = `https://api.openbeat.ai`; 
    } 
    console.log('Attempting to connect to socket:', SOCKET_URL);
    const socket = ioClient(SOCKET_URL, { 
      transports: ['websocket', 'polling'], 
      reconnectionAttempts: 5, 
      reconnectionDelay: 1000,
      timeout: 20000,
      forceNew: true
    });
    
    const onStemsProgress = (p) => {
      try {
        console.log('Received stems_progress:', p, 'Current jobId:', jobId);
        if (!p) return;
        if (p.jobId && p.jobId === jobId) {
          setLastUpdateTime(Date.now());
          const display = (p.status === 'completed') ? 100 : Math.min(99, p.progress || 0);
          console.log('Updating progress to:', display);
          setProgress(display);
          setEtaRemaining(p.etaRemaining ?? null);
          if (p.originalEta && !originalEta) {
            setOriginalEta(p.originalEta);
          }
          setStatus(p.status || 'processing');
        }
      } catch (e) { console.error('stems_progress handler', e); }
    };

    const onStemsReady = (payload) => {
      try {
        if (!payload) return;

        // gather candidate ids/urls from payload
        const payloadIds = new Set();
        ['jobId','job_id','external_job_id','externalJobId','conversion_id','task_id'].forEach(k => {
          if (payload[k]) payloadIds.add(String(payload[k]));
        });

        // If our current jobId or externalJobId is present in payloadIds -> match
        let didMatch = false;
        if (jobId && payloadIds.has(String(jobId))) didMatch = true;
        if (!didMatch && externalJobId && payloadIds.has(String(externalJobId))) didMatch = true;

        // next, try to match by audio urls or stems urls
        if (!didMatch && track) {
          const trackUrl = track.audioUrl || track.audioUrlWav || track._audioPath || track.audio_url;
          const candidates = [];
          if (payload.audio_url && typeof payload.audio_url === 'object') candidates.push(...Object.values(payload.audio_url));
          if (payload.audio_url_wav && typeof payload.audio_url_wav === 'object') candidates.push(...Object.values(payload.audio_url_wav));
          if (payload.audio_url && typeof payload.audio_url === 'string') candidates.push(payload.audio_url);
          if (payload.audio_url_wav && typeof payload.audio_url_wav === 'string') candidates.push(payload.audio_url_wav);
          if (payload.stems && Array.isArray(payload.stems)) payload.stems.forEach(s => { if (s.url) candidates.push(s.url); });

          if (trackUrl) {
            for (const u of candidates) {
              try {
                if (!u) continue;
                if (u === trackUrl || (u.includes && u.includes(trackUrl)) || (trackUrl.includes && trackUrl.includes(u))) { didMatch = true; break; }
              } catch (e) {}
            }
          }
        }

        if (didMatch) {
          const normalized = (payload.stems && Array.isArray(payload.stems)) ? payload.stems.map(s => ({ name: s.name || s.stem || 'stem', type: s.type || 'wav', url: s.url })) : [];
          setStems(normalized);
          setStatus('completed');
          setLastUpdateTime(Date.now());
          setProgress(100);
          setEtaRemaining(0);
          setLoading(false);
          const toastKey = payload.jobId || payload.job_id || payload.external_job_id || payload.externalJobId || jobId || externalJobId || (track && (track.audioUrl || track.audioUrlWav));
          if (toastKey && !shownToasts.current.has(toastKey)) {
            shownToasts.current.add(toastKey);
            toast.success('Stems ready — check the table below');
          }
          setErrorMsg(null);
          setLastErrorDetails(null);
        }
      } catch (err) { console.error('stems_ready handler error', err); }
    };

    const onStemsFailed = (payload) => {
      try {
        if (!payload) return;
        const payloadIds = new Set();
        ['jobId','job_id','external_job_id','externalJobId','conversion_id','task_id'].forEach(k => { if (payload[k]) payloadIds.add(String(payload[k])); });
        let match = false;
        if (jobId && payloadIds.has(String(jobId))) match = true;
        if (!match && externalJobId && payloadIds.has(String(externalJobId))) match = true;
        if (match || (!payloadIds.size && !jobId)) {
          setStatus('failed');
          setLoading(false);
          const errMsg = payload.message || payload.error || payload.reason || 'Unknown error from stems service';
          setErrorMsg(errMsg);
          setLastErrorDetails(prev => ({...prev, webhook: payload}));
          const key = payload.jobId || payload.job_id || jobId;
          if (key && !shownToasts.current.has(key)) {
            shownToasts.current.add(key);
            toast.error(`Stems generation failed: ${errMsg}`);
          }
        }
      } catch (e) { console.error('stems_failed handler', e); }
    };

    socket.on('connect', () => {
      console.info('Socket connected (client)', socket.id, 'to', SOCKET_URL);
      if (jobId) {
        socket.emit('join_stems_room', jobId);
      }
    });
    
    socket.on('connected', (data) => {
      console.info('Server confirmed connection:', data);
    });
    
    socket.on('connect_error', (err) => {
      console.warn('Socket connect_error', err && err.message);
      console.warn('Full error:', err);
    });
    
    socket.on('reconnect_attempt', (n) => console.info('Socket reconnect attempt', n));
    
    socket.on('reconnect', () => {
      console.info('Socket reconnected');
      if (jobId) {
        socket.emit('join_stems_room', jobId);
      }
    });

    socket.on('stems_progress', onStemsProgress);
    socket.on('stems_ready', onStemsReady);
    socket.on('stems_failed', onStemsFailed);

    return () => {
      socket.off('stems_progress', onStemsProgress);
      socket.off('stems_ready', onStemsReady);
      socket.off('stems_failed', onStemsFailed);
      socket.disconnect();
    };
  }, [jobId, externalJobId, track, originalEta]);

  // Watchdog to detect stalled/stuck jobs
  useEffect(() => {
    const STALL_TIMEOUT_MS = 120000; // 2 minutes
    let checker;
    if (jobId && loading && status !== 'completed') {
      checker = setInterval(() => {
        const now = Date.now();
        if (lastUpdateTime && (now - lastUpdateTime) > STALL_TIMEOUT_MS) {
          setStatus('failed');
          setLoading(false);
          const msg = `No progress updates received for ${Math.round((now - lastUpdateTime)/1000)}s. This may be due to socket connection issues or the stems service timing out.`;
          setErrorMsg(msg);
          setLastErrorDetails(prev => ({...prev, stallDetectedAt: now}));
          toast.error('Stems generation appears stalled — see details');
        }
      }, 10000);
    }
    return () => clearInterval(checker);
  }, [jobId, loading, status, lastUpdateTime]);

  // small player listeners
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

  const startExtraction = async () => {
    if (!track) return;
    setLoading(true);
    setStatus('processing');
    setErrorMsg(null);
    setLastErrorDetails(null);
    try {
      const payload = { 
        audioUrl: track.audioUrl || track.audioUrlWav || track._audioPath || track.audio_url, 
        stems: ["drums", "bass", "piano", "guitar", "back_vocal", "strings", "winds", "vocals", "kick_drum", "snare_drum", "hi_hat", "keys"],
        isVocal: includeVocals
      };
      const res = await axios.post('/api/stems/extract', payload);
      console.log("res:::", res);
      setJobId(res.data.jobId);
      if (res.data.externalJobId) setExternalJobId(res.data.externalJobId);
      setProgress(0);
      setEtaRemaining(res.data.etaSeconds ?? null);
      setOriginalEta(res.data.etaSeconds ?? null);
      setLastUpdateTime(Date.now());
    } catch (e) {
      console.error(e);
      setLoading(false);
      setStatus('failed');
      const msg = (e && e.response && e.response.data && e.response.data.message) ? e.response.data.message : (e && e.message) ? e.message : 'Failed to start extraction';
      setErrorMsg(msg);
      setLastErrorDetails(prev => ({...prev, startError: (e && e.toString && e.toString()) || String(e)}));
      toast.error(`Failed to start extraction: ${msg}`);
    }
  };

  const handleRetry = async () => {
    setErrorMsg(null);
    setLastErrorDetails(null);
    setProgress(0);
    setStems([]);
    setJobId(null);
    setExternalJobId(null);
    setOriginalEta(null);
    await startExtraction();
  };

  const handleCancel = () => {
    setJobId(null);
    setExternalJobId(null);
    setStatus(null);
    setLoading(false);
    setProgress(0);
    setEtaRemaining(null);
    setOriginalEta(null);
    setErrorMsg(null);
    setLastErrorDetails(null);
  };

  const downloadFile = (fileUrl) => window.open(fileUrl, '_blank');
  
  const downloadAll = async (format) => { 
    if (!jobId) return; 
    setIsDownloading(true);
    
    try {
      // Show appropriate toast message based on format
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
      
      // Create a hidden link and trigger download
      const link = document.createElement('a');
      link.href = `/api/stems/download/${jobId}?format=${format}`;
      link.download = `stems-${jobId}-${format}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Success notification
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
  
  const formatTime = (t) => { if (!t || isNaN(t)) return '0:00'; const m = Math.floor(t/60); const s = Math.floor(t%60).toString().padStart(2,'0'); return `${m}:${s}`; };
  
  const formatEtaTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return '0:00';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  if (!show) return null;

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

            {!jobId && (
              <div>
                {/* Vocals checkbox */}
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
                  <button className="btn" onClick={startExtraction} disabled={loading} style={{background:'linear-gradient(90deg, var(--orange), var(--pink), var(--purple))', color:'#fff', border:'none'}}>
                    {loading ? (<><span className="spinner-border spinner-border-sm me-2" role="status"/>Starting...</>) : 'Extract Stems'}
                  </button>
                  <button className="btn btn-outline-light" onClick={onClose}>Close</button>
                </div>
              </div>
            )}

            {jobId && (
              <div>
                {/* Error banner and actions */}
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
                {/* Toggleable details for debugging */}
                {errorMsg && lastErrorDetails && (
                  <div style={{marginBottom:12}}>
                    <details style={{color:'#c9c9c9'}}>
                      <summary style={{cursor:'pointer'}}>Show error details</summary>
                      <pre style={{background:'#0f1220', padding:10, borderRadius:6, overflowX:'auto', color:'#e6eef8'}}>
                        {JSON.stringify(lastErrorDetails, null, 2)}
                      </pre>
                    </details>
                  </div>
                )}
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <div>
                    <div style={{fontSize:14}}><strong>Status:</strong> {status}</div>
                    <div style={{fontSize:13, color:'#9aa0b4'}}>
                      Progress: {progress}% 
                      {etaRemaining !== null ? ` • ETA: ${formatEtaTime(etaRemaining)}` : ''}
                      {originalEta && etaRemaining !== null ? ` (of ${formatEtaTime(originalEta)})` : ''}
                    </div>
                  </div>
                  {status !== 'completed' && (
                    <div style={{height:10, background:'#1f2230', borderRadius:8, overflow:'hidden', flex:1, margin:'0 12px'}}>
                      <div style={{width:`${progress}%`, height:'100%', background:'linear-gradient(90deg,var(--orange),var(--pink))', transition:'width 600ms ease'}} />
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
                
                {status === 'processing' && (
                  <div className="text-center py-3 d-flex align-items-center justify-content-center" style={{color:'#9aa0b4', gap:10}}>
                    <div className="spinner-border text-light" role="status" style={{width:20, height:20}}>
                      <span className="visually-hidden">Loading...</span>
                    </div>
                    <div>Processing... please wait</div>
                  </div>
                )}

                {status !== 'completed' && (
                    <div style={{width:'100%', marginTop:8, color:'#9aa0b4', fontSize:13, textAlign:'center'}}>
                      {etaRemaining !== null ? (
                        <div><span className="visually-hidden">Loading...</span> Processing your audio... approx {formatEtaTime(etaRemaining)} (may take longer for multiple stems)</div>
                      ) : (
                        <div>Processing your audio... this may take a little while</div>
                      )}
                    </div>
                  )}
                {status === 'completed' && (
                  <div>
                    <table className="table table-dark table-striped" style={{marginTop:20}}>
                      <thead>
                        <tr>
                          <th>Stem Name</th>
                          <th>Audio Type</th>
                          <th>Download</th>
                        </tr>
                      </thead>
                      <tbody>
                        {stems.filter(s => filterType==='all' ? true : s.type===filterType).map((s, i) => (
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
                    
                    {/* Download All Section with Format Options */}
                    <div className="mt-3">
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
                  </div>
                )}
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};

export default StemsModal;