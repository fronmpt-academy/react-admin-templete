import type { Theme, SxProps } from '@mui/material/styles';

import { TextField, InputAdornment, Autocomplete, autocompleteClasses } from '@shared/ui';

import { Iconify } from '@shared/ui';

import type { IPostItem } from '@entities/post';

// ----------------------------------------------------------------------

type PostSearchProps = {
  posts: IPostItem[];
  sx?: SxProps<Theme>;
};

export function PostSearch({ posts, sx }: PostSearchProps) {
  return (
    <Autocomplete
      sx={{ width: 280 }}
      autoHighlight
      popupIcon={null}
      slotProps={{
        paper: {
          sx: {
            width: 320,
            [`& .${autocompleteClasses.option}`]: {
              typography: 'body2',
            },
            ...sx,
          },
        },
      }}
      options={posts}
      getOptionLabel={(post) => post.title}
      isOptionEqualToValue={(option, value) => option.id === value.id}
      renderInput={(params) => (
        <TextField
          {...params}
          placeholder="Search post..."
          slotProps={{
            input: {
              ...params.InputProps,
              startAdornment: (
                <InputAdornment position="start">
                  <Iconify
                    icon="eva:search-fill"
                    sx={{ ml: 1, width: 20, height: 20, color: 'text.disabled' }}
                  />
                </InputAdornment>
              ),
            },
          }}
        />
      )}
    />
  );
}
