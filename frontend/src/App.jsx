import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/common/Navbar';
import Sidebar from './components/common/Sidebar';
import ErrorBoundary from './components/common/ErrorBoundary';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Customers from './pages/Customers';
import Orders from './pages/Orders';

function App() {
  return (
    <BrowserRouter>
      <div className="flex h-screen overflow-hidden bg-gray-100">
        <Sidebar />
        
        <div className="flex-1 flex flex-col overflow-hidden">
          <Navbar />
          
          <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-4 md:p-6">
            <ErrorBoundary>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/products" element={<Products />} />
                <Route path="/customers" element={<Customers />} />
                <Route path="/orders" element={<Orders />} />
              </Routes>
            </ErrorBoundary>
          </main>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;
