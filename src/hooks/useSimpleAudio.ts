'use client';

import { useState, useEffect, useRef } from 'react';
import { useAppStore } from '@/lib/store';
import { isRainy, isSnowy, isCloudy } from '@/lib/weatherService';

// Default values to use when weather data is not available
const DEFAULT_WIND_SPEED = 10;
const DEFAULT_CONDITION = 'Partly cloudy';

// Audio file paths with fallbacks
const AUDIO_FILES = {
	chimes: {
		c3: {
			a: '/assets/audio/chime-c3-a.wav',
			b: '/assets/audio/chime-c3-b.wav',
			fallback:
				'https://assets.mixkit.co/sfx/preview/mixkit-small-church-bell-588.mp3',
		},
		c4: {
			a: '/assets/audio/chime-c4-a.wav',
			b: '/assets/audio/chime-c4-b.wav',
			fallback:
				'https://assets.mixkit.co/sfx/preview/mixkit-cathedral-church-bell-599.mp3',
		},
		d3: {
			a: '/assets/audio/chime-d3-a.wav',
			b: '/assets/audio/chime-d3-b.wav',
			fallback:
				'https://assets.mixkit.co/sfx/preview/mixkit-church-bell-triple-hit-583.mp3',
		},
		eb3: {
			a: '/assets/audio/chime-eb3-a.wav',
			b: '/assets/audio/chime-eb3-b.wav',
			fallback:
				'https://assets.mixkit.co/sfx/preview/mixkit-short-church-bell-588.mp3',
		},
		f3: {
			a: '/assets/audio/chime-f3-a.wav',
			b: '/assets/audio/chime-f3-b.wav',
			fallback:
				'https://assets.mixkit.co/sfx/preview/mixkit-small-church-bell-588.mp3',
		},
		g3: {
			single: '/assets/audio/chime-g3.wav',
			fallback:
				'https://assets.mixkit.co/sfx/preview/mixkit-church-bell-hit-592.mp3',
		},
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
	const droneAudio = useRef<HTMLAudioElement | null>(null);
	const ambienceAudio = useRef<HTMLAudioElement | null>(null);
	const oscillator = useRef<OscillatorNode | null>(null);

	// Chime audio elements
	const chimeAudios = useRef<{
		c3: { a: HTMLAudioElement | null; b: HTMLAudioElement | null };
		c4: { a: HTMLAudioElement | null; b: HTMLAudioElement | null };
		d3: { a: HTMLAudioElement | null; b: HTMLAudioElement | null };
		eb3: { a: HTMLAudioElement | null; b: HTMLAudioElement | null };
		f3: { a: HTMLAudioElement | null; b: HTMLAudioElement | null };
		g3: HTMLAudioElement | null;
	}>({
		c3: { a: null, b: null },
		c4: { a: null, b: null },
		d3: { a: null, b: null },
		eb3: { a: null, b: null },
		f3: { a: null, b: null },
		g3: null,
	});

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
			if (droneAudio.current) {
				droneAudio.current.pause();
				droneAudio.current.src = '';
			}

			if (ambienceAudio.current) {
				ambienceAudio.current.pause();
				ambienceAudio.current.src = '';
			}

			// Clean up all chime audio elements
			Object.keys(chimeAudios.current).forEach((key) => {
				const chime =
					chimeAudios.current[key as keyof typeof chimeAudios.current];
				if (chime) {
					if ('a' in chime && chime.a) {
						chime.a.pause();
						chime.a.src = '';
					}
					if ('b' in chime && chime.b) {
						chime.b.pause();
						chime.b.src = '';
					}
					if (!('a' in chime) && chime) {
						(chime as HTMLAudioElement).pause();
						(chime as HTMLAudioElement).src = '';
					}
				}
			});

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

				// Load all chime sounds
				console.log('Loading chime audio files...');

				// Load C3 chimes
				chimeAudios.current.c3.a = await loadAudioWithFallback(
					AUDIO_FILES.chimes.c3.a,
					AUDIO_FILES.chimes.c3.fallback
				);
				chimeAudios.current.c3.a.volume = 0.7;

				chimeAudios.current.c3.b = await loadAudioWithFallback(
					AUDIO_FILES.chimes.c3.b,
					AUDIO_FILES.chimes.c3.fallback
				);
				chimeAudios.current.c3.b.volume = 0.7;

				// Load C4 chimes
				chimeAudios.current.c4.a = await loadAudioWithFallback(
					AUDIO_FILES.chimes.c4.a,
					AUDIO_FILES.chimes.c4.fallback
				);
				chimeAudios.current.c4.a.volume = 0.7;

				chimeAudios.current.c4.b = await loadAudioWithFallback(
					AUDIO_FILES.chimes.c4.b,
					AUDIO_FILES.chimes.c4.fallback
				);
				chimeAudios.current.c4.b.volume = 0.7;

				// Load D3 chimes
				chimeAudios.current.d3.a = await loadAudioWithFallback(
					AUDIO_FILES.chimes.d3.a,
					AUDIO_FILES.chimes.d3.fallback
				);
				chimeAudios.current.d3.a.volume = 0.7;

				chimeAudios.current.d3.b = await loadAudioWithFallback(
					AUDIO_FILES.chimes.d3.b,
					AUDIO_FILES.chimes.d3.fallback
				);
				chimeAudios.current.d3.b.volume = 0.7;

				// Load Eb3 chimes
				chimeAudios.current.eb3.a = await loadAudioWithFallback(
					AUDIO_FILES.chimes.eb3.a,
					AUDIO_FILES.chimes.eb3.fallback
				);
				chimeAudios.current.eb3.a.volume = 0.7;

				chimeAudios.current.eb3.b = await loadAudioWithFallback(
					AUDIO_FILES.chimes.eb3.b,
					AUDIO_FILES.chimes.eb3.fallback
				);
				chimeAudios.current.eb3.b.volume = 0.7;

				// Load F3 chimes
				chimeAudios.current.f3.a = await loadAudioWithFallback(
					AUDIO_FILES.chimes.f3.a,
					AUDIO_FILES.chimes.f3.fallback
				);
				chimeAudios.current.f3.a.volume = 0.7;

				chimeAudios.current.f3.b = await loadAudioWithFallback(
					AUDIO_FILES.chimes.f3.b,
					AUDIO_FILES.chimes.f3.fallback
				);
				chimeAudios.current.f3.b.volume = 0.7;

				// Load G3 chime
				chimeAudios.current.g3 = await loadAudioWithFallback(
					AUDIO_FILES.chimes.g3.single,
					AUDIO_FILES.chimes.g3.fallback
				);
				chimeAudios.current.g3.volume = 0.7;

				console.log('All chime sounds loaded successfully');
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
			const windSpeed = weather?.current?.wind_mph || DEFAULT_WIND_SPEED;
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
		// Check if chime audio is loaded
		if (
			!chimeAudios.current.c3.a ||
			!chimeAudios.current.c4.a ||
			!chimeAudios.current.d3.a ||
			!chimeAudios.current.eb3.a ||
			!chimeAudios.current.f3.a ||
			!chimeAudios.current.g3
		) {
			console.warn('Cannot start chimes: not all chime audio files are loaded');
			return;
		}

		// Clear any existing intervals
		clearChimeIntervals();

		// Wind speed faster than 74mph is a hurricane
		const swingProbability = Math.ceil((100 * windSpeed) / 74) / 100;

		// Create intervals for each chime with different timing
		const chimeTypes = [
			{ name: 'c3', delay: 0, alternating: true },
			{ name: 'c4', delay: 100, alternating: true },
			{ name: 'd3', delay: 200, alternating: true },
			{ name: 'eb3', delay: 300, alternating: true },
			{ name: 'f3', delay: 400, alternating: true },
			{ name: 'g3', delay: 500, alternating: false },
		];

		chimeTypes.forEach((chime, index) => {
			// Calculate interval based on wind speed and add some randomness
			const baseInterval = 5000 - windSpeed * 50;
			const randomFactor = Math.random() * 0.5 + 0.75; // 0.75 to 1.25
			const interval =
				Math.max(baseInterval * randomFactor, 1000) + chime.delay;

			let useA = true; // For alternating between A and B sounds

			const intervalId = window.setInterval(() => {
				try {
					// Determine if this chime should play based on wind probability
					if (Math.random() < swingProbability) {
						let chimeSound: HTMLAudioElement | null = null;

						// Get the appropriate chime sound
						if (chime.alternating) {
							const chimePair =
								chimeAudios.current[
									chime.name as keyof typeof chimeAudios.current
								];
							if (chimePair && 'a' in chimePair && 'b' in chimePair) {
								chimeSound = useA ? chimePair.a : chimePair.b;
								useA = !useA; // Toggle for next time
							}
						} else {
							// For G3 which doesn't alternate
							chimeSound = chimeAudios.current[
								chime.name as keyof typeof chimeAudios.current
							] as HTMLAudioElement;
						}

						if (chimeSound) {
							// Clone the audio element to allow overlapping sounds
							const soundClone = chimeSound.cloneNode() as HTMLAudioElement;
							soundClone.volume = Math.random() * 0.3 + 0.4; // Random volume between 0.4 and 0.7
							soundClone
								.play()
								.catch((err) =>
									console.warn(`Error playing ${chime.name} chime:`, err)
								);
						}
					}
				} catch (e) {
					console.warn(`Error playing ${chime.name} chime sound:`, e);
				}
			}, interval);

			chimeIntervals.current.push(intervalId);
		});

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

		if (droneAudio.current) {
			droneAudio.current.pause();
		}

		if (ambienceAudio.current) {
			ambienceAudio.current.pause();
		}

		// Clean up all chime audio elements
		Object.keys(chimeAudios.current).forEach((key) => {
			const chime =
				chimeAudios.current[key as keyof typeof chimeAudios.current];
			if (chime) {
				if ('a' in chime && chime.a) {
					chime.a.pause();
					chime.a.src = '';
				}
				if ('b' in chime && chime.b) {
					chime.b.pause();
					chime.b.src = '';
				}
				if (!('a' in chime) && chime) {
					(chime as HTMLAudioElement).pause();
					(chime as HTMLAudioElement).src = '';
				}
			}
		});

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
