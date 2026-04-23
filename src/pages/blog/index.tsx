import { _posts } from '@shared/api';
import { CONFIG } from '@shared/config';

import { BlogView } from './ui/blog-view';

export default function Page() {
  return (
    <>
      <title>{`Blog - ${CONFIG.appName}`}</title>
      <BlogView posts={_posts} />
    </>
  );
}
