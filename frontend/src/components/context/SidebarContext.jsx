// src/components/context/SidebarContext.jsx
import React, { createContext, useContext, useState } from 'react';

const SidebarContext = createContext({
  isSidebarBlocked: false,
  setIsSidebarBlocked: () => {}
});

export function SidebarProvider({ children }) {
  const [isSidebarBlocked, setIsSidebarBlocked] = useState(false);

  return (
    <SidebarContext.Provider value={{ isSidebarBlocked, setIsSidebarBlocked }}>
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  return useContext(SidebarContext);
}