import React, { useEffect, useState } from 'react';
import axios from 'axios';
import NewReplyPage from './NewReplyPage';

const PostSection = ({ postID, showPostSection, communities, showReplyPage, currentUser }) => {
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [communityName, setCommunityName] = useState('');

  useEffect(() => {
    fetchPostData();
  }, [postID]);

  const fetchPostData = async () => {
    try {
      const postResponse = await axios.get(`http://localhost:8000/posts/${postID}`);
      setPost(postResponse.data);

      const community = communities.find(c => c.postIDs.includes(postID));
      setCommunityName(community ? community.name : 'Unknown');
    } catch (err) {
      console.error('Error fetching post:', err);
    }
  };

  const handleUpvote = async (postId) => {
    try {
      const response = await axios.patch(`http://localhost:8000/posts/${postId}/upvote`);
      setPost(response.data);
    } catch (error) {
      console.error('Error upvoting post:', error);
    }
  };

  const handleDownvote = async (postId) => {
    try {
      const response = await axios.patch(`http://localhost:8000/posts/${postId}/downvote`);
      setPost(response.data);
    } catch (error) {
      console.error('Error downvoting post:', error);
    }
  };

  if (!post) {
    return <div>Loading post...</div>;
  }

  return (
    <div id="post-section">
      <div className="post-container">
        <div className="post-header">
          <span className="community-name">r/{communityName}</span>
          <h1>{post.title}</h1>
        </div>

        <div className="post-body">{post.content}</div>

        <div className="post-stats">
          <button
            className={`vote-button upvote-button ${!currentUser ? 'disabled' : ''}`}
            onClick={() => {
              if (currentUser) handleUpvote(post._id);
              else alert('You must be logged in to upvote.');
            }}
            disabled={!currentUser}
          >
            ▲
          </button>
          <span>{post.voteCount || 0}</span>
          <button
            className={`vote-button downvote-button ${!currentUser ? 'disabled' : ''}`}
            onClick={() => {
              if (currentUser) handleDownvote(post._id);
              else alert('You must be logged in to downvote.');
            }}
            disabled={!currentUser}
          >
            ▼
          </button>
        </div>
      </div>
    </div>
  );
};

// Helper function to format timestamps
const formatTimestamp = (postedDate) => {
  const now = new Date();
  const diffInSeconds = Math.floor((now - new Date(postedDate)) / 1000);
  if (diffInSeconds < 60) return `${diffInSeconds} seconds ago`;
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} days ago`;
  return `${Math.floor(diffInSeconds / 2592000)} months ago`;
};

export default PostSection;
