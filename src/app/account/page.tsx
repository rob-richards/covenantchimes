'use client';

import { useState } from 'react';
import {
	FaUser,
	FaCreditCard,
	FaHistory,
	FaBell,
	FaSignOutAlt,
} from 'react-icons/fa';

// Mock user data
const userData = {
	name: 'Sarah Johnson',
	email: 'sarah.johnson@example.com',
	joined: '2023-05-12',
	subscription: 'Premium',
	purchaseCount: 7,
	preferences: {
		emailNotifications: true,
		autoDownload: false,
		darkMode: true,
	},
};

// Mock purchase history
const purchaseHistory = [
	{
		id: 'ord-12345',
		date: '2023-10-15',
		product: 'Ocean Bells',
		amount: 12.99,
		status: 'Completed',
	},
	{
		id: 'ord-12346',
		date: '2023-09-22',
		product: 'Forest Whispers',
		amount: 8.99,
		status: 'Completed',
	},
	{
		id: 'ord-12347',
		date: '2023-11-05',
		product: 'Desert Winds',
		amount: 9.99,
		status: 'Completed',
	},
];

export default function AccountPage() {
	const [activeTab, setActiveTab] = useState('profile');
	const [formData, setFormData] = useState({
		name: userData.name,
		email: userData.email,
		emailNotifications: userData.preferences.emailNotifications,
		autoDownload: userData.preferences.autoDownload,
		darkMode: userData.preferences.darkMode,
	});

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value, type, checked } = e.target;
		setFormData({
			...formData,
			[name]: type === 'checkbox' ? checked : value,
		});
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		console.log('Form submitted:', formData);
		// Here you would typically save the data to your backend
		alert('Profile updated successfully!');
	};

	return (
		<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
			<h1 className="text-3xl font-bold text-gray-900 mb-8">My Account</h1>

			<div className="flex flex-col md:flex-row gap-8">
				{/* Sidebar navigation */}
				<div className="md:w-64 flex-shrink-0">
					<div className="bg-white rounded-lg shadow-md overflow-hidden">
						<div className="p-6 border-b border-gray-200">
							<div className="flex items-center">
								<div className="h-12 w-12 rounded-full bg-primary-100 flex items-center justify-center text-primary-600">
									<FaUser size={20} />
								</div>
								<div className="ml-3">
									<p className="text-sm font-medium text-gray-900">
										{userData.name}
									</p>
									<p className="text-xs text-gray-500">
										{userData.subscription} Member
									</p>
								</div>
							</div>
						</div>

						<nav className="p-4">
							<ul className="space-y-1">
								<li>
									<button
										onClick={() => setActiveTab('profile')}
										className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md ${
											activeTab === 'profile'
												? 'bg-primary-100 text-primary-700'
												: 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
										}`}
									>
										<FaUser className="mr-3 h-4 w-4" />
										Profile
									</button>
								</li>
								<li>
									<button
										onClick={() => setActiveTab('payment')}
										className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md ${
											activeTab === 'payment'
												? 'bg-primary-100 text-primary-700'
												: 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
										}`}
									>
										<FaCreditCard className="mr-3 h-4 w-4" />
										Payment Methods
									</button>
								</li>
								<li>
									<button
										onClick={() => setActiveTab('purchases')}
										className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md ${
											activeTab === 'purchases'
												? 'bg-primary-100 text-primary-700'
												: 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
										}`}
									>
										<FaHistory className="mr-3 h-4 w-4" />
										Purchase History
									</button>
								</li>
								<li>
									<button
										onClick={() => setActiveTab('preferences')}
										className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md ${
											activeTab === 'preferences'
												? 'bg-primary-100 text-primary-700'
												: 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
										}`}
									>
										<FaBell className="mr-3 h-4 w-4" />
										Preferences
									</button>
								</li>
							</ul>

							<div className="pt-6 mt-6 border-t border-gray-200">
								<button className="w-full flex items-center px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-md">
									<FaSignOutAlt className="mr-3 h-4 w-4" />
									Sign Out
								</button>
							</div>
						</nav>
					</div>
				</div>

				{/* Main content area */}
				<div className="flex-1">
					<div className="bg-white rounded-lg shadow-md p-6">
						{activeTab === 'profile' && (
							<div>
								<h2 className="text-xl font-semibold text-gray-900 mb-6">
									Profile Information
								</h2>
								<form onSubmit={handleSubmit}>
									<div className="space-y-4">
										<div>
											<label
												htmlFor="name"
												className="block text-sm font-medium text-gray-700"
											>
												Full Name
											</label>
											<input
												type="text"
												id="name"
												name="name"
												value={formData.name}
												onChange={handleInputChange}
												className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
											/>
										</div>

										<div>
											<label
												htmlFor="email"
												className="block text-sm font-medium text-gray-700"
											>
												Email Address
											</label>
											<input
												type="email"
												id="email"
												name="email"
												value={formData.email}
												onChange={handleInputChange}
												className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
											/>
										</div>

										<div className="pt-4">
											<button
												type="submit"
												className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
											>
												Save Changes
											</button>
										</div>
									</div>
								</form>

								<div className="mt-8 pt-8 border-t border-gray-200">
									<h3 className="text-lg font-medium text-gray-900">
										Account Information
									</h3>
									<dl className="mt-4 grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
										<div>
											<dt className="text-sm font-medium text-gray-500">
												Member Since
											</dt>
											<dd className="mt-1 text-sm text-gray-900">
												{new Date(userData.joined).toLocaleDateString()}
											</dd>
										</div>
										<div>
											<dt className="text-sm font-medium text-gray-500">
												Subscription
											</dt>
											<dd className="mt-1 text-sm text-gray-900">
												{userData.subscription}
											</dd>
										</div>
										<div>
											<dt className="text-sm font-medium text-gray-500">
												Purchases
											</dt>
											<dd className="mt-1 text-sm text-gray-900">
												{userData.purchaseCount} sound packs
											</dd>
										</div>
									</dl>
								</div>
							</div>
						)}

						{activeTab === 'payment' && (
							<div>
								<h2 className="text-xl font-semibold text-gray-900 mb-6">
									Payment Methods
								</h2>
								<p className="text-gray-600 mb-4">
									Manage your payment methods and billing information.
								</p>

								<div className="border border-gray-200 rounded-md p-4 mb-4">
									<div className="flex justify-between items-center">
										<div className="flex items-center">
											<div className="h-8 w-12 bg-gray-200 rounded flex items-center justify-center mr-3">
												<span className="text-xs font-medium">VISA</span>
											</div>
											<div>
												<p className="text-sm font-medium text-gray-900">
													Visa ending in 4242
												</p>
												<p className="text-xs text-gray-500">Expires 12/2025</p>
											</div>
										</div>
										<div>
											<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
												Default
											</span>
										</div>
									</div>
								</div>

								<button className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
									Add Payment Method
								</button>
							</div>
						)}

						{activeTab === 'purchases' && (
							<div>
								<h2 className="text-xl font-semibold text-gray-900 mb-6">
									Purchase History
								</h2>

								<div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
									<table className="min-w-full divide-y divide-gray-300">
										<thead className="bg-gray-50">
											<tr>
												<th
													scope="col"
													className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6"
												>
													Order ID
												</th>
												<th
													scope="col"
													className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
												>
													Date
												</th>
												<th
													scope="col"
													className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
												>
													Product
												</th>
												<th
													scope="col"
													className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
												>
													Amount
												</th>
												<th
													scope="col"
													className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
												>
													Status
												</th>
											</tr>
										</thead>
										<tbody className="divide-y divide-gray-200 bg-white">
											{purchaseHistory.map((purchase) => (
												<tr key={purchase.id}>
													<td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
														{purchase.id}
													</td>
													<td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
														{new Date(purchase.date).toLocaleDateString()}
													</td>
													<td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
														{purchase.product}
													</td>
													<td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
														${purchase.amount.toFixed(2)}
													</td>
													<td className="whitespace-nowrap px-3 py-4 text-sm">
														<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
															{purchase.status}
														</span>
													</td>
												</tr>
											))}
										</tbody>
									</table>
								</div>
							</div>
						)}

						{activeTab === 'preferences' && (
							<div>
								<h2 className="text-xl font-semibold text-gray-900 mb-6">
									Preferences
								</h2>
								<form onSubmit={handleSubmit}>
									<div className="space-y-4">
										<div className="flex items-start">
											<div className="flex items-center h-5">
												<input
													id="emailNotifications"
													name="emailNotifications"
													type="checkbox"
													checked={formData.emailNotifications}
													onChange={handleInputChange}
													className="focus:ring-primary-500 h-4 w-4 text-primary-600 border-gray-300 rounded"
												/>
											</div>
											<div className="ml-3 text-sm">
												<label
													htmlFor="emailNotifications"
													className="font-medium text-gray-700"
												>
													Email Notifications
												</label>
												<p className="text-gray-500">
													Receive emails about new sound packs, updates, and
													promotions.
												</p>
											</div>
										</div>

										<div className="flex items-start">
											<div className="flex items-center h-5">
												<input
													id="autoDownload"
													name="autoDownload"
													type="checkbox"
													checked={formData.autoDownload}
													onChange={handleInputChange}
													className="focus:ring-primary-500 h-4 w-4 text-primary-600 border-gray-300 rounded"
												/>
											</div>
											<div className="ml-3 text-sm">
												<label
													htmlFor="autoDownload"
													className="font-medium text-gray-700"
												>
													Auto-Download
												</label>
												<p className="text-gray-500">
													Automatically download purchased sound packs.
												</p>
											</div>
										</div>

										<div className="flex items-start">
											<div className="flex items-center h-5">
												<input
													id="darkMode"
													name="darkMode"
													type="checkbox"
													checked={formData.darkMode}
													onChange={handleInputChange}
													className="focus:ring-primary-500 h-4 w-4 text-primary-600 border-gray-300 rounded"
												/>
											</div>
											<div className="ml-3 text-sm">
												<label
													htmlFor="darkMode"
													className="font-medium text-gray-700"
												>
													Dark Mode
												</label>
												<p className="text-gray-500">
													Use dark theme for the application interface.
												</p>
											</div>
										</div>

										<div className="pt-4">
											<button
												type="submit"
												className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
											>
												Save Preferences
											</button>
										</div>
									</div>
								</form>
							</div>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}
