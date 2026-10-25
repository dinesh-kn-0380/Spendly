import React from 'react';
import { BalanceCard } from './BalanceCard';
import { QuickActions } from './QuickActions';
import { MonthlyOverviewCard } from './MonthlyOverviewCard';
import { RecentTransactions } from './RecentTransactions';
import { MiniSpendingBreakdown } from './MiniSpendingBreakdown';

interface DashboardViewProps {
  onViewAllHistory: () => void;
  onViewReports: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onViewAllHistory,
  onViewReports,
}) => {
  return (
    <div className="space-y-5 max-w-3xl mx-auto pb-16">
      {/* 1. Main Balance Card */}
      <BalanceCard />

      {/* 2. Quick Actions */}
      <QuickActions />

      {/* 3. Monthly Financial Overview */}
      <MonthlyOverviewCard />

      {/* 4. Mini Spending Breakdown (Top Categories) */}
      <MiniSpendingBreakdown onViewReports={onViewReports} />

      {/* 5. Recent GPay-style Transactions */}
      <RecentTransactions onViewAll={onViewAllHistory} />
    </div>
  );
};
