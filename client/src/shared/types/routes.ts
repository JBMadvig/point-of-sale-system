export const unitRoutes = {
    root: '/unit',
    login: '/unit/login',
    landing: '/unit/landing',
} as const;
export const deviceRoutes = {
    root: '/device',
    activate: `/device/activate-device`,
    login: '/device/login',
    pos: '/device/pos',
    inventory: '/device/inventory',
} as const;

export type UnitRoute = (typeof unitRoutes)[keyof typeof unitRoutes];
export type DeviceRoute = (typeof deviceRoutes)[keyof typeof deviceRoutes];