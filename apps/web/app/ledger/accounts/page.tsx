import { MainLayout } from '@/components/layout/main-layout';
import { AccountsList } from '@/components/accounts/accounts-list';

export default function AccountsPage() {
  return (
    <MainLayout 
      title="계정" 
      subtitle="모든 계정과 잔액을 확인하고 관리하세요"
    >
      <AccountsList />
    </MainLayout>
  );
}