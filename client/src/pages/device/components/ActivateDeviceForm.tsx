import { Button } from '@base-ui/react/button';
import { Field } from '@base-ui/react/field';
import { Fieldset } from '@base-ui/react/fieldset';
import { Form } from '@base-ui/react/form';
import { Input } from '@base-ui/react/input';

import { useForm, type SubmitHandler } from 'react-hook-form';
import { validateEmail } from '../../../lib/validators/email.validator';
import { useDevice } from '../../../hooks/useDevice';
import { Navigate } from 'react-router';
import { deviceRoutes } from '../../../shared/types/routes';
import { useSlidingPanel } from '../../../shared/components/SlidingPanelContext';
import ActivateDeviceFormInfoPanel from './ActivateDeviceFormInfoPanel';

interface ActivateDeviceFormReq {
    email: string;
    password: string;
    deviceName: string;
}

export default function ActivateDeviceForm() {
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<ActivateDeviceFormReq>();
    const { activate } = useDevice();
    const { openPanel } = useSlidingPanel();

    const onSubmit: SubmitHandler<ActivateDeviceFormReq> = async (data) => {
        try {
            //Pos login needs to be done here
            console.log(data);
            await activate(data.email, data.password, data.deviceName);
            return <Navigate to={deviceRoutes.login} replace />;
        } catch (error) {
            console.log(error);
            return;
        }
    };

    return (
        <Form className='flex items-center justify-center' onSubmit={handleSubmit(onSubmit)}>
            <Fieldset.Root className='flex w-full max-w-64 flex-col gap-4'>
                <Fieldset.Legend className='border-b border-border pb-3 text-lg font-bold text-text'>
                    <div className='text-lg flex flex-row gap-2 items-center font-bold text-text'>
                        <span>Activate Device</span>
                        <button
                            type='button'
                            onClick={() => openPanel(<ActivateDeviceFormInfoPanel />)}
                        >
                            <svg
                                xmlns='http://www.w3.org/2000/svg'
                                width='20'
                                height='20'
                                fill='currentColor'
                                viewBox='0 0 24 24'
                            >
                                <path d='M11 11h2v6h-2zm0-4h2v2h-2z'></path>
                                <path d='M12 22c5.51 0 10-4.49 10-10S17.51 2 12 2 2 6.49 2 12s4.49 10 10 10m0-18c4.41 0 8 3.59 8 8s-3.59 8-8 8-8-3.59-8-8 3.59-8 8-8'></path>
                            </svg>
                        </button>
                    </div>
                </Fieldset.Legend>

                <Field.Root className='flex flex-col items-start gap-1'>
                    <Field.Label className='text-sm font-bold text-text'>Email</Field.Label>
                    <Field.Control
                        {...register('email', {
                            required: 'Email is required',
                            validate: validateEmail,
                        })}
                        className='h-10 w-full rounded-md border border-border bg-surface pl-3.5 text-base text-text focus:outline-2 focus:-outline-offset-1 focus:outline-accent font-normal'
                        placeholder='Enter email'
                    />
                    {errors.email && <p className='text-xs text-red-500'>{errors.email.message}</p>}
                </Field.Root>
                <Field.Root className='flex flex-col items-start gap-1'>
                    <Field.Label className='text-sm font-bold text-text'>Password</Field.Label>
                    <Field.Control
                        render={
                            <Input
                                {...register('password', { required: true })}
                                type='password'
                                className='h-10 w-full rounded-md border border-border bg-surface pl-3.5 text-base text-text focus:outline-2 focus:-outline-offset-1 focus:outline-accent font-normal'
                                placeholder='Enter password'
                            />
                        }
                    />
                </Field.Root>
                <Field.Root className='flex flex-col items-start gap-1'>
                    <Field.Label className='text-sm font-bold text-text'>Device name</Field.Label>
                    <Field.Control
                        render={
                            <Input
                                {...register('deviceName', { required: true })}
                                className='h-10 w-full rounded-md border border-border bg-surface pl-3.5 text-base text-text focus:outline-2 focus:-outline-offset-1 focus:outline-accent font-normal'
                                placeholder='Name this device (e.g. "POS Terminal 1")'
                            />
                        }
                    />
                </Field.Root>
                <Button
                    type='submit'
                    className='flex cursor-pointer items-center justify-center h-10 px-3.5 m-0 outline-0 border border-border rounded-md bg-dominant font-inherit text-base font-normal leading-6 text-text select-none hover:data-disabled:bg-dominant hover:bg-support active:data-disabled:bg-dominant active:bg-support focus-visible:outline-2 focus-visible:outline-accent focus-visible:-outline-offset-1 data-disabled:text-text-muted'
                >
                    Login
                </Button>
            </Fieldset.Root>
        </Form>
    );
}
