import { useState, useEffect, useMemo, useCallback } from 'react';
import { getUpdatesLog } from '@/lib/googleSheets';
import { useSheets } from '@/contexts/SheetsContext';
import Navigation from '@/components/Navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { History, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { RecordsPagination } from '@/components/RecordsPagination';

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export default function UpdatesHistoryPage() {
  const [updates, setUpdates] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);
  const { activeSheet } = useSheets();

  useEffect(() => {
    fetchUpdates();
  }, [activeSheet]);

  const filteredUpdates = useMemo(() => {
    if (!debouncedSearchQuery.trim()) return updates;
    
    const searchLower = debouncedSearchQuery.toLowerCase();
    return updates.filter((update) =>
      Object.values(update).some((value) =>
        value?.toString().toLowerCase().includes(searchLower)
      )
    );
  }, [debouncedSearchQuery, updates]);

  const totalPages = Math.max(1, Math.ceil(filteredUpdates.length / itemsPerPage));

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  const paginatedUpdates = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredUpdates.slice(startIndex, endIndex);
  }, [filteredUpdates, currentPage, itemsPerPage]);

  const fetchUpdates = async () => {
    try {
      setIsLoading(true);
      const data = await getUpdatesLog(activeSheet);
      setUpdates(data);
    } catch (error) {
      console.error('Error fetching updates:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleItemsPerPageChange = useCallback((items: number) => {
    setItemsPerPage(items);
    setCurrentPage(1);
  }, []);

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
            <div className="mb-6 flex items-center justify-between gap-4">
              <div className="relative max-w-md flex-1">
                <Filter className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="بحث في التعديلات..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pr-10"
                  data-testid="input-search-updates"
                />
              </div>
              {searchQuery && (
                <span className="text-sm text-muted-foreground whitespace-nowrap">
                  {filteredUpdates.length} نتيجة
                </span>
              )}
            </div>

            {filteredUpdates.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-muted-foreground">
                    {searchQuery ? "لا توجد نتائج للبحث" : "لا توجد تعديلات مسجلة"}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <>
                <div className="space-y-4">
                  {paginatedUpdates.map((update, index) => (
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

                <RecordsPagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                  itemsPerPage={itemsPerPage}
                  onItemsPerPageChange={handleItemsPerPageChange}
                  totalItems={filteredUpdates.length}
                  className="mt-6"
                />
              </>
            )}
          </>
        )}
      </main>
    </div>
  );
}
