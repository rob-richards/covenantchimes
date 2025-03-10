export interface WeatherData {
	location: {
		name: string;
		country: string;
		lat: number;
		lon: number;
	};
	current: {
		temp_c: number;
		temp_f: number;
		condition: {
			text: string;
			code: number;
			icon: string;
		};
		wind_kph: number;
		wind_mph: number;
		humidity: number;
		cloud: number;
		feelslike_c: number;
		feelslike_f: number;
		is_day: number;
	};
}

export interface AudioPack {
	id: string;
	name: string;
	description: string;
	creator: string;
	price: number;
	isFree: boolean;
	isPurchased?: boolean;
	samples: {
		chimes: string[];
		drones: string[];
		ambience: {
			clear: string;
			rain: string;
			snow: string;
			cloudy: string;
			default: string;
		};
	};
}

export interface UserSettings {
	volume: {
		master: number;
		chimes: number;
		drone: number;
		ambience: number;
	};
	mute: {
		master: boolean;
		chimes: boolean;
		drone: boolean;
		ambience: boolean;
	};
	selectedPack: string;
	binaural: {
		enabled: boolean;
		frequency: number;
	};
}
