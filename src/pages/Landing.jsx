import React from "react";
import LeftSideBar from "../components/LeftSideBar";

const Landing = () => {
  return (
    <section className="discover-section position-relative">
      <div className="container-fluid">
        <div className="discover-div">
          {/* Sidebar */}
           <LeftSideBar/>
          {/* Main Content */}
          <div className="main">
            {/* Slider Section */}
            <div className="slider-section">
              <div id="musicCarousel" className="carousel slide" data-bs-ride="carousel">
                <div className="carousel-inner">
                  <div className="carousel-item active">
                    <img src="img/slide-1.jpg" className="d-block w-100" alt="slide1" />
                    <div className="carousel-caption text-start">
                      <h1>Generate Any Type Of Music</h1>
                      <p>Make music from any moment, jokes, celebrations, holidays. Mkae your next moment special.</p>
                      <button className="btn-slider">Create Now</button>
                    </div>
                  </div>

                  <div className="carousel-item">
                    <img src="img/slide-2.jpg" className="d-block w-100" alt="slide2" />
                    <div className="carousel-caption text-start">
                      <h1>Discover New Genres</h1>
                      <p>Explore unlimited variations of music and genres with AI-powered creativity.</p>
                      <button className="btn-slider">Explore Now</button>
                    </div>
                  </div>

                  <div className="carousel-item">
                    <img src="img/slide-3.jpg" className="d-block w-100" alt="slide3" />
                    <div className="carousel-caption text-start">
                      <h1>Discover New Genres</h1>
                      <p>Explore unlimited variations of music and genres with AI-powered creativity.</p>
                      <button className="btn-slider">Explore Now</button>
                    </div>
                  </div>
                </div>

                <button className="carousel-control-prev" type="button" data-bs-target="#musicCarousel" data-bs-slide="prev">
                  <span className="carousel-control-prev-icon"></span>
                </button>
                <button className="carousel-control-next" type="button" data-bs-target="#musicCarousel" data-bs-slide="next">
                  <span className="carousel-control-next-icon"></span>
                </button>
              </div>
            </div>

            {/* Tracker Section */}
            <div className="traker-box">
              <div className="row">
                {/* Example column */}
                <div className="col-xl-4 col-md-6 col-sm-6 col-xs-12">
                  <h4>For Your &gt;</h4>
                  {/* Example music item */}
                  <div className="music-item">
                    <div className="music-info">
                      <img src="img/ban-bg.jpg" alt="" />
                      <div className="meta">
                        <h4>Bass Inferno</h4>
                        <p>Tags, tags, go, here, music, style, tags</p>
                        <p>
                          <span><i className="fa fa-circle green" aria-hidden="true"></i> StudiolinkedSuperLongName</span>
                        </p>
                        <p className="follow-list">
                          <a href="#"><i className="bi bi-play-fill"></i> 19k</a>
                          <a href="#"><i className="bi bi-chat"></i> 980</a>
                          <a href="#"><i className="bi bi-hand-thumbs-up"></i> 220</a>
                        </p>
                      </div>
                    </div>
                  </div>
                  {/* ...repeat as needed */}
                </div>
              </div>
            </div>

            {/* Featured Section (shortened) */}
            <section className="featured-section">
              <h4 className="sub-title">Featured</h4>
              <div className="row g-3">
                <div className="col-md-4 col-sm-6 col-xs-12">
                  <div className="featured-card">
                    <div className="featured-body">
                      <div className="feature-title">
                        <span className="play-icon"><i className="bi bi-play-fill"></i></span>
                        <span className="username"><span className="green"><i className="fa fa-circle pe-1 green" aria-hidden="true"></i></span> StudioLinkedSuperLongName</span>
                      </div>
                      <h5>Song Title Goes Here</h5>
                      <p>Dark, melodic track to keep tension on your latest youtube project</p>
                      <div className="stats">
                        <i className="bi bi-play-fill"></i> 8.0k &nbsp;
                        <i className="bi bi-hand-thumbs-up"></i> 11 &nbsp;
                        <i className="bi bi-chat"></i> 915
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-md-4 col-sm-6 col-xs-12">
                  <div className="featured-card">
                    <div className="featured-body">
                      <div className="feature-title">
                        <span className="play-icon"><i className="bi bi-play-fill"></i></span>
                        <span className="username"><span className="green"><i className="fa fa-circle pe-1 green" aria-hidden="true"></i></span> StudioLinkedSuperLongName</span>
                      </div>
                      <h5>Song Title Goes Here</h5>
                      <p>Dark, melodic track to keep tension on your latest youtube project</p>
                      <div className="stats">
                        <i className="bi bi-play-fill"></i> 8.0k &nbsp;
                        <i className="bi bi-hand-thumbs-up"></i> 11 &nbsp;
                        <i className="bi bi-chat"></i> 915
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-md-4 col-sm-6 col-xs-12">
                  <div className="featured-card">
                    <div className="featured-body">
                      <div className="feature-title">
                        <span className="play-icon"><i className="bi bi-play-fill"></i></span>
                        <span className="username"><span className="green"><i className="fa fa-circle pe-1 green" aria-hidden="true"></i></span> StudioLinkedSuperLongName</span>
                      </div>
                      <h5>Song Title Goes Here</h5>
                      <p>Dark, melodic track to keep tension on your latest youtube project</p>
                      <div className="stats">
                        <i className="bi bi-play-fill"></i> 8.0k &nbsp;
                        <i className="bi bi-hand-thumbs-up"></i> 11 &nbsp;
                        <i className="bi bi-chat"></i> 915
                      </div>
                    </div>
                  </div>
                </div>
                {/* repeat cards */}
              </div>
            </section>
          </div>
        </div>

        {/* Player Footer */}
        <div className="player player-footer">
          <img src="img/ban-bg.jpg" alt="cover" />
          <div className="player-info">
            <h4>Bass Inferno &nbsp;&nbsp; 00:04 / 01:52</h4>
            <div className="progress"><span></span></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Landing;
