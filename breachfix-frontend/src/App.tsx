import { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { useAuthStore } from './context/AuthContext';
import { DonationProvider } from './context/DonationContext';
import Header from './components/layout/Header';
import Home from './pages/Home';
import Media from './pages/Media';
import Movies from './pages/Movies';
import TVShows from './pages/TVShows';
import Episodes from './pages/Episodes';
import Bible from './pages/Bible';
import BibleRead from './pages/BibleRead';
import BibleEdit from './pages/BibleEdit';
import BibleMyEdits from './pages/BibleMyEdits';
import BibleAdmin from './pages/BibleAdmin';
import Changed from './pages/Changed';
import Profile from './pages/Profile';
import Auth from './pages/Auth';
import MovieDetail from './pages/MovieDetail';
import TVShowDetail from './pages/TVShowDetail';
import EpisodeDetail from './pages/EpisodeDetail';
import VideoPlayer from './pages/VideoPlayer';
import Admin from './pages/Admin';
import Accounts from './pages/Accounts';
import Favorites from './pages/Favorites';
import DonationTest from './pages/DonationTest';
import DonationSuccess from './pages/DonationSuccess';
import './App.css';

function App() {
  const { initializeAuth } = useAuthStore();

  useEffect(() => {
    // Initialize auth state when the app loads
    initializeAuth();
  }, [initializeAuth]);

  return (
    <DonationProvider>
      <div className="app bg-netflix-black min-h-screen">
        <Header />
        <main className="pt-16">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/media" element={<Media />} />
          <Route path="/episodes" element={<Episodes />} />
          <Route path="/media/movies/:id" element={<MovieDetail />} />
          <Route path="/media/tvshows/:id" element={<TVShowDetail />} />
          <Route path="/media/episodes/:id" element={<EpisodeDetail />} />
          {/* Legacy routes for backward compatibility */}
          <Route path="/movies" element={<Movies />} />
          <Route path="/movies/:id" element={<MovieDetail />} />
          <Route path="/tvshows" element={<TVShows />} />
          <Route path="/tvshows/:id" element={<TVShowDetail />} />
          <Route path="/episodes/:id" element={<EpisodeDetail />} />
          <Route path="/bible" element={<Bible />} />
          <Route path="/bible/read" element={<BibleRead />} />
          <Route path="/bible/edit" element={<BibleEdit />} />
          <Route path="/bible/my-edits" element={<BibleMyEdits />} />
          <Route path="/bible/admin" element={<BibleAdmin />} />
          <Route path="/changed" element={<Changed />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/accounts" element={<Accounts />} />
          <Route path="/favorites" element={<Favorites />} />
          <Route path="/donation-test" element={<DonationTest />} />
          <Route path="/donation-success" element={<DonationSuccess />} />
          <Route path="/login" element={<Auth />} />
          <Route path="/signup" element={<Auth />} />
          <Route path="/watch/:type/:id" element={<VideoPlayer />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
        </main>
      </div>
    </DonationProvider>
  );
}

export default App;
