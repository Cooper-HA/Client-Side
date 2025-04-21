import React, { useState, useEffect } from "react";
import "./styles/App.css";
import { useLocation, useNavigate } from "react-router-dom";
import { database, ref, push, update, remove, get } from './firebase';

function Create() {
  // Variable creation
  const navigate = useNavigate();
  const location = useLocation();

  const [answers, setAnswers] = useState([]);
  const [numOptions, setNumOptions] = useState(1);
  const [options, setOptions] = useState([""]); // Start with one option
  const [correctValue, setCorrectValue] = useState("");
  const [prompt, setPrompt] = useState("");
  const [id, setId] = useState(null); // ID for internal purposes
  const [rendered, setRendered] = useState(false);

  // Load initial data
  useEffect(() => {
    try {
      setAnswers(Object.values(location.state.answers));
      if (location.state.id) {
        setId(location.state.id);
      }

      if (location.state.id) {
        retrieveQuestion(location.state.id); // Use Firebase key to retrieve question
      }
    } catch {
      console.log("No answers or Firebase key provided, using default values.");
    }
  }, [location.state]);

  // Retrieve question by Firebase key
  function retrieveQuestion(firebaseKey) {
    const questionRef = ref(database, `questions/${firebaseKey}`);
    console.log(firebaseKey)

    get(questionRef)
      .then((snapshot) => {
        if (snapshot.exists()) {
          console.log(snapshot)
          const question = snapshot.val();
          setPrompt(question.legend);
          setNumOptions(question.numOptions);

          const extractedOptions = Array.from(
            { length: question.numOptions },
            (_, i) => question[`option${i + 1}`]
          );

          setOptions(extractedOptions);
          setCorrectValue(question.answer);
          setRendered(true);
        } else {
          console.error("Question not found in the database.");
        }
      })
      .catch((error) => {
        console.error("Error retrieving question:", error);
      });
  }

  // Handle user inputs
  function handleNumOptionsChange(event) {
    const value = parseInt(event.target.value, 10) || 1;
    setNumOptions(value);

    // Adjust the options array dynamically
    if (value > options.length) {
      setOptions([...options, ...Array(value - options.length).fill("")]);
    } else {
      setOptions(options.slice(0, value));
    }
  }

  function handleOptionChange(index, event) {
    const updatedOptions = [...options];
    updatedOptions[index] = event.target.value;
    setOptions(updatedOptions);
  }

  function handleCorrectValueChange(event) {
    setCorrectValue(event.target.value);
  }

  function handlePromptChange(event) {
    setPrompt(event.target.value);
  }

  // Validate input before submission
  function validate() {
    return options.includes(correctValue);
  }

  // Add or update question
  function handleFinish() {
    if (!validate()) {
      document.getElementById("warning").innerHTML =
        "Please make sure your correct value is one of the available options.";
      return;
    }

    // Question object
    const newQuestion = {
      name: `Q${id || "New"}`,
      legend: prompt,
      numOptions: numOptions,
      ...options.reduce((acc, option, idx) => {
        acc[`option${idx + 1}`] = option;
        return acc;
      }, {}),
      answer: correctValue,
    };

    const questionsRef = ref(database, "questions");

    if (id) {
      // Update existing question
      const questionRef = ref(database, `questions/${id}`);
      update(questionRef, newQuestion)
        .then(() => console.log("Question updated successfully"))
        .catch((error) => console.error("Error updating question:", error));
    } else {
      // Add new question
      push(questionsRef, newQuestion)
        .then(() => console.log("Question added successfully"))
        .catch((error) => console.error("Error adding question:", error));
    }

    navigate("/done", { state: { answers } });
  }

  // Delete question
  function handleDelete() {
    const questionRef = ref(database, `questions/${id}`);
    remove(questionRef)
      .then(() => navigate("/done", { state: { answers } }))
      .catch((error) => {
        console.error("Error deleting question:", error);
        alert("Failed to delete the question. Please try again.");
      });
  }

  // Cancel and navigate back
  function handleCancel() {
    navigate("/done", { state: { answers } });
  }

  // Display
  return (
    <div id="all-quiz">
      <div id="instructions">
        <h2>Question Creation</h2>

        {/* Prompt */}
        <label htmlFor="prompt">Prompt:</label>
        <textarea
          rows="5"
          cols="40"
          id="prompt"
          value={prompt}
          onChange={handlePromptChange}
          className="fillable"
        ></textarea>

        {/* Number of Options */}
        <label htmlFor="numOptions">Number of Options:</label>
        <input
          type="number"
          id="numOptions"
          min="1"
          max="100"
          step="1"
          value={numOptions}
          onChange={handleNumOptionsChange}
          className="fillable"
        />

        {/* Options */}
        <ul id="options">
          {options.map((option, index) => (
            <li key={index}>
              <input
                type="text"
                value={option}
                onChange={(e) => handleOptionChange(index, e)}
                placeholder={`Option ${index + 1}`}
                className="fillable"
              />
            </li>
          ))}
        </ul>

        {/* Correct Value */}
        <label htmlFor="CV">Correct Value:</label>
        <input
          type="text"
          id="CV"
          value={correctValue}
          onChange={handleCorrectValueChange}
          className="fillable"
        />
        <div id="warning"></div>

        {/* Buttons */}
        <div className="button-container">
          <button onClick={handleFinish}>Finish</button>
          {id && <button onClick={handleDelete}>Delete</button>}
          <button onClick={handleCancel}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

export default Create;
