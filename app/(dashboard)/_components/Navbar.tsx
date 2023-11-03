'use client';
import { NavbarRoutes } from '@/components/navbar-routes';
import MobileSidebar from './MobileSidebar';

const Navbar = () => {
  return (
    <div className='p-4 border-b h-full flex items-center bg-white shadow-sm'>
      {/* Navbar */}
      <MobileSidebar />
      <NavbarRoutes />
    </div>
  );
};

export default Navbar;
