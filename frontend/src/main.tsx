import React from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import Login from './pages/Login.tsx'
import SignUp from './pages/SignUp.tsx'
import SignUp2 from './pages/SignUp2.tsx'
import PongGame from './pages/PongGame.tsx'
import SnakeGame from './pages/SnakeGame.tsx'
import PlayerProfile from './pages/PlayerProfile.tsx'
import HomePage from './pages/HomePage.tsx' //TODO: To be removed.(Norika made this page, but there is a new PlayerProfile page in the making.)

const router = createBrowserRouter([
  { path: '/', element: <App /> },
  { path: '/login', element: <Login /> },
  { path: '/signup', element: <SignUp /> },
  { path: '/signupUnkownUser', element: <SignUp2 />},
  { path: '/pongGame', element: <PongGame />},
  { path: '/snakeGame', element: <SnakeGame />},
  { path: '/playerProfile', element: <PlayerProfile />},
  { path: '/home', element: <HomePage/>}, //TODO: To be removed.(Norika made this page, but there is a new PlayerProfile page in the making.)
])

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
)

