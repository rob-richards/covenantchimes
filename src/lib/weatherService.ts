import axios from 'axios';
import { WeatherData } from '@/types';

// Using WeatherAPI.com as it has a free tier with 1,000,000 calls per month
const API_KEY = process.env.NEXT_PUBLIC_WEATHER_API_KEY || '';
const BASE_URL = 'https://api.weatherapi.com/v1';

// Fallback weather data for testing or when API fails
const FALLBACK_WEATHER_DATA: WeatherData = {
	location: {
		name: 'Your Location',
		country: 'Earth',
		lat: 0,
		lon: 0,
	},
	current: {
		temp_c: 22,
		temp_f: 72,
		condition: {
			text: 'Partly cloudy',
			code: 1003,
			icon: '//cdn.weatherapi.com/weather/64x64/day/116.png',
		},
		wind_kph: 15,
		wind_mph: 9.3,
		humidity: 65,
		cloud: 25,
		feelslike_c: 22,
		feelslike_f: 72,
		is_day: 1,
	},
};

// Always return fallback data immediately if API key is 'demo'
export async function getWeatherByCoordinates(
	lat: number,
	lon: number
): Promise<WeatherData> {
	// If API key is 'demo', return fallback data immediately
	if (API_KEY === 'demo') {
		console.log('Using demo mode with fallback weather data');
		return Promise.resolve({
			...FALLBACK_WEATHER_DATA,
			location: {
				...FALLBACK_WEATHER_DATA.location,
				name: `Demo Mode (${lat.toFixed(2)}, ${lon.toFixed(2)})`,
			},
		});
	}

	// If no API key, return fallback data
	if (!API_KEY) {
		console.log('No API key provided, using fallback weather data');
		return Promise.resolve(FALLBACK_WEATHER_DATA);
	}

	try {
		console.log(`Fetching weather data for coordinates: ${lat}, ${lon}`);

		// Create a controller for the timeout
		const controller = new AbortController();
		const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 second timeout

		const response = await axios.get(`${BASE_URL}/current.json`, {
			params: {
				key: API_KEY,
				q: `${lat},${lon}`,
			},
			signal: controller.signal,
			timeout: 3000, // 3 second timeout
		});

		// Clear the timeout
		clearTimeout(timeoutId);

		console.log('Weather data fetched successfully:', response.data);
		return response.data;
	} catch (error) {
		console.error('Error fetching weather data:', error);

		// Return fallback data for any error
		console.log('Using fallback weather data due to API error');
		return {
			...FALLBACK_WEATHER_DATA,
			location: {
				...FALLBACK_WEATHER_DATA.location,
				name:
					lat && lon
						? `Location (${lat.toFixed(2)}, ${lon.toFixed(2)})`
						: 'Your Location',
			},
		};
	}
}

// Location-based weather fetch with the same improvements
export async function getWeatherByLocation(
	location: string
): Promise<WeatherData> {
	// If API key is 'demo', return fallback data immediately
	if (API_KEY === 'demo') {
		console.log('Using demo mode with fallback weather data');
		return Promise.resolve({
			...FALLBACK_WEATHER_DATA,
			location: {
				...FALLBACK_WEATHER_DATA.location,
				name: `Demo: ${location}`,
			},
		});
	}

	// If no API key, return fallback data
	if (!API_KEY) {
		console.log('No API key provided, using fallback weather data');
		return Promise.resolve(FALLBACK_WEATHER_DATA);
	}

	try {
		console.log(`Fetching weather data for location: ${location}`);

		// Create a controller for the timeout
		const controller = new AbortController();
		const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 second timeout

		const response = await axios.get(`${BASE_URL}/current.json`, {
			params: {
				key: API_KEY,
				q: location,
			},
			signal: controller.signal,
			timeout: 3000, // 3 second timeout
		});

		// Clear the timeout
		clearTimeout(timeoutId);

		console.log('Weather data fetched successfully:', response.data);
		return response.data;
	} catch (error) {
		console.error('Error fetching weather data:', error);

		// Return fallback data for any error
		console.log('Using fallback weather data due to API error');
		return {
			...FALLBACK_WEATHER_DATA,
			location: {
				...FALLBACK_WEATHER_DATA.location,
				name: location || 'Your Location',
			},
		};
	}
}

// Helper function to determine if weather condition is rainy
export function isRainy(conditionText: string): boolean {
	const rainyConditions = [
		'rain',
		'drizzle',
		'shower',
		'thunderstorm',
		'thunder',
		'mist',
		'fog',
	];

	return rainyConditions.some((condition) =>
		conditionText.toLowerCase().includes(condition)
	);
}

// Helper function to determine if weather condition is snowy
export function isSnowy(conditionText: string): boolean {
	const snowyConditions = ['snow', 'sleet', 'blizzard', 'ice', 'freezing'];

	return snowyConditions.some((condition) =>
		conditionText.toLowerCase().includes(condition)
	);
}

// Helper function to determine if weather condition is cloudy
export function isCloudy(conditionText: string): boolean {
	const cloudyConditions = ['cloud', 'overcast', 'fog', 'mist'];

	return cloudyConditions.some((condition) =>
		conditionText.toLowerCase().includes(condition)
	);
}
