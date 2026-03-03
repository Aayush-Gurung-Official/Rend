import { Routes, Route, Navigate, Link } from 'react-router-dom';
import HomePage from './pages/Home/HomePage.jsx';
import LoginPage from './pages/Auth/LoginPage.jsx';
import DashboardPage from './pages/Dashboard/DashboardPage.jsx';
import ChatPage from './pages/Chat/ChatPage.jsx';
import ProfilePage from './pages/Profile/ProfilePage.jsx';
import BrowseListingsPage from './pages/Listings/BrowseListingsPage.jsx';

const App = () => {
  return (
    <div className="app">
      <header className="app-header">
        <Link to="/" className="logo">
          <span className="logo-mark">R</span>
          <span className="logo-text">Rend</span>
        </Link>
        <nav>
          <Link to="/listings">Browse</Link>
          <Link to="/chat">Chat</Link>
          <Link to="/dashboard">Dashboard</Link>
          <Link to="/login">Login</Link>
        </nav>
      </header>
      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/chat" element={<ChatPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/listings" element={<BrowseListingsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
};

export default App;

