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
			cloudy: 'medium-wind.mp3',
			default: 'very-low-wind.wav',
		},
	},
};

// Default user settings
const defaultSettings: UserSettings = {
	volume: {
		master: 0,
		chimes: 0,
		drone: 0,
		ambience: 0,
	},
	mute: {
		master: false,
		chimes: false,
		drone: false,
		ambience: false,
	},
	selectedPack: 'default',
	binaural: {
		enabled: false,
		frequency: 432,
	},
};

export const useAppStore = create<AppState>((set) => ({
	weather: null,
	isLoading: false,
	error: null,
	userSettings: defaultSettings,
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
