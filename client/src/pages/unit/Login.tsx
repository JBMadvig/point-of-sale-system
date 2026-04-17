import { Navigate } from 'react-router';
import { useAuth } from '../../hooks/useAuth';
import LoginForm from './components/LoginForm';
import { SlidingPanelRoot } from '../../shared/components/SlidingPanel';
import { ThemeToggle } from '../../shared/components/ThemeToggle';


function LoginMain() {
	return (
		<div className='flex flex-col items-center justify-center w-full gap-8 p-4 h-dvh'>
			<img
				className='aspect-video max-w-75'
				src='/logo.webp'></img>
			<LoginForm />
			<div className='flex gap-3'>
				<ThemeToggle />
			</div>
		</div>
	);
}

export default function Login() {
	const { user } = useAuth();

	if (user) {
		return <Navigate to='/unit/landing' replace />;
	}

	return (
		<SlidingPanelRoot>
			<LoginMain />
		</SlidingPanelRoot>
	);
}
