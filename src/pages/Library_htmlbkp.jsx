import LeftSideBar from "../components/LeftSideBar";

const Library = () => {

  return (
    <>
      <section className="discover-section position-relative">
        <div className="container-fluid">
          <div className="discover-div">
            <LeftSideBar />
            <div className="main">
              <div className="library-container">
                <h1>Library</h1>
                <div className="library-head">
                  <div className="filter-search">
                    <button className="filter-btn btn-slider">
                      <i className="fas fa-filter"></i> Filter
                    </button>
                    <div className="search-box">
                      <i className="fas fa-search"></i>
                      <input type="text" placeholder="Search by song name, style or lyrics" />
                    </div>
                  </div>
                  <div className="upload-box">
                    <label htmlFor="file-upload" className="btn-slider">
                      <i className="fas fa-upload"></i> Upload File
                    </label>
                    <input id="file-upload" type="file" />
                  </div>
                </div>
              </div>
              <div className="library-list mt-3">
                <ul className="nav nav-tabs" id="myTab" role="tablist">
                  <li className="nav-item" role="presentation">
                    <button className="nav-link active" id="songs-tab" data-bs-toggle="tab" data-bs-target="#songs" type="button"
                      role="tab" aria-controls="songs" aria-selected="true">
                      Songs
                    </button>
                  </li>
                  {/* <li class="nav-item" role="presentation">
                <button class="nav-link" id="playlists-tab" data-bs-toggle="tab" data-bs-target="#playlists" type="button"
                  role="tab" aria-controls="playlists" aria-selected="false">
                Playlists
                </button>
              </li>
              <li class="nav-item" role="presentation">
                <button class="nav-link" id="linkedplaylists-tab" data-bs-toggle="tab" data-bs-target="#linkedplaylists" type="button"
                  role="tab" aria-controls="linkedplaylists" aria-selected="false">
               Linked Playlists
                </button>
              </li>
               <li class="nav-item" role="presentation">
                <button class="nav-link" id="following-tab" data-bs-toggle="tab" data-bs-target="#following" type="button"
                  role="tab" aria-controls="following" aria-selected="false">
              Following
                </button>
              </li>
               <li class="nav-item" role="presentation">
                <button class="nav-link" id="followers-tab" data-bs-toggle="tab" data-bs-target="#followers" type="button"
                  role="tab" aria-controls="followers" aria-selected="false">
             Followers
                </button>
              </li> */}
                </ul>

                {/* Tab panes */}
                <div class="tab-content">
                  <div class="tab-pane active" id="songs" role="tabpanel" aria-labelledby="songs-tab">
                    <div className="library-list">

                      <div className="song-item">
                        <div className="song-img">
                          <img src="img/bg.jpg" alt="Album Cover" className="album-cover" />
                          <span className="play-overlay"><i className="bi bi-play-fill"></i></span>
                        </div>
                        <div class="song-info">
                          <h3>Bass Inferno</h3>
                          <p>Tags: tags, go, here, music, style, tags, will, go, here, supertags, moretags</p>
                        </div>
                        <div class="actions icons">
                          <button class="follow-btn">Publish</button>
                          <a href="#"><i class="bi bi-chat-dots-fill"></i></a>
                          <a href="#"><i class="bi bi-hand-thumbs-up"></i></a>
                          <a href="#"><i class="bi bi-hand-thumbs-down"></i></a>

                          <div class="dropdown iconoption-div">
                            <a href="#" data-bs-toggle="dropdown" aria-expanded="false">
                              <i class="bi bi-three-dots-vertical"></i>
                            </a>
                            <ul class="dropdown-menu">
                              <li><a class="dropdown-item" href="#">Action 1</a></li>
                              <li><a class="dropdown-item" href="#">Action 2</a></li>
                              <li><a class="dropdown-item" href="#">Action 3</a></li>
                            </ul>
                          </div>

                        </div>
                      </div>

                      <div class="song-item">
                        <div className="song-img">
                          <img src="img/bg.jpg" alt="Album Cover" className="album-cover" />
                          <span className="play-overlay"><i className="bi bi-play-fill"></i></span>
                        </div>
                        <div class="song-info">
                          <h3>Bass Inferno</h3>
                          <p>Tags: tags, go, here, music, style, tags, will, go, here, supertags, moretags</p>
                        </div>
                        <div class="actions icons">
                          <button class="follow-btn">Publish</button>
                          <a href="#"><i class="bi bi-chat-dots-fill"></i></a>
                          <a href="#"><i class="bi bi-hand-thumbs-up"></i></a>
                          <a href="#"><i class="bi bi-hand-thumbs-down"></i></a>

                          <div class="dropdown">
                            <a href="#" data-bs-toggle="dropdown" aria-expanded="false">
                              <i class="bi bi-three-dots-vertical"></i>
                            </a>
                            <ul class="dropdown-menu">
                              <li><a class="dropdown-item" href="#">Action 1</a></li>
                              <li><a class="dropdown-item" href="#">Action 2</a></li>
                              <li><a class="dropdown-item" href="#">Action 3</a></li>
                            </ul>
                          </div>

                        </div>
                      </div>

                      <div class="song-item">
                        <div className="song-img">
                          <img src="img/bg.jpg" alt="Album Cover" className="album-cover" />
                          <span className="play-overlay"><i className="bi bi-play-fill"></i></span>
                        </div>
                        <div class="song-info">
                          <h3>Bass Inferno</h3>
                          <p>Tags: tags, go, here, music, style, tags, will, go, here, supertags, moretags</p>
                        </div>
                        <div class="actions icons">
                          <button class="follow-btn">Publish</button>
                          <a href="#"><i class="bi bi-chat-dots-fill"></i></a>
                          <a href="#"><i class="bi bi-hand-thumbs-up"></i></a>
                          <a href="#"><i class="bi bi-hand-thumbs-down"></i></a>

                          <div class="dropdown iconoption-div">
                            <a href="#" data-bs-toggle="dropdown" aria-expanded="false">
                              <i class="bi bi-three-dots-vertical"></i>
                            </a>
                            <ul class="dropdown-menu">
                              <li><a class="dropdown-item" href="#">Action 1</a></li>
                              <li><a class="dropdown-item" href="#">Action 2</a></li>
                              <li><a class="dropdown-item" href="#">Action 3</a></li>
                            </ul>
                          </div>

                        </div>
                      </div>

                      {/* <div class="song-item">
                        <div className="song-img">
                          <img src="img/bg.jpg" alt="Album Cover" className="album-cover" />
                          <span className="play-overlay"><i className="bi bi-play-fill"></i></span>
                        </div>
                        <div class="song-info">
                          <h3>Bass Inferno</h3>
                          <p>Tags: tags, go, here, music, style, tags, will, go, here, supertags, moretags</p>
                        </div>
                        <div class="actions icons">
                          <button class="follow-btn">Publish</button>
                          <a href="#"><i class="bi bi-chat-dots-fill"></i></a>
                          <a href="#"><i class="bi bi-hand-thumbs-up"></i></a>
                          <a href="#"><i class="bi bi-hand-thumbs-down"></i></a>

                          <div class="dropdown">
                            <a href="#" data-bs-toggle="dropdown" aria-expanded="false">
                              <i class="bi bi-three-dots-vertical"></i>
                            </a>
                            <ul class="dropdown-menu">
                              <li><a class="dropdown-item" href="#">Action 1</a></li>
                              <li><a class="dropdown-item" href="#">Action 2</a></li>
                              <li><a class="dropdown-item" href="#">Action 3</a></li>
                            </ul>
                          </div>

                        </div>
                      </div>

                      <div class="song-item">
                        <div className="song-img">
                          <img src="img/bg.jpg" alt="Album Cover" className="album-cover" />
                          <span className="play-overlay"><i className="bi bi-play-fill"></i></span>
                        </div>
                        <div class="song-info">
                          <h3>Bass Inferno</h3>
                          <p>Tags: tags, go, here, music, style, tags, will, go, here, supertags, moretags</p>
                        </div>
                        <div class="actions icons">
                          <button class="follow-btn">Publish</button>
                          <a href="#"><i class="bi bi-chat-dots-fill"></i></a>
                          <a href="#"><i class="bi bi-hand-thumbs-up"></i></a>
                          <a href="#"><i class="bi bi-hand-thumbs-down"></i></a>

                          <div class="dropdown iconoption-div">
                            <a href="#" data-bs-toggle="dropdown" aria-expanded="false">
                              <i class="bi bi-three-dots-vertical"></i>
                            </a>
                            <ul class="dropdown-menu">
                              <li><a class="dropdown-item" href="#">Action 1</a></li>
                              <li><a class="dropdown-item" href="#">Action 2</a></li>
                              <li><a class="dropdown-item" href="#">Action 3</a></li>
                            </ul>
                          </div>

                        </div>
                      </div>

                      <div class="song-item">
                        <div class="song-img">
                          <img src="img/bg.jpg" alt="Album Cover" className="album-cover" />
                          <span class="play-overlay"><i class="bi bi-play-fill"></i></span>
                        </div>
                        <div class="song-info">
                          <h3>Bass Inferno</h3>
                          <p>Tags: tags, go, here, music, style, tags, will, go, here, supertags, moretags</p>
                        </div>
                        <div class="actions icons">
                          <button class="follow-btn">Publish</button>
                          <a href="#"><i class="bi bi-chat-dots-fill"></i></a>
                          <a href="#"><i class="bi bi-hand-thumbs-up"></i></a>
                          <a href="#"><i class="bi bi-hand-thumbs-down"></i></a>

                          <div class="dropdown">
                            <a href="#" data-bs-toggle="dropdown" aria-expanded="false">
                              <i class="bi bi-three-dots-vertical"></i>
                            </a>
                            <ul class="dropdown-menu">
                              <li><a class="dropdown-item" href="#">Action 1</a></li>
                              <li><a class="dropdown-item" href="#">Action 2</a></li>
                              <li><a class="dropdown-item" href="#">Action 3</a></li>
                            </ul>
                          </div>

                        </div>
                      </div>

                      <div class="song-item">
                        <div class="song-img">
                          <img src="img/bg.jpg" alt="Album Cover" class="album-cover" />
                          <span class="play-overlay"><i class="bi bi-play-fill"></i></span>
                        </div>
                        <div class="song-info">
                          <h3>Bass Inferno</h3>
                          <p>Tags: tags, go, here, music, style, tags, will, go, here, supertags, moretags</p>
                        </div>
                        <div class="actions icons">
                          <button class="follow-btn">Publish</button>
                          <a href="#"><i class="bi bi-chat-dots-fill"></i></a>
                          <a href="#"><i class="bi bi-hand-thumbs-up"></i></a>
                          <a href="#"><i class="bi bi-hand-thumbs-down"></i></a>

                          <div class="dropdown iconoption-div">
                            <a href="#" data-bs-toggle="dropdown" aria-expanded="false">
                              <i class="bi bi-three-dots-vertical"></i>
                            </a>
                            <ul class="dropdown-menu">
                              <li><a class="dropdown-item" href="#">Action 1</a></li>
                              <li><a class="dropdown-item" href="#">Action 2</a></li>
                              <li><a class="dropdown-item" href="#">Action 3</a></li>
                            </ul>
                          </div>

                        </div>
                      </div>

                      <div class="song-item">
                        <div class="song-img">
                          <img src="img/bg.jpg" alt="Album Cover" class="album-cover" />
                          <span class="play-overlay"><i class="bi bi-play-fill"></i></span>
                        </div>
                        <div class="song-info">
                          <h3>Bass Inferno</h3>
                          <p>Tags: tags, go, here, music, style, tags, will, go, here, supertags, moretags</p>
                        </div>
                        <div class="actions icons">
                          <button class="follow-btn">Publish</button>
                          <a href="#"><i class="bi bi-chat-dots-fill"></i></a>
                          <a href="#"><i class="bi bi-hand-thumbs-up"></i></a>
                          <a href="#"><i class="bi bi-hand-thumbs-down"></i></a>

                          <div class="dropdown">
                            <a href="#" data-bs-toggle="dropdown" aria-expanded="false">
                              <i class="bi bi-three-dots-vertical"></i>
                            </a>
                            <ul class="dropdown-menu">
                              <li><a class="dropdown-item" href="#">Action 1</a></li>
                              <li><a class="dropdown-item" href="#">Action 2</a></li>
                              <li><a class="dropdown-item" href="#">Action 3</a></li>
                            </ul>
                          </div>

                        </div>
                      </div>

                      <div class="song-item">
                        <div class="song-img">
                          <img src="img/bg.jpg" alt="Album Cover" class="album-cover" />
                          <span class="play-overlay"><i class="bi bi-play-fill"></i></span>
                        </div>
                        <div class="song-info">
                          <h3>Bass Inferno</h3>
                          <p>Tags: tags, go, here, music, style, tags, will, go, here, supertags, moretags</p>
                        </div>
                        <div class="actions icons">
                          <button class="follow-btn">Publish</button>
                          <a href="#"><i class="bi bi-chat-dots-fill"></i></a>
                          <a href="#"><i class="bi bi-hand-thumbs-up"></i></a>
                          <a href="#"><i class="bi bi-hand-thumbs-down"></i></a>

                          <div class="dropdown iconoption-div">
                            <a href="#" data-bs-toggle="dropdown" aria-expanded="false">
                              <i class="bi bi-three-dots-vertical"></i>
                            </a>
                            <ul class="dropdown-menu">
                              <li><a class="dropdown-item" href="#">Action 1</a></li>
                              <li><a class="dropdown-item" href="#">Action 2</a></li>
                              <li><a class="dropdown-item" href="#">Action 3</a></li>
                            </ul>
                          </div>

                        </div>
                      </div>

                      <div class="song-item">
                        <div class="song-img">
                          <img src="img/bg.jpg" alt="Album Cover" class="album-cover" />
                          <span class="play-overlay"><i class="bi bi-play-fill"></i></span>
                        </div>
                        <div class="song-info">
                          <h3>Bass Inferno</h3>
                          <p>Tags: tags, go, here, music, style, tags, will, go, here, supertags, moretags</p>
                        </div>
                        <div class="actions icons">
                          <button class="follow-btn">Publish</button>
                          <a href="#"><i class="bi bi-chat-dots-fill"></i></a>
                          <a href="#"><i class="bi bi-hand-thumbs-up"></i></a>
                          <a href="#"><i class="bi bi-hand-thumbs-down"></i></a>

                          <div class="dropdown">
                            <a href="#" data-bs-toggle="dropdown" aria-expanded="false">
                              <i class="bi bi-three-dots-vertical"></i>
                            </a>
                            <ul class="dropdown-menu">
                              <li><a class="dropdown-item" href="#">Action 1</a></li>
                              <li><a class="dropdown-item" href="#">Action 2</a></li>
                              <li><a class="dropdown-item" href="#">Action 3</a></li>
                            </ul>
                          </div>

                        </div>
                      </div> */}

                    </div>
                    <div class="pagination-div">
                      <nav aria-label="Page navigation example">
                        <ul class="pagination">
                          <li class="page-item">
                            <a class="page-link" href="#" aria-label="Previous">
                              <span aria-hidden="true">&lt;</span>
                            </a>
                          </li>
                          <li class="page-item"><a class="page-link" href="#">1</a></li>
                          <li class="page-item"><a class="page-link" href="#">2</a></li>
                          <li class="page-item active">
                            <a class="page-link" href="#">3 <span class="sr-only">(current)</span></a>
                          </li>
                          <li class="page-item"><a class="page-link" href="#">4</a></li>
                          <li class="page-item"><a class="page-link" href="#">5</a></li>
                          <li class="page-item"><a class="page-link" href="#">6</a></li>
                          <li class="page-item">
                            <a class="page-link" href="#" aria-label="Next">
                              <span aria-hidden="true">&gt;</span>
                            </a>
                          </li>
                        </ul>
                      </nav>
                    </div>
                  </div>
                  <div class="tab-pane" id="playlists" role="tabpanel" aria-labelledby="playlists-tab">
                    <div class="library-list">

                      <div class="song-item">
                        <div class="song-img">
                          <img src="img/bg.jpg" alt="Album Cover" class="album-cover" />
                          <span class="play-overlay"><i class="bi bi-play-fill"></i></span>
                        </div>
                        <div class="song-info">
                          <h3>Bass Inferno</h3>
                          <p>Tags: tags, go, here, music, style, tags, will, go, here, supertags, moretags</p>
                        </div>
                        <div class="actions icons">
                          <button class="follow-btn">Publish</button>
                          <a href="#"><i class="bi bi-chat-dots-fill"></i></a>
                          <a href="#"><i class="bi bi-hand-thumbs-up"></i></a>
                          <a href="#"><i class="bi bi-hand-thumbs-down"></i></a>

                          <div class="dropdown iconoption-div">
                            <a href="#" data-bs-toggle="dropdown" aria-expanded="false">
                              <i class="bi bi-three-dots-vertical"></i>
                            </a>
                            <ul class="dropdown-menu">
                              <li><a class="dropdown-item" href="#">Action 1</a></li>
                              <li><a class="dropdown-item" href="#">Action 2</a></li>
                              <li><a class="dropdown-item" href="#">Action 3</a></li>
                            </ul>
                          </div>

                        </div>
                      </div>

                      <div class="song-item">
                        <div class="song-img">
                          <img src="img/bg.jpg" alt="Album Cover" class="album-cover" />
                          <span class="play-overlay"><i class="bi bi-play-fill"></i></span>
                        </div>
                        <div class="song-info">
                          <h3>Bass Inferno</h3>
                          <p>Tags: tags, go, here, music, style, tags, will, go, here, supertags, moretags</p>
                        </div>
                        <div class="actions icons">
                          <button class="follow-btn">Publish</button>
                          <a href="#"><i class="bi bi-chat-dots-fill"></i></a>
                          <a href="#"><i class="bi bi-hand-thumbs-up"></i></a>
                          <a href="#"><i class="bi bi-hand-thumbs-down"></i></a>

                          <div class="dropdown">
                            <a href="#" data-bs-toggle="dropdown" aria-expanded="false">
                              <i class="bi bi-three-dots-vertical"></i>
                            </a>
                            <ul class="dropdown-menu">
                              <li><a class="dropdown-item" href="#">Action 1</a></li>
                              <li><a class="dropdown-item" href="#">Action 2</a></li>
                              <li><a class="dropdown-item" href="#">Action 3</a></li>
                            </ul>
                          </div>

                        </div>
                      </div>

                      <div class="song-item">
                        <div class="song-img">
                          <img src="img/bg.jpg" alt="Album Cover" class="album-cover" />
                          <span class="play-overlay"><i class="bi bi-play-fill"></i></span>
                        </div>
                        <div class="song-info">
                          <h3>Bass Inferno</h3>
                          <p>Tags: tags, go, here, music, style, tags, will, go, here, supertags, moretags</p>
                        </div>
                        <div class="actions icons">
                          <button class="follow-btn">Publish</button>
                          <a href="#"><i class="bi bi-chat-dots-fill"></i></a>
                          <a href="#"><i class="bi bi-hand-thumbs-up"></i></a>
                          <a href="#"><i class="bi bi-hand-thumbs-down"></i></a>

                          <div class="dropdown iconoption-div">
                            <a href="#" data-bs-toggle="dropdown" aria-expanded="false">
                              <i class="bi bi-three-dots-vertical"></i>
                            </a>
                            <ul class="dropdown-menu">
                              <li><a class="dropdown-item" href="#">Action 1</a></li>
                              <li><a class="dropdown-item" href="#">Action 2</a></li>
                              <li><a class="dropdown-item" href="#">Action 3</a></li>
                            </ul>
                          </div>

                        </div>
                      </div>

                      <div class="song-item">
                        <div class="song-img">
                          <img src="img/bg.jpg" alt="Album Cover" class="album-cover" />
                          <span class="play-overlay"><i class="bi bi-play-fill"></i></span>
                        </div>
                        <div class="song-info">
                          <h3>Bass Inferno</h3>
                          <p>Tags: tags, go, here, music, style, tags, will, go, here, supertags, moretags</p>
                        </div>
                        <div class="actions icons">
                          <button class="follow-btn">Publish</button>
                          <a href="#"><i class="bi bi-chat-dots-fill"></i></a>
                          <a href="#"><i class="bi bi-hand-thumbs-up"></i></a>
                          <a href="#"><i class="bi bi-hand-thumbs-down"></i></a>

                          <div class="dropdown">
                            <a href="#" data-bs-toggle="dropdown" aria-expanded="false">
                              <i class="bi bi-three-dots-vertical"></i>
                            </a>
                            <ul class="dropdown-menu">
                              <li><a class="dropdown-item" href="#">Action 1</a></li>
                              <li><a class="dropdown-item" href="#">Action 2</a></li>
                              <li><a class="dropdown-item" href="#">Action 3</a></li>
                            </ul>
                          </div>

                        </div>
                      </div>

                      <div class="song-item">
                        <div class="song-img">
                          <img src="img/bg.jpg" alt="Album Cover" class="album-cover" />
                          <span class="play-overlay"><i class="bi bi-play-fill"></i></span>
                        </div>
                        <div class="song-info">
                          <h3>Bass Inferno</h3>
                          <p>Tags: tags, go, here, music, style, tags, will, go, here, supertags, moretags</p>
                        </div>
                        <div class="actions icons">
                          <button class="follow-btn">Publish</button>
                          <a href="#"><i class="bi bi-chat-dots-fill"></i></a>
                          <a href="#"><i class="bi bi-hand-thumbs-up"></i></a>
                          <a href="#"><i class="bi bi-hand-thumbs-down"></i></a>

                          <div class="dropdown iconoption-div">
                            <a href="#" data-bs-toggle="dropdown" aria-expanded="false">
                              <i class="bi bi-three-dots-vertical"></i>
                            </a>
                            <ul class="dropdown-menu">
                              <li><a class="dropdown-item" href="#">Action 1</a></li>
                              <li><a class="dropdown-item" href="#">Action 2</a></li>
                              <li><a class="dropdown-item" href="#">Action 3</a></li>
                            </ul>
                          </div>

                        </div>
                      </div>

                      <div class="song-item">
                        <div class="song-img">
                          <img src="img/bg.jpg" alt="Album Cover" class="album-cover" />
                          <span class="play-overlay"><i class="bi bi-play-fill"></i></span>
                        </div>
                        <div class="song-info">
                          <h3>Bass Inferno</h3>
                          <p>Tags: tags, go, here, music, style, tags, will, go, here, supertags, moretags</p>
                        </div>
                        <div class="actions icons">
                          <button class="follow-btn">Publish</button>
                          <a href="#"><i class="bi bi-chat-dots-fill"></i></a>
                          <a href="#"><i class="bi bi-hand-thumbs-up"></i></a>
                          <a href="#"><i class="bi bi-hand-thumbs-down"></i></a>

                          <div class="dropdown">
                            <a href="#" data-bs-toggle="dropdown" aria-expanded="false">
                              <i class="bi bi-three-dots-vertical"></i>
                            </a>
                            <ul class="dropdown-menu">
                              <li><a class="dropdown-item" href="#">Action 1</a></li>
                              <li><a class="dropdown-item" href="#">Action 2</a></li>
                              <li><a class="dropdown-item" href="#">Action 3</a></li>
                            </ul>
                          </div>

                        </div>
                      </div>

                      <div class="song-item">
                        <div class="song-img">
                          <img src="img/bg.jpg" alt="Album Cover" class="album-cover" />
                          <span class="play-overlay"><i class="bi bi-play-fill"></i></span>
                        </div>
                        <div class="song-info">
                          <h3>Bass Inferno</h3>
                          <p>Tags: tags, go, here, music, style, tags, will, go, here, supertags, moretags</p>
                        </div>
                        <div class="actions icons">
                          <button class="follow-btn">Publish</button>
                          <a href="#"><i class="bi bi-chat-dots-fill"></i></a>
                          <a href="#"><i class="bi bi-hand-thumbs-up"></i></a>
                          <a href="#"><i class="bi bi-hand-thumbs-down"></i></a>

                          <div class="dropdown iconoption-div">
                            <a href="#" data-bs-toggle="dropdown" aria-expanded="false">
                              <i class="bi bi-three-dots-vertical"></i>
                            </a>
                            <ul class="dropdown-menu">
                              <li><a class="dropdown-item" href="#">Action 1</a></li>
                              <li><a class="dropdown-item" href="#">Action 2</a></li>
                              <li><a class="dropdown-item" href="#">Action 3</a></li>
                            </ul>
                          </div>

                        </div>
                      </div>

                      <div class="song-item">
                        <div class="song-img">
                          <img src="img/bg.jpg" alt="Album Cover" class="album-cover" />
                          <span class="play-overlay"><i class="bi bi-play-fill"></i></span>
                        </div>
                        <div class="song-info">
                          <h3>Bass Inferno</h3>
                          <p>Tags: tags, go, here, music, style, tags, will, go, here, supertags, moretags</p>
                        </div>
                        <div class="actions icons">
                          <button class="follow-btn">Publish</button>
                          <a href="#"><i class="bi bi-chat-dots-fill"></i></a>
                          <a href="#"><i class="bi bi-hand-thumbs-up"></i></a>
                          <a href="#"><i class="bi bi-hand-thumbs-down"></i></a>

                          <div class="dropdown">
                            <a href="#" data-bs-toggle="dropdown" aria-expanded="false">
                              <i class="bi bi-three-dots-vertical"></i>
                            </a>
                            <ul class="dropdown-menu">
                              <li><a class="dropdown-item" href="#">Action 1</a></li>
                              <li><a class="dropdown-item" href="#">Action 2</a></li>
                              <li><a class="dropdown-item" href="#">Action 3</a></li>
                            </ul>
                          </div>

                        </div>
                      </div>

                      <div class="song-item">
                        <div class="song-img">
                          <img src="img/bg.jpg" alt="Album Cover" class="album-cover" />
                          <span class="play-overlay"><i class="bi bi-play-fill"></i></span>
                        </div>
                        <div class="song-info">
                          <h3>Bass Inferno</h3>
                          <p>Tags: tags, go, here, music, style, tags, will, go, here, supertags, moretags</p>
                        </div>
                        <div class="actions icons">
                          <button class="follow-btn">Publish</button>
                          <a href="#"><i class="bi bi-chat-dots-fill"></i></a>
                          <a href="#"><i class="bi bi-hand-thumbs-up"></i></a>
                          <a href="#"><i class="bi bi-hand-thumbs-down"></i></a>

                          <div class="dropdown iconoption-div">
                            <a href="#" data-bs-toggle="dropdown" aria-expanded="false">
                              <i class="bi bi-three-dots-vertical"></i>
                            </a>
                            <ul class="dropdown-menu">
                              <li><a class="dropdown-item" href="#">Action 1</a></li>
                              <li><a class="dropdown-item" href="#">Action 2</a></li>
                              <li><a class="dropdown-item" href="#">Action 3</a></li>
                            </ul>
                          </div>

                        </div>
                      </div>

                      <div class="song-item">
                        <div class="song-img">
                          <img src="img/bg.jpg" alt="Album Cover" class="album-cover" />
                          <span class="play-overlay"><i class="bi bi-play-fill"></i></span>
                        </div>
                        <div class="song-info">
                          <h3>Bass Inferno</h3>
                          <p>Tags: tags, go, here, music, style, tags, will, go, here, supertags, moretags</p>
                        </div>
                        <div class="actions icons">
                          <button class="follow-btn">Publish</button>
                          <a href="#"><i class="bi bi-chat-dots-fill"></i></a>
                          <a href="#"><i class="bi bi-hand-thumbs-up"></i></a>
                          <a href="#"><i class="bi bi-hand-thumbs-down"></i></a>

                          <div class="dropdown">
                            <a href="#" data-bs-toggle="dropdown" aria-expanded="false">
                              <i class="bi bi-three-dots-vertical"></i>
                            </a>
                            <ul class="dropdown-menu">
                              <li><a class="dropdown-item" href="#">Action 1</a></li>
                              <li><a class="dropdown-item" href="#">Action 2</a></li>
                              <li><a class="dropdown-item" href="#">Action 3</a></li>
                            </ul>
                          </div>

                        </div>
                      </div>

                    </div>
                  </div>
                  <div class="tab-pane" id="linkedplaylists" role="tabpanel" aria-labelledby="linkedplaylists-tab">
                    <div class="library-list">

                      <div class="song-item">
                        <div class="song-img">
                          <img src="img/bg.jpg" alt="Album Cover" class="album-cover" />
                          <span class="play-overlay"><i class="bi bi-play-fill"></i></span>
                        </div>
                        <div class="song-info">
                          <h3>Bass Inferno</h3>
                          <p>Tags: tags, go, here, music, style, tags, will, go, here, supertags, moretags</p>
                        </div>
                        <div class="actions icons">
                          <button class="follow-btn">Publish</button>
                          <a href="#"><i class="bi bi-chat-dots-fill"></i></a>
                          <a href="#"><i class="bi bi-hand-thumbs-up"></i></a>
                          <a href="#"><i class="bi bi-hand-thumbs-down"></i></a>

                          <div class="dropdown iconoption-div">
                            <a href="#" data-bs-toggle="dropdown" aria-expanded="false">
                              <i class="bi bi-three-dots-vertical"></i>
                            </a>
                            <ul class="dropdown-menu">
                              <li><a class="dropdown-item" href="#">Action 1</a></li>
                              <li><a class="dropdown-item" href="#">Action 2</a></li>
                              <li><a class="dropdown-item" href="#">Action 3</a></li>
                            </ul>
                          </div>

                        </div>
                      </div>

                      <div class="song-item">
                        <div class="song-img">
                          <img src="img/bg.jpg" alt="Album Cover" class="album-cover" />
                          <span class="play-overlay"><i class="bi bi-play-fill"></i></span>
                        </div>
                        <div class="song-info">
                          <h3>Bass Inferno</h3>
                          <p>Tags: tags, go, here, music, style, tags, will, go, here, supertags, moretags</p>
                        </div>
                        <div class="actions icons">
                          <button class="follow-btn">Publish</button>
                          <a href="#"><i class="bi bi-chat-dots-fill"></i></a>
                          <a href="#"><i class="bi bi-hand-thumbs-up"></i></a>
                          <a href="#"><i class="bi bi-hand-thumbs-down"></i></a>

                          <div class="dropdown">
                            <a href="#" data-bs-toggle="dropdown" aria-expanded="false">
                              <i class="bi bi-three-dots-vertical"></i>
                            </a>
                            <ul class="dropdown-menu">
                              <li><a class="dropdown-item" href="#">Action 1</a></li>
                              <li><a class="dropdown-item" href="#">Action 2</a></li>
                              <li><a class="dropdown-item" href="#">Action 3</a></li>
                            </ul>
                          </div>

                        </div>
                      </div>

                      <div class="song-item">
                        <div class="song-img">
                          <img src="img/bg.jpg" alt="Album Cover" class="album-cover" />
                          <span class="play-overlay"><i class="bi bi-play-fill"></i></span>
                        </div>
                        <div class="song-info">
                          <h3>Bass Inferno</h3>
                          <p>Tags: tags, go, here, music, style, tags, will, go, here, supertags, moretags</p>
                        </div>
                        <div class="actions icons">
                          <button class="follow-btn">Publish</button>
                          <a href="#"><i class="bi bi-chat-dots-fill"></i></a>
                          <a href="#"><i class="bi bi-hand-thumbs-up"></i></a>
                          <a href="#"><i class="bi bi-hand-thumbs-down"></i></a>

                          <div class="dropdown iconoption-div">
                            <a href="#" data-bs-toggle="dropdown" aria-expanded="false">
                              <i class="bi bi-three-dots-vertical"></i>
                            </a>
                            <ul class="dropdown-menu">
                              <li><a class="dropdown-item" href="#">Action 1</a></li>
                              <li><a class="dropdown-item" href="#">Action 2</a></li>
                              <li><a class="dropdown-item" href="#">Action 3</a></li>
                            </ul>
                          </div>

                        </div>
                      </div>

                      <div class="song-item">
                        <div class="song-img">
                          <img src="img/bg.jpg" alt="Album Cover" class="album-cover" />
                          <span class="play-overlay"><i class="bi bi-play-fill"></i></span>
                        </div>
                        <div class="song-info">
                          <h3>Bass Inferno</h3>
                          <p>Tags: tags, go, here, music, style, tags, will, go, here, supertags, moretags</p>
                        </div>
                        <div class="actions icons">
                          <button class="follow-btn">Publish</button>
                          <a href="#"><i class="bi bi-chat-dots-fill"></i></a>
                          <a href="#"><i class="bi bi-hand-thumbs-up"></i></a>
                          <a href="#"><i class="bi bi-hand-thumbs-down"></i></a>

                          <div class="dropdown">
                            <a href="#" data-bs-toggle="dropdown" aria-expanded="false">
                              <i class="bi bi-three-dots-vertical"></i>
                            </a>
                            <ul class="dropdown-menu">
                              <li><a class="dropdown-item" href="#">Action 1</a></li>
                              <li><a class="dropdown-item" href="#">Action 2</a></li>
                              <li><a class="dropdown-item" href="#">Action 3</a></li>
                            </ul>
                          </div>

                        </div>
                      </div>

                      <div class="song-item">
                        <div class="song-img">
                          <img src="img/bg.jpg" alt="Album Cover" class="album-cover" />
                          <span class="play-overlay"><i class="bi bi-play-fill"></i></span>
                        </div>
                        <div class="song-info">
                          <h3>Bass Inferno</h3>
                          <p>Tags: tags, go, here, music, style, tags, will, go, here, supertags, moretags</p>
                        </div>
                        <div class="actions icons">
                          <button class="follow-btn">Publish</button>
                          <a href="#"><i class="bi bi-chat-dots-fill"></i></a>
                          <a href="#"><i class="bi bi-hand-thumbs-up"></i></a>
                          <a href="#"><i class="bi bi-hand-thumbs-down"></i></a>

                          <div class="dropdown iconoption-div">
                            <a href="#" data-bs-toggle="dropdown" aria-expanded="false">
                              <i class="bi bi-three-dots-vertical"></i>
                            </a>
                            <ul class="dropdown-menu">
                              <li><a class="dropdown-item" href="#">Action 1</a></li>
                              <li><a class="dropdown-item" href="#">Action 2</a></li>
                              <li><a class="dropdown-item" href="#">Action 3</a></li>
                            </ul>
                          </div>

                        </div>
                      </div>

                      <div class="song-item">
                        <div class="song-img">
                          <img src="img/bg.jpg" alt="Album Cover" class="album-cover" />
                          <span class="play-overlay"><i class="bi bi-play-fill"></i></span>
                        </div>
                        <div class="song-info">
                          <h3>Bass Inferno</h3>
                          <p>Tags: tags, go, here, music, style, tags, will, go, here, supertags, moretags</p>
                        </div>
                        <div class="actions icons">
                          <button class="follow-btn">Publish</button>
                          <a href="#"><i class="bi bi-chat-dots-fill"></i></a>
                          <a href="#"><i class="bi bi-hand-thumbs-up"></i></a>
                          <a href="#"><i class="bi bi-hand-thumbs-down"></i></a>

                          <div class="dropdown">
                            <a href="#" data-bs-toggle="dropdown" aria-expanded="false">
                              <i class="bi bi-three-dots-vertical"></i>
                            </a>
                            <ul class="dropdown-menu">
                              <li><a class="dropdown-item" href="#">Action 1</a></li>
                              <li><a class="dropdown-item" href="#">Action 2</a></li>
                              <li><a class="dropdown-item" href="#">Action 3</a></li>
                            </ul>
                          </div>

                        </div>
                      </div>

                      <div class="song-item">
                        <div class="song-img">
                          <img src="img/bg.jpg" alt="Album Cover" class="album-cover" />
                          <span class="play-overlay"><i class="bi bi-play-fill"></i></span>
                        </div>
                        <div class="song-info">
                          <h3>Bass Inferno</h3>
                          <p>Tags: tags, go, here, music, style, tags, will, go, here, supertags, moretags</p>
                        </div>
                        <div class="actions icons">
                          <button class="follow-btn">Publish</button>
                          <a href="#"><i class="bi bi-chat-dots-fill"></i></a>
                          <a href="#"><i class="bi bi-hand-thumbs-up"></i></a>
                          <a href="#"><i class="bi bi-hand-thumbs-down"></i></a>

                          <div class="dropdown iconoption-div">
                            <a href="#" data-bs-toggle="dropdown" aria-expanded="false">
                              <i class="bi bi-three-dots-vertical"></i>
                            </a>
                            <ul class="dropdown-menu">
                              <li><a class="dropdown-item" href="#">Action 1</a></li>
                              <li><a class="dropdown-item" href="#">Action 2</a></li>
                              <li><a class="dropdown-item" href="#">Action 3</a></li>
                            </ul>
                          </div>

                        </div>
                      </div>

                      <div class="song-item">
                        <div class="song-img">
                          <img src="img/bg.jpg" alt="Album Cover" class="album-cover" />
                          <span class="play-overlay"><i class="bi bi-play-fill"></i></span>
                        </div>
                        <div class="song-info">
                          <h3>Bass Inferno</h3>
                          <p>Tags: tags, go, here, music, style, tags, will, go, here, supertags, moretags</p>
                        </div>
                        <div class="actions icons">
                          <button class="follow-btn">Publish</button>
                          <a href="#"><i class="bi bi-chat-dots-fill"></i></a>
                          <a href="#"><i class="bi bi-hand-thumbs-up"></i></a>
                          <a href="#"><i class="bi bi-hand-thumbs-down"></i></a>

                          <div class="dropdown">
                            <a href="#" data-bs-toggle="dropdown" aria-expanded="false">
                              <i class="bi bi-three-dots-vertical"></i>
                            </a>
                            <ul class="dropdown-menu">
                              <li><a class="dropdown-item" href="#">Action 1</a></li>
                              <li><a class="dropdown-item" href="#">Action 2</a></li>
                              <li><a class="dropdown-item" href="#">Action 3</a></li>
                            </ul>
                          </div>

                        </div>
                      </div>

                      <div class="song-item">
                        <div class="song-img">
                          <img src="img/bg.jpg" alt="Album Cover" class="album-cover" />
                          <span class="play-overlay"><i class="bi bi-play-fill"></i></span>
                        </div>
                        <div class="song-info">
                          <h3>Bass Inferno</h3>
                          <p>Tags: tags, go, here, music, style, tags, will, go, here, supertags, moretags</p>
                        </div>
                        <div class="actions icons">
                          <button class="follow-btn">Publish</button>
                          <a href="#"><i class="bi bi-chat-dots-fill"></i></a>
                          <a href="#"><i class="bi bi-hand-thumbs-up"></i></a>
                          <a href="#"><i class="bi bi-hand-thumbs-down"></i></a>

                          <div class="dropdown iconoption-div">
                            <a href="#" data-bs-toggle="dropdown" aria-expanded="false">
                              <i class="bi bi-three-dots-vertical"></i>
                            </a>
                            <ul class="dropdown-menu">
                              <li><a class="dropdown-item" href="#">Action 1</a></li>
                              <li><a class="dropdown-item" href="#">Action 2</a></li>
                              <li><a class="dropdown-item" href="#">Action 3</a></li>
                            </ul>
                          </div>

                        </div>
                      </div>

                      <div class="song-item">
                        <div class="song-img">
                          <img src="img/bg.jpg" alt="Album Cover" class="album-cover" />
                          <span class="play-overlay"><i class="bi bi-play-fill"></i></span>
                        </div>
                        <div class="song-info">
                          <h3>Bass Inferno</h3>
                          <p>Tags: tags, go, here, music, style, tags, will, go, here, supertags, moretags</p>
                        </div>
                        <div class="actions icons">
                          <button class="follow-btn">Publish</button>
                          <a href="#"><i class="bi bi-chat-dots-fill"></i></a>
                          <a href="#"><i class="bi bi-hand-thumbs-up"></i></a>
                          <a href="#"><i class="bi bi-hand-thumbs-down"></i></a>

                          <div class="dropdown">
                            <a href="#" data-bs-toggle="dropdown" aria-expanded="false">
                              <i class="bi bi-three-dots-vertical"></i>
                            </a>
                            <ul class="dropdown-menu">
                              <li><a class="dropdown-item" href="#">Action 1</a></li>
                              <li><a class="dropdown-item" href="#">Action 2</a></li>
                              <li><a class="dropdown-item" href="#">Action 3</a></li>
                            </ul>
                          </div>

                        </div>
                      </div>

                    </div>
                  </div>
                  <div class="tab-pane" id="following" role="tabpanel" aria-labelledby="following-tab">
                    <div class="library-list">

                      <div class="song-item">
                        <div class="song-img">
                          <img src="img/bg.jpg" alt="Album Cover" class="album-cover" />
                          <span class="play-overlay"><i class="bi bi-play-fill"></i></span>
                        </div>
                        <div class="song-info">
                          <h3>Bass Inferno</h3>
                          <p>Tags: tags, go, here, music, style, tags, will, go, here, supertags, moretags</p>
                        </div>
                        <div class="actions icons">
                          <button class="follow-btn">Publish</button>
                          <a href="#"><i class="bi bi-chat-dots-fill"></i></a>
                          <a href="#"><i class="bi bi-hand-thumbs-up"></i></a>
                          <a href="#"><i class="bi bi-hand-thumbs-down"></i></a>

                          <div class="dropdown iconoption-div">
                            <a href="#" data-bs-toggle="dropdown" aria-expanded="false">
                              <i class="bi bi-three-dots-vertical"></i>
                            </a>
                            <ul class="dropdown-menu">
                              <li><a class="dropdown-item" href="#">Action 1</a></li>
                              <li><a class="dropdown-item" href="#">Action 2</a></li>
                              <li><a class="dropdown-item" href="#">Action 3</a></li>
                            </ul>
                          </div>

                        </div>
                      </div>

                      <div class="song-item">
                        <div class="song-img">
                          <img src="img/bg.jpg" alt="Album Cover" class="album-cover" />
                          <span class="play-overlay"><i class="bi bi-play-fill"></i></span>
                        </div>
                        <div class="song-info">
                          <h3>Bass Inferno</h3>
                          <p>Tags: tags, go, here, music, style, tags, will, go, here, supertags, moretags</p>
                        </div>
                        <div class="actions icons">
                          <button class="follow-btn">Publish</button>
                          <a href="#"><i class="bi bi-chat-dots-fill"></i></a>
                          <a href="#"><i class="bi bi-hand-thumbs-up"></i></a>
                          <a href="#"><i class="bi bi-hand-thumbs-down"></i></a>

                          <div class="dropdown">
                            <a href="#" data-bs-toggle="dropdown" aria-expanded="false">
                              <i class="bi bi-three-dots-vertical"></i>
                            </a>
                            <ul class="dropdown-menu">
                              <li><a class="dropdown-item" href="#">Action 1</a></li>
                              <li><a class="dropdown-item" href="#">Action 2</a></li>
                              <li><a class="dropdown-item" href="#">Action 3</a></li>
                            </ul>
                          </div>

                        </div>
                      </div>

                      <div class="song-item">
                        <div class="song-img">
                          <img src="img/bg.jpg" alt="Album Cover" class="album-cover" />
                          <span class="play-overlay"><i class="bi bi-play-fill"></i></span>
                        </div>
                        <div class="song-info">
                          <h3>Bass Inferno</h3>
                          <p>Tags: tags, go, here, music, style, tags, will, go, here, supertags, moretags</p>
                        </div>
                        <div class="actions icons">
                          <button class="follow-btn">Publish</button>
                          <a href="#"><i class="bi bi-chat-dots-fill"></i></a>
                          <a href="#"><i class="bi bi-hand-thumbs-up"></i></a>
                          <a href="#"><i class="bi bi-hand-thumbs-down"></i></a>

                          <div class="dropdown iconoption-div">
                            <a href="#" data-bs-toggle="dropdown" aria-expanded="false">
                              <i class="bi bi-three-dots-vertical"></i>
                            </a>
                            <ul class="dropdown-menu">
                              <li><a class="dropdown-item" href="#">Action 1</a></li>
                              <li><a class="dropdown-item" href="#">Action 2</a></li>
                              <li><a class="dropdown-item" href="#">Action 3</a></li>
                            </ul>
                          </div>

                        </div>
                      </div>

                      <div class="song-item">
                        <div class="song-img">
                          <img src="img/bg.jpg" alt="Album Cover" class="album-cover" />
                          <span class="play-overlay"><i class="bi bi-play-fill"></i></span>
                        </div>
                        <div class="song-info">
                          <h3>Bass Inferno</h3>
                          <p>Tags: tags, go, here, music, style, tags, will, go, here, supertags, moretags</p>
                        </div>
                        <div class="actions icons">
                          <button class="follow-btn">Publish</button>
                          <a href="#"><i class="bi bi-chat-dots-fill"></i></a>
                          <a href="#"><i class="bi bi-hand-thumbs-up"></i></a>
                          <a href="#"><i class="bi bi-hand-thumbs-down"></i></a>

                          <div class="dropdown">
                            <a href="#" data-bs-toggle="dropdown" aria-expanded="false">
                              <i class="bi bi-three-dots-vertical"></i>
                            </a>
                            <ul class="dropdown-menu">
                              <li><a class="dropdown-item" href="#">Action 1</a></li>
                              <li><a class="dropdown-item" href="#">Action 2</a></li>
                              <li><a class="dropdown-item" href="#">Action 3</a></li>
                            </ul>
                          </div>

                        </div>
                      </div>

                      <div class="song-item">
                        <div class="song-img">
                          <img src="img/bg.jpg" alt="Album Cover" class="album-cover" />
                          <span class="play-overlay"><i class="bi bi-play-fill"></i></span>
                        </div>
                        <div class="song-info">
                          <h3>Bass Inferno</h3>
                          <p>Tags: tags, go, here, music, style, tags, will, go, here, supertags, moretags</p>
                        </div>
                        <div class="actions icons">
                          <button class="follow-btn">Publish</button>
                          <a href="#"><i class="bi bi-chat-dots-fill"></i></a>
                          <a href="#"><i class="bi bi-hand-thumbs-up"></i></a>
                          <a href="#"><i class="bi bi-hand-thumbs-down"></i></a>

                          <div class="dropdown iconoption-div">
                            <a href="#" data-bs-toggle="dropdown" aria-expanded="false">
                              <i class="bi bi-three-dots-vertical"></i>
                            </a>
                            <ul class="dropdown-menu">
                              <li><a class="dropdown-item" href="#">Action 1</a></li>
                              <li><a class="dropdown-item" href="#">Action 2</a></li>
                              <li><a class="dropdown-item" href="#">Action 3</a></li>
                            </ul>
                          </div>

                        </div>
                      </div>

                      <div class="song-item">
                        <div class="song-img">
                          <img src="img/bg.jpg" alt="Album Cover" class="album-cover" />
                          <span class="play-overlay"><i class="bi bi-play-fill"></i></span>
                        </div>
                        <div class="song-info">
                          <h3>Bass Inferno</h3>
                          <p>Tags: tags, go, here, music, style, tags, will, go, here, supertags, moretags</p>
                        </div>
                        <div class="actions icons">
                          <button class="follow-btn">Publish</button>
                          <a href="#"><i class="bi bi-chat-dots-fill"></i></a>
                          <a href="#"><i class="bi bi-hand-thumbs-up"></i></a>
                          <a href="#"><i class="bi bi-hand-thumbs-down"></i></a>

                          <div class="dropdown">
                            <a href="#" data-bs-toggle="dropdown" aria-expanded="false">
                              <i class="bi bi-three-dots-vertical"></i>
                            </a>
                            <ul class="dropdown-menu">
                              <li><a class="dropdown-item" href="#">Action 1</a></li>
                              <li><a class="dropdown-item" href="#">Action 2</a></li>
                              <li><a class="dropdown-item" href="#">Action 3</a></li>
                            </ul>
                          </div>

                        </div>
                      </div>

                      <div class="song-item">
                        <div class="song-img">
                          <img src="img/bg.jpg" alt="Album Cover" class="album-cover" />
                          <span class="play-overlay"><i class="bi bi-play-fill"></i></span>
                        </div>
                        <div class="song-info">
                          <h3>Bass Inferno</h3>
                          <p>Tags: tags, go, here, music, style, tags, will, go, here, supertags, moretags</p>
                        </div>
                        <div class="actions icons">
                          <button class="follow-btn">Publish</button>
                          <a href="#"><i class="bi bi-chat-dots-fill"></i></a>
                          <a href="#"><i class="bi bi-hand-thumbs-up"></i></a>
                          <a href="#"><i class="bi bi-hand-thumbs-down"></i></a>

                          <div class="dropdown iconoption-div">
                            <a href="#" data-bs-toggle="dropdown" aria-expanded="false">
                              <i class="bi bi-three-dots-vertical"></i>
                            </a>
                            <ul class="dropdown-menu">
                              <li><a class="dropdown-item" href="#">Action 1</a></li>
                              <li><a class="dropdown-item" href="#">Action 2</a></li>
                              <li><a class="dropdown-item" href="#">Action 3</a></li>
                            </ul>
                          </div>

                        </div>
                      </div>

                      <div class="song-item">
                        <div class="song-img">
                          <img src="img/bg.jpg" alt="Album Cover" class="album-cover" />
                          <span class="play-overlay"><i class="bi bi-play-fill"></i></span>
                        </div>
                        <div class="song-info">
                          <h3>Bass Inferno</h3>
                          <p>Tags: tags, go, here, music, style, tags, will, go, here, supertags, moretags</p>
                        </div>
                        <div class="actions icons">
                          <button class="follow-btn">Publish</button>
                          <a href="#"><i class="bi bi-chat-dots-fill"></i></a>
                          <a href="#"><i class="bi bi-hand-thumbs-up"></i></a>
                          <a href="#"><i class="bi bi-hand-thumbs-down"></i></a>

                          <div class="dropdown">
                            <a href="#" data-bs-toggle="dropdown" aria-expanded="false">
                              <i class="bi bi-three-dots-vertical"></i>
                            </a>
                            <ul class="dropdown-menu">
                              <li><a class="dropdown-item" href="#">Action 1</a></li>
                              <li><a class="dropdown-item" href="#">Action 2</a></li>
                              <li><a class="dropdown-item" href="#">Action 3</a></li>
                            </ul>
                          </div>

                        </div>
                      </div>

                      <div class="song-item">
                        <div class="song-img">
                          <img src="img/bg.jpg" alt="Album Cover" class="album-cover" />
                          <span class="play-overlay"><i class="bi bi-play-fill"></i></span>
                        </div>
                        <div class="song-info">
                          <h3>Bass Inferno</h3>
                          <p>Tags: tags, go, here, music, style, tags, will, go, here, supertags, moretags</p>
                        </div>
                        <div class="actions icons">
                          <button class="follow-btn">Publish</button>
                          <a href="#"><i class="bi bi-chat-dots-fill"></i></a>
                          <a href="#"><i class="bi bi-hand-thumbs-up"></i></a>
                          <a href="#"><i class="bi bi-hand-thumbs-down"></i></a>

                          <div class="dropdown iconoption-div">
                            <a href="#" data-bs-toggle="dropdown" aria-expanded="false">
                              <i class="bi bi-three-dots-vertical"></i>
                            </a>
                            <ul class="dropdown-menu">
                              <li><a class="dropdown-item" href="#">Action 1</a></li>
                              <li><a class="dropdown-item" href="#">Action 2</a></li>
                              <li><a class="dropdown-item" href="#">Action 3</a></li>
                            </ul>
                          </div>

                        </div>
                      </div>

                      <div class="song-item">
                        <div class="song-img">
                          <img src="img/bg.jpg" alt="Album Cover" class="album-cover" />
                          <span class="play-overlay"><i class="bi bi-play-fill"></i></span>
                        </div>
                        <div class="song-info">
                          <h3>Bass Inferno</h3>
                          <p>Tags: tags, go, here, music, style, tags, will, go, here, supertags, moretags</p>
                        </div>
                        <div class="actions icons">
                          <button class="follow-btn">Publish</button>
                          <a href="#"><i class="bi bi-chat-dots-fill"></i></a>
                          <a href="#"><i class="bi bi-hand-thumbs-up"></i></a>
                          <a href="#"><i class="bi bi-hand-thumbs-down"></i></a>

                          <div class="dropdown">
                            <a href="#" data-bs-toggle="dropdown" aria-expanded="false">
                              <i class="bi bi-three-dots-vertical"></i>
                            </a>
                            <ul class="dropdown-menu">
                              <li><a class="dropdown-item" href="#">Action 1</a></li>
                              <li><a class="dropdown-item" href="#">Action 2</a></li>
                              <li><a class="dropdown-item" href="#">Action 3</a></li>
                            </ul>
                          </div>

                        </div>
                      </div>

                    </div>
                  </div>
                  <div class="tab-pane" id="followers" role="tabpanel" aria-labelledby="followers-tab">
                    <div class="library-list">

                      <div class="song-item">
                        <div class="song-img">
                          <img src="img/bg.jpg" alt="Album Cover" class="album-cover" />
                          <span class="play-overlay"><i class="bi bi-play-fill"></i></span>
                        </div>
                        <div class="song-info">
                          <h3>Bass Inferno</h3>
                          <p>Tags: tags, go, here, music, style, tags, will, go, here, supertags, moretags</p>
                        </div>
                        <div class="actions icons">
                          <button class="follow-btn">Publish</button>
                          <a href="#"><i class="bi bi-chat-dots-fill"></i></a>
                          <a href="#"><i class="bi bi-hand-thumbs-up"></i></a>
                          <a href="#"><i class="bi bi-hand-thumbs-down"></i></a>

                          <div class="dropdown iconoption-div">
                            <a href="#" data-bs-toggle="dropdown" aria-expanded="false">
                              <i class="bi bi-three-dots-vertical"></i>
                            </a>
                            <ul class="dropdown-menu">
                              <li><a class="dropdown-item" href="#">Action 1</a></li>
                              <li><a class="dropdown-item" href="#">Action 2</a></li>
                              <li><a class="dropdown-item" href="#">Action 3</a></li>
                            </ul>
                          </div>

                        </div>
                      </div>

                      <div class="song-item">
                        <div class="song-img">
                          <img src="img/bg.jpg" alt="Album Cover" class="album-cover" />
                          <span class="play-overlay"><i class="bi bi-play-fill"></i></span>
                        </div>
                        <div class="song-info">
                          <h3>Bass Inferno</h3>
                          <p>Tags: tags, go, here, music, style, tags, will, go, here, supertags, moretags</p>
                        </div>
                        <div class="actions icons">
                          <button class="follow-btn">Publish</button>
                          <a href="#"><i class="bi bi-chat-dots-fill"></i></a>
                          <a href="#"><i class="bi bi-hand-thumbs-up"></i></a>
                          <a href="#"><i class="bi bi-hand-thumbs-down"></i></a>

                          <div class="dropdown">
                            <a href="#" data-bs-toggle="dropdown" aria-expanded="false">
                              <i class="bi bi-three-dots-vertical"></i>
                            </a>
                            <ul class="dropdown-menu">
                              <li><a class="dropdown-item" href="#">Action 1</a></li>
                              <li><a class="dropdown-item" href="#">Action 2</a></li>
                              <li><a class="dropdown-item" href="#">Action 3</a></li>
                            </ul>
                          </div>

                        </div>
                      </div>

                      <div class="song-item">
                        <div class="song-img">
                          <img src="img/bg.jpg" alt="Album Cover" class="album-cover" />
                          <span class="play-overlay"><i class="bi bi-play-fill"></i></span>
                        </div>
                        <div class="song-info">
                          <h3>Bass Inferno</h3>
                          <p>Tags: tags, go, here, music, style, tags, will, go, here, supertags, moretags</p>
                        </div>
                        <div class="actions icons">
                          <button class="follow-btn">Publish</button>
                          <a href="#"><i class="bi bi-chat-dots-fill"></i></a>
                          <a href="#"><i class="bi bi-hand-thumbs-up"></i></a>
                          <a href="#"><i class="bi bi-hand-thumbs-down"></i></a>

                          <div class="dropdown iconoption-div">
                            <a href="#" data-bs-toggle="dropdown" aria-expanded="false">
                              <i class="bi bi-three-dots-vertical"></i>
                            </a>
                            <ul class="dropdown-menu">
                              <li><a class="dropdown-item" href="#">Action 1</a></li>
                              <li><a class="dropdown-item" href="#">Action 2</a></li>
                              <li><a class="dropdown-item" href="#">Action 3</a></li>
                            </ul>
                          </div>

                        </div>
                      </div>

                      <div class="song-item">
                        <div class="song-img">
                          <img src="img/bg.jpg" alt="Album Cover" class="album-cover" />
                          <span class="play-overlay"><i class="bi bi-play-fill"></i></span>
                        </div>
                        <div class="song-info">
                          <h3>Bass Inferno</h3>
                          <p>Tags: tags, go, here, music, style, tags, will, go, here, supertags, moretags</p>
                        </div>
                        <div class="actions icons">
                          <button class="follow-btn">Publish</button>
                          <a href="#"><i class="bi bi-chat-dots-fill"></i></a>
                          <a href="#"><i class="bi bi-hand-thumbs-up"></i></a>
                          <a href="#"><i class="bi bi-hand-thumbs-down"></i></a>

                          <div class="dropdown">
                            <a href="#" data-bs-toggle="dropdown" aria-expanded="false">
                              <i class="bi bi-three-dots-vertical"></i>
                            </a>
                            <ul class="dropdown-menu">
                              <li><a class="dropdown-item" href="#">Action 1</a></li>
                              <li><a class="dropdown-item" href="#">Action 2</a></li>
                              <li><a class="dropdown-item" href="#">Action 3</a></li>
                            </ul>
                          </div>

                        </div>
                      </div>

                      <div class="song-item">
                        <div class="song-img">
                          <img src="img/bg.jpg" alt="Album Cover" class="album-cover" />
                          <span class="play-overlay"><i class="bi bi-play-fill"></i></span>
                        </div>
                        <div class="song-info">
                          <h3>Bass Inferno</h3>
                          <p>Tags: tags, go, here, music, style, tags, will, go, here, supertags, moretags</p>
                        </div>
                        <div class="actions icons">
                          <button class="follow-btn">Publish</button>
                          <a href="#"><i class="bi bi-chat-dots-fill"></i></a>
                          <a href="#"><i class="bi bi-hand-thumbs-up"></i></a>
                          <a href="#"><i class="bi bi-hand-thumbs-down"></i></a>

                          <div class="dropdown iconoption-div">
                            <a href="#" data-bs-toggle="dropdown" aria-expanded="false">
                              <i class="bi bi-three-dots-vertical"></i>
                            </a>
                            <ul class="dropdown-menu">
                              <li><a class="dropdown-item" href="#">Action 1</a></li>
                              <li><a class="dropdown-item" href="#">Action 2</a></li>
                              <li><a class="dropdown-item" href="#">Action 3</a></li>
                            </ul>
                          </div>

                        </div>
                      </div>

                      <div class="song-item">
                        <div class="song-img">
                          <img src="img/bg.jpg" alt="Album Cover" class="album-cover" />
                          <span class="play-overlay"><i class="bi bi-play-fill"></i></span>
                        </div>
                        <div class="song-info">
                          <h3>Bass Inferno</h3>
                          <p>Tags: tags, go, here, music, style, tags, will, go, here, supertags, moretags</p>
                        </div>
                        <div class="actions icons">
                          <button class="follow-btn">Publish</button>
                          <a href="#"><i class="bi bi-chat-dots-fill"></i></a>
                          <a href="#"><i class="bi bi-hand-thumbs-up"></i></a>
                          <a href="#"><i class="bi bi-hand-thumbs-down"></i></a>

                          <div class="dropdown">
                            <a href="#" data-bs-toggle="dropdown" aria-expanded="false">
                              <i class="bi bi-three-dots-vertical"></i>
                            </a>
                            <ul class="dropdown-menu">
                              <li><a class="dropdown-item" href="#">Action 1</a></li>
                              <li><a class="dropdown-item" href="#">Action 2</a></li>
                              <li><a class="dropdown-item" href="#">Action 3</a></li>
                            </ul>
                          </div>

                        </div>
                      </div>

                      <div class="song-item">
                        <div class="song-img">
                          <img src="img/bg.jpg" alt="Album Cover" class="album-cover" />
                          <span class="play-overlay"><i class="bi bi-play-fill"></i></span>
                        </div>
                        <div class="song-info">
                          <h3>Bass Inferno</h3>
                          <p>Tags: tags, go, here, music, style, tags, will, go, here, supertags, moretags</p>
                        </div>
                        <div class="actions icons">
                          <button class="follow-btn">Publish</button>
                          <a href="#"><i class="bi bi-chat-dots-fill"></i></a>
                          <a href="#"><i class="bi bi-hand-thumbs-up"></i></a>
                          <a href="#"><i class="bi bi-hand-thumbs-down"></i></a>

                          <div class="dropdown iconoption-div">
                            <a href="#" data-bs-toggle="dropdown" aria-expanded="false">
                              <i class="bi bi-three-dots-vertical"></i>
                            </a>
                            <ul class="dropdown-menu">
                              <li><a class="dropdown-item" href="#">Action 1</a></li>
                              <li><a class="dropdown-item" href="#">Action 2</a></li>
                              <li><a class="dropdown-item" href="#">Action 3</a></li>
                            </ul>
                          </div>

                        </div>
                      </div>

                      <div class="song-item">
                        <div class="song-img">
                          <img src="img/bg.jpg" alt="Album Cover" class="album-cover" />
                          <span class="play-overlay"><i class="bi bi-play-fill"></i></span>
                        </div>
                        <div class="song-info">
                          <h3>Bass Inferno</h3>
                          <p>Tags: tags, go, here, music, style, tags, will, go, here, supertags, moretags</p>
                        </div>
                        <div class="actions icons">
                          <button class="follow-btn">Publish</button>
                          <a href="#"><i class="bi bi-chat-dots-fill"></i></a>
                          <a href="#"><i class="bi bi-hand-thumbs-up"></i></a>
                          <a href="#"><i class="bi bi-hand-thumbs-down"></i></a>

                          <div class="dropdown">
                            <a href="#" data-bs-toggle="dropdown" aria-expanded="false">
                              <i class="bi bi-three-dots-vertical"></i>
                            </a>
                            <ul class="dropdown-menu">
                              <li><a class="dropdown-item" href="#">Action 1</a></li>
                              <li><a class="dropdown-item" href="#">Action 2</a></li>
                              <li><a class="dropdown-item" href="#">Action 3</a></li>
                            </ul>
                          </div>

                        </div>
                      </div>

                      <div class="song-item">
                        <div class="song-img">
                          <img src="img/bg.jpg" alt="Album Cover" class="album-cover" />
                          <span class="play-overlay"><i class="bi bi-play-fill"></i></span>
                        </div>
                        <div class="song-info">
                          <h3>Bass Inferno</h3>
                          <p>Tags: tags, go, here, music, style, tags, will, go, here, supertags, moretags</p>
                        </div>
                        <div class="actions icons">
                          <button class="follow-btn">Publish</button>
                          <a href="#"><i class="bi bi-chat-dots-fill"></i></a>
                          <a href="#"><i class="bi bi-hand-thumbs-up"></i></a>
                          <a href="#"><i class="bi bi-hand-thumbs-down"></i></a>

                          <div class="dropdown iconoption-div">
                            <a href="#" data-bs-toggle="dropdown" aria-expanded="false">
                              <i class="bi bi-three-dots-vertical"></i>
                            </a>
                            <ul class="dropdown-menu">
                              <li><a class="dropdown-item" href="#">Action 1</a></li>
                              <li><a class="dropdown-item" href="#">Action 2</a></li>
                              <li><a class="dropdown-item" href="#">Action 3</a></li>
                            </ul>
                          </div>

                        </div>
                      </div>

                      <div class="song-item">
                        <div class="song-img">
                          <img src="img/bg.jpg" alt="Album Cover" class="album-cover" />
                          <span class="play-overlay"><i class="bi bi-play-fill"></i></span>
                        </div>
                        <div class="song-info">
                          <h3>Bass Inferno</h3>
                          <p>Tags: tags, go, here, music, style, tags, will, go, here, supertags, moretags</p>
                        </div>
                        <div class="actions icons">
                          <button class="follow-btn">Publish</button>
                          <a href="#"><i class="bi bi-chat-dots-fill"></i></a>
                          <a href="#"><i class="bi bi-hand-thumbs-up"></i></a>
                          <a href="#"><i class="bi bi-hand-thumbs-down"></i></a>

                          <div class="dropdown">
                            <a href="#" data-bs-toggle="dropdown" aria-expanded="false">
                              <i class="bi bi-three-dots-vertical"></i>
                            </a>
                            <ul class="dropdown-menu">
                              <li><a class="dropdown-item" href="#">Action 1</a></li>
                              <li><a class="dropdown-item" href="#">Action 2</a></li>
                              <li><a class="dropdown-item" href="#">Action 3</a></li>
                            </ul>
                          </div>

                        </div>
                      </div>
                    </div>

                  </div>

                </div>

              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
};

export default Library;
