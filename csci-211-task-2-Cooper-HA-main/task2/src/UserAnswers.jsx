import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ref, get, database } from './firebase';
import './styles/UserAnswers.css'; // Importing a separate CSS file for styling

function UserAnswersPage() {
    const location = useLocation();
    const navigate = useNavigate(); // For navigating programmatically
    const { member, groupName } = location.state;
    const [userAnswers, setUserAnswers] = useState(null);
    const [quizzes, setQuizzes] = useState([]);

    useEffect(() => {
        const groupRef = ref(database, `groups/${groupName}/quizzes`);
    
        get(groupRef)
            .then((snapshot) => {
                if (snapshot.exists()) {
                    const quizzesData = snapshot.val();
                    setQuizzes(quizzesData);
                    const quizIds = Object.keys(quizzesData);
    
                    const promises = quizIds.map((quizId) => {
                        const answersRef = ref(database, `groups/${groupName}/quizzes/${quizId}/answers/${member}`);
                        return get(answersRef).then((answersSnapshot) => ({
                            quizId,
                            answers: answersSnapshot.exists() ? answersSnapshot.val() : null,
                        }));
                    });
    
                    Promise.all(promises).then((data) => {
                        setUserAnswers(data.filter((entry) => entry.answers));
                    });
                } else {
                    setUserAnswers([]); 
                }
            })
            .catch((error) => console.error("Error fetching quizzes:", error));
    }, [groupName, member]);

    if (userAnswers === null) {
        return <div className="loading">Loading...</div>;
    }

    const handleReturn = () => {
        // Navigate back to the previous page or a specific route
        navigate(-1); // This returns the user to the previous page
    };

    return (
        <div className="answers-page">
            <h2 className="header">All Answers by {member} in Group {groupName}</h2>
            <button className="return-button" onClick={handleReturn}>Return</button>
            {userAnswers.length === 0 ? (
                <p className="no-answers">No answers found for this user.</p>
            ) : (
                userAnswers.map(({ quizId, answers }) => {
                    const quiz = quizzes[quizId];
                    return (
                        <div key={quizId} className="quiz-container">
                            <h3 className="quiz-title">{quiz?.title}</h3>
                            {quiz?.questions && Object.entries(answers.answers).map(([questionId, answer]) => (
                                <div key={questionId} className="question-container">
                                    {!quiz.questions[questionId].question &&<h4 className="question-text">{quiz.questions[questionId]}</h4>}
                                    {quiz.questions[questionId].question &&<h4 className="question-text">{quiz.questions[questionId].question}</h4>}
                                    <p className="answer-text">{answer}</p>
                                </div>
                            ))}
                        </div>
                    );
                })
            )}
        </div>
    );
}

export default UserAnswersPage;
