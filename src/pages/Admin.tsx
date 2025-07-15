
import { Navigate } from 'react-router-dom';

const Admin = () => {
  // Redirect to enhanced admin dashboard
  return <Navigate to="/admin/enhanced" replace />;
};

export default Admin;
