import { Navigate, BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useState, useCallback, useEffect } from 'react';
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
import Channel from './components/Channel';
import About from './components/About';

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
  const [queue, setQueue] = useState([]);
  const [ended, setEnded] = useState(false);
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

  const handleAddToQueue = (song) => {
    setQueue((prevQueue) => [...prevQueue, song]);
  };

  const handleNext = useCallback(() => {
    if (queue.length > 0) {
      const nextSong = queue.shift();
      setQueue(queue);
      handlePlay(nextSong.videoId, nextSong.title, nextSong.channel, nextSong.thumbnailUrl, currentIndex + 1);
    }
  }, [queue, currentIndex]);

  const handlePrevious = useCallback(() => {
    if (videos.length > 0) {
      const prevIndex = (currentIndex - 1 + videos.length) % videos.length;
      const prevVideo = videos[prevIndex];
      handlePlay(prevVideo.videoId, prevVideo.title, prevVideo.channel, prevVideo.thumbnailUrl, prevIndex);
    }
  }, [currentIndex, videos]);

  useEffect(() => {
    if (ended) {
      if (queue.length > 0) {
        const nextSong = queue.shift();
        handlePlay(nextSong.videoId, nextSong.title, nextSong.channel, nextSong.thumbnailUrl, currentIndex + 1);
        setEnded(false);
      };
    }
  }, [ended, currentIndex, queue]);

  useEffect(() => {
    const audioElement = document.getElementById('ytplayer');
    if (audioElement) {
      audioElement.addEventListener('ended', handleNext);
      return () => {
        audioElement.removeEventListener('ended', handleNext);
      };
    }
  }, [handleNext]);

  const PrivateRoute = ({ element }) => {
    return isAuth ? element : <Navigate to='/login' />;
  };

  return (
    <>
      <Router>
        <RefreshHandler setIsAuth={setIsAuth} />
        <Navbar onCategoryChange={handleCategoryChange} />
        <Routes>
          <Route path='/' element={<Navigate to='/home' />} />
          <Route path='/home' element={<PrivateRoute element={<Home category={category} onPlay={handlePlay} handleAddToQueue={handleAddToQueue} />} />} />
          <Route path='/search' element={<SearchResults onPlay={handlePlay} videos={videos} setVideos={setVideos} handleAddToQueue={handleAddToQueue} />} />
          <Route path='/login' element={<Login setIsAuth={setIsAuth} />} />
          <Route path='/signup' element={<Signup />} />
          <Route path='/profile' element={<PrivateRoute element={<Profile />} />} />
          <Route path='/channel' element={<Channel onPlay={handlePlay} handleAddToQueue={handleAddToQueue} />} />
          <Route path='/about' element={<About />} />
        </Routes>
        {bottomNav && (
          <BottomNav
            audioUrl={audioUrl}
            audioTitle={audioTitle}
            state={bottomNav}
            channelName={channelName}
            imsSrc={imsSrc}
            setEnded={setEnded}
            onNext={handleNext}
            onPrevious={handlePrevious}
          />
        )}
      </Router>
    </>
  );
}

export default App;