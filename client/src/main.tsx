import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { ThirdwebProvider } from "@/context/ThirdwebContext";

createRoot(document.getElementById("root")!).render(
  <ThirdwebProvider>
    <App />
  </ThirdwebProvider>
);

// Register service worker for PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .then(registration => {
        console.log('Service Worker registered with scope:', registration.scope);
      })
      .catch(error => {
        console.error('Service Worker registration failed:', error);
      });
  });
}
