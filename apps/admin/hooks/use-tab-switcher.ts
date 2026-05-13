'use client';

import { useState } from "react";

export function useTabSwitcher(initialIndex = 0) {
  const [activeIndex, setActiveIndex] = useState(initialIndex);
  return { activeIndex, setActiveIndex };
}
