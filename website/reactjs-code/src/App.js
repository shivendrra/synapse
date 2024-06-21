import './App.css';
// Importing components
import Home from './components/Homepage';
import Navbar from './components/Navbar';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

function App() {
  return (
    <>
      <Router>
        <Navbar/>
        <Routes>
          <Route exact path='/' Component={() => (<Home/>)}/>
        </Routes>
      </Router>
    </>
  );
}

export default App;
