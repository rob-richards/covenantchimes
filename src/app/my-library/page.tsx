'use client';

import { useState } from 'react';
import Link from 'next/link';
import { FaPlay, FaPause, FaDownload, FaCog } from 'react-icons/fa';

// Mock data for purchased sound packs
const purchasedPacks = [
	{
		id: 'ocean-bells',
		name: 'Ocean Bells',
		creator: 'Coastal Audio',
		description:
			'Metal chimes recorded near the ocean. Combines gentle bell tones with subtle water ambience.',
		image: '/assets/images/ocean-bells.jpg',
		tags: ['ocean', 'water', 'relaxation'],
		samples: 15,
		downloadDate: '2023-10-15',
		isActive: true,
	},
	{
		id: 'forest-whispers',
		name: 'Forest Whispers',
		creator: 'Nature Sounds Co.',
		description:
			'Wooden chimes recorded in a dense forest. Captures the essence of nature with bird songs in the background.',
		image: '/assets/images/forest-whispers.jpg',
		tags: ['forest', 'nature', 'wooden'],
		samples: 10,
		downloadDate: '2023-09-22',
		isActive: false,
	},
	{
		id: 'desert-winds',
		name: 'Desert Winds',
		creator: 'Arid Audio',
		description:
			'Unique chimes designed to mimic the sound of wind through desert canyons. Includes subtle sand particle effects.',
		image: '/assets/images/desert-winds.jpg',
		tags: ['desert', 'wind', 'ambient'],
		samples: 8,
		downloadDate: '2023-11-05',
		isActive: false,
	},
];

function LibraryCard({ pack }: { pack: (typeof purchasedPacks)[0] }) {
	const [isPlaying, setIsPlaying] = useState(false);

	const handlePlayPreview = () => {
		setIsPlaying(!isPlaying);
		console.log(
			`${isPlaying ? 'Stopped' : 'Playing'} preview for ${pack.name}`
		);

		// Auto-stop after a few seconds
		if (!isPlaying) {
			setTimeout(() => {
				setIsPlaying(false);
			}, 5000);
		}
	};

	return (
		<div className="bg-white rounded-lg shadow-md overflow-hidden">
			{/* Pack image placeholder */}
			<div className="h-48 bg-gray-300 flex items-center justify-center">
				<span className="text-gray-600 font-medium">{pack.name}</span>
			</div>

			<div className="p-4">
				<div className="flex justify-between items-start mb-2">
					<h3 className="text-lg font-semibold text-gray-900">{pack.name}</h3>
					{pack.isActive && (
						<span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
							Active
						</span>
					)}
				</div>

				<p className="text-gray-600 text-sm mb-2">By {pack.creator}</p>

				<div className="flex flex-wrap gap-1 mb-3">
					{pack.tags.map((tag) => (
						<span
							key={tag}
							className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full"
						>
							{tag}
						</span>
					))}
				</div>

				<p className="text-gray-700 text-sm mb-4 line-clamp-2">
					{pack.description}
				</p>

				<div className="flex justify-between items-center">
					<div className="flex space-x-2">
						<button
							onClick={handlePlayPreview}
							className="p-2 bg-primary-100 text-primary-600 rounded-full hover:bg-primary-200 focus:outline-none"
						>
							{isPlaying ? <FaPause size={14} /> : <FaPlay size={14} />}
						</button>

						<button className="p-2 bg-gray-100 text-gray-600 rounded-full hover:bg-gray-200 focus:outline-none">
							<FaDownload size={14} />
						</button>

						<button className="p-2 bg-gray-100 text-gray-600 rounded-full hover:bg-gray-200 focus:outline-none">
							<FaCog size={14} />
						</button>
					</div>

					<Link
						href={`/marketplace/${pack.id}`}
						className="text-sm text-primary-600 hover:text-primary-700"
					>
						View Details
					</Link>
				</div>
			</div>
		</div>
	);
}

export default function MyLibraryPage() {
	const [activeFilter, setActiveFilter] = useState<string | null>(null);
	const [searchTerm, setSearchTerm] = useState('');

	// Filter packs based on search term and active filter
	const filteredPacks = purchasedPacks.filter((pack) => {
		const matchesSearch =
			pack.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
			pack.creator.toLowerCase().includes(searchTerm.toLowerCase()) ||
			pack.tags.some((tag) =>
				tag.toLowerCase().includes(searchTerm.toLowerCase())
			);

		const matchesFilter =
			activeFilter === null ||
			(activeFilter === 'active' && pack.isActive) ||
			(activeFilter === 'inactive' && !pack.isActive);

		return matchesSearch && matchesFilter;
	});

	return (
		<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
			<div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
				<div>
					<h1 className="text-3xl font-bold text-gray-900">My Sound Library</h1>
					<p className="text-gray-600 mt-1">
						Manage your purchased sound packs
					</p>
				</div>

				<div className="mt-4 md:mt-0">
					<Link
						href="/marketplace"
						className="inline-flex items-center justify-center bg-primary-600 text-white py-2 px-4 rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
					>
						Browse Marketplace
					</Link>
				</div>
			</div>

			<div className="mb-8">
				<div className="flex flex-col sm:flex-row gap-4">
					<div className="relative flex-grow">
						<input
							type="text"
							placeholder="Search your sound packs..."
							className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
						/>
					</div>

					<div className="flex space-x-2">
						<button
							className={`px-4 py-2 rounded-md ${
								activeFilter === null
									? 'bg-primary-600 text-white'
									: 'bg-gray-100 text-gray-700 hover:bg-gray-200'
							}`}
							onClick={() => setActiveFilter(null)}
						>
							All
						</button>
						<button
							className={`px-4 py-2 rounded-md ${
								activeFilter === 'active'
									? 'bg-primary-600 text-white'
									: 'bg-gray-100 text-gray-700 hover:bg-gray-200'
							}`}
							onClick={() => setActiveFilter('active')}
						>
							Active
						</button>
						<button
							className={`px-4 py-2 rounded-md ${
								activeFilter === 'inactive'
									? 'bg-primary-600 text-white'
									: 'bg-gray-100 text-gray-700 hover:bg-gray-200'
							}`}
							onClick={() => setActiveFilter('inactive')}
						>
							Inactive
						</button>
					</div>
				</div>
			</div>

			{filteredPacks.length > 0 ? (
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
					{filteredPacks.map((pack) => (
						<LibraryCard key={pack.id} pack={pack} />
					))}
				</div>
			) : (
				<div className="text-center py-12">
					<h3 className="text-lg font-medium text-gray-900 mb-2">
						No sound packs found
					</h3>
					<p className="text-gray-600 mb-6">
						{searchTerm
							? "We couldn't find any sound packs matching your search."
							: "You don't have any sound packs in your library yet."}
					</p>
					<Link
						href="/marketplace"
						className="inline-flex items-center justify-center bg-primary-600 text-white py-2 px-4 rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
					>
						Browse Marketplace
					</Link>
				</div>
			)}

			<div className="mt-12 bg-gray-50 rounded-lg p-6">
				<h2 className="text-xl font-semibold text-gray-900 mb-4">
					Active Sound Pack
				</h2>

				{purchasedPacks.some((pack) => pack.isActive) ? (
					<div>
						{purchasedPacks
							.filter((pack) => pack.isActive)
							.map((pack) => (
								<div
									key={pack.id}
									className="flex flex-col sm:flex-row sm:items-center justify-between"
								>
									<div>
										<h3 className="text-lg font-medium text-gray-900">
											{pack.name}
										</h3>
										<p className="text-gray-600">By {pack.creator}</p>
									</div>

									<div className="mt-4 sm:mt-0 flex space-x-3">
										<button className="inline-flex items-center justify-center bg-white border border-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2">
											<FaCog className="mr-2" />
											Configure
										</button>

										<button className="inline-flex items-center justify-center bg-primary-600 text-white py-2 px-4 rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2">
											Change Active Pack
										</button>
									</div>
								</div>
							))}
					</div>
				) : (
					<div className="text-center py-6">
						<p className="text-gray-600 mb-4">
							You don't have an active sound pack selected.
						</p>
						<button className="inline-flex items-center justify-center bg-primary-600 text-white py-2 px-4 rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2">
							Set Active Pack
						</button>
					</div>
				)}
			</div>
		</div>
	);
}
