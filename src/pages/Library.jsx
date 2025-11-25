import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import FooterPlayer from "../components/FooterPlayer";
import { tracksAPI } from "../utils/api";
import LeftSideBar from "../components/LeftSideBar";
import StemsModal from "../components/StemsModal";
import AudioToMidiModal from "../components/AudioToMidiModal";
import { useStemsManager } from "../contexts/StemsContext";

const SONGS_PER_PAGE = 15;

const Library = () => {
  const navigate = useNavigate();
  const [tracks, setTracks] = useState([]);
  const [allTracks, setAllTracks] = useState([]); // for client-side search/filter
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalTracks, setTotalTracks] = useState(0);
  const [currentTrack, setCurrentTrack] = useState(null);
  const [showStemsModal, setShowStemsModal] = useState(false);
  const [stemsTrack, setStemsTrack] = useState(null);
  const [showMidiModal, setShowMidiModal] = useState(false);
  const [midiTrack, setMidiTrack] = useState(null);
  const [showFooterPlayer, setShowFooterPlayer] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioTime, setAudioTime] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilter, setShowFilter] = useState(false);
  const [selectedStyle, setSelectedStyle] = useState("");
  const [downloadingTrackId, setDownloadingTrackId] = useState(null);
  const [downloadingWavTrackId, setDownloadingWavTrackId] = useState(null);
  const audioRef = useRef(null);

  useEffect(() => {
    fetchAllTracks();
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    applyFilters();
    // eslint-disable-next-line
  }, [searchTerm, selectedStyle, allTracks, currentPage]);

  const fetchAllTracks = async () => {
    setLoading(true);
    try {
      // Fetch all tracks for the user (up to 500 for client-side filtering)
      const res = await tracksAPI.getMyTracks(1, 500);
      setAllTracks(res.data.tracks || []);
    } catch (e) {
      setAllTracks([]);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = allTracks;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(track =>
        (track.prompt && track.prompt.toLowerCase().includes(term)) ||
        (track.style && track.style.toLowerCase().includes(term)) ||
        (track.tags && track.tags.join(",").toLowerCase().includes(term))
      );
    }
    if (selectedStyle) {
      filtered = filtered.filter(track => track.style === selectedStyle);
    }
    setTotalTracks(filtered.length);
    // Pagination
    const start = (currentPage - 1) * SONGS_PER_PAGE;
    const end = start + SONGS_PER_PAGE;
    setTracks(filtered.slice(start, end));
  };

  // Get unique styles for filter dropdown
  const uniqueStyles = Array.from(new Set(allTracks.map(t => t.style).filter(Boolean)));

  const getTrackAudioPath = (track) => {
    const audioPath = (
      track.conversion_path_1 ||
      track.conversion_path_wav_1 ||
      track.audioUrl ||
      track.audioUrlWav ||
      ""
    );
    console.log('Library.jsx - getTrackAudioPath for track:', track._id, 'audioPath:', audioPath);
    return audioPath;
  };

  const getTrackWavPath = (track) => {
    const wavPath = (
      track.audio_url_wav ||
      track.audioUrlWav ||
      track.conversion_path_wav ||
      track.conversion_path_wav_1 ||
      track.audio_url_wav_1 ||
      ""
    );
    console.log('Library.jsx - getTrackWavPath for track:', track._id, 'wavPath:', wavPath);
    return wavPath;
  };

  const handlePlayPause = (track) => {
    if (!showFooterPlayer) setShowFooterPlayer(true);
    const audioPath = getTrackAudioPath(track);
    const trackWithAudio = { ...track, _audioPath: audioPath };
    if (!currentTrack || currentTrack._audioPath !== audioPath) {
      setCurrentTrack(trackWithAudio);
      setShowFooterPlayer(true);
      setAudioTime(0);
      setAudioDuration(0);
      setIsPlaying(false);
      setTimeout(() => setIsPlaying(true), 50);
    } else {
      setIsPlaying((prev) => !prev);
    }
  };

  useEffect(() => {
    if (!audioRef.current) return;
    if (isPlaying) {
      if (
        audioRef.current.src !==
        (currentTrack ? currentTrack._audioPath || getTrackAudioPath(currentTrack) : "")
      ) {
        audioRef.current.src = currentTrack
          ? currentTrack._audioPath || getTrackAudioPath(currentTrack)
          : "";
      }
      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          setIsPlaying(false);
        });
      }
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying, currentTrack]);

  useEffect(() => {
    if (!audioRef.current) return;
    const audio = audioRef.current;
    const onTimeUpdate = () => setAudioTime(audio.currentTime);
    const onLoadedMetadata = () => setAudioDuration(audio.duration);
    const onEnded = () => setIsPlaying(false);
    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("loadedmetadata", onLoadedMetadata);
    audio.addEventListener("ended", onEnded);
    return () => {
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("loadedmetadata", onLoadedMetadata);
      audio.removeEventListener("ended", onEnded);
    };
  }, [currentTrack]);

  const handleSeek = (time) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setAudioTime(time);
    }
  };

  // Handle remix/cover functionality
  const handleRemixCover = (track) => {
    
    // Prepare remix data
    const remixData = {
      trackId: track._id || track.id,
      lyrics: track.prompt || track.lyrics || '',
      prompt: track.prompt || '', // Also store as prompt field
      style: track.style || 'music',
      audioUrl: getTrackAudioPath(track),
      trackName: track.prompt || 'Remix Track'
    };
    
    
    // Navigate to Generate page with state instead of query params
    navigate('/generate', {
      state: {
        mode: 'custom',
        remix: true,
        remixTrackData: remixData
      }
    });
  };

  // Download track function
  const handleDownload = async (track) => {
    try {
      // Set loading state for this specific track
      //console.log('Starting download for track:', track._id || track.id, track.prompt);
      setDownloadingTrackId(track._id || track.id);
      
      const audioUrl = getTrackAudioPath(track);
      if (!audioUrl) {
        alert('Audio file not available');
        setDownloadingTrackId(null);
        return;
      }

      // Create a sanitized filename from prompt
      const promptName = track.prompt || 'music';
      // Remove special characters and limit length
      const sanitizedName = promptName
        .replace(/[^a-zA-Z0-9\s-_]/g, '')
        .replace(/\s+/g, '_')
        .substring(0, 30);
      
      // Determine file extension from URL
      const extension = audioUrl.includes('.wav') ? '.wav' : '.mp3';
      const filename = `${sanitizedName}${extension}`;

      // Fetch the audio file
      const response = await fetch(audioUrl);
      const blob = await response.blob();

      // Create a download link and trigger download
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      // Clear loading state after download starts
      setDownloadingTrackId(null);
    } catch (error) {
      console.error('Download error:', error);
      setDownloadingTrackId(null);
    }
  };

  const handleDownloadWav = async (track) => {
    try {
      const trackId = track._id || track.id;
      setDownloadingWavTrackId(trackId);

      const wavUrl = getTrackWavPath(track);
      if (!wavUrl) {
        alert('WAV file not available for this track.');
        setDownloadingWavTrackId(null);
        return;
      }

      const promptName = track.prompt || 'music';
      const sanitizedName = promptName
        .replace(/[^a-zA-Z0-9\s-_]/g, '')
        .replace(/\s+/g, '_')
        .substring(0, 30);

      const filename = `${sanitizedName}.wav`;

      const response = await fetch(wavUrl);
      const blob = await response.blob();

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('WAV download error:', error);
    } finally {
      setDownloadingWavTrackId(null);
    }
  };

  // Pagination logic
  const totalPages = Math.ceil(totalTracks / SONGS_PER_PAGE);
  const pageNumbers = [];
  for (let i = 1; i <= totalPages; i++) pageNumbers.push(i);

  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages || page === currentPage) return;
    setCurrentPage(page);
  };

  return (
    <>
      <section className="discover-section position-relative">
        <div className="container-fluid">
          <div className="discover-div">
            <LeftSideBar />
            <div className="main" style={{marginBottom:'19%'}}>
              <div className="library-container">
                <h1>Library</h1>
                <div className="library-head">
                  <div className="filter-search" style={{position:'relative'}}>
                    <button className="filter-btn btn-slider" onClick={() => setShowFilter(f => !f)}>
                      <i className="fas fa-filter"></i> Filter
                    </button>
                    {showFilter && (
                      <div style={{
                        position:'absolute',
                        top:'110%',
                        left:0,
                        background:'linear-gradient(135deg, #23263a 80%, #a78bfa 100%)',
                        borderRadius:12,
                        zIndex:10,
                        padding:8,
                        minWidth:180,
                        boxShadow:'0 4px 16px #0008',
                        color:'#fff',
                        border:'1px solid #a78bfa',
                      }}>
                        <div style={{marginBottom:10, fontWeight:600, color:'#a78bfa', letterSpacing:'0.5px'}}>Filter by Style</div>
                        <select
                          className="form-select"
                          style={{
                            background:'#18192a',
                            color:'#fff',
                            border:'1px solid #a78bfa',
                            borderRadius:8,
                            marginBottom:10,
                          }}
                          value={selectedStyle}
                          onChange={e => {setSelectedStyle(e.target.value); setCurrentPage(1);}}
                        >
                          <option value="">All Styles</option>
                          {uniqueStyles.map(style => (
                            <option key={style} value={style}>{style}</option>
                          ))}
                        </select>
                        <button
                          className="btn btn-sm"
                          style={{
                            background:'linear-gradient(90deg, var(--orange), var(--pink), var(--purple))',
                            color:'#fff',
                            border:'none',
                            borderRadius:6,
                            fontWeight:500,
                            padding:'4px 18px',
                            boxShadow:'0 2px 8px #a78bfa44',
                          }}
                          onClick={() => {setSelectedStyle(""); setShowFilter(false);}}
                        >
                          Clear
                        </button>
                      </div>
                    )}
                    <div className="search-box">
                      <i className="fas fa-search"></i>
                      <input
                        type="text"
                        placeholder="Search by song name, style or lyrics"
                        value={searchTerm}
                        onChange={e => {setSearchTerm(e.target.value); setCurrentPage(1);}}
                        style={{width:180}}
                      />
                    </div>
                  </div>
                  {/* <div className="upload-box">
                    <label htmlFor="file-upload" className="btn-slider">
                      <i className="fas fa-upload"></i> Upload File
                    </label>
                    <input id="file-upload" type="file" />
                  </div> */}
                </div>
              </div>
              <div className="library-list mt-3">
                <ul className="nav nav-tabs" id="myTab" role="tablist">
                  <li className="nav-item" role="presentation">
                    <button className="nav-link active" id="songs-tab" data-bs-toggle="tab" data-bs-target="#songs" type="button"
                      role="tab" aria-controls="songs" aria-selected="true">
                      Songs
                    </button>
                  </li>
                </ul>
                <div className="tab-content">
                  <div className="tab-pane active" id="songs" role="tabpanel" aria-labelledby="songs-tab">
                    <div className="library-list">
                      {loading ? (
                        <div className="text-center py-5">
                          <div className="spinner-border text-primary" style={{width: '2rem', height: '2rem'}} role="status">
                            <span className="visually-hidden">Loading...</span>
                          </div>
                        </div>
                      ) : tracks.length === 0 ? (
                        <div className="text-center py-5">
                          <h4>No tracks yet</h4>
                        </div>
                      ) : (
                        tracks.map((track, i) => (
                          <div className="song-item" key={track._id || i}>
                            <div className="song-img">
                              <img src={track.album_cover_path || track.albumCover || 'img/bg.jpg'} alt="Album Cover" className="album-cover" />
                              <span className="play-overlay" style={{top:'43%', left:'40%'}}>
                                <button
                                  className="btn btn-link"
                                  style={{ fontSize: 22, color: '#fff', border: 'none', borderRadius: '50%', backgroundClip: 'padding-box', width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                                  onClick={() => handlePlayPause(track)}
                                  type="button"
                                >
                                  <i className={`bi ${
                                    currentTrack &&
                                    isPlaying &&
                                    (currentTrack._audioPath
                                      ? currentTrack._audioPath === getTrackAudioPath(track)
                                      : currentTrack._id === track._id)
                                      ? 'bi-pause-fill'
                                      : 'bi-play-fill'
                                  }`} style={{fontSize: 22, color: '#fff'}}></i>
                                </button>
                              </span>
                            </div>
                            <div className="song-info">
                              <h3>{track.prompt ? (track.prompt.charAt(0).toUpperCase() + (track.prompt.length > 100 ? track.prompt.slice(1, 100) + '...' : track.prompt.slice(1))) : ''}</h3>
                              <p>Tags: {track.style || 'music'}{track.tags && track.tags.length ? ', ' + track.tags.join(', ') : ''}</p>
                            </div>
                            <div className="actions icons" style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px'
                            }}>
                              <button 
                                className="follow-btn" 
                                onClick={() => handleDownload(track)}
                                disabled={downloadingTrackId === (track._id || track.id)}
                                style={{
                                  opacity: downloadingTrackId === (track._id || track.id) ? 0.7 : 1,
                                  cursor: downloadingTrackId === (track._id || track.id) ? 'not-allowed' : 'pointer',
                                  padding: '8px 16px',
                                  borderRadius: '6px',
                                  border: 'none',
                                  color: '#fff',
                                  fontSize: '14px',
                                  fontWeight: '500',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '6px',
                                  transition: 'all 0.3s ease',
                                  minHeight: '36px'
                                }}
                                onMouseEnter={(e) => {
                                  if (!e.target.disabled) {
                                    e.target.style.transform = 'translateY(-1px)';
                                    e.target.style.boxShadow = '0 4px 12px rgba(167, 139, 250, 0.4)';
                                  }
                                }}
                                onMouseLeave={(e) => {
                                  e.target.style.transform = 'translateY(0)';
                                  e.target.style.boxShadow = 'none';
                                }}
                              > 
                                {downloadingTrackId === (track._id || track.id) ? (
                                  <>
                                    <span className="spinner-border spinner-border-sm me-2" role="status" style={{ width: '14px', height: '14px' }}>
                                      <span className="visually-hidden">Loading...</span>
                                    </span>
                                    Downloading...
                                  </>
                                ) : (
                                  <>
                                    <i className="bi bi-download"></i> Download
                                  </>
                                )}
                              </button>
                              {/* <a href="#"><i className="bi bi-chat-dots-fill"></i></a>
                              <a href="#"><i className="bi bi-hand-thumbs-up"></i></a>
                              <a href="#"><i className="bi bi-hand-thumbs-down"></i></a> */}
                              <div className="dropdown iconoption-div" style={{background:'none'}}>
                                <a 
                                  href="#" 
                                  data-bs-toggle="dropdown" 
                                  aria-expanded="false"
                                  style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    width: '36px',
                                    height: '36px',
                                    borderRadius: '6px',
                                    background: 'rgba(255, 255, 255, 0.1)',
                                    border: '1px solid rgba(255, 255, 255, 0.2)',
                                    color: '#fff',
                                    textDecoration: 'none',
                                    transition: 'all 0.3s ease',
                                    fontSize: '16px'
                                  }}
                                  onMouseEnter={(e) => {
                                    e.target.style.background = 'rgba(255, 255, 255, 0.2)';
                                    e.target.style.transform = 'translateY(-1px)';
                                    e.target.style.boxShadow = '0 4px 12px rgba(255, 255, 255, 0.1)';
                                  }}
                                  onMouseLeave={(e) => {
                                    e.target.style.background = 'rgba(255, 255, 255, 0.1)';
                                    e.target.style.transform = 'translateY(0)';
                                    e.target.style.boxShadow = 'none';
                                  }}
                                >
                                  <i className="bi bi-three-dots-vertical"></i>
                                </a>
                                  <ul className="dropdown-menu">
                                    {track.conversion_type !== 'OneShot' && (
                                      <>
                                        <li><a className="dropdown-item" href="#" onClick={(e) => { e.preventDefault(); setStemsTrack(track); setShowStemsModal(true); }}>Get Stems</a></li>
                                        <li><a className="dropdown-item" href="#" onClick={(e) => { e.preventDefault(); handleRemixCover(track); }}>Remix</a></li>
                                        <li><a className="dropdown-item" href="#" onClick={(e) => { e.preventDefault(); setMidiTrack(track); setShowMidiModal(true); }}>Get MIDI</a></li>
                                      </>
                                    )}
                                    <li>
                                      <a
                                        className={`dropdown-item${downloadingWavTrackId === (track._id || track.id) ? ' disabled' : ''}`}
                                        href="#"
                                        onClick={(e) => {
                                          e.preventDefault();
                                          if (downloadingWavTrackId === (track._id || track.id)) return;
                                          handleDownloadWav(track);
                                        }}
                                      >
                                        {downloadingWavTrackId === (track._id || track.id) ? (
                                          <>
                                            <span className="spinner-border spinner-border-sm me-2" role="status" style={{ width: '14px', height: '14px' }}>
                                              <span className="visually-hidden">Loading...</span>
                                            </span>
                                            Downloading WAV...
                                          </>
                                        ) : (
                                          <>Download WAV</>
                                        )}
                                      </a>
                                    </li>
                                  </ul>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                    {/* Pagination */}
                    {totalPages > 1 && (
                      <div className="pagination-div">
                        <nav aria-label="Page navigation example">
                          <ul className="pagination">
                            <li className={`page-item${currentPage === 1 ? ' disabled' : ''}`}>
                              <button className="page-link" aria-label="Previous" onClick={() => handlePageChange(currentPage - 1)}>
                                <span aria-hidden="true">&lt;</span>
                              </button>
                            </li>
                            {pageNumbers.map((num) => (
                              <li key={num} className={`page-item${currentPage === num ? ' active' : ''}`}>
                                <button className="page-link" onClick={() => handlePageChange(num)}>{num}</button>
                              </li>
                            ))}
                            <li className={`page-item${currentPage === totalPages ? ' disabled' : ''}`}>
                              <button className="page-link" aria-label="Next" onClick={() => handlePageChange(currentPage + 1)}>
                                <span aria-hidden="true">&gt;</span>
                              </button>
                            </li>
                          </ul>
                        </nav>
                      </div>
                    )}
                  </div>
                </div>
                {/* Hidden audio element for playback */}
                <audio ref={audioRef} style={{ display: 'none' }} />
                {/* Footer Player */}
                {showFooterPlayer && currentTrack && (
                  <div style={{position:'fixed', left:0, right:0, bottom:3, zIndex:1000, padding:0, margin:0}}>
                    <FooterPlayer
                      track={{
                        ...currentTrack,
                        album_cover_path: currentTrack.album_cover_path || currentTrack.albumCover || 'img/bg.jpg'
                      }}
                      isPlaying={isPlaying}
                      currentTime={audioTime}
                      duration={audioDuration || (currentTrack ? currentTrack.duration : 0)}
                      onPlayPause={() => {
                        if (currentTrack) {
                          if (!isPlaying) setIsPlaying(true);
                          else setIsPlaying(false);
                        }
                      }}
                      onSeek={handleSeek}
                      rightContent={
                        <button
                          style={{
                            background:'none',
                            border:'none',
                            color:'#fff',
                            fontSize:22,
                            marginLeft:16,
                            cursor:'pointer',
                            display:'flex',
                            alignItems:'center',
                            justifyContent:'center',
                          }}
                          title="Close Player"
                          onClick={() => {
                            setShowFooterPlayer(false);
                            setIsPlaying(false);
                            setCurrentTrack(null);
                          }}
                        >
                          <i className="bi bi-x-lg"></i>
                        </button>
                      }
                    />
                  </div>
                )}
                {showStemsModal && <StemsModal show={showStemsModal} onClose={() => setShowStemsModal(false)} track={stemsTrack} />}
                {showMidiModal && <AudioToMidiModal show={showMidiModal} onClose={() => setShowMidiModal(false)} track={midiTrack} />}
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Library;
