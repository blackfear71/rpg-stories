import { BrowserRouter, Route, Routes } from 'react-router-dom';

import { Campaign, Campaigns, Home, Settings } from './pages';

import { Layout } from './components/shared';

import { AuthProvider } from './utils/providers';

import './App.css';

function App() {
    return (
        <div className="app">
            <BrowserRouter>
                <AuthProvider>
                    <Routes>
                        <Route path="/" element={<Layout />}>
                            {/* Connexion : route par défaut */}
                            <Route index element={<Home />} />

                            {/* Campagnes */}
                            <Route path="campaigns" element={<Campaigns />} />

                            {/* Campagne */}
                            <Route path="campaign/:id" element={<Campaign />} />

                            {/* Paramètres */}
                            <Route path="settings" element={<Settings />} />
                        </Route>
                    </Routes>
                </AuthProvider>
            </BrowserRouter>
        </div>
    );
}

export default App;
