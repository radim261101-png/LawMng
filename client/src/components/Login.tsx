import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Scale } from 'lucide-react';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const [, setLocation] = useLocation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    try {
      await login(username, password);
      setLocation('/dashboard');
    } catch (error: any) {
      setError(error.message || 'اسم المستخدم أو كلمة المرور غير صحيحة');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-2">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Scale className="w-8 h-8 text-primary" />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold">نظام إدارة السجلات القانونية</CardTitle>
          <CardDescription className="text-base">
            سجل الدخول للوصول إلى لوحة التحكم
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username" data-testid="label-username">اسم المستخدم</Label>
              <Input
                id="username"
                type="text"
                placeholder="أدخل اسم المستخدم"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                data-testid="input-username"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" data-testid="label-password">كلمة المرور</Label>
              <Input
                id="password"
                type="password"
                placeholder="أدخل كلمة المرور"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                data-testid="input-password"
              />
            </div>
            {error && (
              <div className="text-destructive text-sm text-center" data-testid="text-error">
                {error}
              </div>
            )}
            <Button type="submit" className="w-full" data-testid="button-login">
              تسجيل الدخول
            </Button>
          </form>
          <div className="mt-6 p-4 bg-muted rounded-md text-sm">
            <p className="font-medium mb-2">بيانات تسجيل الدخول التجريبية:</p>
            <div className="space-y-1 text-muted-foreground">
              <p><strong>مدير:</strong> admin / admin123</p>
              <p><strong>مستخدم:</strong> user / user123</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
