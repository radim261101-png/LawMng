import Navigation from '../Navigation';
import { AuthProvider } from '@/contexts/AuthContext';

export default function NavigationExample() {
  return (
    <AuthProvider>
      <Navigation />
    </AuthProvider>
  );
}
