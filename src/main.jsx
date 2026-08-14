import { StrictMode } from 'react'
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router";

import './index.css'
import Discovery from './Discovery.jsx'
import Favorites from './components/Favorites.jsx'
import Layout from './components/Layout.jsx';
import AuthCallback from './components/AuthCallback.jsx';

const root = document.getElementById("root");

ReactDOM.createRoot(root).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path='/' element={<Discovery />}></Route>
          <Route path='/favorites' element={<Favorites />}></Route>
          <Route path='/AuthCallback' element={<AuthCallback />}></Route>
        </Route>
      </Routes>
    </BrowserRouter>
  </StrictMode>
)