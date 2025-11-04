import { Navigate } from 'react-router-dom';
import { useUser } from '../pages/user/UserContext';

interface logoutRouteOnlyProps {
	children: React.ReactNode;
}

export default function LogoutRouteOnly({ children }: logoutRouteOnlyProps) {
	const { user } = useUser();
	const authToken = localStorage.getItem('authToken');

	if (user && authToken) {
		return <Navigate to="/playerProfile" replace />;
	}

	return <>{children}</>;
}