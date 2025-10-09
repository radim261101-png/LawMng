import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Filter, X } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ColumnFilterProps {
  columnName: string;
  allValues: any[];
  selectedValues: Set<string>;
  onFilterChange: (values: Set<string>) => void;
}

export function ColumnFilter({ columnName, allValues, selectedValues, onFilterChange }: ColumnFilterProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const uniqueValues = useMemo(() => {
    const values = allValues
      .filter(val => val !== null && val !== undefined && val !== '')
      .map(val => String(val));
    return Array.from(new Set(values)).sort();
  }, [allValues]);

  const filteredValues = useMemo(() => {
    if (!searchTerm) return uniqueValues;
    return uniqueValues.filter(val => 
      val.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [uniqueValues, searchTerm]);

  const handleToggleAll = (checked: boolean) => {
    if (checked) {
      onFilterChange(new Set(uniqueValues));
    } else {
      onFilterChange(new Set());
    }
  };

  const handleToggleValue = (value: string) => {
    const newSelected = new Set(selectedValues);
    if (newSelected.has(value)) {
      newSelected.delete(value);
    } else {
      newSelected.add(value);
    }
    onFilterChange(newSelected);
  };

  const handleClear = () => {
    onFilterChange(new Set(uniqueValues));
    setSearchTerm('');
  };

  const isFiltered = selectedValues.size < uniqueValues.length && selectedValues.size > 0;
  const allSelected = selectedValues.size === uniqueValues.length || selectedValues.size === 0;

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={`h-8 gap-1 ${isFiltered ? 'text-primary' : ''}`}
          data-testid={`filter-${columnName}`}
        >
          <Filter className={`w-3 h-3 ${isFiltered ? 'fill-primary' : ''}`} />
          {isFiltered && <span className="text-xs">({selectedValues.size})</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-0" align="start" dir="rtl">
        <div className="p-2 border-b">
          <Input
            placeholder="بحث..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-8"
            data-testid={`filter-search-${columnName}`}
          />
        </div>
        <ScrollArea className="h-64">
          <div className="p-2">
            <div className="flex items-center gap-2 pb-2 border-b mb-2">
              <Checkbox
                id={`all-${columnName}`}
                checked={allSelected}
                onCheckedChange={handleToggleAll}
                data-testid={`filter-all-${columnName}`}
              />
              <label
                htmlFor={`all-${columnName}`}
                className="text-sm font-medium cursor-pointer flex-1"
              >
                تحديد الكل
              </label>
            </div>
            {filteredValues.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">لا توجد نتائج</p>
            ) : (
              filteredValues.map((value) => (
                <div key={value} className="flex items-center gap-2 py-1.5">
                  <Checkbox
                    id={`${columnName}-${value}`}
                    checked={selectedValues.has(value) || selectedValues.size === 0}
                    onCheckedChange={() => handleToggleValue(value)}
                    data-testid={`filter-value-${columnName}-${value}`}
                  />
                  <label
                    htmlFor={`${columnName}-${value}`}
                    className="text-sm cursor-pointer flex-1"
                  >
                    {value}
                  </label>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
        {isFiltered && (
          <div className="p-2 border-t">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClear}
              className="w-full gap-2"
              data-testid={`filter-clear-${columnName}`}
            >
              <X className="w-4 h-4" />
              مسح الفلتر
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
