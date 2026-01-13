export function formatDate(date) {
  return new Date(date).toLocaleDateString();
}

export function formatDateTime(date) {
  return new Date(date).toLocaleString();
}

export function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function isValidPhone(phone) {
  return /^\+?[1-9]\d{1,14}$/.test(phone);
}
