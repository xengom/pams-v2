import { nanoid } from 'nanoid';
import { accounts } from '@pams/database/schema';
import { AccountType } from '@pams/types';

const defaultAccounts = [
  // 자산 계정
  { code: '1100', name: '현금성자산', type: AccountType.ASSET },
  { code: '1101', name: '현금', type: AccountType.ASSET, parentCode: '1100' },
  { code: '1102', name: '메인입출금', type: AccountType.ASSET, parentCode: '1100' },
  { code: '1103', name: '네이버CMA', type: AccountType.ASSET, parentCode: '1100' },
  { code: '1104', name: '네이버포인트', type: AccountType.ASSET, parentCode: '1100' },
  { code: '1105', name: '화성지역화폐', type: AccountType.ASSET, parentCode: '1100' },
  
  { code: '1200', name: '저축자산', type: AccountType.ASSET },
  { code: '1201', name: '주택청약', type: AccountType.ASSET, parentCode: '1200' },
  { code: '1202', name: '적금1', type: AccountType.ASSET, parentCode: '1200' },
  
  { code: '1300', name: '투자자산', type: AccountType.ASSET },
  { code: '1301', name: '키움증권', type: AccountType.ASSET, parentCode: '1300', isPortfolio: true },
  { code: '1302', name: 'ISA', type: AccountType.ASSET, parentCode: '1300', isPortfolio: true },
  { code: '1303', name: 'NH금현물', type: AccountType.ASSET, parentCode: '1300', isPortfolio: true },
  { code: '1304', name: '코인', type: AccountType.ASSET, parentCode: '1300', isPortfolio: true },
  
  { code: '1400', name: '연금자산', type: AccountType.ASSET },
  { code: '1401', name: 'NH연금저축', type: AccountType.ASSET, parentCode: '1400' },
  { code: '1402', name: '퇴직연금DC', type: AccountType.ASSET, parentCode: '1400' },
  
  { code: '1500', name: '기타자산', type: AccountType.ASSET },
  { code: '1501', name: '우리증권', type: AccountType.ASSET, parentCode: '1500' },
  { code: '1502', name: '우리증권펀드', type: AccountType.ASSET, parentCode: '1500' },
  
  // 부채 계정
  { code: '2100', name: '신용카드', type: AccountType.LIABILITY },
  { code: '2101', name: '현대-네이버', type: AccountType.LIABILITY, parentCode: '2100' },
  { code: '2102', name: '국민-금포리', type: AccountType.LIABILITY, parentCode: '2100' },
  { code: '2103', name: '로카-모바일', type: AccountType.LIABILITY, parentCode: '2100' },
  { code: '2104', name: '로카-라이트', type: AccountType.LIABILITY, parentCode: '2100' },
  { code: '2105', name: '하나-MGS', type: AccountType.LIABILITY, parentCode: '2100' },
  { code: '2106', name: 'K패스', type: AccountType.LIABILITY, parentCode: '2100' },
  
  { code: '2200', name: '대출', type: AccountType.LIABILITY },
  { code: '2201', name: '할부', type: AccountType.LIABILITY, parentCode: '2200' },
  { code: '2202', name: '기회사다리', type: AccountType.LIABILITY, parentCode: '2200' },
  { code: '2299', name: '기타대출', type: AccountType.LIABILITY, parentCode: '2200' },
  
  // 자본 계정
  { code: '3100', name: '차액조정', type: AccountType.EQUITY },
  
  // 수익 계정
  { code: '4100', name: '노동수입', type: AccountType.REVENUE },
  { code: '4101', name: '월급', type: AccountType.REVENUE, parentCode: '4100' },
  { code: '4102', name: '상여금', type: AccountType.REVENUE, parentCode: '4100' },
  { code: '4103', name: '퇴직금', type: AccountType.REVENUE, parentCode: '4100' },
  { code: '4104', name: '부업수익', type: AccountType.REVENUE, parentCode: '4100' },
  
  { code: '4900', name: '기타수익', type: AccountType.REVENUE },
  { code: '4901', name: '잡수익', type: AccountType.REVENUE, parentCode: '4900' },
  { code: '4902', name: '재테크(카드/페이)', type: AccountType.REVENUE, parentCode: '4900' },
  
  // 비용 계정
  { code: '5100', name: '고정지출', type: AccountType.EXPENSE },
  { code: '5101', name: '교통비', type: AccountType.EXPENSE, parentCode: '5100' },
  { code: '5102', name: '주거비', type: AccountType.EXPENSE, parentCode: '5100' },
  { code: '5103', name: '보험료', type: AccountType.EXPENSE, parentCode: '5100' },
  { code: '5104', name: '구독', type: AccountType.EXPENSE, parentCode: '5100' },
  
  { code: '5200', name: '비고정지출', type: AccountType.EXPENSE },
  { code: '5201', name: '식비', type: AccountType.EXPENSE, parentCode: '5200' },
  { code: '5202', name: '카페/간식', type: AccountType.EXPENSE, parentCode: '5200' },
  { code: '5203', name: '주거비', type: AccountType.EXPENSE, parentCode: '5200' },
  { code: '5204', name: '통신비', type: AccountType.EXPENSE, parentCode: '5200' },
  { code: '5205', name: '의료비', type: AccountType.EXPENSE, parentCode: '5200' },
  { code: '5206', name: '자기계발비', type: AccountType.EXPENSE, parentCode: '5200' },
  { code: '5207', name: '여가유흥비', type: AccountType.EXPENSE, parentCode: '5200' },
  { code: '5208', name: '품위유지비', type: AccountType.EXPENSE, parentCode: '5200' },
  { code: '5209', name: '기타비용', type: AccountType.EXPENSE, parentCode: '5200' },
];

export async function seedAccounts(db: any) {
  const accountMap = new Map<string, string>();
  
  // 첫 번째 패스: 최상위 계정 생성
  for (const account of defaultAccounts.filter(a => !a.parentCode)) {
    const id = nanoid();
    accountMap.set(account.code, id);
    
    await db.insert(accounts).values({
      id,
      code: account.code,
      name: account.name,
      type: account.type,
      isPortfolio: account.isPortfolio || false,
    });
    
    console.log(`✓ Created parent account: ${account.code} - ${account.name}`);
  }
  
  // 두 번째 패스: 자식 계정 생성
  for (const account of defaultAccounts.filter(a => a.parentCode)) {
    const id = nanoid();
    const parentId = accountMap.get(account.parentCode!);
    
    await db.insert(accounts).values({
      id,
      code: account.code,
      name: account.name,
      type: account.type,
      parentId,
      isPortfolio: account.isPortfolio || false,
    });
    
    console.log(`✓ Created child account: ${account.code} - ${account.name} (parent: ${account.parentCode})`);
  }
  
  console.log(`\n🎉 Successfully seeded ${defaultAccounts.length} accounts!`);
}

// CLI execution
if (require.main === module) {
  console.log('🌱 Starting database seed...\n');
  
  // Since this is a development seed script, we'll output SQL statements for manual execution
  // This is safer than trying to connect directly to the D1 database
  
  const parentAccounts = defaultAccounts.filter(a => !a.parentCode);
  const childAccounts = defaultAccounts.filter(a => a.parentCode);
  
  console.log('-- SQL statements to insert accounts:\n');
  
  // Generate parent accounts first
  parentAccounts.forEach(account => {
    const id = nanoid();
    const isPortfolio = account.isPortfolio ? 1 : 0;
    console.log(`INSERT INTO accounts (id, code, name, type, is_portfolio) VALUES ('${id}', '${account.code}', '${account.name}', '${account.type}', ${isPortfolio});`);
  });
  
  console.log('\n-- Child accounts (run after parent accounts):');
  childAccounts.forEach(account => {
    const id = nanoid();
    const isPortfolio = account.isPortfolio ? 1 : 0;
    console.log(`INSERT INTO accounts (id, code, name, type, parent_id, is_portfolio) VALUES ('${id}', '${account.code}', '${account.name}', '${account.type}', (SELECT id FROM accounts WHERE code = '${account.parentCode}'), ${isPortfolio});`);
  });
  
  console.log('\n✨ Copy and paste the SQL statements above into your D1 database.');
  console.log('💡 You can execute them using: npx wrangler d1 execute pams-dev --command="[SQL_HERE]"');
}