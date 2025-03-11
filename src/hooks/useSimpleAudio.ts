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
		base: {
			primary: '/assets/audio/chime-c3-a.wav',
			fallback:
				'https://assets.mixkit.co/sfx/preview/mixkit-small-church-bell-588.mp3',
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

// Pentatonic scale playback rates
// Major pentatonic: 1, 8/9, 4/5, 2/3, 3/5, 1/2
// These values create a C major pentatonic scale (C, A, G, E, D, C) going down
const PENTATONIC_RATES = {
	c3: 1.0, // C3 (base note)
	a2: 5 / 6, // A2 (5 semitones down)
	g2: 2 / 3, // G2 (7 semitones down)
	e2: 3 / 5, // E2 (9 semitones down)
	d2: 4 / 9, // D2 (10 semitones down)
	c2: 1 / 2, // C2 (octave down)
};

export function useSimpleAudio() {
	const { weather, userSettings } = useAppStore();
	const [isPlaying, setIsPlaying] = useState(false);
	const [isInitialized, setIsInitialized] = useState(false);
	const [activeChimes, setActiveChimes] = useState<{
		c3: boolean;
		a2: boolean;
		g2: boolean;
		e2: boolean;
		d2: boolean;
		c2: boolean;
	}>({
		c3: false,
		a2: false,
		g2: false,
		e2: false,
		d2: false,
		c2: false,
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

	// Single base chime audio element
	const baseChimeAudio = useRef<HTMLAudioElement | null>(null);

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

			// Clean up base chime audio element
			if (baseChimeAudio.current) {
				baseChimeAudio.current.pause();
				baseChimeAudio.current.src = '';
			}

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

				// Load base chime sound
				console.log('Loading base chime audio file...');
				baseChimeAudio.current = await loadAudioWithFallback(
					AUDIO_FILES.chimes.base.primary,
					AUDIO_FILES.chimes.base.fallback
				);
				baseChimeAudio.current.volume = 1;
				console.log('Base chime sound loaded successfully');
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
		// Check if base chime audio is loaded
		if (!baseChimeAudio.current) {
			console.warn('Cannot start chimes: base chime audio file is not loaded');
			return;
		}

		// Clear any existing intervals
		clearChimeIntervals();

		// If wind speed is below threshold, don't play chimes or play very rarely
		const MIN_WIND_SPEED = 5; // Reduced from 8 mph to allow more chimes at lower wind speeds

		// Calculate probability based on wind speed
		// 0 at MIN_WIND_SPEED, increases as wind speed increases
		// 74mph is hurricane force, so we use that as our max
		let swingProbability = 0;
		if (windSpeed > MIN_WIND_SPEED) {
			swingProbability = Math.min(
				(windSpeed - MIN_WIND_SPEED) / (74 - MIN_WIND_SPEED),
				1
			);
			// Increase the base probability to get more chimes
			swingProbability = Math.min(swingProbability * 1.5, 1);
		}

		console.log(
			`Wind speed: ${windSpeed} mph, Swing probability: ${swingProbability}`
		);

		// Create intervals for each chime with different timing
		const chimeTypes = [
			{ name: 'c2', delay: 0, lowTone: true, rate: PENTATONIC_RATES.c2 },
			{ name: 'd2', delay: 100, lowTone: true, rate: PENTATONIC_RATES.d2 },
			{ name: 'e2', delay: 200, lowTone: true, rate: PENTATONIC_RATES.e2 },
			{ name: 'g2', delay: 300, lowTone: true, rate: PENTATONIC_RATES.g2 },
			{ name: 'a2', delay: 400, lowTone: true, rate: PENTATONIC_RATES.a2 },
			{ name: 'c3', delay: 500, lowTone: false, rate: PENTATONIC_RATES.c3 },
		];

		chimeTypes.forEach((chime, index) => {
			// Calculate interval based on wind speed
			// Higher wind speed = shorter intervals between chimes
			// Reduce the base interval to increase frequency
			const baseInterval =
				windSpeed <= MIN_WIND_SPEED
					? 6000 // Play every 6 seconds at low wind speeds (reduced from 10 seconds)
					: Math.max(6000 - windSpeed * 120, 400); // Faster at higher wind speeds, minimum 400ms (reduced from 500ms)

			const randomFactor = Math.random() * 0.5 + 0.75; // 0.75 to 1.25
			const interval = Math.max(baseInterval * randomFactor, 400) + chime.delay;

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

			const intervalId = window.setInterval(() => {
				try {
					// Determine if this chime should play based on wind probability
					if (Math.random() < chimeSpecificProbability) {
						if (baseChimeAudio.current && audioContext.current) {
							// Set the chime as active before playing
							setActiveChimes((prev) => ({
								...prev,
								[chime.name]: true,
							}));

							// Create a buffer source for better pitch shifting
							const audioBuffer = audioContext.current.createBufferSource();

							// Create an audio element to load the sound
							const tempAudio = new Audio(baseChimeAudio.current.src);

							// Create a fetch request to get the audio data
							fetch(tempAudio.src)
								.then((response) => response.arrayBuffer())
								.then((arrayBuffer) =>
									audioContext.current!.decodeAudioData(arrayBuffer)
								)
								.then((audioBuffer) => {
									// Create a buffer source
									const source = audioContext.current!.createBufferSource();
									source.buffer = audioBuffer;

									// Set the playback rate for pitch shifting
									source.playbackRate.value = chime.rate;

									// Create a gain node for volume control
									const gainNode = audioContext.current!.createGain();

									// Calculate attack time based on wind speed
									const attackTime =
										windSpeed < 15
											? Math.max(0.2 - windSpeed / 100, 0.05) // 0.05 to 0.2 seconds
											: 0.01; // Very short attack for higher wind speeds

									// Calculate base volume based on wind speed and randomness
									const baseVolume = Math.random() * 0.3 + 0.4; // Random volume between 0.4 and 0.7
									const userVolume =
										userSettings.mute.master || userSettings.mute.chimes
											? 0
											: (userSettings.volume.chimes + 30) / 36;
									const finalVolume = baseVolume * userVolume;

									// Set initial gain to 0 (silent)
									gainNode.gain.value = 0;

									// Schedule the attack ramp
									const currentTime = audioContext.current!.currentTime;
									gainNode.gain.setValueAtTime(0, currentTime);
									gainNode.gain.linearRampToValueAtTime(
										finalVolume,
										currentTime + attackTime
									);

									// Connect the nodes
									source.connect(gainNode);
									gainNode.connect(audioContext.current!.destination);

									// Start the source
									source.start(0);

									// Set a timeout to deactivate the chime when the sound ends
									const duration = audioBuffer.duration * 1000;
									setTimeout(() => {
										setActiveChimes((prev) => ({
											...prev,
											[chime.name]: false,
										}));

										// Clean up audio nodes
										try {
											gainNode.disconnect();
											source.disconnect();
										} catch (err) {
											console.warn('Error disconnecting audio nodes:', err);
										}
									}, duration);
								})
								.catch((err) => {
									console.warn(
										`Error processing audio for ${chime.name} chime:`,
										err
									);
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
		if (baseChimeAudio.current) {
			baseChimeAudio.current.pause();
			baseChimeAudio.current.currentTime = 0;
		}

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

		// Reset active chimes
		setActiveChimes({
			c3: false,
			a2: false,
			g2: false,
			e2: false,
			d2: false,
			c2: false,
		});

		// Stop binaural beats
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
