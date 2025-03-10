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
				<Suspense fallback={<LoadingSpinner />}>
					<ChimePlayer />
				</Suspense>
			</div>

			<Footer />
		</main>
	);
}
