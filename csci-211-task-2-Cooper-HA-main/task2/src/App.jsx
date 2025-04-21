import Welcome from './welcome.jsx'
import Quiz from './quiz.jsx'
import Login from "./Login";
import Options from "./Options.jsx"
import Finish from './finish.jsx'
import UserFinish from './userFinish.jsx'
import Create from './create.jsx'
import Edit from './edit.jsx'
import QuizCreation from "./quiz-create.jsx"
import QuizCMC from "./quiz-CMC.jsx"
import QuizPage from "./quizPage.jsx"
import GroupAdmin from "./admin.jsx"
import UserAnswersPage from "./UserAnswers.jsx";
import QuizAnswersPage from "./QuizAnswers.jsx";


import { Routes, Route } from "react-router-dom";

function App() {
  

  return (
    <Routes>
      <Route path="/" element={<Welcome />}/>
      <Route path="/quiz" element={<Quiz />}/>
      <Route path="/quiz-create" element={<QuizCreation />}/>
      <Route path="/quizPage" element={<QuizPage />}/>
      <Route path="/login" element={<Login />} />
      <Route path="/options" element={<Options />} />
      <Route path="/done" element={<Finish />}/>
      <Route path="/doneUser" element={<UserFinish />}/>
      <Route path="/create" element={<Create />}/>
      <Route path="/createMC" element={<QuizCMC />}/>
      <Route path="/edit" element={<Edit />}/>
      <Route path="/admin" element={<GroupAdmin />}/>
      <Route path="/user-answers" element={<UserAnswersPage />}/>
      <Route path="/quiz-answers" element={<QuizAnswersPage />}/>

    </Routes>
  )

}

export default App
