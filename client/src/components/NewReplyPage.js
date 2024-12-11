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
            // Create a new comment object
            const newComment = {
                content,
                commentedBy: currentUser._id, // Automatically set to the logged-in user's display name
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
                await axios.patch(`http://localhost:8000/comments/${parentCommentID}`, {
                    newCommentID: response.data._id,
                });
            } else {
                await axios.patch(`http://localhost:8000/posts/${postID}`, {
                    newCommentID: response.data._id,
                });
            }

            // Refresh data and return to the post view
            await fetchData();
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
