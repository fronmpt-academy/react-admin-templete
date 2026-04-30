import { SvgColor } from '@shared/ui';

// ----------------------------------------------------------------------

const icon = (name: string) => <SvgColor src={`/assets/icons/navbar/${name}.svg`} />;

export type NavItem = {
  title: string;
  path: string;
  icon: React.ReactNode;
  info?: React.ReactNode;
};

export const navData = [
  {
    title: 'Dashboard',
    path: '/dashboard',
    icon: icon('ic-analytics'),
  },
  {
    title: '거래처',
    path: '/clients',
    icon: icon('ic-user'),
  },
  {
    title: '거래',
    path: '/transactions',
    icon: icon('ic-cart'),
  },
];
