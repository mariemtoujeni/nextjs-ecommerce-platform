import React from 'react';
import { Button } from './ui/button';

type Props = {
  titles: string[];
  activeIndex: number;
  onChange: (i: number) => void;
};

export function TabSwitcher({ titles, activeIndex, onChange }: Props) {
  return (
    <div className="flex gap-2">
      {titles.map((title, i) => (
        <Button
          key={i}
          onClick={() => onChange(i)}
          variant={i === activeIndex ? 'default' : 'secondary'}
        >
          {title}
        </Button>
      ))}
    </div>
  );
}
