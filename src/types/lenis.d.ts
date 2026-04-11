declare module "@studio-freight/lenis" {
	export interface LenisOptions {
		duration?: number;
		easing?: (t: number) => number;
		direction?: "vertical" | "horizontal";
		gestureDirection?: "vertical" | "horizontal";
		smooth?: boolean;
		mouseMultiplier?: number;
		smoothTouch?: boolean;
		touchMultiplier?: number;
		infinite?: boolean;
	}

	export default class Lenis {
		constructor(options?: LenisOptions);

		raf(time: number): void;
		scrollTo(target: string | number | HTMLElement, options?: any): void;
		on(event: string, callback: (e: any) => void): void;
		destroy(): void;
	}
}






