import { Navigate } from 'react-router-dom';
import {useUser } from '../pages/user/UserContext';

interface loginRouteOnlyProps {
	children: React.ReactNode;
}

export default function LoginRouteOnly({ children }: loginRouteOnlyProps) {
	const { user } = useUser();
	const authToken = localStorage.getItem('authToken');

	if (!user || !authToken) {
		return <Navigate to="/signup" replace />;
	}

	return <>{children}</>;
}