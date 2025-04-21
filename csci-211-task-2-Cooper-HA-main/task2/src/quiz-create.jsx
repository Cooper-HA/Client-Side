import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { getDatabase, ref, set } from "firebase/database";
import './styles/QuizCreation.css';

function QuizCreation() {
    const navigate = useNavigate();
    const {state} = useLocation();
    const { groupName } = state;

    const [quizTitle, setQuizTitle] = useState("");
    const [questions, setQuestions] = useState([]);
    const [error, setError] = useState("");

    const handleCreateQuiz = () => {
        if (!quizTitle || questions.length === 0) {
            setError("Please provide a title and at least one question.");
            return;
        }

        const db = getDatabase();
        const quizId = new Date().toISOString().replace(/[:.]/g, '-'); // Sanitize the quizId to avoid invalid characters

        // Reference for the new quiz in Firebase
        const quizRef = ref(db, `groups/${groupName}/quizzes/${quizId}`);
        console.log("Saving to path:", `groups/${groupName}/quizzes/${quizId}`);
        // Quiz data structure
        const quizData = {
            title: quizTitle,
            questions: questions,
            date: new Date().toISOString().split('T')[0], // Store date in YYYY-MM-DD format
        };
        console.log(quizData);

        // Save the quiz data to Firebase
        set(quizRef, quizData)
            .then(() => {
                // Once the quiz is created, update the group's latest quiz reference
                const groupRef = ref(db, `groups/${groupName}/latest`);
                set(groupRef, {
                    latestQuiz: {
                        id: quizId,
                        date: new Date().toISOString().split('T')[0], // Use today's date for the latest quiz
                    },
                })
                .then(() => {
                    // After successfully saving the quiz and updating the group, navigate to the quiz page
                    navigate('/quizPage', { state: { groupName, quizId, username:state.username } });
                })
                .catch((error) => {
                    setError("Error updating group with latest quiz: " + error.message);
                });
            })
            .catch((error) => {
                setError("Error creating quiz: " + error.message);
            });
    };
    const handleMakeQuizMC = () => {
        navigate('/createMC', { state: { groupName, username: state.username } });
    }
    return (
        <div className="quiz-creation-container">
            <div className="quiz-creation-card">
                <h2>Create a Quiz for {groupName}</h2>
                <button onClick={handleMakeQuizMC} className="btn primary-btn">
                    Make Quiz Multiple Choice
                </button>
                <div className="input-group">
                    <input
                        type="text"
                        placeholder="Enter Quiz Title"
                        value={quizTitle}
                        onChange={(e) => setQuizTitle(e.target.value)}
                        className="input-field"
                    />
                </div>
                
                <div className="input-group">
                    <textarea
                        placeholder="Enter Questions (separate by new lines)"
                        value={questions.join("\n")}
                        onChange={(e) => setQuestions(e.target.value.split("\n"))}
                        className="textarea-field"
                    />
                </div>
                
                <button onClick={handleCreateQuiz} className="create-quiz-btn">
                    Create Quiz
                </button>

                {error && <p className="error-message">{error}</p>}
            </div>
        </div>
    );
}

export default QuizCreation;
