import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../stylesheets/communitySection.css';

const CommunitySection = ({ communityID, handlePostClick }) => {
  const [community, setCommunity] = useState(null);
  const [posts, setPosts] = useState([]);
  const [comments, setComments] = useState([]);
  const [linkFlairs, setLinkFlairs] = useState([]);
  const [sortOption, setSortOption] = useState('newest');

  // Fetch community data on component mount
  useEffect(() => {
    fetchCommunityData();
    fetchLinkFlairs();
  }, [communityID]);

  // Fetch community and posts data
  const fetchCommunityData = async () => {
    try {
      // Fetch the community details
      const communityResponse = await axios.get(`http://localhost:8000/communities/${communityID}`);
      setCommunity(communityResponse.data);

      // Fetch posts for this community
      const postsResponse = await axios.get(`http://localhost:8000/communities/${communityID}/posts`);
      setPosts(postsResponse.data);

      // Fetch comments for each post
      const allComments = await fetchCommentsForPosts(postsResponse.data);
      setComments(allComments);
    } catch (err) {
      console.error("Error fetching community or posts:", err);
    }
  };

  // Fetch link flairs
  const fetchLinkFlairs = async () => {
    try {
      const flairsResponse = await axios.get('http://localhost:8000/linkflairs');
      setLinkFlairs(flairsResponse.data);
    } catch (err) {
      console.error("Error fetching link flairs:", err);
    }
  };

  // Fetch comments for each post in the community
  const fetchCommentsForPosts = async (posts) => {
    let allComments = [];
    for (const post of posts) {
      try {
        const commentsResponse = await axios.get(`http://localhost:8000/comments/${post._id}`);
        allComments = [...allComments, ...commentsResponse.data];
      } catch (err) {
        console.error(`Error fetching comments for post ${post._id}:`, err);
      }
    }
    return allComments;
  };

  // Helper function to sort posts
  const getSortedPosts = () => {
    switch (sortOption) {
      case 'newest':
        return [...posts].sort((a, b) => new Date(b.postedDate) - new Date(a.postedDate));
      case 'oldest':
        return [...posts].sort((a, b) => new Date(a.postedDate) - new Date(b.postedDate));
      case 'active':
        return [...posts].sort((a, b) => {
          const mostRecentCommentDateA = getMostRecentCommentDate(a);
          const mostRecentCommentDateB = getMostRecentCommentDate(b);
          return new Date(mostRecentCommentDateB) - new Date(mostRecentCommentDateA);
        });
      default:
        return posts;
    }
  };

  // Helper function to get the most recent comment date for a post
  const getMostRecentCommentDate = (post) => {
    const postComments = comments.filter(comment => comment.postID === post._id);
    if (postComments.length === 0) return new Date(0);

    const mostRecentComment = postComments.sort((a, b) => new Date(b.commentedDate) - new Date(a.commentedDate))[0];
    return mostRecentComment ? mostRecentComment.commentedDate : new Date(0);
  };

  if (!community) return <div>Loading community...</div>;

  const sortedPosts = getSortedPosts();

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
    <div id="community-page">
      {/* Community Header */}
      <div id="community-header-section">
        <div id="community-header">
          <h1 id="community-name">r/{community.name}</h1>
          {/* Sort Buttons */}
          <div id="button-container">
            <button className="sort-button" onClick={() => setSortOption('newest')}>Newest</button>
            <button className="sort-button" onClick={() => setSortOption('oldest')}>Oldest</button>
            <button className="sort-button" onClick={() => setSortOption('active')}>Active</button>
          </div>
        </div>
        <p id="community-description">{community.description}</p>
        <p id="community-age">Created {formatTimestamp(community.startDate)}</p>
        <p id="community-info">
          <span>{sortedPosts.length} Posts</span> | <span>{community.memberCount || 0} Members</span>
        </p>
      </div>

      <div className="divider" />

      {/* List of Posts in Community */}
      <div className="post-list">
        {sortedPosts.map(post => {
          const truncatedContent = post.content.substring(0, 80) + '...';

          // Fetch the link flair content based on the post's linkFlairID
          const flair = post.linkFlairID
            ? linkFlairs.find(flair => flair._id === post.linkFlairID)?.content || ''
            : '';

            // Get total comments including replies
            const totalComments = countCommentsAndReplies(post.commentIDs);

          return (
            <div key={post._id} className="post-item" onClick={() => handlePostClick(post._id)}>
              <div className="post-meta">
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
                <span className="post-comments">
                  Comments: {totalComments}
                </span>
              </div>
            </div>
          );
        })}
      </div>
      <div id="empty-container"></div>
    </div>
  );
};
//removing the empty container causes the posts to be cut off


// Helper function to format timestamps
const formatTimestamp = (timestamp) => {
  const now = new Date();
  const diffInSeconds = Math.floor((now - new Date(timestamp)) / 1000);
  if (diffInSeconds < 60) return `${diffInSeconds} seconds ago`;
  else if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  else if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  else if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} days ago`;
  else if (diffInSeconds < 31536000) return `${Math.floor(diffInSeconds / 2592000)} months ago`;
  return `${Math.floor(diffInSeconds / 31536000)} years ago`;
};


export default CommunitySection;
//take care of handlepostclick