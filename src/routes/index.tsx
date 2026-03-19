import { createBrowserRouter } from 'react-router-dom';

import { ProtectedRoute } from '../components/ProtectedRoute';
import { ROLES } from '../constants/roles';
import { AdminLayout } from '../layouts/AdminLayout';
import { CompanyLayout } from '../layouts/CompanyLayout';
import { RootLayout } from '../layouts/RootLayout';
import { AccountPage } from '../pages/Account';
import { AttributeList } from '../pages/admin/AttributeList';
import { BannerList } from '../pages/admin/BannerList';
import BulkOrderDetail from '../pages/admin/BulkOrderDetail';
import BulkOrderList from '../pages/admin/BulkOrderList';
import { CategoryList } from '../pages/admin/CategoryList';
import { CompanyList } from '../pages/admin/CompanyList';
import { CustomerDetail } from '../pages/admin/CustomerDetail';
import { CustomerList } from '../pages/admin/CustomerList';
import { Dashboard } from '../pages/admin/Dashboard';
import { GuaranteeList } from '../pages/admin/GuaranteeList';
import { MediaLibrary } from '../pages/admin/MediaLibrary';
import { OrderDetail } from '../pages/admin/OrderDetail';
import { OrderList } from '../pages/admin/OrderList';
import { PriceTierManagement } from '../pages/admin/PriceTierManagement';
import { ProductForm } from '../pages/admin/ProductForm';
import { ProductList } from '../pages/admin/ProductList';
import { ReviewList } from '../pages/admin/ReviewList';
import { StoreBranchList } from '../pages/admin/StoreBranchList';
import { SupplierList } from '../pages/admin/SupplierList';
import { TrademarkList } from '../pages/admin/TrademarkList';
import { VoucherList } from '../pages/admin/VoucherList';
import { StockExportPage } from '../pages/admin/warehouse/StockExportPage';
import { StockImportPage } from '../pages/admin/warehouse/StockImportPage';
import { StockInventoryPage } from '../pages/admin/warehouse/StockInventoryPage';
import { BulkOrderCreate } from '../pages/b2b/BulkOrderCreate';
import { BusinessApprovalPendingPage } from '../pages/b2b/BusinessApprovalPendingPage';
import { BusinessRegistrationPage } from '../pages/b2b/BusinessRegistrationPage';
import { CompanyAccount } from '../pages/b2b/CompanyAccount';
import { CompanyDashboard } from '../pages/b2b/Dashboard';
import { MyOrders } from '../pages/b2b/MyOrders';
import { OrderDetail as CompanyOrderDetail } from '../pages/b2b/OrderDetail';
import { CartPage } from '../pages/Cart';
import { CheckoutPage } from '../pages/Checkout';
import { HomePage } from '../pages/Home';
import { LoginPage } from '../pages/Login';
import { OrderDetailPage } from '../pages/OrderDetail';
import { ProductDetailPage } from '../pages/ProductDetail';
import { ProductListPage } from '../pages/ProductList';
import { RegisterPage } from '../pages/Register';
import { SearchResultsPage } from '../pages/SearchResultsPage';
import { UnauthorizedPage } from '../pages/Unauthorized';
import { VNPayReturnPage } from '../pages/VNPayReturn';
import { WishlistPage } from '../pages/Wishlist';
import VerifyEmailPage from '../pages/VerifyEmail';

export const router = createBrowserRouter([
  // ── Public / Customer routes ──────────────────────────────────────────────
  {
    path: '/',
    element: <RootLayout />,
    children: [
      // Public routes
      { index: true, element: <HomePage /> },
      { path: 'products', element: <ProductListPage /> },
      { path: 'product/:id', element: <ProductDetailPage /> },
      { path: 'search', element: <SearchResultsPage /> },
      { path: 'login', element: <LoginPage /> },
      { path: 'register', element: <RegisterPage /> },
      { path: 'unauthorized', element: <UnauthorizedPage /> },
      { path: 'approval-pending', element: <BusinessApprovalPendingPage /> },
      { path: 'payment/vnpay/return', element: <VNPayReturnPage /> },
      { path: 'verify-email', element: <VerifyEmailPage /> },
      // Protected routes (chỉ cần đăng nhập, không yêu cầu role cụ thể)
      {
        element: <ProtectedRoute />,
        children: [
          { path: 'wishlist', element: <WishlistPage /> },
          { path: 'cart', element: <CartPage /> },
          { path: 'checkout', element: <CheckoutPage /> },
          { path: 'account', element: <AccountPage /> },
          { path: 'orders/:id', element: <OrderDetailPage /> },
          { path: 'register-business', element: <BusinessRegistrationPage /> },
        ],
      },
    ],
  },

  // ── Admin routes ──────────────────────────────────────────────────────────
  {
    // Admin routes - yêu cầu role ADMIN
    path: '/admin',
    element: <ProtectedRoute requiredRole={ROLES.ADMIN} />,
    children: [
      {
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
          { path: 'products/price-tiers', element: <PriceTierManagement /> },
          {
            path: 'products/price-tiers/:productId',
            element: <PriceTierManagement />,
          },

          // Orders
          { path: 'orders', element: <OrderList /> },
          { path: 'orders/:id', element: <OrderDetail /> },
          { path: 'orders/bulk', element: <BulkOrderList /> },
          { path: 'orders/bulk/:id', element: <BulkOrderDetail /> },
          { path: 'orders/vouchers', element: <VoucherList /> },

          // Customers
          { path: 'customers', element: <CustomerList /> },
          { path: 'customers/:id', element: <CustomerDetail /> },
          { path: 'customers/companies', element: <CompanyList /> },
          { path: 'customers/reviews', element: <ReviewList /> },

          // Settings
          { path: 'settings/stores', element: <StoreBranchList /> },
          { path: 'settings/guarantees', element: <GuaranteeList /> },
          { path: 'settings/banners', element: <BannerList /> },
          { path: 'settings/media', element: <MediaLibrary /> },

          // Inventory
          { path: 'inventory', element: <StockInventoryPage /> },
          { path: 'inventory/import', element: <StockImportPage /> },
          { path: 'inventory/export', element: <StockExportPage /> },
        ],
      },
    ],
  },

  // ── Company / B2B routes (role: COMPANY only) ────────────────────────────
  {
    path: '/company',
    element: <ProtectedRoute requiredRole={ROLES.COMPANY} />,
    children: [
      {
        element: <CompanyLayout />,
        children: [
          { index: true, element: <CompanyDashboard /> },
          { path: 'orders', element: <MyOrders /> },
          { path: 'orders/new', element: <BulkOrderCreate /> },
          { path: 'orders/:id', element: <CompanyOrderDetail /> },
          { path: 'account', element: <CompanyAccount /> },
        ],
      },
    ],
  },
]);
