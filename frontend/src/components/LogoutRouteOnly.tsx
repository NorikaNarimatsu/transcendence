// import { Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useUser } from '../pages/user/UserContext';

interface logoutRouteOnlyProps {
	children: React.ReactNode;
}

export default function LogoutRouteOnly({ children }: logoutRouteOnlyProps) {
	const { user, logout } = useUser();
	const location = useLocation();
	const authToken = localStorage.getItem('authToken');

	// if (user && authToken) {
	// 	return <Navigate to="/playerProfile" replace />;
	// }

	useEffect(() => {
		if (user || authToken) {
			logout();
		}
	}, [location.pathname]);

	return <>{children}</>;
}