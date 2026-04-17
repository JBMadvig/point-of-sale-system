export class ApiError extends Error {
	readonly status: number;
    readonly body: unknown;

	constructor(status: number, body: unknown, message?: string) {
		super(message ?? `HTTP ${status}`);
		this.status = status;
        this.body = body;
	}
}

type FetchOpts = RequestInit & { json?: unknown; skipAuthRetry?: boolean };

let refreshPromise: Promise<void> | null = null;

async function refreshOnce(): Promise<void> {
	if (!refreshPromise) {
		refreshPromise = fetch('/api/auth/refresh', {
			method: 'POST',
			credentials: 'include',
		})
			.then((r) => {
				if (!r.ok) throw new ApiError(r.status, null, 'refresh failed');
			})
			.finally(() => {
				refreshPromise = null;
			});
	}
	return refreshPromise;
}

export async function api<T = unknown>(
	path: string,
	opts: FetchOpts = {},
): Promise<T> {
	const { json, skipAuthRetry, headers, ...rest } = opts;

	const init: RequestInit = {
		...rest,
		credentials: 'include',
		headers: {
			...(json !== undefined ? { 'Content-Type': 'application/json' } : {}),
			...headers,
		},
		body: json !== undefined ? JSON.stringify(json) : rest.body,
	};

	let res = await fetch(path, init);

	if (
		res.status === 401 &&
		!skipAuthRetry &&
		!path.endsWith('/auth/refresh') &&
		!path.endsWith('/auth/login')
	) {
		try {
			await refreshOnce();
			res = await fetch(path, init); // retry once
		} catch {
			throw new ApiError(401, null, 'unauthenticated');
		}
	}

	if (!res.ok) {
		const body = await res.json().catch(() => null);

		const message =
			body !== null && typeof body === 'object' && 'message' in body
				? String((body as Record<string, unknown>).message)
				: undefined;

		throw new ApiError(res.status, body, message);
	}

	// 204 handling
	if (res.status === 204) return undefined as T;
	return res.json() as Promise<T>;
}
