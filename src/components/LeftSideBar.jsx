import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { stripeAPI } from '../utils/api';

const LeftSideBar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const isActive = (path) => location.pathname === path;

  const [subscriptionInfo, setSubscriptionInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSubscriptionStatus = async () => {
      try {
        setLoading(true);
        const response = await stripeAPI.getSubscriptionStatus();
        if (response.data?.success) {
          setSubscriptionInfo(response.data.subscription || null);
        } else {
          setSubscriptionInfo(null);
        }
      } catch (error) {
        setSubscriptionInfo(null);
      } finally {
        setLoading(false);
      }
    };
    fetchSubscriptionStatus();
  }, [user]);

  return (
    <div className="sidebar">
      <div className="sidebar-div">
         <Link to="/"><h1 className="logo"><img src="/img/logo.png" alt="TRIBA"  style={{width : '100%'}}/></h1></Link>
        <div className="profile">
          <img src="/img/price-bg.jpg" alt="Profile" />
          <p>{user?.email}</p>
        </div>
        {/* <div className="credits">
          {loading ? 'Loading...' :
            subscriptionInfo && subscriptionInfo.songsLimit != null
              ? `${Math.max(0, subscriptionInfo.songsLimit - (subscriptionInfo.songsUsed || 0))} Credits`
              : 'Unlimited Credits'}
        </div> */}
      </div>
 
      
      <div className="menu">
        <a href='/'>
          <i className="fa fa-home" aria-hidden="true"></i> Home
        </a>
        {/* <Link to="/" className={isActive('/') ? 'active' : ''}>
          <i className="fa fa-home" aria-hidden="true"></i> Home
        </Link> */}
        <Link to="/generate" className={isActive('/generate') ? 'active' : ''}>
          <i className="fa fa-wrench" aria-hidden="true"></i> Generator
        </Link>
        <Link to="/library" className={isActive('/library') ? 'active' : ''}>
          <i className="fa fa-book" aria-hidden="true"></i> Library
        </Link>
        {/* <Link to="#" className={isActive('#') ? 'active' : ''}>
          <i className="fa fa-search" aria-hidden="true"></i> Search
        </Link>
        <Link to="#" className={isActive('3') ? 'active' : ''}>
          <i className="fa fa-globe" aria-hidden="true"></i> Explore
        </Link> */}
        <Link to="/profile" className={isActive('/profile') ? 'active' : ''}>
          <i className="fa fa-globe" aria-hidden="true"></i> Profile
        </Link>
        {/* <a href="#"><i className="fa fa-bell" target="_blank" aria-hidden="true"></i> Notifications</a> */}
        <Link to="#" onClick={(e) => { e.preventDefault(); logout(); }} >
              <i className="fa fa-globe" aria-hidden="true"></i> Logout
        </Link>

      </div>
      
      {/* <div className="left-footer">
        <div className="sidebanner">
          <h4>Uploaded to Pro</h4>
          <p>Unlock new fetaures, generate longer and Better Music</p>
          <a href="#">UPGRADE NOW</a>
        </div>
        <div className="sidebar-footer">
          <p>Earn Credits</p>
          <p>What's new?</p>
          <br />
          <p>© 2025 Inc</p>
        </div>
      </div> */}
    </div>
  );
};

export default LeftSideBar; 