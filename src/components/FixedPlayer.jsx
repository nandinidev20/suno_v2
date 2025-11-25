import React from 'react';
import { Play, Pause, Volume2, VolumeX, Download, Heart, Music2 } from 'lucide-react';

const FixedPlayer = ({
  track,
  isPlaying,
  currentTime,
  duration,
  volume,
  isMuted,
  onTogglePlay,
  onSeek,
  onToggleMute,
  onVolumeChange,
  onLike,
  onDownload,
  isLiked
}) => {
  if (!track) return null;

  const formatTime = (time) => {
    if (isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="player player-footer">
      <img src={track.albumCover || "/img/ban-bg.jpg"} alt="cover" />
      <div className="player-info">
        <h4>{track.title || track.prompt} &nbsp;&nbsp; {formatTime(currentTime)} / {formatTime(duration || track.duration)}</h4>
        <div className="progress" onClick={onSeek}>
          <span style={{ width: `${(currentTime / (duration || 1)) * 100}%` }}></span>
        </div>
      </div>
      <div className="icons">
        <a href="#" onClick={(e) => { e.preventDefault(); onTogglePlay(); }}>
          <i className={`bi ${isPlaying ? 'bi-pause-fill' : 'bi-play-fill'}`}></i>
        </a>
        <a href="#" onClick={(e) => { e.preventDefault(); onLike(); }}>
          <i className={`bi ${isLiked ? 'bi-hand-thumbs-up-fill' : 'bi-hand-thumbs-up'}`}></i>
        </a>
        <a href="#" onClick={(e) => { e.preventDefault(); }}>
          <i className="bi bi-hand-thumbs-down"></i>
        </a>
        <a href="#" onClick={(e) => { e.preventDefault(); onToggleMute(); }}>
          <i className={`bi ${isMuted ? 'bi-volume-mute-fill' : 'bi-volume-up-fill'}`}></i>
        </a>
        <div className="dropdown iconoption-div">
          <a href="#" data-bs-toggle="dropdown" aria-expanded="false">
            <i className="bi bi-three-dots-vertical"></i>
          </a>
          <ul className="dropdown-menu">
            <li><a className="dropdown-item" href="#" onClick={(e) => { e.preventDefault(); onDownload(); }}>Download</a></li>
            <li><a className="dropdown-item" href="#">Share</a></li>
            <li><a className="dropdown-item" href="#">Add to Playlist</a></li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default FixedPlayer; 