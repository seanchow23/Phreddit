import React from 'react';
import '../stylesheets/navBar.css'; // Import the CSS

const Navbar = ({ 
  communities, 
  showCommunity, 
  showview, 
  activeView, 
  currentCommunity, 
  currentUser 
}) => {
  // Sort communities for logged-in users, placing joined communities at the top
  const sortedCommunities = currentUser
    ? [
        ...communities.filter((community) => community.members.includes(currentUser._id)), // Joined communities
        ...communities.filter((community) => !community.members.includes(currentUser._id)), // Unjoined communities
      ]
    : communities;

  return (
    <div id="nav" className="navbar">
      <div className="navbarlist">
        {/* Home Button */}
        <p
          onClick={() => showview('home')}
          className={`home ${activeView === 'home' ? 'active' : ''}`}
        >
          Home
        </p>
        <div id="nav-divider"></div>

        {/* Communities Section */}
        <p className="Communities">Communities</p>

        {/* Create Community Button */}
        <div id="create-community">
          <button
            onClick={() => currentUser && showview('createCommunity')} // Only functional if user is logged in
            className={`${activeView === 'createCommunity' ? 'active' : ''} ${!currentUser ? 'disabled' : ''}`}
            disabled={!currentUser} // Disable button for guests
          >
            Create Community
          </button>
        </div>

        {/* Communities List */}
        <ul className="Communities_List">
          {sortedCommunities.map((community) => (
            <li
              key={community._id}
              onClick={() => showCommunity(community._id)}
              className={`community-link ${
                activeView === 'communitySection' && currentCommunity === community._id ? 'active-community' : ''
              }`}
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
