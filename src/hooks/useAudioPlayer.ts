'use client';

import { useEffect, useState, useRef } from 'react';
import * as Tone from 'tone';
import { useAppStore } from '@/lib/store';
import { isRainy, isSnowy, isCloudy } from '@/lib/weatherService';
import { AudioPack } from '@/types';

// Add type declaration for webkitAudioContext
declare global {
	interface Window {
		webkitAudioContext: typeof AudioContext;
	}
}

interface AudioElements {
	chimes: Tone.Sampler | null;
	drone: Tone.Sampler | null;
	ambience: Tone.Sampler | null;
	reverb: any; // Change to 'any' to accommodate different Tone.js versions
	binaural: Tone.Oscillator | null;
}

export function useAudioPlayer() {
	const { weather, userSettings, audioPacks, selectedPack } = useAppStore();
	const [isPlaying, setIsPlaying] = useState(false);
	const [isInitialized, setIsInitialized] = useState(false);
	const [initializationAttempted, setInitializationAttempted] = useState(false);
	const audioElements = useRef<AudioElements>({
		chimes: null,
		drone: null,
		ambience: null,
		reverb: null,
		binaural: null,
	});

	// Get the selected audio pack
	const getSelectedPack = (): AudioPack => {
		const pack = audioPacks.find((p) => p.id === selectedPack);
		return pack || audioPacks[0];
	};

	// Initialize audio context
	const initializeAudio = async () => {
		try {
			console.log('Attempting to initialize audio...');
			setInitializationAttempted(true);

			// Initialize Tone.js context in a way that works with different versions
			if (!Tone.context || Tone.context.state === 'suspended') {
				// Try different methods to start the audio context
				if (typeof Tone.start === 'function') {
					console.log('Using Tone.start()');
					await Tone.start();
				} else if (typeof Tone.context?.resume === 'function') {
					console.log('Using Tone.context.resume()');
					await Tone.context.resume();
				} else {
					// Fallback: create a new context
					console.log('Using fallback AudioContext creation');
					const AudioContext = window.AudioContext || window.webkitAudioContext;
					const audioContext = new AudioContext();
					// @ts-ignore - setContext might not be in type definitions but exists in some versions
					if (typeof Tone.setContext === 'function') {
						Tone.setContext(new Tone.Context(audioContext));
					}
				}
			}

			// Create a simple gain node instead of reverb to avoid compatibility issues
			try {
				console.log('Creating audio effect...');
				const gain = new Tone.Gain(0.8).toDestination();
				audioElements.current.reverb = gain;
				console.log('Audio effect created successfully');
			} catch (effectError) {
				console.error('Error creating audio effect:', effectError);
				audioElements.current.reverb = null;
			}

			setIsInitialized(true);
			console.log('Audio initialized successfully');
		} catch (error) {
			console.error('Error initializing audio:', error);
			throw error;
		}
	};

	// Load audio samples based on weather and selected pack
	const loadAudioSamples = async () => {
		if (!weather || !isInitialized) return;

		const pack = getSelectedPack();
		const conditionText = weather.current.condition.text;
		const windSpeed = weather.current.wind_kph;

		// Determine which ambience sample to use based on weather
		let ambienceSample = pack.samples.ambience.default;

		if (isRainy(conditionText)) {
			ambienceSample = pack.samples.ambience.rain;
		} else if (isSnowy(conditionText)) {
			ambienceSample = pack.samples.ambience.snow;
		} else if (isCloudy(conditionText)) {
			ambienceSample = pack.samples.ambience.cloudy;
		} else {
			ambienceSample = pack.samples.ambience.clear;
		}

		// Clean up existing audio elements
		if (audioElements.current.chimes) {
			audioElements.current.chimes.dispose();
		}

		if (audioElements.current.drone) {
			audioElements.current.drone.dispose();
		}

		if (audioElements.current.ambience) {
			audioElements.current.ambience.dispose();
		}

		if (audioElements.current.binaural) {
			audioElements.current.binaural.dispose();
		}

		// Create new audio elements
		const reverb = audioElements.current.reverb;

		// Load chimes
		const chimes = new Tone.Sampler({
			urls: {
				C4: `/assets/audio/${pack.samples.chimes[0]}`,
			},
			onload: () => {
				console.log('Chimes loaded');
			},
		})
			.connect(reverb as Tone.Reverb)
			.toDestination();

		// Load drone
		const drone = new Tone.Sampler({
			urls: {
				C4: `/assets/audio/${pack.samples.drones[0]}`,
			},
			onload: () => {
				console.log('Drone loaded');
				drone.volume.value = userSettings.volume.drone;
				if (userSettings.mute.drone) {
					drone.volume.value = -Infinity;
				}
				drone.triggerAttack('C4', Tone.now());
			},
		}).toDestination();

		// Load ambience
		const ambience = new Tone.Sampler({
			urls: {
				C4: `/assets/audio/${ambienceSample}`,
			},
			onload: () => {
				console.log('Ambience loaded');
				ambience.volume.value = userSettings.volume.ambience;
				if (userSettings.mute.ambience) {
					ambience.volume.value = -Infinity;
				}
				ambience.triggerAttack('C4', Tone.now());
			},
		}).toDestination();

		// Create binaural beat if enabled
		if (userSettings.binaural.enabled) {
			const binaural = new Tone.Oscillator({
				frequency: userSettings.binaural.frequency,
				type: 'sine',
				volume: -20,
			}).toDestination();

			binaural.start();
			audioElements.current.binaural = binaural;
		}

		// Store references
		audioElements.current.chimes = chimes;
		audioElements.current.drone = drone;
		audioElements.current.ambience = ambience;

		// Set master volume
		Tone.Destination.volume.value = userSettings.volume.master;
		if (userSettings.mute.master) {
			Tone.Destination.mute = true;
		} else {
			Tone.Destination.mute = false;
		}

		// Start playing chimes based on wind speed
		startChimes(windSpeed);

		setIsPlaying(true);
	};

	// Play chimes based on wind speed
	const startChimes = (windSpeed: number) => {
		if (!audioElements.current.chimes) return;

		const chimes = audioElements.current.chimes;

		// Wind speed faster than 74mph is a hurricane
		const swingProbability = Math.ceil((100 * windSpeed) / 74) / 100;
		const pitchArray = [-3, -5, -8, -10, -12];

		// Clear any existing intervals
		clearChimeIntervals();

		// Create intervals for chime sounds based on wind speed
		for (let i = 0; i < 5; i++) {
			const randomNum = Math.random() * swingProbability;

			if (randomNum >= 0.01 && randomNum <= 0.14) {
				// Slow wind
				const animationDuration = Math.max(randomNum * 50, 2);

				const intervalId = setInterval(() => {
					if (!audioElements.current.chimes) return;

					const rand =
						pitchArray[Math.floor(Math.random() * pitchArray.length)];
					const note = Tone.Frequency('C4').transpose(rand).toNote();

					chimes.triggerAttack(note, Tone.now(), 0.1);
				}, animationDuration * 1000);

				chimeIntervals.current.push(intervalId);
			} else if (randomNum <= 0.3 && randomNum >= 0.15) {
				// Medium wind
				const animationDuration = Math.max(randomNum * 40, 1.8);

				const intervalId = setInterval(() => {
					if (!audioElements.current.chimes) return;

					const rand =
						pitchArray[Math.floor(Math.random() * pitchArray.length)];
					const note = Tone.Frequency('C4').transpose(rand).toNote();

					chimes.triggerAttack(note, Tone.now(), 0.2);
				}, animationDuration * 1000);

				chimeIntervals.current.push(intervalId);
			} else if (randomNum >= 0.31) {
				// Fast wind
				const animationDuration = Math.max(randomNum * 30, 1.6);

				const intervalId = setInterval(() => {
					if (!audioElements.current.chimes) return;

					const rand =
						pitchArray[Math.floor(Math.random() * pitchArray.length)];
					const note = Tone.Frequency('C4').transpose(rand).toNote();

					chimes.triggerAttack(note, Tone.now(), 0.3);
				}, animationDuration * 500);

				chimeIntervals.current.push(intervalId);
			}
		}
	};

	// Store intervals for chime sounds
	const chimeIntervals = useRef<NodeJS.Timeout[]>([]);

	// Clear all chime intervals
	const clearChimeIntervals = () => {
		chimeIntervals.current.forEach((intervalId) => clearInterval(intervalId));
		chimeIntervals.current = [];
	};

	// Stop all audio
	const stopAudio = () => {
		clearChimeIntervals();

		if (audioElements.current.chimes) {
			audioElements.current.chimes.releaseAll();
		}

		if (audioElements.current.drone) {
			audioElements.current.drone.releaseAll();
		}

		if (audioElements.current.ambience) {
			audioElements.current.ambience.releaseAll();
		}

		if (audioElements.current.binaural) {
			audioElements.current.binaural.stop();
		}

		setIsPlaying(false);
	};

	// Start audio playback
	const startAudio = async () => {
		if (!isInitialized && !initializationAttempted) {
			await initializeAudio();
		}

		if (isInitialized && weather) {
			await loadAudioSamples();
		}
	};

	// Initialize audio on component mount
	useEffect(() => {
		initializeAudio();

		return () => {
			stopAudio();

			// Dispose all audio elements
			Object.values(audioElements.current).forEach((element) => {
				if (element) {
					element.dispose();
				}
			});
		};
	}, []);

	// Load audio samples when weather data changes
	useEffect(() => {
		if (weather && isInitialized) {
			loadAudioSamples();
		}
	}, [weather, isInitialized, selectedPack]);

	// Update audio settings when user settings change
	useEffect(() => {
		if (!isInitialized) return;

		// Update master volume
		Tone.Destination.volume.value = userSettings.volume.master;

		// Update master mute
		if (userSettings.mute.master) {
			Tone.Destination.mute = true;
		} else {
			Tone.Destination.mute = false;
		}

		// Update drone volume and mute
		if (audioElements.current.drone) {
			audioElements.current.drone.volume.value = userSettings.mute.drone
				? -Infinity
				: userSettings.volume.drone;
		}

		// Update ambience volume and mute
		if (audioElements.current.ambience) {
			audioElements.current.ambience.volume.value = userSettings.mute.ambience
				? -Infinity
				: userSettings.volume.ambience;
		}

		// Update chimes volume and mute
		if (audioElements.current.chimes) {
			audioElements.current.chimes.volume.value = userSettings.mute.chimes
				? -Infinity
				: userSettings.volume.chimes;
		}

		// Update binaural beat
		if (userSettings.binaural.enabled) {
			if (!audioElements.current.binaural) {
				const binaural = new Tone.Oscillator({
					frequency: userSettings.binaural.frequency,
					type: 'sine',
					volume: -20,
				}).toDestination();

				binaural.start();
				audioElements.current.binaural = binaural;
			} else {
				audioElements.current.binaural.frequency.value =
					userSettings.binaural.frequency;
			}
		} else if (audioElements.current.binaural) {
			audioElements.current.binaural.stop();
			audioElements.current.binaural.dispose();
			audioElements.current.binaural = null;
		}
	}, [userSettings, isInitialized]);

	return {
		isPlaying,
		isInitialized,
		startAudio,
		stopAudio,
	};
}
