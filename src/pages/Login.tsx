import { Apple, Chrome, Facebook, Lock, Mail, AlertCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Separator } from '../components/ui/separator';
import { Alert, AlertDescription } from '../components/ui/alert';
import { useAuth } from '../contexts/AuthContext';

export function LoginPage() {
  const navigate = useNavigate();
  const { login, error, clearError, isLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Clear error when component mounts or unmounts
  useEffect(() => {
    return () => clearError();
  }, [clearError]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      // Error is handled by AuthContext and available in error state
      console.error('Login failed', err);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen flex items-center justify-center py-12">
      <Card className="max-w-md w-full mx-4 p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-red-600 to-red-500 rounded-lg flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-2xl">PK</span>
          </div>
          <h1 className="text-2xl font-bold mb-2">Đăng nhập</h1>
          <p className="text-gray-600">Chào mừng bạn quay trở lại!</p>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6 bg-red-50 text-red-600 border-red-200">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="email">Email hoặc số điện thoại</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                id="email"
                type="text"
                placeholder="nguyenvana@example.com"
                className="pl-10"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <Label htmlFor="password">Mật khẩu</Label>
              <button type="button" className="text-sm text-red-600 hover:underline">
                Quên mật khẩu?
              </button>
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                className="pl-10"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="remember"
              className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
            />
            <label htmlFor="remember" className="ml-2 text-sm text-gray-600">
              Ghi nhớ đăng nhập
            </label>
          </div>

          <Button
            type="submit"
            className="w-full bg-red-600 hover:bg-red-700 h-11"
            disabled={isLoading}
          >
            {isLoading ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </Button>
        </form>

        <div className="relative my-6">
          <Separator />
          <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-4 text-sm text-gray-500">
            Hoặc đăng nhập với
          </span>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <Button variant="outline" className="h-11" disabled={isLoading}>
            <Facebook className="w-5 h-5" />
          </Button>
          <Button variant="outline" className="h-11" disabled={isLoading}>
            <Chrome className="w-5 h-5" />
          </Button>
          <Button variant="outline" className="h-11" disabled={isLoading}>
            <Apple className="w-5 h-5" />
          </Button>
        </div>

        <p className="text-center text-sm text-gray-600 mt-6">
          Chưa có tài khoản?{' '}
          <Link
            to="/register"
            className="text-red-600 font-medium hover:underline"
          >
            Đăng ký ngay
          </Link>
        </p>
      </Card>
    </div>
  );
}
