import type { IconButtonProps } from '@mui/material/IconButton';

import { IconButton } from '@shared/ui';

import { Iconify } from '@shared/ui';

// ----------------------------------------------------------------------

export function MenuButton({ sx, ...other }: IconButtonProps) {
  return (
    <IconButton sx={sx} {...other}>
      <Iconify icon="custom:menu-duotone" width={24} />
    </IconButton>
  );
}
