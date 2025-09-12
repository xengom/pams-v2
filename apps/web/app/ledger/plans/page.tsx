import { MainLayout } from '@/components/layout/main-layout';
import { PlansContent } from '@/components/plans/plans-content';

export default function PlansPage() {
  return (
    <MainLayout 
      title="계획 관리" 
      subtitle="고정지출, 지출계획, 카드관리, 급여명세를 관리하세요"
    >
      <PlansContent />
    </MainLayout>
  );
}

