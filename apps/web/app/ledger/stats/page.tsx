import { MainLayout } from '@/components/layout/main-layout';
import { StatisticsOverview } from '@/components/stats/statistics-overview';

export default function StatsPage() {
  return (
    <MainLayout 
      title="지출통계" 
      subtitle="년, 월별 수익과 비용 계정의 통계를 확인하세요"
    >
      <StatisticsOverview />
    </MainLayout>
  );
}