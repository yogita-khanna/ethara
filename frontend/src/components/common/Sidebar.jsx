import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Package, Users, ShoppingCart, X } from 'lucide-react';
import useStore from '../../store';
import { clsx } from 'clsx';

const Sidebar = () => {
  const { isSidebarOpen, toggleSidebar } = useStore();

  const links = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/products', label: 'Products', icon: Package },
    { to: '/customers', label: 'Customers', icon: Users },
    { to: '/orders', label: 'Orders', icon: ShoppingCart },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden"
          onClick={toggleSidebar}
        ></div>
      )}

      {/* Sidebar container */}
      <aside
        className={clsx(
          "fixed md:static inset-y-0 left-0 z-30 w-64 bg-gray-900 text-white transform transition-transform duration-200 ease-in-out",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        <div className="h-16 flex items-center justify-between px-4 border-b border-gray-700">
          <span className="text-xl font-bold">Admin Panel</span>
          <button onClick={toggleSidebar} className="md:hidden">
            <X className="w-6 h-6" />
          </button>
        </div>
        <nav className="p-4 space-y-2">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                clsx(
                  "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                  isActive ? "bg-blue-600 text-white" : "text-gray-300 hover:bg-gray-800 hover:text-white"
                )
              }
            >
              <link.icon className="w-5 h-5" />
              <span>{link.label}</span>
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;
