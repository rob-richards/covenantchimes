import { create } from 'zustand';
import { WeatherData, UserSettings, AudioPack } from '@/types';

interface AppState {
	weather: WeatherData | null;
	isLoading: boolean;
	error: string | null;
	userSettings: UserSettings;
	audioPacks: AudioPack[];
	selectedPack: string;

	// Actions
	setWeather: (weather: WeatherData) => void;
	setLoading: (isLoading: boolean) => void;
	setError: (error: string | null) => void;
	updateUserSettings: (settings: Partial<UserSettings>) => void;
	setAudioPacks: (packs: AudioPack[]) => void;
	setSelectedPack: (packId: string) => void;
}

// Default audio pack
const defaultPack: AudioPack = {
	id: 'default',
	name: 'Default Pack',
	description: 'The default audio pack with peaceful chimes and ambient sounds',
	creator: 'Covenant Chimes',
	price: 0,
	isFree: true,
	isPurchased: true,
	samples: {
		chimes: ['chime-f3-a.wav', 'chime-f3-b.wav'],
		drones: ['drone-cello-f.mp3'],
		ambience: {
			clear: 'very-low-wind.wav',
			rain: 'heavy-rain.mp3',
			snow: 'light-snow.mp3',
			cloudy: 'med-wind.wav',
			default: 'very-low-wind.wav',
		},
	},
};

// Default user settings
const defaultUserSettings: UserSettings = {
	volume: {
		master: 0, // 0 dB (normal volume)
		drone: -25, // -10 dB (lower than normal to reduce drone volume)
		ambience: 15, // +3 dB (slightly higher than normal to boost ambience)
		chimes: 0, // 0 dB (normal volume)
	},
	mute: {
		master: false,
		drone: false,
		ambience: false,
		chimes: false,
	},
	selectedPack: 'default',
	binaural: {
		enabled: false,
		frequency: 432, // Legacy field, kept for backward compatibility
		carrierFrequency: 400, // Carrier frequency (400Hz is optimal for binaural beats)
		beatFrequency: 10, // Beat frequency (difference between left and right ear)
		preset: 'alpha', // Default to alpha waves (relaxed, calm)
		volume: 0.1, // Default volume for binaural beats
	},
};

export const useAppStore = create<AppState>((set) => ({
	weather: null,
	isLoading: false,
	error: null,
	userSettings: defaultUserSettings,
	audioPacks: [defaultPack],
	selectedPack: 'default',

	setWeather: (weather) => set({ weather }),
	setLoading: (isLoading) => set({ isLoading }),
	setError: (error) => set({ error }),

	updateUserSettings: (settings) =>
		set((state) => ({
			userSettings: { ...state.userSettings, ...settings },
		})),

	setAudioPacks: (packs) => set({ audioPacks: packs }),

	setSelectedPack: (packId) =>
		set((state) => ({
			selectedPack: packId,
			userSettings: { ...state.userSettings, selectedPack: packId },
		})),
}));
