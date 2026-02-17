import { createRoot } from "react-dom/client";
import { registerSW } from "virtual:pwa-register";
import App from "./App.tsx";
import "./index.css";
import { initPushNotifications } from "./utils/pushNotifications";

registerSW({ immediate: true });

// Initialize push notifications
initPushNotifications();

createRoot(document.getElementById("root")!).render(<App />);
