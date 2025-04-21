import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ref, get, database } from './firebase';
import './styles/QuizAnswers.css'; // Importing a separate CSS file for styling

function QuizAnswersPage() {
    const location = useLocation();
    const navigate = useNavigate(); // For navigating programmatically
    const { quizId, groupName } = location.state;
    const [answersByUsers, setAnswersByUsers] = useState(null);
    const [quiz, setQuiz] = useState(null); // To store the quiz data

    useEffect(() => {
        const quizRef = ref(database, `groups/${groupName}/quizzes/${quizId}`);
        get(quizRef)
            .then((snapshot) => {
                if (snapshot.exists()) {
                    console.log(snapshot.val())
                    setQuiz(snapshot.val()); // Store the quiz data
                } else {
                    console.error("Quiz not found");
                }
            })
            .catch((error) => console.error("Error fetching quiz:", error));

        const answersRef = ref(database, `groups/${groupName}/quizzes/${quizId}/answers`);
        get(answersRef)
            .then((snapshot) => {
                if (snapshot.exists()) {
                    setAnswersByUsers(snapshot.val());
                } else {
                    setAnswersByUsers({});
                }
            })
            .catch((error) => console.error("Error fetching quiz answers:", error));
    }, [quizId, groupName]);

    if (answersByUsers === null || quiz === null) {
        return <div className="loading">Loading...</div>;
    }

    const handleReturn = () => {
        navigate(-1); // Navigate back to the previous page
    };

    return (
        <div className="quiz-answers-page">
            <h2 className="header">Answers for Quiz: {quiz.title}</h2>
            <button className="return-button" onClick={handleReturn}>Return</button>
            {Object.entries(answersByUsers).map(([user, answers]) => (
                <div key={user} className="user-answers-container">
                    <h3 className="user-name">{user}'s Answers:</h3>
                    {Object.entries(answers.answers).map(([questionId, answer]) => (
                        <div key={questionId} className="question-answer-container">
                            {!quiz.questions[questionId].question &&<h4 className="question-text">{quiz.questions[questionId]}</h4>}
                            {quiz.questions[questionId].question &&<h4 className="question-text">{quiz.questions[questionId].question}</h4>}
                            <p className="answer-text">{answer}</p>
                        </div>
                    ))}
                </div>
            ))}
            {Object.keys(answersByUsers).length === 0 && <p className="no-answers">No answers submitted for this quiz yet.</p>}
        </div>
    );
}

export default QuizAnswersPage;
