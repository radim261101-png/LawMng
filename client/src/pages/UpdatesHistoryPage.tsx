import { useState, useEffect } from 'react';
import { getUpdatesLog } from '@/lib/googleSheets';
import { useSheets } from '@/contexts/SheetsContext';
import Navigation from '@/components/Navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { History, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';

export default function UpdatesHistoryPage() {
  const [updates, setUpdates] = useState<any[]>([]);
  const [filteredUpdates, setFilteredUpdates] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const { activeSheet } = useSheets();

  useEffect(() => {
    fetchUpdates();
  }, [activeSheet]);

  useEffect(() => {
    if (searchQuery) {
      const filtered = updates.filter((update) =>
        Object.values(update).some((value) =>
          value?.toString().toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
      setFilteredUpdates(filtered);
    } else {
      setFilteredUpdates(updates);
    }
  }, [searchQuery, updates]);

  const fetchUpdates = async () => {
    try {
      setIsLoading(true);
      const data = await getUpdatesLog(activeSheet);
      setUpdates(data);
      setFilteredUpdates(data);
    } catch (error) {
      console.error('Error fetching updates:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <Navigation />
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-6">
          <h2 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <History className="w-8 h-8" />
            سجل التعديلات
          </h2>
          <p className="text-muted-foreground mt-1">
            جميع التعديلات التي تمت على السجلات من الشيت: {activeSheet.name}
          </p>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-24 w-full" />
            ))}
          </div>
        ) : (
          <>
            <div className="mb-6">
              <div className="relative">
                <Filter className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="بحث في التعديلات..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pr-10"
                  data-testid="input-search-updates"
                />
              </div>
            </div>

            {filteredUpdates.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-muted-foreground">لا توجد تعديلات مسجلة</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {filteredUpdates.map((update, index) => (
                  <Card key={update.id || index} data-testid={`update-card-${index}`}>
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-base">
                            سجل رقم: {update.serial || update['م'] || 'غير محدد'}
                          </CardTitle>
                          <CardDescription className="mt-1">
                            بواسطة: {update.updatedBy || update['المستخدم'] || 'غير معروف'} •{' '}
                            {update.updatedAt
                              ? new Date(update.updatedAt).toLocaleString('ar-EG')
                              : update['التاريخ'] || 'غير محدد'}
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pb-4">
                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex-1">
                          <span className="text-muted-foreground">الحقل: </span>
                          <span className="font-medium">{update.fieldName || update['الحقل'] || 'غير محدد'}</span>
                        </div>
                      </div>
                      <div className="mt-3 grid grid-cols-2 gap-4">
                        <div className="p-3 rounded-md bg-muted/50">
                          <div className="text-xs text-muted-foreground mb-1">القيمة القديمة</div>
                          <div className="text-sm font-medium break-words">
                            {update.oldValue || update['القيمة القديمة'] || '—'}
                          </div>
                        </div>
                        <div className="p-3 rounded-md bg-primary/10">
                          <div className="text-xs text-muted-foreground mb-1">القيمة الجديدة</div>
                          <div className="text-sm font-medium break-words">
                            {update.newValue || update['القيمة الجديدة'] || '—'}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
