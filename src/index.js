import React from "react";
import { createRoot } from 'react-dom/client';
import App from "./App";
import Modal from "react-modal";
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import 'bootstrap-icons/font/bootstrap-icons.css';

Modal.setAppElement("#root");

const container = document.getElementById('root');
const root = createRoot(container);
root.render(<App />);