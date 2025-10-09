import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Download, FileSpreadsheet, Filter as FilterIcon, Calendar } from 'lucide-react';

export interface ExportMenuProps {
  onExportAll: () => void;
  onExportFiltered: () => void;
  onExportToday: () => void;
  isLoading?: boolean;
  hasFilters?: boolean;
  todayCount?: number;
  filteredCount?: number;
  totalCount?: number;
}

export function ExportMenu({
  onExportAll,
  onExportFiltered,
  onExportToday,
  isLoading = false,
  hasFilters = false,
  todayCount = 0,
  filteredCount = 0,
  totalCount = 0,
}: ExportMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          disabled={isLoading}
          data-testid="button-export-menu"
          className="gap-2"
        >
          <Download className="w-4 h-4" />
          تصدير Excel
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56" dir="rtl">
        <DropdownMenuLabel className="text-right">خيارات التصدير</DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        <DropdownMenuItem
          onClick={onExportAll}
          disabled={isLoading || totalCount === 0}
          data-testid="menu-export-all"
          className="cursor-pointer flex items-center gap-3"
        >
          <FileSpreadsheet className="w-4 h-4" />
          <div className="flex-1 text-right">
            <div>تصدير جميع السجلات</div>
            <div className="text-xs text-muted-foreground">
              {totalCount} سجل
            </div>
          </div>
        </DropdownMenuItem>

        {hasFilters && (
          <DropdownMenuItem
            onClick={onExportFiltered}
            disabled={isLoading || filteredCount === 0}
            data-testid="menu-export-filtered"
            className="cursor-pointer flex items-center gap-3"
          >
            <FilterIcon className="w-4 h-4" />
            <div className="flex-1 text-right">
              <div>تصدير السجلات المفلترة</div>
              <div className="text-xs text-muted-foreground">
                {filteredCount} سجل
              </div>
            </div>
          </DropdownMenuItem>
        )}

        <DropdownMenuItem
          onClick={onExportToday}
          disabled={isLoading || todayCount === 0}
          data-testid="menu-export-today"
          className="cursor-pointer flex items-center gap-3"
        >
          <Calendar className="w-4 h-4" />
          <div className="flex-1 text-right">
            <div>تصدير التعديلات اليوم</div>
            <div className="text-xs text-muted-foreground">
              {todayCount} سجل معدل اليوم
            </div>
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
