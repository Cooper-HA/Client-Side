import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { getDatabase, ref, onValue, remove, set } from "firebase/database";
import "./styles/GroupAdmin.css";

function GroupAdmin() {
    const location = useLocation(); 
    const groupId = location.state.groupName;
    const navigate = useNavigate();
    const [groupDetails, setGroupDetails] = useState({});
    const [members, setMembers] = useState([]);
    const [quizzes, setQuizzes] = useState([]);
    const [GquizId, setGQuizId] = useState("");
    const [error, setError] = useState("");

    useEffect(() => {
        dataload();
        setGQuizId(location.state.quizId);
    }, [groupId]);

    function dataload() {
        const db = getDatabase();
        const groupRef = ref(db, `groups/${groupId}`);
        const quizzesRef = ref(db, `groups/${groupId}/quizzes`);
        onValue(
            groupRef,
            (snapshot) => {
                if (snapshot.exists()) {
                    const data = snapshot.val();
                    setGroupDetails(data);
                    setMembers(Object.keys(data.members) || []);
                } else {
                    setError("Group not found.");
                }
            },
            (error) => {
                setError("Error fetching group data: " + error.message);
            }
        );

        onValue(
            quizzesRef,
            (snapshot) => {
                if (snapshot.exists()) {
                    setQuizzes(Object.entries(snapshot.val()).map(([id, details]) => ({ id, ...details })));
                } else {
                    setQuizzes([]);
                }
            },
            (error) => {
                setError("Error fetching quizzes: " + error.message);
            }
        );
    }

    const handleRemoveMember = (memberId) => {
        const db = getDatabase();
        const groupMemberRef = ref(db, `groups/${groupId}/members/${memberId}`);
        const userGroupRef = ref(db, `users/${memberId}/groups/${groupId}`);

        remove(groupMemberRef)
            .then(() => remove(userGroupRef))
            .then(() => {
                setMembers(members.filter((member) => member !== memberId));
                dataload();
            })
            .catch((error) => {
                alert("Error removing member: " + error.message);
            });
    };

    const handleCreateQuiz = () => {
        navigate('/quiz-create', { state: { groupName: groupId, username: location.state.username } });
    };

    const handleTakeQuiz = () => {
        if(GquizId == "null"){
            setError("No Quizzes to Take")
        }else{
            console.log(GquizId);
            navigate('/quizPage', { state: { groupName: groupId, username: location.state.username, quizId:GquizId } });
        }
    };

    const handleActivateQuiz = (quizId) => {
        setGQuizId(quizId);
        const db = getDatabase();
        const groupRef = ref(db, `groups/${groupId}/latest`);
        set(groupRef, {
            latestQuiz: {
                id: quizId,
                date: new Date().toISOString().split('T')[0], 
            },
        }).then(() => {
            })
            .catch((error) => {
                alert("Error activating quiz: " + error.message);
            });
    };
    const handleRemoveQuiz = (quizId) => {
        const db = getDatabase();
        const quizRef = ref(db, `groups/${groupId}/quizzes/${quizId}`);
    
        remove(quizRef)
            .then(() => {
                setQuizzes(quizzes.filter((quiz) => quiz.id !== quizId));
            })
            .catch((error) => {
                alert("Error removing quiz: " + error.message);
            });
    };

    function handleViewUserAnswers (member) {
        navigate("/user-answers", { state: { member, groupName: location.state.groupName } });
    }
    const handleViewQuizAnswers = (quizId) =>{
        navigate("/quiz-answers", { state: { quizId, groupName: location.state.groupName } });
    }

    const handleReturn = () => {
        navigate('/options', { state: { username: location.state.username } });
    }
    return (
        <div className="group-admin-container">
            <header>
                <h1>Admin Dashboard for {groupId}</h1>
                <p className="group-description">Join Code: {groupDetails.joinCode}</p>
                <button onClick={handleReturn}>
                    Return to User
                </button>
            </header>

            <section className="actions">
                <button onClick={handleCreateQuiz} className="btn primary-btn">
                    Create Quiz
                </button>
                <button onClick={handleTakeQuiz} className="btn secondary-btn">
                    Take Quiz
                </button>
            </section>

            <section className="members-section">
                <h2>Members</h2>
                {members.length > 0 ? (
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {members.map((member) => (
                                <tr key={member}>
                                    <td>{member}</td>
                                    <td>
                                        <div className="button-container">
                                            <button
                                                onClick={() => handleRemoveMember(member)}
                                                className="btn remove-btn"
                                            >
                                                Remove
                                            </button>
                                            <button onClick={() => handleViewUserAnswers(member) } className="btn primary-btn">
                                                View
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <p>No members found.</p>
                )}
            </section>
            <section className="quizzes-section">
                <h2>Quizzes</h2>
                {quizzes.length > 0 ? (
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Quiz Name</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {quizzes.map((quiz) => (
                                <tr key={quiz.id}>
                                    <td>{quiz.title}</td>
                                    <td>
                                        <div className="button-container">
                                            <button
                                                onClick={() => handleActivateQuiz(quiz.id)}
                                                className="btn activate-btn"
                                            >
                                                Activate
                                            </button>
                                            <button
                                                onClick={() => handleRemoveQuiz(quiz.id)}
                                                className="btn remove-quiz-btn"
                                            >
                                                Remove
                                            </button>
                                            <button onClick={() => handleViewQuizAnswers(quiz.id)} className="btn primary-btn">
                                                View
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>

                    </table>
                ) : (
                    <p>No quizzes available.</p>
                )}
            </section>
            {error && <div className="error">{error}</div>}

        </div>
    );
}

export default GroupAdmin;
