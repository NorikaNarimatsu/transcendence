import React from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import Login from './pages/accounts/Login.tsx'
import SignUp from './pages/accounts/SignUp.tsx'
import SignUp2 from './pages/accounts/SignUp2.tsx'
import PongGame from './pages/games/PongGame.tsx'
import SnakeGame from './pages/games/SnakeGame.tsx'
import PlayerProfile from './pages/PlayerProfile.tsx'
import TournamentTree from './pages/tournament/TournamentTree.tsx'
import { UserProvider } from './pages/user/UserContext'

const router = createBrowserRouter([
  { path: '/', element: <App /> },
  { path: '/login', element: <Login /> },
  { path: '/signup', element: <SignUp /> },
  { path: '/signupUnkownUser', element: <SignUp2 />},
  { path: '/playerProfile/pongGame', element: <PongGame />},
  { path: '/playerProfile/snakeGame', element: <SnakeGame />},
  { path: '/playerProfile', element: <PlayerProfile />},
  { path: '/tournament', element: <TournamentTree />}
])

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <UserProvider>
      <RouterProvider router={router} />
    </UserProvider>
  </React.StrictMode>,
)

