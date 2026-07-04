import React from 'react';

import ReactDOM from 'react-dom/client';

import './assets/fonts/fonts.css';
import './assets/styles/theme.css';

import './utils/i18n';

import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import 'bootstrap/dist/css/bootstrap.min.css';
import './main.css';

import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);
