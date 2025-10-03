import { useQuery } from "@tanstack/react-query";
import Navigation from "@/components/Navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ValuRecord } from "@shared/schema";
import { BarChart3, FileText, Scale, TrendingUp } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function AnalyticsPage() {
  const { data: records, isLoading } = useQuery<ValuRecord[]>({
    queryKey: ["/api/records"],
  });

  const stats = {
    total: records?.length || 0,
    byGovernorate: {} as Record<string, number>,
    byStatus: {} as Record<string, number>,
    byLawyer: {} as Record<string, number>,
    totalValue: 0,
  };

  if (records) {
    records.forEach((record) => {
      if (record.governorate) {
        stats.byGovernorate[record.governorate] = (stats.byGovernorate[record.governorate] || 0) + 1;
      }
      if (record.archived) {
        stats.byStatus[record.archived] = (stats.byStatus[record.archived] || 0) + 1;
      }
      if (record.lastUpdateLawyer) {
        stats.byLawyer[record.lastUpdateLawyer] = (stats.byLawyer[record.lastUpdateLawyer] || 0) + 1;
      }
      if (record.documentValue) {
        const value = parseFloat(record.documentValue.replace(/,/g, ""));
        if (!isNaN(value)) {
          stats.totalValue += value;
        }
      }
    });
  }

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <Navigation />
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-6">
          <h2 className="text-3xl font-bold text-foreground">تحليل البيانات</h2>
          <p className="text-muted-foreground mt-1">إحصائيات ورؤى حول السجلات القانونية</p>
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
                  <CardTitle className="text-sm font-medium">المحافظات</CardTitle>
                  <Scale className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold" data-testid="text-governorate-count">
                    {Object.keys(stats.byGovernorate).length}
                  </div>
                  <p className="text-xs text-muted-foreground">عدد المحافظات المختلفة</p>
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
                  <p className="text-xs text-muted-foreground">عدد المحامين العاملين</p>
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
                  <CardTitle>توزيع السجلات حسب المحافظة</CardTitle>
                  <CardDescription>عدد السجلات في كل محافظة</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {Object.entries(stats.byGovernorate)
                      .sort(([, a], [, b]) => b - a)
                      .slice(0, 10)
                      .map(([gov, count]) => (
                        <div key={gov} className="flex items-center">
                          <div className="flex-1">
                            <p className="text-sm font-medium">{gov}</p>
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
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>توزيع السجلات حسب المحامي</CardTitle>
                  <CardDescription>عدد السجلات لكل محامي</CardDescription>
                </CardHeader>
                <CardContent>
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
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
