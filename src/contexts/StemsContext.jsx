import React, { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react';
import { io as ioClient } from 'socket.io-client';
import toast from 'react-hot-toast';
import axios from 'axios';

const StemsContext = createContext();

export const useStemsManager = () => {
  const context = useContext(StemsContext);
  if (!context) {
    throw new Error('useStemsManager must be used within StemsProvider');
  }
  return context;
};

export const StemsProvider = ({ children }) => {
  const [jobs, setJobs] = useState({}); // { jobId: { jobId, externalJobId, trackId, trackName, status, progress, error } }
  const [socketConnected, setSocketConnected] = useState(false);
  const socketRef = useRef(null);
  const shownToasts = useRef(new Set());
  const jobTimersRef = useRef({});

  // Initialize socket on component mount
  useEffect(() => {
    let SOCKET_URL;
    if (window.location.hostname === 'openbeat.ai') {
      SOCKET_URL = 'https://api.openbeat.ai';
    } else {
      SOCKET_URL = 'https://api.openbeat.ai';
    }

    console.log('StemsContext: Initializing socket at', SOCKET_URL);

    const socket = ioClient(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 20000,
      forceNew: true
    });

    // Socket connection handlers
    socket.on('connect', () => {
      console.info('StemsContext: Socket connected', socket.id);
      setSocketConnected(true);
      // Rejoin rooms for incomplete jobs
      Object.values(jobs).forEach(job => {
        if (job.status === 'processing' && job.jobId) {
          socket.emit('join_stems_room', job.jobId);
          console.log('StemsContext: Rejoined room for jobId:', job.jobId);
        }
      });
    });

    socket.on('connect_error', (err) => {
      console.warn('StemsContext: Socket connect_error', err?.message);
      setSocketConnected(false);
    });

    socket.on('reconnect', () => {
      console.info('StemsContext: Socket reconnected');
      setSocketConnected(true);
      Object.values(jobs).forEach(job => {
        if (job.status === 'processing' && job.jobId) {
          socket.emit('join_stems_room', job.jobId);
        }
      });
    });

    // Handle stems_progress event
    const onStemsProgress = (p) => {
      try {
        if (!p) return;
        console.log('StemsContext: stems_progress received:', p);

        setJobs(prevJobs => {
          const job = Object.values(prevJobs).find(
            j => j.jobId === p.jobId || j.externalJobId === p.jobId
          );
          if (job) {
            const display = p.status === 'completed' ? 100 : Math.min(99, p.progress || 0);
            return {
              ...prevJobs,
              [job.jobId]: {
                ...job,
                progress: display,
                status: p.status || 'processing'
              }
            };
          }
          return prevJobs;
        });
      } catch (e) {
        console.error('StemsContext: stems_progress handler error', e);
      }
    };

    // Handle stems_ready event
    const onStemsReady = (payload) => {
      try {
        if (!payload) return;
        console.log('StemsContext: stems_ready received:', payload);

        setJobs(prevJobs => {
          const job = Object.values(prevJobs).find(j => {
            if (j.jobId && j.jobId === payload.jobId) return true;
            if (j.externalJobId && j.externalJobId === payload.external_job_id) return true;
            if (payload.jobId === j.jobId) return true;
            return false;
          });

          if (job) {
            const toastKey = payload.jobId || payload.external_job_id || job.jobId;
            if (toastKey && !shownToasts.current.has(toastKey)) {
              shownToasts.current.add(toastKey);
              toast.success('Stems ready! Downloading...');
              triggerAutoDownload(job.jobId, job.trackName);
            }

            return {
              ...prevJobs,
              [job.jobId]: {
                ...job,
                status: 'completed',
                progress: 100
              }
            };
          }
          return prevJobs;
        });
      } catch (e) {
        console.error('StemsContext: stems_ready handler error', e);
      }
    };

    // Handle stems_failed event
    const onStemsFailed = (payload) => {
      try {
        if (!payload) return;
        console.log('StemsContext: stems_failed received:', payload);

        setJobs(prevJobs => {
          const job = Object.values(prevJobs).find(j => {
            if (j.jobId && j.jobId === payload.jobId) return true;
            if (j.externalJobId && j.externalJobId === payload.external_job_id) return true;
            return false;
          });

          if (job) {
            const errMsg = payload.message || payload.error || 'Unknown error';
            const toastKey = payload.jobId || job.jobId;
            if (toastKey && !shownToasts.current.has(toastKey)) {
              shownToasts.current.add(toastKey);
              toast.error(`Stems extraction failed: ${errMsg}`);
            }

            return {
              ...prevJobs,
              [job.jobId]: {
                ...job,
                status: 'failed',
                error: errMsg
              }
            };
          }
          return prevJobs;
        });
      } catch (e) {
        console.error('StemsContext: stems_failed handler error', e);
      }
    };

    socket.on('stems_progress', onStemsProgress);
    socket.on('stems_ready', onStemsReady);
    socket.on('stems_failed', onStemsFailed);

    socketRef.current = socket;

    return () => {
      socket.off('stems_progress', onStemsProgress);
      socket.off('stems_ready', onStemsReady);
      socket.off('stems_failed', onStemsFailed);
      socket.disconnect();
    };
  }, []);

  // Auto-download WAV zip
  const triggerAutoDownload = useCallback((jobId, trackName) => {
    try {
      const link = document.createElement('a');
      link.href = `/api/stems/download/${jobId}?format=wav`;
      link.download = `stems_${trackName || jobId}_wav.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      console.log('StemsContext: Auto-download triggered for jobId:', jobId);
    } catch (e) {
      console.error('StemsContext: Auto-download error', e);
      toast.error('Failed to auto-download stems');
    }
  }, []);

  // Start extraction
  const startExtraction = useCallback(async (track, includeVocals = false) => {
    try {
      const payload = {
        audioUrl: track.audioUrl || track.audioUrlWav || track._audioPath || track.audio_url,
        stems: ['drums', 'bass', 'piano', 'guitar', 'back_vocal', 'strings', 'winds', 'vocals', 'kick_drum', 'snare_drum', 'hi_hat', 'keys'],
        isVocal: includeVocals
      };

      const res = await axios.post('/api/stems/extract', payload);
      console.log('StemsContext: Extraction started:', res.data);

      const jobId = res.data.jobId;
      const externalJobId = res.data.externalJobId;
      const trackId = track._id || track.id;
      const trackName = track.prompt || track.title || 'Unknown';

      // Add job to context
      setJobs(prevJobs => ({
        ...prevJobs,
        [jobId]: {
          jobId,
          externalJobId,
          trackId,
          trackName,
          status: 'processing',
          progress: 0,
          error: null
        }
      }));

      // Join socket room
      if (socketRef.current) {
        socketRef.current.emit('join_stems_room', jobId);
        console.log('StemsContext: Joined room for jobId:', jobId);
      }

      toast.success(`Extracting stems from ${trackName}...`);
      return jobId;
    } catch (e) {
      console.error('StemsContext: Start extraction error', e);
      const msg = e?.response?.data?.message || e?.message || 'Failed to start extraction';
      toast.error(`Failed to start extraction: ${msg}`);
      throw e;
    }
  }, []);

  // Get job status
  const getJobStatus = useCallback((trackId) => {
    const job = Object.values(jobs).find(j => j.trackId === trackId);
    return job || null;
  }, [jobs]);

  // Get all jobs
  const getAllJobs = useCallback(() => {
    return jobs;
  }, [jobs]);

  // Retry extraction
  const retryExtraction = useCallback((trackId) => {
    const job = Object.values(jobs).find(j => j.trackId === trackId);
    if (job) {
      setJobs(prevJobs => {
        const newJobs = { ...prevJobs };
        delete newJobs[job.jobId];
        return newJobs;
      });
      shownToasts.current.delete(job.jobId);
      toast.info('Retrying extraction...');
    }
  }, [jobs]);

  // Disconnect socket manually
  const disconnectSocket = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      setSocketConnected(false);
      console.log('StemsContext: Socket manually disconnected');
    }
  }, []);

  const value = {
    jobs,
    socketConnected,
    startExtraction,
    getJobStatus,
    getAllJobs,
    retryExtraction,
    disconnectSocket,
    triggerAutoDownload,
    getJobByTrackId: (trackId) => Object.values(jobs).find(j => j.trackId === trackId)
  };

  return <StemsContext.Provider value={value}>{children}</StemsContext.Provider>;
};

export default StemsContext;
