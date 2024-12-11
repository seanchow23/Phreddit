import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../stylesheets/communitySection.css';

const CommunitySection = ({ communityID, handlePostClick, currentUser, users, handleCommunityChange }) => {
  const [community, setCommunity] = useState(null);
  const [posts, setPosts] = useState([]);
  const [comments, setComments] = useState([]);
  const [linkFlairs, setLinkFlairs] = useState([]);
  const [creatorName, setCreatorName] = useState('');
  const [sortOption, setSortOption] = useState('newest');

  useEffect(() => {
    fetchCommunityData();
    fetchLinkFlairs();
  }, [communityID]);

  const fetchCommunityData = async () => {
    try {
        // Fetch the community details
        const communityResponse = await axios.get(`http://localhost:8000/communities/${communityID}`);
        const fetchedCommunity = communityResponse.data;
        setCommunity(fetchedCommunity);

        // Find the creator's display name from the users
        const creator = users.find(user => user._id === fetchedCommunity.createdBy);
        setCreatorName(creator ? creator.displayName : 'Unknown');

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


  const fetchLinkFlairs = async () => {
    try {
      const flairsResponse = await axios.get('http://localhost:8000/linkflairs');
      setLinkFlairs(flairsResponse.data);
    } catch (err) {
      console.error("Error fetching link flairs:", err);
    }
  };

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

  const handleJoinCommunity = async () => {
    try {
      //await axios.patch(`http://localhost:8000/communities/${communityID}/join`, { userID: currentUser._id });
      await handleCommunityChange(communityID, 'join');
      fetchCommunityData(); // Refresh community data
    } catch (err) {
      console.error("Error joining community:", err);
    }
  };

  const handleLeaveCommunity = async () => {
    try {
      //await axios.patch(`http://localhost:8000/communities/${communityID}/leave`, { userID: currentUser._id });
      await handleCommunityChange(communityID, 'leave');
      fetchCommunityData(); // Refresh community data
    } catch (err) {
      console.error("Error leaving community:", err);
    }
  };

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

  const getMostRecentCommentDate = (post) => {
    const postComments = comments.filter(comment => comment.postID === post._id);
    if (postComments.length === 0) return new Date(0);
    const mostRecentComment = postComments.sort((a, b) => new Date(b.commentedDate) - new Date(a.commentedDate))[0];
    return mostRecentComment ? mostRecentComment.commentedDate : new Date(0);
  };

  if (!community) return <div>Loading community...</div>;

  const sortedPosts = getSortedPosts();

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

  const isMember = currentUser && community.members.includes(currentUser._id);

  return (
    <div id="community-page">
      <div id="community-header-section">
        <div id="community-header">
          <h1 id="community-name">r/{community.name}</h1>
          <div id="button-container">
            <button className="sort-button" onClick={() => setSortOption('newest')}>Newest</button>
            <button className="sort-button" onClick={() => setSortOption('oldest')}>Oldest</button>
            <button className="sort-button" onClick={() => setSortOption('active')}>Active</button>
          </div>
        </div>
        <p id="community-description">{community.description}</p>
        <p id="community-age">Created {formatTimestamp(community.startDate)} by {creatorName}</p>
        <p id="community-info">
          <span>{sortedPosts.length} Posts</span> | <span>{community.memberCount || 0} Members</span>
        </p>
        {currentUser && (
          isMember ? (
            <button onClick={handleLeaveCommunity} className="leave-button">Leave Community</button>
          ) : (
            <button onClick={handleJoinCommunity} className="join-button">Join Community</button>
          )
        )}
      </div>
      <div className="divider" />
      <div className="post-list">
        {sortedPosts.map(post => {
          const flair = post.linkFlairID ? linkFlairs.find(flair => flair._id === post.linkFlairID)?.content || '' : '';
          // get the creater of the post
          const creator = post.postedBy
          ? users.find(u => u._id === post.postedBy)?.displayName || '' 
          : '';

          const totalComments = countCommentsAndReplies(post.commentIDs);
          return (
            <div key={post._id} className="post-item" onClick={() => handlePostClick(post._id)}>
              <div className="post-meta">
                <span className="post-creator">Posted by {creator}</span>
                <span className="separator"> | </span>
                <span className="post-timestamp">{formatTimestamp(post.postedDate)}</span>
              </div>
              <h2 className="post-title">{post.title}</h2>
              {flair && <p className="post-flair">{flair}</p>}
              <p className="post-content">{post.content.substring(0, 80)}...</p>
              <div className="post-stats">
                <span className="post-views">Views: {post.views || 0}</span>
                <span className="separator"> | </span>
                <span className="post-comments">Comments: {totalComments}</span>
              </div>
            </div>
          );
        })}
      </div>
      <div id= "empty-container"></div>
    </div>
  );
};

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
