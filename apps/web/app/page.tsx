'use client';

import Link from 'next/link';
import { MainLayout } from '@/components/layout/main-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, TrendingUp, Wallet, BarChart3 } from 'lucide-react';

export default function HomePage() {
  return (
    <MainLayout 
      title="PAMS" 
      subtitle="개인 자산 관리 시스템에 오신 것을 환영합니다"
    >
      <div className="space-y-8">
        {/* Main Services */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 가계부 */}
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <Link href="/ledger/transactions">
              <CardHeader className="text-center pb-4">
                <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                  <BookOpen className="h-8 w-8 text-blue-600" />
                </div>
                <CardTitle className="text-xl">가계부</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-muted-foreground mb-4">
                  일상의 수입과 지출을 체계적으로 관리하고 분석하세요
                </p>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="bg-gray-50 rounded-lg p-2">
                    <Wallet className="h-4 w-4 mx-auto mb-1 text-gray-600" />
                    <span className="text-gray-600">거래내역</span>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-2">
                    <BarChart3 className="h-4 w-4 mx-auto mb-1 text-gray-600" />
                    <span className="text-gray-600">통계분석</span>
                  </div>
                </div>
              </CardContent>
            </Link>
          </Card>

          {/* 투자관리 */}
          <Card className="hover:shadow-lg transition-shadow cursor-pointer opacity-60">
            <Link href="/portfolio/dashboard">
              <CardHeader className="text-center pb-4">
                <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <TrendingUp className="h-8 w-8 text-green-600" />
                </div>
                <CardTitle className="text-xl">투자관리</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-muted-foreground mb-4">
                  포트폴리오를 추적하고 투자 성과를 분석하세요
                </p>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-2">
                  <span className="text-yellow-700 text-sm font-medium">🚧 준비중</span>
                </div>
              </CardContent>
            </Link>
          </Card>
        </div>

        {/* Quick Access */}
        <div className="border-t pt-8">
          <h3 className="text-lg font-semibold mb-4">빠른 접근</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button variant="outline" asChild className="h-20 flex-col">
              <Link href="/ledger/transactions">
                <Wallet className="h-5 w-5 mb-1" />
                거래내역
              </Link>
            </Button>
            <Button variant="outline" asChild className="h-20 flex-col">
              <Link href="/ledger/accounts">
                <BookOpen className="h-5 w-5 mb-1" />
                계정관리
              </Link>
            </Button>
            <Button variant="outline" asChild className="h-20 flex-col">
              <Link href="/ledger/plans">
                <BarChart3 className="h-5 w-5 mb-1" />
                계획관리
              </Link>
            </Button>
            <Button variant="outline" asChild className="h-20 flex-col">
              <Link href="/ledger/stats">
                <TrendingUp className="h-5 w-5 mb-1" />
                지출통계
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}