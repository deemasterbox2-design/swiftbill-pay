// File: main.tsx | Path: src/main.tsx
// Function: Application entry point - renders the root React component
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

createRoot(document.getElementById("root")!).render(<App />);
