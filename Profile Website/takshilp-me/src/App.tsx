import React from 'react'
import { Route, Routes } from 'react-router-dom'
import Homepage from '@components/Homepage'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Homepage />}></Route>
    </Routes>
  )
}

export default App
