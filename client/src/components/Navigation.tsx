import { useAuth } from '@/contexts/AuthContext';
import { useLocation, Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { LogOut, Scale, User, FileText, BarChart3, History } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Navigation() {
  const { user, logout } = useAuth();
  const [location, setLocation] = useLocation();

  const handleLogout = () => {
    logout();
    setLocation('/');
  };

  const navItems = [
    { path: '/dashboard', label: 'السجلات', icon: FileText },
    { path: '/analytics', label: 'التحليلات', icon: BarChart3 },
    { path: '/updates-history', label: 'سجل التعديلات', icon: History, adminOnly: true },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-card border-b border-border shadow-sm">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center">
              <Scale className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">نظام إدارة السجلات القانونية</h1>
              <p className="text-sm text-muted-foreground">
                {user?.role === 'admin' ? 'لوحة تحكم المدير' : 'لوحة تحكم المستخدم'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-4 py-2 bg-muted rounded-md">
              <User className="w-4 h-4 text-muted-foreground" />
              <span className="font-medium text-sm" data-testid="text-username">{user?.username}</span>
            </div>
            <Button 
              variant="outline" 
              onClick={handleLogout}
              data-testid="button-logout"
            >
              <LogOut className="w-4 h-4 ml-2" />
              تسجيل الخروج
            </Button>
          </div>
        </div>
        
        <div className="flex gap-2 mt-4 border-t pt-3">
          {navItems
            .filter((item) => !item.adminOnly || user?.role === 'admin')
            .map((item) => {
              const Icon = item.icon;
              const isActive = location === item.path;
              return (
                <Link key={item.path} href={item.path}>
                  <div
                    className={cn(
                      "flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer",
                      isActive 
                        ? "bg-primary text-primary-foreground" 
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                    data-testid={`link-${item.path.slice(1)}`}
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </div>
                </Link>
              );
            })}
        </div>
      </div>
    </nav>
  );
}
