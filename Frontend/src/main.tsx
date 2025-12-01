import { createRoot } from "react-dom/client";
import { GoogleOAuthProvider } from "@react-oauth/google";
import App from "./App";
import "./index.css";

// Google OAuth Client ID
// NOTE: You need to get this from Google Cloud Console:
// 1. Go to https://console.cloud.google.com/
// 2. Create a project or select existing one
// 3. Enable Google+ API
// 4. Create OAuth 2.0 Client ID credentials
// 5. Add authorized redirect URIs: http://localhost:3456
// 6. Copy the Client ID here
const GOOGLE_CLIENT_ID = "39841607600-gf2herbf5t72lq15bpn8bru8u0hlfiug.apps.googleusercontent.com";

createRoot(document.getElementById("root")!).render(
  <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
    <App />
  </GoogleOAuthProvider>
);
