// src/routes/AppRoutes.tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from '../pages/Home/Home';
import Login from '../pages/Login/Login';
import Registration from '../pages/Registration/Registration';
import ForgotPassword from '../pages/ForgotPassword/ForgotPassword';
import ResetPassword from '../pages/ResetPassword/ResetPassword';
import ChangePassword from '../pages/ChangePassword/ChangePassword';
import Administration from '../pages/Administration/Administration';
import ProgramAdministration from '../pages/ProgramAdministration/ProgramAdministration';
import Rules from '../pages/Rules/Rules';
import User from '../pages/User/User';
import ProtectedRoute from './ProtectedRoute';
import ProtectedLayout from '../layouts/ProtectedLayout';
import { paths } from './paths';
import { ROLE_ADMIN, ROLE_CUSTOMER, ROLE_PROGRAM_ADMIN } from '../constants/auth';

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rutas públicas */}
        <Route path={paths.home} element={<Home />} />
        <Route path={paths.login} element={<Login />} />
        <Route path={paths.registration} element={<Registration />} />
        <Route path={paths.forgotPassword} element={<ForgotPassword />} />
        <Route path={paths.resetPassword} element={<ResetPassword />} />

        {/* Rutas protegidas */}
        <Route element={<ProtectedLayout />}>
          <Route
            path={paths.administration}
            element={
              <ProtectedRoute allowedRoles={[ROLE_ADMIN]}>
                <Administration />
              </ProtectedRoute>
            }
          />
          <Route
            path={paths.rules}
            element={
              <ProtectedRoute allowedRoles={[ROLE_ADMIN, ROLE_PROGRAM_ADMIN]}>
                <Rules />
              </ProtectedRoute>
            }
          />
          <Route
            path={paths.user}
            element={
              <ProtectedRoute allowedRoles={[ROLE_CUSTOMER]}>
                <User />
              </ProtectedRoute>
            }
          />
          <Route
            path={paths.changePassword}
            element={
              <ProtectedRoute allowedRoles={[ROLE_ADMIN, ROLE_CUSTOMER, ROLE_PROGRAM_ADMIN]}>
                <ChangePassword />
              </ProtectedRoute>
            }
          />
          <Route
            path={paths.programAdministration}
            element={
              <ProtectedRoute allowedRoles={[ROLE_PROGRAM_ADMIN]}>
                <ProgramAdministration />
              </ProtectedRoute>
            }
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
