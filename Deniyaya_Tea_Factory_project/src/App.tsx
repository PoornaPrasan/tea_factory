import React, { useState } from 'react';
import { TeaShopProvider } from './context/TeaShopContext';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import TeaInventory from './components/TeaInventory';
import OrderManagement from './components/OrderManagement';
import CustomerManagement from './components/CustomerManagement';
import NewOrder from './components/NewOrder';

function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'inventory':
        return <TeaInventory />;
      case 'orders':
        return <OrderManagement />;
      case 'customers':
        return <CustomerManagement />;
      case 'new-order':
        return <NewOrder />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <TeaShopProvider>
      <Layout currentPage={currentPage} onPageChange={setCurrentPage}>
        {renderPage()}
      </Layout>
    </TeaShopProvider>
  );
}

export default App;