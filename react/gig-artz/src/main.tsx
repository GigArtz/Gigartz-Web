import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import App from "./App";

// Dynamically inject Google Maps script for Places Autocomplete
const injectGoogleMapsScript = () => {
  if (document.getElementById("google-maps-script")) return;
  const script = document.createElement("script");
  script.id = "google-maps-script";
  script.src = `https://maps.googleapis.com/maps/api/js?key=${
    import.meta.env.VITE_MAPS_API_KEY
  }&libraries=places`;
  script.async = true;
  script.defer = true;
  document.head.appendChild(script);
};

injectGoogleMapsScript();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
