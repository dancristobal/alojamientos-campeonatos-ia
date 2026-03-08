import { useEffect, useState } from 'react';

type Theme = 'light' | 'dark' | 'system';

export const useTheme = () => {
    const [theme, setTheme] = useState<Theme>(() => {
        const stored = localStorage.getItem('app-theme') as Theme;
        return stored || 'system';
    });

    useEffect(() => {
        const root = window.document.documentElement;
        
        const applyTheme = (t: Theme) => {
            root.classList.remove('light', 'dark');
            
            if (t === 'system') {
                const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
                root.classList.add(systemTheme);
                // Also set color-scheme for scrollbars and system UI
                root.style.setProperty('color-scheme', systemTheme);
            } else {
                root.classList.add(t);
                root.style.setProperty('color-scheme', t);
            }
            
            localStorage.setItem('app-theme', t);
        };

        applyTheme(theme);

        // Listener for system changes if in system mode
        if (theme === 'system') {
            const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
            const handleChange = () => applyTheme('system');
            mediaQuery.addEventListener('change', handleChange);
            return () => mediaQuery.removeEventListener('change', handleChange);
        }
    }, [theme]);

    return { theme, setTheme };
};
