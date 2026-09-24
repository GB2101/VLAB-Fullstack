import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createRootRoute, Outlet } from '@tanstack/react-router';

import { Navbar } from '@/components/Navbar';

const queryClient = new QueryClient();

const Router = () => {
	return (
		<QueryClientProvider client={queryClient}>
			<Navbar />
			<div className='flex flex-col items-center w-screen'>
				<Outlet />
			</div>
		</QueryClientProvider>
	);
};

export const Route = createRootRoute({ component: Router });
