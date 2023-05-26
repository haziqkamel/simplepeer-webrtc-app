import React, { useEffect } from 'react';
import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import JoinRoomPage from './JoinRoomPage/JoinRoomPage';
import RoomPage from './RoomPage/RoomPage';
import IntroductionPage from './IntroductionPage/IntroductionPage';
import { connectWithSocketIOServer } from './utils/wss';

function App() {

  useEffect(() => {
    connectWithSocketIOServer()
  }, [])

  return (
    <Router>
      <Routes>
        <Route exact path="/join-room" Component={JoinRoomPage} />
        <Route exact path="/room" Component={RoomPage} />
        <Route exact path="/" Component={IntroductionPage} />
      </Routes>
    </Router>
  );
}

export default App;
