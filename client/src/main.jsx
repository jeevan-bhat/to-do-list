// ------------------------------------------------------------------
// src/main.jsx  —  React entry point
// ------------------------------------------------------------------
// This is the very first JavaScript that runs in the browser. It finds
// the <div id="root"> in index.html and tells React to render our
// top-level <App /> component inside it.
// ------------------------------------------------------------------

import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
