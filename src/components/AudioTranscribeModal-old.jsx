import React, { useState, useRef, useEffect } from 'react';
import toast from 'react-hot-toast';

/**
 * AudioTranscribeModal Component
 * Allows user to upload audio file, play/pause it, and mark it for remix
 * On save, sends to backend for transcription
 */
const AudioTranscribeModal = ({ show, onClose, onSaveAudio, isTranscribing, transcriptionProgress, transcriptionError }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [markForRemix, setMarkForRemix] = useState(false);
  const [markForCover, setMarkForCover] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  const audioRef = useRef(null);
  const fileInputRef = useRef(null);

  // Audio player event listeners
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onTimeUpdate = () => setCurrentTime(audio.currentTime || 0);
    const onLoadedMetadata = () => setDuration(audio.duration || 0);
    const onEnded = () => setIsPlaying(false);

    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('loadedmetadata', onLoadedMetadata);
    audio.addEventListener('ended', onEnded);

    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('loadedmetadata', onLoadedMetadata);
      audio.removeEventListener('ended', onEnded);
    };
  }, [audioUrl]);

  // Auto-play when audio is loaded
  useEffect(() => {
    if (isPlaying && audioRef.current) {
      audioRef.current.play().catch(e => {
        console.error('Error playing audio:', e);
        setIsPlaying(false);
      });
    } else if (!isPlaying && audioRef.current) {
      audioRef.current.pause();
    }
  }, [isPlaying]);

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/wave', 'audio/x-wav', 'audio/aac', 'audio/m4a', 'audio/ogg', 'audio/flac'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Invalid file type. Please select an audio file.');
      return;
    }

    // Validate file size (max 50MB)
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxSize) {
      toast.error('File size exceeds 50MB limit.');
      return;
    }

    setSelectedFile(file);
    
    // Create object URL for audio player
    const url = URL.createObjectURL(file);
    setAudioUrl(url);
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
  };

  const handleChooseFile = () => {
    fileInputRef.current?.click();
  };

  const togglePlayPause = () => {
    if (!audioUrl) return;
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (e) => {
    if (!audioRef.current || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    const newTime = percent * duration;
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleSaveAudio = async () => {
    if (!selectedFile) {
      toast.error('Please select an audio file first.');
      return;
    }

    if (!markForRemix && !markForCover) {
      toast.error('Please select either Remix or Cover option.');
      return;
    }

    setIsSaving(true);
    setUploadProgress(0);
    
    // Simulate upload progress
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + 10;
      });
    }, 200);
    
    try {
      // Call parent callback with file, remix flag, and cover flag
      await onSaveAudio(selectedFile, markForRemix, markForCover);
      
      // Complete upload progress
      setUploadProgress(100);
      clearInterval(progressInterval);
    
      //toast.success('Audio uploaded successfully! Transcription in progress...');
    } catch (error) {
      console.error('Error saving audio:', error);
      toast.error(error.message || 'Failed to upload audio');
      clearInterval(progressInterval);
      setUploadProgress(0);
      // Only close modal on error
      handleClose();
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = () => {
    // Don't allow closing while transcribing
    if (isTranscribing) {
      return;
    }
    
    // Cleanup
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
    setSelectedFile(null);
    setAudioUrl(null);
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
    setMarkForRemix(false);
    setIsSaving(false);
    setUploadProgress(0);
    
    onClose();
  };

  const formatTime = (time) => {
    if (!time || isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  if (!show) return null;

  return (
    <>
      {/* CSS for shimmer animation */}
      <style>
        {`
          @keyframes shimmer {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(100%); }
          }
        `}
      </style>
      
      <div className="modal show" style={{ display: 'block', background: 'rgba(0,0,0,0.6)' }} tabIndex={-1}>
      <div className="modal-dialog modal-lg modal-dialog-centered">
        <div className="modal-content bg-dark text-white" style={{ border: '1px solid #2b2b3a', fontFamily: "'Poppins', sans-serif" }}>
          <div className="modal-header" style={{ borderBottom: '1px solid #2b2b3a' }}>
            <div>
              <h5 className="modal-title">
                {isTranscribing ? 'Processing Audio...' : 'Add Audio'}
              </h5>
             
            </div>
            {!(isSaving || isTranscribing) && (
              <button type="button" className="btn-close btn-close-white" onClick={handleClose}></button>
            )}
          </div>

          <div className="modal-body">
            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="audio/*"
              onChange={handleFileSelect}
              style={{ display: 'none' }}
            />

         
            {/* File selection button */}
            {!selectedFile && !isTranscribing && (
              <div className="text-center py-2">
                <button
                  className="btn"
                  onClick={handleChooseFile}
                  style={{
                    background: 'linear-gradient(90deg, var(--orange), var(--pink), var(--purple))',
                    color: '#fff',
                    border: 'none',
                    padding: '12px 24px',
                    fontSize: '14px'
                  }}
                >
                  <i className="bi bi-upload me-2"></i>
                  Choose Audio File
                </button>
                <p className="mt-3" style={{ fontSize: '13px' }}>
                  Supported formats: MP3, WAV, AAC, M4A, OGG, FLAC (Max 50MB)
                </p>
              </div>
            )}

            {/* Audio player section */}
            {selectedFile && audioUrl && (
              <div className="mb-4">
                {/* File info */}
                <div className="mb-3 p-3" style={{ background: '#18192a', borderRadius: '8px' }}>
                  <div className="d-flex align-items-center gap-3">
                    <i className="bi bi-file-music" style={{ fontSize: '32px', color: '#a78bfa' }}></i>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '14px', fontWeight: 600, color: '#fff' }}>
                        {selectedFile.name}
                      </div>
                      <div style={{ fontSize: '12px', color: '#9aa0b4' }}>
                        {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                      </div>
                    </div>
                    <button
                      className="btn btn-sm btn-outline-light"
                      onClick={handleChooseFile}
                    >
                      Change
                    </button>
                  </div>
                  
                  {/* Remix and Cover Toggles */}
                  <div className="mt-3 pt-3" style={{ borderTop: '1px solid #2b2b3a' }}>
                    <div 
                      className="d-flex align-items-center gap-2"
                      style={{ 
                        cursor: (isSaving || isTranscribing) ? 'not-allowed' : 'pointer',
                        opacity: (isSaving || isTranscribing) ? 0.5 : 1
                      }}
                      onClick={() => {
                        if (!(isSaving || isTranscribing)) {
                          setMarkForRemix(!markForRemix);
                          setMarkForCover(false); // Unset cover if remix is selected
                        }
                      }}
                    >
                      <div 
                        className="d-flex align-items-center justify-content-center"
                        style={{
                          width: 24,
                          height: 24,
                          borderRadius: '50%',
                          background: markForRemix ? 'linear-gradient(90deg, var(--orange), var(--pink))' : '#2b2b3a',
                          border: '2px solid',
                          borderColor: markForRemix ? 'transparent' : '#555',
                          transition: 'all 0.3s ease'
                        }}
                      >
                        {markForRemix && (
                          <i className="bi bi-check" style={{ fontSize: '12px', color: '#fff' }}></i>
                        )}
                      </div>
                      <span style={{ fontSize: '14px', color: markForRemix ? '#a78bfa' : '#9aa0b4' }}>
                         Mark this audio for Remix
                      </span>
                    </div>

                    {/* Cover Toggle */}
                    <div 
                      className="d-flex align-items-center gap-2 mt-2"
                      style={{ 
                        cursor: (isSaving || isTranscribing) ? 'not-allowed' : 'pointer',
                        opacity: (isSaving || isTranscribing) ? 0.5 : 1
                      }}
                      onClick={() => {
                        if (!(isSaving || isTranscribing)) {
                          setMarkForCover(!markForCover);
                          setMarkForRemix(false); // Unset remix if cover is selected
                        }
                      }}
                    >
                      <div 
                        className="d-flex align-items-center justify-content-center"
                        style={{
                          width: 24,
                          height: 24,
                          borderRadius: '50%',
                          background: markForCover ? 'linear-gradient(90deg, var(--orange), var(--pink))' : '#2b2b3a',
                          border: '2px solid',
                          borderColor: markForCover ? 'transparent' : '#555',
                          transition: 'all 0.3s ease'
                        }}
                      >
                        {markForCover && (
                          <i className="bi bi-check" style={{ fontSize: '12px', color: '#fff' }}></i>
                        )}
                      </div>
                      <span style={{ fontSize: '14px', color: markForCover ? '#a78bfa' : '#9aa0b4' }}>
                         Mark this audio for Recompose
                      </span>
                    </div>
                  </div>
                </div>

                {/* Audio element */}
                <audio ref={audioRef} src={audioUrl} preload="metadata" />

                {/* Player controls */}
                <div className="mb-3">
                  <div className="d-flex align-items-center gap-3 mb-3">
                    <button
                      onClick={togglePlayPause}
                      className="btn btn-outline-light"
                      disabled={isSaving || isTranscribing}
                      style={{ 
                        width: 48, 
                        height: 48, 
                        borderRadius: '50%',
                        opacity: (isSaving || isTranscribing) ? 0.5 : 1,
                        cursor: (isSaving || isTranscribing) ? 'not-allowed' : 'pointer'
                      }}
                    >
                      <i className={`bi ${isPlaying ? 'bi-pause-fill' : 'bi-play-fill'}`} style={{ fontSize: 20 }}></i>
                    </button>
                    <div style={{ flex: 1 }}>
                      <div
                        onClick={handleSeek}
                        style={{
                          height: 8,
                          background: 'rgba(167, 139, 250, 0.2)',
                          borderRadius: 6,
                          overflow: 'hidden',
                          cursor: (isSaving || isTranscribing) ? 'not-allowed' : 'pointer',
                          opacity: (isSaving || isTranscribing) ? 0.5 : 1
                        }}
                      >
                        <div
                          style={{
                            width: `${duration ? (currentTime / duration) * 100 : 0}%`,
                            height: '100%',
                            background: 'linear-gradient(90deg, var(--orange), var(--pink))',
                            transition: 'width 0.1s linear'
                          }}
                        />
                      </div>
                      <div
                        className="d-flex justify-content-between mt-2"
                        style={{ fontSize: 12, color: '#9aa0b4' }}
                      >
                        <div>{formatTime(currentTime)}</div>
                        <div>{formatTime(duration)}</div>
                      </div>
                    </div>
                  </div>

                   {/* Transcription Progress */}
                  {/* {isTranscribing && (
                    <div className="text-center py-4">
                      <div className="mb-3">
                        <div className="spinner-border text-light" style={{ width: 48, height: 48 }} role="status">
                          <span className="visually-hidden">Loading...</span>
                        </div>
                      </div>
                      <h6 className="mb-3">Transcribing your audio...</h6>
                      <div className="mb-2">
                        <div
                          style={{
                            height: 8,
                            background: 'rgba(167, 139, 250, 0.2)',
                            borderRadius: 6,
                            overflow: 'hidden',
                            margin: '0 auto',
                            maxWidth: 300
                          }}
                        >
                          <div
                            style={{
                              width: `${transcriptionProgress || 0}%`,
                              height: '100%',
                              background: 'linear-gradient(90deg, var(--orange), var(--pink))',
                              transition: 'width 600ms ease'
                            }}
                          />
                        </div>
                        <div className="mt-2" style={{ fontSize: 14, color: '#9aa0b4' }}>
                          {transcriptionProgress || 0}% complete
                        </div>
                      </div>
                      <p className="text-muted" style={{ fontSize: '13px' }}>
                        This may take 30 seconds to 2 minutes depending on audio length
                      </p>
                    </div>
                  )} */}

                  {/* Progress Bar - Right below audio player */}
                  {(isSaving || isTranscribing) && (
                    <div className="mt-3">
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <span style={{ fontSize: '13px', color: '#9aa0b4' }}>
                          {isSaving ? 'Uploading...' : 'Processing Please wait...'}
                        </span>
                        <span style={{ fontSize: '13px', fontWeight: 600, color: '#a78bfa' }}>
                          {isSaving ? (uploadProgress || 0) : (transcriptionProgress || 0)}%
                        </span>
                      </div>
                      <div
                        style={{
                          height: 6,
                          background: 'rgba(167, 139, 250, 0.2)',
                          borderRadius: 4,
                          overflow: 'hidden',
                          position: 'relative'
                        }}
                      >
                        <div
                          style={{
                            width: `${isSaving ? (uploadProgress || 0) : (transcriptionProgress || 0)}%`,
                            height: '100%',
                            background: 'linear-gradient(90deg, var(--orange), var(--pink))',
                            transition: 'width 0.6s ease',
                            position: 'relative'
                          }}
                        >
                          {/* Shimmer effect */}
                          <div
                            style={{
                              position: 'absolute',
                              top: 0,
                              left: 0,
                              right: 0,
                              bottom: 0,
                              background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
                              animation: 'shimmer 2s infinite'
                            }}
                          />
                        </div>
                      </div>
                      
                      {/* Success check icon when 100% */}
                      {((isSaving && uploadProgress === 100) || (isTranscribing && transcriptionProgress === 100)) && (
                        <div className="text-center mt-2">
                          <i className="bi bi-check-circle-fill" style={{ fontSize: '16px', color: '#4ade80' }}></i>
                          <span className="ms-2" style={{ fontSize: '12px', color: '#4ade80' }}>
                            {isSaving ? 'Upload Complete!' : 'Transcription Complete!'}
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                </div>
              </div>
            )}

            {/* Error message */}
            {transcriptionError && (
              <div className="mb-3">
                <div className="alert alert-danger" style={{ 
                  background: 'rgba(220, 53, 69, 0.1)', 
                  border: '1px solid rgba(220, 53, 69, 0.3)',
                  borderRadius: '8px',
                  color: '#ff6b6b'
                }}>
                  <div className="d-flex align-items-center">
                    <i className="bi bi-exclamation-triangle-fill me-2" style={{ fontSize: '18px' }}></i>
                    <div>
                      <strong>Transcription Failed</strong>
                      <div style={{ fontSize: '14px', marginTop: '4px' }}>
                        {transcriptionError}
                      </div>
                      <div style={{ fontSize: '13px', marginTop: '8px', color: '#9aa0b4' }}>
                        Please try with a different audio file or check if the audio contains clear speech.
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Action buttons - Always visible but disabled during processing */}
            <div className="d-flex gap-2 justify-content-end">
              <button
                className="btn btn-outline-light"
                onClick={handleClose}
                disabled={isSaving || isTranscribing}
                style={{
                  opacity: (isSaving || isTranscribing) ? 0.5 : 1,
                  cursor: (isSaving || isTranscribing) ? 'not-allowed' : 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                className="btn"
                onClick={handleSaveAudio}
                disabled={!selectedFile || isSaving || isTranscribing}
                style={{
                  background: selectedFile && !(isSaving || isTranscribing)
                    ? 'linear-gradient(90deg, var(--orange), var(--pink), var(--purple))'
                    : '#555',
                  color: '#fff',
                  border: 'none',
                  opacity: !selectedFile || (isSaving || isTranscribing) ? 0.5 : 1,
                  cursor: !selectedFile || (isSaving || isTranscribing) ? 'not-allowed' : 'pointer'
                }}
              >
                {isSaving ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" />
                    Uploading...
                  </>
                ) : isTranscribing ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" />
                    Processing...
                  </>
                ) : (
                  <>
                    <i className="bi bi-check-circle me-2"></i>
                    Save Audio
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  );
};

export default AudioTranscribeModal;

