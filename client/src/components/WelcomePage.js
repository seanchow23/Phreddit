import React from 'react';

function WelcomePage({ setView }) {
    return (
        <div className="welcome-page">
            <h1>Welcome to Phreddit</h1>
            <div className="button-group">
                <button onClick={() => setView('register')}>Register as a New User</button>
                <button onClick={() => setView('login')}>Login as an Existing User</button>
                <button onClick={() => setView('home')}>Continue as Guest</button>
            </div>
        </div>
    );
}

export default WelcomePage;
