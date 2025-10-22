import { Outlet } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';

function DashboardLayout() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-100 p-4">
      <div className="w-full mx-auto flex flex-col flex-1">
        <Header />
        
        <main className="flex-1">
          <Outlet /> 
        </main>
        
        <div className="w-full max-w-[1800px] mx-auto mt-4">
          <Footer />
        </div>
      </div>
    </div>
  );
}

export default DashboardLayout;