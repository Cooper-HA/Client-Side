import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./styles/quizPage.css";
import { ref, get, database } from './firebase'; // Importing necessary Firebase functions

function QuizPage() {
    const location = useLocation();
    const navigate = useNavigate();

    const [question, setQuestion] = useState({
        "id": 0,
        "name": "Q0",
        "legend": "",
        "answer": ""
    });
    const [questions, setQuestions] = useState([]);
    const [id, setId] = useState(1);
    const [answers, setAnswers] = useState([]); // Initialize as empty array
    const isFirstQuestion = id === 1;
    const isLastQuestion = id === questions.length;

    useEffect(() => {
        try {
            console.log(location.state.id);
            setId(1);
            if (location.state.answers) {
                setAnswers(location.state.answers); // Set answers from state if available
            } else {
                setAnswers(new Array(questions.length).fill("")); // Default empty answers
            }
        } catch (error) {
            console.log("Error getting state: " + error);
        }

        console.log(location.state.quizId);
        const questionsRef = ref(database, `groups/${location.state.groupName}/quizzes/${location.state.quizId}/questions`);
        
        get(questionsRef)
            .then((snapshot) => {
                if (snapshot.exists()) {
                    const questionsData = snapshot.val();
                    const questionKeys = Object.keys(questionsData);
                    console.log(questionKeys);
                    setQuestions(questionKeys);
                    loadQuestionData(questionKeys[0]);
                } else {
                    console.log("No questions found in the database.");
                    navigate('/admin', { state: { groupName: location.state.groupName, username: location.state.username, quizId:location.state.quizId} });
                }
            })
            .catch((error) => {
                console.log("Error while getting questions: " + error);
            });
    }, [location.state.id]);

    const loadQuestionData = (questionId) => {
        const groupName = location.state?.groupName;
        const quizId = location.state?.quizId || "2024-12-10T19-37-39-210Z";
    
        if (!groupName || !questionId) {
            console.log("Missing required parameters: groupName or questionId.");
            return;
        }
    
        const questionRef = ref(database, `groups/${groupName}/quizzes/${quizId}`);
        
        get(questionRef)
            .then((snapshot) => {
                if (snapshot.exists()) {
                    const questionData = snapshot.val();
                    console.log(questionData.questions[questionId]);
                    setQuestion(questionData.questions[questionId]);
                } else {
                    console.log(`No question found with the specified ID: ${questionId} in quiz: ${quizId}`);
                }
            })
            .catch((error) => {
                console.error(`Error getting question data for group: ${groupName}, quiz: ${quizId}, question: ${questionId}.`, error);
            });
    };

    useEffect(() => {
        if (questions.length > 0) {
            setAnswers(new Array(questions.length).fill("")); // Initialize answers to match questions length
            console.log("Answers initialized");
        }
    }, [questions]);

    const handleAnswerChange = (event) => {
        const answer = event.target.value;
    
        // Update the answer for the current question
        setAnswers((prevAnswers) => {
            const updatedAnswers = [...prevAnswers];
            updatedAnswers[id - 1] = answer; // Save answer for the current question
            return updatedAnswers;
        });
    };
    
    const nextQuestion = () => {
        const nextId = id < questions.length ? id + 1 : id;
        
        // Update the current answer before moving to the next question
        setAnswers((prevAnswers) => {
            const updatedAnswers = [...prevAnswers];
            updatedAnswers[id - 1] = answers[id - 1] || ""; // Ensure answer is saved
            return updatedAnswers;
        });

        loadQuestionData(questions[nextId - 1]);
        setId(nextId);
    };
    
    const prevQuestion = () => {
        const prevId = id > 1 ? id - 1 : id;
        
        // Update the current answer before moving to the previous question
        setAnswers((prevAnswers) => {
            const updatedAnswers = [...prevAnswers];
            updatedAnswers[id - 1] = answers[id - 1] || ""; // Ensure answer is saved
            return updatedAnswers;
        });

        loadQuestionData(questions[prevId - 1]);
        setId(prevId);
    };

    function finishQuiz() {
        if (validate(answers)) {
            navigate("/doneUser", { state: { answers: answers, username:location.state.username, groupName:location.state.groupName, quizId:location.state.quizId} });
        }
    }

    function validate(_answers) {
        let valid = true;
        for (const answer of _answers) {
            if (!answer) {
                document.getElementById("warning").innerHTML = "Please answer all questions";
                valid = false;
                break;
            }
        }
        return valid;
    }
    const QuizNav =() => {
        navigate("/quiz", { state: {username:location.state.username, groupName:location.state.groupName, quizId:location.state.quizId} });
    }
    if (questions.length === 0 || !answers) {
        console.log(questions.length);
        console.log(answers);
        console.log(question)
        return <div>Loading...</div>;
    }
    if(typeof(question) == "string"){
        return (
            <div id="all-quiz">
                <div id="quiz" className="quiz_center">
                    <span id="INFO">
                        <span>Question: <span id="questionNumber">{id}</span></span>
                    </span>

                    <form name="quiz_form" id="quiz_form" method="get">
                        {question ? (
                            <fieldset>
                                <legend>{question}</legend>
                                <div>
                                    <textarea
                                        value={answers[id - 1] || ""} 
                                        onChange={handleAnswerChange}
                                        placeholder="Type your answer here"
                                    />
                                </div>
                            </fieldset>
                        ) : (
                            <div>No question to display</div>
                        )}
                    </form>

                    <div id="warning"></div>
                    <div className="button-container">
                        {!isFirstQuestion && <button onClick={prevQuestion} id="prev">Previous</button>}
                        {!isLastQuestion && <button onClick={nextQuestion} id="next">Next</button>}
                        {isLastQuestion && <button onClick={finishQuiz} id="Finish">Finish</button>}
                    </div>
                </div>
            </div>
        );
    }else if(typeof(question) == "object"){
        return <div>Multiple choice {QuizNav()}</div>
    }else{
        return <div>Loading...{typeof(question)}</div>;
    }
}

export default QuizPage;
