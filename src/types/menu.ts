export interface MenuItem {
  id: string;
  name: string;
  path: string;
  icon: string;
  badge?: number;
  badgeColor?: string;
  subMenu?: MenuItem[];
  permissions?: string[];
}
