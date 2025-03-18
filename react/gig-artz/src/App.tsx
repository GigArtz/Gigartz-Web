import './App.css';
import { Provider } from 'react-redux';  // Redux Provider to make store available to components
import store from './store/store';  // Your Redux store
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';  // Import Router and Routes
import Follow from './pages/follow';
import EventManager from './pages/Events';

import './styles.css'; // Import your styles
import Login from './pages/Login';  // Login component with routing

import 'react-toastify/dist/ReactToastify.css';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Forgot from './pages/Forgot';
import Home from './pages/Home';
import Tickets from './pages/Tickets';
import Notifications from './pages/Notifications';
import Payment from './pages/Payment';
import Messages from './pages/Messages';
import Explore from './pages/Explore';
import Drawer from './components/Drawer';
import SideBar from './components/SideBar';
import Monetization from './pages/Monetization';
import People from './pages/People';
import Wallet from './pages/Wallet';
import GuestList from './pages/GuestList';

function App() {
  return (
    <Provider store={store}>  {/* Wrap with Provider to provide the Redux store */}

    <Router>  {/* Wrap your app with BrowserRouter to enable routing */}
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/messages" element={<><Drawer /><Messages /><SideBar /></>} />
          <Route path="/follow" element={<><Drawer /><Follow /><SideBar /></>} />
          <Route path="/checkout" element={<><Drawer /><Payment /><SideBar /></>} />
          <Route path="/notifications" element={<><Drawer /><Notifications /><SideBar /></>} />
          <Route path="/tickets" element={<><Drawer /><Tickets /><SideBar /></>} />
          <Route path="/events" element={<><Drawer /><EventManager /><SideBar /></>} />
          <Route path="/explore" element={<><Drawer /><Explore /><SideBar /></>} />
          <Route path="/explore/:search" element={<><Drawer /><Explore /><SideBar /></>} />
          <Route path="/profile" element={<><Drawer /><Profile /><SideBar /></>} />
          <Route path="/people/:uid"  element={<><Drawer /><People /><SideBar /></>} />
          <Route path="/register" element={<Register />} />
          <Route path="/monetization" element={<><Drawer /><Monetization /><SideBar /></>} /> 
          <Route path="/wallet" element={<><Drawer /><Wallet /><SideBar /></>} />
          <Route path="/notifications" element={<><Drawer /><Notifications /><SideBar /></>} />
          <Route path="/guest-list" element={<><Drawer /><GuestList /><SideBar /></>} />
          <Route path="/home" element={<><Drawer /><Home /><SideBar /></>} />
          <Route path="/reset-password" element={<Forgot />} />
        </Routes>
         
        
      </Router>
    </Provider>
  );
}

export default App;
