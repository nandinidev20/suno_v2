import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { io as ioClient } from 'socket.io-client';
import toast, { Toaster } from 'react-hot-toast';

const AudioToMidiModal = ({ show, onClose, track }) => {
  const [loading, setLoading] = useState(false);
  const [taskId, setTaskId] = useState(null);
  const [status, setStatus] = useState(null);
  const [progress, setProgress] = useState(0);
  const [etaRemaining, setEtaRemaining] = useState(null);
  const [originalEta, setOriginalEta] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [midiUrl, setMidiUrl] = useState(null);
  const [sonifiedAudioUrl, setSonifiedAudioUrl] = useState(null);
  const [noteEvents, setNoteEvents] = useState(null);
  const shownToasts = useRef(new Set());

  useEffect(() => {
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

    const onProgress = (data) => {
      try {
        console.log('Received audio-to-midi-progress:', data, 'Current taskId:', taskId);
        if (!data) return;
        if (data.task_id && data.task_id === taskId) {
          const display = Math.min(99, data.progress || 0);
          setProgress(display);
          setEtaRemaining(data.etaRemaining ?? null);
          if (data.originalEta && !originalEta) {
            setOriginalEta(data.originalEta);
          }
          setStatus(data.status || 'processing');
        }
      } catch (e) {
        console.error('audio-to-midi-progress handler error:', e);
      }
    };

    const onComplete = (data) => {
      try {
        console.log('Received audio-to-midi-complete:', data);
        if (!data) return;
        if (data.task_id && data.task_id === taskId) {
          setProgress(100);
          setStatus('completed');
          setMidiUrl(data.midi_url);
          setSonifiedAudioUrl(data.sonified_audio_url);
          setNoteEvents(data.note_events);
          setLoading(false);

          const toastKey = `complete-${data.task_id}`;
          if (!shownToasts.current.has(toastKey)) {
            shownToasts.current.add(toastKey);
            toast.success('Audio-to-MIDI conversion completed!');
          }
        }
      } catch (e) {
        console.error('audio-to-midi-complete handler error:', e);
      }
    };

    const onFailed = (data) => {
      try {
        console.log('Received audio-to-midi-failed:', data);
        if (!data) return;
        if (data.task_id && data.task_id === taskId) {
          setStatus('failed');
          setErrorMsg(data.message || 'Conversion failed');
          setLoading(false);

          const toastKey = `failed-${data.task_id}`;
          if (!shownToasts.current.has(toastKey)) {
            shownToasts.current.add(toastKey);
            toast.error(data.message || 'Conversion failed');
          }
        }
      } catch (e) {
        console.error('audio-to-midi-failed handler error:', e);
      }
    };

    socket.on('audio-to-midi-progress', onProgress);
    socket.on('audio-to-midi-complete', onComplete);
    socket.on('audio-to-midi-failed', onFailed);

    return () => {
      socket.off('audio-to-midi-progress', onProgress);
      socket.off('audio-to-midi-complete', onComplete);
      socket.off('audio-to-midi-failed', onFailed);
      socket.disconnect();
    };
  }, [taskId, originalEta]);

  const handleStartConversion = async () => {
    try {
      setLoading(true);
      setStatus('starting');
      setProgress(0);
      setErrorMsg(null);
      setMidiUrl(null);
      setSonifiedAudioUrl(null);
      setNoteEvents(null);

      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please login to continue');
        setLoading(false);
        return;
      }

      const audioUrl = track.audioUrl || track.audio_url || track.audioUrlWav || track.audio_url_wav;
      if (!audioUrl) {
        toast.error('No audio URL found for this track');
        setLoading(false);
        return;
      }

      const response = await axios.post(
        '/api/audio-to-midi/start',
        {
          audio_url: audioUrl,
          sonify_midi: true,
          save_note_events: true
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.data.success) {
        setTaskId(response.data.task_id);
        setStatus('queued');
        toast.success('Conversion started! Please wait...');
      } else {
        toast.error(response.data.message || 'Failed to start conversion');
        setLoading(false);
      }
    } catch (error) {
      console.error('Error starting audio-to-midi conversion:', error);
      toast.error(error.response?.data?.message || 'Failed to start conversion');
      setLoading(false);
      setErrorMsg(error.response?.data?.message || 'Failed to start conversion');
    }
  };

  const handleDownload = (url, filename) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleClose = () => {
    setLoading(false);
    setTaskId(null);
    setStatus(null);
    setProgress(0);
    setEtaRemaining(null);
    setOriginalEta(null);
    setErrorMsg(null);
    setMidiUrl(null);
    setSonifiedAudioUrl(null);
    setNoteEvents(null);
    shownToasts.current.clear();
    onClose();
  };

  if (!show) return null;

  return (
    <>
      <Toaster position="top-center" />
      <div
        className="modal show d-block"
        style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}
        onClick={handleClose}
      >
        <div
          className="modal-dialog modal-dialog-centered"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="modal-content" style={{ backgroundColor: '#1a1a2e', color: '#fff' }}>
            <div className="modal-header" style={{ borderBottom: '1px solid #333' }}>
              <h5 className="modal-title">Audio to MIDI Conversion</h5>
              <button
                type="button"
                className="btn-close btn-close-white"
                onClick={handleClose}
              ></button>
            </div>
            <div className="modal-body">
              {!taskId && !loading && (
                <div className="text-center">
                  <p className="mb-4">
                    Convert this audio track to MIDI format. This will generate:
                  </p>
                  <ul className="text-start mb-4" style={{ listStyle: 'none', padding: 0 }}>
                    <li className="mb-2">
                      <i className="bi bi-file-music me-2"></i>
                      MIDI file (.mid)
                    </li>
                    <li className="mb-2">
                      <i className="bi bi-music-note-beamed me-2"></i>
                      Sonified audio (playable version)
                    </li>
                    <li className="mb-2">
                      <i className="bi bi-list-ul me-2"></i>
                      Note events data
                    </li>
                  </ul>
                  <button
                    className="btn btn-primary w-100"
                    onClick={handleStartConversion}
                  >
                    <i className="bi bi-play-circle me-2"></i>
                    Start Conversion
                  </button>
                </div>
              )}

              {loading && status !== 'completed' && (
                <div className="text-center">
                  <div className="mb-3">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                  </div>
                  <h6 className="mb-3">
                    {status === 'starting' && 'Starting conversion...'}
                    {status === 'queued' && 'Queued for processing...'}
                    {status === 'processing' && 'Converting audio to MIDI...'}
                  </h6>
                  <div className="progress mb-3" style={{ height: '25px' }}>
                    <div
                      className="progress-bar progress-bar-striped progress-bar-animated"
                      role="progressbar"
                      style={{ width: `${progress}%` }}
                    >
                      {progress}%
                    </div>
                  </div>
                  {etaRemaining !== null && (
                    <p className="text-white">
                      <i className="bi bi-clock me-2"></i>
                      Estimated time remaining: {etaRemaining}s
                    </p>
                  )}

                  {originalEta && (
                    <p className="text-white small">
                      Total estimated time: {originalEta}s
                    </p>
                  )}

                </div>
              )}

              {status === 'completed' && midiUrl && (
                <div className="text-center">
                  <div className="alert alert-success" role="alert">
                    <i className="bi bi-check-circle me-2"></i>
                    Conversion completed successfully!
                  </div>

                  <div className="d-grid gap-2 mb-3">
                    <button
                      className="btn btn-primary"
                      onClick={() => handleDownload(midiUrl, 'converted.mid')}
                    >
                      <i className="bi bi-download me-2"></i>
                      Download MIDI File
                    </button>

                    {sonifiedAudioUrl && (
                      <button
                        className="btn btn-outline-primary"
                        onClick={() => handleDownload(sonifiedAudioUrl, 'sonified.mp3')}
                      >
                        <i className="bi bi-music-note-beamed me-2"></i>
                        Download Sonified Audio
                      </button>
                    )}
                  </div>

                  {noteEvents && (
                    <div className="mt-3">
                      <button
                        className="btn btn-sm btn-outline-secondary"
                        onClick={() => {
                          const blob = new Blob([JSON.stringify(noteEvents, null, 2)], {
                            type: 'application/json'
                          });
                          const url = URL.createObjectURL(blob);
                          handleDownload(url, 'note-events.json');
                          URL.revokeObjectURL(url);
                        }}
                      >
                        <i className="bi bi-file-earmark-code me-2"></i>
                        Download Note Events (JSON)
                      </button>
                    </div>
                  )}

                 {/*  {sonifiedAudioUrl && (
                    <div className="mt-4">
                      <h6 className="mb-3">Preview Sonified Audio:</h6>
                      <audio controls className="w-100" style={{ maxWidth: '100%' }}>
                        <source src={sonifiedAudioUrl} type="audio/mpeg" />
                        Your browser does not support the audio element.
                      </audio>
                    </div>
                  )} */}
                </div>
              )}

              {status === 'failed' && (
                <div className="text-center">
                  <div className="alert alert-danger" role="alert">
                    <i className="bi bi-exclamation-triangle me-2"></i>
                    {errorMsg || 'Conversion failed. Please try again.'}
                  </div>
                  <button
                    className="btn btn-primary"
                    onClick={handleStartConversion}
                  >
                    <i className="bi bi-arrow-clockwise me-2"></i>
                    Try Again
                  </button>
                </div>
              )}
            </div>
            <div className="modal-footer" style={{ borderTop: '1px solid #333' }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleClose}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AudioToMidiModal;
