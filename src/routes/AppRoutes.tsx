// src/routes/AppRoutes.tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from '../pages/Home/Home';
import Login from '../pages/Login/Login';
import Registration from '../pages/Registration/Registration';
import ForgotPassword from '../pages/ForgotPassword/ForgotPassword';
import Administration from '../pages/Administration/Administration';
import User from '../pages/User/User';
import ProtectedRoute from './ProtectedRoute';
import ProtectedLayout from '../layouts/ProtectedLayout';
import { paths } from './paths';

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rutas públicas */}
        <Route path={paths.home} element={<Home />} />
        <Route path={paths.login} element={<Login />} />
        <Route path={paths.registration} element={<Registration />} />
        <Route path={paths.forgotPassword} element={<ForgotPassword />} />

        {/* Rutas protegidas */}
        <Route element={<ProtectedLayout />}>
          <Route
            path={paths.administration}
            element={
              <ProtectedRoute allowedRoles={['1']}>
                <Administration />
              </ProtectedRoute>
            }
          />
          <Route
            path={paths.user}
            element={
              <ProtectedRoute allowedRoles={['2']}>
                <User />
              </ProtectedRoute>
            }
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
