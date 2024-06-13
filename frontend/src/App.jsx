//import React from 'react'
import './App.css'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import {LoginPage,RegisterPage,VerifyPage} from "./Routes.js"


function App() {
  
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage/>} />
        <Route path="/register" element={<RegisterPage/>} />
        <Route path="/verify" element={<VerifyPage/>}/>
      </Routes>
    </BrowserRouter>
  )
}

export default App
