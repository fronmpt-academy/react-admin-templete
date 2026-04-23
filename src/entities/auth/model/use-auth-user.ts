import { useContext } from 'react';

import { AuthContext } from '@shared/router/components';

export const useAuthUser = () => useContext(AuthContext);
