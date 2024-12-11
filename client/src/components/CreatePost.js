import React, { useState, useEffect } from 'react';
import axios from 'axios';

function CreatePost({
  communities,
  linkFlairs,
  fetchData,
  showHomePage,
  currentUser,
  currentPost,
  setCurrentPost,
  showView,
}) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [community, setCommunity] = useState('');
  const [flair, setFlair] = useState('');
  const [newFlair, setNewFlair] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Pre-fill the form if editing an existing post
  useEffect(() => {
    if (currentPost) {
      setTitle(currentPost.title);
      setContent(currentPost.content);
      setCommunity(currentPost.communityID);
      setFlair(currentPost.linkFlairID || '');
    }
  }, [currentPost]);

  // Sort communities with joined ones first
  const sortedCommunities = currentUser
    ? [
        ...communities.filter((community) => community.members.includes(currentUser._id)), // Joined communities
        ...communities.filter((community) => !community.members.includes(currentUser._id)), // Unjoined communities
      ]
    : communities;

  const handleCreateOrUpdatePost = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Validate required fields
    if (!title || !content || !community) {
      setError('All fields except flair are required.');
      setIsLoading(false);
      return;
    }

    // Prevent both flair options from being used
    if (flair && newFlair) {
      setError('Error: Cannot create post with both a selected flair and a new flair.');
      setIsLoading(false);
      return;
    }

    try {
      // If a new flair is provided, create it
      let flairID = flair || null;
      if (newFlair) {
        const flairResponse = await axios.post('http://localhost:8000/linkflairs', { content: newFlair });
        flairID = flairResponse.data._id;
      }

      if (currentPost) {
        // Update existing post
        await axios.patch(`http://localhost:8000/posts/update/${currentPost._id}`, {
          title,
          content,
          communityID: community,
          linkFlairID: flairID,
        });
        alert('Post updated successfully!');
        setCurrentPost(null);
      } else {
        // Create a new post
        const newPost = {
          title,
          content,
          communityID: community,
          linkFlairID: flairID, // Optional flair ID
          postedBy: currentUser._id,
          postedDate: new Date(),
          views: 0,
          commentIDs: [],
        };
        await axios.post('http://localhost:8000/posts', newPost);
        alert('Post created successfully!');
      }

      // Refresh posts and communities
      await fetchData();

      // Reset form fields
      setTitle('');
      setContent('');
      setCommunity('');
      setFlair('');
      setNewFlair('');

      // Navigate back to the homepage
      showHomePage();
    } catch (err) {
      console.error('Error saving post:', err);
      setError(
        err.response?.data?.error || 'An unexpected error occurred while saving the post.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    if (currentPost) {
      setCurrentPost(null);
      showView('profile'); // Go back to user profile if editing an existing community
    } else {
      showView('home'); // Go back to home if creating a new community
    }
  };
  return (
    <div id="create-post-page" className="front-page">
      <h2>{currentPost ? 'Edit Post' : 'Create a New Post'}</h2>
      <form onSubmit={handleCreateOrUpdatePost}>
        {error && <p className="error">{error}</p>}

        <label htmlFor="communitySelect">Select Community: *</label>
        <select
          id="communitySelect"
          value={community}
          onChange={(e) => setCommunity(e.target.value)}
          required
        >
          <option value="">Select a community</option>
          {sortedCommunities?.map((community) => (
            <option key={community._id} value={community._id}>
              {community.name}
            </option>
          ))}
        </select>

        <label htmlFor="postTitle">Post Title: *</label>
        <input
          type="text"
          id="postTitle"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength="100"
          required
        />

        <label htmlFor="postContent">Post Content: *</label>
        <textarea
          id="postContent"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
        />

        <label htmlFor="linkFlair">Select Link Flair (Optional):</label>
        <select
          id="linkFlair"
          value={flair}
          onChange={(e) => setFlair(e.target.value)}
        >
          <option value="">None</option>
          {linkFlairs?.map((flair) => (
            <option key={flair._id} value={flair._id}>
              {flair.content}
            </option>
          ))}
        </select>

        <label htmlFor="newFlair">Or Create a New Flair:</label>
        <input
          type="text"
          id="newFlair"
          value={newFlair}
          onChange={(e) => setNewFlair(e.target.value)}
          maxLength="30"
          placeholder="Enter new flair"
        />

        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Saving...' : currentPost ? 'Save Changes' : 'Submit Post'}
        </button>
        <button type="button" onClick={handleCancel}>
          Cancel
        </button>
      </form>
    </div>
  );
}

export default CreatePost;
