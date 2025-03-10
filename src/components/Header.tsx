import Link from 'next/link';
import { FaShoppingCart, FaUser } from 'react-icons/fa';

export default function Header() {
	return (
		<header className="w-full bg-white shadow-sm">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div className="flex justify-between h-16">
					<div className="flex">
						<div className="flex-shrink-0 flex items-center">
							<Link href="/" className="text-primary-600 font-bold text-xl">
								Covenant Chimes
							</Link>
						</div>
						<nav className="hidden sm:ml-6 sm:flex sm:space-x-8">
							<Link
								href="/"
								className="border-transparent text-gray-500 hover:border-primary-500 hover:text-primary-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
							>
								Home
							</Link>
							<Link
								href="/marketplace"
								className="border-transparent text-gray-500 hover:border-primary-500 hover:text-primary-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
							>
								Marketplace
							</Link>
							<Link
								href="/about"
								className="border-transparent text-gray-500 hover:border-primary-500 hover:text-primary-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
							>
								About
							</Link>
						</nav>
					</div>
					<div className="hidden sm:ml-6 sm:flex sm:items-center">
						<Link
							href="/cart"
							className="p-2 text-gray-500 hover:text-primary-600 relative"
						>
							<FaShoppingCart className="h-6 w-6" />
						</Link>
						<Link
							href="/profile"
							className="ml-4 p-2 text-gray-500 hover:text-primary-600"
						>
							<FaUser className="h-6 w-6" />
						</Link>
					</div>
					<div className="flex items-center sm:hidden">
						<button
							type="button"
							className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
							aria-expanded="false"
						>
							<span className="sr-only">Open main menu</span>
							<svg
								className="block h-6 w-6"
								xmlns="http://www.w3.org/2000/svg"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
								aria-hidden="true"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth="2"
									d="M4 6h16M4 12h16M4 18h16"
								/>
							</svg>
						</button>
					</div>
				</div>
			</div>
		</header>
	);
}
