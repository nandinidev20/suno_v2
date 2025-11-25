import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { tracksAPI } from '../utils/api';
import toast from 'react-hot-toast';

const Search = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const { user } = useAuth();

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setLoading(true);
    setHasSearched(true);
    
    try {
      const response = await tracksAPI.searchTracks(searchQuery);
      setSearchResults(response.data.tracks || []);
    } catch (error) {
      console.error('Error searching tracks:', error);
      toast.error('Failed to search tracks');
      setSearchResults([]);
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
            <a href="#" className="btn-slider">All</a>
            <a href="#" className="btn-slider">Tracks</a>
            <a href="#" className="btn-slider active">Artists</a>
          </div>
        </div>
      </div>

      {/* Search Form */}
      <div className="form-box simple-div">
        <form onSubmit={handleSearch}>
          <label htmlFor="search">Search Music</label>
          <div className="search-field">
            <input
              id="search"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="form-control"
              placeholder="Search for tracks, artists, or genres..."
            />
            <button type="submit" className="search-btn">
              <i className="fa fa-search"></i>
            </button>
          </div>
        </form>
      </div>

      {/* Search Results */}
      <div className="space-y-6">
        {hasSearched && (
          <h2 className="section-title">
            Search Results {searchResults.length > 0 && `(${searchResults.length})`}
          </h2>
        )}

        {loading ? (
          <div className="workspace-box">
            <div className="text-center">
              <h3>Searching...</h3>
              <p className="text-gray-400 mt-2">Please wait while we search for tracks</p>
            </div>
          </div>
        ) : hasSearched && searchResults.length === 0 ? (
          <div className="workspace-box">
            <div className="text-center">
              <h3>No results found</h3>
              <p className="text-gray-400 mt-2">
                Try searching with different keywords or check your spelling
              </p>
            </div>
          </div>
        ) : searchResults.length > 0 ? (
          <div className="generations">
            {searchResults.map((track) => (
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
        ) : (
          <div className="workspace-box">
            <div className="text-center">
              <h3>Search for Music</h3>
              <p className="text-gray-400 mt-2">
                Enter a search term above to find tracks, artists, or genres
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Search;
