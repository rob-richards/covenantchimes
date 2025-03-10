'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
	FaShoppingCart,
	FaPlay,
	FaPause,
	FaDownload,
	FaCheck,
} from 'react-icons/fa';

// Mock data for sound packs
const soundPacks = [
	{
		id: 'crystal-chimes',
		name: 'Crystal Chimes',
		creator: 'Harmony Studios',
		description:
			'Pure crystal chimes with ethereal resonance. Perfect for meditation and spiritual practices.',
		price: 9.99,
		image: '/assets/images/crystal-chimes.jpg',
		tags: ['meditation', 'crystal', 'ethereal'],
		samples: 12,
		isPurchased: false,
		isFree: false,
	},
	{
		id: 'bamboo-zen',
		name: 'Bamboo Zen',
		creator: 'Eastern Sounds',
		description:
			'Traditional bamboo chimes recorded in a Japanese garden. Creates a peaceful zen atmosphere.',
		price: 7.99,
		image: '/assets/images/bamboo-zen.jpg',
		tags: ['bamboo', 'zen', 'japanese'],
		samples: 8,
		isPurchased: false,
		isFree: false,
	},
	{
		id: 'ocean-bells',
		name: 'Ocean Bells',
		creator: 'Coastal Audio',
		description:
			'Metal chimes recorded near the ocean. Combines gentle bell tones with subtle water ambience.',
		price: 12.99,
		image: '/assets/images/ocean-bells.jpg',
		tags: ['ocean', 'water', 'relaxation'],
		samples: 15,
		isPurchased: true,
		isFree: false,
	},
	{
		id: 'desert-winds',
		name: 'Desert Winds',
		creator: 'Nature Sounds Co.',
		description:
			'Copper chimes with desert ambience. Warm tones that evoke vast open spaces.',
		price: 8.99,
		image: '/assets/images/desert-winds.jpg',
		tags: ['desert', 'warm', 'copper'],
		samples: 10,
		isPurchased: false,
		isFree: false,
	},
	{
		id: 'forest-whispers',
		name: 'Forest Whispers',
		creator: 'Woodland Audio',
		description:
			'Wooden chimes recorded in a dense forest. Includes subtle bird songs and forest ambience.',
		price: 0,
		image: '/assets/images/forest-whispers.jpg',
		tags: ['forest', 'wood', 'nature'],
		samples: 6,
		isPurchased: false,
		isFree: true,
	},
	{
		id: 'celestial-tones',
		name: 'Celestial Tones',
		creator: 'Astral Sounds',
		description:
			'Space-inspired metallic chimes with reverb. Creates an otherworldly atmosphere.',
		price: 14.99,
		image: '/assets/images/celestial-tones.jpg',
		tags: ['space', 'cosmic', 'reverb'],
		samples: 18,
		isPurchased: false,
		isFree: false,
	},
	{
		id: 'rainy-day',
		name: 'Rainy Day',
		creator: 'Weather Sounds',
		description:
			'Glass chimes with rain ambience. Perfect for rainy day meditation and sleep.',
		price: 6.99,
		image: '/assets/images/rainy-day.jpg',
		tags: ['rain', 'glass', 'sleep'],
		samples: 9,
		isPurchased: false,
		isFree: false,
	},
	{
		id: 'meditation-bells',
		name: 'Meditation Bells',
		creator: 'Mindful Audio',
		description:
			'Tibetan-inspired bell sounds designed specifically for meditation practices.',
		price: 11.99,
		image: '/assets/images/meditation-bells.jpg',
		tags: ['meditation', 'tibetan', 'bells'],
		samples: 14,
		isPurchased: false,
		isFree: false,
	},
];

// Product Card Component
const ProductCard = ({ pack }: { pack: (typeof soundPacks)[0] }) => {
	const [isPlaying, setIsPlaying] = useState(false);

	const handlePlaySample = () => {
		setIsPlaying(!isPlaying);
		// In a real implementation, this would play an audio sample
		if (!isPlaying) {
			console.log(`Playing sample from ${pack.name}`);
			setTimeout(() => setIsPlaying(false), 5000); // Auto stop after 5 seconds
		} else {
			console.log(`Stopped sample from ${pack.name}`);
		}
	};

	return (
		<div className="bg-white rounded-lg shadow-md overflow-hidden transition-transform hover:scale-[1.02] hover:shadow-lg">
			<div className="h-48 bg-gray-200 relative">
				{/* Placeholder for product image */}
				<div className="absolute inset-0 flex items-center justify-center bg-gray-300">
					<span className="text-gray-600 font-medium">{pack.name}</span>
				</div>

				{/* Play button overlay */}
				<button
					onClick={handlePlaySample}
					className="absolute bottom-2 right-2 p-2 bg-primary-600 text-white rounded-full hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
				>
					{isPlaying ? <FaPause size={14} /> : <FaPlay size={14} />}
				</button>
			</div>

			<div className="p-4">
				<div className="flex justify-between items-start mb-2">
					<h3 className="text-lg font-semibold text-gray-800">{pack.name}</h3>
					{pack.isPurchased ? (
						<span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full flex items-center">
							<FaCheck className="mr-1" size={10} />
							Owned
						</span>
					) : pack.isFree ? (
						<span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
							Free
						</span>
					) : (
						<span className="font-medium text-gray-900">
							${pack.price.toFixed(2)}
						</span>
					)}
				</div>

				<p className="text-sm text-gray-500 mb-2">By {pack.creator}</p>

				<p className="text-sm text-gray-600 mb-3 line-clamp-2">
					{pack.description}
				</p>

				<div className="flex flex-wrap gap-1 mb-3">
					{pack.tags.map((tag) => (
						<span
							key={tag}
							className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full"
						>
							{tag}
						</span>
					))}
				</div>

				<div className="flex justify-between items-center">
					<span className="text-xs text-gray-500">{pack.samples} samples</span>

					{pack.isPurchased ? (
						<button className="flex items-center text-sm text-primary-600 hover:text-primary-700">
							<FaDownload className="mr-1" size={14} />
							Download
						</button>
					) : (
						<button className="flex items-center text-sm bg-primary-600 text-white px-3 py-1 rounded hover:bg-primary-700">
							<FaShoppingCart className="mr-1" size={14} />
							{pack.isFree ? 'Get Free' : 'Add to Cart'}
						</button>
					)}
				</div>
			</div>
		</div>
	);
};

export default function MarketplacePage() {
	const [searchTerm, setSearchTerm] = useState('');
	const [selectedTag, setSelectedTag] = useState<string | null>(null);

	// Get all unique tags
	const allTags = Array.from(new Set(soundPacks.flatMap((pack) => pack.tags)));

	// Filter sound packs based on search and tag
	const filteredPacks = soundPacks.filter((pack) => {
		const matchesSearch =
			searchTerm === '' ||
			pack.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
			pack.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
			pack.creator.toLowerCase().includes(searchTerm.toLowerCase());

		const matchesTag = selectedTag === null || pack.tags.includes(selectedTag);

		return matchesSearch && matchesTag;
	});

	return (
		<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
			<div className="flex justify-between items-center mb-8">
				<h1 className="text-3xl font-bold text-gray-900">Sound Marketplace</h1>
				<Link
					href="/cart"
					className="flex items-center text-gray-600 hover:text-primary-600"
				>
					<FaShoppingCart className="mr-2" />
					<span>Cart (0)</span>
				</Link>
			</div>

			<div className="mb-8">
				<div className="flex flex-col sm:flex-row gap-4 mb-4">
					<div className="flex-1">
						<input
							type="text"
							placeholder="Search sound packs..."
							className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
						/>
					</div>

					<div className="sm:w-64">
						<select
							className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
							value={selectedTag || ''}
							onChange={(e) => setSelectedTag(e.target.value || null)}
						>
							<option value="">All Categories</option>
							{allTags.map((tag) => (
								<option key={tag} value={tag}>
									{tag}
								</option>
							))}
						</select>
					</div>
				</div>

				<div className="flex flex-wrap gap-2">
					<button
						className={`text-sm px-3 py-1 rounded-full ${
							selectedTag === null
								? 'bg-primary-100 text-primary-800'
								: 'bg-gray-100 text-gray-800 hover:bg-gray-200'
						}`}
						onClick={() => setSelectedTag(null)}
					>
						All
					</button>

					{allTags.map((tag) => (
						<button
							key={tag}
							className={`text-sm px-3 py-1 rounded-full ${
								selectedTag === tag
									? 'bg-primary-100 text-primary-800'
									: 'bg-gray-100 text-gray-800 hover:bg-gray-200'
							}`}
							onClick={() => setSelectedTag(tag)}
						>
							{tag}
						</button>
					))}
				</div>
			</div>

			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
				{filteredPacks.length > 0 ? (
					filteredPacks.map((pack) => <ProductCard key={pack.id} pack={pack} />)
				) : (
					<div className="col-span-full text-center py-12">
						<p className="text-gray-500 text-lg">
							No sound packs found matching your criteria.
						</p>
						<button
							className="mt-4 text-primary-600 hover:text-primary-700"
							onClick={() => {
								setSearchTerm('');
								setSelectedTag(null);
							}}
						>
							Clear filters
						</button>
					</div>
				)}
			</div>
		</div>
	);
}
