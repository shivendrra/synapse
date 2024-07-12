import { Navigate, BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useState } from 'react';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';

import Home from './components/Home';
import Navbar from './components/Navbar';
import Login from './components/Login';
import Signup from './components/Signup';
import SearchResults from './components/SearchResults';
import RefreshHandler from './RefreshHandler';

function App() {
  const [category, setCategory] = useState('10');
  const [isAuth, setIsAuth] = useState(false);

  const PrivateRoute = ({ element }) => {
    return isAuth ? element : <Navigate to='/login' />
  }

  const handleCategoryChange = (categoryId) => {
    setCategory(categoryId);
  };

  return (
    <>
      <Router>
        <RefreshHandler setIsAuth={setIsAuth}/>
        <Navbar onCategoryChange={handleCategoryChange} />
        <Routes>
          <Route exact path='/' element={<Navigate to='/login' />} />
          <Route exact path='/home' element={<PrivateRoute element={<Home category={category} />} />} />
          <Route path='/search' element={<SearchResults />} />
          <Route exact path='/login' element={<Login />} />
          <Route exact path='/signup' element={<Signup />} />
        </Routes>
      </Router>
    </>
  );
}

export default App;