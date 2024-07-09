import './App.css';
import Home from './components/Home';
import Navbar from './components/Navbar';
import Login from './components/Login';
import Footer from './components/Footer';
import SearchResults from './components/SearchResults';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useState } from 'react';

function App() {
  const [category, setCategory] = useState("10");

  const handleCategoryChange = (categoryId) => {
    setCategory(categoryId);
  };

  return (
    <>
      <Router>
        <Navbar onCategoryChange={handleCategoryChange} />
        <Routes>
          <Route exact path='/' element={<Home category={category} />} />
          <Route path="/search" component={SearchResults} />
          <Route exact path='/login' element={<Login />} />
        </Routes>
        <Footer />
      </Router>
    </>
  );
}

export default App;
