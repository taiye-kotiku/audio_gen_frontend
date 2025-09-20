const USER_KEY = "current_user";

// Save user to localStorage
export function saveCurrentUser(user) {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

// Get user from localStorage
export function getCurrentUser() {
  const user = localStorage.getItem(USER_KEY);
  return user ? JSON.parse(user) : null;
}

// Clear user from localStorage
export function clearCurrentUser() {
  localStorage.removeItem(USER_KEY);
}
