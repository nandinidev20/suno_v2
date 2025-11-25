import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { musicAPI, tracksAPI } from '../utils/api';
import toast from 'react-hot-toast';

// Shared music styles constant
export const musicStyles = [
  'reggaeton','latin','Lo-Fi','trap','synthwave','acoustic','acoustic guitar','808','pop',
  'rock', 'jazz','electronic', 'country', 'hip-hop', 'r&b', 'inspirational', 'male', 'female'
];

// Custom hook for music generation logic
export const useGenerate = () => {
  const navigate = useNavigate();
  
  // Generation states
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [musicGptResult, setMusicGptResult] = useState(null);
  const [showModal, setShowModal] = useState(false);
  
  // Ref for progress interval
  const progressRef = useRef(null);

  // Main generate function
  const generateMusic = async (prompt, style, isLyricsPrompt = false, makeInstrumental = false) => {
    if (!prompt.trim()) {
      toast.error('Please enter a prompt');
      return false;
    }
    if (prompt.length < 10) {
      toast.error('Please enter a more detailed prompt (at least 10 characters)');
      return false;
    }

    // Open modal and start generation
    setShowModal(true);
    setIsGenerating(true);
    setGenerationProgress(0);
    setMusicGptResult(null);

    // Animate progress bar over 2-3 minutes (random between 120-180s)
    const totalDuration = Math.floor(Math.random() * 60_000) + 120_000; // 120000-180000 ms
    const startTime = Date.now();
    progressRef.current && clearInterval(progressRef.current);
    progressRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      let percent = Math.min(95, Math.floor((elapsed / totalDuration) * 95));
      setGenerationProgress(percent);
    }, 500);

    try {
      const payload = {
        prompt: prompt,
        style: style,
        make_instrumental: makeInstrumental,
        vocal_only: false,
        isLyricsPrompt: isLyricsPrompt,
      };

      const response = await musicAPI.generate(payload);

      clearInterval(progressRef.current);
      setGenerationProgress(100);

      const data = response.data?.data;
      if (!data) {
        throw new Error("No music generated");
      }

      console.log('Generated music data:', data);
      console.log('Album cover path:', data.album_cover_path);

      setMusicGptResult(data);
      toast.success('Music generated successfully!');

      // Note: Track is already saved by the backend in generate controller
      // No need to save it again from frontend

      return true;

    } catch (error) {
      clearInterval(progressRef.current);
      setGenerationProgress(0);
      const message = error.response?.data?.message || error.message || 'Failed to generate music';
      toast.error(message);
      if (error.response?.status === 403) {
        toast.error('Daily limit reached. Upgrade to premium for unlimited generations.');
      }
      return false;
    } finally {
      setIsGenerating(false);
      setTimeout(() => setGenerationProgress(0), 1000);
    }
  };

  // Clear results
  const clearResults = () => {
    setMusicGptResult(null);
    setGenerationProgress(0);
    setIsGenerating(false);
    setShowModal(false);
    clearInterval(progressRef.current);
    progressRef.current = null;
  };

  // Close modal
  const closeModal = () => {
    if (!isGenerating) {
      setShowModal(false);
    }
  };

  // Navigate to profile
  const handleViewProfile = () => {
    navigate('/profile');
    setShowModal(false);
  };

  // Handle generate another
  const handleGenerateAnother = () => {
    setMusicGptResult(null);
    setGenerationProgress(0);
    setShowModal(false);
  };

  return {
    isGenerating,
    generationProgress,
    musicGptResult,
    showModal,
    generateMusic,
    clearResults,
    closeModal,
    handleViewProfile,
    handleGenerateAnother,
    setMusicGptResult,
  };
};

