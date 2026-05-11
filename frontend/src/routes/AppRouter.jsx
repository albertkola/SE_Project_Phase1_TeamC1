import { Routes, Route } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import Spinner from '../components/common/Spinner';
import ProtectedRoute from './ProtectedRoute';

const Landing = lazy(() => import('../pages/Landing'));
const Login = lazy(() => import('../pages/Login'));
const Register = lazy(() => import('../pages/Register'));
const NotFound = lazy(() => import('../pages/shared/NotFound'));
const Profile = lazy(() => import('../pages/shared/Profile'));
const Notifications = lazy(() => import('../pages/shared/Notifications'));
const SearchTrips = lazy(() => import('../pages/passenger/SearchTrips'));
const TripDetails = lazy(() => import('../pages/passenger/TripDetails'));
const BookingConfirm = lazy(() => import('../pages/passenger/BookingConfirm'));
const BookingHistory = lazy(() => import('../pages/passenger/BookingHistory'));
const DriverDashboard = lazy(() => import('../pages/driver/DriverDashboard'));
const CreateTrip = lazy(() => import('../pages/driver/CreateTrip'));
const EditTrip = lazy(() => import('../pages/driver/EditTrip'));
const TripHistory = lazy(() => import('../pages/driver/TripHistory'));
const AdminDashboard = lazy(() => import('../pages/admin/AdminDashboard'));
const ManageUsers = lazy(() => import('../pages/admin/ManageUsers'));
const ManageTrips = lazy(() => import('../pages/admin/ManageTrips'));

function PageFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Spinner size="lg" />
    </div>
  );
}

export default function AppRouter() {
  return (
    <Suspense fallback={<PageFallback />}>
      <Routes>
        {/* Public */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Passenger */}
        <Route
          path="/search"
          element={
            <ProtectedRoute allowedRoles={['passenger']}>
              <SearchTrips />
            </ProtectedRoute>
          }
        />
        <Route
          path="/trips/:id"
          element={
            <ProtectedRoute allowedRoles={['passenger', 'driver', 'admin']}>
              <TripDetails />
            </ProtectedRoute>
          }
        />
        <Route
          path="/booking/confirm"
          element={
            <ProtectedRoute allowedRoles={['passenger']}>
              <BookingConfirm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/bookings"
          element={
            <ProtectedRoute allowedRoles={['passenger']}>
              <BookingHistory />
            </ProtectedRoute>
          }
        />

        {/* Shared */}
        <Route
          path="/profile"
          element={
            <ProtectedRoute allowedRoles={['passenger', 'driver', 'admin']}>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/notifications"
          element={
            <ProtectedRoute allowedRoles={['passenger', 'driver', 'admin']}>
              <Notifications />
            </ProtectedRoute>
          }
        />

        {/* Driver */}
        <Route
          path="/driver/dashboard"
          element={
            <ProtectedRoute allowedRoles={['driver']}>
              <DriverDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/driver/trips/create"
          element={
            <ProtectedRoute allowedRoles={['driver']}>
              <CreateTrip />
            </ProtectedRoute>
          }
        />
        <Route
          path="/driver/trips/:id/edit"
          element={
            <ProtectedRoute allowedRoles={['driver']}>
              <EditTrip />
            </ProtectedRoute>
          }
        />
        <Route
          path="/driver/history"
          element={
            <ProtectedRoute allowedRoles={['driver']}>
              <TripHistory />
            </ProtectedRoute>
          }
        />

        {/* Admin */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <ManageUsers />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/trips"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <ManageTrips />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}
