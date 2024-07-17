import { Navigate, BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useState, useCallback } from 'react';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';

import Home from './components/Home';
import Navbar from './components/Navbar';
import Login from './components/Login';
import Signup from './components/Signup';
import SearchResults from './components/SearchResults';
import RefreshHandler from './RefreshHandler';
import BottomNav from './components/BottomNav';
import Profile from './components/Profile';

function App() {
  const [category, setCategory] = useState('10');
  const [isAuth, setIsAuth] = useState(false);
  const [audioUrl, setAudioUrl] = useState(null);
  const [audioTitle, setAudioTitle] = useState('');
  const [channelName, setChannelName] = useState('');
  const [bottomNav, setBottomNav] = useState(false);
  const [imsSrc, setImsSrc] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [videos, setVideos] = useState([]);

  const handleCategoryChange = (categoryId) => {
    setCategory(categoryId);
  };

  const handlePlay = (videoUrl, title, channel, imageUrl, index) => {
    setAudioUrl(videoUrl);
    setAudioTitle(title);
    setChannelName(channel);
    setImsSrc(imageUrl);
    setCurrentIndex(index);
    setBottomNav(true);
  };

  const handleNext = useCallback(() => {
    const nextIndex = (currentIndex + 1) % videos.length;
    const nextVideo = videos[nextIndex];
    handlePlay(nextVideo.videoId, nextVideo.title, nextVideo.channel, nextVideo.thumbnailUrl, nextIndex);
  }, [currentIndex, videos]);

  const handlePrevious = useCallback(() => {
    const prevIndex = (currentIndex - 1 + videos.length) % videos.length;
    const prevVideo = videos[prevIndex];
    handlePlay(prevVideo.videoId, prevVideo.title, prevVideo.channel, prevVideo.thumbnailUrl, prevIndex);
  }, [currentIndex, videos]);

  const PrivateRoute = ({ element }) => {
    return isAuth ? element : <Navigate to='/login' />;
  };

  return (
    <>
      <Router>
        <RefreshHandler setIsAuth={setIsAuth} />
        <Navbar onCategoryChange={handleCategoryChange} />
        <Routes>
          <Route exact path='/' element={<Navigate to='/login' />} />
          <Route exact path='/home' element={<PrivateRoute element={<Home category={category} onPlay={handlePlay} />} />} />
          <Route
            path='/search'
            element={
              <SearchResults
                onPlay={handlePlay}
                videos={videos}
                setVideos={setVideos}
              />
            }
          />
          <Route exact path='/login' element={<Login />} />
          <Route exact path='/signup' element={<Signup />} />
          <Route exact path='/profile' element={<Profile/>}/>
        </Routes>
        {bottomNav && (
          <BottomNav
            audioUrl={audioUrl}
            audioTitle={audioTitle}
            state={bottomNav}
            channelName={channelName}
            imsSrc={imsSrc}
            onNext={handleNext}
            onPrevious={handlePrevious}
          />
        )}
      </Router>
    </>
  );
}

export default App;