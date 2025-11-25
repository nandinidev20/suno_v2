import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { tracksAPI } from '../utils/api';
import toast from 'react-hot-toast';

const Explore = () => {
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('trending');
  const { user } = useAuth();

  const categories = [
    { id: 'trending', name: 'Trending', icon: 'fa-fire' },
    { id: 'new', name: 'New Releases', icon: 'fa-star' },
    { id: 'popular', name: 'Popular', icon: 'fa-thumbs-up' },
    { id: 'random', name: 'Random', icon: 'fa-random' }
  ];

  useEffect(() => {
    fetchTracks();
  }, [currentPage, selectedCategory]);

  const fetchTracks = async () => {
    try {
      setLoading(true);
      const response = await tracksAPI.getPublicTracks(currentPage);
      const newTracks = response.data.tracks;
      
      if (currentPage === 1) {
        setTracks(newTracks);
      } else {
        setTracks(prev => [...prev, ...newTracks]);
      }
      
      setHasMore(response.data.pagination.hasNext);
    } catch (error) {
      console.error('Error fetching tracks:', error);
      toast.error('Failed to load tracks');
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div>
      {/* Topbar */}
      <div className="topbar">
        <div className="left-buttons">
          <button className="greybtn">Filter</button>
          <button className="greybtn">Sort</button>
        </div>
        <div className="d-flex g-3">
          <div className="mode-buttons">
            {categories.map((category) => (
              <a
                key={category.id}
                href="#"
                className={`btn-slider ${selectedCategory === category.id ? 'active' : ''}`}
                onClick={(e) => {
                  e.preventDefault();
                  setSelectedCategory(category.id);
                  setCurrentPage(1);
                }}
              >
                <i className={`fa ${category.icon}`}></i> {category.name}
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Explore Content */}
      <div className="space-y-6">
        <h2 className="section-title">Explore Music</h2>

        {/* Category Tabs */}
        <div className="category-tabs">
          {categories.map((category) => (
            <button
              key={category.id}
              className={`category-tab ${selectedCategory === category.id ? 'active' : ''}`}
              onClick={() => {
                setSelectedCategory(category.id);
                setCurrentPage(1);
              }}
            >
              <i className={`fa ${category.icon}`}></i>
              {category.name}
            </button>
          ))}
        </div>

        {tracks.length === 0 && !loading ? (
          <div className="workspace-box">
            <div className="text-center">
              <h3>No tracks to explore</h3>
              <p className="text-gray-400 mt-2">
                Check back later for new music!
              </p>
            </div>
          </div>
        ) : (
          <div className="generations">
            {tracks.map((track) => (
              <div key={track._id} className="generation-card">
                <div className="track-image">
                  <img src={track.albumCover || "/img/video-bg.jpg"} alt="Album Art" />
                  <div className="play-div">
                    <div className="play-btn"></div>
                    <div className="duration">{formatDuration(track.duration || 168)}</div>
                  </div>
                </div>
                <div className="track-title text-ellipsis">{track.title || 'Untitled Track'}</div>
                <div className="track-workspace text-ellipsis">{track.artist || 'Unknown Artist'}</div>
              </div>
            ))}
          </div>
        )}

        {/* Load More Button */}
        {hasMore && (
          <div className="load-div">
            <button
              onClick={() => setCurrentPage(prev => prev + 1)}
              disabled={loading}
              className="btn-gradient"
            >
              {loading ? 'Loading...' : 'Load More Tracks'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Explore;
