import { createBrowserRouter } from 'react-router-dom';

import { AdminLayout } from '../layouts/AdminLayout';
import { RootLayout } from '../layouts/RootLayout';
import { AccountPage } from '../pages/Account';
import { AttributeList } from '../pages/admin/AttributeList';
import { BulkRequestList } from '../pages/admin/BulkOrderList';
import { CategoryList } from '../pages/admin/CategoryList';
import { CompanyList } from '../pages/admin/CompanyList';
import { CustomerDetail } from '../pages/admin/CustomerDetail';
import { CustomerList } from '../pages/admin/CustomerList';
import { Dashboard } from '../pages/admin/Dashboard';
import { FavoriteList } from '../pages/admin/FavoriteList';
import { FeedbackList } from '../pages/admin/FeedbackList';
import { GuaranteeList } from '../pages/admin/GuaranteeList';
import { MediaLibrary } from '../pages/admin/MediaLibrary';
import { OrderDetail } from '../pages/admin/OrderDetail';
import { OrderList } from '../pages/admin/OrderList';
import { ProductForm } from '../pages/admin/ProductForm';
import { ProductList } from '../pages/admin/ProductList';
import { StoreBranchList } from '../pages/admin/StoreBranchList';
import { SupplierList } from '../pages/admin/SupplierList';
import { TrademarkList } from '../pages/admin/TrademarkList';
import { VoucherList } from '../pages/admin/VoucherList';
import { CartPage } from '../pages/Cart';
import { CheckoutPage } from '../pages/Checkout';
import { HomePage } from '../pages/Home';
import { LoginPage } from '../pages/Login';
import { ProductDetailPage } from '../pages/ProductDetail';
import { ProductListPage } from '../pages/ProductList';
import { RegisterPage } from '../pages/Register';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'products', element: <ProductListPage /> },
      { path: 'product/:id', element: <ProductDetailPage /> },
      { path: 'cart', element: <CartPage /> },
      { path: 'checkout', element: <CheckoutPage /> },
      { path: 'login', element: <LoginPage /> },
      { path: 'register', element: <RegisterPage /> },
      { path: 'account', element: <AccountPage /> },
    ],
  },
  {
    path: '/admin',
    element: <AdminLayout />,
    children: [
      { index: true, element: <Dashboard /> },
      { path: 'dashboard', element: <Dashboard /> },
      
      // Products
      { path: 'products', element: <ProductList /> },
      { path: 'products/new', element: <ProductForm /> },
      { path: 'products/:id/edit', element: <ProductForm /> },
      { path: 'products/categories', element: <CategoryList /> },
      { path: 'products/trademarks', element: <TrademarkList /> },
      { path: 'products/suppliers', element: <SupplierList /> },
      { path: 'products/attributes', element: <AttributeList /> },

      // Orders
      { path: 'orders', element: <OrderList /> },
      { path: 'orders/:id', element: <OrderDetail /> },
      { path: 'orders/bulk', element: <BulkRequestList /> },
      { path: 'orders/vouchers', element: <VoucherList /> },

      // Customers
      { path: 'customers', element: <CustomerList /> },
      { path: 'customers/:id', element: <CustomerDetail /> },
      { path: 'customers/companies', element: <CompanyList /> },
      { path: 'customers/favorites', element: <FavoriteList /> },
      { path: 'customers/feedback', element: <FeedbackList /> },

      // Settings
      { path: 'settings/stores', element: <StoreBranchList /> },
      { path: 'settings/guarantees', element: <GuaranteeList /> },
      { path: 'settings/media', element: <MediaLibrary /> },
    ],
  },
]);
