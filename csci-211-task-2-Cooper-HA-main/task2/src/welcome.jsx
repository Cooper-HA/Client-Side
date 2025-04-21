import React from "react";
import { useNavigate } from "react-router-dom";
import "./styles/Welcome.css";

function Welcome() {
    const navigate = useNavigate();

    // Navigate to the login page
    const goToLogin = () => {
        navigate("/login");
    };

    // Navigate to quiz as guest
    const continueAsGuest = () => {
        navigate("/quiz", { state: { id: 1 } });
    };

    return (
        <div className="welcome-container">
            <div className="welcome-card">
                <h1>Welcome to the Quiz!</h1>
                <p className="welcome-description">
                    Ready to test your general knowledge? Press the button below to begin the quiz.
                </p>

                {/* Welcome buttons */}
                <div className="button-container">
                    <button onClick={continueAsGuest} className="continue-btn">
                        Guest
                    </button>
                    <button onClick={goToLogin} className="loginI-btn">
                        Login to Continue
                    </button>
                </div>
            </div>
        </div>
    );
}

export default Welcome;
