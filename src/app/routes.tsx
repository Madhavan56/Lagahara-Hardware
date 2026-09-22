import { lazy } from 'react'
import { createBrowserRouter } from 'react-router-dom'
import { RootLayout } from '@/components/layout/RootLayout'
import { ProtectedRoute } from '@/features/auth/ProtectedRoute'

const HomePage = lazy(() => import('@/pages/HomePage'))
const ShopPage = lazy(() => import('@/pages/ShopPage'))
const CategoryPage = lazy(() => import('@/pages/CategoryPage'))
const ProductPage = lazy(() => import('@/pages/ProductPage'))
const SearchPage = lazy(() => import('@/pages/SearchPage'))
const CartPage = lazy(() => import('@/pages/CartPage'))
const WishlistPage = lazy(() => import('@/pages/WishlistPage'))
const CheckoutPage = lazy(() => import('@/pages/CheckoutPage'))
const TrackOrderPage = lazy(() => import('@/pages/TrackOrderPage'))
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'))

const LoginPage = lazy(() => import('@/pages/LoginPage'))
const SignupPage = lazy(() => import('@/pages/SignupPage'))
const ForgotPasswordPage = lazy(() => import('@/pages/ForgotPasswordPage'))
const ResetPasswordPage = lazy(() => import('@/pages/ResetPasswordPage'))

const AccountLayout = lazy(() => import('@/pages/account/AccountLayout'))
const ProfileTab = lazy(() => import('@/pages/account/ProfileTab'))
const AddressesTab = lazy(() => import('@/pages/account/AddressesTab'))
const OrdersTab = lazy(() => import('@/pages/account/OrdersTab'))
const OrderDetailPage = lazy(() => import('@/pages/account/OrderDetailPage'))

export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'shop', element: <ShopPage /> },
      { path: 'category/:slug', element: <CategoryPage /> },
      { path: 'product/:slug', element: <ProductPage /> },
      { path: 'search', element: <SearchPage /> },
      { path: 'cart', element: <CartPage /> },
      { path: 'wishlist', element: <WishlistPage /> },
      { path: 'track', element: <TrackOrderPage /> },

      { path: 'login', element: <LoginPage /> },
      { path: 'signup', element: <SignupPage /> },
      { path: 'forgot-password', element: <ForgotPasswordPage /> },
      { path: 'reset-password', element: <ResetPasswordPage /> },

      {
        element: <ProtectedRoute />,
        children: [
          { path: 'checkout', element: <CheckoutPage /> },
          {
            path: 'account',
            element: <AccountLayout />,
            children: [
              { index: true, element: <ProfileTab /> },
              { path: 'addresses', element: <AddressesTab /> },
              { path: 'orders', element: <OrdersTab /> },
              { path: 'orders/:orderId', element: <OrderDetailPage /> },
            ],
          },
        ],
      },

      { path: '*', element: <NotFoundPage /> },
    ],
  },
])
