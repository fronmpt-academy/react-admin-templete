import type { IconifyName } from '@shared/ui';
import type { CardProps } from '@mui/material/Card';

import { varAlpha } from 'minimal-shared/utils';

import { fDate , fShortenNumber } from '@shared/lib';
import {
  Box,
  Link,
  Card,
  Avatar,
  Iconify,
  SvgColor,
  Typography,
} from '@shared/ui';

import type { IPostItem } from '../model/types';

// ----------------------------------------------------------------------

export function PostItem({
  sx,
  post,
  latestPost,
  latestPostLarge,
  ...other
}: CardProps & {
  post: IPostItem;
  latestPost: boolean;
  latestPostLarge: boolean;
}) {
  const { coverUrl, title, totalViews, totalFavorites, totalComments, totalShares, author, postedAt } = post;

  const renderAvatar = (
    <Avatar
      alt={author.name}
      src={author.avatarUrl}
      sx={{
        left: 24,
        zIndex: 9,
        bottom: -24,
        position: 'absolute',
        ...((latestPostLarge || latestPost) && {
          top: 24,
        }),
      }}
    />
  );

  const renderTitle = (
    <Link
      color="inherit"
      variant="subtitle2"
      underline="hover"
      sx={{
        height: 44,
        overflow: 'hidden',
        WebkitLineClamp: 2,
        display: '-webkit-box',
        WebkitBoxOrient: 'vertical',
        ...(latestPostLarge && { typography: 'h5', height: 60 }),
        ...((latestPostLarge || latestPost) && {
          color: 'common.white',
        }),
      }}
    >
      {title}
    </Link>
  );

  const renderInfo = (
    <Box
      sx={{
        mt: 3,
        gap: 1.5,
        display: 'flex',
        flexWrap: 'wrap',
        color: 'text.disabled',
        justifyContent: 'flex-end',
      }}
    >
      {[
        { number: totalComments, icon: 'solar:chat-round-dots-bold' },
        { number: totalViews, icon: 'solar:eye-bold' },
        { number: totalShares, icon: 'solar:share-bold' },
      ].map((info, _index) => (
        <Box
          key={_index}
          sx={{
            display: 'flex',
            ...((latestPostLarge || latestPost) && {
              opacity: 0.64,
              color: 'common.white',
            }),
          }}
        >
          <Iconify width={16} icon={info.icon as IconifyName} sx={{ mr: 0.5 }} />
          <Typography variant="caption">{fShortenNumber(info.number)}</Typography>
        </Box>
      ))}
    </Box>
  );

  const renderCover = (
    <Box
      component="img"
      alt={title}
      src={coverUrl}
      sx={{
        top: 0,
        width: 1,
        height: 1,
        objectFit: 'cover',
        position: 'absolute',
      }}
    />
  );

  const renderDate = (
    <Typography
      variant="caption"
      component="div"
      sx={{
        mb: 1,
        color: 'text.disabled',
        ...((latestPostLarge || latestPost) && {
          opacity: 0.48,
          color: 'common.white',
        }),
      }}
    >
      {fDate(postedAt)}
    </Typography>
  );

  const renderShape = (
    <SvgColor
      src="/assets/icons/shape-avatar.svg"
      sx={{
        left: 0,
        width: 88,
        zIndex: 9,
        height: 36,
        bottom: -16,
        position: 'absolute',
        color: 'background.paper',
        ...((latestPostLarge || latestPost) && { display: 'none' }),
      }}
    />
  );

  return (
    <Card sx={sx} {...other}>
      <Box
        sx={(theme) => ({
          position: 'relative',
          pt: 'calc(100% * 3 / 4)',
          ...((latestPostLarge || latestPost) && {
            pt: 'calc(100% * 4 / 3)',
            '&:after': {
              top: 0,
              content: "''",
              width: '100%',
              height: '100%',
              position: 'absolute',
              bgcolor: varAlpha(theme.palette.grey['900Channel'], 0.72),
            },
          }),
          ...(latestPostLarge && {
            pt: {
              xs: 'calc(100% * 4 / 3)',
              sm: 'calc(100% * 3 / 4.66)',
            },
          }),
        })}
      >
        {renderShape}
        {renderAvatar}
        {renderCover}
      </Box>

      <Box
        sx={(theme) => ({
          p: theme.spacing(6, 3, 3, 3),
          ...((latestPostLarge || latestPost) && {
            width: 1,
            bottom: 0,
            position: 'absolute',
          }),
        })}
      >
        {renderDate}
        {renderTitle}
        {renderInfo}
      </Box>
    </Card>
  );
}
