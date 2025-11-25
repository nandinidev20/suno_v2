import { useState, useEffect, useRef } from 'react';
import LyricsModal from '../components/LyricsModal';
import AudioTranscribeModal from '../components/AudioTranscribeModal';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { stripeAPI, tracksAPI, audioTranscribeAPI, oneShotAPI } from '../utils/api';
import { coverAPI } from '../utils/coverApi';
import toast from 'react-hot-toast';
import LeftSideBar from '../components/LeftSideBar';
import FooterPlayer from '../components/FooterPlayer';
import Custom from './Custom';
import { useGenerate, musicStyles } from '../hooks/useGenerate';
import GenerationModal from '../components/GenerationModal';
import OneShotModal from '../components/OneShotModal';
import { io as ioClient } from 'socket.io-client';

const Generate = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [showLyricsModal, setShowLyricsModal] = useState(false);
  const handleOpenLyricsModal = () => setShowLyricsModal(true);
  const handleCloseLyricsModal = () => setShowLyricsModal(false);

  // Audio Transcribe Modal
  const [showAudioTranscribeModal, setShowAudioTranscribeModal] = useState(false);
  const [selectedAudioFile, setSelectedAudioFile] = useState(null);
  const [isRemixCandidate, setIsRemixCandidate] = useState(false);
  const [transcriptionTaskId, setTranscriptionTaskId] = useState(null);
  const [transcribedLyrics, setTranscribedLyrics] = useState('');
  const [transcriptionProgress, setTranscriptionProgress] = useState(0);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcriptionError, setTranscriptionError] = useState(null);

  // Remix track data from library
  const [remixTrackData, setRemixTrackData] = useState(null);

  // Cover track data and state
  const [coverTrackData, setCoverTrackData] = useState(null);
  const [isCoverCandidate, setIsCoverCandidate] = useState(false);

  // Track if prompt was set via lyrics modal
  const [isLyricsPrompt, setIsLyricsPrompt] = useState(false);
  const handleApplyLyrics = (lyrics) => {
    setFormData(prev => ({ ...prev, prompt: lyrics }));
    setIsLyricsPrompt(true);
    setShowLyricsModal(false);
  };

  // OneShot state
  const [isOneShotMode, setIsOneShotMode] = useState(false);
  const [showOneShotModal, setShowOneShotModal] = useState(false);
  const [oneShotTaskId, setOneShotTaskId] = useState(null);
  const [oneShotProgress, setOneShotProgress] = useState(0);
  const [oneShotStatus, setOneShotStatus] = useState('idle');
  const [oneShotResult, setOneShotResult] = useState(null);
  const [oneShotError, setOneShotError] = useState(null);

  // Handle navigation state and remix/cover data loading
  useEffect(() => {
    const effectId = Math.random().toString(36).substr(2, 9);
    // Check if we have navigation state from Library page
    if (location.state) {
      const { mode, remix, cover, remixTrackData, coverTrackData } = location.state;

      if (mode === 'custom') {
        setActiveMode('custom');
      }

      if (remix && remixTrackData) {
        try {

          // Set remix data from navigation state
          setRemixTrackData(() => {
            return remixTrackData;
          });

          setIsRemixCandidate(true);

          // Show the Custom remix interface directly without mode selector
          setSelectedGenerationMode('songcreator');
          setActiveMode('custom');

          // toast.success(`Loaded "${remixTrackData.trackName}" for remix!`);
        } catch (error) {
          toast.error('Failed to load remix data');
        }
      } else {
        console.log(`Generate.jsx - [${effectId}] No remix data in state`);
      }
    } else {
      console.log(`Generate.jsx - [${effectId}] No navigation state found`);
    }
  }, [location.state]);

  // Monitor remixTrackData state changes
  useEffect(() => {
    console.log('Generate.jsx - remixTrackData state changed:', remixTrackData);
  }, [remixTrackData]);

  // Use shared generation hook
  const {
    isGenerating,
    generationProgress,
    musicGptResult,
    showModal,
    generateMusic,
    clearResults,
    closeModal,
    handleViewProfile: viewProfile,
    handleGenerateAnother: generateAnother,
  } = useGenerate();

  const [formData, setFormData] = useState({
    prompt: '',
    style: 'reggaeton',
    duration: 30,
    make_instrumental: true
  });

  // UI & data states
  const [generatedTrack, setGeneratedTrack] = useState(null);
  const [subscriptionInfo, setSubscriptionInfo] = useState(null);
  const [subscriptionLoading, setSubscriptionLoading] = useState(true);
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  // Audio player state for custom playback
  const [currentTrack, setCurrentTrack] = useState(null); // Track object
  const [showFooterPlayer, setShowFooterPlayer] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioTime, setAudioTime] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);
  const audioRef = useRef(null);

  // refs to manage abort
  const generationAbortRef = useRef(null);

  // Mode toggle state (simple or custom)
  const [activeMode, setActiveMode] = useState('simple');

  // Generation mode selector state (none, upload, oneshot, songcreator)
  const [selectedGenerationMode, setSelectedGenerationMode] = useState(null);

  // For pre-selecting remix in audio modal
  const [audioModalDefaultMode, setAudioModalDefaultMode] = useState(null);

  // Track last simple/advanced mode for Song Creator
  const [lastSongCreatorMode, setLastSongCreatorMode] = useState('simple');

  // Listen for reset modes event from Library navigation
  useEffect(() => {
    const handleResetModes = () => {
      setSelectedGenerationMode(null);
      setAudioModalDefaultMode(null);
    };

    window.addEventListener('reset-generation-modes', handleResetModes);
    return () => {
      window.removeEventListener('reset-generation-modes', handleResetModes);
    };
  }, []);

  // Socket.io connection for real-time events
  useEffect(() => {
    let SOCKET_URL;
    if (window.location.hostname === 'openbeat.ai') {
      SOCKET_URL = 'https://api.openbeat.ai';
    } else {
      SOCKET_URL = `https://api.openbeat.ai`;
    }
    console.log(`Socket URL: ${SOCKET_URL}`);
    const socket = ioClient(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 20000,
      forceNew: true
    });

    socket.on('connect', () => {
      console.log('Socket connected for audio transcribe/remix events');
    });

    // Audio Transcribe events
    socket.on('audio-transcribe-progress', (data) => {
      console.log('Audio transcribe progress:', data);
      if (data.task_id === transcriptionTaskId) {
        setTranscriptionProgress(data.progress || 0);
      }
    });

    socket.on('audio-transcribe-complete', (data) => {
      console.log('Audio transcribe complete:', data);
      if (data.task_id === transcriptionTaskId) {
        setTranscribedLyrics(data.transcription || '');
        setIsTranscribing(false);
        setTranscriptionProgress(100);

        // Close the modal now that transcription is complete
        setShowAudioTranscribeModal(false);

        // Trigger reset of AudioTranscribeModal internal states
        setAudioModalResetTrigger(prev => prev + 1);

        // Switch to Song Creator mode with Advanced/Custom to show the transcription
        setSelectedGenerationMode('songcreator');
        setActiveMode('custom');

        // Auto-fill lyrics in Custom mode (dispatch event after mode switch)
        setTimeout(() => {
          const event = new CustomEvent('lyrics-transcribed', {
            detail: {
              lyrics: data.transcription,
              isRemix: isRemixCandidate
            }
          });
          window.dispatchEvent(event);
        }, 100);

        toast.success('Transcription completed successfully!');
      }
    });

    socket.on('audio-transcribe-failed', (data) => {
      console.error('Audio transcribe failed:', data);
      if (data.task_id === transcriptionTaskId) {
        setIsTranscribing(false);
        setTranscriptionProgress(0);
        setTranscriptionError(data.message || 'Transcription failed');
        // Don't close modal - let user see error and choose another file
        toast.error(data.message || 'Transcription failed');
      }
    });

    socket.on('oneshot-progress', (data) => {
      console.log('OneShot progress:', data);
      if (data.task_id === oneShotTaskId) {
        setOneShotProgress(data.progress || 0);
        setOneShotStatus('generating');
      }
    });

    socket.on('oneshot-complete', (data) => {
      console.log('OneShot complete:', data);
      if (data.task_id === oneShotTaskId) {
        setOneShotResult(data);
        setOneShotStatus('completed');
        setOneShotProgress(100);
        toast.success('OneShot sound generated successfully!');

        setPage(1);
        fetchTracks(1, true);
      }
    });

    socket.on('oneshot-failed', (data) => {
      console.error('OneShot failed:', data);
      if (data.task_id === oneShotTaskId) {
        setOneShotStatus('failed');
        setOneShotError(data.message || 'OneShot generation failed');
        toast.error(data.message || 'Generation failed');
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [transcriptionTaskId, activeMode, isRemixCandidate, oneShotTaskId]);

  // Fetch subscription and tracks when user changes
  useEffect(() => {
    setSubscriptionInfo(null); // clear old info
    fetchSubscriptionStatus();
    setPage(1);
    setTracks([]);
    setHasMore(true);
    fetchTracks(1, true);
    // cleanup on unmount
    return () => {
      if (generationAbortRef.current) generationAbortRef.current.abort?.();
    };
  }, [user]);

  // Listen for remix completion to refresh tracks
  useEffect(() => {
    const handleRemixCompleted = () => {
      setPage(1);
      fetchTracks(1, true);
    };

    window.addEventListener('remix-completed', handleRemixCompleted);

    return () => {
      window.removeEventListener('remix-completed', handleRemixCompleted);
    };
  }, []);

  // Listen for clear remix state event from Custom.jsx
  useEffect(() => {
    const handleClearRemixState = () => {
      // Reset remix state when Clear All is clicked
      setRemixTrackData(null);
      setIsRemixCandidate(false);
      setSelectedAudioFile(null);
      setTranscribedLyrics('');
      setTranscriptionTaskId(null);
      setTranscriptionProgress(0);
      setIsTranscribing(false);
      setTranscriptionError(null);
    };

    window.addEventListener('clear-remix-state', handleClearRemixState);

    return () => {
      window.removeEventListener('clear-remix-state', handleClearRemixState);
    };
  }, []);


  // Play/pause logic for cards and footer
  // Helper to get audio path for a track (as in old code)
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
    // Always use a new object with the correct audio path
    const audioPath = getTrackAudioPath(track);
    const trackWithAudio = { ...track, _audioPath: audioPath };
    if (!currentTrack || (currentTrack._audioPath !== audioPath)) {
      setCurrentTrack(trackWithAudio);
      setShowFooterPlayer(true);
      setAudioTime(0); // reset time for new track
      setAudioDuration(0);
      setIsPlaying(false); // force pause before play to ensure src changes
      setShowFooterPlayer(true);
      setTimeout(() => setIsPlaying(true), 50); // small delay to allow src update
    } else {
      setIsPlaying((prev) => !prev);
    }
  };

  useEffect(() => {
    if (!audioRef.current) return;
    if (isPlaying) {
      // Always set src before play
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

    audio.addEventListener('ended', () => {
      setIsPlaying(false);
      // Do not hide the player on end
    });

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

  // Format seconds to mm:ss
  const formatTime = (sec) => {
    if (!sec && sec !== 0) return '00:00';
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Fetch only current user's tracks with pagination, sort by newest
  const fetchTracks = async (pageNum = 1, replace = false) => {
    try {
      setLoading(true);
      const response = await tracksAPI.getMyTracks(pageNum, 20); // fetch only this user's tracks
      let newTracks = response.data.tracks || [];
      const total = response.data.pagination?.totalTracks || response.data.total || 0;
      newTracks.sort((a, b) => new Date(b.createdAt || b.created_at) - new Date(a.createdAt || a.created_at));
      if (replace) {
        setTracks(newTracks);
      } else {
        setTracks(prev => [...prev, ...newTracks]);
      }
      setHasMore(pageNum * 20 < total);
    } catch (error) {
      console.error('Error fetching tracks:', error);
      if (error.response?.status !== 429) toast.error('Failed to load tracks');
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  };

  const fetchSubscriptionStatus = async () => {
    try {
      setSubscriptionLoading(true);
      const response = await stripeAPI.getSubscriptionStatus();
      if (response.data?.success) {
        setSubscriptionInfo(response.data.subscription || null);
      } else {
        setSubscriptionInfo(null);
      }
    } catch (error) {
      console.error('Error fetching subscription status:', error);
      setSubscriptionInfo(null);
    } finally {
      setSubscriptionLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : (name === 'duration' ? parseInt(value, 10) || 0 : value)
    }));
    // If user edits the prompt manually, unset the lyrics flag
    if (name === 'prompt') {
      setIsLyricsPrompt(false);
    }
  };

  const handleUpgrade = () => {
    // navigate to membership/upgrade page — adapt route if different
    navigate('/membership');
  };

  const clearForm = () => {
    setFormData({ prompt: '', style: 'reggaeton', duration: 30, make_instrumental: true });
    setGeneratedTrack(null);
    setIsLyricsPrompt(false);
    clearResults();

  };

  // const handleSavePrompt = () => {
  //   toast.success('Prompt saved!');
  // };

  const handleViewProfile = () => {
    viewProfile();
  };

  const handleGenerateAnother = () => {
    generateAnother();
    setGeneratedTrack(null);
  };

  // Audio Transcribe Modal handlers
  const handleOpenAudioTranscribeModal = () => {
    setShowAudioTranscribeModal(true);
  };

  const [audioModalResetTrigger, setAudioModalResetTrigger] = useState(0);

  const handleCloseAudioTranscribeModal = () => {
    setShowAudioTranscribeModal(false);
    setTranscriptionError(null);
    setAudioModalDefaultMode(null);
    // Return to mode selector when modal closes
    setSelectedGenerationMode(null);
    // Trigger reset of AudioTranscribeModal internal states
    setAudioModalResetTrigger(prev => prev + 1);
  };

  const handleSaveAudio = async (audioFile, markForRemix, markForCover) => {
    try {
      setSelectedAudioFile(audioFile);

      if (markForCover) {
        // Start progress simulation for cover upload
        setIsTranscribing(true);
        setIsCoverCandidate(true);
        let progress = 0;
        const progressInterval = setInterval(() => {
          progress += 10;
          setTranscriptionProgress(Math.min(progress, 90));
        }, 1000); // Update every second

        try {
          const response = await coverAPI.uploadCoverAudio(audioFile);

          clearInterval(progressInterval);
          setTranscriptionProgress(100);

          if (response.data.success !== false) {
            await new Promise(resolve => setTimeout(resolve, 8000)); // Wait 1 second at 100%

            setCoverTrackData(response);

            // Switch to Song Creator mode with Advanced/Custom
            setSelectedGenerationMode('songcreator');
            setActiveMode('custom');

            // Close modal after successful upload
            setShowAudioTranscribeModal(false);
            // Trigger reset of AudioTranscribeModal internal states
            setAudioModalResetTrigger(prev => prev + 1);

            // Dispatch event to set cover mode and [instrumental] text
            setTimeout(() => {
              const event = new CustomEvent('cover-uploaded', {
                detail: {
                  text: '[instrumental]',
                  isCover: true,
                }
              });
              window.dispatchEvent(event);
            }, 100);

            toast.success('Audio uploaded successfully for cover');
            setIsTranscribing(false);
            return; // Return here to prevent throwing error
          } else {
            throw new Error(response.data.message || 'Failed to upload audio for cover');
          }
        } catch (error) {
          clearInterval(progressInterval);
          setTranscriptionProgress(0);
          setIsTranscribing(false);
          throw error;
        }

      } else if (markForRemix) {
        // Handle remix upload and transcription
        setIsRemixCandidate(true);
        setIsTranscribing(true);
        setTranscriptionProgress(0);
        setTranscriptionError(null);

        // Call API to upload audio for transcription
        const response = await audioTranscribeAPI.uploadAudio(audioFile);

        if (response.data.success) {
          setTranscriptionTaskId(response.data.task_id);
          //toast.success('Audio uploaded! Transcription in progress...');

          // DON'T close modal or switch mode yet - keep modal open
          // Modal will close when webhook response comes
        } else {
          throw new Error(response.data.message || 'Failed to upload audio');
        }
      }
    } catch (error) {
      console.error('Error uploading audio:', error);
      setIsTranscribing(false);
      throw error; // Re-throw to be handled by modal
    }
  };

  // Returns boolean: is user allowed to generate right now?
  const hasActivePlan = !!(subscriptionInfo && subscriptionInfo.plan);
  const canGenerate = () => {
    if (!hasActivePlan) return false;
    // If songsLimit is undefined/null => unlimited
    const limit = subscriptionInfo.songsLimit;
    if (limit == null) return true;
    const used = /* subscriptionInfo.songsUsed || */ 0;
    return used < limit;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isOneShotMode) {
      await handleOneShotGeneration();
      return;
    }

    const success = await generateMusic(
      formData.prompt,
      formData.style,
      isLyricsPrompt,
      formData.make_instrumental
    );

    if (success) {
      // Auto-refresh tracks after generation
      setPage(1);
      setHasMore(true);
      fetchTracks(1, true);

      // Clear form
      setFormData({
        prompt: '',
        style: 'reggaeton',
        duration: 30,
        make_instrumental: true
      });
      setIsLyricsPrompt(false);
    }
  };

  const handleToggleOneShotMode = () => {
    setIsOneShotMode(prev => !prev);
    if (!isOneShotMode) {
      toast.success('OneShot mode activated - Generate sound effects from text!');
    } else {
      toast.info('OneShot mode deactivated');
    }
  };

  const handleOneShotGeneration = async () => {
    try {
      setOneShotStatus('generating');
      setOneShotProgress(0);
      setOneShotError(null);
      setOneShotResult(null);
      setShowOneShotModal(true);

      const response = await oneShotAPI.startOneShot(
        formData.prompt,
        formData.duration
      );

      if (response.data.success) {
        setOneShotTaskId(response.data.task_id);
        toast.success('OneShot generation started!');
      } else {
        throw new Error(response.data.message || 'Failed to start OneShot');
      }
    } catch (error) {
      console.error('OneShot generation error:', error);
      setOneShotStatus('failed');
      setOneShotError(error.response?.data?.message || error.message || 'Failed to start OneShot generation');
      toast.error(error.response?.data?.message || error.message || 'Failed to start OneShot generation');
    }
  };

  const handleCloseOneShotModal = () => {
    setShowOneShotModal(false);
    setOneShotTaskId(null);
    setOneShotProgress(0);
    setOneShotStatus('idle');
    setOneShotResult(null);
    setOneShotError(null);
  };

  const handleOneShotGenerateAnother = () => {
    setOneShotStatus('idle');
    setOneShotResult(null);
    setOneShotError(null);
    setOneShotTaskId(null);
    setOneShotProgress(0);
    setShowOneShotModal(false);
    setFormData({ ...formData, prompt: '' });
  };

  // Mode selector handlers
  const handleModeSelect = (mode) => {
    setSelectedGenerationMode(mode);
    if (mode === 'songcreator') {
      setActiveMode(lastSongCreatorMode);
    }
    if (mode === 'oneshot') {
      setIsOneShotMode(true);
    } else {
      setIsOneShotMode(false);
    }
  };

  const handleBackToModeSelector = () => {
    if (selectedGenerationMode === 'songcreator') {
      setLastSongCreatorMode(activeMode);
    }
    setSelectedGenerationMode(null);
  };

  const handleRemixSongClick = () => {
    setAudioModalDefaultMode('remix');
    setShowAudioTranscribeModal(true);
  };


  return (
    <section className="discover-section position-relative">
      <div className="container-fluid">
        <div className="discover-div">
          <LeftSideBar />
          <div className="main">

            {/* Loading everything */}
            {subscriptionLoading || loading ? (
              <div className="workspace-box text-center">
                <div className="spinner-border text-primary" style={{ width: '2rem', height: '2rem' }} role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            ) : !hasActivePlan ? (
              <div className="workspace-box text-center">
                <h3 className="text-yellow-300">No Active Subscription</h3>
                <p className="text-sm text-yellow-200 mt-2">
                  You must purchase a plan to generate music.<br />
                  Please choose a subscription plan to unlock music generation.
                </p>
                <button onClick={handleUpgrade} className="btn-gradient mt-4">
                  Go to Membership Page
                </button>
              </div>
            ) : (
              <>
                {/* Mode Selector - Show when no mode is selected */}
                {selectedGenerationMode === null ? (
                  <div className="mode-selector-container">
                    <div style={{ textAlign: 'left', marginBottom: '3rem' }}>
                      <h3 style={{ color: '#fff', fontSize: '24px', fontWeight: 600, marginBottom: '0.5rem' }}>
                        Select a Mode:
                      </h3>
                    </div>

                    {/* Mode Cards Grid */}
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                      gap: '1.5rem',
                      marginBottom: '2rem'
                    }}>
                      {/* UPLOAD Card */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div
                          onClick={() => {
                            setAudioModalDefaultMode(null);
                            setShowAudioTranscribeModal(true);
                            handleModeSelect('upload');
                          }}
                          style={{
                            border: '2px solid rgba(0, 212, 255, 0.5)',
                            borderRadius: '14px',
                            padding: '1.5rem 2rem',
                            background: 'rgba(24, 25, 42, 0.6)',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'flex-start',
                            gap: '1.5rem',
                            minHeight: '140px',
                            position: 'relative',
                            overflow: 'hidden'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = 'rgba(0, 212, 255, 1)';
                            e.currentTarget.style.background = 'rgba(35, 38, 58, 0.8)';
                            e.currentTarget.style.transform = 'translateY(-2px)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = 'rgba(0, 212, 255, 0.5)';
                            e.currentTarget.style.background = 'rgba(24, 25, 42, 0.6)';
                            e.currentTarget.style.transform = 'translateY(0)';
                          }}
                        >
                          <div style={{
                            fontSize: '36px',
                            color: '#00d4ff',
                            flexShrink: 0,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}>
                            <i className="bi bi-cloud-upload"></i>
                          </div>
                          <h5 style={{ color: '#00d4ff', fontSize: '18px', fontWeight: 700, marginBottom: '0', letterSpacing: '0.5px' }}>
                            RECORD / UPLOAD
                          </h5>
                        </div>
                        <div style={{ textAlign: 'left' }}>
                          <p style={{ color: '#9aa0b4', fontSize: '11px', marginBottom: '0.5rem', fontWeight: 500 }}>
                            Recompose | Keeps Core Melody
                          </p>
                          <p style={{ color: '#fff', fontSize: '14px', fontWeight: 600, marginBottom: '0.25rem' }}>
                            Transform Voice
                          </p>
                          <p style={{ color: '#9aa0b4', fontSize: '14px', marginBottom: '0' }}>
                            or Melody loop
                          </p>
                        </div>
                      </div>

                      {/* ONE SHOT SAMPLE Card */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div
                          onClick={() => handleModeSelect('oneshot')}
                          style={{
                            border: '2px solid rgba(0, 212, 255, 0.5)',
                            borderRadius: '14px',
                            padding: '1.5rem 2rem',
                            background: 'rgba(24, 25, 42, 0.6)',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'flex-start',
                            gap: '1.5rem',
                            minHeight: '140px',
                            position: 'relative',
                            overflow: 'hidden'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = 'rgba(0, 212, 255, 1)';
                            e.currentTarget.style.background = 'rgba(35, 38, 58, 0.8)';
                            e.currentTarget.style.transform = 'translateY(-2px)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = 'rgba(0, 212, 255, 0.5)';
                            e.currentTarget.style.background = 'rgba(24, 25, 42, 0.6)';
                            e.currentTarget.style.transform = 'translateY(0)';
                          }}
                        >
                          <div style={{
                            fontSize: '36px',
                            color: '#00d4ff',
                            flexShrink: 0,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}>
                            <i className="bi bi-play-circle"></i>
                          </div>
                          <h5 style={{ color: '#00d4ff', fontSize: '18px', fontWeight: 700, marginBottom: '0', letterSpacing: '0.5px' }}>
                            ONE SHOT<br />SAMPLE
                          </h5>
                        </div>
                        <div style={{ textAlign: 'left' }}>
                          <p style={{ color: '#9aa0b4', fontSize: '11px', marginBottom: '0.5rem', fontWeight: 500 }}>
                            Sound FX | Instruments
                          </p>
                          <p style={{ color: '#fff', fontSize: '14px', fontWeight: 600, marginBottom: '0.25rem' }}>
                            Create A One
                          </p>
                          <p style={{ color: '#9aa0b4', fontSize: '14px', marginBottom: '0' }}>
                            Shot Sound
                          </p>
                        </div>
                      </div>

                      {/* SONG CREATOR Card */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div
                          onClick={() => handleModeSelect('songcreator')}
                          style={{
                            border: '2px solid rgba(217, 70, 239, 0.5)',
                            borderRadius: '14px',
                            padding: '1.5rem 2rem',
                            background: 'rgba(24, 25, 42, 0.6)',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'flex-start',
                            gap: '1.5rem',
                            minHeight: '140px',
                            position: 'relative',
                            overflow: 'hidden'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = 'rgba(217, 70, 239, 1)';
                            e.currentTarget.style.background = 'rgba(35, 38, 58, 0.8)';
                            e.currentTarget.style.transform = 'translateY(-2px)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = 'rgba(217, 70, 239, 0.5)';
                            e.currentTarget.style.background = 'rgba(24, 25, 42, 0.6)';
                            e.currentTarget.style.transform = 'translateY(0)';
                          }}
                        >
                          <div style={{
                            fontSize: '36px',
                            color: '#d946ef',
                            flexShrink: 0,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}>
                            <i className="bi bi-music-note-beamed"></i>
                          </div>
                          <h5 style={{ color: '#d946ef', fontSize: '18px', fontWeight: 700, marginBottom: '0', letterSpacing: '0.5px' }}>
                            BEAT<br />CREATOR
                          </h5>
                        </div>
                        <div style={{ textAlign: 'left' }}>
                          <p style={{ color: '#9aa0b4', fontSize: '11px', marginBottom: '0.5rem', fontWeight: 500 }}>
                            Generate an entire beat in seconds
                          </p>
                          <p style={{ color: '#fff', fontSize: '14px', fontWeight: 600, marginBottom: '0.25rem' }}>
                            Text prompt to full
                          </p>
                          <p style={{ color: '#9aa0b4', fontSize: '14px', marginBottom: '0' }}>
                            Beat
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* REMIX A SONG Section */}
                  </div>
                ) : (
                  <>
                    {/* Back Button - shown when a mode is selected */}
                    <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <button
                        onClick={handleBackToModeSelector}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#a78bfa',
                          cursor: 'pointer',
                          fontSize: '16px',
                          padding: '0.5rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          fontWeight: 500,
                          transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.color = '#d946ef';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.color = '#a78bfa';
                        }}
                      >
                        <i className="bi bi-chevron-left"></i>
                        Back to Modes
                      </button>
                    </div>

                    {/* UPLOAD Mode */}
                    {selectedGenerationMode === 'upload' && (
                      <div className="form-box simple-div">
                        <h4 style={{ color: '#fff', marginBottom: '1.5rem', fontWeight: 600 }}>
                          Upload Voice Recording or Melody Loop
                        </h4>
                        <p style={{ color: '#9aa0b4', fontSize: '13px', marginBottom: '1.5rem' }}>
                          Select whether you want to Remix (for existing songs) or Recompose (for loops/instrumentals)
                        </p>
                      </div>
                    )}

                    {/* ONE SHOT Mode */}
                    {selectedGenerationMode === 'oneshot' && (
                      <div className="form-box simple-div">
                        <form onSubmit={handleSubmit}>
                          <label htmlFor="prompt" style={{ marginBottom: '1rem', display: 'block', color: '#fff', fontWeight: 600 }}>
                            Describe Your Sound Effect
                          </label>
                          <textarea
                            id="prompt"
                            name="prompt"
                            value={formData.prompt}
                            onChange={handleInputChange}
                            placeholder="e.g., dog barking, door slamming, water splash..."
                            disabled={isGenerating}
                            required
                            style={{
                              width: '100%',
                              minHeight: '120px',
                              padding: '0.75rem',
                              background: '#18192a',
                              color: '#fff',
                              border: '1px solid rgba(167, 139, 250, 0.3)',
                              borderRadius: '8px',
                              fontFamily: "'Poppins', sans-serif",
                              fontSize: '14px',
                              resize: 'vertical',
                              marginBottom: '1rem'
                            }}
                          />

                          <div style={{
                            padding: '0.75rem',
                            background: 'rgba(167, 139, 250, 0.1)',
                            borderRadius: '0.5rem',
                            border: '1px solid rgba(167, 139, 250, 0.3)',
                            marginBottom: '1.5rem'
                          }}>
                            <span style={{ color: '#a78bfa', fontSize: '0.9rem' }}>
                              ℹ️ OneShot Mode: Generate sound effects from text. Duration: {formData.duration}s
                            </span>
                          </div>

                          <div className="dflexlr">
                            <div className="buttons-left">
                              <button
                                onClick={handleSubmit}
                                disabled={isGenerating || !formData.prompt.trim() || !canGenerate()}
                                className="btn-gradient"
                              >
                                {isGenerating ? 'Generating...' : 'Generate Audio'}
                              </button>
                            </div>
                            <div className="buttons-right">
                              <button className="btn-normal grey-bg" onClick={clearForm}>Clear All</button>
                            </div>
                          </div>
                        </form>
                      </div>
                    )}

                    {/* SONG CREATOR Mode - with Simple/Advanced toggle */}
                    {selectedGenerationMode === 'songcreator' && (
                      <>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                          <h4 style={{ color: '#fff', fontWeight: 600, margin: 0 }}>Create Your Beat</h4>
                          <div className="mode-buttons">
                            <button
                              onClick={() => setActiveMode('simple')}
                              className={`btn-slider ${activeMode === 'simple' ? 'active' : ''}`}
                            >
                              Simple
                            </button>
                            <button
                              onClick={() => setActiveMode('custom')}
                              className={`btn-slider ${activeMode === 'custom' ? 'active' : ''}`}
                            >
                              Advanced
                            </button>
                          </div>
                        </div>

                        {/* Simple Mode Form */}
                        {activeMode === 'simple' && (
                          <div className="form-box simple-div">
                            <form onSubmit={handleSubmit}>
                              <label htmlFor="prompt">Prompt</label>
                              <textarea
                                id="prompt"
                                name="prompt"
                                value={formData.prompt}
                                onChange={handleInputChange}
                                placeholder="Describe your beat..."
                                disabled={isGenerating}
                                required
                                readOnly={isLyricsPrompt}
                                style={isLyricsPrompt ? { background: '#23263a', color: '#bbb', cursor: 'not-allowed' } : {}}
                              />

                              <div className="ins-div">
                                <div className="form-check form-switch checkdiv">
                                  <input
                                    className="form-check-input"
                                    type="checkbox"
                                    id="Instrumentallyric"
                                    name="make_instrumental"
                                    checked={formData.make_instrumental}
                                    onChange={handleInputChange}
                                    disabled
                                  />
                                  <label className="form-check-label" htmlFor="Instrumentallyric" style={{ opacity: 0.8, cursor: 'not-allowed' }}>Instrumental Only?</label>
                                </div>
                                {/* <div className="ins-box">
                                  <button type="button" className="ins-btn" onClick={handleOpenLyricsModal}>+ Add Lyrics</button>
                                  <LyricsModal
                                    show={showLyricsModal}
                                    onClose={handleCloseLyricsModal}
                                    onApply={handleApplyLyrics}
                                    theme="dark"
                                  />
                                </div> */}
                              </div>

                              <div className="tags" style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '1rem' }}>
                                {musicStyles.map((style) => (
                                  <label
                                    key={style}
                                    className={`tag d-flex align-items-center music-style-label${formData.style === style ? ' active' : ''}`}
                                    style={{
                                      cursor: 'pointer',
                                      padding: '0.3rem 0.8rem',
                                      borderRadius: '1rem',
                                      background: formData.style === style ? 'linear-gradient(180deg, var(--orange), var(--pink), var(--purple))' : '#23263a',
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
                                      if (formData.style !== style) {
                                        e.currentTarget.style.background = 'linear-gradient(180deg, var(--orange), var(--pink), var(--purple))';
                                        e.currentTarget.style.color = '#fff';
                                      }
                                    }}
                                    onMouseLeave={e => {
                                      if (formData.style !== style) {
                                        e.currentTarget.style.background = '#23263a';
                                        e.currentTarget.style.color = '#fff';
                                      }
                                    }}
                                  >
                                    <input
                                      type="radio"
                                      name="style"
                                      className='music-style-radio'
                                      value={style}
                                      checked={formData.style === style}
                                      onChange={handleInputChange}
                                      style={{ marginRight: 6, accentColor: '#a78bfa' }}
                                    />
                                    {style.charAt(0).toUpperCase() + style.slice(1)}
                                  </label>
                                ))}
                              </div>

                              <div className="dflexlr" style={{ marginTop: '1.5rem' }}>
                                <div className="buttons-left">
                                  <button
                                    onClick={handleSubmit}
                                    disabled={isGenerating || !formData.prompt.trim() || !canGenerate()}
                                    className="btn-gradient"
                                  >
                                    {isGenerating ? 'Generating...' : 'Generate Audio'}
                                  </button>
                                </div>
                                <div className="buttons-right">
                                  <button className="btn-normal grey-bg" onClick={clearForm}>Clear All</button>
                                </div>
                              </div>
                            </form>
                          </div>
                        )}

                        {/* Advanced Mode Form */}
                        {activeMode === 'custom' && (
                          <div className="simple-div">
                            <Custom
                              selectedAudioFile={selectedAudioFile}
                              isRemixCandidate={isRemixCandidate}
                              isCoverCandidate={isCoverCandidate}
                              transcribedLyrics={transcribedLyrics}
                              isTranscribing={isTranscribing}
                              remixTrackData={remixTrackData}
                              coverTrackData={coverTrackData}
                              onCoverModalClose={() => {
                                setSelectedGenerationMode(null);
                                setAudioModalDefaultMode(null);
                              }}
                              onRemixModalClose={() => {
                                setSelectedGenerationMode(null);
                                setAudioModalDefaultMode(null);
                              }}
                            />
                          </div>
                        )}
                      </>
                    )}
                  </>
                )}

                {/* Audio Transcribe Modal */}
                <AudioTranscribeModal
          show={showAudioTranscribeModal}
          onClose={() => {
            handleCloseAudioTranscribeModal();
            setAudioModalDefaultMode(null);
          }}
          onSaveAudio={handleSaveAudio}
          isTranscribing={isTranscribing}
          transcriptionProgress={transcriptionProgress}
          transcriptionError={transcriptionError}
          defaultMode={audioModalDefaultMode}
          resetTrigger={audioModalResetTrigger}
        />

                {/* Generation Modal - Shows for Song Creator Simple mode */}
                {selectedGenerationMode === 'songcreator' && activeMode === 'simple' && !isOneShotMode && (
                  <GenerationModal
                    show={showModal}
                    onClose={closeModal}
                    isGenerating={isGenerating}
                    progress={generationProgress}
                    result={musicGptResult}
                    onViewProfile={handleViewProfile}
                    onGenerateAnother={handleGenerateAnother}
                  />
                )}

                {/* OneShot Modal */}
                {selectedGenerationMode === 'oneshot' && (
                  <OneShotModal
                    show={showOneShotModal}
                    onClose={handleCloseOneShotModal}
                    status={oneShotStatus}
                    progress={oneShotProgress}
                    result={oneShotResult}
                    error={oneShotError}
                    prompt={formData.prompt}
                    onGenerateAnother={handleOneShotGenerateAnother}
                  />
                )}

                {/* Limit Warning - Only show in Song Creator Simple mode */}
                {selectedGenerationMode === 'songcreator' && activeMode === 'simple' && !canGenerate() && (
                  <div className="workspace-box">
                    <div className="text-center">
                      <h3 className="text-yellow-300">Quota Reached</h3>
                      <p className="text-sm text-yellow-200 mt-2">
                        {subscriptionInfo?.plan
                          ? `You've used all ${subscriptionInfo.songsLimit} songs for this period. Upgrade to a higher plan for more songs!`
                          : 'No activde subscription. Please subscribe to a plan to generate music.'}
                      </p>
                      <button onClick={handleUpgrade} className="btn-gradient mt-4">
                        Upgrade Plan
                      </button>
                    </div>
                  </div>
                )}

              </>
            )}

            {/* Latest Generations */}
            <div className="workspace-box mt-4">
              <h2 className="mt-5"><span>Latest</span> Generations ({tracks.length})</h2>

              <div className="generations">
                {tracks.length === 0 ? (
                  <div className="text-center py-5">
                    <h4>No tracks yet</h4>
                  </div>
                ) : (
                  tracks.map((track, i) => (
                    <div key={track.id || track._id || i} className="generation-card" style={{ borderRadius: 12, boxShadow: '0 2px 8px #0002', padding: 2, marginBottom: 16 }}>
                      <div className="track-image" style={{ position: 'relative', marginBottom: '0.5rem' }}>
                        <img src={track.album_cover_path || track.albumCover || 'img/video-bg.jpg'} alt="Album Art" style={{ width: '100%', objectFit: 'cover', borderRadius: 8 }} />
                        {/* Overlay play button and duration on image */}
                        <div style={{
                          position: 'absolute',
                          left: 0,
                          right: 0,
                          bottom: 0,
                          width: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '0.5rem 0.7rem',
                        }}>
                          <button
                            className="btn btn-link"
                            style={{ fontSize: 22, color: '#fff', border: 'none', background: 'none', borderRadius: '50%', backgroundClip: 'padding-box', width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundImage: 'linear-gradient(180deg, var(--orange), var(--pink), var(--purple))', boxShadow: '0 2px 8px #a78bfa44', cursor: 'pointer' }}
                            onClick={() => handlePlayPause(track)}
                            type="button"
                          >
                            <i className={`bi ${currentTrack &&
                                isPlaying &&
                                (currentTrack._audioPath
                                  ? currentTrack._audioPath === getTrackAudioPath(track)
                                  : currentTrack.id === track.id)
                                ? 'bi-pause-fill'
                                : 'bi-play-fill'
                              }`} style={{ fontSize: 22, color: '#fff' }}></i>
                          </button>
                          <span
                            style={{
                              marginLeft: 8,
                              color: '#fff',
                              fontSize: '14px',
                              background: 'rgba(30,30,40,0.7)',
                              borderRadius: 6,
                              padding: '2px 10px',
                              letterSpacing: '0.5px',
                            }}
                          >
                            {currentTrack &&
                              (currentTrack._audioPath
                                ? currentTrack._audioPath === getTrackAudioPath(track)
                                : currentTrack.id === track.id) &&
                              isPlaying
                              ? formatTime(audioTime)
                              : formatTime(track.conversion_duration || track.duration || 0)}
                          </span>
                        </div>
                      </div>
                      <div className="track-title text-ellipsis mt-2" style={{ fontWeight: 600, color: '#fff' }}>{track.prompt ? track.prompt.charAt(0).toUpperCase() + track.prompt.slice(1) : ''}</div>
                      {/* <div className="track-workspace text-ellipsis" style={{color:'#a78bfa', fontSize:'0.95rem'}}>{track.workspace || track.style}</div> */}
                      {/* <div className="track-date text-ellipsis" style={{color:'#bbb', fontSize:'0.85rem'}}>{(track.createdAt || track.created_at) ? new Date(track.createdAt || track.created_at).toLocaleDateString() : '-'}</div> */}
                    </div>
                  ))
                )}
              </div>
              <div className="load-div">
                {tracks.length >= 20 && hasMore && !loading && (
                  <button className="btn-gradient" onClick={() => {
                    const nextPage = page + 1;
                    setPage(nextPage);
                    fetchTracks(nextPage);
                  }}>
                    Load More Past Generation
                  </button>
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
        <div style={{ position: 'fixed', left: 0, right: 0, bottom: 3, zIndex: 1000, padding: 0, margin: 0 }}>
          <FooterPlayer
            track={{
              ...currentTrack,
              album_cover_path: currentTrack.album_cover_path || currentTrack.albumCover || 'img/video-bg.jpg'
            }}
            isPlaying={isPlaying}
            currentTime={audioTime}
            duration={audioDuration || (currentTrack ? currentTrack.conversion_duration : 0)}
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
                  background: 'none',
                  border: 'none',
                  color: '#fff',
                  fontSize: 22,
                  marginLeft: 16,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
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

export default Generate;
