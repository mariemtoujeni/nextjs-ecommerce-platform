import { useState, useMemo } from 'react';

export function useLocalTabs<T extends string>(tabs: T[], defaultTab: T) {
  const [currentTab, setCurrentTab] = useState<T>(defaultTab);

  const items = useMemo(
    () =>
      tabs.map((tab) => ({
        key: tab,
        isActive: tab === currentTab,
        switchTo: () => setCurrentTab(tab),
      })),
    [tabs, currentTab]
  );

  return { currentTab, items, setTab: setCurrentTab };
}
