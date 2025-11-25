import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { tracksAPI, stripeAPI } from "../utils/api";
import AudioPlayer from "../components/AudioPlayer";
import LoadingSpinner from "../components/LoadingSpinner";
import { Link } from 'react-router-dom';
import {
  Music,
  Crown,
  Settings,
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
                <h5>Your Music</h5>
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
                                  <audio controls style={{width:160}}>
                                    <source src={track.audioUrl || track.audioUrlWav} type="audio/mpeg" />
                                    Your browser does not support the audio element.
                                  </audio>
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

            {/* Subscription Status */}
            {/* <SubscriptionStatus /> */}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Profile;
