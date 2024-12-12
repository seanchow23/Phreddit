import React, { useEffect, useState } from 'react';
import axios from 'axios';
import NewReplyPage from './NewReplyPage';
import '../stylesheets/postview.css';

const PostSection = ({ postID, showPostSection, communities, showReplyPage   ,currentUser, users // Pass currentUser here
}) => {
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [isReplying, setIsReplying] = useState(false);
  const [linkFlair, setLinkFlair] = useState('');
  const [parentCommentID, setParentCommentID] = useState(null);
  const [communityName, setCommunityName] = useState('');
  //const [postCreator, setPostCreator] = useState('');



  // Fetch post and comments data from the server
  useEffect(() => {
    fetchPostData();
  }, [postID]);

  

  const handleUpvote = async (postId) => {
  try {
    const response = await axios.patch(`http://localhost:8000/posts/${postId}/upvote`,     { userID: currentUser._id,} // Pass the current user's ID
    );
    
    setPost(response.data); // Update the post state with the updated vote count
  } catch (error) {
    console.error('Error upvoting post:', error.response?.data || error.message);


    if (error.response?.status === 403) {
      // Directly alert the user
      alert(error.response.data.error || 'Your reputation is too low to upvote.');
    }
  }
};

const handleDownvote = async (postId) => {
  try {
    const response = await axios.patch(`http://localhost:8000/posts/${postId}/downvote`,
      { userID: currentUser._id } // Include the voter ID

    );    setPost(response.data); // Update the post state with the updated vote count
  } catch (error) {
    console.error('Error downvoting post:', error.response?.data || error.message);

    if (error.response?.status === 403) {
      // Directly alert the user
      alert(error.response.data.error || 'Your reputation is too low to upvote.');
    }  }
};

const countCommentsAndReplies = (commentIDs) => {
  let totalComments = 0;
  commentIDs.forEach(commentID => {
    const comment = comments.find(c => c._id === commentID);
    if (comment) {
      totalComments++;
      if (comment.commentIDs && comment.commentIDs.length > 0) {
        totalComments += countCommentsAndReplies(comment.commentIDs);
      }
    }
  });
  return totalComments;
};

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
        //const userResponse = await axios.get(`http://localhost:8000/users/${fetchedPost.postedBy}`);
        //console.log(userResponse.data.displayName);
        //setPostCreator(userResponse.data.displayName);
    } catch (err) {
        console.error('Error fetching post or related data', err);
    }

    console.log("Fetching comments for post:", postID);
    try {
        const commentsResponse = await axios.get(`http://localhost:8000/comments/${postID}`);
        setComments(commentsResponse.data);


        const totalComments = countCommentsAndReplies(commentsResponse.data.map(c => c._id));
    setPost(prev => ({ ...prev, totalComments })); // Add totalComments to the post state
  }
     catch (err) {
        console.error('Error fetching comments:', err);
    }
};






  const handleCommentUpvote = async (commentID) => {
    try {
      const response = await axios.patch(`http://localhost:8000/comments/${commentID}/upvote`, { userID: currentUser._id } , console.log('Sending userID:', currentUser._id));

      setComments((prevComments) =>
        prevComments.map((comment) => (comment._id === commentID ? response.data : comment))
      );
    } catch (error) {
      console.error('Error upvoting comment:', error.response?.data || error.message);
      if (error.response?.status === 403) {
        alert(error.response.data.error || 'Your reputation is too low to upvote.');
      }
    }
    
  };

  const handleCommentDownvote = async (commentID) => {
    try {
      const response = await axios.patch(`http://localhost:8000/comments/${commentID}/downvote`, { userID: currentUser._id } // Pass the current user's ID
      );
      setComments((prevComments) =>
        prevComments.map((comment) => (comment._id === commentID ? response.data : comment))
      );
    } catch (error) {
      if (error.response?.status === 403) {
        alert(error.response.data.error || 'Your reputation is too low to downvote.');
      }
      console.error('Error downvoting comment:', error.response?.data || error.message);
    }
  };

  const handleNewComment = async (newComment) => {
    setComments(prevComments => [...prevComments, newComment]);
    const totalComments = countCommentsAndReplies([...comments.map(c => c._id), newComment._id]);
    setPost(prev => ({ ...prev, totalComments }));
  };

  

  const renderComments = (commentIDs) => {
    if (!commentIDs || commentIDs.length === 0) return null;
  
    return (
      <ul>
        {commentIDs.map((commentID) => {
          const comment = comments.find((c) => c._id === commentID);
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
              <button onClick={() => showReplyPage(postID, comment._id)}>Reply</button>
              <div className="comment-stats">
                <button
                  className={`vote-button upvote-button ${!currentUser ? 'disabled' : ''}`}
                  onClick={() => handleCommentUpvote(comment._id)}
                  disabled={!currentUser}
                >
                  ▲
                </button>
                <span className="vote-count">{`${comment.voteCount || 0} votes`}</span>
                <button
                  className={`vote-button downvote-button ${!currentUser ? 'disabled' : ''}`}
                  onClick={() => handleCommentDownvote(comment._id)}
                  disabled={!currentUser}
                >
                  ▼
                </button>
              </div>
              {renderComments(comment.commentIDs)} {/* Render nested comments */}
            </li>
          );
        })}
      </ul>
    );
  };
  



  if (!post) {
    return <div>Loading post...</div>;
  }
  const creator = post.postedBy._id
            ? users.find(u => u._id === post.postedBy._id)?.displayName || '' 
            : '';
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

          <p className="post-creator">Posted by {creator}</p>

          <h1 className="post-title">{post.title}</h1>

          {/* Link Flair */}
          {linkFlair && <p className="post-flair">{linkFlair}</p>}
        </div>

        {/* Post Content */}
        <div className="post-body">
          <p className="post-content">{post.content}</p>
        </div>

        <div className="post-actions">

        {/* Reply to Post Button */}
        <button onClick={() => showReplyPage(postID)}>Reply to Post</button>

        <span className="post-views">Views: {post.views || 0}</span>
        <span className="post-comments">Comments: {post.totalComments}</span>



        {/* Comments Section */}

        <div className="post-stats">
    <button
      className={`vote-button upvote-button ${!currentUser ? 'disabled' : ''}`}
      onClick={() => {
        if (currentUser) {
          handleUpvote(post._id);
        } else {
          alert('You must be logged in to upvote.');
        }
      }}
      disabled={!currentUser} // Disable button for guests
    >
      ▲
    </button>
    <span className="vote-count">{`${post.voteCount || 0} votes`}</span>
    <button
      className={`vote-button downvote-button ${!currentUser ? 'disabled' : ''}`}
      onClick={() => {
        if (currentUser) {
          handleDownvote(post._id);
        } else {
          alert('You must be logged in to downvote.');
        }
      }}
      disabled={!currentUser} // Disable button for guests
    >
      ▼
    </button>
    </div>


  </div>
</div>
{renderComments(post.commentIDs)}

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
