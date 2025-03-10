# Covenant Chimes

A prayer and meditation app that plays windchimes based on your location and current weather data.

## Features

- Real-time weather data integration
- Dynamic windchime sounds based on wind speed
- Ambient background sounds that change with weather conditions
- Binaural beats for enhanced meditation
- Volume controls for each audio element
- Marketplace for audio creators to sell their own packs

## Tech Stack

- Next.js 14 with App Router
- TypeScript
- React
- Tailwind CSS
- Tone.js for audio processing
- Zustand for state management
- WeatherAPI.com for weather data
- Stripe for payment processing

## Getting Started

### Prerequisites

- Node.js 18.0.0 or later
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:

```bash
npm install
# or
yarn install
```

3. Set up audio files:

```bash
npm run setup
# or
yarn setup
```

This will download sample audio files to the `public/assets/audio` directory.

4. Create a `.env.local` file in the root directory with the following variables:

```
NEXT_PUBLIC_WEATHER_API_KEY=your_weather_api_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_SECRET_KEY=your_stripe_secret_key
```

You can get a free API key from [WeatherAPI.com](https://www.weatherapi.com/).

5. Start the development server:

```bash
npm run dev
# or
yarn dev
```

If you don't have a WeatherAPI key, you can use the demo mode:

```bash
npm run dev:demo
# or
yarn dev:demo
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Audio Files

The app requires the following audio files in the `public/assets/audio` directory:

```
public/assets/audio/
├── chime-f3-a.wav       # Main chime sound
├── drone-cello-f.mp3    # Background drone sound
├── heavy-rain.mp3       # Ambient sound for rainy weather
├── light-snow.mp3       # Ambient sound for snowy weather
├── medium-wind.mp3      # Ambient sound for cloudy weather
└── very-low-wind.wav    # Ambient sound for clear weather
```

You can use your own audio files, but they must have these exact filenames. The `npm run setup` command will download sample files for you.

## Troubleshooting

### Audio Issues

- Make sure you have all the required audio files in the `public/assets/audio` directory
- Some browsers require user interaction before playing audio
- Check the browser console for specific error messages
- If audio doesn't play, try clicking the "Skip Loading" button and then "Start Chimes"

### Weather API Issues

- Verify your WeatherAPI.com API key is correct in the `.env.local` file
- The app will use fallback weather data if the API is unavailable
- You can test without an API key by using `npm run dev:demo`
- If the weather data loading gets stuck, click the "Skip Loading" button

### Browser Compatibility

- The app works best in Chrome, Firefox, and Edge
- Safari may have issues with audio playback due to autoplay restrictions
- Mobile browsers may require explicit user interaction to play audio

## For Audio Creators

Covenant Chimes allows audio creators to create and sell their own audio packs. Each pack can include:

- Custom chime sounds
- Drone sounds
- Ambient weather sounds (rain, snow, clear, cloudy)

To become a creator, visit the [Creator Portal](/creators) after signing up.

## Deployment

This project is configured for easy deployment on Vercel:

```bash
npm run build
# or
yarn build
```

## License

This project is licensed under the MIT License - see the LICENSE file for details.
