'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FixedExpensesTab } from './fixed-expenses-tab';
import { SpendingPlanTab } from './spending-plan-tab';
import { CardManagementTab } from './card-management-tab';
import { SalaryDetailsTab } from './salary-details-tab';

export function PlansContent() {
  const [activeTab, setActiveTab] = useState('fixed-expenses');

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="fixed-expenses">고정지출</TabsTrigger>
        <TabsTrigger value="spending-plan">지출계획</TabsTrigger>
        <TabsTrigger value="card-management">카드관리</TabsTrigger>
        <TabsTrigger value="salary-details">급여명세</TabsTrigger>
      </TabsList>

      <TabsContent value="fixed-expenses">
        <FixedExpensesTab />
      </TabsContent>

      <TabsContent value="spending-plan">
        <SpendingPlanTab />
      </TabsContent>

      <TabsContent value="card-management">
        <CardManagementTab />
      </TabsContent>

      <TabsContent value="salary-details">
        <SalaryDetailsTab />
      </TabsContent>
    </Tabs>
  );
}