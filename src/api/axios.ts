import axios, { type AxiosError, type AxiosRequestConfig, type AxiosResponse } from "axios";
import cookies from "js-cookie";

interface CustomAxiosRequestConfig extends AxiosRequestConfig {
	shouldNotify?: boolean;
}

function getLocalAccessToken() {
	if (typeof window === "undefined") {
		return null;
	}

	try {
		// Get token from localStorage only
		const directAccessToken = localStorage.getItem("accessToken");
		if (directAccessToken) {
			return directAccessToken;
		}

		// Try token (might be JSON or raw string)
		const tokenFromStorage = localStorage.getItem("token");
		if (tokenFromStorage) {
			try {
				const tokenObj = JSON.parse(tokenFromStorage);
				return tokenObj.token || tokenFromStorage;
			} catch {
				return tokenFromStorage;
			}
		}
	} catch (error) {
		console.error("Error getting token:", error);
	}

	return null;
}

const instance = axios.create({
	timeout: 3 * 60 * 1000,
	baseURL: process.env.NEXT_PUBLIC_API_URL || "https://BadmintonHubbe.onrender.com/api/v1",
	headers: {
		"Content-Type": "application/json",
		Accept: "application/json",
	},
});

instance.interceptors.request.use(
	(config) => {
		const token = getLocalAccessToken();
		if (token) {
			config.headers["Authorization"] = `Bearer ${token}`;
		} else {
			console.warn('[Axios Interceptor] No token found, request will be sent without Authorization header');
		}
		return config;
	},
	(error) => {
		return Promise.reject(error);
	},
);

instance.interceptors.response.use(
	(response) => {
		if (response.data && typeof response.data.statusCode === "number" && response.data.statusCode >= 400) {
			const errorData = {
				response: {
					...response,
					status: response.data.statusCode,
					data: response.data
				},
				message: response.data.message || "An error occurred"
			};

			if (response.data.statusCode === 401 && !response.config.url?.includes("login")) {
				handleUnauthorized();
			}

			return Promise.reject(errorData);
		}
		return response;
	},
	async (error) => {
		if (error.response?.status === 401 && !error.config?.url?.includes("login")) {
			handleUnauthorized();
		}
		return Promise.reject(error);
	}
);

function handleUnauthorized() {
	if (typeof window !== "undefined") {
		logout();
		if (window.location.pathname !== "/") {
			window.location.href = "/";
		} else {
			window.location.reload();
		}
	}
}

export function logout() {
	cookies.remove("accessToken");
	localStorage.removeItem("accessToken");
	localStorage.removeItem("token");
	localStorage.removeItem("user");
	localStorage.removeItem("userProfile");
}

export const sendGet = async (url: string, params?: any): Promise<any> => {
	try {
		const response = await instance.get(url, { params });
		return response?.data;
	} catch (error: any) {
		if (error.response?.data) {
			// Attach status code to the data object if possible
			const errorData = error.response.data;
			if (typeof errorData === 'object' && errorData !== null) {
				errorData.status = error.response.status;
				errorData.message = errorData.message || error.message;
			}
			throw errorData;
		}
		throw error;
	}
};

export const sendPost = (url: string, params?: any, queryParams?: any) => {
	const config: AxiosRequestConfig = { params: queryParams };

	if (params instanceof FormData) {
		config.headers = {
			"Content-Type": "multipart/form-data",
		};
	}

	return instance.post(url, params, config)
		.then((res) => res?.data)
		.catch((error) => {
			if (error.response?.data) {
				throw error.response.data;
			}
			throw error;
		});
};

export const sendPostWithConfig = (url: string, params?: any, config: AxiosRequestConfig = {}) => {
	return instance.post(url, params, config)
		.then((res) => {
			return res;
		})
		.catch((error) => {
			if (error.response?.data) {
				throw error.response;
			}
			throw error;
		});
};

export const sendPut = (url: string, params?: any) =>
	instance.put(url, params)
		.then((res) => res?.data)
		.catch((error) => {
			if (error.response?.data) {
				throw error.response.data;
			}
			throw error;
		});

export const sendPatch = (url: string, params?: any) =>
	instance.patch(url, params)
		.then((res) => res?.data)
		.catch((error) => {
			if (error.response?.data) {
				throw error.response.data;
			}
			throw error;
		});

export const sendDelete = (url: string, params?: any) =>
	instance.delete(url, { data: params })
		.then((res) => res?.data)
		.catch((error) => {
			if (error.response?.data) {
				throw error.response.data;
			}
			throw error;
		});

class ApiClient {
	get<T = any>(config: AxiosRequestConfig, options?: { shouldNotify: boolean }): Promise<T> {
		return this.request({
			...config,
			method: "GET",
			withCredentials: false,
			shouldNotify: options?.shouldNotify,
		});
	}

	post<T = any>(config: AxiosRequestConfig, options?: { shouldNotify: boolean }): Promise<T> {
		return this.request({
			...config,
			method: "POST",
			withCredentials: false,
			shouldNotify: options?.shouldNotify,
		});
	}

	put<T = any>(config: AxiosRequestConfig): Promise<T> {
		return this.request({ ...config, method: "PUT", withCredentials: false });
	}

	delete<T = any>(config: AxiosRequestConfig): Promise<T> {
		return this.request({
			...config,
			method: "DELETE",
			withCredentials: false,
		});
	}

	patch<T = any>(config: AxiosRequestConfig): Promise<T> {
		return this.request({ ...config, method: "PATCH", withCredentials: false });
	}

	private request<T = any>(config: CustomAxiosRequestConfig): Promise<T> {
		return new Promise((resolve, reject) => {
			instance
				.request<any, AxiosResponse<any>>(config)
				.then((res: AxiosResponse<any>) => {
					resolve(res as unknown as Promise<T>);
				})
				.catch((e: Error | AxiosError) => {
					reject(e);
				});
		});
	}
}

const apiClient = new ApiClient();

export default apiClient;
