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
import TournamentTree from './pages/tournament/tournamentTree.tsx'
import Bracket from './pages/tournament/tournamentBracket.tsx'
import Dashboard from './pages/games/Dashboard.tsx'

import { UserProvider } from './pages/user/UserContext'
import { SelectedPlayerProvider } from './pages/user/PlayerContext'
import { TournamentProvider } from './pages/tournament/tournamentContext'
import TranslationProvider from './contexts/LanguageContext.tsx'
import LogoutRouteOnly from './components/LogoutRouteOnly.tsx'
import LoginRouteOnly from './components/LoginRouteOnly.tsx'

const router = createBrowserRouter([
  { path: '/', element: (
	<LogoutRouteOnly>
		<App />
	</LogoutRouteOnly> )},
  { path: '/login',
	element: (
		<LogoutRouteOnly>
				<Login />
		</LogoutRouteOnly>
	) },
  { path: '/signup', element: (
		<LogoutRouteOnly>
			<SignUp />
		</LogoutRouteOnly>
	) },
	{ path: '/signupUnkownUser', element: (
		<LogoutRouteOnly>
				<SignUp2 />
		</LogoutRouteOnly>
	) },
	{ path: '/dashboard', element: (
		  <LoginRouteOnly>
			  <Dashboard />
		  </LoginRouteOnly>
	  ) },
  { path: '/playerProfile/pongGame', element: (
		<LoginRouteOnly>
			<PongGame />
		</LoginRouteOnly>
	) },
  { path: '/playerProfile/snakeGame', element: (
		<LoginRouteOnly>
			<SnakeGame />
		</LoginRouteOnly>
	) },
  { path: '/playerProfile', element: (
		<LoginRouteOnly>
			<PlayerProfile />
		</LoginRouteOnly>
	) },
  { path: '/tournament/tree', element: (
		<LoginRouteOnly>
			<TournamentTree />
		</LoginRouteOnly>
	) },
  { path: '/tournament/bracket', element: (
		<LoginRouteOnly>
			<Bracket />
		</LoginRouteOnly>
	) }
])

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <UserProvider>
      <TranslationProvider>
          <SelectedPlayerProvider>
              <TournamentProvider>
                  <RouterProvider router={router} />
              </TournamentProvider>
          </SelectedPlayerProvider>
      </TranslationProvider>
    </UserProvider>
  </React.StrictMode>,
)

