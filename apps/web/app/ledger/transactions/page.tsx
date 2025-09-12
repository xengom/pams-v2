import { MainLayout } from '@/components/layout/main-layout';
import { TransactionsList } from '@/components/transactions/transactions-list';

export default function TransactionsPage() {
  return (
    <MainLayout 
      title="거래내역" 
      subtitle="모든 거래내역을 확인하고 관리하세요"
    >
      <TransactionsList />
    </MainLayout>
  );
}