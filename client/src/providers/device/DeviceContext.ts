import { createContext } from 'react';
import type { DeviceContextType } from '../../shared/types/auth';

export const Ctx = createContext<DeviceContextType | null>(null);
