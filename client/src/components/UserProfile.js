import React, { useState, useEffect } from 'react';
import axios from 'axios';

const UserProfile = ({ currentUser, 
  users,
  setCurrentUser,
  showView, 
  communities,
   posts,
   setCurrentCommunity, 
   updateCommunityList, 
   setCurrentPost, 
   updatePostList,
   adminOriginalUser,
   setAdminOriginalUser, 
   setCurrentComment }) => {
  const [listType, setListType] = useState('posts'); // Default listing
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [errors, setErrors] = useState({});
  //const [adminOriginalUser, setAdminOriginalUser] = useState(null);
  const [tempUser, setTempUser] = useState(null);

  useEffect(() => {
    fetchData();
  }, [listType]);

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const [commentsRes, postsRes, communitiesRes, usersRes] = await Promise.all([
        axios.get(`http://localhost:8000/users/${currentUser._id}/comments`),
        axios.get(`http://localhost:8000/users/${currentUser._id}/posts`),
        axios.get(`http://localhost:8000/users/${currentUser._id}/communities`),
        currentUser.isAdmin ? axios.get('http://localhost:8000/users') : Promise.resolve({ data: [] }),
      ]);
  
      if (listType === 'comments') setData(commentsRes.data);
      else if (listType === 'posts') setData(postsRes.data);
      else if (listType === 'communities') setData(communitiesRes.data);
      else if (listType === 'users') {
        // Exclude the admin from the list of users
        const filteredUsers = usersRes.data.filter((user) => user._id !== currentUser._id);
        setData(filteredUsers);
      }
    } catch (err) {
      setError('Error loading data');
    } finally {
      setLoading(false);
    }
  };
  

  const handleEditCommunity = (communityID) => {
    showView('createCommunity');
    const communityToEdit = communities.find((community) => community._id === communityID);
    if (communityToEdit) {
      setCurrentCommunity(communityToEdit);
    }
  };


  const handleEditPost = (postID) => {
    showView('createPost');
    const postToEdit = posts.find((post) => post._id === postID);
    if (postToEdit) {
      setCurrentPost(postToEdit);
    }
  };
  const deleteCommunity = async (communityID) => {
    try {
      const confirmDelete = window.confirm(
        'Deleting this community will also delete all its posts and comments. Are you sure?'
      );
      if (!confirmDelete) return;
  
      await axios.delete(`http://localhost:8000/communities/${communityID}`);
      alert('Community deleted successfully.');
      
      await updateCommunityList();
      await fetchData();
      // Refresh the data or navigate as needed
    } catch (err) {
      console.error('Error deleting community:', err);
      alert(
        err.response?.data?.error || 'An unexpected error occurred while deleting the community.'
      );
    }
  };
  
  
  const deletePost = async (postID) => {
    try {
      const confirmDelete = window.confirm(
        'Deleting this post will also delete all its comments. Are you sure?'
      );
      if (!confirmDelete) return;
  
      await axios.delete(`http://localhost:8000/posts/${postID}`);
      alert('Post deleted successfully.');
      await updatePostList()
      await fetchData();
      // Refresh the data or navigate as needed
    } catch (err) {
      console.error('Error deleting post:', err);
      alert('Failed to delete post.');
    }
  };
  
  const deleteComment = async (commentID) => {
    try {
      const confirmDelete = window.confirm(
        'Deleting this comment will also delete all its replies. Are you sure?'
      );
      if (!confirmDelete) return;
  
      await axios.delete(`http://localhost:8000/comments/${commentID}`);
      alert('Comment deleted successfully.');
      await fetchData();
      // Refresh the data or navigate as needed
    } catch (err) {
      console.error('Error deleting comment:', err);
      alert('Failed to delete comment.');
    }
  };


  
  const editComment = (commentID) => {
    showView('replyPage'); // Navigate to the CreateComment view
    const commentToEdit = data.find((comment) => comment._id === commentID); // Find the comment
    if (commentToEdit) {
      setCurrentComment(commentToEdit); // Pass the comment details to the edit form
    }
  };
  
  

  const handleAdminViewUser = (userID) => {
    const userToView = users.find((user) => user._id === userID);
    if (!userToView) {
      alert('User not found');
      return;
    }
  
    // Save the admin's profile and switch to the selected user's profile
    setAdminOriginalUser(currentUser);
    setCurrentUser(userToView); // Temporarily set to the selected user
    setListType('posts'); // Default to 'posts' view for the selected user
  };
  
  const handleBackToAdmin = () => {
    if (adminOriginalUser) {
      // Restore the admin's profile
      setCurrentUser(adminOriginalUser);
      setAdminOriginalUser(null);
      setListType('users'); // Default to 'users' view for the admin
    }
  };


  // delete a user
  const deleteUser = async (userID) => {
    try {
      const confirmDelete = window.confirm(
        'Deleting this user will also delete all their communities, posts, and comments. Are you sure?'
      );
      if (!confirmDelete) return;
  
      await axios.delete(`http://localhost:8000/users/${userID}`);
      alert('User and all associated data deleted successfully.');
  
      // Refresh the user list after deletion
      await fetchData();
      await updateCommunityList();
      fetchData();
    } catch (err) {
      console.error('Error deleting user:', err);
      alert(
        err.response?.data?.error || 'An unexpected error occurred while deleting the user.'
      );
    }
  };
  
  
  const renderList = () => {
    if (loading) return <p>Loading...</p>;
    if (error) return <p>{error}</p>;
    if (data.length === 0) return <p>No data available.</p>;
  
    return (
      <ul>
        {data.map((item) => (
          <li key={item._id}>
            {listType === 'posts' && (
              <>
                <a href="#" onClick={() => handleEditPost(item._id)}>
                  {item.title}
                </a>
                <button onClick={() => deletePost(item._id)}>Delete</button>
              </>
            )}
            {listType === 'communities' && (
              <>
                <a href="#" onClick={() => handleEditCommunity(item._id)}>
                  {item.name}
                </a>
                <button onClick={() => deleteCommunity(item._id)}>Delete</button>
              </>
            )}
            {listType === 'comments' && (
              <>
                <a href="#" onClick={() => editComment(item._id)}>
                  {item.content}
                </a>
                <button onClick={() => deleteComment(item._id)}>Delete</button>
              </>
            )}
            {listType === 'users' && (
              <>
                <a href="#" onClick={() => handleAdminViewUser(item._id)}>{item.displayName}</a>
                {currentUser.isAdmin && (
                  <button onClick={() => deleteUser(item._id)}>Delete</button>
                )}
              </>
            )}
          </li>
        ))}
      </ul>
    );
  };
  
  return (
    <div className="user-profile-page">
      <h1>{adminOriginalUser ? `Viewing Profile: ${currentUser.displayName}` : 'Admin Profile'}</h1>
      <p>Email: {currentUser.email}</p>
      <p>Display Name: {currentUser.displayName}</p>
      <p>Reputation: {currentUser.reputation}</p>
      <p>Member Since: {new Date(currentUser.createdDate).toLocaleDateString()}</p>
  
      {adminOriginalUser && (
        <button onClick={handleBackToAdmin}>Back to Admin</button>
      )}
  
      <div className="list-buttons">
        {currentUser.isAdmin && !adminOriginalUser && (
          <button onClick={() => setListType('users')}>Phreddit Users</button>
        )}
        <button onClick={() => setListType('posts')}>Posts</button>
        <button onClick={() => setListType('communities')}>Communities</button>
        <button onClick={() => setListType('comments')}>Comments</button>
      </div>
  
      {renderList()}
      <button onClick={() => showView('home')}>Back to Home</button>
    </div>
  );
  
};

export default UserProfile;
