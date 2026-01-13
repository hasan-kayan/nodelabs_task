// Shadcn theme utilities
export function toggleTheme() {
  const root = document.documentElement;
  const currentTheme = root.classList.contains('dark') ? 'dark' : 'light';
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
  
  root.classList.remove(currentTheme);
  root.classList.add(newTheme);
  
  return newTheme;
}
