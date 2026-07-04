import { BrowserRouter, Route, Routes } from 'react-router-dom';

import { Edition, Home, Settings } from './pages';

import { Layout } from './components/shared';

import { AuthProvider, SseProvider } from './utils/providers';

import './App.css';

function App() {
    return (
        <div className="app">
            <BrowserRouter>
                <AuthProvider>
                    <Routes>
                        <Route path="/" element={<Layout />}>
                            {/* Editions : route par défaut */}
                            <Route index element={<Home />} />

                            {/* Edition */}
                            <Route
                                path="edition/:id"
                                element={
                                    <SseProvider>
                                        <Edition />
                                    </SseProvider>
                                }
                            />

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
