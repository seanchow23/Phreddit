import React, { useEffect, useState } from 'react';
import axios from 'axios';
import NewReplyPage from './NewReplyPage';

const PostSection = ({ postID, showPostSection, communities, showReplyPage , users}) => {
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [isReplying, setIsReplying] = useState(false);
  const [linkFlair, setLinkFlair] = useState('');
  const [parentCommentID, setParentCommentID] = useState(null);
  const [communityName, setCommunityName] = useState('');
  const [postCreator, setPostCreator] = useState('');


  // Fetch post and comments data from the server
  useEffect(() => {
    fetchPostData();
  }, [postID]);

  const fetchPostData = async () => {
    console.log("Fetching post with ID:", postID);
    try {
        const postResponse = await axios.get(`http://localhost:8000/posts/${postID}`);
        const fetchedPost = postResponse.data;
        setPost(fetchedPost);
        console.log("Fetched post:", fetchedPost);

        // Fetch the community name
        const community = communities.find(c => c.postIDs.includes(postID));
        setCommunityName(community ? community.name : 'Unknown');

        // Fetch link flair if it exists
        if (fetchedPost.linkFlairID) {
            const flairResponse = await axios.get(`http://localhost:8000/linkflairs`);
            const matchedFlair = flairResponse.data.find(flair => flair._id === fetchedPost.linkFlairID);
            if (matchedFlair) setLinkFlair(matchedFlair.content);
        }

        // Fetch the post creator's display name
        const userResponse = await axios.get(`http://localhost:8000/users/${fetchedPost.postedBy}`);
        setPostCreator(userResponse.data.displayName);
    } catch (err) {
        console.error('Error fetching post or related data', err);
    }

    console.log("Fetching comments for post:", postID);
    try {
        const commentsResponse = await axios.get(`http://localhost:8000/comments/${postID}`);
        setComments(commentsResponse.data);
    } catch (err) {
        console.error('Error fetching comments:', err);
    }
};


  // Helper function to render comments recursively
  const renderComments = (commentIDs) => {
    if (!commentIDs || commentIDs.length === 0) return null;

    return (
      <ul>
        {commentIDs.map(commentID => {
          const comment = comments.find(c => c._id === commentID);
          if (!comment) return null;

          // Find the user's displayName from the `users` array
          const user = users.find(u => u._id === comment.commentedBy);
          const commentCreator = user ? user.displayName : 'Unknown User';
          
          return (
            <li key={comment._id}>
              <div>
                <strong>{commentCreator}</strong> ({formatTimestamp(comment.commentedDate)}):<br />
                {comment.content}
              </div>
              {/* Reply Button */}
              <button onClick={() => showReplyPage(postID, comment._id)}>Reply</button>

              {/* Render replies for this comment */}
              {renderComments(comment.commentIDs)}
            </li>
          );
        })}
      </ul>
    );
  };

  if (!post) {
    return <div>Loading post...</div>;
  }

  return (
    <div id="post-section">
      <div className="post-container">
        {/* Post Header */}
        <div className="post-header">
          <div className="post-meta">
            <span className="community-name">r/{communityName}</span>
            <span className="separator"> | </span>
            <span className="post-timestamp">{formatTimestamp(post.postedDate)}</span>
          </div>

          <p className="post-creator">Posted by {postCreator}</p>

          <h1 className="post-title">{post.title}</h1>

          {/* Link Flair */}
          {linkFlair && <p className="post-flair">{linkFlair}</p>}
        </div>

        {/* Post Content */}
        <div className="post-body">
          <p className="post-content">{post.content}</p>
        </div>

        {/* Reply to Post Button */}
        <button onClick={() => showReplyPage(postID)}>Reply to Post</button>

        {/* Comments Section */}
        {renderComments(post.commentIDs)}
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
