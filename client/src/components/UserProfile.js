import React, { useState, useEffect } from 'react';
import axios from 'axios';

const UserProfile = ({ currentUser, showView, communities, setCurrentCommunity, updateCommunityList }) => {
  const [listType, setListType] = useState('posts'); // Default listing
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchData();
  }, [listType]);

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      if (listType === 'posts') {
        const response = await axios.get(`http://localhost:8000/users/${currentUser._id}/posts`);
        setData(response.data);
      } else if (listType === 'communities') {
        const response = await axios.get(`http://localhost:8000/users/${currentUser._id}/communities`);
        setData(response.data);
      } else if (listType === 'comments') {
        const response = await axios.get(`http://localhost:8000/users/${currentUser._id}/comments`);
        setData(response.data);
      } else if (listType === 'users' && currentUser.isAdmin) {
        const response = await axios.get(`http://localhost:8000/users`);
        setData(response.data);
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

  const deleteCommunity = async (communityID) => {
    try {
      const confirmDelete = window.confirm(
        'Deleting this community will also delete all its posts and comments. Are you sure?'
      );
      if (!confirmDelete) return;
  
      await axios.delete(`http://localhost:8000/communities/${communityID}`);
      alert('Community deleted successfully.');
      fetchData();
      await updateCommunityList();
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
      fetchData();
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
      fetchData();
      // Refresh the data or navigate as needed
    } catch (err) {
      console.error('Error deleting comment:', err);
      alert('Failed to delete comment.');
    }
  };
  

  const renderList = () => {
    if (loading) return <p>Loading...</p>;
    if (error) return <p>{error}</p>;
    if (data.length === 0) return <p>No data available.</p>;

    return (
      <ul>
        {data.map(item => (
          <li key={item._id}>
            {listType === 'posts' && (
              <>
                <a
                  href="#"
                  onClick={() => {
                    showView('createPost');
                  }}
                >
                  {item.title}
                </a>
                <button onClick={() => deletePost(item._id)}>Delete</button>
              </>
            )}
            {listType === 'communities' && (
              <>
                <a
                  href="#"
                  onClick={() => handleEditCommunity(item._id)}
                >
                  {item.name}
                </a>
                <button onClick={() => deleteCommunity(item._id)}>Delete</button>
              </>
            )}
            {listType === 'comments' && (
              <>
                <a
                  href="#"
                  onClick={() => {
                    showView('replyPage');
                  }}
                >
                  {item.content}
                </a>
                <button onClick={() => deleteComment(item._id)}>Delete</button>
              </>
            )}
            {listType === 'users' && (
              <>
                <span>{item.displayName}</span>
                {currentUser.isAdmin && (
                  <button onClick={() => deleteComment(item._id, 'users')}>Delete</button>
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
      <h1>{currentUser.isAdmin ? 'Admin Profile' : 'User Profile'}</h1>
      <p>Email: {currentUser.email}</p>
      <p>Display Name: {currentUser.displayName}</p>
      <p>Reputation: {currentUser.reputation}</p>
      <p>Member Since: {new Date(currentUser.createdDate).toLocaleDateString()}</p>

      <div className="list-buttons">
        {currentUser.isAdmin && (
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
