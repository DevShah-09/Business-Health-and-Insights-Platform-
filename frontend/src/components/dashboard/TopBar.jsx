import React, { useState, useEffect } from 'react';

export function TopBar() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains('dark'));
  }, []);

  const toggleTheme = () => {
    const root = document.documentElement;
    if (root.classList.contains('dark')) {
      root.classList.remove('dark');
      setIsDark(false);
    } else {
      root.classList.add('dark');
      setIsDark(true);
    }
  };

  return (
    <header className="bg-surface/80 backdrop-blur-xl sticky top-0 z-40 flex justify-end items-center px-8 py-4 w-full border-b border-surface-border/40 shadow-[0_4px_30px_rgba(0,0,0,0.03)] dark:shadow-[0_4px_30px_rgba(0,0,0,0.2)]">
      <div className="flex items-center gap-4">
        <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-surface transition-colors" title="Toggle Dark Mode">
          {isDark ? <span className="material-symbols-outlined text-surface-muted-foreground">light_mode</span> : <span className="material-symbols-outlined text-surface-muted-foreground">dark_mode</span>}
        </button>
        <button className="p-2 rounded-full hover:bg-surface transition-colors">
          <span className="material-symbols-outlined text-surface-muted-foreground">notifications</span>
        </button>
        <button className="p-2 rounded-full hover:bg-surface transition-colors">
          <span className="material-symbols-outlined text-surface-muted-foreground">settings</span>
        </button>
        <div className="flex items-center gap-3 pl-4 border-l border-surface-border/50">
          <div className="text-right">
            <p className="text-sm font-bold text-surface-foreground">Dev Shah</p>
            <p className="text-[10px] text-surface-muted-foreground uppercase font-bold">Admin</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-brand flex items-center justify-center text-white font-bold text-sm shadow-sm">
            DS
          </div>
        </div>
      </div>
    </header>
  );
}
