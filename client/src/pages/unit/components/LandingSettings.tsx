import { Button } from '@base-ui/react/button';
import { useAuth } from '../../../hooks/useAuth';
import { PanelContent, PanelItem } from '../../../shared/components/SlidingPanel';
import { ButtonGroup } from '../../../shared/components/ButtonGroup';
import { ThemeButton } from '../../../shared/components/ThemeButton';

export default function LandingSettings() {
    const { logout } = useAuth();

    const onLogOut = () => {
        try {
            logout();
        } catch (error) {
            console.log(error);
        }
    };

    return (
        <PanelContent className='flex flex-col gap-4 justify-between h-full'>
            <PanelItem className='flex flex-col gap-2'>
                <h2 className='text-2xl font-bold text-text'>Settings</h2>
            </PanelItem>
            <PanelItem className='flex flex-col gap-2'>
                <h3 className='text-lg font-semibold text-text'>Color mode</h3>
                <p>Choose how the color scheme of the app should look.</p>
                <ButtonGroup>
                    <ThemeButton theme='system' text='System' />
                    <ThemeButton theme='light' text='Light mode' />
                    <ThemeButton theme='dark' text='Dark Mode' />
                </ButtonGroup>
            </PanelItem>
            <PanelItem className='flex flex-col gap-2 mt-auto'>
                <h3 className='text-lg font-semibold text-text'>Logout</h3>
                <Button
                    onClick={onLogOut}
                    className='flex cursor-pointer items-center justify-center h-10 px-3.5 m-0 outline-0 border border-border rounded-md bg-accent font-inherit text-base font-normal leading-6 text-text select-none hover:data-disabled:bg-dominant hover:bg-support active:data-disabled:bg-dominant active:bg-support focus-visible:outline-2 focus-visible:outline-accent focus-visible:-outline-offset-1 data-disabled:text-text-muted transition-all'
                >
                    Logout
                </Button>
            </PanelItem>
        </PanelContent>
    );
}
