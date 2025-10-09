import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { X, Filter, ChevronDown, ChevronUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';

interface AdvancedFiltersProps {
  headers: string[];
  records: any[];
  columnFilters: Record<string, Set<string>>;
  onFilterChange: (columnName: string, values: Set<string>) => void;
  onClearAll: () => void;
}

export function AdvancedFilters({
  headers,
  records,
  columnFilters,
  onFilterChange,
  onClearAll,
}: AdvancedFiltersProps) {
  const [searchByColumn, setSearchByColumn] = useState<Record<string, string>>({});
  const [expandedColumns, setExpandedColumns] = useState<Set<string>>(new Set());
  const [columnSearch, setColumnSearch] = useState('');

  const availableHeaders = useMemo(() => {
    return headers.filter(h => h && h.trim());
  }, [headers]);

  const filteredHeaders = useMemo(() => {
    if (!columnSearch.trim()) return availableHeaders;
    const search = columnSearch.toLowerCase();
    const matching = availableHeaders.filter(h => h.toLowerCase().includes(search));
    
    const withActiveFilters = availableHeaders.filter(h => {
      const filter = columnFilters[h];
      return filter && filter.size > 0 && !matching.includes(h);
    });
    
    return [...withActiveFilters, ...matching];
  }, [availableHeaders, columnSearch, columnFilters]);

  const activeFiltersCount = useMemo(() => {
    return Object.values(columnFilters).reduce((count, filter) => 
      count + (filter?.size || 0), 0
    );
  }, [columnFilters]);

  const toggleColumn = (column: string) => {
    setExpandedColumns(prev => {
      const newSet = new Set(prev);
      if (newSet.has(column)) {
        newSet.delete(column);
      } else {
        newSet.add(column);
      }
      return newSet;
    });
  };

  const getUniqueValuesForColumn = (column: string) => {
    if (!column || !records) return [];
    const values = new Set<string>();
    records.forEach(record => {
      const value = record[column];
      if (value !== null && value !== undefined && value !== '') {
        values.add(String(value));
      }
    });
    return Array.from(values).sort();
  };

  const getFilteredValuesForColumn = (column: string) => {
    const values = getUniqueValuesForColumn(column);
    const search = searchByColumn[column] || '';
    if (!search.trim()) return values;
    const searchLower = search.toLowerCase();
    return values.filter(v => v.toLowerCase().includes(searchLower));
  };

  const handleColumnSearchChange = (column: string, value: string) => {
    setSearchByColumn(prev => ({
      ...prev,
      [column]: value
    }));
  };

  const removeFilter = (columnName: string) => {
    onFilterChange(columnName, new Set());
    const newSearchByColumn = { ...searchByColumn };
    delete newSearchByColumn[columnName];
    setSearchByColumn(newSearchByColumn);
  };

  const handleToggleValue = (column: string, value: string) => {
    const currentFilter = columnFilters[column] || new Set();
    const newFilter = new Set(currentFilter);
    if (newFilter.has(value)) {
      newFilter.delete(value);
    } else {
      newFilter.add(value);
    }
    onFilterChange(column, newFilter);
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-3">
        <Popover>
          <PopoverTrigger asChild>
            <Button 
              variant="outline" 
              className="gap-2"
              data-testid="button-open-filters"
            >
              <Filter className="w-4 h-4" />
              فلترة متقدمة
              {activeFiltersCount > 0 && (
                <Badge variant="secondary" className="mr-1">
                  {activeFiltersCount}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80" align="start" dir="rtl">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-sm">اختر الأعمدة للفلترة</h4>
                {activeFiltersCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onClearAll}
                    className="h-7 text-xs"
                    data-testid="button-clear-all-inline"
                  >
                    مسح الكل
                  </Button>
                )}
              </div>

              <Input
                placeholder="بحث في الأعمدة..."
                value={columnSearch}
                onChange={(e) => setColumnSearch(e.target.value)}
                className="h-8"
                data-testid="input-search-columns"
              />

              <ScrollArea className="h-96">
                <div className="space-y-2 pr-2">
                  {filteredHeaders.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      لا توجد أعمدة
                    </p>
                  ) : (
                    filteredHeaders.map((header) => {
                      const uniqueVals = getUniqueValuesForColumn(header);
                      const filteredVals = getFilteredValuesForColumn(header);
                      const filter = columnFilters[header];
                      const selectedCount = filter?.size || 0;
                      const isExpanded = expandedColumns.has(header);

                      return (
                        <div key={header} className="border rounded-md bg-muted/20">
                          <button
                            onClick={() => toggleColumn(header)}
                            className="w-full flex items-center justify-between p-2 hover:bg-muted/40 rounded-md transition-colors"
                            data-testid={`toggle-column-${header}`}
                          >
                            <div className="flex items-center gap-2 flex-1 text-right">
                              <span className="text-sm font-medium truncate">{header}</span>
                              {selectedCount > 0 && (
                                <Badge variant="default" className="text-xs h-5">
                                  {selectedCount}
                                </Badge>
                              )}
                            </div>
                            {isExpanded ? (
                              <ChevronUp className="w-4 h-4 flex-shrink-0" />
                            ) : (
                              <ChevronDown className="w-4 h-4 flex-shrink-0" />
                            )}
                          </button>

                          {isExpanded && (
                            <div className="p-2 pt-0 space-y-2">
                              <Input
                                placeholder="بحث في القيم..."
                                value={searchByColumn[header] || ''}
                                onChange={(e) => handleColumnSearchChange(header, e.target.value)}
                                className="h-8 text-sm"
                                onClick={(e) => e.stopPropagation()}
                                data-testid={`input-search-${header}`}
                              />

                              <div className="flex gap-1">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-6 text-xs flex-1"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onFilterChange(header, new Set(uniqueVals));
                                  }}
                                  data-testid={`button-select-all-${header}`}
                                >
                                  الكل
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-6 text-xs flex-1"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    removeFilter(header);
                                  }}
                                  data-testid={`button-clear-${header}`}
                                >
                                  مسح
                                </Button>
                              </div>

                              <ScrollArea className="h-40 border rounded-md p-2 bg-background">
                                <div className="space-y-1">
                                  {filteredVals.length === 0 ? (
                                    <p className="text-xs text-muted-foreground text-center py-2">
                                      لا توجد قيم
                                    </p>
                                  ) : (
                                    filteredVals.map((value) => (
                                      <div
                                        key={value}
                                        className="flex items-center gap-2 p-1 rounded hover:bg-muted cursor-pointer"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleToggleValue(header, value);
                                        }}
                                        data-testid={`filter-${header}-value-${value}`}
                                      >
                                        <Checkbox
                                          checked={filter?.has(value) || false}
                                          onCheckedChange={() => {}}
                                          className="pointer-events-none"
                                        />
                                        <span className="text-xs flex-1 break-all">
                                          {value}
                                        </span>
                                      </div>
                                    ))
                                  )}
                                </div>
                              </ScrollArea>
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </ScrollArea>
            </div>
          </PopoverContent>
        </Popover>

        {activeFiltersCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearAll}
            className="gap-2"
            data-testid="button-clear-all-filters"
          >
            <X className="w-4 h-4" />
            مسح كل الفلاتر
          </Button>
        )}
      </div>

      {Object.keys(columnFilters).some(k => columnFilters[k]?.size > 0) && (
        <div className="flex flex-wrap gap-2">
          {Object.entries(columnFilters).map(([columnName, values]) => {
            if (!values || values.size === 0) return null;
            return (
              <Badge
                key={columnName}
                variant="secondary"
                className="gap-2 py-1.5 px-3"
                data-testid={`active-filter-${columnName}`}
              >
                <span className="font-medium">{columnName}:</span>
                <span className="text-muted-foreground">
                  {values.size} {values.size === 1 ? 'قيمة' : 'قيم'}
                </span>
                <button
                  onClick={() => removeFilter(columnName)}
                  className="hover:bg-background/80 rounded-full p-0.5"
                  data-testid={`remove-filter-${columnName}`}
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            );
          })}
        </div>
      )}
    </div>
  );
}
