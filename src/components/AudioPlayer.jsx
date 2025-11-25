import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, Download, Heart, Share2, Music2 } from 'lucide-react';
import { tracksAPI } from '../utils/api';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

const AudioPlayer = ({ track, onLike, showActions = true }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(track?.likes?.length || 0);
  
  const audioRef = useRef(null);
  const { user } = useAuth();

  useEffect(() => {
    if (track?.likes) {
      setIsLiked(track.likes.includes(user?._id));
      setLikeCount(track.likes.length);
    }
  }, [track, user]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);
    const handleEnded = () => setIsPlaying(false);

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('ended', handleEnded);
    };
  }, []);

  const togglePlay = () => {
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleSeek = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    const newTime = percent * duration;
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    audioRef.current.volume = newVolume;
    setIsMuted(newVolume === 0);
  };

  const toggleMute = () => {
    if (isMuted) {
      audioRef.current.volume = volume;
      setIsMuted(false);
    } else {
      audioRef.current.volume = 0;
      setIsMuted(true);
    }
  };

  const handleLike = async () => {
    if (!user) {
      toast.error('Please login to like tracks');
      return;
    }

    try {
      const response = await tracksAPI.likeTrack(track._id);
      setIsLiked(!isLiked);
      setLikeCount(response.data.likes);
      
      if (onLike) {
        onLike(track._id, response.data.likes);
      }
      
      toast.success(response.data.message);
    } catch (error) {
      toast.error('Failed to like track');
    }
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = track.audioUrl;
    link.download = `${track.prompt.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.mp3`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `AI Generated Music: ${track.prompt}`,
          text: `Check out this AI-generated music track: ${track.prompt}`,
          url: window.location.href,
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard!');
    }
  };

  const formatTime = (time) => {
    if (isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  if (!track?.audioUrl) {
    return (
      <div className="card">
        <div className="text-center text-gray-400">
          <p>Audio not available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card hover-lift">
      <div className="grid grid-cols-1 md:grid-cols-[140px,1fr] gap-5">
        {/* Artwork */}
        <div className="relative group rounded-xl overflow-hidden glass aspect-square md:aspect-auto md:h-[140px]">
          <div className="absolute inset-0 bg-gradient-to-br from-primary-500/30 to-secondary-500/30" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-16 w-16 rounded-xl bg-white/10 border border-white/10 flex items-center justify-center">
              <Music2 className="h-8 w-8 text-white/80" />
            </div>
          </div>
          {/* Play overlay */}
          <button
            onClick={togglePlay}
            className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <span className="w-14 h-14 rounded-full bg-white/90 text-surface-900 flex items-center justify-center shadow-glass">
              {isPlaying ? <Pause className="h-7 w-7" /> : <Play className="h-7 w-7 ml-0.5" />}
            </span>
          </button>
        </div>

        {/* Content */}
        <div className="flex flex-col">
          {/* Track Info */}
          <div className="mb-2">
            <h3 className="text-lg font-semibold text-gray-100 mb-1 line-clamp-2">{track.prompt}</h3>
            <div className="flex flex-wrap items-center gap-3 text-sm text-gray-300">
              <span className="chip">Style: {track.style}</span>
              <span className="chip">Duration: {formatTime(track.duration)}</span>
              <span className="chip">{new Date(track.createdAt).toLocaleDateString()}</span>
            </div>
          </div>

          {/* Audio Element */}
          <audio ref={audioRef} src={track.audioUrl} preload="metadata" />

          {/* Controls */}
          <div className="mt-auto space-y-3">
            {/* Progress */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-white">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
              <div
                className="w-full h-2 bg-white/10 rounded-full cursor-pointer relative overflow-hidden"
                onClick={handleSeek}
              >
                <div
                  className="h-full bg-gradient-to-r from-primary-400 to-secondary-400 rounded-full transition-all duration-150"
                  style={{ width: `${(currentTime / duration) * 100}%` }}
                />
              </div>
            </div>

            {/* Bottom Row */}
            <div className="flex items-center justify-between">
              <button
                onClick={togglePlay}
                className="w-12 h-12 rounded-full bg-gradient-to-r from-primary-500 to-secondary-500 hover:from-primary-400 hover:to-secondary-400 text-white flex items-center justify-center transition-all shadow-glass"
              >
                {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6 ml-0.5" />}
              </button>

              {/* Volume */}
              <div className="hidden md:flex items-center space-x-3 px-3 py-2 rounded-xl bg-white/5 border border-white/10 backdrop-blur">
                <button
                  onClick={toggleMute}
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
                </button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={isMuted ? 0 : volume}
                  onChange={handleVolumeChange}
                  className="w-28 h-2 bg-white/10 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              {/* Actions */}
              {showActions && (
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleLike}
                    className={`px-3 py-2 rounded-xl transition-all border backdrop-blur ${
                      isLiked
                        ? 'text-red-300 bg-red-500/10 border-red-500/20'
                        : 'text-gray-300 hover:text-red-300 bg-white/5 border-white/10'
                    }`}
                  >
                    <span className="inline-flex items-center space-x-2">
                      <Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
                      <span>{likeCount}</span>
                    </span>
                  </button>

                  <button
                    onClick={handleShare}
                    className="px-3 py-2 rounded-xl text-gray-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 backdrop-blur transition-all"
                  >
                    <span className="inline-flex items-center space-x-2">
                      <Share2 className="h-4 w-4" />
                      <span>Share</span>
                    </span>
                  </button>

                  <button
                    onClick={handleDownload}
                    className="px-3 py-2 rounded-xl text-gray-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 backdrop-blur transition-all"
                  >
                    <span className="inline-flex items-center space-x-2">
                      <Download className="h-4 w-4" />
                      <span>Download</span>
                    </span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AudioPlayer; 