import React, { useState, useEffect } from 'react';
import axios from 'axios';

function CreateCommunity({ updateCommunityList, showCommunity, currentUser, currentCommunity, setCurrentCommunity, showView }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Pre-fill the form if editing an existing community
  useEffect(() => {
    if (currentCommunity) {
      setName(currentCommunity.name);
      setDescription(currentCommunity.description);
    }
  }, [currentCommunity]);

  // Function to validate inputs
  const validateInputs = () => {
    const errors = {};
    if (!name || name.length > 100) {
      errors.name = "Name is required and should be less than 100 characters.";
    }
    if (!description || description.length > 500 || description.length < 10) {
      errors.description = "Description is required and should be less than 500 characters and greater than 10.";
    }
    return errors;
  };

  // Function to handle creating or updating a community
  const handleCreateOrUpdateCommunity = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    const validationErrors = validateInputs();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setIsLoading(false);
      return;
    }

    try {
      if (currentCommunity) {
        // Update existing community
        await axios.patch(`http://localhost:8000/communities/${currentCommunity._id}`, {
          name,
          description,
        });
        setSuccessMessage('Community updated successfully!');
        setCurrentCommunity(null);
      } else {
        // Create new community
        const newCommunity = {
          name,
          description,
          postIDs: [],
          members: [currentUser._id], // Use currentUser's ID as the initial member
          createdBy: currentUser._id,
          memberCount: 1,
          startDate: new Date(),
        };

        const response = await axios.post('http://localhost:8000/communities', newCommunity);
        setSuccessMessage('Community created successfully!');
        showCommunity(response.data._id); // Navigate to the new community view
      }

      // Refresh the list of communities in App.js
      await updateCommunityList();

      // Reset form fields
      setName('');
      setDescription('');
    } catch (error) {
      console.error('Error saving community:', error);

      // Check if the error response exists and contains a message
      if (error.response && error.response.data && error.response.data.error) {
        setErrors({ server: error.response.data.error }); // Use the error message from the server
      } else {
        setErrors({ server: 'Failed to save community. Please try again.' }); // Default error message
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Handle cancel action
  const handleCancel = () => {
    if (currentCommunity) {
      setCurrentCommunity(null);
      showView('profile'); // Go back to user profile if editing an existing community
    } else {
      showView('home'); // Go back to home if creating a new community
    }
  };

  return (
    <div id="create-community-page" className="front-page">
      <h2>{currentCommunity ? 'Edit Community' : 'Create a New Community'}</h2>

      {successMessage && <p className="success">{successMessage}</p>}

      <form onSubmit={handleCreateOrUpdateCommunity}>
        <label>Community Name <span className="required">*</span></label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength="100"
          required
        />
        {errors.name && <p className="error">{errors.name}</p>}

        <label>Community Description <span className="required">*</span></label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          maxLength="500"
          required
        />
        {errors.description && <p className="error">{errors.description}</p>}

        {errors.server && <p className="error">{errors.server}</p>}

        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Saving...' : currentCommunity ? 'Save Changes' : 'Create Community'}
        </button>
        <button type="button" onClick={handleCancel}>
          Cancel
        </button>
      </form>
    </div>
  );
}

export default CreateCommunity;
