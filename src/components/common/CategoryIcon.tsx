import React from 'react';
import * as Icons from 'lucide-react';
import { LucideIcon } from 'lucide-react';

interface CategoryIconProps {
  name: string;
  className?: string;
  size?: number;
}

export const CategoryIcon: React.FC<CategoryIconProps> = ({ name, className = 'w-5 h-5', size }) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const IconComponent = (Icons as any)[name] as LucideIcon | undefined;

  if (!IconComponent) {
    const Fallback = Icons.Tag;
    return <Fallback className={className} size={size} />;
  }

  return <IconComponent className={className} size={size} />;
};

export const AVAILABLE_ICONS = [
  'Utensils',
  'Coffee',
  'ShoppingCart',
  'Bus',
  'Zap',
  'ShoppingBag',
  'Home',
  'GraduationCap',
  'Sparkles',
  'HeartPulse',
  'Film',
  'MoreHorizontal',
  'ArrowDownLeft',
  'Briefcase',
  'Gift',
  'RotateCcw',
  'Receipt',
  'Laptop',
  'TrendingUp',
  'Car',
  'Plane',
  'Smartphone',
  'Wifi',
  'CreditCard',
  'Smile',
  'Music',
  'Book',
  'Dumbbell',
  'Package',
  'PiggyBank',
  'Award',
  'Wrench',
];
