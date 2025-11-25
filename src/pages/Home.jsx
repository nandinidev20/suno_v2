import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { tracksAPI } from '../utils/api';
import SubscriptionPlans from '../components/SubscriptionPlans';
import { stripeAPI } from '../utils/api';
import toast from 'react-hot-toast';
import FooterPlayer from '../components/FooterPlayer';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [fetching, setFetching] = useState(false);
  const { isAuthenticated, logout } = useAuth();
  const [plans, setPlans] = useState([]);
  const [subscription, setSubscription] = useState(null);
  const [loadingPlan, setLoadingPlan] = useState(null);
  // audio player state (footer player + slide controls)
  const [currentTrack, setCurrentTrack] = useState(null);
  const [showFooterPlayer, setShowFooterPlayer] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioTime, setAudioTime] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);
  const audioRef = useRef(null);
   const navigate = useNavigate();

  useEffect(() => {
    if (!fetching) {
      fetchTracks();
    }
    fetchPlansAndSubscription();
  }, [currentPage, isAuthenticated]);

  const fetchPlansAndSubscription = async () => {
    try {
      // Fetch plans (public) regardless of auth state
      const plansRes = await stripeAPI.getPlans();
      if (plansRes?.data?.success) setPlans(plansRes.data.plans);
    } catch (e) {
      console.warn('Failed to fetch plans:', e?.response?.data || e.message || e);
    }

    // Fetch subscription only if user is authenticated
    try {
      if (isAuthenticated) {
        const subRes = await stripeAPI.getSubscriptionStatus();
        if (subRes?.data?.success) setSubscription(subRes.data.subscription);
      } else {
        setSubscription(null);
      }
    } catch (e) {
      console.warn('Failed to fetch subscription status:', e?.response?.data || e.message || e);
    }
  };
  const handleUpgrade = async (planType) => {
    if(!isAuthenticated) {
      navigate('/login');
      return false;
    } 
    setLoadingPlan(planType);
    try {
      const res = await stripeAPI.upgradePlan(planType);
      if (res.data.success && res.data.url) {
        window.location.href = res.data.url;
      } else {
        toast.error(res.data.message || "Failed to upgrade plan");
      }
    } catch (e) {
      toast.error(e.response?.data?.message || "Failed to upgrade plan");
    } finally {
      setLoadingPlan(null);
    }
  };

  const fetchTracks = async () => {
    if (fetching) return;
    
    setFetching(true);
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
      if (error.response?.status !== 429) {
        toast.error('Failed to load tracks');
      }
    } finally {
      setLoading(false);
      setFetching(false);
    }
  };

  const handleLike = (trackId, newLikeCount) => {
    setTracks(prev =>
      prev.map(track =>
        track._id === trackId
          ? { ...track, likes: Array(newLikeCount).fill(null) }
          : track
      )
    );
  };

  const loadMore = () => {
    if (!loading && hasMore) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const formatDuration = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const formatTime = (sec) => {
    if (!sec && sec !== 0) return '00:00';
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Audio player helpers (mirroring Generate.jsx behavior)
  const getTrackAudioPath = (track) => {
    return (
      track.conversion_path_1 ||
      track.conversion_path_wav_1 ||
      track.audioUrl ||
      track.audioUrlWav ||
      track._audioPath ||
      ''
    );
  };

  const handlePlayPause = (track) => {
    // always ensure the footer player is shown when user clicks play
    setShowFooterPlayer(true);
    const audioPath = getTrackAudioPath(track);
    const trackWithAudio = {
      ...track,
      _audioPath: audioPath,
      album_cover_path: track.albumCover || track.album_cover_path || '/img/video-bg.jpg',
      prompt: track.prompt || track.title || ''
    };
    if (!currentTrack || (currentTrack._audioPath !== audioPath)) {
      setCurrentTrack(trackWithAudio);
      setAudioTime(0);
      setAudioDuration(0);
      setIsPlaying(false);
      setTimeout(() => setIsPlaying(true), 50);
    } else {
      setIsPlaying(prev => !prev);
    }
  };

  useEffect(() => {
    if (!audioRef.current) return;
    if (isPlaying) {
      if (audioRef.current.src !== (currentTrack ? (currentTrack._audioPath || getTrackAudioPath(currentTrack)) : '')) {
        audioRef.current.src = currentTrack ? (currentTrack._audioPath || getTrackAudioPath(currentTrack)) : '';
      }
      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch((e) => { setIsPlaying(false); });
      }
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying, currentTrack]);

  useEffect(() => {
    if (!audioRef.current) return;
    const audio = audioRef.current;
    const onTimeUpdate = () => setAudioTime(audio.currentTime || 0);
    const onLoadedMetadata = () => setAudioDuration(audio.duration || 0);
    const onEnded = () => setIsPlaying(false);
    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('loadedmetadata', onLoadedMetadata);
    audio.addEventListener('ended', onEnded);
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

  useEffect(() => {
    // Initialize or update Swiper instance when tracks change
    try {
      // If Swiper is available globally (included in public assets)
      if (window && window.Swiper) {
        if (!window.__homeSwiper) {
          window.__homeSwiper = new window.Swiper('.mySwiper', {
            spaceBetween: 20,
            freeMode: true,
            pagination: {
              el: '.swiper-pagination',
              clickable: true,
            },
            breakpoints: {
              320: { slidesPerView: 1, spaceBetween: 10 },
              576: { slidesPerView: 1, spaceBetween: 15 },
              768: { slidesPerView: 3, spaceBetween: 20 },
              1024: { slidesPerView: 4, spaceBetween: 20 },
            }
          });
        } else {
          // refresh/update
          setTimeout(() => { try { window.__homeSwiper.update(); } catch(e){} }, 50);
        }
      }
    } catch (e) { console.warn('Swiper init/update error', e); }
  }, [tracks]);

    return (
      <div>
        {/* Hero Section */}
        <header className="hero landing-page">
           <video
            autoPlay
            loop
            muted
            playsInline
            className="background-video"
          >
            <source src="/img/hero_video.mp4" type="video/mp4" />
          </video>
          <div className="container">
            <div className="nav">
              <a href='/'><h1 className="logo"><img src="/img/logo.png" alt="SONGSTORY" /></h1></a>
              <div className="nav-buttons">
                {!isAuthenticated ? (
                  <>
                    <Link to="/login" className="btn-fill btn-sign">Sign In</Link>
                    <Link to="/register" className="btn-outline btn-sign">Sign Up</Link>
                  </>
                ) : (
                  <>
                   <Link to="/profile" className="btn-fill btn-sign">My Profile</Link>
                   <Link to="#" onClick={(e) => { e.preventDefault(); logout(); }}  className="btn-fill btn-sign">Logout</Link>
                  </>
                )}
              </div>
            </div>
            <div className="hero-content">
              <h2>Where AI Starts Music and Humans Finish</h2>
              <p>Just describe in the prompt area below to generate your <br /> next hit for YouTube, Spotify, event... etc.</p>
              <Link to="/generate" className="btn-gradient">Try It Out Now! Generate Audio</Link>
            </div>
          </div>
        </header>

{/* How it works */}
        <section className="work-section section-padding">
          <div className="container">
            <h1 className="section-title">How it works</h1>
            <div className="cards" role="list">
              <article className="card" role="listitem" aria-label="Step 1: Upload to AI recompose">
                <div className="icon-wrapper">
                  <img src="/img/new-iconmonstr-microphone-15.svg" alt="Microphone" style={{width: '64px', height: '64px', filter: 'brightness(0) invert(1)'}} />
                  <div className="dots">
                    <span className="dot"></span>
                    <span className="dot"></span>
                    <span className="dot"></span>
                  </div>
                </div>
                <div className="circle">1</div>
                <div className="card-body">
                  <h3 className="card-title">Upload to AI recompose</h3>
                  <p className="card-sub">Upload a reference audio loop, and transform to instrument</p>
                </div>
              </article>

              <article className="card" role="listitem" aria-label="Step 2: One-Shot Mode">
                <div className="icon-wrapper">
                  <img src="/img/new-iconmonstr-sound-wave-1.svg" alt="Waveform" style={{width: '64px', height: '64px', filter: 'brightness(0) invert(1)'}} />
                </div>
                <div className="circle">2</div>
                <div className="card-body">
                  <h3 className="card-title">One-Shot Mode</h3>
                  <p className="card-sub">Generate one shot samples, from 808 kick to Ambient sound effects</p>
                </div>
              </article>

              <article className="card" role="listitem" aria-label="Step 3: Export As MIDI">
                <div className="icon-wrapper">
                  <img src="/img/new-icon_midi.svg" alt="MIDI" style={{width: '64px', height: '64px', filter: 'brightness(0) invert(1)'}} />
                </div>
                <div className="circle">3</div>
                <div className="card-body">
                  <h3 className="card-title">Export As MIDI</h3>
                  <p className="card-sub">Export your AI generations as MIDI</p>
                </div>
              </article>
            </div>
          </div>
        </section>

        {/* Music section */}
        <section className="music-section section-padding">
          <div className="container">
            <div className="bubble-box">
              <div className="bubble">
                For Music Creators, Wedding Filmmakers, <br />
                Youtube Influencers, Podcasters
              </div>
            </div>
            <h2>Studio-Grade Sound, Made Simple</h2>
            <p>From a spark of an idea to a full track—whether it's a tune, some lyrics, or just a mood—OpenBeat turns your
              creativity into polished music anyone can make.</p>
            <div className="swiper mySwiper">
              <div className="swiper-wrapper">
                {tracks.slice(0, 8).map((track, index) => (
                  <div key={track._id || index} className="swiper-slide">
                    <div className="track">
                      <div className="track-image">
                        <img src={track.albumCover || "/img/video-bg.jpg"} alt="Album Art" />
                        {/* Overlay play button and duration similar to Latest in Generate.jsx */}
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
                            <i className={`bi ${
                              currentTrack &&
                              isPlaying &&
                              (currentTrack._audioPath
                                ? currentTrack._audioPath === getTrackAudioPath(track)
                                : currentTrack.id === track.id)
                                ? 'bi-pause-fill'
                                : 'bi-play-fill'
                            }`} style={{fontSize: 22, color: '#fff'}}></i>
                          </button>
                          <span
                            style={{
                              marginLeft: 8,
                              color: '#fff',
                              fontSize:'14px',
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
                      {/* <div className="track-stats">
                        <span><i className="fa fa-thumbs-up" aria-hidden="true"></i> {track.likes?.length || 385}</span>
                        <span><i className="fa fa-play" aria-hidden="true"></i> 11.5k</span>
                      </div> */}
                      <div className="track-footer">
                        <img src={track.albumCover || "/img/video-bg.jpg"} alt="Album Art" />
                        <div className="meta">
                          <h4>{track.prompt ? (track.prompt.charAt(0).toUpperCase() + (track.prompt.length > 40 ? track.prompt.slice(1, 40) + '...' : track.prompt.slice(1))) : ''}</h4>
                          <p>{track.style.charAt(0).toUpperCase() + track.style.slice(1, 40)}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

              </div>
              <div className="swiper-pagination"></div>
            </div>
          </div>
        </section>

        {/* All You Need Section */}
        <section className="work-section section-padding">
          <div className="container">
            <h2 className="work-title">All You Need to Create <span>Music, Your Way</span></h2>
             <div className="outer-box">
              
              <img src='/img/image.png' alt="All You Need" style={{width: '100%', height: '100%', objectFit: 'cover'}}/>

              {/*<div className="box">
                <h3>Generate Free Songs</h3>
                <p>Transform everyday moments into music—whether it's your ride home or a shared joke. Always free, no
                  subscription required.</p>
                <Link to="/register" className="btn-gradient">Prompt Generator</Link>
              </div>

              <div className="box">
                <h3>Endless Free Listening</h3>
                <p>See what happens when music is open to everyone. Dive into millions of tracks—remixes, stories, and pure
                  feeling.</p>
                <Link to="/register" className="btn-gradient">Check Out The User Library</Link>
              </div>

              <div className="box">
                <h3>Bring Your Music</h3>
                <p>Create what moves you, then share it with those who'll connect. From close friends to millions of
                  listeners.</p>
                <Link to="/register" className="btn-gradient">Share With Everybody</Link>
              </div>
              */}

            </div> 

          </div>
        </section>

        {/* Moment Section */}
        <section className="moment-section section-padding">
          <div className="container">
            <div class="video-container">
                <iframe width="560" height="315" src="https://www.youtube.com/embed/CSSHUHGZtHA?si=XAJ8jt8UhdVIs3rX" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
            </div>
           
            {/* <h2>Turn a moment into a song</h2>
            <p>Try it for free now, Just describe the way your song should sound</p>
            <div className="form-outerbox">
              <div className="form-box">
                <label htmlFor="prompt">Prompt</label>
                <textarea id="prompt" placeholder="Describe your song"></textarea>
                <div className="ins-div">
                  <div className="form-check form-switch checkdiv">
                    <input className="form-check-input" type="checkbox" id="Instrumentallyric" defaultChecked />
                    <label className="form-check-label" htmlFor="Instrumentallyric">Instrumental Only?</label>
                  </div>
                  <div className="ins-box">
                    <button className="ins-btn">Audio</button>
                    <button className="ins-btn">Lyrics</button>
                  </div>
                </div>

                <div className="tags">
                  <div className="tag">inspirational</div>
                  <div className="tag">pop</div>
                  <div className="tag">male</div>
                  <div className="tag">tag</div>
                  <div className="tag">tag</div>
                  <div className="tag">tag</div>
                  <div className="tag">tag</div>
                  <div className="tag">tag</div>
                  <div className="tag">tag</div>
                  <div className="tag">tag</div>
                  <div className="tag">tag</div>
                  <div className="tag">tag</div>
                  <div className="tag">tag</div>
                </div>
                
              </div>
              <div className="btn-row">
                <Link to="/generate" className="btn-gradient">Generate Audio</Link>
              </div>
            </div> */}
          </div>
        </section>

        {/* Price Section */}
        <SubscriptionPlans
          currentPlanId={subscription?.plan?.id}
          onUpgrade={handleUpgrade}
          loadingPlan={loadingPlan}
          plans={plans}
          isAuthenticated={isAuthenticated}
        />
        
        {/* Spark Section */}
        <section className="spark-section section-padding">
          <div className="container">
            <div className="spark-div">
              <h1>Discover and feel the spark</h1>
              <p>Enter a space where sound is always within reach and fellow creators stand beside you.</p>
              <Link to="/register" className="btn-gradient">Sign Up Now</Link>
            </div>
          </div>
        </section>

        <footer>
          <div className="footer-text" style={{float:'left'}}>
            © 2025 Inc
          </div>
          <div className="footer-text" style={{float:'right', marginBottom:'20px', display:'flex', gap:'12px', alignItems:'center'}}>
            <a 
              href="mailto:openbeatai@gmail.com?subject=Contact%20Us"
              className="btn-gradient"
              style={{textDecoration:'none'}}
            >
              Contact Us
            </a>
            <Link 
              to="/tutorials" 
              className="btn-gradient" 
              style={{textDecoration:'none'}}
            >
              Tutorials
            </Link>
            <Link 
              to="/meet-myguymars" 
              className="btn-gradient" 
              style={{textDecoration:'none'}}
            >
              Meet MyGuyMars
            </Link>
            <Link 
              to="/terms" 
              className="btn-gradient" 
              style={{textDecoration:'none'}}
            >
              Terms &amp; Conditions
            </Link>
          </div>
        </footer>
        {/* Footer audio player */}
        <audio ref={audioRef} style={{display:'none'}} />
        {showFooterPlayer && currentTrack && (
          <div style={{position:'fixed', left:0, right:0, bottom:3, zIndex:1000, padding:0, margin:0}}>
            <FooterPlayer
              track={{
                ...currentTrack,
                album_cover_path: currentTrack.album_cover_path || currentTrack.albumCover || '/img/video-bg.jpg'
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
                    background:'none',
                    border:'none',
                    color:'#fff',
                    fontSize:22,
                    marginLeft:16,
                    cursor:'pointer',
                    display:'flex',
                    alignItems:'center',
                    justifyContent:'center',
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
      </div>
    );

};

export default Home;