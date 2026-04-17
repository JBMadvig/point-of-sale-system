import { Navigate, Outlet, useLocation } from 'react-router';
import { useAuth } from '../../hooks/useAuth';
import type { User } from '../../shared/types/auth';

type Role = User['role'];

type Props = {
	allowedRoles?: Role[];
};

export function RequireAuth({ allowedRoles }: Props) {
	const { user, isLoading } = useAuth();
	const loc = useLocation();

	if (isLoading) return null; // or a spinner

	if (!user)
		return (
			<Navigate
				to='/unit/login'
				replace
				state={{ from: loc }}
			/>
		);

	if (allowedRoles && !allowedRoles.includes(user.role)) {
		return (
			<Navigate
				to='/device/pos-login'
				replace
			/>
		);
	}

	return <Outlet />;
}
