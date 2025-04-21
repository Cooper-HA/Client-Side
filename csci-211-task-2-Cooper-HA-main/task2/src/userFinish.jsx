import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { getDatabase, ref, set } from "firebase/database";

import "./styles/UserFinish.css"; // New CSS file for styling
import AxiosClient2 from "./AxiosClient2.js";

function UserFinish() {
  const navigate = useNavigate();
  const location = useLocation();
  const client = AxiosClient2();

  const [answers, setAnswers] = useState([]);
  const [questions, setQuestions] = useState([]);

  useEffect(() => {
    try {
      setAnswers(Object.values(location.state.answers));
      console.log(Object.values(location.state.answers));
    } catch {
      console.log("No answers using empty array");
    }

    client
      .get(
        `/groups/${location.state.groupName}/quizzes/${location.state.quizId}/questions.json`
      )
      .then((response) => {
        const data = response.data;

        if (data) {
          setQuestions(data);
          console.log(data);
        } else {
          console.log("No questions found.");
        }
      })
      .catch((error) => {
        console.error("Error while getting questions:", error);
      });
  }, []);

  function returnToWelcome() {
    navigate("/quizPage", {
      state: {
        groupName: location.state.groupName,
        username: location.state.username,
        quizId: location.state.quizId,
      },
    });
  }

  function continueToCreate() {
    const db = getDatabase();
    const groupRef = ref(
      db,
      `groups/${location.state.groupName}/quizzes/${location.state.quizId}/answers/${location.state.username}`
    );
    set(groupRef, {
      user: location.state.username,
      answers: answers,
    })
      .then(() => {
        navigate("/options", { state: { username: location.state.username } });
      })
      .catch((error) => {
        console.error("Error submitting answers:", error.message);
      });
  }

  return (
    <div className="user-finish-container">
      <div className="user-finish-card">
        <h2 className="user-finish-title">Thank You for Taking This Quiz!</h2>

        <div className="user-finish-answers">
          {answers.length > 0 ? (
            answers.map((answer, index) => (
              <div
                key={index}
                className="user-finish-answer-item"
              >
                <strong>Q{index + 1}: </strong>
                {questions[index] || "Question not found"} <br />
                <span className="user-finish-answer">{answer}</span>
              </div>
            ))
          ) : (
            <p className="user-finish-no-answers">No answers to display</p>
          )}
        </div>

        <div className="user-finish-buttons">
          <button onClick={returnToWelcome} className="user-finish-button retake">
            Retake
          </button>
          <button onClick={continueToCreate} className="user-finish-button submit">
            Submit
          </button>
        </div>
      </div>
    </div>
  );
}

export default UserFinish;
