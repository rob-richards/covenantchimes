import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
	title: 'Marketplace - Covenant Chimes',
	description:
		'Discover and purchase sound packs from third-party creators for your Covenant Chimes experience.',
};

export default function MarketplaceLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<div className="min-h-screen bg-gray-50">
			<header className="bg-white shadow-sm">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="flex justify-between items-center py-4">
						<div className="flex items-center">
							<Link href="/" className="text-primary-600 font-semibold text-xl">
								Covenant Chimes
							</Link>
							<nav className="ml-10 flex space-x-8">
								<Link href="/" className="text-gray-500 hover:text-gray-900">
									Home
								</Link>
								<Link
									href="/marketplace"
									className="text-primary-600 font-medium"
								>
									Marketplace
								</Link>
								<Link
									href="/library"
									className="text-gray-500 hover:text-gray-900"
								>
									My Library
								</Link>
							</nav>
						</div>
						<div className="flex items-center space-x-4">
							<Link
								href="/account"
								className="text-gray-500 hover:text-gray-900"
							>
								Account
							</Link>
						</div>
					</div>
				</div>
			</header>

			<main>{children}</main>

			<footer className="bg-white mt-12 border-t border-gray-200">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
					<div className="grid grid-cols-1 md:grid-cols-3 gap-8">
						<div>
							<h3 className="text-lg font-semibold text-gray-900 mb-4">
								Covenant Chimes
							</h3>
							<p className="text-gray-600 text-sm">
								Discover the perfect sounds for your meditation, prayer, and
								relaxation experience.
							</p>
						</div>
						<div>
							<h3 className="text-lg font-semibold text-gray-900 mb-4">
								Quick Links
							</h3>
							<ul className="space-y-2">
								<li>
									<Link
										href="/about"
										className="text-gray-600 hover:text-primary-600 text-sm"
									>
										About Us
									</Link>
								</li>
								<li>
									<Link
										href="/contact"
										className="text-gray-600 hover:text-primary-600 text-sm"
									>
										Contact
									</Link>
								</li>
								<li>
									<Link
										href="/faq"
										className="text-gray-600 hover:text-primary-600 text-sm"
									>
										FAQ
									</Link>
								</li>
							</ul>
						</div>
						<div>
							<h3 className="text-lg font-semibold text-gray-900 mb-4">
								For Creators
							</h3>
							<ul className="space-y-2">
								<li>
									<Link
										href="/creators"
										className="text-gray-600 hover:text-primary-600 text-sm"
									>
										Become a Creator
									</Link>
								</li>
								<li>
									<Link
										href="/guidelines"
										className="text-gray-600 hover:text-primary-600 text-sm"
									>
										Submission Guidelines
									</Link>
								</li>
								<li>
									<Link
										href="/creator-resources"
										className="text-gray-600 hover:text-primary-600 text-sm"
									>
										Creator Resources
									</Link>
								</li>
							</ul>
						</div>
					</div>
					<div className="mt-8 pt-8 border-t border-gray-200">
						<p className="text-gray-500 text-sm text-center">
							&copy; {new Date().getFullYear()} Covenant Chimes. All rights
							reserved.
						</p>
					</div>
				</div>
			</footer>
		</div>
	);
}
