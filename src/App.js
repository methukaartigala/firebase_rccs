import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import ListUsers from './components/ListUsers';
import AddUsers from './components/AddUsers';
import ListMeetings from './components/ListMeetings'; // Assuming you have a ListMeetings component
import './App.css';
import Users from './components/Users';

function App() {
  return (
    <Router>
      <div>
        <div className="navigation">
          <Link to="/users">
            <button>Users</button>
          </Link>
          <Link to="/meetings">
            <button>Meetings</button>
          </Link>
        </div>

        <div className="content">
          <Routes>
            <Route path="/users" element={<Users />} />
            <Route path="/meetings" element={<ListMeetings />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
