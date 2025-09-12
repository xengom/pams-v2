import { MainLayout } from '@/components/layout/main-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, Construction } from 'lucide-react';

export default function PortfolioDashboard() {
  return (
    <MainLayout 
      title="투자관리" 
      subtitle="포트폴리오 관리 시스템"
    >
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <div className="mx-auto w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
              <Construction className="h-8 w-8 text-yellow-600" />
            </div>
            <CardTitle className="text-xl">준비중입니다</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              투자관리 기능은 현재 개발중입니다.
            </p>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>📈 포트폴리오 추적</p>
              <p>📊 수익률 분석</p>
              <p>💰 자산 배분</p>
              <p>📋 투자 계획</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}