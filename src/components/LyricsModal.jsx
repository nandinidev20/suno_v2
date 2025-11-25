import { useState } from 'react';
import axios from 'axios';
import PropTypes from 'prop-types';
import toast from 'react-hot-toast';

const LyricsModal = ({ show, onClose, onApply, theme = 'dark' }) => {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [lyrics, setLyrics] = useState('');
  const [apiMessage, setApiMessage] = useState('');
  const [error, setError] = useState('');

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError('Please enter a prompt for lyrics.');
      return;
    }
    setError('');
    setLoading(true);
    setLyrics('');
    setApiMessage('');
    try {
      // Ensure user is authenticated (auth middleware expects Bearer token)
      const storedToken = localStorage.getItem('token');
      if (!storedToken) {
        setError('You must be logged in to generate lyrics. Please log in and try again.');
        setLoading(false);
        return;
      }

      // Use axios and include the current token explicitly to avoid timing issues
      const resp = await axios.post('/api/music/lyrics', { prompt }, {
        headers: { Authorization: `Bearer ${storedToken}` }
      });
      const data = resp.data || {};
      if (data.success && data.data) {
        const mg = data.data;
        const lyricsText = mg.lyrics || mg.result || mg.data || mg.text || '';
        setLyrics(typeof lyricsText === 'string' ? lyricsText : JSON.stringify(lyricsText));
        setApiMessage(mg.message || 'Lyrics Generated Successfully');
        toast.success(mg.message || 'Lyrics Generated Successfully');
        setPrompt(''); // Clear the prompt field after generating lyrics
      } else {
        const msg = data.message || 'Failed to generate lyrics.';
        setError(msg);
      }
    } catch (err) {
      console.error('Lyrics generate error (frontend):', err?.response?.data || err.message || err);
      const msg = err.response?.data?.message || 'Failed to generate lyrics. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = () => {
    if (lyrics) {
      onApply(lyrics);
      setPrompt('');
      setLyrics('');
      setApiMessage('');
      setError('');
    }
  };

  const handleClose = () => {
    setPrompt('');
    setLyrics('');
    setApiMessage('');
    setError('');
    onClose();
  };

  if (!show) return null;

  return (
    <div className="modal fade show" tabIndex="-1" style={{ display: 'block', background: 'rgba(0,0,0,0.7)', zIndex: 1050 }}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content" style={{ borderRadius: 16, background: '#181c2a', color: '#fff', border: '1.5px solid #23263a', boxShadow: '0 8px 32px #0008' }}>
          <div className="modal-header border-0" style={{ background: 'transparent' }}>
            <h5 className="modal-title" style={{ color: '#a78bfa', fontWeight: 700, letterSpacing: 1 }}>Generate Lyrics</h5>
            <button type="button" className="btn-close btn-close-white" aria-label="Close" onClick={handleClose} style={{ filter: 'invert(1)' }}></button>
          </div>
          <div className="modal-body">
            <label htmlFor="lyrics-prompt" className="form-label" style={{ color: '#fff', fontWeight: 500, padding:'5px 5px' }}>Lyrics Prompt</label>
            <textarea
              id="lyrics-prompt"
              className="input-field mb-2"
              style={{ height: '70px', background: '#23263a', color: '#fff', border: '1.5px solid #23263a', borderRadius: 10, fontSize: '1rem', resize: 'vertical', boxShadow: 'none' }}
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              placeholder="Describe the mood, theme, or story..."
              disabled={loading}
              autoFocus
            />
            {error && <div className="alert alert-danger py-2 my-2" style={{ background: '#2d1a1a', color: '#ff6b6b', border: 'none' }}>{error}</div>}
            {lyrics && (
              <div className="mt-3">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <label className="form-label mb-0" style={{ color: '#a78bfa', fontWeight: 500, fontSize: '0.9rem' }}>
                  Edit lyrics below
                  </label>
                  <span style={{ color: '#888', fontSize: '0.85rem' }}>{lyrics.length} characters</span>
                </div>
                <textarea
                  className="lyrics-box form-control"
                  style={{
                    background: '#23263a',
                    color: '#fff',
                    fontFamily: 'monospace',
                    fontSize: '0.95rem',
                    border: '1.5px solid #a78bfa',
                    boxShadow: '0 0 8px #a78bfa44',
                    borderRadius: 8,
                    minHeight: '200px',
                    resize: 'vertical',
                    padding: '12px'
                  }}
                  value={lyrics}
                  onChange={(e) => setLyrics(e.target.value)}
                  placeholder="Your generated lyrics will appear here..."
                  autoFocus
                />
              </div>
            )}
          </div>
          <div className="modal-footer border-0 d-flex justify-content-between" style={{ background: 'transparent' }}>
{/*             <div>
              <button type="button" className="btn-normal grey-bg me-2" onClick={handleClose} disabled={loading} style={{ minWidth: 90 }}>Cancel</button>
            </div> */}
            <div className="d-flex gap-2">
              {lyrics && (
                <>
                  <button
                    type="button"
                    className="btn-normal grey-bg d-flex align-items-center justify-content-center"
                    onClick={handleGenerate}
                    disabled={loading || !prompt.trim()}
                    style={{ minWidth: 120, opacity: loading || !prompt.trim() ? 0.6 : 1 }}
                  >
                    {loading && (
                      <span className="spinner-border spinner-border-sm me-2" style={{ color: '#fff', width: '1rem', height: '1rem' }} role="status">
                        <span className="visually-hidden">Loading...</span>
                      </span>
                    )}
                    {loading ? 'Generating...' : 'Regenerate'}
                  </button>
                  <button type="button" className="btn-gradient" onClick={handleApply} disabled={!lyrics.trim()} style={{ minWidth: 120 }}>Apply Lyrics</button>
                </>
              )}
              {!lyrics && (
                <button
                  type="button"
                  className="btn-gradient d-flex align-items-center justify-content-center"
                  onClick={handleGenerate}
                  disabled={loading || !prompt.trim()}
                  style={{ minWidth: 150, opacity: loading || !prompt.trim() ? 0.6 : 1, gap: 8 }}
                >
                  {loading && (
                    <span className="spinner-border spinner-border-sm me-2" style={{ color: '#fff', width: '1.2rem', height: '1.2rem' }} role="status">
                      <span className="visually-hidden">Loading...</span>
                    </span>
                  )}
                  {loading ? 'Generating...' : 'Generate Lyrics'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

LyricsModal.propTypes = {
  show: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onApply: PropTypes.func.isRequired,
  theme: PropTypes.string,
};

export default LyricsModal;
