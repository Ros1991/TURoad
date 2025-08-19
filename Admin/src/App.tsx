import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { AuthProvider } from './hooks/useAuth';
import { ThemeProvider } from './contexts/ThemeContext';

// Layout components
import MainLayout from './layouts/MainLayout';
import AuthLayout from './layouts/AuthLayout';

// Auth pages
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';

// Main pages
import DashboardPage from './pages/DashboardPage';
import UsersPage from './pages/users/UsersPage';
import UserDetailsPage from './pages/users/UserDetailsPage';
import CreateUserPage from './pages/users/CreateUserPage';
import CategoriesPage from './pages/categories/CategoriesPage';
import CategoryDetailsPage from './pages/categories/CategoryDetailsPage';
import CitiesPage from './pages/cities/CitiesPage';
import CityDetailsPage from './pages/cities/CityDetailsPage';
import RoutesPage from './pages/routes/RoutesPage';
import RouteDetailsPage from './pages/routes/RouteDetailsPage';
import LocationsPage from './pages/locations/LocationsPage';
import LocationDetailsPage from './pages/locations/LocationDetailsPage';
import EventsPage from './pages/events/EventsPage';
import EventDetailsPage from './pages/events/EventDetailsPage';
import SettingsPage from './pages/SettingsPage';
import ProfilePage from './pages/ProfilePage';

// Protected route component
import ProtectedRoute from './components/auth/ProtectedRoute';

// Styles
import './styles/globals.css';

function App() {
  return (
    <ThemeProvider>
      <Router>
        <AuthProvider>
          <Routes>
            {/* Auth routes */}
            <Route element={<AuthLayout />}>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />
            </Route>

            {/* Protected routes */}
            <Route element={<ProtectedRoute />}>
              <Route element={<MainLayout />}>
                <Route path="/dashboard" element={<DashboardPage />} />
                
                {/* Users */}
                <Route path="/users" element={<UsersPage />} />
                <Route path="/users/new" element={<CreateUserPage />} />
                <Route path="/users/:id" element={<UserDetailsPage />} />
                
                {/* Categories */}
                <Route path="/categories" element={<CategoriesPage />} />
                <Route path="/categories/:id" element={<CategoryDetailsPage />} />
                
                {/* Cities */}
                <Route path="/cities" element={<CitiesPage />} />
                <Route path="/cities/:id" element={<CityDetailsPage />} />
                
                {/* Routes */}
                <Route path="/routes" element={<RoutesPage />} />
                <Route path="/routes/:id" element={<RouteDetailsPage />} />
                
                {/* Locations */}
                <Route path="/locations" element={<LocationsPage />} />
                <Route path="/locations/:id" element={<LocationDetailsPage />} />
                
                {/* Events */}
                <Route path="/events" element={<EventsPage />} />
                <Route path="/events/:id" element={<EventDetailsPage />} />
                
                {/* Settings & Profile */}
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="/profile" element={<ProfilePage />} />
              </Route>
            </Route>

            {/* Default redirect */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
          </Routes>

          <ToastContainer
            position="top-right"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="dark"
          />
        </AuthProvider>
      </Router>
    </ThemeProvider>
  );
}

export default App;
