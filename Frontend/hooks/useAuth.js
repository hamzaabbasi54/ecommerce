'use client';

import { useState } from 'react';
import * as authService from '@/services/authService';

/**
 * useAuth — controller hook for authentication actions.
 * Wraps authService calls with loading/error/data state.
 * Client Component only (uses React state).
 */
export default function useAuth() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Generic wrapper that handles loading/error for any async service call.
   * Returns the parsed { success, message, data } envelope on success,
   * or null on failure (with error state set).
   */
  const execute = async (serviceFn, ...args) => {
    setLoading(true);
    setError(null);
    try {
      const result = await serviceFn(...args);
      return result;
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Something went wrong';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = (credentials) => execute(authService.register, credentials);
  const handleLogin = (credentials) => execute(authService.login, credentials);
  const handleLogout = () => execute(authService.logout);
  const handleForgotPassword = (data) => execute(authService.forgotPassword, data);
  const handleResetPassword = (token, data) => execute(authService.resetPassword, token, data);
  const handleChangePassword = (data) => execute(authService.changePassword, data);

  return {
    loading,
    error,
    register: handleRegister,
    login: handleLogin,
    logout: handleLogout,
    forgotPassword: handleForgotPassword,
    resetPassword: handleResetPassword,
    changePassword: handleChangePassword,
  };
}
