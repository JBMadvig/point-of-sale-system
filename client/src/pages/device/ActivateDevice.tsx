import { Navigate } from 'react-router';

import { useDevice } from '../../hooks/useDevice';
import { SlidingPanelRoot } from '../../shared/components/SlidingPanel';
import { deviceRoutes } from '../../shared/types/routes';
import ActivateDeviceForm from './components/ActivateDeviceForm';

function ActivateDeviceMain() {
    return (
        <div className='flex flex-col items-center justify-center w-full gap-8 p-4 h-dvh'>
            <img className='aspect-video max-w-75' src='/logo.webp'></img>
            <ActivateDeviceForm />
        </div>
    );
}

export default function ActivateDevice() {
    const { isActivated, isLoading } = useDevice();

    if (isLoading) return null; // TODO: or add a spinner

    if (isActivated) {
        return <Navigate to={deviceRoutes.login} replace />;
    }

    return (
        <SlidingPanelRoot>
            <ActivateDeviceMain />
        </SlidingPanelRoot>
    );
}

// 	return (
// 		<div className='w-full h-dvh p-4 flex flex-col items-center justify-center gap-8'>
// 			<img
// 				className='aspect-video max-w-75'
// 				src='/logo.webp'
// 			/>
// 			<Form
// 				className='flex items-center justify-center w-full sm:max-w-75'
// 				onSubmit={handleSubmit}>
// 				<Fieldset.Root className='flex w-full max-w-64 flex-col gap-4'>
// 					<Fieldset.Legend className='border-b border-border pb-3 text-lg font-bold text-text'>
// 						<div className='text-lg flex flex-row gap-4 items-center font-bold text-text'>
// 							<span>Activate device</span>
// 							<Popover.Root>
// 								<Popover.Trigger className='flex size-8 items-center justify-center rounded-md border border-border bg-dominant text-text select-none hover:bg-support focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-accent active:bg-support data-popup-open:bg-support font-normal'>
// 									<svg
// 										xmlns='http://www.w3.org/2000/svg'
// 										width='20'
// 										height='20'
// 										fill='currentColor'
// 										viewBox='0 0 24 24'>
// 										<path d='M11 11h2v6h-2zm0-4h2v2h-2z'></path>
// 										<path d='M12 22c5.51 0 10-4.49 10-10S17.51 2 12 2 2 6.49 2 12s4.49 10 10 10m0-18c4.41 0 8 3.59 8 8s-3.59 8-8 8-8-3.59-8-8 3.59-8 8-8'></path>
// 									</svg>
// 								</Popover.Trigger>
// 								<Popover.Portal>
// 									<Popover.Positioner
// 										side='right'
// 										align='center'
// 										collisionAvoidance={{
// 											side: 'none',
// 											align: 'shift',
// 											fallbackAxisSide: 'none',
// 										}}
// 										sideOffset={8}>
// 										<Popover.Popup
// 											className='origin-(--transform-origin) min-w-25 max-w-(--available-width) w-max rounded-lg bg-surface px-6 py-4 text-text shadow-lg shadow-border outline-1 outline-border transition-[transform,scale,opacity] data-ending-style:scale-90 data-ending-style:opacity-0 data-starting-style:scale-90 data-starting-style:opacity-0'>
// 											<Popover.Arrow className='data-[side=bottom]:-top-2 data-[side=left]:-right-3.25 data-[side=left]:rotate-90 data-[side=right]:-left-3.25 data-[side=right]:-rotate-90 data-[side=top]:-bottom-2 data-[side=top]:rotate-180'></Popover.Arrow>
// 											<Popover.Title className='text-base font-bold'>
// 												Device Activation
// 											</Popover.Title>
// 											<Popover.Description className='text-base text-text-muted max-w-prose text-pretty'>
// 												Only sudo admins can activate devices. Once a device is
// 												activated, user can access then point of sale system on
// 												the activated device.
// 											</Popover.Description>
// 										</Popover.Popup>
// 									</Popover.Positioner>
// 								</Popover.Portal>
// 							</Popover.Root>
// 						</div>
// 					</Fieldset.Legend>

// 					{isActivated && (
// 						<p className='text-sm text-text-muted'>
// 							This device is already activated. Submitting will re-activate it.
// 						</p>
// 					)}

// 					<Field.Root className='flex flex-col items-start gap-1'>
// 						<Field.Label className='text-sm font-bold text-text'>
// 							Email
// 						</Field.Label>
// 						<Field.Control
// 							className='h-10 w-full rounded-md border border-border pl-3.5 text-base text-text focus:outline-2 focus:-outline-offset-1 focus:outline-accent font-normal'
// 							placeholder='Enter email'
// 							type='email'
// 							required
// 							value={email}
// 							onChange={(e) => setEmail(e.target.value)}
// 						/>
// 					</Field.Root>

// 					<Field.Root className='flex flex-col items-start gap-1'>
// 						<Field.Label className='text-sm font-bold text-text'>
// 							Password
// 						</Field.Label>
// 						<Field.Control
// 							render={
// 								<Input
// 									type='password'
// 									className='h-10 w-full rounded-md border border-border pl-3.5 text-base text-text focus:outline-2 focus:-outline-offset-1 focus:outline-accent font-normal'
// 									placeholder='Enter password'
// 									required
// 									value={password}
// 									onChange={(e) => setPassword(e.target.value)}
// 								/>
// 							}
// 						/>
// 					</Field.Root>

// 					<Field.Root className='flex flex-col items-start gap-1'>
// 						<Field.Label className='text-sm font-bold text-text'>
// 							Device name
// 						</Field.Label>
// 						<Field.Control
// 							className='h-10 w-full rounded-md border border-border pl-3.5 text-base text-text focus:outline-2 focus:-outline-offset-1 focus:outline-accent font-normal'
// 							placeholder='e.g. Front counter iPad'
// 							value={deviceName}
// 							onChange={(e) => setDeviceName(e.target.value)}
// 						/>
// 					</Field.Root>

// 					{error && (
// 						<p
// 							className='text-sm text-danger'
// 							role='alert'>
// 							{error}
// 						</p>
// 					)}

// 					<button
// 						type='submit'
// 						disabled={submitting}
// 						className='h-10 w-full rounded-md bg-accent text-accent-text font-bold hover:bg-accent-hover transition-colors disabled:opacity-50'>
// 						{submitting ? 'Activating…' : 'Activate device'}
// 					</button>
// 				</Fieldset.Root>
// 			</Form>
// 		</div>
// 	);
// }
