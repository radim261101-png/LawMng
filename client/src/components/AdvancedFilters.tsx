import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { X, Filter, Plus, ChevronDown } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

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
  const [selectedColumn, setSelectedColumn] = useState<string>('');
  const [searchValue, setSearchValue] = useState('');
  const [searchByColumn, setSearchByColumn] = useState<Record<string, string>>({});

  const availableHeaders = useMemo(() => {
    return headers.filter(h => h && h.trim());
  }, [headers]);

  const uniqueValues = useMemo(() => {
    if (!selectedColumn || !records) return [];
    const values = new Set<string>();
    records.forEach(record => {
      const value = record[selectedColumn];
      if (value !== null && value !== undefined && value !== '') {
        values.add(String(value));
      }
    });
    return Array.from(values).sort();
  }, [selectedColumn, records]);

  const filteredValues = useMemo(() => {
    const columnSearch = selectedColumn ? searchByColumn[selectedColumn] || '' : searchValue;
    if (!columnSearch.trim()) return uniqueValues;
    const search = columnSearch.toLowerCase();
    return uniqueValues.filter(v => v.toLowerCase().includes(search));
  }, [uniqueValues, searchValue, searchByColumn, selectedColumn]);

  const activeFiltersCount = useMemo(() => {
    return Object.values(columnFilters).reduce((count, filter) => 
      count + (filter?.size || 0), 0
    );
  }, [columnFilters]);

  const handleToggleValue = (value: string) => {
    if (!selectedColumn) return;
    const currentFilter = columnFilters[selectedColumn] || new Set();
    const newFilter = new Set(currentFilter);
    
    if (newFilter.has(value)) {
      newFilter.delete(value);
    } else {
      newFilter.add(value);
    }
    
    onFilterChange(selectedColumn, newFilter);
  };

  const handleSelectAll = () => {
    if (!selectedColumn) return;
    const allValues = new Set(uniqueValues);
    onFilterChange(selectedColumn, allValues);
  };

  const handleClearColumn = () => {
    if (!selectedColumn) return;
    onFilterChange(selectedColumn, new Set());
  };

  const removeFilter = (columnName: string) => {
    onFilterChange(columnName, new Set());
    const newSearchByColumn = { ...searchByColumn };
    delete newSearchByColumn[columnName];
    setSearchByColumn(newSearchByColumn);
  };

  const handleColumnSearchChange = (column: string, value: string) => {
    setSearchByColumn(prev => ({
      ...prev,
      [column]: value
    }));
  };

  const currentColumnFilter = selectedColumn ? columnFilters[selectedColumn] : null;
  
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
          <PopoverContent className="w-[600px]" align="start" dir="rtl">
            <Tabs defaultValue="single" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="single" data-testid="tab-single-column">
                  فلترة عمود واحد
                </TabsTrigger>
                <TabsTrigger value="multiple" data-testid="tab-multiple-columns">
                  فلترة أعمدة متعددة
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="single" className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    اختر العمود
                  </label>
                  <Select 
                    value={selectedColumn} 
                    onValueChange={setSelectedColumn}
                  >
                    <SelectTrigger data-testid="select-filter-column">
                      <SelectValue placeholder="اختر عمود للفلترة..." />
                    </SelectTrigger>
                    <SelectContent>
                      {availableHeaders.map((header) => (
                        <SelectItem key={header} value={header}>
                          {header}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedColumn && (
                  <>
                    <div>
                      <Input
                        placeholder="بحث في القيم..."
                        value={searchByColumn[selectedColumn] || ''}
                        onChange={(e) => handleColumnSearchChange(selectedColumn, e.target.value)}
                        className="mb-2"
                        data-testid="input-search-filter-values"
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        {currentColumnFilter?.size || 0} محدد من {uniqueValues.length}
                      </span>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleSelectAll}
                          data-testid="button-select-all-values"
                        >
                          تحديد الكل
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleClearColumn}
                          data-testid="button-clear-column"
                        >
                          مسح
                        </Button>
                      </div>
                    </div>

                    <ScrollArea className="h-64 border rounded-md p-2">
                      <div className="space-y-2">
                        {filteredValues.length === 0 ? (
                          <p className="text-sm text-muted-foreground text-center py-4">
                            لا توجد قيم
                          </p>
                        ) : (
                          filteredValues.map((value) => (
                            <div
                              key={value}
                              className="flex items-center gap-2 p-2 rounded hover:bg-muted cursor-pointer"
                              onClick={() => handleToggleValue(value)}
                              data-testid={`filter-value-${value}`}
                            >
                              <Checkbox
                                checked={currentColumnFilter?.has(value) || false}
                                onCheckedChange={() => handleToggleValue(value)}
                              />
                              <span className="text-sm flex-1 break-all">
                                {value}
                              </span>
                            </div>
                          ))
                        )}
                      </div>
                    </ScrollArea>
                  </>
                )}
              </TabsContent>
              
              <TabsContent value="multiple" className="space-y-4">
                <ScrollArea className="h-[400px] pr-4">
                  <div className="space-y-4">
                    {availableHeaders.map((header) => {
                      const uniqueVals = getUniqueValuesForColumn(header);
                      const filteredVals = getFilteredValuesForColumn(header);
                      const filter = columnFilters[header];
                      const selectedCount = filter?.size || 0;
                      
                      return (
                        <div key={header} className="border rounded-lg p-3 bg-muted/20">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium text-sm">{header}</h4>
                            <Badge variant="outline" className="text-xs">
                              {selectedCount} / {uniqueVals.length}
                            </Badge>
                          </div>
                          
                          <Input
                            placeholder="بحث..."
                            value={searchByColumn[header] || ''}
                            onChange={(e) => handleColumnSearchChange(header, e.target.value)}
                            className="mb-2 h-8 text-sm"
                            data-testid={`input-search-${header}`}
                          />
                          
                          <div className="flex gap-2 mb-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 text-xs"
                              onClick={() => onFilterChange(header, new Set(uniqueVals))}
                              data-testid={`button-select-all-${header}`}
                            >
                              تحديد الكل
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 text-xs"
                              onClick={() => removeFilter(header)}
                              data-testid={`button-clear-${header}`}
                            >
                              مسح
                            </Button>
                          </div>
                          
                          <ScrollArea className="h-32 border rounded-md p-2 bg-background">
                            <div className="space-y-1">
                              {filteredVals.length === 0 ? (
                                <p className="text-xs text-muted-foreground text-center py-2">
                                  لا توجد قيم
                                </p>
                              ) : (
                                filteredVals.slice(0, 50).map((value) => (
                                  <div
                                    key={value}
                                    className="flex items-center gap-2 p-1.5 rounded hover:bg-muted cursor-pointer"
                                    onClick={() => {
                                      const currentFilter = columnFilters[header] || new Set();
                                      const newFilter = new Set(currentFilter);
                                      if (newFilter.has(value)) {
                                        newFilter.delete(value);
                                      } else {
                                        newFilter.add(value);
                                      }
                                      onFilterChange(header, newFilter);
                                    }}
                                    data-testid={`filter-${header}-value-${value}`}
                                  >
                                    <Checkbox
                                      checked={filter?.has(value) || false}
                                      onCheckedChange={() => {}}
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
                      );
                    })}
                  </div>
                </ScrollArea>
              </TabsContent>
            </Tabs>
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
