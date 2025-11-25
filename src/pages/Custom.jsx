import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useGenerate, musicStyles } from '../hooks/useGenerate';
import GenerationModal from '../components/GenerationModal';
import RemixModal from '../components/RemixModal';
import CoverModal from '../components/CoverModal';
import {coverAPI} from '../utils/coverApi';
import { remixAPI, tracksAPI } from '../utils/api';
import { io as ioClient } from 'socket.io-client';

const Custom = ({
  selectedAudioFile,
  isRemixCandidate,
  isCoverCandidate,
  transcribedLyrics,
  isTranscribing,
  remixTrackData,
  coverTrackData,
  onCoverModalClose,
  onRemixModalClose
}) => {
  // Use shared generation hook
  const {
    isGenerating,
    generationProgress,
    musicGptResult,
    showModal,
    generateMusic,
    clearResults,
    closeModal,
    handleViewProfile,
    handleGenerateAnother,
  } = useGenerate();
  
  // State to manage selected styles
  const [selectedStyles, setSelectedStyles] = useState([]);
  const [styleText, setStyleText] = useState('');
  
  // Form data states
  const [lyricsText, setLyricsText] = useState('');
  
  // Cover state
  const [isCoverGenerating, setIsCoverGenerating] = useState(false);
  const [coverProgress, setCoverProgress] = useState(0);
  const [coverStatus, setCoverStatus] = useState(null);
  const [coverTaskId, setCoverTaskId] = useState(null);
  const [showCoverModal, setShowCoverModal] = useState(false);
  const [coverEta, setCoverEta] = useState(null);
  const [coverError, setCoverError] = useState(null);
  const [coverAudioUrls, setCoverAudioUrls] = useState([]); // Array of audio URLs
  const [coverFileNames, setCoverFileNames] = useState([]); // Array of file names
  const [coverAlbumCovers, setCoverAlbumCovers] = useState([]); // Array of album cover URLs
  
  // Remix state
  const [isRemixing, setIsRemixing] = useState(false);
  const [remixProgress, setRemixProgress] = useState(0);
  const [remixStatus, setRemixStatus] = useState(null);
  const [remixTaskId, setRemixTaskId] = useState(null);
  const [showRemixModal, setShowRemixModal] = useState(false);
  const [remixEta, setRemixEta] = useState(null);
  const [remixError, setRemixError] = useState(null);
  const [lyricsHeader, setLyricsHeader] = useState('Lyrics');
  const [remixAudioUrls, setRemixAudioUrls] = useState([]); // Array of audio URLs
  const [remixFileNames, setRemixFileNames] = useState([]); // Array of file names
  const [remixAlbumCovers, setRemixAlbumCovers] = useState([]); // Array of album cover URLs

  // Listen for lyrics-transcribed and cover-uploaded events from Generate.jsx
  useEffect(() => {
    const handleLyricsTranscribed = (event) => {
      const { lyrics } = event.detail;
      setLyricsText(lyrics);
      setLyricsHeader('Lyrics');
     
    };

    const handleCoverUploaded = (event) => {
      const { text, isCover, coverData } = event.detail;
      setLyricsText(text); // Set [instrumental] as text
      setLyricsHeader('Lyrics');
      // You can handle coverData here if needed
    };

    window.addEventListener('lyrics-transcribed', handleLyricsTranscribed);
    window.addEventListener('cover-uploaded', handleCoverUploaded);
    
    return () => {
      window.removeEventListener('lyrics-transcribed', handleLyricsTranscribed);
      window.removeEventListener('cover-uploaded', handleCoverUploaded);
    };
  }, []);

  // Handle remix track data from library
  useEffect(() => {
    
    if (remixTrackData) {
      // Try both lyrics and prompt fields
      const lyricsText = remixTrackData.lyrics || remixTrackData.prompt || '';     
      if (lyricsText) {
        
        // Use setTimeout to ensure this runs after other useEffects
        setTimeout(() => {
          setLyricsText(lyricsText);
          setLyricsHeader('Lyrics');
          
          // Set style if available
          if (remixTrackData.style) {
            setStyleText(remixTrackData.style);
          }
          
        }, 100);
      } else {
        console.log('No lyrics found in remix track data');
      }
    }
  }, [remixTrackData]);

  // Update lyrics when transcribedLyrics prop changes
  useEffect(() => {
    if (transcribedLyrics && !remixTrackData) {
      // Only set transcribed lyrics if we don't have remix track data
      setLyricsText(transcribedLyrics);
      
      if (isRemixCandidate) {
        setLyricsHeader('Lyrics');
      }
    }
  }, [transcribedLyrics, isRemixCandidate, remixTrackData]);

  // Socket.io connection for cover events (same as remix)
  useEffect(() => {
    if (!coverTaskId) return;

    let SOCKET_URL;
    if (window.location.hostname === 'openbeat.ai') {
      SOCKET_URL = 'https://api.openbeat.ai';
    } else {
      SOCKET_URL = `https://api.openbeat.ai`;
    }
    
    const socket = ioClient(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 20000,
      forceNew: true
    });

    // Progress simulation
    let progressInterval;
    const startTime = Date.now();
    const estimatedDuration = 120; // 2 minutes estimated

    const simulateProgress = () => {
      progressInterval = setInterval(() => {
        if (coverStatus === 'completed' || coverStatus === 'failed') {
          clearInterval(progressInterval);
          return;
        }

        const elapsed = (Date.now() - startTime) / 1000;
        const progress = Math.min(99, Math.floor((elapsed / estimatedDuration) * 100));
        const etaRemaining = Math.max(0, Math.ceil(estimatedDuration - elapsed));
        
        setCoverProgress(progress);
        setCoverEta(etaRemaining);
        if (coverStatus !== 'completed' && coverStatus !== 'failed') {
          setCoverStatus('processing');
        }
      }, 1000);
    };

    socket.on('connect', () => {
      console.log('Socket connected for cover events');
      // Start progress simulation
      simulateProgress();
    });

    // Cover completion event
    socket.on('cover-complete', (data) => {
      console.log('Cover complete received:', data);
      if (data.task_id === coverTaskId) {
        // Stop progress simulation
        if (progressInterval) clearInterval(progressInterval);
        
        setCoverProgress(100);
        setCoverStatus('completed');
        setIsCoverGenerating(false);
        
        // Extract audio URLs and file names from tracks array
        if (data.tracks && Array.isArray(data.tracks) && data.tracks.length > 0) {
          const audioUrls = data.tracks.map(track => {
            // Try different possible field names for audio URL
            return track.audio_url || 
                   track.audioUrl || 
                   track.conversion_path_1 || 
                   track.conversion_path_wav_1 ||
                   track.audioUrlWav ||
                   '';
          }).filter(Boolean);
          
          const fileNames = data.tracks.map((track, index) => 
            track.prompt || `Cover-${index + 1}`
          );

          const albumCovers = data.tracks.map(track => 
            track.album_cover || track.albumCover || null
          );

          console.log('Setting cover audio URLs:', audioUrls);
          console.log('Setting cover file names:', fileNames);
          console.log('Setting cover album covers:', albumCovers);

          if (audioUrls.length > 0) {
            setCoverAudioUrls(audioUrls);
            setCoverFileNames(fileNames);
            setCoverAlbumCovers(albumCovers);
            toast.success(data.message || `Cover generated successfully! ${data.tracks.length} version(s) created.`);
          }
        }
        
        socket.disconnect();
        console.log('Socket disconnected after cover completion');
      }
    });

    socket.on('cover-failed', (data) => {
      console.error('Cover failed:', data);
      if (data.task_id === coverTaskId) {
        // Stop progress simulation
        if (progressInterval) clearInterval(progressInterval);
        
        setIsCoverGenerating(false);
        setCoverStatus('failed');
        setCoverError(data.message || 'Cover generation failed');
        
        socket.disconnect();
        console.log('Socket disconnected after cover failure');
        
        toast.error(data.message || 'Cover generation failed');
      }
    });

    return () => {
      if (progressInterval) clearInterval(progressInterval);
      socket.disconnect();
    };
  }, [coverTaskId, coverStatus]);

  // Socket.io connection for remix events
  useEffect(() => {
    if (!remixTaskId) return;

    let SOCKET_URL;
    if (window.location.hostname === 'openbeat.ai') {
      SOCKET_URL = 'https://api.openbeat.ai';
    } else {
      SOCKET_URL = `https://api.openbeat.ai`;
    }
    
    const socket = ioClient(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 20000,
      forceNew: true
    });

    socket.on('connect', () => {
      console.log('Socket connected for remix events');
    });

    // Remix events
    socket.on('remix-progress', (data) => {
      console.log('Remix progress received:', data);
      console.log('Current remixTaskId:', remixTaskId);
      if (data.task_id === remixTaskId) {
        console.log('Updating remix progress:', data.progress);
        setRemixProgress(data.progress || 0);
        setRemixStatus(data.status || 'processing');
        if (data.etaRemaining !== undefined) {
          setRemixEta(data.etaRemaining);
        }
      } else {
        console.log('Task ID mismatch - ignoring progress update');
      }
    });

    socket.on('remix-complete', (data) => {
      console.log('Remix complete:', data);
      if (data.task_id === remixTaskId) {
        setRemixProgress(100);
        setRemixStatus('completed');
        setIsRemixing(false);
        
        // Extract audio URLs, file names, and album covers from tracks array
        if (data.tracks && Array.isArray(data.tracks) && data.tracks.length > 0) {
          const audioUrls = data.tracks.map(track => {
            // Try different possible field names for audio URL
            return track.audio_url || 
                   track.audioUrl || 
                   track.audio_url_wav || 
                   track.audioUrlWav ||
                   track.conversion_path_1 || 
                   track.conversion_path_wav_1 ||
                   '';
          }).filter(Boolean);
          
          const fileNames = data.tracks.map((track, index) => 
            track.prompt || `Remix-${index + 1}-${new Date().toLocaleDateString()}`
          );

          const albumCovers = data.tracks.map(track => 
            track.album_cover || track.albumCover || null
          );

          console.log('Setting remix audio URLs:', audioUrls);
          console.log('Setting remix file names:', fileNames);
          console.log('Setting remix album covers:', albumCovers);

          if (audioUrls.length > 0) {
            setRemixAudioUrls(audioUrls);
            setRemixFileNames(fileNames);
            setRemixAlbumCovers(albumCovers);
            toast.success(data.message || `Remix completed successfully! ${data.tracks.length} version(s) created.`);
          }
        } else if (data.audioUrl) {
          // Fallback to single audio URL if tracks array is not present
          setRemixAudioUrls([data.audioUrl]);
          setRemixFileNames([`Remix - ${new Date().toLocaleDateString()}`]);
          setRemixAlbumCovers([null]);
          toast.success('Remix completed successfully! You can now listen to it.');
        }
        
        // Disconnect socket to stop progress logs
        socket.disconnect();
        console.log('Socket disconnected after remix completion');
      }
    });

    socket.on('remix-failed', (data) => {
      console.error('Remix failed:', data);
      if (data.task_id === remixTaskId) {
        setIsRemixing(false);
        setRemixStatus('failed');
        setRemixError(data.message || 'Remix failed');
        
        // Disconnect socket to stop progress logs
        socket.disconnect();
        console.log('Socket disconnected after remix failure');
        
        toast.error(data.message || 'Remix failed');
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [remixTaskId]);

  // Handle tag click - toggle style in selection
  const handleStyleClick = (style) => {
    // Parse current text to separate manual text from tags
    const currentText = styleText.trim();
    const parts = currentText.split(',').map(s => s.trim()).filter(s => s);
    
    // Separate manually typed text from known tags
    const manualText = parts.filter(part => !musicStyles.includes(part.toLowerCase()));
    const currentTags = parts.filter(part => musicStyles.includes(part.toLowerCase()));
    
    let updatedStyles;
    if (selectedStyles.includes(style)) {
      // Remove style if already selected
      updatedStyles = selectedStyles.filter(s => s !== style);
    } else {
      // Add style if not selected
      updatedStyles = [...selectedStyles, style];
    }
    
    setSelectedStyles(updatedStyles);
    
    // Reconstruct text: manual text first, then tags
    const allParts = [...manualText, ...updatedStyles];
    setStyleText(allParts.join(', '));
  };

  // Handle manual text input
  const handleStyleTextChange = (e) => {
    const newText = e.target.value;
    setStyleText(newText);
    
    // Update selectedStyles based on what's in the text
    const parts = newText.split(',').map(s => s.trim()).filter(s => s);
    const tagsInText = parts.filter(part => musicStyles.includes(part.toLowerCase()));
    setSelectedStyles(tagsInText);
  };

  // Handle cover generation
  const handleCover = async () => { 
    console.log('Custom.jsx - handleCover called', coverTrackData);
    try {
      // Start cover generation process
      setIsCoverGenerating(true);
      setShowCoverModal(true);
      setCoverProgress(0);
      setCoverStatus('queued');
      setCoverError(null);
      
      let uploadUrl = `https://api.openbeat.ai/api/uploads/${coverTrackData.data.data.filename}`;
      //let uploadUrl = `https://openbeat.ai/api/uploads/${coverTrackData.data.data.filename}`
      // Then generate the cover
      const response = await coverAPI.generateCover(
        uploadUrl,
        lyricsText,
        styleText
      );

      if (response.data.success) {
        setCoverTaskId(response.data.taskId);
        toast.success('Cover generation started! This may take a few minutes...');
        
        // Clear form after successful submission
        setLyricsText('');
        setStyleText('');
        setSelectedStyles([]);
        setLyricsHeader('Lyrics');
      } else {
        throw new Error(response.data.message || 'Failed to start cover generation');
      }
    } catch (error) {
      console.error('Custom.jsx - Error starting cover:', error);
      setIsCoverGenerating(false);
      setShowCoverModal(false);
      setCoverStatus('failed');
      setCoverError(error.response?.data?.message || error.message || 'Failed to start cover generation');
      
      console.error('Custom.jsx - Error message:', error);
      
      toast.error(error.response?.data?.message || 'Failed to start cover generation');
    }
  };

  // Handle generate submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!styleText.trim()) {
      toast.error('Please select or enter at least one style');
      return;
    }

    // Check if this is a cover candidate
    if (isCoverCandidate && (selectedAudioFile || coverTrackData)) {
      // Call Cover API
      await handleCover();
    }
    // Check if this is a remix candidate
    else if (isRemixCandidate && (selectedAudioFile || remixTrackData)) {
      // Call Remix API
      await handleRemix();
    } else {
      // Use regular generate flow
      const success = await generateMusic(
        lyricsText, 
        styleText, 
        true, // isLyricsPrompt - always true for custom mode
        false // makeInstrumental
      );

      // Clear form after successful generation
      if (success) {
        setLyricsText('');
        setStyleText('');
        setSelectedStyles([]);
        setLyricsHeader('Lyrics');
      }
    }
  };

  // Handle remix
  const handleRemix = async () => {
    // Determine if we have audio file (from transcription) or audio URL (from library)
    let audioFile = selectedAudioFile;
    let audioUrl = null;
    let isUrlMode = false;
    
    if (audioFile) {
      // We have an audio file from transcription
      console.log('Custom.jsx - Using audio file from transcription:', audioFile.name);
    } else if (remixTrackData && remixTrackData.audioUrl) {
      // We have an audio URL from library
      audioUrl = remixTrackData.audioUrl;
      isUrlMode = true;
      console.log('Custom.jsx - Using audio URL from library:', audioUrl);
    } else {
      console.log('Custom.jsx - No audio available');
      toast.error('No audio available for remix');
      return;
    }

    if (!lyricsText.trim()) {
      console.log('Custom.jsx - No lyrics provided');
      toast.error('Lyrics are required for remix');
      return;
    }

    console.log('Custom.jsx - Starting remix with:', {
      audioFile: audioFile ? audioFile.name : null,
      audioUrl: audioUrl,
      isUrlMode: isUrlMode,
      lyrics: lyricsText.substring(0, 50) + '...',
      style: styleText
    });

    try {
      setIsRemixing(true);
      setShowRemixModal(true);
      setRemixProgress(0);
      setRemixStatus('queued');
      setRemixError(null);

      // Extract gender from style if present (you can enhance this logic)
      const gender = 'male'; // Default, can be made dynamic

      const response = await remixAPI.startRemix(
        isUrlMode ? audioUrl : audioFile,
        lyricsText,
        lyricsText, // prompt same as lyrics
        gender,
        styleText,
        isUrlMode // Pass isUrl flag
      );

      if (response.data.success) {
        setRemixTaskId(response.data.task_id);
        toast.success('Remix started! This may take a few minutes...');
      } else {
        console.error('Custom.jsx - Remix API returned success: false:', response.data);
        throw new Error(response.data.message || 'Failed to start remix');
      }
    } catch (error) {
      console.error('Custom.jsx - Error starting remix:', error);
      
      setIsRemixing(false);
      setShowRemixModal(false);
      
      const errorMessage = error.response?.data?.message || error.message || 'Failed to start remix';
      console.error('Custom.jsx - Error message:', errorMessage);
      
      toast.error(errorMessage);
    }
  };

  const clearForm = () => {
    setLyricsText('');
    setStyleText('');
    setSelectedStyles([]);
    setLyricsHeader('Lyrics');
    setRemixAudioUrls([]);
    setRemixFileNames([]);
    setRemixAlbumCovers([]);
    clearResults();
    
    // Dispatch event to Generate.jsx to reset remix state
    const event = new CustomEvent('clear-remix-state', {
      detail: { 
        clearRemixData: true
      }
    });
    window.dispatchEvent(event);
  };

  // Check if form is valid for submission
  const isFormValid = () => {
    return lyricsText.trim().length >= 10 && 
           styleText.trim().length > 0 && 
           !isGenerating && 
           !isRemixing && 
           !isCoverGenerating;
  };

  return (
    <>
      <div className="complex-div">
        <div className="dflexlr head">
          <h3>{lyricsHeader}</h3>
          {isTranscribing && (
            <span className="badge bg-info ms-2">
              <i className="bi bi-hourglass-split me-1"></i>
              Transcribing...
            </span>
          )}
          {isRemixCandidate && !isCoverCandidate && !isTranscribing && (
            <span className="badge bg-success ms-2">
              <i className="bi bi-music-note me-1"></i>
              Remix Mode
            </span>
          )}
          {isCoverCandidate && !isRemixCandidate && !isTranscribing && (
            <span className="badge bg-primary ms-2">
              <i className="bi bi-mic me-1"></i>
              Cover Mode
            </span>
          )}
        </div>

        <div className="lyric-area">
          <textarea 
            className="textarea" 
            placeholder="Describe your Lyrics...."
            value={lyricsText}
            onChange={(e) => setLyricsText(e.target.value)}
            disabled={isGenerating || isRemixing || isTranscribing}
          ></textarea>
        </div>
      </div>

      <div className="form-box" style={{paddingBottom:0}}>
        <label htmlFor="prompt">Style</label>
        <textarea 
          id="prompt" 
          placeholder="Click tags below to add styles..." 
          value={styleText}
          onChange={handleStyleTextChange}
          disabled={isGenerating || isRemixing}
          style={{
            outline: 'none',
            border: 'none',
            boxShadow: 'none'
          }}
        ></textarea>

        <div className="tags" style={{display:'flex', flexWrap:'wrap', gap:'0.5rem', marginTop:'1rem'}}>
          {musicStyles.map((style) => {
            const isSelected = selectedStyles.includes(style);
            return (
              <label
                key={style}
                className={`tag d-flex align-items-center music-style-label${isSelected ? ' active' : ''}`}
                onClick={() => !(isGenerating || isRemixing) && handleStyleClick(style)}
                style={{
                  cursor: (isGenerating || isRemixing) ? 'not-allowed' : 'pointer',
                  opacity: (isGenerating || isRemixing) ? 0.6 : 1,
                  padding: '0.3rem 0.8rem',
                  borderRadius: '1rem',
                  background: isSelected ? 'linear-gradient(180deg, var(--orange), var(--pink), var(--purple))' : '#23263a',
                  color: '#fff',
                  border: '2px solid transparent',
                  fontWeight: 500,
                  transition: 'background 0.2s, color 0.2s',
                  boxSizing: 'border-box',
                  minHeight: '32px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                onMouseEnter={e => {
                  if (!isSelected) {
                    e.currentTarget.style.background = 'linear-gradient(180deg, var(--orange), var(--pink), var(--purple))';
                  }
                }}
                onMouseLeave={e => {
                  if (!isSelected) {
                    e.currentTarget.style.background = '#23263a';
                  }
                }}
              >
                +{style.charAt(0).toUpperCase() + style.slice(1)}
              </label>
            );
          })}
        </div>
      </div>

      {/* Generation Modal */}
      <GenerationModal
        show={showModal}
        onClose={closeModal}
        isGenerating={isGenerating}
        progress={generationProgress}
        result={musicGptResult}
        onViewProfile={handleViewProfile}
        onGenerateAnother={handleGenerateAnother}
      />

      {/* Remix Modal */}
      <RemixModal
        show={showRemixModal}
        onClose={() => {
          setShowRemixModal(false);
          // Reset generation mode to mode selector
          if (remixStatus === 'completed' && onRemixModalClose) {
            onRemixModalClose();
          }
        }}
        progress={remixProgress}
        status={remixStatus}
        etaRemaining={remixEta}
        error={remixError}
        remixAudioUrls={remixAudioUrls}
        remixFileNames={remixFileNames}
        remixAlbumCovers={remixAlbumCovers}
      />

      {/* Cover Modal */}
      <CoverModal
        show={showCoverModal}
        onClose={() => {
          setShowCoverModal(false);
          // Reset cover state when closing
          if (coverStatus === 'completed') {
            setCoverAudioUrls([]);
            setCoverFileNames([]);
            setCoverAlbumCovers([]);
            setCoverProgress(0);
            setCoverStatus(null);
            setCoverTaskId(null);
            // Reset generation mode to mode selector
            if (onCoverModalClose) {
              onCoverModalClose();
            }
          }
        }}
        progress={coverProgress}
        status={coverStatus}
        etaRemaining={coverEta}
        error={coverError}
        coverAudioUrls={coverAudioUrls}
        coverFileNames={coverFileNames}
        coverAlbumCovers={coverAlbumCovers}
      />

      {/* Bottom Buttons */}
      <div className="dflexlr" style={{paddingTop:'18px'}}>
        <div className="buttons-left">
          <button
            onClick={handleSubmit}
            disabled={!isFormValid()}
            className="btn-gradient"
          >
            {isGenerating ? 'Generating...' : 
             isRemixing ? 'Creating Remix...' : 
             isCoverCandidate ? 'Generate Cover' :
             isRemixCandidate && selectedAudioFile ? 'Generate Remix' : 
             'Generate Audio'}
          </button>
        </div>
        <div className="buttons-right">
          <button className="btn-normal grey-bg" onClick={clearForm}>Clear All</button>
        </div>
      </div>
    </>
  );
};

export default Custom;
