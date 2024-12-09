import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../stylesheets/navBar.css'; // Import the CSS

const Navbar = ({ communities, showCommunity, showview, activeView, currentCommunity }) => {
  //const [communities, setCommunities] = useState([]);

  // Fetch the list of communities from the server when the component loads
  // useEffect(() => {
  //   fetchCommunities();
  // }, []);

  // const fetchCommunities = async () => {
  //   try {
  //     const response = await axios.get('http://localhost:8000/communities'); //don't need to fetch again , the app.js fetches and passes it as communities
  //     setCommunities(response.data);
  //   } catch (err) {
  //     console.error('Error fetching communities:', err);
  //   }
  // };

  return (
    <div id="nav" className="navbar">
      <div className="navbarlist">
        <p
          onClick={() => showview('home')}
          className={`home ${activeView === 'home' ? 'active' : ''}`}
        >
          Home
        </p>
        <div id="nav-divider"></div>
        <p className="Communities">Communities</p>
        <div id="create-community">
          <button
            onClick={() => showview('createCommunity')}
            className={`${activeView === 'createCommunity' ? 'active' : ''}`}
          >
            Create Community
          </button>
        </div>
        <ul className="Communities_List">
          {communities.map((community) => (
            <li
              key={community._id}
              onClick={() => showCommunity(community._id)}
              className={`community-link ${activeView === 'communitySection' && currentCommunity === community._id ? 'active-community' : ''}`}
            >
              <p>r/{community.name}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Navbar;
