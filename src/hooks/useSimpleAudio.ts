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
			primary: '/assets/audio/med-wind.wav',
			fallback:
				'https://assets.mixkit.co/sfx/preview/mixkit-forest-wind-ambient-2431.mp3',
		},
	},
};

export function useSimpleAudio() {
	const { weather, userSettings } = useAppStore();
	const [isPlaying, setIsPlaying] = useState(false);
	const [isInitialized, setIsInitialized] = useState(false);
	const [activeChimes, setActiveChimes] = useState<{
		c3: boolean;
		c4: boolean;
		d3: boolean;
		eb3: boolean;
		f3: boolean;
		g3: boolean;
	}>({
		c3: false,
		c4: false,
		d3: false,
		eb3: false,
		f3: false,
		g3: false,
	});

	// Audio elements
	const audioContext = useRef<AudioContext | null>(null);
	const gainNode = useRef<GainNode | null>(null);
	const droneAudio = useRef<HTMLAudioElement | null>(null);
	const ambienceAudio = useRef<HTMLAudioElement | null>(null);
	const oscillatorLeft = useRef<OscillatorNode | null>(null);
	const oscillatorRight = useRef<OscillatorNode | null>(null);
	const binauralGain = useRef<GainNode | null>(null);
	const stereoPanner = useRef<StereoPannerNode | null>(null);
	const chimeIntervals = useRef<number[]>([]);
	const audioElements = useRef<{
		[key: string]: HTMLAudioElement | null;
	}>({});

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
			const windSpeed = weather?.current?.wind_mph || DEFAULT_WIND_SPEED;
			let ambienceSources = AUDIO_FILES.ambience.default;

			// First check wind speed - use low wind for speeds below 15mph
			if (windSpeed < 15) {
				console.log(
					`Wind speed ${windSpeed} mph is below 15mph, using low wind sound`
				);
				ambienceSources = AUDIO_FILES.ambience.default; // very-low-wind.wav
			}
			// Then check weather conditions
			else if (isRainy(conditionText)) {
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

			if (oscillatorLeft.current) {
				oscillatorLeft.current.stop();
				oscillatorLeft.current.disconnect();
				oscillatorLeft.current = null;
			}

			if (oscillatorRight.current) {
				oscillatorRight.current.stop();
				oscillatorRight.current.disconnect();
				oscillatorRight.current = null;
			}

			if (binauralGain.current) {
				binauralGain.current.gain.value = 0;
			}

			if (stereoPanner.current) {
				stereoPanner.current.pan.value = 0;
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
				drone.volume = 0.3;
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
				ambience.volume = 0.6;
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
				chimeAudios.current.c3.a.volume = 1;

				chimeAudios.current.c3.b = await loadAudioWithFallback(
					AUDIO_FILES.chimes.c3.b,
					AUDIO_FILES.chimes.c3.fallback
				);
				chimeAudios.current.c3.b.volume = 1;

				// Load C4 chimes
				chimeAudios.current.c4.a = await loadAudioWithFallback(
					AUDIO_FILES.chimes.c4.a,
					AUDIO_FILES.chimes.c4.fallback
				);
				chimeAudios.current.c4.a.volume = 1;

				chimeAudios.current.c4.b = await loadAudioWithFallback(
					AUDIO_FILES.chimes.c4.b,
					AUDIO_FILES.chimes.c4.fallback
				);
				chimeAudios.current.c4.b.volume = 1;

				// Load D3 chimes
				chimeAudios.current.d3.a = await loadAudioWithFallback(
					AUDIO_FILES.chimes.d3.a,
					AUDIO_FILES.chimes.d3.fallback
				);
				chimeAudios.current.d3.a.volume = 1;

				chimeAudios.current.d3.b = await loadAudioWithFallback(
					AUDIO_FILES.chimes.d3.b,
					AUDIO_FILES.chimes.d3.fallback
				);
				chimeAudios.current.d3.b.volume = 1;

				// Load Eb3 chimes
				chimeAudios.current.eb3.a = await loadAudioWithFallback(
					AUDIO_FILES.chimes.eb3.a,
					AUDIO_FILES.chimes.eb3.fallback
				);
				chimeAudios.current.eb3.a.volume = 1;

				chimeAudios.current.eb3.b = await loadAudioWithFallback(
					AUDIO_FILES.chimes.eb3.b,
					AUDIO_FILES.chimes.eb3.fallback
				);
				chimeAudios.current.eb3.b.volume = 1;

				// Load F3 chimes
				chimeAudios.current.f3.a = await loadAudioWithFallback(
					AUDIO_FILES.chimes.f3.a,
					AUDIO_FILES.chimes.f3.fallback
				);
				chimeAudios.current.f3.a.volume = 1;

				chimeAudios.current.f3.b = await loadAudioWithFallback(
					AUDIO_FILES.chimes.f3.b,
					AUDIO_FILES.chimes.f3.fallback
				);
				chimeAudios.current.f3.b.volume = 1;

				// Load G3 chime
				chimeAudios.current.g3 = await loadAudioWithFallback(
					AUDIO_FILES.chimes.g3.single,
					AUDIO_FILES.chimes.g3.fallback
				);
				chimeAudios.current.g3.volume = 1;

				console.log('All chime sounds loaded successfully');
			} catch (audioError) {
				console.error('Error loading audio:', audioError);
				// Continue even if some audio files fail to load
			}

			// Create binaural beat if enabled
			if (userSettings.binaural.enabled) {
				try {
					// Create two oscillators for true binaural beats
					const leftOsc = context.createOscillator();
					const rightOsc = context.createOscillator();

					// Calculate frequencies based on carrier and beat frequencies
					const carrierFreq = userSettings.binaural.carrierFrequency;
					const beatFreq = userSettings.binaural.beatFrequency;

					// Left ear frequency = carrier - (beat/2)
					// Right ear frequency = carrier + (beat/2)
					leftOsc.frequency.value = carrierFreq - beatFreq / 2;
					rightOsc.frequency.value = carrierFreq + beatFreq / 2;

					// Use sine waves for the cleanest tone
					leftOsc.type = 'sine';
					rightOsc.type = 'sine';

					// Create a stereo panner to send each oscillator to the correct ear
					const leftPanner = context.createStereoPanner();
					const rightPanner = context.createStereoPanner();
					leftPanner.pan.value = -1; // Full left
					rightPanner.pan.value = 1; // Full right

					// Create a gain node to control the volume of the binaural beats
					const binauralGainNode = context.createGain();
					binauralGainNode.gain.value = userSettings.binaural.volume;

					// Connect the oscillators to their respective panners
					leftOsc.connect(leftPanner);
					rightOsc.connect(rightPanner);

					// Connect the panners to the binaural gain node
					leftPanner.connect(binauralGainNode);
					rightPanner.connect(binauralGainNode);

					// Connect the binaural gain to the master output
					binauralGainNode.connect(master);

					// Start the oscillators
					leftOsc.start();
					rightOsc.start();

					// Store references for later use
					oscillatorLeft.current = leftOsc;
					oscillatorRight.current = rightOsc;
					binauralGain.current = binauralGainNode;

					console.log(
						'Binaural beat started with carrier frequency:',
						carrierFreq,
						'Hz and beat frequency:',
						beatFreq,
						'Hz'
					);
				} catch (e) {
					console.error('Error creating binaural beat:', e);
				}
			}

			// Start playing chimes based on wind speed
			startChimes(windSpeed);

			setIsPlaying(true);
			console.log('Audio playback started successfully');
		} catch (error) {
			console.error('Error starting audio:', error);
			throw error;
		}
	};

	// Play chimes based on wind speed
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

		// If wind speed is below threshold, don't play chimes or play very rarely
		const MIN_WIND_SPEED = 8; // mph - minimum wind speed to start moving chimes

		// Calculate probability based on wind speed
		// 0 at MIN_WIND_SPEED, increases as wind speed increases
		// 74mph is hurricane force, so we use that as our max
		let swingProbability = 0;
		if (windSpeed > MIN_WIND_SPEED) {
			swingProbability = Math.min(
				(windSpeed - MIN_WIND_SPEED) / (74 - MIN_WIND_SPEED),
				1
			);
		}

		console.log(
			`Wind speed: ${windSpeed} mph, Swing probability: ${swingProbability}`
		);

		// Create intervals for each chime with different timing
		const chimeTypes = [
			{ name: 'c3', delay: 0, alternating: true, lowTone: true },
			{ name: 'c4', delay: 100, alternating: true, lowTone: false },
			{ name: 'd3', delay: 200, alternating: true, lowTone: true },
			{ name: 'eb3', delay: 300, alternating: true, lowTone: true },
			{ name: 'f3', delay: 400, alternating: true, lowTone: true },
			{ name: 'g3', delay: 500, alternating: false, lowTone: true },
		];

		chimeTypes.forEach((chime, index) => {
			// Calculate interval based on wind speed
			// Higher wind speed = shorter intervals between chimes
			const baseInterval =
				windSpeed <= MIN_WIND_SPEED
					? 10000 // Play every 10 seconds at low wind speeds (reduced from 30 seconds)
					: Math.max(8000 - windSpeed * 100, 500); // Faster at higher wind speeds, minimum 500ms (reduced from 2000ms)

			const randomFactor = Math.random() * 0.5 + 0.75; // 0.75 to 1.25
			const interval = Math.max(baseInterval * randomFactor, 500) + chime.delay;

			// Adjust probability based on tone at lower wind speeds
			// At lower wind speeds, prioritize lower tone chimes
			let chimeSpecificProbability = swingProbability;
			if (windSpeed < 15 && chime.lowTone) {
				// Boost probability for low tone chimes at low wind speeds
				chimeSpecificProbability = Math.min(swingProbability * 2, 1);
			} else if (windSpeed < 15 && !chime.lowTone) {
				// Reduce probability for high tone chimes at low wind speeds
				chimeSpecificProbability = swingProbability * 0.5;
			}

			let useA = true; // For alternating between A and B sounds

			const intervalId = window.setInterval(() => {
				try {
					// Determine if this chime should play based on wind probability
					if (Math.random() < chimeSpecificProbability) {
						let chimeSound: HTMLAudioElement | null = null;

						// Get the appropriate chime sound
						if (chime.alternating) {
							const chimePair =
								chimeAudios.current[
									chime.name as keyof typeof chimeAudios.current
								];
							if (chimePair && 'a' in chimePair && 'b' in chimePair) {
								chimeSound = useA ? chimePair.a : chimePair.b;
								useA = !useA; // Alternate for next time
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

							// Apply volume settings - base volume (0.4-0.7) adjusted by user settings
							const baseVolume = Math.random() * 0.3 + 0.4; // Random volume between 0.4 and 0.7
							const userVolume =
								userSettings.mute.master || userSettings.mute.chimes
									? 0
									: (userSettings.volume.chimes + 30) / 36;

							soundClone.volume = baseVolume * userVolume;

							// Set the chime as active before playing
							setActiveChimes((prev) => ({
								...prev,
								[chime.name]: true,
							}));

							// Play the sound
							soundClone
								.play()
								.then(() => {
									// Get the duration of the sound
									const duration = soundClone.duration * 1000; // Convert to milliseconds

									// Set a timeout to deactivate the chime when the sound ends
									setTimeout(() => {
										setActiveChimes((prev) => ({
											...prev,
											[chime.name]: false,
										}));
									}, duration);
								})
								.catch((err) => {
									console.warn(`Error playing ${chime.name} chime:`, err);
									// If there's an error, make sure to deactivate the chime
									setActiveChimes((prev) => ({
										...prev,
										[chime.name]: false,
									}));
								});
						}
					}
				} catch (e) {
					console.error('Error in chime interval:', e);
				}
			}, interval);

			// Store the interval ID for cleanup
			chimeIntervals.current.push(intervalId);
		});

		console.log(
			`Started ${chimeIntervals.current.length} chime intervals with wind speed ${windSpeed} mph`
		);
	};

	// Clear all chime intervals
	const clearChimeIntervals = () => {
		chimeIntervals.current.forEach((interval) => {
			clearInterval(interval);
		});
		chimeIntervals.current = [];
	};

	// Stop all audio
	const stopAudio = () => {
		console.log('Stopping audio...');

		// Clear all chime intervals
		clearChimeIntervals();

		// Stop and clean up all audio elements
		Object.keys(chimeAudios.current).forEach((key) => {
			const chime =
				chimeAudios.current[key as keyof typeof chimeAudios.current];
			if (chime && typeof chime === 'object' && 'a' in chime) {
				// Handle alternating chimes with a/b properties
				if (chime.a) {
					chime.a.pause();
					chime.a.currentTime = 0;
				}
				if (chime.b) {
					chime.b.pause();
					chime.b.currentTime = 0;
				}
			} else if (chime instanceof HTMLAudioElement) {
				// Handle single audio element
				chime.pause();
				chime.currentTime = 0;
			}
		});

		// Stop and clean up drone audio
		if (droneAudio.current) {
			droneAudio.current.pause();
			droneAudio.current.currentTime = 0;
		}

		// Stop and clean up ambience audio
		if (ambienceAudio.current) {
			ambienceAudio.current.pause();
			ambienceAudio.current.currentTime = 0;
		}

		// Stop and clean up binaural beat oscillators
		if (oscillatorLeft.current) {
			oscillatorLeft.current.stop();
			oscillatorLeft.current.disconnect();
			oscillatorLeft.current = null;
		}

		if (oscillatorRight.current) {
			oscillatorRight.current.stop();
			oscillatorRight.current.disconnect();
			oscillatorRight.current = null;
		}

		if (binauralGain.current) {
			binauralGain.current.disconnect();
			binauralGain.current = null;
		}

		if (stereoPanner.current) {
			stereoPanner.current.disconnect();
			stereoPanner.current = null;
		}

		// Reset active chimes
		setActiveChimes({
			c3: false,
			c4: false,
			d3: false,
			eb3: false,
			f3: false,
			g3: false,
		});

		setIsPlaying(false);
		console.log('Audio stopped successfully');
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
			droneAudio.current.volume =
				userSettings.mute.master || userSettings.mute.drone
					? 0
					: ((userSettings.volume.drone + 30) / 36) * 0.3; // Reduced from 0.7 to 0.3
		}

		// Update ambience volume and mute
		if (ambienceAudio.current) {
			ambienceAudio.current.volume =
				userSettings.mute.master || userSettings.mute.ambience
					? 0
					: ((userSettings.volume.ambience + 30) / 36) * 0.6; // Increased from 0.5 to 0.6
		}

		// Update binaural beat
		if (userSettings.binaural.enabled) {
			if (
				!oscillatorLeft.current &&
				!oscillatorRight.current &&
				audioContext.current
			) {
				try {
					// Create two oscillators for true binaural beats
					const leftOsc = audioContext.current.createOscillator();
					const rightOsc = audioContext.current.createOscillator();

					// Calculate frequencies based on carrier and beat frequencies
					const carrierFreq = userSettings.binaural.carrierFrequency;
					const beatFreq = userSettings.binaural.beatFrequency;

					// Left ear frequency = carrier - (beat/2)
					// Right ear frequency = carrier + (beat/2)
					leftOsc.frequency.value = carrierFreq - beatFreq / 2;
					rightOsc.frequency.value = carrierFreq + beatFreq / 2;

					// Use sine waves for the cleanest tone
					leftOsc.type = 'sine';
					rightOsc.type = 'sine';

					// Create a stereo panner to send each oscillator to the correct ear
					const leftPanner = audioContext.current.createStereoPanner();
					const rightPanner = audioContext.current.createStereoPanner();
					leftPanner.pan.value = -1; // Full left
					rightPanner.pan.value = 1; // Full right

					// Create a gain node to control the volume of the binaural beats
					const binauralGainNode = audioContext.current.createGain();
					binauralGainNode.gain.value = userSettings.binaural.volume;

					// Connect the oscillators to their respective panners
					leftOsc.connect(leftPanner);
					rightOsc.connect(rightPanner);

					// Connect the panners to the binaural gain node
					leftPanner.connect(binauralGainNode);
					rightPanner.connect(binauralGainNode);

					// Connect the binaural gain to the master output
					binauralGainNode.connect(audioContext.current.destination);

					// Start the oscillators
					leftOsc.start();
					rightOsc.start();

					// Store references for later use
					oscillatorLeft.current = leftOsc;
					oscillatorRight.current = rightOsc;
					binauralGain.current = binauralGainNode;

					console.log(
						'Binaural beat started with carrier frequency:',
						carrierFreq,
						'Hz and beat frequency:',
						beatFreq,
						'Hz'
					);
				} catch (e) {
					console.error('Error creating binaural beat:', e);
				}
			} else if (oscillatorLeft.current && oscillatorRight.current) {
				// Calculate frequencies based on carrier and beat frequencies
				const carrierFreq = userSettings.binaural.carrierFrequency;
				const beatFreq = userSettings.binaural.beatFrequency;

				// Update left and right frequencies with the correct offset
				oscillatorLeft.current.frequency.value = carrierFreq - beatFreq / 2;
				oscillatorRight.current.frequency.value = carrierFreq + beatFreq / 2;

				// Update volume if needed
				if (binauralGain.current) {
					binauralGain.current.gain.value = userSettings.binaural.volume;
				}

				console.log(
					'Updated binaural beat: carrier =',
					carrierFreq,
					'Hz, beat =',
					beatFreq,
					'Hz'
				);
			}
		} else if (oscillatorLeft.current || oscillatorRight.current) {
			oscillatorLeft.current?.stop();
			oscillatorRight.current?.stop();
			oscillatorLeft.current = null;
			oscillatorRight.current = null;
		}
	}, [userSettings, isInitialized, isPlaying]);

	return {
		isPlaying,
		isInitialized,
		activeChimes,
		startAudio,
		stopAudio,
	};
}
