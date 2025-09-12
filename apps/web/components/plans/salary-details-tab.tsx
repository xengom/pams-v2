'use client';

import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, Edit, Save, X, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { graphqlClient, GET_SALARY_DETAIL, CREATE_SALARY_DETAIL, UPDATE_SALARY_DETAIL } from '@/lib/graphql';
import { formatCurrency } from '@/lib/utils';

interface SalaryDetail {
  id: string;
  year: number;
  month: number;
  baseSalary?: number;
  mealAllowance?: number;
  overtimePay?: number;
  nightPay?: number;
  vacationPay?: number;
  incentive?: number;
  nationalPension?: number;
  healthInsurance?: number;
  employmentInsurance?: number;
  longTermCare?: number;
  incomeTax?: number;
  localTax?: number;
  totalGross?: number;
  totalDeduction?: number;
  netPay?: number;
  createdAt: string;
}

type SalaryDetailForm = Omit<SalaryDetail, 'id' | 'year' | 'month' | 'createdAt'>;

const SALARY_FIELDS = {
  income: {
    title: '수입 항목',
    fields: [
      { key: 'baseSalary', label: '기본급' },
      { key: 'mealAllowance', label: '식대' },
      { key: 'overtimePay', label: '연장근로수당' },
      { key: 'nightPay', label: '야간근로수당' },
      { key: 'vacationPay', label: '연차수당' },
      { key: 'incentive', label: '성과급' },
    ] as const
  },
  deduction: {
    title: '공제 항목',
    fields: [
      { key: 'nationalPension', label: '국민연금' },
      { key: 'healthInsurance', label: '건강보험' },
      { key: 'employmentInsurance', label: '고용보험' },
      { key: 'longTermCare', label: '장기요양보험료' },
      { key: 'incomeTax', label: '소득세' },
      { key: 'localTax', label: '지방소득세' },
    ] as const
  }
};

export function SalaryDetailsTab() {
  const [currentDate, setCurrentDate] = useState(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() + 1 };
  });
  
  const [salaryDetail, setSalaryDetail] = useState<SalaryDetail | null>(null);
  const [formData, setFormData] = useState<SalaryDetailForm>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadSalaryDetail();
  }, [currentDate]);

  const loadSalaryDetail = async () => {
    try {
      setIsLoading(true);
      const data = await graphqlClient.request<{ salaryDetail: SalaryDetail | null }>(
        GET_SALARY_DETAIL,
        {
          year: currentDate.year,
          month: currentDate.month,
        }
      );
      
      setSalaryDetail(data.salaryDetail);
      
      if (data.salaryDetail) {
        const { id, year, month, createdAt, ...formFields } = data.salaryDetail;
        setFormData(formFields);
      } else {
        setFormData({});
      }
      
    } catch (error) {
      console.error('Error loading salary detail:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      if (direction === 'next') {
        return prev.month === 12 
          ? { year: prev.year + 1, month: 1 }
          : { year: prev.year, month: prev.month + 1 };
      } else {
        return prev.month === 1
          ? { year: prev.year - 1, month: 12 }
          : { year: prev.year, month: prev.month - 1 };
      }
    });
  };

  const updateField = (field: keyof SalaryDetailForm, value: number) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value };
      
      // Auto-calculate totals
      const incomeTotal = SALARY_FIELDS.income.fields.reduce(
        (sum, f) => sum + (updated[f.key] || 0), 0
      );
      const deductionTotal = SALARY_FIELDS.deduction.fields.reduce(
        (sum, f) => sum + (updated[f.key] || 0), 0
      );
      
      updated.totalGross = incomeTotal;
      updated.totalDeduction = deductionTotal;
      updated.netPay = incomeTotal - deductionTotal;
      
      return updated;
    });
  };

  const startEditing = () => {
    setIsEditing(true);
  };

  const cancelEditing = () => {
    setIsEditing(false);
    if (salaryDetail) {
      const { id, year, month, createdAt, ...formFields } = salaryDetail;
      setFormData(formFields);
    }
  };

  const saveSalaryDetail = async () => {
    try {
      setIsSaving(true);
      
      const input = {
        year: currentDate.year,
        month: currentDate.month,
        ...formData,
      };
      
      if (salaryDetail) {
        // Update existing
        await graphqlClient.request(UPDATE_SALARY_DETAIL, {
          id: salaryDetail.id,
          input,
        });
      } else {
        // Create new
        await graphqlClient.request(CREATE_SALARY_DETAIL, {
          input,
        });
      }
      
      setIsEditing(false);
      loadSalaryDetail();
      
    } catch (error: any) {
      console.error('Error saving salary detail:', error);
      alert(error.message || '저장 중 오류가 발생했습니다.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">급여명세를 불러오는 중...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Month Navigation */}
      <div className="flex items-center justify-between">
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateMonth('prev')}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            <div className="text-center min-w-[120px]">
              <h4 className="font-semibold">
                {currentDate.year}년 {currentDate.month}월
              </h4>
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateMonth('next')}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          
          {!isEditing ? (
            <Button onClick={startEditing}>
              <Edit className="h-4 w-4 mr-2" />
              {salaryDetail ? '수정' : '입력'}
            </Button>
          ) : (
            <div className="flex space-x-2">
              <Button onClick={saveSalaryDetail} disabled={isSaving}>
                <Save className="h-4 w-4 mr-2" />
                {isSaving ? '저장 중...' : '저장'}
              </Button>
              <Button variant="outline" onClick={cancelEditing} disabled={isSaving}>
                <X className="h-4 w-4 mr-2" />
                취소
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">지급총액</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(formData.totalGross || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              세전 총 수입
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">공제총액</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(formData.totalDeduction || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              세금 및 보험료
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">차인지급액</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(formData.netPay || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              실수령액
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Salary Detail Form */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Income Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <DollarSign className="h-5 w-5 mr-2 text-green-600" />
              {SALARY_FIELDS.income.title}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {SALARY_FIELDS.income.fields.map((field) => (
              <div key={field.key} className="flex items-center justify-between">
                <label className="text-sm font-medium flex-1">
                  {field.label}
                </label>
                <div className="flex items-center space-x-2">
                  {isEditing ? (
                    <Input
                      type="number"
                      value={formData[field.key] || ''}
                      onChange={(e) => updateField(field.key, Number(e.target.value) || 0)}
                      placeholder="0"
                      className="w-32 text-right"
                    />
                  ) : (
                    <span className="font-medium text-right w-32">
                      {formatCurrency(formData[field.key] || 0)}
                    </span>
                  )}
                </div>
              </div>
            ))}
            
            <div className="border-t pt-4 mt-4">
              <div className="flex items-center justify-between font-semibold">
                <span>지급총액</span>
                <span className="text-green-600">
                  {formatCurrency(formData.totalGross || 0)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Deduction Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <DollarSign className="h-5 w-5 mr-2 text-red-600" />
              {SALARY_FIELDS.deduction.title}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {SALARY_FIELDS.deduction.fields.map((field) => (
              <div key={field.key} className="flex items-center justify-between">
                <label className="text-sm font-medium flex-1">
                  {field.label}
                </label>
                <div className="flex items-center space-x-2">
                  {isEditing ? (
                    <Input
                      type="number"
                      value={formData[field.key] || ''}
                      onChange={(e) => updateField(field.key, Number(e.target.value) || 0)}
                      placeholder="0"
                      className="w-32 text-right"
                    />
                  ) : (
                    <span className="font-medium text-right w-32">
                      {formatCurrency(formData[field.key] || 0)}
                    </span>
                  )}
                </div>
              </div>
            ))}
            
            <div className="border-t pt-4 mt-4">
              <div className="flex items-center justify-between font-semibold">
                <span>공제총액</span>
                <span className="text-red-600">
                  {formatCurrency(formData.totalDeduction || 0)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Net Pay Summary */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-6">
          <div className="text-center">
            <h3 className="text-lg font-medium text-blue-900 mb-2">
              {currentDate.year}년 {currentDate.month}월 실수령액
            </h3>
            <div className="text-4xl font-bold text-blue-600 mb-2">
              {formatCurrency(formData.netPay || 0)}
            </div>
            <p className="text-sm text-blue-700">
              지급총액 {formatCurrency(formData.totalGross || 0)} - 
              공제총액 {formatCurrency(formData.totalDeduction || 0)}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Empty State */}
      {!salaryDetail && !isEditing && (
        <Card className="p-8 text-center">
          <DollarSign className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground mb-4">
            {currentDate.year}년 {currentDate.month}월 급여명세가 없습니다.
          </p>
          <Button onClick={startEditing}>
            급여명세 입력하기
          </Button>
        </Card>
      )}
    </div>
  );
}