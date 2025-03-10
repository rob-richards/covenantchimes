import { useState, useEffect } from 'react';

interface GeolocationState {
	latitude: number | null;
	longitude: number | null;
	error: string | null;
	isLoading: boolean;
}

export function useGeolocation() {
	const [state, setState] = useState<GeolocationState>({
		latitude: null,
		longitude: null,
		error: null,
		isLoading: true,
	});

	useEffect(() => {
		if (!navigator.geolocation) {
			setState((prev) => ({
				...prev,
				error: 'Geolocation is not supported by your browser',
				isLoading: false,
			}));
			return;
		}

		const successHandler = (position: GeolocationPosition) => {
			setState({
				latitude: position.coords.latitude,
				longitude: position.coords.longitude,
				error: null,
				isLoading: false,
			});
		};

		const errorHandler = (error: GeolocationPositionError) => {
			setState((prev) => ({
				...prev,
				error: error.message,
				isLoading: false,
			}));
		};

		const options = {
			enableHighAccuracy: true,
			timeout: 5000,
			maximumAge: 0,
		};

		navigator.geolocation.getCurrentPosition(
			successHandler,
			errorHandler,
			options
		);
	}, []);

	return state;
}
