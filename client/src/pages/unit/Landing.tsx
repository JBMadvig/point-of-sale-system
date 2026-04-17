import { Button } from '@base-ui/react/button';
import { useAuth } from '../../hooks/useAuth';

export default function Landing() {
	const { logout } = useAuth();

	const onLogOut = () => {
		try {
			logout();
		} catch (error) {
			console.log(error);
		}
	};
	return (
		<>
			<p>Landing is working!</p>
			<Button
				onClick={onLogOut}
				className='flex cursor-pointer items-center justify-center h-10 px-3.5 m-0 outline-0 border border-border rounded-md bg-accent font-inherit text-base font-normal leading-6 text-text select-none hover:data-disabled:bg-dominant hover:bg-support active:data-disabled:bg-dominant active:bg-support focus-visible:outline-2 focus-visible:outline-accent focus-visible:-outline-offset-1 data-disabled:text-text-muted transition-all'>
				Logout
			</Button>
		</>
	);
}
