import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const navItems = [
  { label: "Home", link: "/home" },
  { label: "Guest Lists", link: "/guest-list" },
  { label: "Wallet", link: "/wallet" },
  { label: "Scan Ticket", link: "/scanner" },
  { label: "Tickets", link: "/tickets" },
  { label: "Bookings", link: "/bookings" },
  { label: "Explore", link: "/explore" },
  { label: "Notifications", link: "/notifications" },
  { label: "Messages", link: "/messages" },
  { label: "Monetization", link: "/monetization" },
  { label: "Settings", link: "/settings" },
  { label: "Profile", link: "/profile" },
];

export default function TitleUpdater() {
  const location = useLocation();

  useEffect(() => {
    const activeItem = navItems.find(item =>
      location.pathname.startsWith(item.link)
    );
    document.title = `GigArtz - ${activeItem?.label || "Explore"}`;
  }, [location.pathname]);

  return null; // no UI
}
