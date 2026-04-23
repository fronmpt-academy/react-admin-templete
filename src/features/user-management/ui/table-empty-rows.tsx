import type { TableRowProps } from '@mui/material/TableRow';

import { TableRow, TableCell } from '@shared/ui';

// ----------------------------------------------------------------------

type TableEmptyRowsProps = TableRowProps & {
  emptyRows: number;
  height?: number;
};

export function TableEmptyRows({ emptyRows, height, sx, ...other }: TableEmptyRowsProps) {
  if (!emptyRows) {
    return null;
  }

  return (
    <TableRow
      sx={[height && { height: height * emptyRows }, ...(Array.isArray(sx) ? sx : [sx])]}
      {...other}
    >
      <TableCell colSpan={9} />
    </TableRow>
  );
}
