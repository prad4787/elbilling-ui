import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import StockPage from './pages/StockPage';
import StockViewPage from './pages/StockViewPage';
import CustomerPage from './pages/CustomerPage';
import CustomerViewPage from './pages/CustomerViewPage';
import BillPage from './pages/BillPage';
import BillListPage from './pages/BillListPage';
import BillViewPage from './pages/BillViewPage';
import CategoryPage from './pages/CategoryPage';
import TailorCounterPage from './pages/TailorCounterPage';
import ItemStatusPage from './pages/ItemStatusPage';
import NotFoundPage from './pages/NotFoundPage';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  const { checkAuth } = useAuth();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      
      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route path="/" element={<Navigate to="/dashboard\" replace />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/stocks" element={<StockPage />} />
          <Route path="/stocks/:id" element={<StockViewPage />} />
          <Route path="/customers" element={<CustomerPage />} />
          <Route path="/customers/:id" element={<CustomerViewPage />} />
          <Route path="/bills" element={<BillListPage />} />
          <Route path="/bills/new" element={<BillPage />} />
          <Route path="/bills/:id" element={<BillViewPage />} />
          <Route path="/categories" element={<CategoryPage />} />
          <Route path="/tailor-counters" element={<TailorCounterPage />} />
          <Route path="/item-status" element={<ItemStatusPage />} />
        </Route>
      </Route>
      
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default App;