// ************** THIS IS YOUR APP'S ENTRY POINT. CHANGE THIS FILE AS NEEDED. **************
// ************** DEFINE YOUR REACT COMPONENTS in ./components directory **************
// ************** THIS IS YOUR APP'S ENTRY POINT. CHANGE THIS FILE AS NEEDED. **************
// ************** DEFINE YOUR REACT COMPONENTS in ./components directory **************
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import WelcomePage from './components/WelcomePage';
import RegisterPage from './components/RegisterPage';
import LoginPage from './components/LoginPage';
import Header from './components/Header';
import Home from './components/Home';
import CreatePost from './components/CreatePost';
import CreateCommunity from './components/CreateCommunity';
import CommunitySection from './components/CommunitySection';
import PostSection from './components/PostSection';
import SearchView from './components/SearchView';
import Navbar from './components/Navbar';
import NewReplyPage from './components/NewReplyPage';
import './stylesheets/main.css';
import './stylesheets/home.css';
import './stylesheets/header.css';
import './stylesheets/navBar.css';

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [view, setView] = useState('welcome');
  const [communities, setCommunities] = useState([]);
  const [posts, setPosts] = useState([]);
  const [comments, setComments] = useState([]);
  const [linkFlairs, setLinkFlairs] = useState([]);
  const [users, setUsers] = useState([]);
  const [currentCommunity, setCurrentCommunity] = useState(null);
  const [selectedPostID, setSelectedPostID] = useState(null);
  const [searchedPosts, setSearchedPosts] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [parentCommentID, setParentCommentID] = useState(null);

  const fetchData = async () => {
    try {
      const [communitiesRes, postsRes, commentsRes, linkFlairsRes, usersRes] = await Promise.all([
        axios.get('http://localhost:8000/communities'),
        axios.get('http://localhost:8000/posts'),
        axios.get('http://localhost:8000/comments'),
        axios.get('http://localhost:8000/linkflairs'),
        axios.get('http://localhost:8000/users')
      ]);

      setCommunities(communitiesRes.data);
      setPosts(postsRes.data);
      setComments(commentsRes.data);
      setLinkFlairs(linkFlairsRes.data);
      setUsers(usersRes.data);
    } catch (err) {
      console.error('Error fetching data:', err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);


  // Logout function
  const logout = () => {
    setCurrentUser(null); // Clear the user state
    setView('welcome'); // Redirect to the welcome page
  };

  //register a given user, used in registerPage
  const registerUser = async (userData) => {
    try {
      const existingUser = users.find(user => user.email === userData.email || user.displayName === userData.displayName);
      if (existingUser) {
        alert('Email or display name is already in use.');
        return;
      }

      const response = await axios.post('http://localhost:8000/auth/register', userData);
      alert(response.data.message);
      setView('welcome');
      fetchData(); // Refresh users data
    } catch (error) {
      console.error('Error registering user:', error.response?.data?.message || error.message);
      alert(error.response?.data?.message || 'Registration failed.');
    }
  };

  //log in a given user, used in loginPage
  const loginUser = async (credentials) => {
    try {
      const existingUser = users.find(user => user.email === credentials.email);
      if (!existingUser) {
        alert('No account found with this email.');
        return;
      }

      const response = await axios.post('http://localhost:8000/auth/login', credentials);
      setCurrentUser(response.data.user);
      setIsAuthenticated(true);
      alert('Login successful!');
      setView('home');
    } catch (error) {
      setView('login');
      console.error('Error logging in:', error.response?.data?.message || error.message);
      alert(error.response?.data?.message || 'Login failed.');
    }
  };


  const showReplyPage = (postID, commentID = null) => {
    setSelectedPostID(postID);
    setParentCommentID(commentID);
    setView('replyPage');
  };

  // function to forrmat timestamps
  const formatTimestamp = (postedDate) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now - new Date(postedDate)) / 1000);
    if (diffInSeconds < 60) return `${diffInSeconds} seconds ago`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minute(s) ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hour(s) ago`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} day(s) ago`;
    return `${Math.floor(diffInSeconds / 2592000)} month(s) ago`;
  };

  // function for showing view pages
  const showView = (viewName) => {
    setView(viewName);
    setSelectedPostID(null);
  };

  const showCommunity = (communityID) => {
    setCurrentCommunity(communityID);
    setView('communitySection');
  };

  const showPost = (postID) => {
    setSelectedPostID(postID);
    setView('postSection');
  };
  const handlePostClick = (postID) => {
    // increment view count locally for immediate feedback
    const updatedPosts = posts.map(post => {
      if (post._id === postID) {
        return { ...post, views: (post.views || 0) + 1 };
      }
      return post;
    });
    setPosts(updatedPosts);
  
    // increment view count in the backend
    axios
      .patch(`http://localhost:8000/posts/${postID}/views`)
      .catch((err) => console.error('Error incrementing post views:', err));
  
    // navigate to the post section
    setSelectedPostID(postID);
    setView('postSection');
  };
  

  const handleCommunityChange = async (communityID, action) => {
    try {
      // Update the community membership on the server
      const url = `http://localhost:8000/communities/${communityID}/${action}`;
      await axios.patch(url, { userID: currentUser._id });
  
      // Fetch updated communities
      const response = await axios.get('http://localhost:8000/communities');
      setCommunities(response.data); // Update state with refreshed data
    } catch (err) {
      console.error(`Error ${action} community:`, err);
    }
  };

  
  return (
    <div id="main" className="main-class">
      {/* Welcome, Register, and Login Pages */}
      {view === 'welcome' && <WelcomePage setView={setView} />}
      {view === 'register' && <RegisterPage registerUser={registerUser} setView={setView} />}
      {view === 'login' && <LoginPage loginUser={loginUser} setView={setView} />}
  
      {/* Header and Navbar - Shared Across Logged-In Views */}
      {(view !== 'welcome' && view !== 'register' && view !== 'login') && (
        <>
          <Header
            showView={setView}
            currentView={view}
            setSearchedPosts={setSearchedPosts}
            setSearchQuery={setSearchQuery}
            currentUser={currentUser}
            logout={logout}
          />
          <Navbar
            communities={communities}
            showCommunity={showCommunity}
            showview={setView}
            activeView={view}
            currentCommunity={currentCommunity}
            currentUser={currentUser}
            handleCommunityChange = {handleCommunityChange}
          />
        </>
      )}
  
      {/* Main Content Views */}
      <div id="front-page">
        {view === 'home' && <Home posts={posts} handlePostClick={handlePostClick}   currentUser={currentUser}  users = {users}// Pass currentUser as a prop
 />}
        {view === 'search' && (
          <SearchView
            matchingPosts={searchedPosts}
            showPost={showPost}
            localQuery={searchQuery}
            communities={communities}
            linkFlairs={linkFlairs}
            formatTimestamp={formatTimestamp}
            handlePostClick={handlePostClick}
          />
        )}
        {view === 'createPost' && (
          <CreatePost
            communities={communities}
            linkFlairs={linkFlairs}
            fetchData={fetchData}
            showHomePage={() => setView('home')}
            currentUser={currentUser}
          />
        )}
        {view === 'createCommunity' && (
          <CreateCommunity
            showCommunity={showCommunity}
            updateCommunityList={fetchData}
            currentUser={currentUser}
          />
        )}
        {view === 'communitySection' && (
          <CommunitySection
            communityID={currentCommunity}
            posts={posts}
            comments={comments}
            showPost={showPost}
            handlePostClick={handlePostClick}
            currentUser={currentUser}
            users = {users}
            handleCommunityChange = {handleCommunityChange}
          />
        )}
        {view === 'postSection' && (
          <PostSection
            postID={selectedPostID}
            posts={posts}
            comments={comments}
            communities={communities}
            showReplyPage={showReplyPage}
            currentUser={currentUser} // Pass currentUser here

            users = {users}
          />
        )}
        {view === 'replyPage' && (
          <NewReplyPage
            postID={selectedPostID}
            parentCommentID={parentCommentID}
            fetchData={fetchData}
            showPostSection={() => setView('postSection')}
            currentUser={currentUser}
          />
        )}
      </div>
    </div>
  );
  
}

export default App;
