import React, { useState, useRef, useEffect } from 'react';
import toast from 'react-hot-toast';

/**
 * AudioTranscribeModal Component
 * Allows user to upload audio file or record voice (30 sec), play/pause it
 * On save, sends to backend for transcription
 */
const AudioTranscribeModal = ({ show, onClose, onSaveAudio, isTranscribing, transcriptionProgress, transcriptionError, defaultMode = null, resetTrigger = 0 }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [markForCover, setMarkForCover] = useState(true); // Always recompose
  const [isSaving, setIsSaving] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isDragActive, setIsDragActive] = useState(false);

  // Voice Recording states
  const [mode, setMode] = useState('upload'); // 'upload' or 'record'
  const [isRecording, setIsRecording] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState(null);
  const [recordedUrl, setRecordedUrl] = useState(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [isPlayingRecorded, setIsPlayingRecorded] = useState(false);
  const [recordedCurrentTime, setRecordedCurrentTime] = useState(0);
  const [recordedDuration, setRecordedDuration] = useState(0);

  const audioRef = useRef(null);
  const recordedAudioRef = useRef(null);
  const fileInputRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const recordingIntervalRef = useRef(null);

  const processSelectedFile = (file) => {
    if (!file) return;

    const allowedTypes = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/wave', 'audio/x-wav', 'audio/aac', 'audio/m4a', 'audio/ogg', 'audio/flac'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Invalid file type. Please select an audio file.');
      return;
    }

    const maxSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxSize) {
      toast.error('File size exceeds 50MB limit.');
      return;
    }

    setSelectedFile(file);

    const url = URL.createObjectURL(file);
    setAudioUrl(url);
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
  };

  // Audio player event listeners for uploaded file
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

  // Recorded audio player event listeners
  useEffect(() => {
    const audio = recordedAudioRef.current;
    if (!audio) return;

    const onTimeUpdate = () => setRecordedCurrentTime(audio.currentTime || 0);
    const onLoadedMetadata = () => setRecordedDuration(audio.duration || 0);
    const onEnded = () => setIsPlayingRecorded(false);

    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('loadedmetadata', onLoadedMetadata);
    audio.addEventListener('ended', onEnded);

    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('loadedmetadata', onLoadedMetadata);
      audio.removeEventListener('ended', onEnded);
    };
  }, [recordedUrl]);

  // Auto-play recorded audio
  useEffect(() => {
    if (isPlayingRecorded && recordedAudioRef.current) {
      recordedAudioRef.current.play().catch(e => {
        console.error('Error playing recorded audio:', e);
        setIsPlayingRecorded(false);
      });
    } else if (!isPlayingRecorded && recordedAudioRef.current) {
      recordedAudioRef.current.pause();
    }
  }, [isPlayingRecorded]);

  // Reset modal states when resetTrigger changes
  useEffect(() => {
    if (resetTrigger > 0) {
      // Clear file upload
      setSelectedFile(null);
      setAudioUrl(null);
      setIsPlaying(false);
      setCurrentTime(0);
      setDuration(0);

      // Clear recording
      clearRecording();

      // Reset to upload mode
      setMode('upload');

      // Reset other states
      setUploadProgress(0);
      setIsSaving(false);
      setMarkForCover(true);
    }
  }, [resetTrigger]);

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    processSelectedFile(file);
  };

  const handleChooseFile = () => {
    fileInputRef.current?.click();
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isSaving || isTranscribing) return;
    setIsDragActive(true);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isSaving || isTranscribing) return;
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isSaving || isTranscribing) return;

    // Only reset when leaving the container
    if (e.target === e.currentTarget) {
      setIsDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isSaving || isTranscribing) return;
    setIsDragActive(false);

    const files = e.dataTransfer?.files;
    if (files && files.length > 0) {
      processSelectedFile(files[0]);
      e.dataTransfer.clearData();
    }
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

  // Voice Recording Functions
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });

      const chunks = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm;codecs=opus' });
        setRecordedBlob(blob);

        const url = URL.createObjectURL(blob);
        setRecordedUrl(url);

        // Stop all audio tracks
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      // Auto-stop after 30 seconds
      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime(prev => {
          const newTime = prev + 1;
          if (newTime >= 30) {
            mediaRecorder.stop();
            setIsRecording(false);
            clearInterval(recordingIntervalRef.current);
            toast.success('Recording completed (30 seconds)');
            return 30;
          }
          return newTime;
        });
      }, 1000);

      toast.success('Recording started');
    } catch (error) {
      console.error('Error accessing microphone:', error);
      toast.error('Unable to access microphone. Please check permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      clearInterval(recordingIntervalRef.current);
      toast.success('Recording stopped');
    }
  };

  const togglePlayRecorded = () => {
    if (!recordedUrl) return;
    setIsPlayingRecorded(!isPlayingRecorded);
  };

  const handleRecordedSeek = (e) => {
    if (!recordedAudioRef.current || !recordedDuration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    const newTime = percent * recordedDuration;
    recordedAudioRef.current.currentTime = newTime;
    setRecordedCurrentTime(newTime);
  };

  const clearRecording = () => {
    if (recordedUrl) {
      URL.revokeObjectURL(recordedUrl);
    }
    setRecordedBlob(null);
    setRecordedUrl(null);
    setRecordingTime(0);
    setIsPlayingRecorded(false);
    setRecordedCurrentTime(0);
    setRecordedDuration(0);
    if (recordedAudioRef.current) {
      recordedAudioRef.current.pause();
    }
  };

  const handleSaveAudio = async () => {
    let fileToUpload = null;

    if (mode === 'upload') {
      if (!selectedFile) {
        toast.error('Please select an audio file first.');
        return;
      }
      fileToUpload = selectedFile;
    } else {
      if (!recordedBlob) {
        toast.error('Please record audio first.');
        return;
      }
      // Convert blob to File object
      fileToUpload = new File([recordedBlob], `recording_${Date.now()}.webm`, { type: 'audio/webm' });
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
      // Call parent callback with file and recompose flag
      await onSaveAudio(fileToUpload, false, true);

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

    // Stop recording if active
    if (isRecording) {
      stopRecording();
    }

    // Cleanup recording refs
    if (recordingIntervalRef.current) {
      clearInterval(recordingIntervalRef.current);
    }

    // Cleanup URLs
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
    if (recordedUrl) {
      URL.revokeObjectURL(recordedUrl);
    }

    // Reset all states
    setSelectedFile(null);
    setAudioUrl(null);
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
    setMarkForCover(true);
    setMode('upload');
    setRecordedBlob(null);
    setRecordedUrl(null);
    setRecordingTime(0);
    setIsPlayingRecorded(false);
    setRecordedCurrentTime(0);
    setRecordedDuration(0);
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
            {/* Mode Tabs */}
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', borderBottom: '1px solid #2b2b3a', paddingBottom: '1rem' }}>
              <button
                onClick={() => {
                  setMode('upload');
                  clearRecording();
                }}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: mode === 'upload' ? '#a78bfa' : '#9aa0b4',
                  fontSize: '14px',
                  fontWeight: mode === 'upload' ? 600 : 400,
                  cursor: 'pointer',
                  paddingBottom: '0.5rem',
                  borderBottom: mode === 'upload' ? '2px solid #a78bfa' : 'transparent',
                  transition: 'all 0.3s ease'
                }}
              >
                <i className="bi bi-cloud-upload" style={{ marginRight: '0.5rem' }}></i>
                Upload File
              </button>
              <button
                onClick={() => {
                  setMode('record');
                  setSelectedFile(null);
                  setAudioUrl(null);
                  setIsPlaying(false);
                }}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: mode === 'record' ? '#a78bfa' : '#9aa0b4',
                  fontSize: '14px',
                  fontWeight: mode === 'record' ? 600 : 400,
                  cursor: 'pointer',
                  paddingBottom: '0.5rem',
                  borderBottom: mode === 'record' ? '2px solid #a78bfa' : 'transparent',
                  transition: 'all 0.3s ease'
                }}
              >
                <i className="bi bi-mic" style={{ marginRight: '0.5rem' }}></i>
                Record Voice
              </button>
            </div>

            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="audio/*"
              onChange={handleFileSelect}
              style={{ display: 'none' }}
            />

            {/* Upload Mode Content */}
            {mode === 'upload' && (
              <>
                {/* Drag & drop upload area */}
                {!selectedFile && !isTranscribing && (
                  <div
                    className="upload-dropzone"
                    onClick={handleChooseFile}
                    onDragEnter={handleDragEnter}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    style={{
                      border: isDragActive ? '2px solid transparent' : '2px dashed rgba(167, 139, 250, 0.4)',
                      background: isDragActive ? 'rgba(167, 139, 250, 0.12)' : 'rgba(24, 25, 42, 0.6)',
                      borderRadius: '14px',
                      padding: '2.5rem 1.5rem',
                      textAlign: 'center',
                      transition: 'all 0.3s ease',
                      cursor: (isSaving || isTranscribing) ? 'not-allowed' : 'pointer',
                      position: 'relative',
                      overflow: 'hidden'
                    }}
                  >
                    <div
                      style={{
                        margin: '0 auto 1rem',
                        width: 64,
                        height: 64,
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, rgba(167, 139, 250, 0.2), rgba(236, 72, 153, 0.2))',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#a78bfa',
                        fontSize: '28px'
                      }}
                    >
                      <i className="bi bi-cloud-upload"></i>
                    </div>
                    <h6 style={{ color: '#fff', fontWeight: 600, marginBottom: '0.5rem' }}>
                      Drag &amp; drop your audio file here
                    </h6>
                    <p style={{ color: '#9aa0b4', fontSize: '13px', marginBottom: '0.75rem' }}>
                      or click to browse files
                    </p>
                    <p style={{ color: '#6f7385', fontSize: '12px' }}>
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
                      
                      {/* Recompose Indicator */}
                      <div className="mt-3 pt-3" style={{ borderTop: '1px solid #2b2b3a' }}>
                        <div style={{ fontSize: '14px', color: '#a78bfa', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <i className="bi bi-check-circle-fill"></i>
                          <span>Recompose Mode: Your audio will be used for recomposing beats</span>
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
              </>
            )}

            {/* Record Mode Content */}
            {mode === 'record' && (
              <>
                {/* Recording Controls */}
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                  {!recordedUrl ? (
                    <>
                      {/* Recording Timer and Instructions */}
                      <div style={{ marginBottom: '2rem' }}>
                        <div style={{
                          fontSize: '48px',
                          fontWeight: 700,
                          color: isRecording ? '#ec4853' : '#a78bfa',
                          marginBottom: '1rem',
                          fontFamily: 'monospace'
                        }}>
                          {formatTime(recordingTime)} / 0:30
                        </div>
                        <p style={{ color: '#9aa0b4', fontSize: '13px' }}>
                          {isRecording ? 'Recording in progress... Click Stop to finish' : 'Click microphone button and begin humming your melody'}
                        </p>
                      </div>

                      {/* Record/Stop Button */}
                      <button
                        onClick={isRecording ? stopRecording : startRecording}
                        disabled={isSaving || isTranscribing}
                        style={{
                          background: isRecording 
                            ? '#dc2626' 
                            : 'linear-gradient(90deg, var(--orange), var(--pink))',
                          color: '#fff',
                          border: 'none',
                          borderRadius: '50%',
                          width: 120,
                          height: 120,
                          fontSize: '48px',
                          cursor: (isSaving || isTranscribing) ? 'not-allowed' : 'pointer',
                          opacity: (isSaving || isTranscribing) ? 0.5 : 1,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          margin: '0 auto 2rem',
                          transition: 'all 0.3s ease',
                          boxShadow: isRecording ? '0 0 20px rgba(220, 38, 38, 0.6)' : '0 4px 12px rgba(167, 139, 250, 0.4)'
                        }}
                      >
                        <i className={isRecording ? 'bi bi-stop-fill' : 'bi bi-mic-fill'}></i>
                      </button>
                    </>
                  ) : (
                    <>
                      {/* Recorded audio section */}
                      <div style={{ marginBottom: '2rem', textAlign: 'left' }}>
                        <div className="mb-3 p-3" style={{ background: '#18192a', borderRadius: '8px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                            <i className="bi bi-mic-fill" style={{ fontSize: '32px', color: '#a78bfa' }}></i>
                            <div style={{ flex: 1 }}>
                              <div style={{ fontSize: '14px', fontWeight: 600, color: '#fff' }}>
                                Your Recording
                              </div>
                              <div style={{ fontSize: '12px', color: '#9aa0b4' }}>
                                {formatTime(recordedDuration)}
                              </div>
                            </div>
                            <button
                              className="btn btn-sm btn-outline-light"
                              onClick={() => {
                                clearRecording();
                                setRecordingTime(0);
                              }}
                            >
                              Re-record
                            </button>
                          </div>

                          {/* Recompose Indicator */}
                          <div className="mt-3 pt-3" style={{ borderTop: '1px solid #2b2b3a' }}>
                            <div style={{ fontSize: '14px', color: '#a78bfa', display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <i className="bi bi-check-circle-fill"></i>
                              <span>Recompose Mode: Your audio will be used for recomposing beats</span>
                            </div>
                          </div>
                        </div>

                        {/* Audio element */}
                        <audio ref={recordedAudioRef} src={recordedUrl} preload="metadata" />

                        {/* Player controls */}
                        <div className="mt-3">
                          <div className="d-flex align-items-center gap-3 mb-3">
                            <button
                              onClick={togglePlayRecorded}
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
                              <i className={`bi ${isPlayingRecorded ? 'bi-pause-fill' : 'bi-play-fill'}`} style={{ fontSize: 20 }}></i>
                            </button>
                            <div style={{ flex: 1 }}>
                              <div
                                onClick={handleRecordedSeek}
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
                                    width: `${recordedDuration ? (recordedCurrentTime / recordedDuration) * 100 : 0}%`,
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
                                <div>{formatTime(recordedCurrentTime)}</div>
                                <div>{formatTime(recordedDuration)}</div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

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
                    </>
                  )}
                </div>
              </>
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
            <div className="d-flex gap-2 justify-content-end" style={{marginTop:'6px'}}>
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
                disabled={(mode === 'upload' ? !selectedFile : !recordedBlob) || isSaving || isTranscribing}
                style={{
                  background: (mode === 'upload' ? selectedFile : recordedBlob) && !(isSaving || isTranscribing)
                    ? 'linear-gradient(90deg, var(--orange), var(--pink), var(--purple))'
                    : '#555',
                  color: '#fff',
                  border: 'none',
                  opacity: ((mode === 'upload' ? !selectedFile : !recordedBlob) || (isSaving || isTranscribing)) ? 0.5 : 1,
                  cursor: ((mode === 'upload' ? !selectedFile : !recordedBlob) || (isSaving || isTranscribing)) ? 'not-allowed' : 'pointer'
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
