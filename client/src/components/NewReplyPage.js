import React, { useState } from 'react';
import axios from 'axios';

function NewReplyPage({ postID, parentCommentID, fetchData, showPostSection }) {
  const [username, setUsername] = useState('');
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Function to handle submitting a reply
  const handleReplySubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    if (!username || !content) {
      setError('All fields are required.');
      setIsLoading(false);
      return;
    }

    try {
      // Create a new comment object
      const newComment = {
        content,
        commentedBy: username,
        commentedDate: new Date(),
        commentIDs: [],
        postID: postID,
        parentCommentID: parentCommentID || null,
      };

      // Send the new comment to the server
      const response = await axios.post('http://localhost:8000/comments', newComment);
      console.log('New comment created:', response.data);

      // Update the relevant parent (either post or comment) with the new commentID
      if (parentCommentID) {
        // Update the parent comment's commentIDs array on the server
        await axios.patch(`http://localhost:8000/comments/${parentCommentID}`, {
          newCommentID: response.data._id,
        });
      } else {
        // Update the post's commentIDs array on the server
        await axios.patch(`http://localhost:8000/posts/${postID}`, {
          newCommentID: response.data._id,
        });
      }

      // Refresh data in the parent component
      await fetchData();

      // Reset the form and go back to the post view
      setUsername('');
      setContent('');
      showPostSection();
    } catch (err) {
      console.error('Error creating reply:', err);
      setError('Failed to submit reply. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="reply-page">
      <h2>{parentCommentID ? 'Reply to Comment' : 'Reply to Post'}</h2>
      <form onSubmit={handleReplySubmit}>
        {error && <p className="error">{error}</p>}
        <input
          type="text"
          placeholder="Your name"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <textarea
          placeholder="Your reply"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
        />
        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Submitting...' : 'Submit Reply'}
        </button>
        <button type="button" onClick={showPostSection}>Cancel</button>
      </form>
    </div>
  );
}

export default NewReplyPage;
