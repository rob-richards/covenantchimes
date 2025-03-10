'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
	FaArrowLeft,
	FaPlay,
	FaPause,
	FaShoppingCart,
	FaDownload,
	FaCheck,
} from 'react-icons/fa';

// Mock data for sound packs (same as in marketplace page)
const soundPacks = [
	{
		id: 'crystal-chimes',
		name: 'Crystal Chimes',
		creator: 'Harmony Studios',
		description:
			'Pure crystal chimes with ethereal resonance. Perfect for meditation and spiritual practices.',
		longDescription:
			'Experience the pure, crystalline tones of our Crystal Chimes sound pack. Each sound was carefully recorded using genuine crystal singing bowls and chimes in a professional studio environment. The ethereal resonance creates a perfect atmosphere for meditation, spiritual practices, or simply creating a peaceful ambience in your space. This pack includes variations in tone, intensity, and duration to provide a rich and dynamic experience that responds beautifully to changing weather conditions.',
		price: 9.99,
		image: '/assets/images/crystal-chimes.jpg',
		tags: ['meditation', 'crystal', 'ethereal'],
		samples: 12,
		isPurchased: false,
		isFree: false,
		sampleFiles: [
			{ name: 'Crystal Bell - High', duration: '3.2s' },
			{ name: 'Crystal Bell - Medium', duration: '2.8s' },
			{ name: 'Crystal Bell - Low', duration: '4.1s' },
			{ name: 'Crystal Chime - Soft', duration: '2.5s' },
			{ name: 'Crystal Chime - Medium', duration: '3.0s' },
			{ name: 'Crystal Chime - Strong', duration: '3.5s' },
		],
		createdAt: '2023-08-15',
		rating: 4.8,
		reviewCount: 124,
	},
	{
		id: 'bamboo-zen',
		name: 'Bamboo Zen',
		creator: 'Eastern Sounds',
		description:
			'Traditional bamboo chimes recorded in a Japanese garden. Creates a peaceful zen atmosphere.',
		longDescription:
			'Transport yourself to a serene Japanese garden with our Bamboo Zen sound pack. These authentic bamboo chimes were recorded in a traditional garden in Kyoto, capturing the natural acoustic properties of bamboo and the peaceful ambience of the surroundings. Each sound has been carefully processed to preserve the organic quality while ensuring optimal performance with the Covenant Chimes engine. Perfect for creating a zen atmosphere, meditation sessions, or adding an eastern flavor to your relaxation experience.',
		price: 7.99,
		image: '/assets/images/bamboo-zen.jpg',
		tags: ['bamboo', 'zen', 'japanese'],
		samples: 8,
		isPurchased: false,
		isFree: false,
		sampleFiles: [
			{ name: 'Bamboo Hollow - Light', duration: '2.7s' },
			{ name: 'Bamboo Hollow - Medium', duration: '3.1s' },
			{ name: 'Bamboo Hollow - Strong', duration: '3.4s' },
			{ name: 'Bamboo Thin - Light', duration: '2.3s' },
			{ name: 'Bamboo Thin - Medium', duration: '2.8s' },
		],
		createdAt: '2023-06-22',
		rating: 4.6,
		reviewCount: 87,
	},
	{
		id: 'ocean-bells',
		name: 'Ocean Bells',
		creator: 'Coastal Audio',
		description:
			'Metal chimes recorded near the ocean. Combines gentle bell tones with subtle water ambience.',
		longDescription:
			'Our Ocean Bells sound pack brings together the soothing sounds of metal chimes with the gentle ambience of coastal waters. Recorded on a quiet beach at dawn, these sounds capture the unique acoustic properties of metal bells with a subtle background of waves and coastal air. The result is a deeply calming sound experience that evokes the peace and tranquility of the ocean. This pack is ideal for sleep aid, deep relaxation, or creating a coastal atmosphere in your meditation practice.',
		price: 12.99,
		image: '/assets/images/ocean-bells.jpg',
		tags: ['ocean', 'water', 'relaxation'],
		samples: 15,
		isPurchased: true,
		isFree: false,
		sampleFiles: [
			{ name: 'Ocean Bell - Gentle Wave', duration: '3.8s' },
			{ name: 'Ocean Bell - Rising Tide', duration: '4.2s' },
			{ name: 'Ocean Bell - Deep Water', duration: '5.1s' },
			{ name: 'Ocean Chime - Sea Breeze', duration: '3.5s' },
			{ name: 'Ocean Chime - Coastal Wind', duration: '4.0s' },
		],
		createdAt: '2023-09-05',
		rating: 4.9,
		reviewCount: 156,
	},
	// Other sound packs would be here...
];

export default function ProductDetailPage({
	params,
}: {
	params: { id: string };
}) {
	const [playingSample, setPlayingSample] = useState<string | null>(null);

	// Find the product by ID
	const product = soundPacks.find((pack) => pack.id === params.id);

	// Handle 404 case
	if (!product) {
		return (
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
				<h1 className="text-3xl font-bold text-gray-900 mb-4">
					Product Not Found
				</h1>
				<p className="text-gray-600 mb-8">
					The sound pack you're looking for doesn't exist or has been removed.
				</p>
				<Link
					href="/marketplace"
					className="inline-flex items-center text-primary-600 hover:text-primary-700"
				>
					<FaArrowLeft className="mr-2" />
					Back to Marketplace
				</Link>
			</div>
		);
	}

	// Handle playing audio samples
	const handlePlaySample = (sampleName: string) => {
		if (playingSample === sampleName) {
			setPlayingSample(null);
			console.log(`Stopped playing ${sampleName}`);
		} else {
			setPlayingSample(sampleName);
			console.log(`Playing ${sampleName}`);

			// Auto-stop after a few seconds (simulating the sample duration)
			setTimeout(() => {
				setPlayingSample(null);
			}, 5000);
		}
	};

	return (
		<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
			{/* Back button */}
			<div className="mb-8">
				<Link
					href="/marketplace"
					className="inline-flex items-center text-gray-600 hover:text-primary-600"
				>
					<FaArrowLeft className="mr-2" />
					Back to Marketplace
				</Link>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
				{/* Product image and main info */}
				<div className="lg:col-span-2">
					<div className="bg-white rounded-lg shadow-md overflow-hidden">
						{/* Product image placeholder */}
						<div className="h-64 bg-gray-300 flex items-center justify-center">
							<span className="text-gray-600 font-medium text-xl">
								{product.name}
							</span>
						</div>

						<div className="p-6">
							<div className="flex justify-between items-start mb-4">
								<div>
									<h1 className="text-2xl font-bold text-gray-900">
										{product.name}
									</h1>
									<p className="text-gray-600">By {product.creator}</p>
								</div>

								<div className="flex items-center">
									<div className="flex items-center mr-2">
										<div className="text-yellow-400 flex">
											{[...Array(5)].map((_, i) => (
												<svg
													key={i}
													className={`w-5 h-5 ${
														i < Math.floor(product.rating)
															? 'fill-current'
															: 'fill-gray-300'
													}`}
													viewBox="0 0 24 24"
												>
													<path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
												</svg>
											))}
										</div>
										<span className="ml-1 text-gray-600 text-sm">
											{product.rating}
										</span>
									</div>
									<span className="text-gray-500 text-sm">
										({product.reviewCount} reviews)
									</span>
								</div>
							</div>

							<div className="flex flex-wrap gap-2 mb-6">
								{product.tags.map((tag) => (
									<span
										key={tag}
										className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full"
									>
										{tag}
									</span>
								))}
							</div>

							<p className="text-gray-700 mb-6">{product.longDescription}</p>

							<div className="border-t border-gray-200 pt-6">
								<h2 className="text-lg font-semibold text-gray-900 mb-4">
									Sample Files ({product.sampleFiles.length})
								</h2>
								<div className="space-y-3">
									{product.sampleFiles.map((sample, index) => (
										<div
											key={index}
											className="flex items-center justify-between p-3 bg-gray-50 rounded-md hover:bg-gray-100"
										>
											<div className="flex items-center">
												<button
													onClick={() => handlePlaySample(sample.name)}
													className="p-2 mr-3 bg-primary-100 text-primary-600 rounded-full hover:bg-primary-200 focus:outline-none"
												>
													{playingSample === sample.name ? (
														<FaPause size={14} />
													) : (
														<FaPlay size={14} />
													)}
												</button>
												<span className="text-gray-700">{sample.name}</span>
											</div>
											<span className="text-gray-500 text-sm">
												{sample.duration}
											</span>
										</div>
									))}
								</div>
							</div>
						</div>
					</div>
				</div>

				{/* Purchase info */}
				<div className="lg:col-span-1">
					<div className="bg-white rounded-lg shadow-md p-6 sticky top-6">
						<div className="mb-6">
							{product.isPurchased ? (
								<div className="flex items-center text-green-600 mb-2">
									<FaCheck className="mr-2" />
									<span className="font-medium">You own this pack</span>
								</div>
							) : product.isFree ? (
								<div className="text-blue-600 font-medium mb-2">Free</div>
							) : (
								<div className="text-2xl font-bold text-gray-900 mb-2">
									${product.price.toFixed(2)}
								</div>
							)}

							<div className="text-sm text-gray-500 mb-4">
								{product.samples} high-quality audio samples
							</div>

							{product.isPurchased ? (
								<button className="w-full flex items-center justify-center bg-primary-600 text-white py-3 px-4 rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2">
									<FaDownload className="mr-2" />
									Download
								</button>
							) : (
								<button className="w-full flex items-center justify-center bg-primary-600 text-white py-3 px-4 rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2">
									<FaShoppingCart className="mr-2" />
									{product.isFree ? 'Get Free' : 'Add to Cart'}
								</button>
							)}
						</div>

						<div className="border-t border-gray-200 pt-6">
							<h3 className="text-lg font-semibold text-gray-900 mb-4">
								Details
							</h3>
							<div className="space-y-3">
								<div className="flex justify-between">
									<span className="text-gray-600">Released</span>
									<span className="text-gray-900">
										{new Date(product.createdAt).toLocaleDateString()}
									</span>
								</div>
								<div className="flex justify-between">
									<span className="text-gray-600">Creator</span>
									<span className="text-gray-900">{product.creator}</span>
								</div>
								<div className="flex justify-between">
									<span className="text-gray-600">Samples</span>
									<span className="text-gray-900">{product.samples}</span>
								</div>
							</div>
						</div>

						<div className="border-t border-gray-200 pt-6 mt-6">
							<h3 className="text-lg font-semibold text-gray-900 mb-4">
								Compatible With
							</h3>
							<div className="space-y-2">
								<div className="flex items-center">
									<FaCheck className="text-green-500 mr-2" />
									<span className="text-gray-700">Covenant Chimes v1.0+</span>
								</div>
								<div className="flex items-center">
									<FaCheck className="text-green-500 mr-2" />
									<span className="text-gray-700">Web & Desktop Apps</span>
								</div>
								<div className="flex items-center">
									<FaCheck className="text-green-500 mr-2" />
									<span className="text-gray-700">All Weather Conditions</span>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
