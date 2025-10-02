import {
  AllCommunityModule,
  ClientSideRowModelModule,
  ModuleRegistry,
  type ColDef,
  themeQuartz,
} from "ag-grid-community";
import { AgGridReact } from "ag-grid-react";
import { Box, Input, Button, HStack } from "@chakra-ui/react";
import { useCallback, useMemo, useRef, useState } from "react";
import { customTheme } from "@/theme";
import { Trash } from "lucide-react";

ModuleRegistry.registerModules([AllCommunityModule, ClientSideRowModelModule]);

type UiAgTableProps<T> = {
  rowData: T[];
  columnDefs: ColDef[];
  height?: number | string;
  title?: string;
  enableSearch?: boolean;
  paginationPageSize?: number;
  onDeleteSelected?: (ids: T[]) => void;
};

export function UiAgTable<T extends { id?: number | string }>({
  rowData,
  columnDefs,
  height = 500,
  title,
  enableSearch = true,
  paginationPageSize = 10,
  onDeleteSelected,
}: UiAgTableProps<T>) {
  const gridRef = useRef<AgGridReact<T>>(null);
  const [quickFilterText, setQuickFilterText] = useState<string>();
  const [selectedRows, setSelectedRows] = useState<T[]>([]);

  const defaultColDef = useMemo<ColDef>(
    () => ({
      resizable: true,
      sortable: true,
      filter: true,
      flex: 1,
      minWidth: 100,
    }),
    []
  );

  const onSelectionChanged = useCallback(() => {
    const rows = gridRef.current?.api.getSelectedRows() ?? [];
    setSelectedRows(rows);
  }, []);

  const onDelete = () => {
    if (onDeleteSelected) {
      onDeleteSelected(selectedRows);
      gridRef.current?.api.deselectAll();
      setSelectedRows([]);
    }
  };

  return (
    <Box>
      <HStack justify="space-between" mb={3}>
        <Box fontWeight="bold">{title}</Box>
        <HStack>
          {enableSearch && (
            <Input
              size="sm"
              placeholder="Cari..."
              onChange={(e) => setQuickFilterText(e.target.value)}
            />
          )}
          {selectedRows.length > 0 && (
            <Button size="sm" colorPalette="red" onClick={onDelete}>
              <Trash /> Hapus {selectedRows.length} Data
            </Button>
          )}
        </HStack>
      </HStack>

      <Box w="100%" h={height} rounded="lg">
        <AgGridReact<T>
          ref={gridRef}
          rowData={rowData}
          columnDefs={columnDefs} // ✅ tidak ada tombol aksi di cell
          defaultColDef={defaultColDef}
          pagination
          paginationPageSize={paginationPageSize}
          paginationPageSizeSelector={[10, 20, 50, 100]}
          animateRows
          rowSelection={{ mode: "multiRow", headerCheckbox: true }} // ✅ multi select + header checkbox
          quickFilterText={quickFilterText}
          onSelectionChanged={onSelectionChanged}
          theme={customTheme}
        />
      </Box>
    </Box>
  );
}
