import React, { createContext, useContext, useState } from 'react';

const PageContext = createContext({
  activePage: 'home',
  navigateToPage: () => {}
});

export function PageProvider({ children }) {
  const [activePage, setActivePage] = useState('home');

  const navigateToPage = (page, sectionId = null) => {
    setActivePage(page);
    if (sectionId) {
      setTimeout(() => {
        const el = document.getElementById(sectionId);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 90);
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <PageContext.Provider value={{ activePage, navigateToPage }}>
      {children}
    </PageContext.Provider>
  );
}

export function usePage() {
  return useContext(PageContext);
}
