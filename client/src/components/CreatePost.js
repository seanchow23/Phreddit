import React, { useState } from 'react';
import axios from 'axios';

function CreatePost({ communities, linkFlairs, fetchData, showHomePage, currentUser }) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [community, setCommunity] = useState('');
  const [flair, setFlair] = useState('');
  const [newFlair, setNewFlair] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Sort communities with joined ones first
  const sortedCommunities = currentUser
    ? [
        ...communities.filter((community) => community.members.includes(currentUser._id)), // Joined communities
        ...communities.filter((community) => !community.members.includes(currentUser._id)), // Unjoined communities
      ]
    : communities;

  // Function to handle creating a new post
  const handleCreatePost = async (e) => {
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

      const newPost = {
        title,
        content,
        communityID: community,
        linkFlairID: flairID, // Optional flair ID
        postedBy: currentUser._id, // Use the logged-in user's display name
        postedDate: new Date(),
        views: 0,
        commentIDs: [],
      };
      console.log('Payload sent to server:', newPost);

      // Send POST request to create a new post
      await axios.post('http://localhost:8000/posts', newPost);

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
      console.error('Error creating post:', err);
      setError('Failed to create post. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div id="create-post-page" className="front-page">
      <h2>Create a New Post</h2>
      <form onSubmit={handleCreatePost}>
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
          {isLoading ? 'Creating...' : 'Submit Post'}
        </button>
        <button type="button" onClick={showHomePage}>
          Cancel
        </button>
      </form>
    </div>
  );
}

export default CreatePost;