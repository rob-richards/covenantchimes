import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
	title: 'My Library - Covenant Chimes',
	description:
		'Manage your purchased sound packs and customize your wind chime experience.',
};

export default function MyLibraryLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<div className="min-h-screen flex flex-col">
			{/* Header with navigation */}
			<header className="bg-white shadow-sm">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="flex justify-between h-16">
						<div className="flex">
							<div className="flex-shrink-0 flex items-center">
								<Link href="/" className="text-xl font-bold text-primary-600">
									Covenant Chimes
								</Link>
							</div>
							<nav className="ml-6 flex space-x-8">
								<Link
									href="/"
									className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300"
								>
									Home
								</Link>
								<Link
									href="/marketplace"
									className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300"
								>
									Marketplace
								</Link>
								<Link
									href="/my-library"
									className="inline-flex items-center px-1 pt-1 border-b-2 border-primary-500 text-sm font-medium text-gray-900"
								>
									My Library
								</Link>
							</nav>
						</div>
						<div className="flex items-center">
							<Link
								href="/account"
								className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300"
							>
								Account
							</Link>
						</div>
					</div>
				</div>
			</header>

			{/* Main content */}
			<main className="flex-grow bg-gray-50">{children}</main>

			{/* Footer */}
			<footer className="bg-white border-t border-gray-200">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
					<div className="grid grid-cols-1 md:grid-cols-3 gap-8">
						<div>
							<h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">
								Covenant Chimes
							</h3>
							<p className="mt-4 text-base text-gray-500">
								Experience the soothing sounds of wind chimes that respond to
								real-time weather data. Perfect for prayer, meditation, and
								peaceful sleep.
							</p>
						</div>
						<div>
							<h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">
								Quick Links
							</h3>
							<ul className="mt-4 space-y-4">
								<li>
									<Link
										href="/"
										className="text-base text-gray-500 hover:text-gray-900"
									>
										Home
									</Link>
								</li>
								<li>
									<Link
										href="/marketplace"
										className="text-base text-gray-500 hover:text-gray-900"
									>
										Marketplace
									</Link>
								</li>
								<li>
									<Link
										href="/my-library"
										className="text-base text-gray-500 hover:text-gray-900"
									>
										My Library
									</Link>
								</li>
								<li>
									<Link
										href="/account"
										className="text-base text-gray-500 hover:text-gray-900"
									>
										Account
									</Link>
								</li>
							</ul>
						</div>
						<div>
							<h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">
								For Creators
							</h3>
							<ul className="mt-4 space-y-4">
								<li>
									<Link
										href="/creators"
										className="text-base text-gray-500 hover:text-gray-900"
									>
										Become a Creator
									</Link>
								</li>
								<li>
									<Link
										href="/creators/guidelines"
										className="text-base text-gray-500 hover:text-gray-900"
									>
										Sound Pack Guidelines
									</Link>
								</li>
								<li>
									<Link
										href="/creators/dashboard"
										className="text-base text-gray-500 hover:text-gray-900"
									>
										Creator Dashboard
									</Link>
								</li>
							</ul>
						</div>
					</div>
					<div className="mt-8 border-t border-gray-200 pt-8 md:flex md:items-center md:justify-between">
						<div className="text-base text-gray-400">
							&copy; {new Date().getFullYear()} Covenant Chimes. All rights
							reserved.
						</div>
					</div>
				</div>
			</footer>
		</div>
	);
}
