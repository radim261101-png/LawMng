import { useMemo } from "react";
import { useSheetRecords } from "@/hooks/useSheetRecords";
import { useSheets } from "@/contexts/SheetsContext";
import Navigation from "@/components/Navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { BarChart3, FileText, Scale, TrendingUp, PieChart, Activity } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart as RePieChart, Pie, Cell } from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82ca9d', '#ffc658', '#ff7c7c'];

export default function AnalyticsPage() {
  const { records, isLoading, headers } = useSheetRecords();
  const { activeSheet } = useSheets();

  const stats = useMemo(() => {
    const result = {
      total: records?.length || 0,
      byGovernorate: {} as Record<string, number>,
      byStatus: {} as Record<string, number>,
      byLawyer: {} as Record<string, number>,
      byCompany: {} as Record<string, number>,
      byLitigationLevel: {} as Record<string, number>,
      totalValue: 0,
      availableFields: new Set<string>(),
    };

    if (records && records.length > 0) {
      records.forEach((record) => {
        Object.keys(record).forEach(key => result.availableFields.add(key));

        const governorate = record['المحافظة'] || record['governorate'] || record['محافظة'];
        if (governorate && governorate.trim()) {
          result.byGovernorate[governorate] = (result.byGovernorate[governorate] || 0) + 1;
        }

        const company = record['الشركة'] || record['company'];
        if (company && company.trim()) {
          result.byCompany[company] = (result.byCompany[company] || 0) + 1;
        }

        const archived = record['أرشيف الدعاوي'] || record['archived'] || record['أرشيف'];
        if (archived && archived.trim()) {
          result.byStatus[archived] = (result.byStatus[archived] || 0) + 1;
        }

        const litigationLevel = record['مستوى التقاضي'] || record['litigationLevel'];
        if (litigationLevel && litigationLevel.trim()) {
          result.byLitigationLevel[litigationLevel] = (result.byLitigationLevel[litigationLevel] || 0) + 1;
        }

        const lawyer = record['المحامي القائم بآخر تحديث'] || 
                      record['lastUpdateLawyer'] ||
                      record['محامي إعداد التقرير'] ||
                      record['محامي حضور الجلسة'] ||
                      record['محامي الاستخراج'];
        if (lawyer && lawyer.trim()) {
          result.byLawyer[lawyer] = (result.byLawyer[lawyer] || 0) + 1;
        }

        const docValue = record['قيمة السند'] || record['documentValue'] || record['قيمة المستند'];
        if (docValue) {
          const value = parseFloat(docValue.toString().replace(/,/g, "").trim());
          if (!isNaN(value)) {
            result.totalValue += value;
          }
        }
      });
    }

    return result;
  }, [records]);

  const companyChartData = useMemo(() => {
    return Object.entries(stats.byCompany)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 8)
      .map(([name, value]) => ({ name, value }));
  }, [stats.byCompany]);

  const lawyerChartData = useMemo(() => {
    return Object.entries(stats.byLawyer)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 8)
      .map(([name, value]) => ({ name, value }));
  }, [stats.byLawyer]);

  const litigationChartData = useMemo(() => {
    return Object.entries(stats.byLitigationLevel)
      .map(([name, value]) => ({ name, value }));
  }, [stats.byLitigationLevel]);

  const governorateChartData = useMemo(() => {
    return Object.entries(stats.byGovernorate)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([name, value]) => ({ name, value }));
  }, [stats.byGovernorate]);

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <Navigation />
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-6">
          <h2 className="text-3xl font-bold text-foreground">تحليل البيانات المتقدم</h2>
          <p className="text-muted-foreground mt-1">
            إحصائيات ورؤى شاملة حول السجلات من: {activeSheet.name}
          </p>
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

            <div className="grid gap-6 md:grid-cols-2 mb-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    توزيع السجلات حسب الشركة
                  </CardTitle>
                  <CardDescription>أكثر 8 شركات من حيث عدد السجلات</CardDescription>
                </CardHeader>
                <CardContent>
                  {companyChartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={companyChartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="value" fill="#8884d8" name="عدد السجلات" />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-8">
                      لا توجد بيانات متاحة
                    </p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChart className="w-5 h-5" />
                    مستوى التقاضي
                  </CardTitle>
                  <CardDescription>توزيع القضايا حسب مستوى التقاضي</CardDescription>
                </CardHeader>
                <CardContent>
                  {litigationChartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <RePieChart>
                        <Pie
                          data={litigationChartData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {litigationChartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </RePieChart>
                    </ResponsiveContainer>
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-8">
                      لا توجد بيانات متاحة
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-2 mb-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="w-5 h-5" />
                    توزيع السجلات حسب المحامي
                  </CardTitle>
                  <CardDescription>أكثر 8 محامين من حيث عدد السجلات</CardDescription>
                </CardHeader>
                <CardContent>
                  {lawyerChartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={lawyerChartData} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" />
                        <YAxis dataKey="name" type="category" width={150} />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="value" fill="#82ca9d" name="عدد السجلات" />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-8">
                      لا توجد بيانات عن المحامين في السجلات الحالية
                    </p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Scale className="w-5 h-5" />
                    توزيع السجلات حسب المحافظة
                  </CardTitle>
                  <CardDescription>أكثر 10 محافظات من حيث عدد السجلات</CardDescription>
                </CardHeader>
                <CardContent>
                  {governorateChartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={governorateChartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="value" fill="#ffc658" name="عدد السجلات" />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-8">
                      لا توجد بيانات عن المحافظات
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>تفاصيل إضافية</CardTitle>
                <CardDescription>معلومات شاملة عن البيانات المتوفرة</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="p-4 rounded-lg bg-muted/50">
                    <div className="text-sm text-muted-foreground mb-1">عدد المحافظات</div>
                    <div className="text-2xl font-bold">{Object.keys(stats.byGovernorate).length}</div>
                  </div>
                  <div className="p-4 rounded-lg bg-muted/50">
                    <div className="text-sm text-muted-foreground mb-1">عدد حالات الأرشيف</div>
                    <div className="text-2xl font-bold">{Object.keys(stats.byStatus).length}</div>
                  </div>
                  <div className="p-4 rounded-lg bg-muted/50">
                    <div className="text-sm text-muted-foreground mb-1">متوسط القيمة</div>
                    <div className="text-2xl font-bold">
                      {stats.total > 0 ? Math.round(stats.totalValue / stats.total).toLocaleString("ar-EG") : 0}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </main>
    </div>
  );
}
