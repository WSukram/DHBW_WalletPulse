import { Navigate, Outlet } from 'react-router-dom';
import { useApp } from '../context/AppContext';

const PrivateRoute = () => {
  const { user } = useApp();
  return user ? <Outlet /> : <Navigate to="/login" replace />;
};

export default PrivateRoute;
