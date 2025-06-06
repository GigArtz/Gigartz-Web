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
import Monetization from "./pages/Monetization";
import People from "./pages/People";
import Wallet from "./pages/Wallet";
import GuestList from "./pages/GuestList";
import Scanner from "./pages/Scan";
import Bookings from "./pages/Bookings";
import Settings from "./pages/Settings";
import TitleUpdater from "./components/TitleUpdater";
import { useEffect } from "react";
import { useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { selectAuthUser } from "../store/authSlice";

function AuthRedirect() {
  const user = useSelector(selectAuthUser);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // If user is logged in and on the login or register page, redirect to /home
    if (
      user &&
      (location.pathname === "/" || location.pathname === "/register")
    ) {
      navigate("/home", { replace: true });
    }
  }, [user, location, navigate]);

  return null;
}

function App() {
  return (
    <Provider store={store}>
      {" "}
      {/* Wrap with Provider to provide the Redux store */}
      <BrowserRouter
        future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
      >
        {" "}
        {/* Wrap your app with BrowserRouter to enable routing */}
        <TitleUpdater /> {/* Move TitleUpdater inside Router */}
        <AuthRedirect />
        <Routes>
          <Route path="/" element={<Login />} />
          <Route
            path="/messages"
            element={
              <>
                <Drawer />
                <Messages />
                <SideBar />
              </>
            }
          />
          <Route
            path="/follow"
            element={
              <>
                <Drawer />
                <Follow />
                <SideBar />
              </>
            }
          />
          <Route
            path="/checkout"
            element={
              <>
                <Drawer />
                <Payment />
                <SideBar />
              </>
            }
          />
          <Route
            path="/notifications"
            element={
              <>
                <Drawer />
                <Notifications />
                <SideBar />
              </>
            }
          />
          <Route
            path="/tickets"
            element={
              <>
                <Drawer />
                <Tickets />
                <SideBar />
              </>
            }
          />
          <Route
            path="/scanner"
            element={
              <>
                <Drawer />
                <Scanner />
                <SideBar />
              </>
            }
          />
          <Route
            path="/bookings"
            element={
              <>
                <Drawer />
                <Bookings />
                <SideBar />
              </>
            }
          />
          <Route
            path="/events"
            element={
              <>
                <Drawer />
                <EventManager />
                <SideBar />
              </>
            }
          />
          <Route
            path="/explore"
            element={
              <>
                <Drawer />
                <Explore />
                <SideBar />
              </>
            }
          />
          <Route
            path="/explore/:search"
            element={
              <>
                <Drawer />
                <Explore />
                <SideBar />
              </>
            }
          />
          <Route
            path="/profile"
            element={
              <>
                <Drawer />
                <Profile />
                <SideBar />
              </>
            }
          />
          <Route
            path="/people/:uid"
            element={
              <>
                <Drawer />
                <People />
                <SideBar />
              </>
            }
          />
          <Route path="/register" element={<Register />} />
          <Route
            path="/monetization"
            element={
              <>
                <Drawer />
                <Monetization />
                <SideBar />
              </>
            }
          />
          <Route
            path="/wallet"
            element={
              <>
                <Drawer />
                <Wallet />
                <SideBar />
              </>
            }
          />
          <Route
            path="/notifications"
            element={
              <>
                <Drawer />
                <Notifications />
                <SideBar />
              </>
            }
          />
          <Route
            path="/guest-list"
            element={
              <>
                <Drawer />
                <GuestList />
                <SideBar />
              </>
            }
          />
          <Route
            path="/home"
            element={
              <>
                <Drawer />
                <Home />
                <SideBar />
              </>
            }
          />
          <Route
            path="/settings"
            element={
              <>
                <Drawer />
                <Settings />
                <SideBar />
              </>
            }
          />
          <Route path="/reset-password" element={<Forgot />} />
          <Route
            path="/events/:eventId/insights"
            element={
              <>
                <Drawer />
                <EventInsights />
                <SideBar />
              </>
            }
          />
          <Route
            path="/events/insights"
            element={
              <>
                <Drawer />
                <EventInsights />
                <SideBar />
              </>
            }
          />
        </Routes>
      </BrowserRouter>
    </Provider>
  );
}

export default App;
