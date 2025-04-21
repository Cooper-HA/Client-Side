import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./styles/quizPage.css";
import { ref, get, database } from './firebase'; // Importing necessary Firebase functions

function Quiz() {
    // Variable creation
    const location = useLocation();
    const navigate = useNavigate();

    const [question, setQuestion] = useState({
        "id": 0,
        "name": "Q0",
        "legend": "",
        "numOptions": 0,
        "option1": "",
        "answer": ""
    });
    const [questions, setQuestions] = useState([]);
    const [options, setOptions] = useState([]);
    const [id, setId] = useState(1);
    const [answers, setAnswers] = useState([]);
    const isFirstQuestion = id === 1;
    const isLastQuestion = id === questions.length;

    // Load initial data
    useEffect(() => {
        if(!location.state.username){
            GuestDataLoad()
        }
        else{
            UserDataLoad(location.state)
        }
    }, [location.state.id]);
    const UserDataLoad = (state) => {
        // If state exists, set data
        setId(1)
        // Fetch all questions' keys from Firebase
        const questionsRef = ref(database, `groups/${state.groupName}/quizzes/${state.quizId}/questions`);
        
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
                }
            })
            .catch((error) => {
                console.log("Error while getting questions: " + error);
            });
                
    }
    const GuestDataLoad = () => {
        // If state exists, set data
        try {
            console.log(location.state.id);
            setId(location.state.id);

            // If we have an ID, we will be editing an existing one
            try {
                setAnswers(location.state.answers);
            } catch {
                console.log("No answers, using empty array");
            }
        } catch (error) {
            console.log("Error getting state: " + error);
        }

        // Fetch all questions' keys from Firebase
        const questionsRef = ref(database, "questions/");
        
        get(questionsRef)
            .then((snapshot) => {
                
                if (snapshot.exists()) {
                    const questionsData = snapshot.val();
                    const questionKeys = Object.keys(questionsData); // Get all the Firebase keys for questions
                    console.log(questionKeys);
                    setQuestions(questionKeys); // Store the keys as the list of question IDs
                    loadQuestionData(questionKeys[0]); // Load the first question based on the provided ID
                } else {
                    console.log("No questions found in the database.");
                }
            })
            .catch((error) => {
                console.log("Error while getting questions: " + error);
            });
                
    }
    // Function to load a specific question by ID
    const loadQuestionData = (questionId) => {
        if(!location.state.groupName){
            const questionRef = ref(database, `questions/${questionId}`);
            get(questionRef)
            .then((snapshot) => {
                if (snapshot.exists()) {
                    const questionData = snapshot.val();
                    console.log(questionData);
                    setQuestion(questionData);
                    setOptions(
                        shuffleArray(Array.from({ length: questionData.numOptions }, (_, i) => i + 1))
                    );
                } else {
                    console.log("No question found with the specified ID.");
                }
            })
            .catch((error) => {
                console.log("Error getting question data: " + error);
            });
        }else{
            const questionRef = ref(database, `groups/${location.state.groupName}/quizzes/${location.state.quizId}/questions/${questionId}`);
            get(questionRef)
            .then((snapshot) => {
                if (snapshot.exists()) {
                    const questionData = snapshot.val();
                    console.log(questionData);
                    setQuestion(questionData.question);
                    setOptions(
                        shuffleArray(questionData.choices)
                    );
                } else {
                    console.log("No question found with the specified ID.");
                }
            })
            .catch((error) => {
                console.log("Error getting question data: " + error);
            });
        }

    };

    // Load answers after having loaded questions
    useEffect(() => {
        console.log(questions.length)
        if (questions.length>-1) {
            setAnswers(new Array(questions.length).fill(null)); // Initialize answers to match questions length
            console.log("asnwers");
            console.log(answers);
        }
    }, [questions]);

    // Move to next question
    function nextQuestion() {
        const nextId = id < questions.length ? id + 1 : id;
        loadQuestionData(questions[nextId - 1]); // Load next question based on the next ID
        setId(nextId);
    }

    // Move to previous question
    function prevQuestion() {
        const prevId = id > 1 ? id - 1 : id;
        loadQuestionData(questions[prevId - 1]); // Load previous question based on the previous ID
        setId(prevId);
    }

    // Set selected option to input value
    function handleOptionChange(event) {
        const selectedOption = event.target.value;

        setAnswers((prevAnswers) => {
            const updatedAnswers = [...prevAnswers];
            updatedAnswers[id - 1] = selectedOption; // Update answer for the current question
            return updatedAnswers;
        });
    }

    // Move to results page if we have answered all questions
    function Finish() {
        if (validate(answers)) {
            if(!location.state.username){
                navigate("/done", { state: { answers: answers } });
            }else{
                navigate("/done", { state: { answers: answers, username:location.state.username, groupName:location.state.groupName, quizId:location.state.quizId } });
            }
        }
    }

    // Shuffle array function
    function shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }

    // Make sure we have answered all questions
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

    // Make sure we have loaded everything we need
    if (!questions.length) {
        return (
            <div>
                Loading...
            </div>
        );
    }

    return (
        <>
        <div id = "all-quiz">

        <div id = "quiz" className = "quiz_center">
            <span id = "INFO">
                <span>Question: <span id = "questionNumber">{id}</span>  
                </span>
            </span>
            {/* quiz form / questions */}
            <form name="quiz_form" id="quiz_form" method="get">          
            {question && !location.state.username ? (
                <fieldset>
                    <legend>{question.legend}</legend>
                    {options.map((num) => {
                        const optionText = question[`option${num}`];
                        return (
                            <div key={optionText}>
                                <input
                                    type="radio"
                                    id={optionText}
                                    name={question.name}
                                    value={optionText}
                                    checked={answers[id - 1] === optionText || false} // Ensure a fallback
                                    onChange={handleOptionChange}
                                />
                                <label htmlFor={optionText}>{optionText}</label>
                            </div>
                        );
                    })}
                </fieldset>
                ) : (
                    <div>
                    {question && location.state.username? (
                        <fieldset>
                        <legend>{question}</legend>
                        {options.map((num) => {
                            const optionText = num;
                            return (
                                <div key={optionText}>
                                    <input
                                        type="radio"
                                        id={optionText}
                                        name={question.question}
                                        value={optionText}
                                        checked={answers[id - 1] === optionText || false} // Ensure a fallback
                                        onChange={handleOptionChange}
                                    />
                                    <label htmlFor={optionText}>{optionText}</label>
                                </div>
                            );
                        })}
                    </fieldset>
                    ) : (
                        <div>No question to display</div> // Fallback message when no question is available
                    )}
                    </div>
                )}
            </form>
            {/* buttons */}
            <div id = "warning"></div>
            <div className="button-container">
                {!isFirstQuestion && <button onClick = {prevQuestion} id = "prev">Previous</button>}
                {!isLastQuestion &&<button onClick = {nextQuestion} id = "next">Next</button>}
                {isLastQuestion && <button onClick = {Finish} id = "Finish">Finish</button>}

            </div>


        </div>

        </div>
        </>
    )
}

export default Quiz;
