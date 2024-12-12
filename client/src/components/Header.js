import React, { useState } from 'react';
import axios from 'axios';
import '../stylesheets/header.css';

const Header = ({ showView, currentView, setSearchedPosts, setSearchQuery, currentUser, logout}) => {
  // const [searchQuery, setSearchQuery] = useState('');



  const [localQuery, setLocalQuery] = useState('');

  const handleSearch = async (event) => {
    if (event.key === 'Enter') {
      console.log("Enter key pressed");
      
      const query = localQuery.trim();
              setSearchQuery(query); // Set the query in the parent state
        
      if (query) {
        console.log("Searching for:", query);

        await searchPosts(query);

      }
      setLocalQuery(''); // Clear the search box after searching
    }
  };

  // Function to send the search request to the server
  const searchPosts = async (query) => {
    try {
      console.log("inside header searching");
      const response = await axios.get(`http://localhost:8000/search`, { params: { query } });

      console.log("Response received:", response);

      setSearchedPosts(response.data);
      console.log("data", response.data);

      showView('search'); // Navigate to the search view to display results
    } catch (err) {
      console.error('Error searching posts:', err);
    }
  };

  return (
    <div id="header" className="banner">
      <ul className="banner-list">
        {/* Phreddit Button */}
        <li className="banner-item-title">
          <a href="#" onClick={() => showView('welcome')} className="title">Phreddit</a>
        </li>

        {/* Search Bar */}
        <li className="banner-item-search">
          <input
            type="text"
            className="search-box"
            placeholder="Search Phreddit"
            value={localQuery}
            onChange={(e) => setLocalQuery(e.target.value)}
            onKeyDown={handleSearch}
          />
        </li>

        {/* Create Post Button */}
        <li className="banner-item-post">
          <button
            className={`create-post-button ${currentUser ? '' : 'disabled'}`}
            onClick={() => currentUser && showView('createPost')}
            disabled={!currentUser} // Disable button for guests
          >
            Create Post
          </button>
        </li>

        {/* User Profile Section */}
        <li className="banner-item-user">
          <div className="user-profile">
          {currentUser ? (
              <>
                <span
                  className="user-link"
                  onClick={() => showView('profile')}
                  style={{ cursor: 'pointer', textDecoration: 'underline', color: 'blue' }}
                >
                  Welcome, {currentUser.displayName}
                </span>
                <button className="logout-button" onClick={logout}>Logout</button>
              </>
            ) : (
              <span>Guest</span>
            )}
          </div>
        </li>
      </ul>
    </div>
  );
};

export default Header;