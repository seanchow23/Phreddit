import React, { useState } from 'react';

function RegisterPage({ registerUser, setView }) {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        displayName: '',
        password: '',
        confirmPassword: ''
    });
    const [error, setError] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const passwordLowerCase = formData.password.toLowerCase();
        if (
            passwordLowerCase.includes(formData.firstName.toLowerCase()) ||
            passwordLowerCase.includes(formData.lastName.toLowerCase()) ||
            passwordLowerCase.includes(formData.displayName.toLowerCase()) ||
            passwordLowerCase.includes(formData.email.toLowerCase())
        ) {
            setError('Password must not contain your first name, last name, display name, or email.');
            return;
        }
        
        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match.');
            return;
        }

        try {
            await registerUser(formData);
            setView('welcome'); // Redirect to the welcome page after successful registration
        } catch (err) {
            setError('Error registering user.');
        }
    };

    return (
        <div className="register-page">
            <h2>Create an Account</h2>
            {error && <p className="error-message">{error}</p>}
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    name="firstName"
                    placeholder="First Name"
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                />
                <input
                    type="text"
                    name="lastName"
                    placeholder="Last Name"
                    value={formData.lastName}
                    onChange={handleChange}
                    required
                />
                <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                />
                <input
                    type="text"
                    name="displayName"
                    placeholder="Display Name"
                    value={formData.displayName}
                    onChange={handleChange}
                    required
                />
                <input
                    type="password"
                    name="password"
                    placeholder="Password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                />
                <input
                    type="password"
                    name="confirmPassword"
                    placeholder="Confirm Password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                />
                <button type="submit">Sign Up</button>
                <button type="button" onClick={() => setView('welcome')}>Cancel</button>
            </form>
        </div>
    );
}

export default RegisterPage;
