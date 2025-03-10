import { Suspense } from 'react';
import ChimePlayer from '@/components/ChimePlayer';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export default function Home() {
	return (
		<main className="flex min-h-screen flex-col items-center">
			<Header />

			<div className="flex-1 w-full max-w-7xl px-4 py-8 md:py-16 flex flex-col items-center justify-center">
				<h1 className="text-3xl md:text-5xl font-bold text-center text-primary-800 mb-6">
					Covenant Chimes
				</h1>
				<p className="text-lg md:text-xl text-center text-gray-700 max-w-2xl mb-12">
					A prayer and meditation app that plays windchimes based on your
					location and current weather data
				</p>

				<Suspense fallback={<LoadingSpinner />}>
					<ChimePlayer />
				</Suspense>
			</div>

			<Footer />
		</main>
	);
}
