import React, { useState, useEffect } from 'react';
import axios from 'axios';

function NewReplyPage({ postID, parentCommentID, fetchData, showPostSection, currentUser, currentComment, setCurrentComment }) {
    const [content, setContent] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    // Pre-fill the content if editing an existing comment
    useEffect(() => {
        if (currentComment) {
            setContent(currentComment.content);
        }
    }, [currentComment]);

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
            if (currentComment) {
                // Editing an existing comment
                await axios.patch(`http://localhost:8000/comments/update/${currentComment._id}`, {
                    content,
                });
                alert('Comment updated successfully!');
            } else {
                // Creating a new reply
                const newComment = {
                    content,
                    commentedBy: currentUser._id, // Automatically set to the logged-in user's ID
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

                alert('Reply submitted successfully!');
            }

            // Refresh data and return to the post view
            await fetchData();
            setContent('');
            setCurrentComment(null);
            showPostSection();
        } catch (err) {
            console.error('Error submitting reply:', err);
            setError('Failed to submit reply. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="reply-page">
            <h2>{currentComment ? 'Edit Reply' : parentCommentID ? 'Reply to Comment' : 'Reply to Post'}</h2>
            <form onSubmit={handleReplySubmit}>
                {error && <p className="error">{error}</p>}
                <textarea
                    placeholder="Your reply"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    required
                />
                <button type="submit" disabled={isLoading}>
                    {isLoading ? 'Submitting...' : currentComment ? 'Save Changes' : 'Submit Reply'}
                </button>
                <button type="button" onClick={() => {
                    setContent('');
                    setCurrentComment(null);
                    showPostSection();
                }}>
                    Cancel
                </button>
            </form>
        </div>
    );
}

export default NewReplyPage;
