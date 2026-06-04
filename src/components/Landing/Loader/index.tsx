
const Loader = () => {
    return (
        <div className="flex items-center justify-center p-4 scale-150">
            <div className="loader relative w-20 h-10 border-2 border-[#E4EFE2] border-r-transparent p-[3px] animate-p5 bg-[repeating-linear-gradient(90deg,#E4EFE2_0_10px,#0000_0_15px)] bg-left bg-[length:0%_100%] bg-no-repeat bg-origin-content bg-clip-content">

                {/* Biểu tượng tia sét */}
                <svg viewBox="0 0 16 16" className="absolute left-[22px] top-1/2 -translate-y-1/2 fill-[#ACCEA6] z-10" height={28} width={28} xmlns="http://www.w3.org/2000/svg">
                    <path d="M11.251.068a.5.5 0 0 1 .227.58L9.677 6.5H13a.5.5 0 0 1 .364.843l-8 8.5a.5.5 0 0 1-.842-.49L6.323 9.5H3a.5.5 0 0 1-.364-.843l8-8.5a.5.5 0 0 1 .615-.09z" />
                </svg>

                {/* Phần nắp pin (Battery Head) - Tái cấu trúc bằng Div để nối liền mạch */}
                <div className="absolute left-full top-[-2px] bottom-[-2px] w-[10px] pointer-events-none">
                    {/* Hai đường kẻ dọc "khép góc" thân pin (Shoulders) */}
                    <div className="absolute left-0 top-0 w-[2px] h-[calc(50%-5px)] bg-[#E4EFE2]" />
                    <div className="absolute left-0 bottom-0 w-[2px] h-[calc(50%-5px)] bg-[#E4EFE2]" />

                    {/* Hai đường kẻ ngang nối ra nắp */}
                    <div className="absolute top-[calc(50%-7px)] left-0 w-full h-[2px] bg-[#E4EFE2]" />
                    <div className="absolute bottom-[calc(50%-7px)] left-0 w-full h-[2px] bg-[#E4EFE2]" />

                    {/* Đường kẻ dọc ở mũi nắp pin */}
                    <div className="absolute right-0 top-[calc(50%-7px)] bottom-[calc(50%-7px)] w-[2px] bg-[#E4EFE2]" />
                </div>
            </div>
        </div>
    );
}

export default Loader;
