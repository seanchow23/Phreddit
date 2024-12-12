import React, { useState, useEffect } from 'react';
import '../stylesheets/SearchView.css';
import axios from 'axios';

function SearchView({
  matchingPosts,
  localQuery,
  linkFlairs,
  communities,
  formatTimestamp,
  handlePostClick,
  currentUser,
  users,
}) {
  const [sortedPosts, setSortedPosts] = useState([]);

  useEffect(() => {
    categorizeAndSortPosts();
  }, [matchingPosts, currentUser]);

  // Categorize and prioritize posts
  const categorizeAndSortPosts = () => {
    if (!matchingPosts || matchingPosts.length === 0) {
      setSortedPosts([]);
      return;
    }

    // Find community IDs the user is part of
    const joinedCommunityIds = currentUser
      ? communities
          .filter((community) => community.members.includes(currentUser._id))
          .map((community) => community._id)
      : [];

    // Separate posts into joined and unjoined
    const joinedCommunityPosts = matchingPosts.filter((post) =>
      communities.some(
        (community) =>
          community.postIDs.includes(post._id) && joinedCommunityIds.includes(community._id)
      )
    );

    console.log('joined comms',joinedCommunityPosts);

    const unjoinedCommunityPosts = matchingPosts.filter((post) =>
      !communities.some(
        (community) =>
          community.postIDs.includes(post._id) && joinedCommunityIds.includes(community._id)
      )
    );

    // Combine posts: joined first, then unjoined
    const prioritizedPosts = [
      ...joinedCommunityPosts,
      ...unjoinedCommunityPosts,
    ];

    setSortedPosts(prioritizedPosts);
  };

  // Handle upvote
  const handleUpvote = async (postId) => {
    try {
      const response = await axios.patch(
        `http://localhost:8000/posts/${postId}/upvote`,
        { userID: currentUser._id }
      );
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
      const response = await axios.patch(
        `http://localhost:8000/posts/${postId}/downvote`,
        { userID: currentUser._id }
      );
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
      {matchingPosts && matchingPosts.length > 0 ? (
        <h2>Search Results For: "{localQuery}"</h2>
      ) : (
        <h2>No posts found for "{localQuery}"</h2>
      )}

      <h3>Post count: {sortedPosts.length}</h3>

      {sortedPosts.length > 0 && (
        <div className="post-list">
          {sortedPosts.map((post) => {
            const community = communities.find((c) => c.postIDs.includes(post._id)) || {
              name: 'Unknown',
            };
            const truncatedContent = post.content.substring(0, 80) + '...';
            const creator = post.postedBy
              ? users.find((u) => u._id === post.postedBy)?.displayName || 'Unknown User'
              : 'Unknown User';
            const flair = post.linkFlairID
              ? linkFlairs.find((l) => l._id === post.linkFlairID)?.content || ''
              : '';

            return (
              <div key={post._id} id="post-item" onClick={() => handlePostClick(post._id)}>
                <div className="post-meta">
                  <span className="community-name">r/{community.name}</span>
                  <span className="separator"> | </span>
                  <span className="post-creator">Posted by {creator}</span>
                  <span className="separator"> | </span>
                  <span className="post-timestamp">{formatTimestamp(post.postedDate)}</span>
                </div>

                <h2 className="post-title">{post.title}</h2>
                {flair && <p className="post-flair">{flair}</p>}
                <p className="post-content">{truncatedContent}</p>
                <div className="post-stats">
                  <span className="post-views">Views: {post.views || 0}</span>
                  <span className="separator"> | </span>
                  <span className="post-comments">Comments: {post.commentIDs.length}</span>
                  <span className="separator"> | </span>
                  <span className="vote-count">{post.voteCount || 0} votes</span>
                </div>

                <div className="vote-section">
                  <button
                    className={`vote-button upvote-button ${!currentUser ? 'disabled' : ''}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (currentUser) {
                        handleUpvote(post._id);
                      } else {
                        alert('You must be logged in to upvote.');
                      }
                    }}
                    disabled={!currentUser}
                  >
                    ▲
                  </button>

                  <button
                    className={`vote-button downvote-button ${!currentUser ? 'disabled' : ''}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (currentUser) {
                        handleDownvote(post._id);
                      } else {
                        alert('You must be logged in to downvote.');
                      }
                    }}
                    disabled={!currentUser}
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
