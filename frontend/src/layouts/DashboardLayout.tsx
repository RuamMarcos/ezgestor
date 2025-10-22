import { Outlet, useLocation } from 'react-router-dom';
import ConditionalHeader from '../components/ConditionalHeader';
import Footer from '../components/Footer';

function DashboardLayout() {
  const location = useLocation();
  const isSettingsPage = location.pathname.startsWith('/settings');

  return (
    <div className="flex flex-col min-h-screen bg-gray-100 p-4">
      <div className="w-full max-w-[1800px] mx-auto flex flex-col flex-1">
        <ConditionalHeader />
        
        <main className={`flex-1 ${isSettingsPage ? 'bg-white rounded-lg shadow-sm p-6' : ''}`}>
          <Outlet /> 
        </main>
        
        <div className="w-full mt-4">
          <Footer />
        </div>
      </div>
    </div>
  );
}

export default DashboardLayout;