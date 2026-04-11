export interface SubMenuItem {
	id: string;
	name: string;
	path: string;
	icon?: string;
}

export interface MenuItem {
	id: string;
	name: string;
	path: string;
	icon: string;
	subMenu?: SubMenuItem[];
}






