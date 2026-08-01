import React from 'react';
import { cn } from '../../utils/cn';

type SkeletonProps = React.HTMLAttributes<HTMLDivElement>;

export const Skeleton: React.FC<SkeletonProps> = ({ className, ...props }) => {
  return <div className={cn('animate-pulse rounded-2xl bg-slate-200/80 dark:bg-slate-800/60', className)} {...props} />;
};
