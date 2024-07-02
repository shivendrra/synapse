import './App.css';
import Home from './components/Home';
import Navbar from './components/Navbar';
import Login from './components/Login';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

function App(){
  return (
    <>
      <Router>
        <Navbar />
        <Routes>
          <Route exact path='/' Component={() => (<Home/>)}/>
          <Route exact path='/login' Component={() => (<Login/>)}/>
        </Routes>
      </Router>
    </>
  );
}
export default App;