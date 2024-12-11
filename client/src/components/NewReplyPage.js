import React, { useState } from 'react';
import axios from 'axios';

function NewReplyPage({ postID, parentCommentID, fetchData, showPostSection, currentUser }) {
    const [content, setContent] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
  
    const handleReplySubmit = async (e) => {
      e.preventDefault();
      setIsLoading(true);
      setError('');
  
      if (!content) {
        setError('Content is required.');
        setIsLoading(false);
        return;
      }
  
      try {
        const newComment = {
          content,
          commentedBy: currentUser, // Set to the logged-in user's ID
          commentedDate: new Date(),
          commentIDs: [],
          postID,
          parentCommentID: parentCommentID || null,
        };
  
        const response = await axios.post('http://localhost:8000/comments', newComment);
  
        if (parentCommentID) {
          // Update the parent comment with the new comment ID
          await axios.patch(`http://localhost:8000/comments/${parentCommentID}`, {
            newCommentID: response.data._id,
          });
        } else {
          // Update the post with the new comment ID
          await axios.patch(`http://localhost:8000/posts/${postID}`, {
            newCommentID: response.data._id,
          });
        }
  
        await fetchData(); // Refresh the comments
        setContent('');
        showPostSection(); // Return to the post view
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
          <textarea
            placeholder="Your reply"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
          />
          <button type="submit" disabled={isLoading}>
            {isLoading ? 'Submitting...' : 'Submit Reply'}
          </button>
          <button type="button" onClick={showPostSection}>
            Cancel
          </button>
        </form>
      </div>
    );
  }
  
  export default NewReplyPage;
  