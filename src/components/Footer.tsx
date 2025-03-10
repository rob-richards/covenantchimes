import Link from 'next/link';
import { FaTwitter, FaFacebook, FaInstagram } from 'react-icons/fa';

export default function Footer() {
	return (
		<footer className="w-full bg-gray-100 py-8">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div className="grid grid-cols-1 md:grid-cols-3 gap-8">
					<div>
						<h3 className="text-lg font-semibold text-gray-900 mb-4">
							Covenant Chimes
						</h3>
						<p className="text-gray-600 mb-4">
							A prayer and meditation app that plays windchimes based on your
							location and current weather data.
						</p>
						<div className="flex space-x-4">
							<a
								href="https://twitter.com"
								target="_blank"
								rel="noopener noreferrer"
								className="text-gray-500 hover:text-primary-600"
							>
								<FaTwitter className="h-6 w-6" />
							</a>
							<a
								href="https://facebook.com"
								target="_blank"
								rel="noopener noreferrer"
								className="text-gray-500 hover:text-primary-600"
							>
								<FaFacebook className="h-6 w-6" />
							</a>
							<a
								href="https://instagram.com"
								target="_blank"
								rel="noopener noreferrer"
								className="text-gray-500 hover:text-primary-600"
							>
								<FaInstagram className="h-6 w-6" />
							</a>
						</div>
					</div>
					<div>
						<h3 className="text-lg font-semibold text-gray-900 mb-4">
							Quick Links
						</h3>
						<ul className="space-y-2">
							<li>
								<Link href="/" className="text-gray-600 hover:text-primary-600">
									Home
								</Link>
							</li>
							<li>
								<Link
									href="/marketplace"
									className="text-gray-600 hover:text-primary-600"
								>
									Marketplace
								</Link>
							</li>
							<li>
								<Link
									href="/about"
									className="text-gray-600 hover:text-primary-600"
								>
									About
								</Link>
							</li>
							<li>
								<Link
									href="/contact"
									className="text-gray-600 hover:text-primary-600"
								>
									Contact
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
									className="text-gray-600 hover:text-primary-600"
								>
									Become a Creator
								</Link>
							</li>
							<li>
								<Link
									href="/submit-pack"
									className="text-gray-600 hover:text-primary-600"
								>
									Submit Audio Pack
								</Link>
							</li>
							<li>
								<Link
									href="/creator-guidelines"
									className="text-gray-600 hover:text-primary-600"
								>
									Creator Guidelines
								</Link>
							</li>
						</ul>
					</div>
				</div>
				<div className="mt-8 pt-8 border-t border-gray-200">
					<p className="text-gray-500 text-center">
						&copy; {new Date().getFullYear()} Covenant Chimes. All rights
						reserved.
					</p>
				</div>
			</div>
		</footer>
	);
}
