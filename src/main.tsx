
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./styles/index.css";

window.addEventListener("vite:preloadError", () => {
  const hasReloaded = sessionStorage.getItem("vite-preload-reloaded");
  if (!hasReloaded) {
    sessionStorage.setItem("vite-preload-reloaded", "true");
    window.location.reload();
  }
});

createRoot(document.getElementById("root")!).render(<App />);
  