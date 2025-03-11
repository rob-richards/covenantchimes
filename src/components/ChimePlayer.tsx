'use client';

import { useEffect, useState, useRef } from 'react';
import { useSimpleAudio } from '@/hooks/useSimpleAudio';
import { useAppStore } from '@/lib/store';
import { getWeatherByCoordinates } from '@/lib/weatherService';
import {
	FaPlay,
	FaPause,
	FaVolumeUp,
	FaVolumeMute,
	FaExclamationTriangle,
	FaSun,
	FaCloud,
	FaCloudRain,
	FaSnowflake,
	FaWind,
	FaBolt,
	FaSync,
	FaMapMarkerAlt,
} from 'react-icons/fa';
import LoadingSpinner from './ui/LoadingSpinner';

// Global variable to store geolocation data across component remounts
let cachedGeolocation: { latitude: number; longitude: number } | null = null;

export default function ChimePlayer() {
	const { isPlaying, isInitialized, activeChimes, startAudio, stopAudio } =
		useSimpleAudio();
	const {
		weather,
		isLoading,
		error,
		setWeather,
		setLoading,
		setError,
		userSettings,
		updateUserSettings,
	} = useAppStore();
	const [showControls, setShowControls] = useState(true);
	const [audioError, setAudioError] = useState<string | null>(null);
	const [setupComplete, setSetupComplete] = useState(false);
	const [autoStarted, setAutoStarted] = useState(false);
	const [weatherFetched, setWeatherFetched] = useState(false);
	const isFetchingRef = useRef(false);
	const mountedRef = useRef(true);

	// Default weather object for simulation
	const defaultWeather = {
		location: {
			name: 'Your Location',
			country: 'Earth',
			lat: 0,
			lon: 0,
			region: 'Unknown',
		},
		current: {
			temp_c: 22,
			temp_f: 72,
			condition: {
				text: 'Clear',
				code: 1000,
				icon: '', // Empty string as we're using React icons instead
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

	// Function to simulate weather conditions
	const simulateWeather = (
		conditionText: string,
		conditionCode: number,
		windSpeed: number,
		humidity: number
	) => {
		const currentWeather = weather || defaultWeather;

		setWeather({
			...currentWeather,
			current: {
				...currentWeather.current,
				condition: {
					text: conditionText,
					code: conditionCode,
					icon: '', // Empty string as placeholder, we'll use React icons instead
				},
				wind_mph: windSpeed,
				wind_kph: windSpeed * 1.60934, // Convert mph to kph
				humidity: humidity,
			},
		});

		// Always restart audio to apply new weather conditions immediately
		if (isPlaying) {
			console.log(
				`Restarting audio with new weather: ${conditionText}, wind: ${windSpeed}mph`
			);
			stopAudio();
			// Short delay to ensure audio context has time to clean up
			setTimeout(() => {
				handleStartAudio();
			}, 300);
		} else if (isInitialized) {
			// If audio is initialized but not playing, start it
			console.log(
				`Starting audio with weather: ${conditionText}, wind: ${windSpeed}mph`
			);
			handleStartAudio();
		}
	};

	// Function to check if a weather condition is active
	const isWeatherCondition = (conditionText: string): boolean => {
		if (!weather) return false;
		return weather.current.condition.text
			.toLowerCase()
			.includes(conditionText.toLowerCase());
	};

	// Function to check if wind speed is in a certain range
	const isWindSpeed = (min: number, max: number): boolean => {
		if (!weather) return false;
		return weather.current.wind_mph >= min && weather.current.wind_mph <= max;
	};

	// Function to get the appropriate swing animation class based on wind speed
	const getSwingAnimationClass = (baseClass: string): string => {
		if (!weather || !isPlaying) return '';

		const windSpeed = weather.current.wind_mph;

		// Light wind (0-7 mph)
		if (windSpeed < 7) {
			return `${baseClass}-light`;
		}
		// Strong wind (15+ mph)
		else if (windSpeed >= 15) {
			return `${baseClass}-strong`;
		}
		// Medium wind (7-15 mph)
		else {
			return baseClass;
		}
	};

	// Fetch weather data immediately on component mount
	useEffect(() => {
		// Set mounted ref to true when component mounts
		mountedRef.current = true;

		console.log(
			'Weather effect running, weatherFetched:',
			weatherFetched,
			'isLoading:',
			isLoading
		);

		// Only run this once
		if (weatherFetched || isLoading || isFetchingRef.current) {
			console.log('Skipping fetch - already fetched or in progress');
			return;
		}

		// Mark as fetching to prevent duplicate requests
		isFetchingRef.current = true;
		setLoading(true);
		setWeatherFetched(true);

		// Function to fetch weather with coordinates
		const fetchWeatherWithCoordinates = (
			latitude: number,
			longitude: number
		) => {
			console.log(
				`Fetching weather for coordinates: ${latitude}, ${longitude}`
			);

			getWeatherByCoordinates(latitude, longitude)
				.then((data) => {
					// Only update state if component is still mounted
					if (mountedRef.current) {
						console.log('Weather data fetched successfully:', data);
						setWeather(data);
						setError(null);
						setSetupComplete(true);
					} else {
						console.log(
							'Component unmounted, not updating state with weather data'
						);
					}
				})
				.catch((err) => {
					console.error('Weather fetch error:', err);
					// Only update state if component is still mounted
					if (mountedRef.current) {
						// Just complete setup without showing an error
						setSetupComplete(true);
					}
				})
				.finally(() => {
					// Only update state if component is still mounted
					if (mountedRef.current) {
						console.log('Weather fetch complete, cleaning up');
						setLoading(false);
						isFetchingRef.current = false;
					}
				});
		};

		// Try to use cached geolocation first (from previous attempts)
		if (cachedGeolocation) {
			console.log('Using cached geolocation:', cachedGeolocation);
			fetchWeatherWithCoordinates(
				cachedGeolocation.latitude,
				cachedGeolocation.longitude
			);
			return;
		}

		// Try to get geolocation
		if (navigator.geolocation) {
			console.log('Requesting geolocation permission...');

			// Set up a timeout for geolocation
			const timeoutId = setTimeout(() => {
				console.log('Geolocation timed out, using New York as fallback');
				if (mountedRef.current && !cachedGeolocation) {
					fetchWeatherWithCoordinates(40.7128, -74.006); // New York coordinates
				}
			}, 5000); // 5 second timeout

			// Request geolocation
			navigator.geolocation.getCurrentPosition(
				(position) => {
					// Clear the timeout since we got a position
					clearTimeout(timeoutId);

					const { latitude, longitude } = position.coords;
					console.log(`Got user location: ${latitude}, ${longitude}`);

					// Cache the geolocation for future use
					cachedGeolocation = { latitude, longitude };

					// Only proceed if component is still mounted and we haven't already fetched weather
					if (mountedRef.current) {
						fetchWeatherWithCoordinates(latitude, longitude);
					}
				},
				(error) => {
					// Clear the timeout since we got an error
					clearTimeout(timeoutId);

					console.error('Geolocation error:', error);

					// Only proceed if component is still mounted and we haven't already fetched weather
					if (mountedRef.current) {
						console.log('Using New York as fallback due to geolocation error');
						fetchWeatherWithCoordinates(40.7128, -74.006); // New York coordinates
					}
				},
				{
					timeout: 5000,
					maximumAge: 600000, // Cache for 10 minutes
					enableHighAccuracy: false,
				}
			);
		} else {
			// Geolocation not supported
			console.log('Geolocation not supported, using New York as fallback');
			fetchWeatherWithCoordinates(40.7128, -74.006); // New York coordinates
		}

		// Cleanup function to mark component as unmounted
		return () => {
			console.log('Weather effect cleanup - unmounting component');
			mountedRef.current = false;
		};
	}, [weatherFetched, isLoading, setWeather, setLoading, setError]);

	// Auto-start the chimes once setup is complete
	useEffect(() => {
		console.log(
			'Auto-start effect running, setupComplete:',
			setupComplete,
			'isPlaying:',
			isPlaying,
			'autoStarted:',
			autoStarted
		);
		if (setupComplete && !isPlaying && !autoStarted && !audioError) {
			// Start immediately when setup is complete
			console.log('Auto-starting chimes...');
			handleStartAudio();
			setAutoStarted(true);
		}
	}, [setupComplete, isPlaying, autoStarted, audioError]);

	// Monitor weather changes and restart audio if needed
	useEffect(() => {
		// Skip on initial render or when weather is null
		if (!weather || !isInitialized) return;

		console.log(
			'Weather changed:',
			weather.current.condition.text,
			'Wind:',
			weather.current.wind_mph,
			'mph'
		);

		// If audio is already playing, restart it to apply new weather conditions
		if (isPlaying) {
			console.log('Restarting audio to apply new weather conditions');
			stopAudio();
			// Short delay to ensure audio context has time to clean up
			setTimeout(() => {
				handleStartAudio();
			}, 300);
		}
	}, [weather?.current.condition.text, weather?.current.wind_mph]);

	// Function to manually initialize audio
	const handleStartAudio = async () => {
		try {
			console.log('Starting audio...');
			setAudioError(null);
			await startAudio();
		} catch (err) {
			console.error('Error starting audio:', err);
			if (err instanceof Error) {
				setAudioError(err.message);
			} else {
				setAudioError('Failed to start audio. Please try again.');
			}
		}
	};

	// Toggle audio playback
	const togglePlayback = () => {
		if (isPlaying) {
			stopAudio();
		} else {
			handleStartAudio();
		}
	};

	// Toggle master mute
	const toggleMute = () => {
		updateUserSettings({
			mute: {
				...userSettings.mute,
				master: !userSettings.mute.master,
			},
		});
	};

	// Update master volume
	const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = parseInt(e.target.value, 10);
		updateUserSettings({
			volume: {
				...userSettings.volume,
				master: value,
			},
		});
	};

	// Toggle binaural beats
	const toggleBinaural = () => {
		updateUserSettings({
			binaural: {
				...userSettings.binaural,
				enabled: !userSettings.binaural.enabled,
			},
		});
	};

	// Update binaural frequency
	const handleBinauralFrequencyChange = (
		e: React.ChangeEvent<HTMLInputElement>
	) => {
		const value = parseInt(e.target.value, 10);
		updateUserSettings({
			binaural: {
				...userSettings.binaural,
				beatFrequency: value,
				frequency: value,
				preset: 'custom',
			},
		});
	};

	// Update binaural carrier frequency
	const handleCarrierFrequencyChange = (
		e: React.ChangeEvent<HTMLInputElement>
	) => {
		const value = parseInt(e.target.value, 10);
		updateUserSettings({
			binaural: {
				...userSettings.binaural,
				carrierFrequency: value,
				preset: 'custom',
			},
		});
	};

	// Update binaural volume
	const handleBinauralVolumeChange = (
		e: React.ChangeEvent<HTMLInputElement>
	) => {
		const value = parseFloat(e.target.value);
		updateUserSettings({
			binaural: {
				...userSettings.binaural,
				volume: value,
			},
		});
	};

	// Set binaural preset
	const setBinauralPreset = (
		preset: 'delta' | 'theta' | 'alpha' | 'beta' | 'gamma'
	) => {
		// Define beat frequencies for each brain wave state
		const presetFrequencies = {
			delta: 2, // 1-4 Hz: Deep sleep, healing
			theta: 6, // 4-8 Hz: Deep relaxation, meditation
			alpha: 10, // 8-14 Hz: Relaxed focus, calm
			beta: 20, // 14-30 Hz: Active thinking, focus
			gamma: 40, // 30-100 Hz: Higher mental activity
		};

		const beatFrequency = presetFrequencies[preset];

		updateUserSettings({
			binaural: {
				...userSettings.binaural,
				beatFrequency: beatFrequency,
				frequency: beatFrequency, // Update legacy property for backward compatibility
				preset: preset,
				enabled: true,
			},
		});
	};

	// Function to reset to geolocation weather
	const resetToGeoWeather = () => {
		// Show loading state
		setLoading(true);

		const fetchWeatherForReset = (latitude: number, longitude: number) => {
			getWeatherByCoordinates(latitude, longitude)
				.then((data) => {
					console.log('Weather data fetched successfully:', data);
					setWeather(data);
					setError(null);
					setSetupComplete(true);
					setLoading(false);

					// If audio is already playing, restart it to apply new weather conditions
					if (isPlaying) {
						console.log('Restarting audio to apply new weather conditions');
						stopAudio();
						// Short delay to ensure audio context has time to clean up
						setTimeout(() => {
							handleStartAudio();
						}, 300);
					}
				})
				.catch((err) => {
					console.error('Weather fetch error:', err);
					setLoading(false);
					setError('Failed to fetch weather data. Please try again.');
				});
		};

		// If we have cached geolocation, use it
		if (cachedGeolocation) {
			console.log('Resetting to geolocation weather using cached coordinates');
			fetchWeatherForReset(
				cachedGeolocation.latitude,
				cachedGeolocation.longitude
			);
		} else {
			// Otherwise try to get geolocation again
			console.log('Requesting geolocation for weather reset');
			if (navigator.geolocation) {
				navigator.geolocation.getCurrentPosition(
					(position) => {
						const { latitude, longitude } = position.coords;
						console.log(`Got user location: ${latitude}, ${longitude}`);

						// Cache the geolocation for future use
						cachedGeolocation = { latitude, longitude };

						fetchWeatherForReset(latitude, longitude);
					},
					(error) => {
						console.error('Geolocation error:', error);
						setLoading(false);
						setError('Could not get your location. Please try again.');
					}
				);
			} else {
				// Geolocation not supported
				console.log('Geolocation not supported');
				setLoading(false);
				setError('Geolocation is not supported by your browser.');
			}
		}
	};

	// Show loading spinner only during initial load
	if (isLoading && !weatherFetched) {
		console.log('Rendering loading spinner');
		return (
			<div className="w-full max-w-4xl p-6 bg-white rounded-lg shadow-md">
				<div className="flex flex-col items-center justify-center h-64">
					<LoadingSpinner />
					<p className="mt-4 text-gray-600">Loading weather data...</p>
					<button
						className="mt-6 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
						onClick={() => {
							console.log('Skip loading button clicked');
							setLoading(false);
							setSetupComplete(true);
						}}
					>
						Skip Loading
					</button>
				</div>
			</div>
		);
	}

	// Show audio error state
	if (audioError) {
		console.log('Rendering audio error state');
		return (
			<div className="w-full max-w-4xl p-6 bg-white rounded-lg shadow-md">
				<div className="flex flex-col items-center justify-center h-64">
					<FaExclamationTriangle className="text-yellow-500 text-4xl mb-4" />
					<div className="text-red-500 text-xl mb-4">{audioError}</div>
					<p className="text-gray-600 mb-4">
						Audio initialization failed. This might be because your browser is
						blocking autoplay or the audio files are missing.
					</p>
					<div className="flex space-x-4">
						<button
							className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
							onClick={() => window.location.reload()}
						>
							Reload Page
						</button>
						<button
							className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
							onClick={() => setAudioError(null)}
						>
							Dismiss Error
						</button>
					</div>
				</div>
			</div>
		);
	}

	// Main view with weather and chimes - show this as soon as we have weather data
	console.log(
		'Rendering main view, weather data:',
		weather ? 'available' : 'not available'
	);
	return (
		<div className="w-full max-w-4xl p-6 bg-white rounded-lg shadow-md">
			{/* Weather Information - Always show at the top */}
			<div className="mb-4 text-center">
				{weather ? (
					<>
						<h2 className="text-2xl font-semibold text-gray-800">
							{weather.location.name}, {weather.location.region}
						</h2>
						<div className="flex items-center justify-center mt-2">
							<div className="w-16 h-16 flex items-center justify-center">
								{(() => {
									const code = weather.current.condition.code;
									// Clear/Sunny
									if (code === 1000) {
										return <FaSun className="text-yellow-500 text-4xl" />;
									}
									// Cloudy conditions
									else if (
										[1003, 1006, 1009, 1030, 1135, 1147].includes(code)
									) {
										return <FaCloud className="text-gray-500 text-4xl" />;
									}
									// Rainy conditions
									else if (
										[
											1063, 1150, 1153, 1168, 1171, 1180, 1183, 1186, 1189,
											1192, 1195, 1198, 1201, 1240, 1243, 1246,
										].includes(code)
									) {
										return <FaCloudRain className="text-blue-500 text-4xl" />;
									}
									// Snowy conditions
									else if (
										[
											1066, 1114, 1117, 1210, 1213, 1216, 1219, 1222, 1225,
											1255, 1258, 1279, 1282,
										].includes(code)
									) {
										return <FaSnowflake className="text-blue-300 text-4xl" />;
									}
									// Stormy conditions
									else if ([1087, 1273, 1276, 1279, 1282].includes(code)) {
										return <FaBolt className="text-yellow-600 text-4xl" />;
									}
									// Windy (default to sun with wind for simplicity)
									else {
										return <FaWind className="text-gray-600 text-4xl" />;
									}
								})()}
							</div>
							<div className="ml-4 text-left">
								<p className="text-3xl font-bold text-gray-900">
									{Math.round(weather.current.temp_f)}°F
								</p>
								<p className="text-gray-600">
									{Math.round(weather.current.temp_f)}°F
								</p>
							</div>
						</div>
						<div className="mt-2 text-sm text-gray-600">
							Wind: {weather.current.wind_mph} mph | Humidity:{' '}
							{weather.current.humidity}%
						</div>
					</>
				) : (
					<div className="py-4">
						<p className="text-gray-600">
							Weather data is loading or unavailable
						</p>
						<p className="text-sm text-gray-500">
							Chimes will respond to default settings
						</p>
					</div>
				)}
			</div>

			{/* Chimes Visualization */}
			<div className="relative mb-8">
				<svg
					className="w-full h-64"
					viewBox="-18 5 536 522"
					xmlns="http://www.w3.org/2000/svg"
				>
					<path
						d="M449.231841 146.339113H-17.21308367V78.1737744c0-15.1438195 12.26393627-27.406 27.39472507-27.406h30.3832988c8.8706933 0 17.4733865-2.126797 25.1599682-6.0568872 7.6865816-3.9172782 14.444239-9.6378496 19.6408766-16.8264661C95.756924 13.50718797 112.42204 5 130.164494 5h239.671012c17.728574 0 34.394757 8.50718797 44.786964 22.8833534 10.406088 14.3761654 27.058391 22.8833534 44.800845 22.8833534h30.383299c15.130788 0 27.407537 12.2632481 27.407537 27.406v68.1664062h-67.98231z"
						fill="#3A88D6"
						fillRule="nonzero"
					/>
					{/* Chime 1 - C2 */}
					<g
						fill="none"
						fillRule="nonzero"
						className={`chime-bell ${
							isPlaying && activeChimes.c2
								? getSwingAnimationClass('animate-swing-fast')
								: ''
						}`}
						style={{
							animationDelay: '0ms',
							transformOrigin: '386.996px 104.776px',
						}}
					>
						<path
							d="M479.59 220.698c-3.482 0-6.304-2.823-6.304-6.304v-110.09c0-3.481 2.822-6.304 6.304-6.304s6.304 2.823 6.304 6.304v110.091c0 3.48-2.822 6.303-6.304 6.303z"
							fill="#4D4D4D"
						/>
						<path fill="#F7B239" d="M502.935 196v330.449h-46.649V196h23.324" />
						<path
							fill="#4D4D4D"
							opacity=".24999999"
							d="M483.286 196h20.172v330.449h-20.172z"
						/>
					</g>
					{/* Chime 2 - D2 */}
					<g
						fill="none"
						fillRule="nonzero"
						className={`chime-bell ${
							isPlaying && activeChimes.d2
								? getSwingAnimationClass('animate-swing-med')
								: ''
						}`}
						style={{
							animationDelay: '100ms',
							transformOrigin: '295.996px 104.776px',
						}}
					>
						<path
							d="M388.293 221.17c-3.482 0-6.304-2.823-6.304-6.304v-110.09c0-3.481 2.822-6.304 6.304-6.304s6.304 2.823 6.304 6.304v110.091c0 3.48-2.821 6.303-6.304 6.303z"
							fill="#4D4D4D"
						/>
						<path
							fill="#F7B239"
							d="M411.622 195.551v296.37h-46.649v-296.37h23.324"
						/>
						<path
							fill="#4D4D4D"
							opacity=".25"
							d="M391.449 195.551h20.172v296.37h-20.172z"
						/>
					</g>
					{/* Chime 3 - E2 */}
					<g
						fill="none"
						fillRule="nonzero"
						className={`chime-bell ${
							isPlaying && activeChimes.e2
								? getSwingAnimationClass('animate-swing-slow')
								: ''
						}`}
						style={{
							animationDelay: '200ms',
							transformOrigin: '249.699px 104.776px',
						}}
					>
						<path
							d="M295.996 221.17c-3.482 0-6.304-2.823-6.304-6.304v-110.09c0-3.481 2.822-6.304 6.304-6.304s6.304 2.823 6.304 6.304v110.091c0 3.48-2.822 6.303-6.304 6.303z"
							fill="#4D4D4D"
						/>
						<path
							fill="#F7B239"
							d="M319.324 195.551v254.298h-46.648V195.551H296"
						/>
						<path
							fill="#4D4D4D"
							opacity=".25"
							d="M299.152 195.551h20.172v254.298h-20.172z"
						/>
					</g>
					{/* Chime 4 - G2 */}
					<g
						fill="none"
						fillRule="nonzero"
						className={`chime-bell ${
							isPlaying && activeChimes.g2
								? getSwingAnimationClass('animate-swing-med')
								: ''
						}`}
						style={{
							animationDelay: '300ms',
							transformOrigin: '203.699px 104.776px',
						}}
					>
						<path
							d="M203.699 221.17c-3.482 0-6.304-2.823-6.304-6.304v-110.09c0-3.481 2.822-6.304 6.304-6.304s6.304 2.823 6.304 6.304v110.091c0 3.48-2.822 6.303-6.304 6.303z"
							fill="#4D4D4D"
						/>
						<path
							fill="#F7B239"
							d="M227.027 195.551v218.096403h-46.649V195.551h23.325"
						/>
						<path
							fill="#4D4D4D"
							opacity=".25"
							d="M206.855 195.551h20.172v218.096403h-20.172z"
						/>
					</g>
					{/* Chime 5 - A2 */}
					<g
						fill="none"
						fillRule="nonzero"
						className={`chime-bell ${
							isPlaying && activeChimes.a2
								? getSwingAnimationClass('animate-swing-slow')
								: ''
						}`}
						style={{
							animationDelay: '400ms',
							transformOrigin: '112.402px 104.776px',
						}}
					>
						<path
							d="M112.402 221.17c-3.482 0-6.304-2.823-6.304-6.304v-110.09c0-3.481 2.822-6.304 6.304-6.304s6.304 2.823 6.304 6.304v110.091c0 3.48-2.822 6.303-6.304 6.303z"
							fill="#4D4D4D"
						/>
						<path
							fill="#F7B239"
							d="M135.73 195.551v181.979709H89.081V195.551h23.325"
						/>
						<path
							fill="#4D4D4D"
							opacity=".25"
							d="M115.558 195.551h20.172v181.979709h-20.172z"
						/>
					</g>
					{/* Chime 6 - C3 */}
					<g
						fill="none"
						fillRule="nonzero"
						className={`chime-bell ${
							isPlaying && activeChimes.c3
								? getSwingAnimationClass('animate-swing-fast')
								: ''
						}`}
						style={{
							animationDelay: '500ms',
							transformOrigin: '30.402px 104.776px',
						}}
					>
						<path
							d="M30.402 221.17c-3.482 0-6.304-2.823-6.304-6.304v-110.09c0-3.481 2.822-6.304 6.304-6.304s6.304 2.823 6.304 6.304v110.091c0 3.48-2.822 6.303-6.304 6.303z"
							fill="#4D4D4D"
						/>
						<path
							fill="#F7B239"
							d="M53.73 195.551v150.979709H7.081V195.551h23.325"
						/>
						<path
							fill="#4D4D4D"
							opacity=".25"
							d="M33.558 195.551h20.172v150.979709h-20.172z"
						/>
					</g>
				</svg>

				{/* Play/Pause Button */}
				<button
					className="absolute bottom-4 left-1/2 transform -translate-x-1/2 p-4 bg-primary-600 text-white rounded-full shadow-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
					onClick={togglePlayback}
				>
					{isPlaying ? (
						<FaPause className="h-6 w-6" />
					) : (
						<FaPlay className="h-6 w-6" />
					)}
				</button>
			</div>

			{/* Weather Simulation Buttons */}
			<div className="mb-6 px-4">
				<h3 className="text-md bold font-medium text-gray-700 my-3 text-center">
					Simulate Weather Conditions
				</h3>
				<div className="flex flex-wrap justify-center gap-2">
					<button
						className="px-4 py-2 border border-gray-300 rounded-md bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors flex items-center gap-2 text-gray-700"
						onClick={resetToGeoWeather}
						title="Reset to your actual local weather conditions"
						disabled={isLoading}
					>
						{isLoading ? (
							<>
								<FaSync className="animate-spin text-primary-500" />
								<span>Updating...</span>
							</>
						) : (
							<>
								<FaMapMarkerAlt className="text-primary-500" />
								<span>Reset</span>
							</>
						)}
					</button>
					<button
						className={`px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors flex items-center gap-2 ${
							(isWeatherCondition('clear') || isWeatherCondition('sunny')) &&
							isWindSpeed(0, 7)
								? 'bg-gray-100 border-primary-500 font-medium'
								: 'bg-white border-gray-200 hover:bg-gray-50'
						}`}
						onClick={() => simulateWeather('Clear', 1000, 5, 40)}
						title="Clear weather with light wind"
					>
						<FaSun className="text-yellow-500" />
						<span>Clear</span>
					</button>
					<button
						className={`px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors flex items-center gap-2 ${
							isWeatherCondition('cloud') && isWindSpeed(8, 14)
								? 'bg-gray-100 border-primary-500 font-medium'
								: 'bg-white border-gray-200 hover:bg-gray-50'
						}`}
						onClick={() => simulateWeather('Cloudy', 1006, 12, 60)}
						title="Cloudy weather with moderate wind"
					>
						<FaCloud className="text-gray-500" />
						<span>Cloudy</span>
					</button>
					<button
						className={`px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors flex items-center gap-2 ${
							(isWeatherCondition('rain') ||
								isWeatherCondition('drizzle') ||
								isWeatherCondition('shower')) &&
							isWindSpeed(10, 18)
								? 'bg-gray-100 border-primary-500 font-medium'
								: 'bg-white border-gray-200 hover:bg-gray-50'
						}`}
						onClick={() => simulateWeather('Moderate rain', 1189, 15, 85)}
						title="Rainy weather with moderate wind"
					>
						<FaCloudRain className="text-blue-500" />
						<span>Rain</span>
					</button>
					<button
						className={`px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors flex items-center gap-2 ${
							(isWeatherCondition('snow') ||
								isWeatherCondition('sleet') ||
								isWeatherCondition('ice')) &&
							isWindSpeed(0, 10)
								? 'bg-gray-100 border-primary-500 font-medium'
								: 'bg-white border-gray-200 hover:bg-gray-50'
						}`}
						onClick={() => simulateWeather('Light snow', 1213, 8, 75)}
						title="Snowy weather with light wind"
					>
						<FaSnowflake className="text-blue-300" />
						<span>Snow</span>
					</button>
					<button
						className={`px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors flex items-center gap-2 ${
							isWindSpeed(18, 24)
								? 'bg-gray-100 border-primary-500 font-medium'
								: 'bg-white border-gray-200 hover:bg-gray-50'
						}`}
						onClick={() => simulateWeather('Windy', 1000, 20, 30)}
						title="Windy weather with strong wind"
					>
						<FaWind className="text-gray-600" />
						<span>Windy</span>
					</button>
					<button
						className={`px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors flex items-center gap-2 ${
							(isWeatherCondition('thunder') || isWeatherCondition('storm')) &&
							isWindSpeed(22, 100)
								? 'bg-gray-100 border-primary-500 font-medium'
								: 'bg-white border-gray-200 hover:bg-gray-50'
						}`}
						onClick={() => simulateWeather('Thunderstorm', 1087, 25, 90)}
						title="Stormy weather with very strong wind"
					>
						<FaBolt className="text-yellow-600" />
						<span>Storm</span>
					</button>
				</div>
			</div>
			{/* Chime Status Indicators */}
			{/* <div className="mt-6 px-4">
				<h3 className="text-md bold font-medium text-gray-700 my-3 text-center">
					Active Chimes
				</h3>
				<div className="flex justify-center gap-3 flex-wrap">
					<div
						className={`w-10 h-10 rounded-full flex items-center justify-center ${
							activeChimes.c3
								? 'bg-primary-500 text-white'
								: 'bg-gray-200 text-gray-500'
						}`}
						title="C3 (Base Note)"
					>
						C3
					</div>

					<div
						className={`w-10 h-10 rounded-full flex items-center justify-center ${
							activeChimes.a2
								? 'bg-primary-500 text-white'
								: 'bg-gray-200 text-gray-500'
						}`}
						title="A2"
					>
						A2
					</div>

					<div
						className={`w-10 h-10 rounded-full flex items-center justify-center ${
							activeChimes.g2
								? 'bg-primary-500 text-white'
								: 'bg-gray-200 text-gray-500'
						}`}
						title="G2"
					>
						G2
					</div>
					<div
						className={`w-10 h-10 rounded-full flex items-center justify-center ${
							activeChimes.e2
								? 'bg-primary-500 text-white'
								: 'bg-gray-200 text-gray-500'
						}`}
						title="E2"
					>
						E2
					</div>
					<div
						className={`w-10 h-10 rounded-full flex items-center justify-center ${
							activeChimes.d2
								? 'bg-primary-500 text-white'
								: 'bg-gray-200 text-gray-500'
						}`}
						title="D2"
					>
						D2
					</div>
					<div
						className={`w-10 h-10 rounded-full flex items-center justify-center ${
							activeChimes.c2
								? 'bg-primary-500 text-white'
								: 'bg-gray-200 text-gray-500'
						}`}
						title="C2 (Octave Down)"
					>
						C2
					</div>
				</div>
			</div> */}
			{/* Audio Controls */}
			<div className="mt-6">
				<button
					className="text-gray-700 hover:text-primary-600 focus:outline-none mb-4"
					onClick={() => setShowControls(!showControls)}
				>
					{showControls ? 'Hide Controls' : 'Show Controls'}
				</button>

				{showControls && (
					<div className="p-4 bg-gray-50 rounded-lg">
						{/* Master Volume Control */}
						<div className="flex items-center mb-6">
							<button
								className="p-2 text-gray-700 hover:text-primary-600 focus:outline-none"
								onClick={toggleMute}
							>
								{userSettings.mute.master ? (
									<FaVolumeMute className="h-6 w-6" />
								) : (
									<FaVolumeUp className="h-6 w-6" />
								)}
							</button>
							<div className="ml-2 flex-1">
								<label
									htmlFor="master-volume"
									className="block text-sm font-medium text-gray-700 mb-1"
								>
									Master Volume
								</label>
								<input
									id="master-volume"
									type="range"
									min="-30"
									max="6"
									step="1"
									value={userSettings.volume.master}
									onChange={handleVolumeChange}
									className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
								/>
							</div>
						</div>

						{/* Individual Sound Controls */}
						<div className="mb-6">
							<h3 className="text-sm font-medium text-gray-700 mb-3">
								Sound Controls
							</h3>

							{/* Chimes Volume */}
							<div className="flex items-center mb-3">
								<button
									className="p-2 text-gray-700 hover:text-primary-600 focus:outline-none"
									onClick={() =>
										updateUserSettings({
											mute: {
												...userSettings.mute,
												chimes: !userSettings.mute.chimes,
											},
										})
									}
								>
									{userSettings.mute.chimes ? (
										<FaVolumeMute className="h-5 w-5" />
									) : (
										<FaVolumeUp className="h-5 w-5" />
									)}
								</button>
								<div className="ml-2 flex-1">
									<label
										htmlFor="chimes-volume"
										className="block text-xs font-medium text-gray-700 mb-1"
									>
										Chimes
									</label>
									<input
										id="chimes-volume"
										type="range"
										min="-30"
										max="6"
										step="1"
										value={userSettings.volume.chimes}
										onChange={(e) => {
											const value = parseInt(e.target.value, 10);
											updateUserSettings({
												volume: {
													...userSettings.volume,
													chimes: value,
												},
											});
										}}
										className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer"
									/>
								</div>
							</div>

							{/* Drone Volume */}
							<div className="flex items-center mb-3">
								<button
									className="p-2 text-gray-700 hover:text-primary-600 focus:outline-none"
									onClick={() =>
										updateUserSettings({
											mute: {
												...userSettings.mute,
												drone: !userSettings.mute.drone,
											},
										})
									}
								>
									{userSettings.mute.drone ? (
										<FaVolumeMute className="h-5 w-5" />
									) : (
										<FaVolumeUp className="h-5 w-5" />
									)}
								</button>
								<div className="ml-2 flex-1">
									<label
										htmlFor="drone-volume"
										className="block text-xs font-medium text-gray-700 mb-1"
									>
										Drone
									</label>
									<input
										id="drone-volume"
										type="range"
										min="-30"
										max="6"
										step="1"
										value={userSettings.volume.drone}
										onChange={(e) => {
											const value = parseInt(e.target.value, 10);
											updateUserSettings({
												volume: {
													...userSettings.volume,
													drone: value,
												},
											});
										}}
										className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer"
									/>
								</div>
							</div>

							{/* Ambience Volume */}
							<div className="flex items-center">
								<button
									className="p-2 text-gray-700 hover:text-primary-600 focus:outline-none"
									onClick={() =>
										updateUserSettings({
											mute: {
												...userSettings.mute,
												ambience: !userSettings.mute.ambience,
											},
										})
									}
								>
									{userSettings.mute.ambience ? (
										<FaVolumeMute className="h-5 w-5" />
									) : (
										<FaVolumeUp className="h-5 w-5" />
									)}
								</button>
								<div className="ml-2 flex-1">
									<label
										htmlFor="ambience-volume"
										className="block text-xs font-medium text-gray-700 mb-1"
									>
										Ambience
									</label>
									<input
										id="ambience-volume"
										type="range"
										min="-30"
										max="6"
										step="1"
										value={userSettings.volume.ambience}
										onChange={(e) => {
											const value = parseInt(e.target.value, 10);
											updateUserSettings({
												volume: {
													...userSettings.volume,
													ambience: value,
												},
											});
										}}
										className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer"
									/>
								</div>
							</div>
						</div>

						{/* Binaural Controls */}
						<div className="mb-4">
							<div className="flex items-center">
								<input
									id="binaural-toggle"
									type="checkbox"
									checked={userSettings.binaural.enabled}
									onChange={toggleBinaural}
									className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
								/>
								<label
									htmlFor="binaural-toggle"
									className="ml-2 block text-sm font-medium text-gray-700"
								>
									Enable Binaural Beats
								</label>
							</div>

							{userSettings.binaural.enabled && (
								<div className="mt-4 p-4 bg-gray-50 rounded-md">
									<div className="mb-4">
										<h4 className="text-sm font-medium text-gray-700 mb-2">
											Brain Wave Presets
										</h4>
										<p className="text-xs text-gray-500 mb-2">
											Binaural beats occur when two slightly different
											frequencies are played in each ear, creating a perceived
											beat at the difference frequency.
										</p>
										<div className="flex flex-wrap gap-2 mt-2">
											<button
												className={`px-3 py-1 text-xs rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-1 ${
													userSettings.binaural.preset === 'delta'
														? 'bg-primary-600 text-white'
														: 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
												}`}
												onClick={() => setBinauralPreset('delta')}
												title="1-4 Hz: Deep sleep, healing, pain relief"
											>
												Sleep (Delta 2 Hz)
											</button>
											<button
												className={`px-3 py-1 text-xs rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-1 ${
													userSettings.binaural.preset === 'theta'
														? 'bg-primary-600 text-white'
														: 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
												}`}
												onClick={() => setBinauralPreset('theta')}
												title="4-8 Hz: Meditation, deep relaxation, creativity"
											>
												Relax (Theta 6 Hz)
											</button>
											<button
												className={`px-3 py-1 text-xs rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-1 ${
													userSettings.binaural.preset === 'alpha'
														? 'bg-primary-600 text-white'
														: 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
												}`}
												onClick={() => setBinauralPreset('alpha')}
												title="8-14 Hz: Relaxed focus, calm, positive thinking"
											>
												Calm (Alpha 10 Hz)
											</button>
											<button
												className={`px-3 py-1 text-xs rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-1 ${
													userSettings.binaural.preset === 'beta'
														? 'bg-primary-600 text-white'
														: 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
												}`}
												onClick={() => setBinauralPreset('beta')}
												title="14-30 Hz: Focused attention, problem solving, active thinking"
											>
												Focus (Beta 20 Hz)
											</button>
											<button
												className={`px-3 py-1 text-xs rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-1 ${
													userSettings.binaural.preset === 'gamma'
														? 'bg-primary-600 text-white'
														: 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
												}`}
												onClick={() => setBinauralPreset('gamma')}
												title="30-100 Hz: Higher mental activity, cognitive enhancement"
											>
												Productive (Gamma 40 Hz)
											</button>
										</div>
									</div>

									<div className="mb-3">
										<label
											htmlFor="beat-frequency"
											className="block text-xs font-medium text-gray-700 mb-1"
										>
											Beat Frequency: {userSettings.binaural.beatFrequency} Hz
										</label>
										<input
											id="beat-frequency"
											type="range"
											min="1"
											max="40"
											step="1"
											value={userSettings.binaural.beatFrequency}
											onChange={handleBinauralFrequencyChange}
											className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
										/>
										<p className="text-xs text-gray-500 mt-1">
											The difference between the two tones (1-40 Hz). This
											determines the brain wave entrainment effect.
										</p>
									</div>

									<div className="mb-3">
										<label
											htmlFor="carrier-frequency"
											className="block text-xs font-medium text-gray-700 mb-1"
										>
											Carrier Frequency:{' '}
											{userSettings.binaural.carrierFrequency} Hz
										</label>
										<input
											id="carrier-frequency"
											type="range"
											min="100"
											max="500"
											step="10"
											value={userSettings.binaural.carrierFrequency}
											onChange={handleCarrierFrequencyChange}
											className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
										/>
										<p className="text-xs text-gray-500 mt-1">
											The base frequency (100-500 Hz). Binaural beats are best
											perceived around 400 Hz.
										</p>
									</div>

									<div className="mb-3">
										<label
											htmlFor="binaural-volume"
											className="block text-xs font-medium text-gray-700 mb-1"
										>
											Volume: {Math.round(userSettings.binaural.volume * 100)}%
										</label>
										<input
											id="binaural-volume"
											type="range"
											min="0"
											max="0.3"
											step="0.01"
											value={userSettings.binaural.volume}
											onChange={handleBinauralVolumeChange}
											className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
										/>
									</div>
								</div>
							)}
						</div>
					</div>
				)}
			</div>
		</div>
	);
}
