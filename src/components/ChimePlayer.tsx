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
} from 'react-icons/fa';
import LoadingSpinner from './ui/LoadingSpinner';

// Global variable to store geolocation data across component remounts
let cachedGeolocation: { latitude: number; longitude: number } | null = null;

export default function ChimePlayer() {
	const { isPlaying, isInitialized, startAudio, stopAudio } = useSimpleAudio();
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
	const [showControls, setShowControls] = useState(false);
	const [audioError, setAudioError] = useState<string | null>(null);
	const [setupComplete, setSetupComplete] = useState(false);
	const [autoStarted, setAutoStarted] = useState(false);
	const [weatherFetched, setWeatherFetched] = useState(false);
	const isFetchingRef = useRef(false);
	const mountedRef = useRef(true);

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
				frequency: value,
			},
		});
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
			<div className="mb-8 text-center">
				{weather ? (
					<>
						<h2 className="text-2xl font-semibold text-gray-800">
							{weather.location.name}, {weather.location.country}
						</h2>
						<div className="flex items-center justify-center mt-2">
							<img
								src={weather.current.condition.icon}
								alt={weather.current.condition.text}
								className="w-16 h-16"
							/>
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
					<g
						fill="none"
						fillRule="nonzero"
						className={`chime-bell ${isPlaying ? 'animate-swing-slow' : ''}`}
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
					<g
						fill="none"
						fillRule="nonzero"
						className={`chime-bell ${isPlaying ? 'animate-swing-med' : ''}`}
						style={{ animationDelay: '100ms' }}
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
					<g
						fill="none"
						fillRule="nonzero"
						className={`chime-bell ${isPlaying ? 'animate-swing-fast' : ''}`}
						style={{ animationDelay: '200ms' }}
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
					<g
						fill="none"
						fillRule="nonzero"
						className={`chime-bell ${isPlaying ? 'animate-swing-med' : ''}`}
						style={{ animationDelay: '300ms' }}
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
					<g
						fill="none"
						fillRule="nonzero"
						className={`chime-bell ${isPlaying ? 'animate-swing-slow' : ''}`}
						style={{ animationDelay: '400ms' }}
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
						<div className="flex items-center mb-4">
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
								<div className="mt-2">
									<label
										htmlFor="binaural-frequency"
										className="block text-sm font-medium text-gray-700 mb-1"
									>
										Frequency: {userSettings.binaural.frequency} Hz
									</label>
									<input
										id="binaural-frequency"
										type="range"
										min="20"
										max="1000"
										step="1"
										value={userSettings.binaural.frequency}
										onChange={handleBinauralFrequencyChange}
										className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
									/>
								</div>
							)}
						</div>
					</div>
				)}
			</div>
		</div>
	);
}
