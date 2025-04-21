import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ref, get, getDatabase, set } from "firebase/database";
import "./styles/Login.css";


function Login() {
    const navigate = useNavigate();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState(""); // For displaying error messages if login fails
    const [createMode, setCreateMode] = useState(false); // Toggle between login and create account modes
    const [isAdmin, setIsAdmin] = useState(false); // New state to handle admin status

    // Handle login
    function handleLogin() {
        if (username && password) {
            const db = getDatabase();
            const userRef = ref(db, 'users/' + username);
            
            // Fetch user data from Firebase
            get(userRef).then((snapshot) => {
                if (snapshot.exists()) {
                    const userData = snapshot.val();
                    // Validate password
                    if (userData.password === password) {
                        // Successfully logged in, redirect to /options
                        navigate('/options', { state: { username: username, isAdmin: userData.isAdmin } });
                    } else {
                        setError("Invalid password. Please try again.");
                    }
                } else {
                    setError("User not found. Please sign up first.");
                }
            }).catch((error) => {
                setError("Error logging in: " + error.message);
            });
        } else {
            setError("Please fill out both fields.");
        }
    }

    // Handle account creation
    function handleCreateAccount() {
        if (username && password) {
            console.log(username);
            const db = getDatabase();
            console.log(ref(db, 'users/' + username));
            console.log(db);
            set(ref(db, 'users/' + username), {
                username: username,
                password: password,
                isAdmin: isAdmin,
            })
            .then(() => {
                setError(""); // Clear any error messages
                setCreateMode(false); // Switch to login mode
                alert("Account created successfully! You can now log in.");
            })
            .catch((error) => {
                setError("Error creating account: " + error.message);
            });
        } else {
            setError("Please fill out both fields.");
        }
    }

    return (
        <div className="login-container">
            <div className="login-card">
                <h2>{createMode ? "Create Account" : "Login"}</h2>
                <p>{createMode ? "Enter a username and password to create a new account." : "Enter your username and password to start the quiz."}</p>
                
                <div className="login-form">
                    <input
                        type="text"
                        placeholder="Username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                        className="input-field"
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="input-field"
                    />
                    
                    {/* {createMode && (
                        <div>
                            <label>
                                <input 
                                    type="checkbox"
                                    checked={isAdmin}
                                    onChange={() => setIsAdmin(!isAdmin)}
                                />
                                Make this user an admin
                            </label>
                        </div>
                    )} */}
                    
                    {error && <p className="error-message">{error}</p>}
                    <button onClick={createMode ? handleCreateAccount : handleLogin} className="login-btn">
                        {createMode ? "Create Account" : "Log In"}
                    </button>
                    <button 
                        onClick={() => setCreateMode(!createMode)} 
                        className="toggle-btn">
                        {createMode ? "Already have an account? Log in" : "Don't have an account? Create one"}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default Login;
