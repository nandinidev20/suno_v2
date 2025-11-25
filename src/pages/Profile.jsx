import { useState, useEffect, useRef } from "react";
import { useAuth } from "../contexts/AuthContext";
import { tracksAPI, stripeAPI } from "../utils/api";
import FooterPlayer from "../components/FooterPlayer";
import { Link } from 'react-router-dom';
import {
  Music,
  Trash2,
  Eye,
  EyeOff,
  Plus,
  LogOut,
} from "lucide-react";
import toast from "react-hot-toast";
import LeftSideBar from "../components/LeftSideBar";


const Profile = () => {
  const { user, logout } = useAuth();
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [showPrivate, setShowPrivate] = useState(true);

  // --- Audio Player State (copied from Generate.jsx) ---
  const [currentTrack, setCurrentTrack] = useState(null); // Track object
  const [showFooterPlayer, setShowFooterPlayer] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioTime, setAudioTime] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);
  const audioRef = useRef(null);

  useEffect(() => {
    fetchTracks();
    // Handle Stripe payment redirect
    const urlParams = new URLSearchParams(window.location.search);
    const sessionId = urlParams.get('session_id');
    const isUpgrade = urlParams.get('upgrade') === 'true';
    if (sessionId) {
      // Call backend to save subscription
      stripeAPI.handlePaymentSuccess(sessionId)
        .then(() => {
          if (isUpgrade) {
            toast.success('Your subscription has been upgraded!');
          } else {
            toast.success('Your subscription is now active!');
          }
          // Optionally refresh tracks or subscription info here
        })
        .catch(() => {
          toast.error('Failed to activate subscription. Please contact support.');
        });
      // Remove session_id and upgrade from URL
      const params = new URLSearchParams(window.location.search);
      params.delete('session_id');
      params.delete('upgrade');
      window.history.replaceState({}, document.title, window.location.pathname + (params.toString() ? '?' + params.toString() : ''));
    }
  }, [currentPage]);

  // --- Audio Player Logic (copied from Generate.jsx) ---
  const getTrackAudioPath = (track) => {
    return (
      track.conversion_path_1 ||
      track.conversion_path_wav_1 ||
      track.audioUrl ||
      track.audioUrlWav ||
      ''
    );
  };

  const handlePlayPause = (track) => {
    if (!showFooterPlayer) setShowFooterPlayer(true);
    const audioPath = getTrackAudioPath(track);
    const trackWithAudio = { ...track, _audioPath: audioPath };
    if (!currentTrack || (currentTrack._audioPath !== audioPath)) {
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
      if (audioRef.current.src !== (currentTrack ? (currentTrack._audioPath || getTrackAudioPath(currentTrack)) : '')) {
        audioRef.current.src = currentTrack ? (currentTrack._audioPath || getTrackAudioPath(currentTrack)) : '';
      }
      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch((e) => {
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

    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('loadedmetadata', onLoadedMetadata);
    audio.addEventListener('ended', onEnded);

    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('loadedmetadata', onLoadedMetadata);
      audio.removeEventListener('ended', onEnded);
    };
  }, [currentTrack]);

  const handleSeek = (time) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setAudioTime(time);
    }
  };

  const formatTime = (sec) => {
    if (!sec && sec !== 0) return '00:00';
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const fetchTracks = async () => {
    try {
      setLoading(true);
      const response = await tracksAPI.getMyTracks(currentPage);
      const newTracks = response.data.tracks;

      if (currentPage === 1) {
        setTracks(newTracks);
      } else {
        setTracks((prev) => [...prev, ...newTracks]);
      }

      setHasMore(response.data.pagination.hasNext);
    } catch (error) {
      console.error("Error fetching tracks:", error);
      toast.error("Failed to load tracks");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTrack = async (trackId) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this track? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      await tracksAPI.deleteTrack(trackId);
      setTracks((prev) => prev.filter((track) => track._id !== trackId));
      toast.success("Track deleted successfully");
    } catch (error) {
      toast.error("Failed to delete track");
    }
  };

  const handleToggleVisibility = async (trackId, currentVisibility) => {
    try {
      await tracksAPI.updateTrack(trackId, { isPublic: !currentVisibility });
      setTracks((prev) =>
        prev.map((track) =>
          track._id === trackId
            ? { ...track, isPublic: !currentVisibility }
            : track
        )
      );
      toast.success(`Track made ${!currentVisibility ? "public" : "private"}`);
    } catch (error) {
      toast.error("Failed to update track visibility");
    }
  };

  const loadMore = () => {
    if (!loading && hasMore) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const formatDuration = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  return (
    <section className="discover-section position-relative">
      <div className="container-fluid">
        <div className="discover-div d-flex">
          {/* Sidebar */}
          <LeftSideBar/>

          {/* Main Content */}
          <div className="main flex-grow-1 p-3">
            {/* Topbar */}
            <div className="topbar d-flex justify-content-between align-items-center mb-4">
              <div className="left-buttons">
                 <h1>Profile</h1>
              </div>
              <div className="d-flex align-items-center gap-3">
                <button
                  onClick={logout}
                  className="btn btn-secondary me-2"
                >
                  <LogOut className="me-2" size={16} />
                  Logout
                </button>

              </div>
            </div>


            {/* Profile Header */}
            <div className="card bg-dark text-white border-secondary mb-4">
              <div className="card-body d-flex justify-content-between align-items-center">
                <div>
                  <h4>{user?.email}</h4>
                  <p className="mb-0 small">
                    Member since{" "}
                    {(() => {
                      // Prefer user.createdAt, fallback to user.created_at, fallback to lastReset
                      const raw = user?.createdAt || user?.created_at || user?.lastReset;
                      if (!raw) return "-";
                      const date = new Date(raw);
                      if (isNaN(date)) return "-";
                      const day = date.getDate();
                      const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sept", "Oct", "Nov", "Dec"];
                      const month = monthNames[date.getMonth()];
                      const year = date.getFullYear();
                      return `${day}-${month}-${year}`;
                    })()}
                  </p>
                </div>
                <div>
                  <Link to="/membership" className="btn btn-outline-info">My Membership</Link>
                </div>
              </div>
            </div>

             {/* Tracks Section */}
             <div className="card-header d-flex justify-content-between">
                <h5>Your Generated Music</h5>
                <button
                  onClick={() => setShowPrivate(!showPrivate)}
                  className="btn btn-outline-light btn-sm"
                >
                  {showPrivate ? "Hide Private" : "Show Private"}
                </button>
              </div>
             <div className="card bg-dark border-secondary text-white">
              <div className="card-body">
                {tracks.length === 0 ? (
                  <div className="text-center py-5">
                    <Music size={64} className="text-muted mb-3" />
                    <h4>No tracks yet</h4>
                    <a href="/generate" className="btn btn-primary">
                      <Plus size={16} className="me-2" />
                      Generate Music
                    </a>
                  </div>
                ) : (
                  <>
                    <div className="table-responsive">
                      <table className="table table-dark table-striped align-middle">
                        <thead>
                          <tr>
                            <th>Thumbnail</th>
                            <th>Prompt</th>
                            <th>Style</th>
                            <th>Duration</th>
                            <th>Player</th>
                            {/* <th>Created</th> */}
                            <th>Status</th>
                            <th>Visibility</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {tracks
                            .filter((track) => showPrivate || track.isPublic)
                            .map((track) => (
                              <tr key={track._id}>
                                <td>
                                  <img src={track.albumCover || "img/video-bg.jpg"} alt="cover" style={{width:48, height:48, objectFit:'cover', borderRadius:8}} />
                                </td>
                                <td style={{ maxWidth: 180 }}  className="text-truncate" title={track.prompt}>
                                  { track.prompt ? track.prompt.charAt(0).toUpperCase() + track.prompt.slice(1) : ''}
                                </td>
                                <td><span className="badge bg-primary">{track.style}</span></td>
                                <td>{formatDuration(track.duration)}</td>
                                <td>
                                  {/* Play/Pause button overlay like Generate.jsx */}
                                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <button
                                      className="btn btn-link"
                                      style={{ fontSize: 22, color: '#fff', border: 'none', background: 'none', borderRadius: '50%', backgroundClip: 'padding-box', width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundImage: 'linear-gradient(180deg, var(--orange), var(--pink), var(--purple))', boxShadow: '0 2px 8px #a78bfa44', cursor: 'pointer' }}
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
                                    <span style={{ color: '#fff', fontSize: '14px', background: 'rgba(30,30,40,0.7)', borderRadius: 6, padding: '2px 10px', letterSpacing: '0.5px' }}>
                                      {currentTrack &&
                                        (currentTrack._audioPath
                                          ? currentTrack._audioPath === getTrackAudioPath(track)
                                          : currentTrack._id === track._id) &&
                                        isPlaying
                                        ? formatTime(audioTime)
                                        : formatTime(track.duration || 0)}
                                    </span>
                                  </div>
                                </td>
                                {/* <td>{(track.createdAt || track.created_at) ? new Date(track.createdAt || track.created_at).toLocaleDateString() : '-'}</td> */}
                                <td>{ track.status }</td>
                                <td>
                                  <span className={`badge ${track.isPublic ? 'bg-success' : 'bg-warning'} small`}>
                                    {track.isPublic ? 'Public' : 'Private'}
                                  </span>
                                </td>
                                <td>
                                  <div className="d-flex gap-2">
                                    <button
                                      onClick={() => handleToggleVisibility(track._id, track.isPublic)}
                                      className="btn btn-sm btn-outline-light"
                                      title={track.isPublic ? "Make Private" : "Make Public"}
                                    >
                                      {track.isPublic ? <Eye size={16} /> : <EyeOff size={16} />}
                                    </button>
                                    <button
                                      onClick={() => handleDeleteTrack(track._id)}
                                      className="btn btn-sm btn-outline-danger"
                                      title="Delete Track"
                                    >
                                      <Trash2 size={16} />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>
                    {hasMore && (
                      <div className="text-center mt-4">
                        <button
                          onClick={loadMore}
                          disabled={loading}
                          className="btn btn-outline-primary px-4"
                        >
                          {loading ? "Loading..." : "Load More Tracks"}
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Hidden audio element for playback */}
      <audio
        ref={audioRef}
        style={{ display: 'none' }}
      />

      {showFooterPlayer && currentTrack && (
        <div style={{position:'fixed', left:0, right:0, bottom:3, zIndex:1000, padding:0, margin:0}}>
          <FooterPlayer
            track={{
              ...currentTrack,
              album_cover_path: currentTrack.album_cover_path || currentTrack.albumCover || 'img/video-bg.jpg'
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
    </section>
  );
};

export default Profile;
