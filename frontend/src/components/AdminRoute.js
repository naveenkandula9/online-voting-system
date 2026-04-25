import { Navigate, Outlet } from 'react-router-dom';

const AdminRoute = () => {
  const token = localStorage.getItem('votingToken');
  let user = {};

  try {
    user = JSON.parse(localStorage.getItem('votingUser') || '{}');
  } catch (_error) {
    localStorage.removeItem('votingUser');
  }

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== 'admin') {
    return <Navigate to="/vote" replace />;
  }

  return <Outlet />;
};

export default AdminRoute;
