'use client';

import { useState, useEffect, useRef } from 'react';
import { useAppStore } from '@/lib/store';
import { isRainy, isSnowy, isCloudy } from '@/lib/weatherService';

// Default values to use when weather data is not available
const DEFAULT_WIND_SPEED = 10;
const DEFAULT_CONDITION = 'Partly cloudy';

// Audio file paths with fallbacks
const AUDIO_FILES = {
	chime: {
		primary: '/assets/audio/chime-f3-a.wav',
		fallback:
			'https://assets.mixkit.co/sfx/preview/mixkit-small-church-bell-588.mp3',
	},
	drone: {
		primary: '/assets/audio/drone-cello-f.mp3',
		fallback:
			'https://assets.mixkit.co/sfx/preview/mixkit-cinematic-mystery-drone-2783.mp3',
	},
	ambience: {
		default: {
			primary: '/assets/audio/very-low-wind.wav',
			fallback:
				'https://assets.mixkit.co/sfx/preview/mixkit-light-wind-1166.mp3',
		},
		rain: {
			primary: '/assets/audio/heavy-rain.mp3',
			fallback:
				'https://assets.mixkit.co/sfx/preview/mixkit-heavy-rain-loop-1248.mp3',
		},
		snow: {
			primary: '/assets/audio/light-snow.mp3',
			fallback:
				'https://assets.mixkit.co/sfx/preview/mixkit-blizzard-cold-winds-1153.mp3',
		},
		cloudy: {
			primary: '/assets/audio/medium-wind.mp3',
			fallback:
				'https://assets.mixkit.co/sfx/preview/mixkit-forest-wind-ambient-2431.mp3',
		},
	},
};

export function useSimpleAudio() {
	const { weather, userSettings } = useAppStore();
	const [isPlaying, setIsPlaying] = useState(false);
	const [isInitialized, setIsInitialized] = useState(false);

	// Audio elements
	const audioContext = useRef<AudioContext | null>(null);
	const gainNode = useRef<GainNode | null>(null);
	const chimeAudio = useRef<HTMLAudioElement | null>(null);
	const droneAudio = useRef<HTMLAudioElement | null>(null);
	const ambienceAudio = useRef<HTMLAudioElement | null>(null);
	const oscillator = useRef<OscillatorNode | null>(null);

	// Initialize audio
	const initializeAudio = async () => {
		try {
			console.log('Initializing audio...');

			// Create audio context
			const AudioContextClass =
				window.AudioContext || (window as any).webkitAudioContext;
			if (!AudioContextClass) {
				throw new Error('AudioContext not supported in this browser');
			}

			const context = new AudioContextClass();
			audioContext.current = context;

			// Create master gain node
			const master = context.createGain();
			master.gain.value = 0.8;
			master.connect(context.destination);
			gainNode.current = master;

			// Resume audio context if needed
			if (context.state === 'suspended') {
				await context.resume();
			}

			setIsInitialized(true);
			console.log('Audio initialized successfully');
			return true;
		} catch (error) {
			console.error('Error initializing audio:', error);
			return false;
		}
	};

	// Load audio with fallback
	const loadAudioWithFallback = (
		primarySrc: string,
		fallbackSrc: string
	): Promise<HTMLAudioElement> => {
		return new Promise((resolve, reject) => {
			const audio = new Audio();

			// First try the primary source
			audio.src = primarySrc;

			const onError = () => {
				console.log(
					`Primary audio source failed: ${primarySrc}, trying fallback: ${fallbackSrc}`
				);
				// If primary fails, try fallback
				audio.src = fallbackSrc;

				// If fallback also fails, reject
				audio.onerror = () => {
					console.error(
						`Both primary and fallback audio sources failed: ${primarySrc}, ${fallbackSrc}`
					);
					reject(new Error(`Failed to load audio from both sources`));
				};

				// If fallback succeeds, resolve
				audio.oncanplaythrough = () => {
					console.log(`Fallback audio loaded successfully: ${fallbackSrc}`);
					resolve(audio);
				};
			};

			// Set up event handlers for primary source
			audio.onerror = onError;

			audio.oncanplaythrough = () => {
				console.log(`Primary audio loaded successfully: ${primarySrc}`);
				resolve(audio);
			};

			// Set a timeout for loading
			setTimeout(() => {
				if (audio.readyState < 3) {
					// HAVE_FUTURE_DATA
					console.log(`Audio load timeout for: ${primarySrc}`);
					onError();
				}
			}, 3000);

			// Start loading
			audio.load();
		});
	};

	// Start audio playback
	const startAudio = async () => {
		try {
			console.log('Starting audio...');

			if (!isInitialized) {
				const success = await initializeAudio();
				if (!success) {
					console.error('Failed to initialize audio context');
					throw new Error('Failed to initialize audio. Please try again.');
				}
			}

			// Determine which ambience sample to use based on weather
			const conditionText =
				weather?.current?.condition?.text || DEFAULT_CONDITION;
			let ambienceSources = AUDIO_FILES.ambience.default;

			if (isRainy(conditionText)) {
				ambienceSources = AUDIO_FILES.ambience.rain;
			} else if (isSnowy(conditionText)) {
				ambienceSources = AUDIO_FILES.ambience.snow;
			} else if (isCloudy(conditionText)) {
				ambienceSources = AUDIO_FILES.ambience.cloudy;
			}

			// Create audio elements
			const context = audioContext.current;
			const master = gainNode.current;

			if (!context || !master) {
				throw new Error('Audio context not initialized');
			}

			// Clean up existing audio
			if (chimeAudio.current) {
				chimeAudio.current.pause();
				chimeAudio.current.src = '';
			}

			if (droneAudio.current) {
				droneAudio.current.pause();
				droneAudio.current.src = '';
			}

			if (ambienceAudio.current) {
				ambienceAudio.current.pause();
				ambienceAudio.current.src = '';
			}

			if (oscillator.current) {
				oscillator.current.stop();
				oscillator.current.disconnect();
				oscillator.current = null;
			}

			// Load all audio files with fallbacks
			try {
				// Load and play drone
				console.log('Loading drone audio...');
				const drone = await loadAudioWithFallback(
					AUDIO_FILES.drone.primary,
					AUDIO_FILES.drone.fallback
				);
				drone.loop = true;
				drone.volume = 0.5;
				await drone
					.play()
					.catch((e) => console.warn('Error playing drone:', e));
				droneAudio.current = drone;
				console.log('Drone playing');

				// Load and play ambience
				console.log('Loading ambience audio...');
				const ambience = await loadAudioWithFallback(
					ambienceSources.primary,
					ambienceSources.fallback
				);
				ambience.loop = true;
				ambience.volume = 0.3;
				await ambience
					.play()
					.catch((e) => console.warn('Error playing ambience:', e));
				ambienceAudio.current = ambience;
				console.log('Ambience playing');

				// Load chime (will be played based on wind speed)
				console.log('Loading chime audio...');
				const chime = await loadAudioWithFallback(
					AUDIO_FILES.chime.primary,
					AUDIO_FILES.chime.fallback
				);
				chime.volume = 0.7;
				chimeAudio.current = chime;
				console.log('Chime loaded');
			} catch (audioError) {
				console.error('Error loading audio:', audioError);
				// Continue even if some audio files fail to load
			}

			// Create binaural beat if enabled
			if (userSettings.binaural.enabled) {
				try {
					const osc = context.createOscillator();
					osc.frequency.value = userSettings.binaural.frequency;
					osc.type = 'sine';

					const oscGain = context.createGain();
					oscGain.gain.value = 0.1;

					osc.connect(oscGain);
					oscGain.connect(master);

					osc.start();
					oscillator.current = osc;
					console.log('Binaural beat started');
				} catch (e) {
					console.error('Error creating binaural beat:', e);
				}
			}

			// Start playing chimes based on wind speed
			const windSpeed = weather?.current?.wind_kph || DEFAULT_WIND_SPEED;
			startChimes(windSpeed);

			setIsPlaying(true);
			console.log('Audio playback started successfully');
		} catch (error) {
			console.error('Error starting audio:', error);
			throw error;
		}
	};

	// Play chimes based on wind speed
	const chimeIntervals = useRef<number[]>([]);

	const startChimes = (windSpeed: number) => {
		if (!chimeAudio.current) {
			console.warn('Cannot start chimes: chime audio not loaded');
			return;
		}

		// Clear any existing intervals
		clearChimeIntervals();

		// Wind speed faster than 74mph is a hurricane
		const swingProbability = Math.ceil((100 * windSpeed) / 74) / 100;

		// Create intervals for chime sounds based on wind speed
		for (let i = 0; i < 3; i++) {
			const randomNum = Math.random() * swingProbability;
			let interval = 5000; // default interval

			if (randomNum >= 0.01 && randomNum <= 0.14) {
				// Slow wind
				interval = Math.max(randomNum * 50, 2) * 1000;
			} else if (randomNum <= 0.3 && randomNum >= 0.15) {
				// Medium wind
				interval = Math.max(randomNum * 40, 1.8) * 1000;
			} else if (randomNum >= 0.31) {
				// Fast wind
				interval = Math.max(randomNum * 30, 1.6) * 500;
			}

			const intervalId = window.setInterval(() => {
				if (chimeAudio.current) {
					try {
						// Clone the audio element to allow overlapping sounds
						const chimeSound =
							chimeAudio.current.cloneNode() as HTMLAudioElement;
						chimeSound.volume = Math.random() * 0.3 + 0.4; // Random volume between 0.4 and 0.7
						chimeSound
							.play()
							.catch((err) => console.warn('Error playing chime:', err));
					} catch (e) {
						console.warn('Error playing chime sound:', e);
					}
				}
			}, interval);

			chimeIntervals.current.push(intervalId);
		}

		console.log(`Started ${chimeIntervals.current.length} chime intervals`);
	};

	// Clear all chime intervals
	const clearChimeIntervals = () => {
		chimeIntervals.current.forEach((id) => clearInterval(id));
		chimeIntervals.current = [];
	};

	// Stop all audio
	const stopAudio = () => {
		console.log('Stopping audio...');
		clearChimeIntervals();

		if (chimeAudio.current) {
			chimeAudio.current.pause();
		}

		if (droneAudio.current) {
			droneAudio.current.pause();
		}

		if (ambienceAudio.current) {
			ambienceAudio.current.pause();
		}

		if (oscillator.current) {
			oscillator.current.stop();
		}

		setIsPlaying(false);
		console.log('Audio stopped');
	};

	// Clean up on unmount
	useEffect(() => {
		return () => {
			stopAudio();

			if (audioContext.current) {
				audioContext.current
					.close()
					.catch((err) => console.error('Error closing audio context:', err));
			}
		};
	}, []);

	// Update audio settings when user settings change
	useEffect(() => {
		if (!isInitialized || !isPlaying) return;

		// Update master volume
		if (gainNode.current) {
			gainNode.current.gain.value = userSettings.mute.master
				? 0
				: (userSettings.volume.master + 30) / 36; // Convert from -30 to 6 range to 0 to 1
		}

		// Update drone volume and mute
		if (droneAudio.current) {
			droneAudio.current.volume = userSettings.mute.drone
				? 0
				: ((userSettings.volume.drone + 30) / 36) * 0.7;
		}

		// Update ambience volume and mute
		if (ambienceAudio.current) {
			ambienceAudio.current.volume = userSettings.mute.ambience
				? 0
				: ((userSettings.volume.ambience + 30) / 36) * 0.5;
		}

		// Update binaural beat
		if (userSettings.binaural.enabled) {
			if (!oscillator.current && audioContext.current) {
				try {
					const osc = audioContext.current.createOscillator();
					osc.frequency.value = userSettings.binaural.frequency;
					osc.type = 'sine';

					const oscGain = audioContext.current.createGain();
					oscGain.gain.value = 0.1;

					osc.connect(oscGain);
					oscGain.connect(audioContext.current.destination);

					osc.start();
					oscillator.current = osc;
				} catch (e) {
					console.error('Error creating binaural beat:', e);
				}
			} else if (oscillator.current) {
				oscillator.current.frequency.value = userSettings.binaural.frequency;
			}
		} else if (oscillator.current) {
			oscillator.current.stop();
			oscillator.current = null;
		}
	}, [userSettings, isInitialized, isPlaying]);

	return {
		isPlaying,
		isInitialized,
		startAudio,
		stopAudio,
	};
}
