import "./App.css";
import { Provider } from "react-redux"; // Redux Provider to make store available to components
import store from "../store/store"; // Your Redux store
import { BrowserRouter, Routes, Route } from "react-router-dom"; // Import Router and Routes
import Follow from "./pages/follow";
import EventManager from "./pages/Events";
import EventInsights from "./pages/EventInsights";

import "./styles.css"; // Import your styles
import Login from "./pages/Login"; // Login component with routing

import "react-toastify/dist/ReactToastify.css";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import Forgot from "./pages/Forgot";
import Home from "./pages/Home";
import Tickets from "./pages/Tickets";
import Notifications from "./pages/Notifications";
import Payment from "./pages/Payment";
import Messages from "./pages/Messages";
import Explore from "./pages/Explore";
import Drawer from "./components/Drawer";
import SideBar from "./components/SideBar";
import Toast from "./components/Toast";
import GlobalNotification from "./components/GlobalNotification";
import { useDispatch } from "react-redux";
import { clearToast } from "../store/notificationSlice";
import Monetization from "./pages/Monetization";
import People from "./pages/People";
import Wallet from "./pages/Wallet";
import GuestList from "./pages/GuestList";
import Scanner from "./pages/Scan";
import Bookings from "./pages/Bookings";
import Settings from "./pages/Settings";
import TitleUpdater from "./components/TitleUpdater";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import { RootState } from "../store/store";
import SeeAllEventsPage from "./components/SeeAllEventsPage";

// Import new auth components
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import AuthRedirect from "./components/AuthRedirect";
import NotFound from "./components/NotFound";
import Unauthorized from "./components/Unauthorized";
import ScrollToTop from "./components/ScrollToTop";
import { UserRole, Permission } from "./constants/authTypes";

// App must only use Provider, BrowserRouter, and render InnerApp as a child of BrowserRouter
function App() {
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  return (
    <Provider store={store}>
      <BrowserRouter
        future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
      >
        <AuthProvider>
          <InnerApp
            notificationsOpen={notificationsOpen}
            setNotificationsOpen={setNotificationsOpen}
          />
        </AuthProvider>
      </BrowserRouter>
    </Provider>
  );
}

function InnerApp({
  setNotificationsOpen,
}: {
  notificationsOpen: boolean;
  setNotificationsOpen: (open: boolean) => void;
}) {
  const location = useLocation();
  const toastState = useSelector(
    (state: RootState) => state.notification.toast
  );
  const dispatch = useDispatch();
  useEffect(() => {
    setNotificationsOpen(false);
  }, [location, setNotificationsOpen]);

  return (
    <>
      <TitleUpdater />
      <AuthRedirect />

      {/* Global Notifications System - displays notifications across all pages */}
      <GlobalNotification />

      {/* Global Toast for all notifications and alerts */}
      {toastState && toastState.message && (
        <Toast
          message={toastState.message}
          type={toastState.type}
          onClose={() => dispatch(clearToast())}
          action={
            toastState.action && {
              label: toastState.action.label,
              onClick: () => {
                dispatch(clearToast());
              },
            }
          }
        />
      )}
      <ScrollToTop />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot" element={<Forgot />} />
        <Route path="/reset-password" element={<Forgot />} />

        {/* Error Pages */}
        <Route path="/unauthorized" element={<Unauthorized />} />

        {/* Protected Routes */}
        <Route
          path="/messages"
          element={
            <ProtectedRoute>
              <Drawer />
              <Messages />
              <SideBar />
            </ProtectedRoute>
          }
        />
        <Route
          path="/follow"
          element={
            <ProtectedRoute>
              <Drawer />
              <Follow />
              <SideBar />
            </ProtectedRoute>
          }
        />
        <Route
          path="/checkout"
          element={
            <ProtectedRoute>
              <Drawer />
              <Payment />
              <SideBar />
            </ProtectedRoute>
          }
        />
        <Route
          path="/notifications"
          element={
            <ProtectedRoute>
              <Drawer />
              <Notifications />
              <SideBar />
            </ProtectedRoute>
          }
        />
        <Route
          path="/tickets"
          element={
            <ProtectedRoute>
              <Drawer />
              <Tickets />
              <SideBar />
            </ProtectedRoute>
          }
        />
        <Route
          path="/scanner"
          element={
            <ProtectedRoute>
              <Drawer />
              <Scanner />
              <SideBar />
            </ProtectedRoute>
          }
        />
        <Route
          path="/bookings"
          element={
            <ProtectedRoute>
              <Drawer />
              <Bookings />
              <SideBar />
            </ProtectedRoute>
          }
        />
        <Route
          path="/events"
          element={
            <ProtectedRoute requireAuth={true}>
              <Drawer />
              <EventManager />
              <SideBar />
            </ProtectedRoute>
          }
        />
        <Route
          path="/explore"
          element={
            <ProtectedRoute>
              <Drawer />
              <Explore />
              <SideBar />
            </ProtectedRoute>
          }
        />
        <Route
          path="/explore/:search"
          element={
            <ProtectedRoute>
              <Drawer />
              <Explore />
              <SideBar />
            </ProtectedRoute>
          }
        />
        <Route
          path="/explore/see-all"
          element={
            <ProtectedRoute>
              <SeeAllEventsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Drawer />
              <Profile />
              <SideBar />
            </ProtectedRoute>
          }
        />
        <Route
          path="/people/:uid"
          element={
            <ProtectedRoute>
              <Drawer />
              <People />
              <SideBar />
            </ProtectedRoute>
          }
        />
        <Route
          path="/monetization"
          element={
            <ProtectedRoute>
              <Drawer />
              <Monetization />
              <SideBar />
            </ProtectedRoute>
          }
        />
        <Route
          path="/wallet"
          element={
            <ProtectedRoute>
              <Drawer />
              <Wallet />
              <SideBar />
            </ProtectedRoute>
          }
        />
        <Route
          path="/guest-list"
          element={
            <ProtectedRoute requiredPermissions={[Permission.MANAGE_BOOKINGS]}>
              <Drawer />
              <GuestList />
              <SideBar />
            </ProtectedRoute>
          }
        />
        <Route
          path="/home"
          element={
            <ProtectedRoute>
              <Drawer />
              <Home />
              <SideBar />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <Drawer />
              <Settings />
              <SideBar />
            </ProtectedRoute>
          }
        />
        <Route
          path="/events/:eventId/insights"
          element={
            <ProtectedRoute requiredPermissions={[Permission.VIEW_ANALYTICS]}>
              <Drawer />
              <EventInsights />
              <SideBar />
            </ProtectedRoute>
          }
        />
        <Route
          path="/events/insights"
          element={
            <ProtectedRoute requiredPermissions={[Permission.VIEW_ANALYTICS]}>
              <Drawer />
              <EventInsights />
              <SideBar />
            </ProtectedRoute>
          }
        />

        {/* Catch all route for 404 - Must be last */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}

export default App;
