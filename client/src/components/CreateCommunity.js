import React, { useState } from 'react';
import axios from 'axios';

function CreateCommunity({ updateCommunityList, showCommunity, currentUser }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Function to validate inputs
  const validateInputs = () => {
    const errors = {};
    if (!name || name.length > 100) {
      errors.name = "Name is required and should be less than 100 characters.";
    }
    if (!description || description.length > 500 || description.length < 10) {
      errors.description = "Description is required and should be less than 500 characters and greater then 10.";
    }
    return errors;
  };

  // Function to handle creating a new community
  const handleCreateCommunity = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    const validationErrors = validateInputs();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setIsLoading(false);
      return;
    }

    const newCommunity = {
      name,
      description,
      postIDs: [],
      members: [currentUser._id], // Use currentUser's ID as the initial member
      createdBy: currentUser._id,
      memberCount: 1,
      startDate: new Date(),
    };

    try {
      // Send POST request to server to create a new community
      const response = await axios.post('http://localhost:8000/communities', newCommunity);
      console.log('Community created:', response.data);

      // Refresh the list of communities in App.js
      await updateCommunityList();

      // Show success message and reset form
      setSuccessMessage('Community created successfully!');
      setName('');
      setDescription('');

      // Navigate to the new community view
      showCommunity(response.data._id);
    } catch (error) {
      console.error('Error creating community:', error);
      setErrors({ server: 'Failed to create community. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div id="create-community-page" className="front-page">
      <h2>Create a New Community</h2>

      {successMessage && <p className="success">{successMessage}</p>}

      <form onSubmit={handleCreateCommunity}>
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
          {isLoading ? 'Creating...' : 'Create Community'}
        </button>
      </form>
    </div>
  );
}

export default CreateCommunity;
