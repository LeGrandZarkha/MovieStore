import { StrictMode } from 'react'
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router";

import './index.css'
import Discovery from './pages/Discovery.jsx'
import Favorites from './pages/Favorites.jsx'
import Layout from './components/Layout.jsx';
import AuthCallback from './components/AuthCallback.jsx';
import { FavoritesProvider } from './context/FavoritesContext.jsx';
import { GenresProvider } from './context/GenresContext.jsx';

const root = document.getElementById("root");

ReactDOM.createRoot(root).render(
  <StrictMode>
    <FavoritesProvider>
      <GenresProvider>
        <BrowserRouter>
          <Routes>
            <Route element={<Layout />}>
              <Route path='/' element={<Discovery />}></Route>
              <Route path='/favorites' element={<Favorites />}></Route>
              <Route path='/AuthCallback' element={<AuthCallback />}></Route>
            </Route>
          </Routes>
        </BrowserRouter>
      </GenresProvider>
    </FavoritesProvider>
  </StrictMode>
)