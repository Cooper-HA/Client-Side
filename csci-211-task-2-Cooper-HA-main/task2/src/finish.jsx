import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ref, get, database, set } from "./firebase";
import { getDatabase } from "firebase/database";
import "./styles/Finish.css"; // Ensure you create a responsive CSS file
import Options from "./Options";

function Finish() {
    // Variable creation
    const navigate = useNavigate();
    const location = useLocation();

    const [answers, setAnswers] = useState([]);
    const [questions, setQuestions] = useState([]);

    // Initial data load
    useEffect(() => {
        if(location.state.username){
            UserDataLoad(location.state);
        }else{
            GuestDataLoad();
        }
    }, [location.state]);

    // Navigation function
    function FinishQuiz() {
        if(location.state.username){
            const db = getDatabase();
            const userRef = ref(db, 'users/' + location.state.username);
            
            // Fetch user data from Firebase
            get(userRef).then((snapshot) => {
                if (snapshot.exists()) {
                    const userData = snapshot.val();
                    const db = getDatabase();
                    const groupRef = ref(db, 'groups/' + location.state.groupName + "/quizzes/" + location.state.quizId +"/answers/" + location.state.username);
                    set(groupRef, {
                        user: location.state.username,
                        answers: answers
                    }).then(() => {
                        navigate('/options', { state: { username: location.state.username, isAdmin: userData.isAdmin } });
                    }).catch((error) => {
                        setError("Error creating group: " + error.message);
                    });

                } else {
                    console.log("User not found. Please sign up first.");
                }
            }).catch((error) => {
                console.log("Error logging in: " + error.message);
            }); 
        }else{
            navigate("/");
        }
    }
    const UserDataLoad = (state) => {
        try {
            setAnswers(Object.values(location.state.answers));
            console.log("User answers:", Object.values(location.state.answers));
        } catch {
            console.log("No answers, using an empty array.");
        }

        const questionsRef = ref(
            database,
            `groups/${state.groupName}/quizzes/${state.quizId}/questions`
        );

        // Fetch questions from Firebase
        get(questionsRef)
            .then((snapshot) => {
                if (snapshot.exists()) {
                    const questionsData = snapshot.val();
                    console.log(questionsData);
                    const formattedQuestions = Object.keys(questionsData).map((key) => ({
                        id: key, // Firebase question ID
                        ...questionsData[key], // Include question data
                    }));
                    setQuestions(formattedQuestions);
                    console.log("Questions from Firebase:", formattedQuestions);
                } else {
                    console.log("No questions found in Firebase.");
                }
            })
            .catch((error) => {
                console.error("Error while fetching questions from Firebase:", error);
            });
    }
    const GuestDataLoad = () => {
        try {
            setAnswers(Object.values(location.state.answers));
            console.log("User answers:", Object.values(location.state.answers));
        } catch {
            console.log("No answers, using an empty array.");
        }

        const questionsRef = ref(
            database,
            `questions`
        );

        // Fetch questions from Firebase
        get(questionsRef)
            .then((snapshot) => {
                if (snapshot.exists()) {
                    const questionsData = snapshot.val();
                    const formattedQuestions = Object.keys(questionsData).map((key) => ({
                        id: key, // Firebase question ID
                        ...questionsData[key], // Include question data
                    }));
                    setQuestions(formattedQuestions);
                    console.log("Questions from Firebase:", formattedQuestions);
                } else {
                    console.log("No questions found in Firebase.");
                }
            })
            .catch((error) => {
                console.error("Error while fetching questions from Firebase:", error);
            });
    }
    // Calculate percent score
    function percentCalc() {
        let correctAnswers = 0;
        if(location.state.username){
            for (let i = 0; i < questions.length; i++) {
                if(questions[i].choices[questions[i]?.correctAnswer]== answers[i] && location.state.username){
                    correctAnswers ++;
                }
            }
        }else{
            for (let i = 0; i < questions.length; i++) {
                if (questions[i]?.answer === answers[i] && !location.state.username) {
                    correctAnswers++;
                }
            }
        }
        const percentage = ((correctAnswers / questions.length) * 100).toFixed(2);
        return percentage;
    }
    console.log(typeof(questions));
    if(!questions[0]){
        console.log(questions);
        return (<div>Loading...</div>)
    }
    // Display data
    return (
        <div className="finish-container">
            <div className="finish-content">
                <p className="score-text">
                    You Finished with a <span>{percentCalc()}%</span> score
                </p>

                {/* Answer list */}
                {answers.length > 0 && !location.state.username ? (
                    answers.map((answer, index) => (
                        <div
                            key={index}
                            className={`answer-item ${
                                questions[index]?.answer === answer ? "correct" : "incorrect"
                            }`}
                        >
                            <strong>{questions[index]?.legend || `Question ${index + 1}`}:</strong>{" "}
                            {answer}
                        </div>
                    ))
                ) : (
                <div>
                    {answers.length > 0 && location.state.username ? (
                        answers.map((answer, index) => (
                            <div
                                key={index}
                                className={`answer-item ${
                                    questions[index].choices[questions[index]?.correctAnswer] === answer ? "correct" : "incorrect"
                                }`}
                            >
                                <strong>{questions[index]?.question || `Question ${index + 1}`}:</strong>{" "}
                                {answer}
                            </div>
                        ))
                    ):(
                        <p>No answers to display</p>
                    )}
                </div>
                )}

                {/* Button */}
                <div className="button-container">
                    <button onClick={FinishQuiz} className="finish-button">
                        Finish
                    </button>
                </div>
            </div>
        </div>
    );
}

export default Finish;
