import { useMemo } from "react";
import { useSheetRecords } from "@/hooks/useSheetRecords";
import Navigation from "@/components/Navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { BarChart3, FileText, Scale, TrendingUp } from "lucide-react";

export default function AnalyticsPage() {
  const { records, isLoading, headers } = useSheetRecords();

  const stats = useMemo(() => {
    const result = {
      total: records?.length || 0,
      byGovernorate: {} as Record<string, number>,
      byStatus: {} as Record<string, number>,
      byLawyer: {} as Record<string, number>,
      byCompany: {} as Record<string, number>,
      totalValue: 0,
      availableFields: new Set<string>(),
    };

    if (records && records.length > 0) {
      // Log first record to see available fields
      console.log('First record fields:', Object.keys(records[0]));
      
      records.forEach((record) => {
        // Track all available fields
        Object.keys(record).forEach(key => result.availableFields.add(key));

        // Check multiple possible field names for governorate
        const governorate = record['المحافظة'] || record['governorate'] || record['محافظة'];
        if (governorate && governorate.trim()) {
          result.byGovernorate[governorate] = (result.byGovernorate[governorate] || 0) + 1;
        }

        // Company
        const company = record['الشركة'] || record['company'];
        if (company && company.trim()) {
          result.byCompany[company] = (result.byCompany[company] || 0) + 1;
        }

        // Status/Archive
        const archived = record['أرشيف الدعاوي'] || record['archived'] || record['أرشيف'];
        if (archived && archived.trim()) {
          result.byStatus[archived] = (result.byStatus[archived] || 0) + 1;
        }

        // Lawyer - check multiple possible fields
        const lawyer = record['المحامي القائم بآخر تحديث'] || 
                      record['lastUpdateLawyer'] ||
                      record['محامي إعداد التقرير'] ||
                      record['محامي حضور الجلسة'] ||
                      record['محامي الاستخراج'];
        if (lawyer && lawyer.trim()) {
          result.byLawyer[lawyer] = (result.byLawyer[lawyer] || 0) + 1;
        }

        // Document value
        const docValue = record['قيمة السند'] || record['documentValue'] || record['قيمة المستند'];
        if (docValue) {
          const value = parseFloat(docValue.toString().replace(/,/g, "").trim());
          if (!isNaN(value)) {
            result.totalValue += value;
          }
        }
      });
    }

    console.log('Analytics stats:', {
      total: result.total,
      governoratesCount: Object.keys(result.byGovernorate).length,
      lawyersCount: Object.keys(result.byLawyer).length,
      companiesCount: Object.keys(result.byCompany).length,
      availableFields: Array.from(result.availableFields)
    });

    return result;
  }, [records]);

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <Navigation />
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-6">
          <h2 className="text-3xl font-bold text-foreground">تحليل البيانات</h2>
          <p className="text-muted-foreground mt-1">إحصائيات ورؤى حول السجلات القانونية من Google Sheets</p>
        </div>

        {isLoading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-32 w-full" />
            ))}
          </div>
        ) : (
          <>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">إجمالي السجلات</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold" data-testid="text-total-records">{stats.total}</div>
                  <p className="text-xs text-muted-foreground">عدد السجلات الكلي</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">الشركات</CardTitle>
                  <Scale className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold" data-testid="text-company-count">
                    {Object.keys(stats.byCompany).length}
                  </div>
                  <p className="text-xs text-muted-foreground">عدد الشركات المختلفة</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">المحامون</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold" data-testid="text-lawyer-count">
                    {Object.keys(stats.byLawyer).length}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {Object.keys(stats.byLawyer).length > 0 ? 'عدد المحامين العاملين' : 'لا توجد بيانات'}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">القيمة الإجمالية</CardTitle>
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold" data-testid="text-total-value">
                    {stats.totalValue.toLocaleString("ar-EG")}
                  </div>
                  <p className="text-xs text-muted-foreground">إجمالي قيمة المستندات</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>توزيع السجلات حسب الشركة</CardTitle>
                  <CardDescription>عدد السجلات لكل شركة</CardDescription>
                </CardHeader>
                <CardContent>
                  {Object.keys(stats.byCompany).length > 0 ? (
                    <div className="space-y-4">
                      {Object.entries(stats.byCompany)
                        .sort(([, a], [, b]) => b - a)
                        .slice(0, 10)
                        .map(([company, count]) => (
                          <div key={company} className="flex items-center">
                            <div className="flex-1">
                              <p className="text-sm font-medium">{company}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-primary"
                                  style={{ width: `${(count / stats.total) * 100}%` }}
                                />
                              </div>
                              <span className="text-sm font-bold w-8 text-left">{count}</span>
                            </div>
                          </div>
                        ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-8">
                      لا توجد بيانات متاحة
                    </p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>توزيع السجلات حسب المحامي</CardTitle>
                  <CardDescription>عدد السجلات لكل محامي</CardDescription>
                </CardHeader>
                <CardContent>
                  {Object.keys(stats.byLawyer).length > 0 ? (
                    <div className="space-y-4">
                      {Object.entries(stats.byLawyer)
                        .sort(([, a], [, b]) => b - a)
                        .slice(0, 10)
                        .map(([lawyer, count]) => (
                          <div key={lawyer} className="flex items-center">
                            <div className="flex-1">
                              <p className="text-sm font-medium">{lawyer}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-primary"
                                  style={{ width: `${(count / stats.total) * 100}%` }}
                                />
                              </div>
                              <span className="text-sm font-bold w-8 text-left">{count}</span>
                            </div>
                          </div>
                        ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-8">
                      لا توجد بيانات عن المحامين في السجلات الحالية
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
