// src/utils/auth.js

const TOKEN_KEY = "access_token";

/**
 * Save JWT token to localStorage
 */
export function setToken(token) {
  if (!token) return;
  localStorage.setItem(TOKEN_KEY, token);
}

/**
 * Get JWT token from localStorage
 */
export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

/**
 * Remove JWT token (logout)
 */
export function removeToken() {
  localStorage.removeItem(TOKEN_KEY);
}

/**
 * Check if admin is authenticated
 * (presence of token is enough; backend validates it)
 */
export function isAuthenticated() {
  return Boolean(getToken());
}
