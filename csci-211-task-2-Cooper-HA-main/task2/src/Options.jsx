import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from "react-router-dom";
import { getDatabase, ref, set, get, child } from 'firebase/database';
import './styles/User.css';

function Options() {
    const navigate = useNavigate();
    const location = useLocation(); 

    const [username, setUsername] = useState("");
    const [isAdmin, setIsAdmin] = useState(false);
    const [userGroups, setUserGroups] = useState([]);
    const [allGroups, setAllGroups] = useState([]);
    const [groupName, setGroupName] = useState("");
    const [code, setCode] = useState("");
    const [error, setError] = useState("");

    // Load user data on mount
    useEffect(() => {
        const db = getDatabase();
        const userRef = ref(db, 'users/' + username);

        get(userRef).then((snapshot) => {
            if (snapshot.exists()) {
                const userData = snapshot.val();
                console.log(userData);
                console.log(location.state.username);
                setUsername(location.state.username);
                setIsAdmin(userData.isAdmin);
                console.log(userData.isAdmin);
                setUserGroups(Object.keys(userData.groups || {}));
            }
        }).catch((error) => {
            setError("Error loading user data: " + error.message);
        });

        // Load all groups
        const groupsRef = ref(db, 'groups');
        get(groupsRef).then((snapshot) => {
            if (snapshot.exists()) {
                const groupsData = snapshot.val();
                setAllGroups(Object.values(groupsData || {}));
            }
        }).catch((error) => {
            setError("Error loading groups: " + error.message);
        });
    }, [username]);

    function dataload(){
        const db = getDatabase();
        const userRef = ref(db, 'users/' + username);

        get(userRef).then((snapshot) => {
            if (snapshot.exists()) {
                const userData = snapshot.val();
                console.log(userData);
                console.log(location.state.username);
                setUsername(location.state.username);
                setIsAdmin(userData.isAdmin);
                console.log(userData.isAdmin);
                setUserGroups(Object.keys(userData.groups || {}));
            }
        }).catch((error) => {
            setError("Error loading user data: " + error.message);
        });

        // Load all groups
        const groupsRef = ref(db, 'groups');
        get(groupsRef).then((snapshot) => {
            if (snapshot.exists()) {
                const groupsData = snapshot.val();
                setAllGroups(Object.values(groupsData || {}));
            }
        }).catch((error) => {
            setError("Error loading groups: " + error.message);
        });
    }
    function generateRandomCode(length = 8) {
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';
        for (let i = 0; i < length; i++) {
            result += characters.charAt(Math.floor(Math.random() * characters.length));
        }
        return result;
    }
    // Handle group creation
    const createGroup = () => {
        if (!groupName) {
            setError("Please enter a group name.");
            return;
        }
    
        const db = getDatabase();
        const sanitizedUsername = username // Replace invalid characters with an underscore
        const groupRef = ref(db, 'groups/' + groupName);
    
        // Create group in Firebase
        set(groupRef, {
            groupName: groupName,
            admin: sanitizedUsername,
            members: {
                [sanitizedUsername]: true
            },
            joinCode: generateRandomCode(),
            latest: {latestQuiz:{date: "null", id: "null"}}
        }).then(() => {
            // Add this group to user's list of groups (sanitize username here as well)
            const userRef = ref(db, 'users/' + sanitizedUsername + '/groups/' + groupName);
            set(userRef, true);
    
            setGroupName(""); // Clear group name input
            setError(""); // Clear error message
            dataload();
        }).catch((error) => {
            setError("Error creating group: " + error.message);
        });
    };
    
    const handleCodeChange = (code) => {
        setCode(code);
    }
    const handleCodeEnter = () => {
        for(const group of allGroups){
            console.log(group.joinCode);
            if(group.joinCode == code){
                joinGroup(group.groupName);
                return;
            }
            
        }
        setError("Error joining group: Group Not Found");

    }
    // Handle joining a group
    const joinGroup = (group) => {
        const db = getDatabase();
        const groupRef = ref(db, 'groups/' + group + '/members/' + username);
        set(groupRef, true).then(() => {
            // Add this group to user's list of groups
            const userRef = ref(db, 'users/' + username + '/groups/' + group);
            set(userRef, true);
            dataload();
        }).catch((error) => {
            setError("Error joining group: " + error.message);
        });
    };
    const handleGroupClick = (groupName) => {
        const db = getDatabase();
        const groupRef = ref(db, 'groups/' + groupName);
        
        // Fetch the group data
        get(groupRef).then((snapshot) => {
            if (snapshot.exists()) {
                const groupData = snapshot.val();

                if (isAdmin) {
                    // Admin and quiz not created today, go to quiz creation page
                    navigate('/admin', { state: { groupName, username:username, quizId:groupData.latest.latestQuiz.id} });
                } else {
                    // Otherwise, go to the quiz page
                    navigate('/quizPage', { state: { groupName, username:username, quizId:groupData.latest.latestQuiz.id } });
                }
            } else {
                setError("Group data not found.");
            }
        }).catch((error) => {
            setError("Error fetching group data: " + error.message);
        });
    };

    return (
        <div className="options-container">
            <h1>User Control</h1>
            <h3>Welcome, {username}</h3>
            {isAdmin && <p>You are an admin in all groups!</p>}
            
            {/* Display user's groups */}
            <div>
                <h2>Your Groups</h2>
                {userGroups.length > 0 ? (
                    <ul>
                        {userGroups.map((group) => (
                            <li key={group} onClick={() => handleGroupClick(group)}>
                                {group}
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>You are not in any groups yet.</p>
                )}
            </div>

            {/* Display all available groups */}
            <div>
                <h2>Join Groups</h2>
                <input
                    type="text"
                    placeholder="Enter Group Code"
                    value={code}
                    onChange={(e) => handleCodeChange(e.target.value)}
                />
                <button onClick={handleCodeEnter}>Join Group</button>
            </div>

            {/* Create a new group */}
            <div>
                <h2>Create a New Group</h2>
                <input
                    type="text"
                    placeholder="Enter Group Name"
                    value={groupName}
                    onChange={(e) => setGroupName(e.target.value)}
                />
                <button onClick={createGroup}>Create Group</button>
            </div>

            {error && <p className="error-message">{error}</p>}
        </div>
    );
}

export default Options;
