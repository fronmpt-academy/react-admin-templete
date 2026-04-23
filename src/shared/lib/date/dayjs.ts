import 'dayjs/locale/ko';

import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.locale('ko');
dayjs.tz.setDefault('Asia/Seoul');

export { dayjs };
