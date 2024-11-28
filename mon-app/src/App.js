import './App.css';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import AcceuilPage from './accueil/accueil';
import LogForm from './log/login';
import Hub from './hub/hub';
import SubForm from './subscribe/subForm';
import { AuthProvider } from './context/AuthContext';
import { ConversationProvider } from './context/ConversationContext';


function App() {

  return (
  <AuthProvider>
    <Router>
    <Routes>
      <Route path="/" element={<AcceuilPage />} />
      <Route path="sub" element={<SubForm />} />
      <Route path="login" element={<LogForm />} />
      <Route 
          path="hub" 
          element={
            <ConversationProvider>
              <Hub />
            </ConversationProvider>
          } 
        />
      <Route path="*" element={<AcceuilPage />} />
    </Routes>
  </Router>
</AuthProvider>

  );
}

export default App;
