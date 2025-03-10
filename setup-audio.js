const fs = require('fs');
const path = require('path');
const https = require('https');

// Create the audio directory if it doesn't exist
const audioDir = path.join(__dirname, 'public', 'assets', 'audio');

// Sample audio files from freesound.org (public domain or CC0 licensed)
// Using direct MP3 files that are more reliable
const audioFiles = [
	{
		name: 'chime-f3-a.wav',
		url: 'https://cdn.freesound.org/previews/339/339809_5121236-lq.mp3', // Wind chime sound
		fallbackUrl:
			'https://assets.mixkit.co/sfx/preview/mixkit-small-church-bell-588.mp3',
	},
	{
		name: 'drone-cello-f.mp3',
		url: 'https://cdn.freesound.org/previews/476/476580_7553501-lq.mp3', // Drone sound
		fallbackUrl:
			'https://assets.mixkit.co/sfx/preview/mixkit-cinematic-mystery-drone-2783.mp3',
	},
	{
		name: 'heavy-rain.mp3',
		url: 'https://cdn.freesound.org/previews/346/346170_5121236-lq.mp3', // Rain sound
		fallbackUrl:
			'https://assets.mixkit.co/sfx/preview/mixkit-heavy-rain-loop-1248.mp3',
	},
	{
		name: 'light-snow.mp3',
		url: 'https://cdn.freesound.org/previews/459/459657_4921277-lq.mp3', // Snow/wind sound
		fallbackUrl:
			'https://assets.mixkit.co/sfx/preview/mixkit-blizzard-cold-winds-1153.mp3',
	},
	{
		name: 'med-wind.wav',
		url: 'https://cdn.freesound.org/previews/523/523296_7552499-lq.mp3', // Medium wind
		fallbackUrl:
			'https://assets.mixkit.co/sfx/preview/mixkit-forest-wind-ambient-2431.mp3',
	},
	{
		name: 'low-wind.wav',
		url: 'https://cdn.freesound.org/previews/131/131660_2398403-lq.mp3', // Light wind
		fallbackUrl:
			'https://assets.mixkit.co/sfx/preview/mixkit-light-wind-1166.mp3',
	},
];

// Create directories recursively
function mkdirRecursive(dirPath) {
	if (fs.existsSync(dirPath)) {
		return;
	}

	try {
		fs.mkdirSync(dirPath, { recursive: true });
		console.log(`Created directory: ${dirPath}`);
	} catch (err) {
		console.error(`Error creating directory ${dirPath}:`, err);
		throw err;
	}
}

// Download a file with retry and fallback
function downloadFile(url, fallbackUrl, filePath) {
	return new Promise((resolve, reject) => {
		const tryDownload = (currentUrl) => {
			console.log(`Trying to download from: ${currentUrl}`);
			const file = fs.createWriteStream(filePath);

			const request = https.get(currentUrl, (response) => {
				if (response.statusCode !== 200) {
					file.close();
					fs.unlink(filePath, () => {});

					if (currentUrl === url && fallbackUrl) {
						console.log(
							`Failed to download from primary URL (${response.statusCode}), trying fallback...`
						);
						tryDownload(fallbackUrl);
					} else {
						reject(
							new Error(
								`Failed to download ${currentUrl}: ${response.statusCode}`
							)
						);
					}
					return;
				}

				response.pipe(file);

				file.on('finish', () => {
					file.close();
					console.log(`Downloaded: ${filePath}`);
					resolve();
				});
			});

			request.on('error', (err) => {
				fs.unlink(filePath, () => {});

				if (currentUrl === url && fallbackUrl) {
					console.log(
						`Error downloading from primary URL: ${err.message}, trying fallback...`
					);
					tryDownload(fallbackUrl);
				} else {
					reject(err);
				}
			});

			file.on('error', (err) => {
				fs.unlink(filePath, () => {});
				reject(err);
			});

			// Set a timeout
			request.setTimeout(10000, () => {
				request.abort();
				file.close();
				fs.unlink(filePath, () => {});

				if (currentUrl === url && fallbackUrl) {
					console.log(
						`Timeout downloading from primary URL, trying fallback...`
					);
					tryDownload(fallbackUrl);
				} else {
					reject(new Error(`Timeout downloading ${currentUrl}`));
				}
			});
		};

		tryDownload(url);
	});
}

// Create a simple placeholder audio file
function createPlaceholderAudio(filePath) {
	return new Promise((resolve, reject) => {
		try {
			// Create a very simple MP3 file (essentially just the header)
			const placeholderData = Buffer.from([
				0xff, 0xfb, 0x90, 0x44, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
				0x00, 0x00, 0x00, 0x00,
			]);

			fs.writeFileSync(filePath, placeholderData);
			console.log(`Created placeholder file: ${filePath}`);
			resolve();
		} catch (err) {
			console.error(`Error creating placeholder file: ${filePath}`, err);
			reject(err);
		}
	});
}

// Main function
async function setup() {
	try {
		// Create directories
		mkdirRecursive(path.join(__dirname, 'public'));
		mkdirRecursive(path.join(__dirname, 'public', 'assets'));
		mkdirRecursive(audioDir);

		// Download files
		const downloadPromises = audioFiles.map((file) => {
			const filePath = path.join(audioDir, file.name);

			// Skip if file already exists
			if (fs.existsSync(filePath)) {
				console.log(`File already exists: ${filePath}`);
				return Promise.resolve();
			}

			return downloadFile(file.url, file.fallbackUrl, filePath).catch((err) => {
				console.error(`Failed to download ${file.name}: ${err.message}`);
				console.log(`Creating placeholder for ${file.name}...`);
				return createPlaceholderAudio(filePath);
			});
		});

		await Promise.all(downloadPromises);

		console.log(
			'Setup complete! All audio files have been downloaded or created.'
		);
		console.log(`Audio files are in: ${audioDir}`);
		console.log('You can replace these with your own audio files if desired.');
	} catch (err) {
		console.error('Setup failed:', err);
		process.exit(1);
	}
}

// Run the setup
setup();
