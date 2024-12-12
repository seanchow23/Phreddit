import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../stylesheets/home.css';

function Home({ showView, handlePostClick, currentUser}) {
  const [posts, setPosts] = useState([]);
  const [communities, setCommunities] = useState([]);
  const [comments, setComments] = useState([]);
  const [linkFlairs, setLinkFlairs] = useState([]);
  const [sortedPosts, setSortedPosts] = useState([]);
  const [users, setUsers] = useState([]);

  // Fetch posts, communities, comments, and link flairs from the server on component mount
  useEffect(() => {
    fetchAllData();
  }, []);

  // Fetch data from the server
  const fetchAllData = async () => {
    try {
      const [postsRes, communitiesRes, commentsRes, linkFlairsRes, usersRes] = await Promise.all([
        axios.get('http://localhost:8000/posts'),
        axios.get('http://localhost:8000/communities'),
        axios.get('http://localhost:8000/comments'),
        axios.get('http://localhost:8000/linkflairs'),
        axios.get(`http://localhost:8000/users`),
      ]);

      setPosts(postsRes.data);
      console.log('fetched posts', posts);
      setCommunities(communitiesRes.data);
      setComments(commentsRes.data);
      setLinkFlairs(linkFlairsRes.data);
      setUsers(usersRes.data);


      const sortedByNewest = postsRes.data.sort((a, b) => new Date(b.postedDate) - new Date(a.postedDate));
    setSortedPosts(sortedByNewest);

      

    } catch (err) {
      console.error('Error fetching data:', err);
    }
  };
  

  // Format the timestamp for relative time display
  const formatTimestamp = (postedDate) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now - new Date(postedDate)) / 1000);
    if (diffInSeconds < 60) return `${diffInSeconds} seconds ago`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minute(s) ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hour(s) ago`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} day(s) ago`;
    return `${Math.floor(diffInSeconds / 2592000)} month(s) ago`;
  };

  // Sort posts by newest first
  const sortPostsByNewest = () => {
    const sorted = [...posts].sort((a, b) => new Date(b.postedDate) - new Date(a.postedDate));
    setSortedPosts(sorted);
  };

  // Sort posts by oldest first
  const sortPostsByOldest = () => {
    const sorted = [...posts].sort((a, b) => new Date(a.postedDate) - new Date(b.postedDate));
    setSortedPosts(sorted);
  };

  // Sort posts by most active (most recent comment date)
  const sortPostsByMostActive = () => {
    const sorted = [...posts].sort((a, b) => {
      const mostRecentCommentDateA = getMostRecentCommentDate(a);
      const mostRecentCommentDateB = getMostRecentCommentDate(b);
      return new Date(mostRecentCommentDateB) - new Date(mostRecentCommentDateA);
    });
    setSortedPosts(sorted);
  };

  const handleUpvote = async (postId) => {
    try {
      // Send upvote request to the backend
      const response = await axios.patch(
        `http://localhost:8000/posts/${postId}/upvote`
,        { userID: currentUser._id } // Include the voter ID

      );
      const updatedPost = response.data;

      console.log('final stuff', updatedPost);
  
      // Update the posts state with the updated post
      setPosts((prevPosts) =>
        prevPosts.map((post) => (post._id === postId ? updatedPost : post))
      );
  
      // Update the sortedPosts state to reflect the updated vote count
      setSortedPosts((prevSortedPosts) =>
        prevSortedPosts.map((post) => (post._id === postId ? updatedPost : post))
      );
    } catch (error) {

      if (error.response?.status === 403) {
        // Directly alert the user
        alert(error.response.data.error || 'Your reputation is too low to upvote.');
      }
      console.error('Error upvoting post:', error.response?.data || error.message);
      //alert('Failed to upvote the post.');
    }
  };
  
  const handleDownvote = async (postId) => {
    try {
      // Send downvote request to the backend
      const response = await axios.patch(`http://localhost:8000/posts/${postId}/downvote`,
        { userID: currentUser._id } // Include the voter ID

      );
      const updatedPost = response.data;
  
      // Update the posts state with the updated post
      setPosts((prevPosts) =>
        prevPosts.map((post) => (post._id === postId ? updatedPost : post))
      );
  
      // Update the sortedPosts state to reflect the updated vote count
      setSortedPosts((prevSortedPosts) =>
        prevSortedPosts.map((post) => (post._id === postId ? updatedPost : post))
      );
    } catch (error) {
      
      if (error.response?.status === 403) {
        // Directly alert the user
        alert(error.response.data.error || 'Your reputation is too low to upvote.');
      }
      console.error('Error downvoting post:', error.response?.data || error.message);
    }
  };
  

  // Helper function to get the most recent comment date for a post
  const getMostRecentCommentDate = (post) => {
    if (post.commentIDs.length === 0) return new Date(0);
    const postComments = post.commentIDs.map(commentID =>
      comments.find(comment => comment._id === commentID)
    );
    const mostRecentComment = postComments.sort((a, b) => new Date(b.commentedDate) - new Date(a.commentedDate))[0];
    return mostRecentComment ? mostRecentComment.commentedDate : new Date(0);
  };

  // Helper function to count comments and replies recursively
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

  return (
    <div id="front-page">
      <div id="header-section">
        <div id="title-container">
          <h1 id="header-title">All Posts</h1>
          <p id="post-count">{sortedPosts.length} Posts</p>
        </div>

        <div id="button-container">
          <button className="sort-button" onClick={sortPostsByNewest}>Newest</button>
          <button className="sort-button" onClick={sortPostsByOldest}>Oldest</button>
          <button className="sort-button" onClick={sortPostsByMostActive}>Active</button>
        </div>
      </div>

      <div className="divider" />

      {/* Post list - posts displayed in a grid */}
      <div className="post-list">
        {sortedPosts.length > 0 ? (
          sortedPosts.map(post => {
            const community = communities.find(c => c.postIDs.includes(post._id)) || { name: 'Unknown' }; 
            const truncatedContent = post.content.substring(0, 80) + '...';
            const flair = post.linkFlairID 
              ? linkFlairs.find(l => l._id === post.linkFlairID)?.content || '' 
              : '';

            const creator = post.postedBy
            ? users.find(u => u._id === post.postedBy)?.displayName || '' 
            : '';
            // Get total comments including replies
            const totalComments = countCommentsAndReplies(post.commentIDs);
            

            return (
              <div key={post._id} id="post-item" onClick={() => handlePostClick(post._id)}>
                <div className="post-meta">
                  <span className="community-name">r/{community.name}</span>
                  <span className="separator"> | </span>
                  <span className="post-creator">Posted by {creator}</span>
                  <span className="separator"> | </span>
                  Posted by {creator} (Reputation: {users.find(u => u._id === post.postedBy)?.reputation || 0})

                  <span className="post-timestamp">{formatTimestamp(post.postedDate)}</span>
                </div>

                <h2 className="post-title">{post.title}</h2>
                {flair && <p className="post-flair"> {flair}</p>}
                <p className="post-content">{truncatedContent}</p>
                <div className="post-stats">
                  <span className="post-views">Views: {post.views || 0}</span>
                  <span className="separator"> | </span>
                  <span className="post-comments">Comments: {totalComments}</span>
                  <div className="post-stats">
                  <button
    className={`vote-button upvote-button ${!currentUser ? 'disabled' : ''}`}
    onClick={(e) => {
      e.stopPropagation(); // Prevent post click event
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
  <span className="vote-count">{post.voteCount || 0}</span>
  <button
    className={`vote-button downvote-button ${!currentUser ? 'disabled' : ''}`}
    onClick={(e) => {
      e.stopPropagation(); // Prevent post click event
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
            );
          })
        ) : (
          <p>No posts available</p>
        )}
      </div>
      <div id="empty-container"></div> 
    </div>
  );
}
//removing the empty container causes the bottom to cut off
export default Home;