import Login from '../Login';
import { AuthProvider } from '@/contexts/AuthContext';

export default function LoginExample() {
  return (
    <AuthProvider>
      <Login />
    </AuthProvider>
  );
}
