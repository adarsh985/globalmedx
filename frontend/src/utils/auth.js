/**
 * Auth utility methods for managing local user sessions
 */

export const setSession = (token, user) => {
  localStorage.setItem('globalmedx_token', token);
  localStorage.setItem('globalmedx_user', JSON.stringify(user));
};

export const clearSession = () => {
  localStorage.removeItem('globalmedx_token');
  localStorage.removeItem('globalmedx_user');
};

export const getCurrentUser = () => {
  const user = localStorage.getItem('globalmedx_user');
  try {
    return user ? JSON.parse(user) : null;
  } catch (e) {
    return null;
  }
};

export const isAuthenticated = () => {
  return !!localStorage.getItem('globalmedx_token');
};

export const hasRole = (allowedRoles) => {
  const user = getCurrentUser();
  if (!user) return false;
  return allowedRoles.includes(user.role);
};
