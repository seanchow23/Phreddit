import React, { useState, useEffect } from 'react';
import '../stylesheets/SearchView.css';
import axios from 'axios';

function SearchView({ matchingPosts, showPost, localQuery, linkFlairs, communities, formatTimestamp, handlePostClick, currentUser }) {
  const [sortedPosts, setSortedPosts] = useState([]);

  // Initialize sortedPosts in "newest" order by default when matchingPosts changes
  useEffect(() => {
    const sortedByNewest = [...matchingPosts].sort((a, b) => new Date(b.postedDate) - new Date(a.postedDate));
    setSortedPosts(sortedByNewest);
  }, [matchingPosts]);

  // Sort posts by newest first
  const sortPostsByNewest = () => {
    const sorted = [...sortedPosts].sort((a, b) => new Date(b.postedDate) - new Date(a.postedDate));
    setSortedPosts(sorted);
  };

  // Sort posts by oldest first
  const sortPostsByOldest = () => {
    const sorted = [...sortedPosts].sort((a, b) => new Date(a.postedDate) - new Date(b.postedDate));
    setSortedPosts(sorted);
  };

  // Sort posts by most active (most recent comment date)
  const sortPostsByMostActive = () => {
    const sorted = [...sortedPosts].sort((a, b) => {
      const mostRecentCommentDateA = getMostRecentCommentDate(a);
      const mostRecentCommentDateB = getMostRecentCommentDate(b);
      return new Date(mostRecentCommentDateB) - new Date(mostRecentCommentDateA);
    });
    setSortedPosts(sorted);
  };

  // Helper function to get the most recent comment date for a post
  const getMostRecentCommentDate = (post) => {
    if (!post.commentIDs.length) return new Date(0);
    const postComments = post.commentIDs.map((commentID) =>
      communities.find((comment) => comment._id === commentID)
    );
    const mostRecentComment = postComments.sort((a, b) => new Date(b.commentedDate) - new Date(a.commentedDate))[0];
    return mostRecentComment ? mostRecentComment.commentedDate : new Date(0);
  };

  // Handle upvote
  const handleUpvote = async (postId) => {
    try {
      const response = await axios.patch(`http://localhost:8000/posts/${postId}/upvote`);
      const updatedPost = response.data;

      // Update sortedPosts with the updated post
      setSortedPosts((prevPosts) =>
        prevPosts.map((post) => (post._id === postId ? updatedPost : post))
      );
    } catch (error) {
      console.error('Error upvoting post:', error.response?.data || error.message);
      alert('Failed to upvote the post.');
    }
  };

  // Handle downvote
  const handleDownvote = async (postId) => {
    try {
      const response = await axios.patch(`http://localhost:8000/posts/${postId}/downvote`);
      const updatedPost = response.data;

      // Update sortedPosts with the updated post
      setSortedPosts((prevPosts) =>
        prevPosts.map((post) => (post._id === postId ? updatedPost : post))
      );
    } catch (error) {
      console.error('Error downvoting post:', error.response?.data || error.message);
      alert('Failed to downvote the post.');
    }
  };

  return (
    <div id="search-view">
      {/* Conditionally render based on whether matching posts are found */}
      {matchingPosts && matchingPosts.length > 0 ? (
        <h2>Search Results For: "{localQuery}"</h2>
      ) : (
        <h2>No posts found for "{localQuery}"</h2>
      )}

      <h3>Post count: {sortedPosts.length}</h3>

      {/* Sort buttons */}
      <div id="button-container" className="align-right">
        <button className="sort-button" onClick={sortPostsByNewest}>Newest</button>
        <button className="sort-button" onClick={sortPostsByOldest}>Oldest</button>
        <button className="sort-button" onClick={sortPostsByMostActive}>Active</button>
      </div>

      {sortedPosts.length > 0 && (
        <div className="post-list">
          {sortedPosts.map((post) => {
            const community = communities.find((c) => c.postIDs.includes(post._id)) || { name: 'Unknown' };
            const truncatedContent = post.content.substring(0, 80) + '...';
            const flair = post.linkFlairID
              ? linkFlairs.find((l) => l._id === post.linkFlairID)?.content || ''
              : '';

            // Count total comments, including replies
            const totalComments = post.commentIDs.length;

            return (
              <div key={post._id} id="post-item" onClick={() => handlePostClick(post._id)}>
                <div className="post-meta">
                  <span className="community-name">r/{community.name}</span>
                  <span className="separator"> | </span>
                  <span className="post-creator">Posted by {post.postedBy}</span>
                  <span className="separator"> | </span>
                  <span className="post-timestamp">{formatTimestamp(post.postedDate)}</span>
                </div>

                <h2 className="post-title">{post.title}</h2>
                {flair && <p className="post-flair">{flair}</p>}
                <p className="post-content">{truncatedContent}</p>
                <div className="post-stats">
                  <span className="post-views">Views: {post.views || 0}</span>
                  <span className="separator"> | </span>
                  <span className="post-comments">Comments: {totalComments}</span>
                </div>

                {/* Upvote/Downvote Section */}
                <div className="vote-section">
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
            );
          })}
        </div>
      )}
    </div>
  );
}

export default SearchView;
