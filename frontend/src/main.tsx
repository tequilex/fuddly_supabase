import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { store } from './store';
import { SocketProvider } from './context/SocketContext';
import App from './App';

// Глобальные стили - сначала globals.css (оранжевая тема), потом Tailwind
import './styles/globals.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
    <Provider store={store}>
        <SocketProvider>
            <App />
        </SocketProvider>
    </Provider>
);
