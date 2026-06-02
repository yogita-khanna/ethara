import React from 'react';
import { Menu } from 'lucide-react';
import useStore from '../../store';

const Navbar = () => {
  const toggleSidebar = useStore((state) => state.toggleSidebar);

  return (
    <nav className="bg-white shadow-sm border-b h-16 flex items-center px-4 justify-between">
      <div className="flex items-center">
        <button
          onClick={toggleSidebar}
          className="p-2 mr-4 md:hidden text-gray-600 hover:bg-gray-100 rounded-md"
        >
          <Menu className="w-6 h-6" />
        </button>
        <h1 className="text-xl font-semibold text-gray-800">Inventory System</h1>
      </div>
      <div className="flex items-center">
        <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
          A
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
