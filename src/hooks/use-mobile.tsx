import * as React from "react";

const MOBILE_BREAKPOINT = 768;
const TABLET_BREAKPOINT = 1024;

export function useResponsive() {
	const [state, setState] = React.useState({
		isMobile: false,
		isTablet: false,
		isDesktop: true,
	});

	React.useEffect(() => {
		const checkResponsive = () => {
			const width = window.innerWidth;
			setState({
				isMobile: width < MOBILE_BREAKPOINT,
				isTablet: width >= MOBILE_BREAKPOINT && width < TABLET_BREAKPOINT,
				isDesktop: width >= TABLET_BREAKPOINT,
			});
		};

		// Initial check
		checkResponsive();

		window.addEventListener("resize", checkResponsive);
		return () => window.removeEventListener("resize", checkResponsive);
	}, []);

	return state;
}

export function useIsMobile() {
	const { isMobile } = useResponsive();
	return isMobile;
}

export function useIsTablet() {
	const { isTablet } = useResponsive();
	return isTablet;
}
