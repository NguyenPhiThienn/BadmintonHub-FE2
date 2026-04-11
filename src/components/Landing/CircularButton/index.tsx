import React from 'react';

const CircularButton = ({ text = "ELECTRIC • AUTOMATION • SOLUTION • " }: { text?: string }) => {
    const characters = text.split("");
    const rotationStep = 360 / characters.length;

    return (
        <button className="group relative grid place-content-center w-[120px] h-[120px] rounded-full overflow-hidden bg-primary text-secondary transition-all duration-500 hover:bg-black hover:scale-110 border-none cursor-pointer font-bold pointer-events-auto">
            {/* Rotating Text */}
            <div className="absolute inset-0 animate-text-rotation">
                {characters.map((char, i) => (
                    <span
                        key={i}
                        className="absolute inset-[10px] origin-center text-[12px] uppercase tracking-[0.2em]"
                        style={{
                            transform: `rotate(${rotationStep * i}deg)`,
                        }}
                    >
                        {char}
                    </span>
                ))}
            </div>

            {/* Center Circle with Icons */}
            <div className="relative w-12 h-12 overflow-hidden bg-secondary text-primary rounded-full flex items-center justify-center transition-transform duration-300 group-hover:scale-110 shadow-lg">
                {/* Original Icon */}
                <svg
                    viewBox="0 0 14 15"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-[18px] transition-all duration-500 ease-in-out group-hover:translate-x-[150%] group-hover:-translate-y-[150%] group-hover:opacity-0"
                >
                    <path
                        d="M13.376 11.552l-.264-10.44-10.44-.24.024 2.28 6.96-.048L.2 12.56l1.488 1.488 9.432-9.432-.048 6.912 2.304.024z"
                        fill="currentColor"
                    />
                </svg>

                {/* Copy Icon (enters from bottom-left) */}
                <svg
                    viewBox="0 0 14 15"
                    fill="none"
                    width={18}
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-[18px] absolute transition-all duration-500 ease-in-out translate-x-[-150%] translate-y-[150%] opacity-0 group-hover:translate-x-0 group-hover:translate-y-0 group-hover:opacity-100 text-black"
                >
                    <path
                        d="M13.376 11.552l-.264-10.44-10.44-.24.024 2.28 6.96-.048L.2 12.56l1.488 1.488 9.432-9.432-.048 6.912 2.304.024z"
                        fill="currentColor"
                    />
                </svg>
            </div>
        </button>
    );
};

export default CircularButton;
