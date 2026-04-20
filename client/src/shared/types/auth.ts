export type AuthContextType = {
	user: User | null;
	isLoading: boolean;
	login: (email: string, password: string) => Promise<void>;
	logout: () => Promise<void>;
};

export type User = {
	_id: string;
	email: string;
	name: string;
	role: 'admin' | 'user' | 'sudo-admin';
	balance: number;
	currency: string;
	avatarUrl: string;
	createdAt: string;
	updatedAt: string;
};

export interface DeviceActiveResponse {
	activated: boolean;
	deviceName?: string;
}

export type DeviceContextType = {
	deviceName: string | null;
	isActivated: boolean;
	isLoading: boolean;
	activate: (email: string, password: string, deviceName?: string) => Promise<void>;
	deactivate: () => Promise<void>;
	deviceRename: (deviceName: string) => Promise<void>;
};
