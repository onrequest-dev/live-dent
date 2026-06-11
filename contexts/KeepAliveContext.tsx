// contexts/KeepAliveContext.tsx
"use client";

import React, {
  createContext,
  useContext,
  useState,
  useRef,
  ReactNode,
} from "react";

interface CachedPage {
  path: string;
  element: ReactNode;
}

interface KeepAliveContextType {
  cachePage: (path: string, element: ReactNode) => void;
  getCachedPages: () => CachedPage[];
}

const KeepAliveContext = createContext<KeepAliveContextType>({
  cachePage: () => {},
  getCachedPages: () => [],
});

export const useKeepAlive = () => useContext(KeepAliveContext);

export function KeepAliveProvider({ children }: { children: ReactNode }) {
  const pagesCache = useRef<Map<string, ReactNode>>(new Map());
  const [, forceUpdate] = useState(0); // فقط لإعادة render عند التخزين

  const cachePage = (path: string, element: ReactNode) => {
    if (!pagesCache.current.has(path)) {
      pagesCache.current.set(path, element);
      forceUpdate((prev) => prev + 1); // تحديث الواجهة لإظهار الصفحة المخزنة
    }
  };

  const getCachedPages = (): CachedPage[] => {
    return Array.from(pagesCache.current.entries()).map(([path, element]) => ({
      path,
      element,
    }));
  };

  return (
    <KeepAliveContext.Provider value={{ cachePage, getCachedPages }}>
      {children}
    </KeepAliveContext.Provider>
  );
}
