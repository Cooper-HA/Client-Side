import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { getDatabase, ref, set } from "firebase/database";
import './styles/QuizCreation.css';

function QuizCreation() {
    const navigate = useNavigate();
    const { state } = useLocation();
    const { groupName } = state;

    const [quizTitle, setQuizTitle] = useState("");
    const [questions, setQuestions] = useState([]);
    const [currentQuestion, setCurrentQuestion] = useState("");
    const [currentChoices, setCurrentChoices] = useState(["", ""]);
    const [correctAnswer, setCorrectAnswer] = useState(null);
    const [error, setError] = useState("");

    console.log("loaded");
    const handleAddOption = () => {
        if (currentChoices.length < 4) {
            setCurrentChoices([...currentChoices, ""]);
        }
    };

    const handleRemoveOption = (index) => {
        if (currentChoices.length > 2) {
            const updatedChoices = currentChoices.filter((_, i) => i !== index);
            setCurrentChoices(updatedChoices);
            if (correctAnswer === index) {
                setCorrectAnswer(null); // Reset correct answer if it's removed
            } else if (correctAnswer > index) {
                setCorrectAnswer(correctAnswer - 1); // Adjust correct answer index
            }
        }
    };

    const handleAddQuestion = () => {
        if (!currentQuestion || currentChoices.some(choice => choice.trim() === "") || correctAnswer === null) {
            setError("Please fill in the question, all answer choices, and select the correct answer.");
            return;
        }

        const newQuestion = {
            question: currentQuestion,
            choices: currentChoices,
            correctAnswer,
        };

        setQuestions([...questions, newQuestion]);
        setCurrentQuestion("");
        setCurrentChoices(["", ""]);
        setCorrectAnswer(null);
        setError("");
    };

    const handleCreateQuiz = () => {
        console.log("click");

        if (!quizTitle || questions.length < 1) {
            setError("Please provide a title and at least 1 question.");
            return;
        }
        console.log("click");
        const db = getDatabase();
        const quizId = new Date().toISOString().replace(/[:.]/g, '-');

        const quizRef = ref(db, `groups/${groupName}/quizzes/${quizId}`);
        const quizData = {
            title: quizTitle,
            questions: questions,
            date: new Date().toISOString().split('T')[0],
        };

        set(quizRef, quizData)
            .then(() => {
                const groupRef = ref(db, `groups/${groupName}/latest`);
                set(groupRef, {
                    latestQuiz: {
                        id: quizId,
                        date: new Date().toISOString().split('T')[0],
                    },
                })
                .then(() => {
                    navigate('/quizPage', { state: { groupName, quizId, username: state.username } });
                })
                .catch(error => setError("Error updating group with latest quiz: " + error.message));
            })
            .catch(error => setError("Error creating quiz: " + error.message));
    };
    const handleMakeStadardQuiz = () => {
        navigate('/quiz-create', { state: { groupName, username: state.username } });
    }
    return (
        <div className="quiz-creation-container">
            <div className="quiz-creation-card">
                <h2>Create a Quiz for {groupName}</h2>
                <button onClick={handleMakeStadardQuiz} className="btn primary-btn">
                    Make Standard Quiz
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

                <div className="question-form">
                    <input
                        type="text"
                        placeholder="Enter Question"
                        value={currentQuestion}
                        onChange={(e) => setCurrentQuestion(e.target.value)}
                        className="input-field"
                    />

                    <div className="choices-container">
                        {currentChoices.map((choice, index) => (
                            <div key={index} className="choice-input">
                                <input
                                    type="text"
                                    placeholder={`Choice ${index + 1}`}
                                    value={choice}
                                    onChange={(e) => {
                                        const updatedChoices = [...currentChoices];
                                        updatedChoices[index] = e.target.value;
                                        setCurrentChoices(updatedChoices);
                                    }}
                                    className="input-field"
                                />
                                <input
                                    type="radio"
                                    name="correctAnswer"
                                    checked={correctAnswer === index}
                                    onChange={() => setCorrectAnswer(index)}
                                />
                                Correct
                                {currentChoices.length > 2 && (
                                    <button onClick={() => handleRemoveOption(index)} className="btn remove-btn">
                                        Remove
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>

                    <button onClick={handleAddOption} className="add-option-btn">
                        Add Option
                    </button>


                    <button onClick={handleAddQuestion} className="add-question-btn">
                        Add Question
                    </button>
                </div>

                <div className="questions-list">
                    <h3>Questions Added:</h3>
                    {questions.length > 0 ? (
                        questions.map((q, index) => (
                            <div key={index} className="question-item">
                                <p>{index + 1}. {q.question}</p>
                                <ul>
                                    {q.choices.map((choice, i) => (
                                        <li key={i} style={{ color: q.correctAnswer === i ? 'green' : 'black' }}>
                                            {choice}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))
                    ) : (
                        <p>No questions added yet.</p>
                    )}
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
