"use client";

import { Footer } from "@/components/Landing/Footer";
import { Header } from "@/components/Landing/Header";
import { motion } from "framer-motion";
import Link from "next/link";
import Script from "next/script";

import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Icon } from "@/components/ui/mdi-icon";
import { useUser } from "@/context/useUserContext";
import { useCreateOwnerRequest, useMyOwnerRequest, useUpdateMyOwnerRequest, useCancelMyOwnerRequest } from "@/hooks/useOwnerRequest";
import { useUploadImage } from "@/hooks/useUpload";
import {
    mdiAccountDetailsOutline,
    mdiAlertCircleOutline,
    mdiBankOutline,
    mdiCheckCircle,
    mdiCloudUploadOutline,
    mdiCreditCardOutline,
    mdiFileDocumentOutline,
    mdiFileDocumentEditOutline,
    mdiHome,
    mdiInvoiceTextSend,
    mdiMapMarkerOutline,
    mdiReceiptTextOutline,
    mdiStorefrontOutline,
    mdiTrashCanOutline
} from "@mdi/js";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

const POPULAR_BANKS = [
    "Vietcombank", "VietinBank", "BIDV", "Agribank", "Techcombank",
    "MBBank", "VPBank", "ACB", "Sacombank", "HDBank", "VIB", "SHB",
    "SeABank", "TPBank", "Khác"
];

// Danh sách mã tỉnh/thành phố hợp lệ trong CCCD Việt Nam
const VALID_PROVINCE_CODES = new Set([
    "001","002","004","006","008","010","011","012","014","015",
    "017","019","020","022","024","025","026","027","030","031",
    "033","034","035","036","037","038","040","042","044","045",
    "046","048","049","051","052","054","056","058","060","062",
    "064","066","067","068","070","072","074","075","077","079",
    "080","082","083","084","086","087","089","091","092","093",
    "094","095","096"
]);

/**
 * Validate CCCD theo cấu trúc:
 * - Đúng 12 chữ số
 * - 3 số đầu: mã tỉnh hợp lệ
 * - Số thứ 4: 0-3 (giới tính + thế kỷ)
 * - 6 số cuối: không phải toàn số 0
 */
function validateCCCD(value: string): { valid: boolean; message: string } {
    const v = value.trim();
    if (v.length === 0) return { valid: false, message: "Vui lòng nhập số CCCD" };
    if (!/^\d+$/.test(v)) return { valid: false, message: "CCCD chỉ được chứa chữ số" };
    if (v.length !== 12) return { valid: false, message: `Cần đủ 12 số (hiện tại ${v.length} số)` };

    const provinceCode = v.slice(0, 3);
    if (!VALID_PROVINCE_CODES.has(provinceCode)) {
        return { valid: false, message: `Mã tỉnh "${provinceCode}" không hợp lệ` };
    }

    const genderCentury = parseInt(v[3]);
    if (genderCentury < 0 || genderCentury > 3) {
        return { valid: false, message: "Số thứ 4 phải là 0, 1, 2 hoặc 3" };
    }

    const suffix = v.slice(6);
    if (/^0+$/.test(suffix)) {
        return { valid: false, message: "6 số cuối không được toàn là 0" };
    }

    return { valid: true, message: "" };
}

/**
 * Validate Mã số thuế:
 * - Đúng 10 chữ số
 * - Số đầu tiên không phải 0
 * - Không phải chuỗi lặp lại (vd: 1111111111)
 */
function validateTaxCode(value: string): { valid: boolean; message: string } {
    const v = value.trim();
    if (v.length === 0) return { valid: false, message: "Vui lòng nhập mã số thuế" };
    if (!/^\d+$/.test(v)) return { valid: false, message: "Mã số thuế chỉ được chứa chữ số" };
    if (v.length !== 10) return { valid: false, message: `Cần đủ 10 số (hiện tại ${v.length} số)` };
    if (v[0] === "0") return { valid: false, message: "Số đầu tiên không được là 0" };
    if (/^(\d)\1{9}$/.test(v)) return { valid: false, message: "Mã số thuế không hợp lệ (lặp lại một chữ số)" };

    return { valid: true, message: "" };
}

export default function RegisterOwnerPage() {
    const { user, fetchUserProfile } = useUser();
    const router = useRouter();

    // Request status hook
    const { data: myRequestResponse, isLoading: isRequestLoading, refetch: refetchRequest } = useMyOwnerRequest(!!user);
    const myRequest = myRequestResponse?.data;

    // Mutation hooks
    const uploadImageMutation = useUploadImage();
    const createRequestMutation = useCreateOwnerRequest();
    const updateRequestMutation = useUpdateMyOwnerRequest();
    const cancelRequestMutation = useCancelMyOwnerRequest();

    // Form states
    const [identityCard, setIdentityCard] = useState("");
    const [courtAddress, setCourtAddress] = useState("");
    const [courtImages, setCourtImages] = useState<string[]>([]);
    const [businessLicense, setBusinessLicense] = useState("");
    const [bankName, setBankName] = useState("");
    const [bankAccountNumber, setBankAccountNumber] = useState("");
    const [bankAccountName, setBankAccountName] = useState("");
    const [taxCode, setTaxCode] = useState("");
    const [isAgreedToTerms, setIsAgreedToTerms] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isOtherBank, setIsOtherBank] = useState(false);
    const [isEditing, setIsEditing] = useState(true);
    const [errors, setErrors] = useState<Record<string, string>>({});

    // Tự động đồng bộ quyền lợi và nhảy qua giao diện chủ sân khi đơn được phê duyệt (APPROVED)
    useEffect(() => {
        if (myRequest && myRequest.status === "APPROVED") {
            // Chỉ chạy chuyển hướng nếu vai trò hiện tại của user vẫn là PLAYER để tránh vòng lặp
            if (user && user.role === "PLAYER") {
                const syncAndRedirect = async () => {
                    toast.success("🎉 Chúc mừng! Đơn đăng ký Chủ sân của bạn đã được phê duyệt!", {
                        position: "top-center",
                        autoClose: 3500,
                    });

                    try {
                        // Gọi API lấy thông tin profile mới nhất, cập nhật role từ PLAYER thành OWNER
                        if (fetchUserProfile) {
                            await fetchUserProfile();
                        }
                    } catch (err) {
                        console.error("Lỗi đồng bộ profile:", err);
                    }

                    toast.info("🚀 Đang chuyển hướng bạn sang giao diện quản lý Chủ sân...", {
                        position: "top-center",
                        autoClose: 2000,
                    });

                    // Chuyển hướng sau 2 giây
                    setTimeout(() => {
                        router.push("/owner");
                    }, 2000);
                };
                syncAndRedirect();
            }
        }
    }, [myRequest, user, fetchUserProfile, router]);

    // If pending or rejected, allow editing previous values
    useEffect(() => {
        if (myRequest && (myRequest.status === "REJECTED" || myRequest.status === "PENDING")) {
            setIdentityCard(myRequest.identityCard || "");
            setCourtAddress(myRequest.courtAddress || "");
            setCourtImages(myRequest.courtImages || []);
            setBusinessLicense(myRequest.businessLicense || "");
            if (myRequest.bankName) {
                // Find case-insensitive match in POPULAR_BANKS
                const matchedBank = POPULAR_BANKS.find(b => b.toLowerCase() === myRequest.bankName.toLowerCase());
                if (matchedBank) {
                    setBankName(matchedBank);
                    setIsOtherBank(false);
                } else {
                    setBankName(myRequest.bankName);
                    setIsOtherBank(true);
                }
            } else {
                setBankName("");
                setIsOtherBank(false);
            }
            setBankAccountNumber(myRequest.bankAccountNumber || "");
            setBankAccountName(myRequest.bankAccountName || "");
            setTaxCode(myRequest.taxCode || "");
            setIsAgreedToTerms(myRequest.isAgreedToTerms ?? false);
            setIsEditing(false); // Make form readonly initially
        } else {
            setIsEditing(true); // If no request exists (new form)
        }
    }, [myRequest]);

    const handleCancelEdit = () => {
        if (myRequest) {
            setIdentityCard(myRequest.identityCard || "");
            setCourtAddress(myRequest.courtAddress || "");
            setCourtImages(myRequest.courtImages || []);
            setBusinessLicense(myRequest.businessLicense || "");
            if (myRequest.bankName) {
                const matchedBank = POPULAR_BANKS.find(b => b.toLowerCase() === myRequest.bankName.toLowerCase());
                if (matchedBank) {
                    setBankName(matchedBank);
                    setIsOtherBank(false);
                } else {
                    setBankName(myRequest.bankName);
                    setIsOtherBank(true);
                }
            } else {
                setBankName("");
                setIsOtherBank(false);
            }
            setBankAccountNumber(myRequest.bankAccountNumber || "");
            setBankAccountName(myRequest.bankAccountName || "");
            setTaxCode(myRequest.taxCode || "");
            setIsAgreedToTerms(myRequest.isAgreedToTerms ?? false);
        }
        setIsEditing(false);
    };

    const apiKey = process.env.NEXT_PUBLIC_MAPS_API_KEY;

    // Tích hợp Google Place Autocomplete & Bản đồ Preview
    useEffect(() => {
        let autocomplete: any = null;

        const initAutocomplete = () => {
            const input = document.getElementById("register-court-address-input") as HTMLInputElement;
            if (!input || !(window as any).google || !(window as any).google.maps || !(window as any).google.maps.places) return;

            autocomplete = new (window as any).google.maps.places.Autocomplete(input, {
                types: ["geocode", "establishment"],
                componentRestrictions: { country: "vn" },
            });

            autocomplete.addListener("place_changed", () => {
                const place = autocomplete.getPlace();
                if (!place || !place.geometry) return;

                const address = place.formatted_address || place.name || "";
                const lat = place.geometry.location.lat();
                const lng = place.geometry.location.lng();

                setCourtAddress(address);

                const mapDiv = document.getElementById("register-venue-map-preview");
                if (mapDiv) {
                    mapDiv.classList.remove("hidden");
                    const mapInstance = new (window as any).google.maps.Map(mapDiv, {
                        center: { lat, lng },
                        zoom: 16,
                        disableDefaultUI: true,
                    });
                    new (window as any).google.maps.Marker({
                        position: { lat, lng },
                        map: mapInstance,
                    });
                }
            });
        };

        const handleScriptLoad = () => {
            initAutocomplete();
        };

        window.addEventListener('google-maps-loaded', handleScriptLoad);

        // Khởi tạo ngay nếu Google Maps đã được tải trước đó
        if ((window as any).google && (window as any).google.maps && (window as any).google.maps.places) {
            initAutocomplete();
        }

        const timer = setTimeout(() => {
            initAutocomplete();

            // Nếu đã có sẵn địa chỉ (ví dụ khi bị reject và load lại dữ liệu cũ)
            if (courtAddress && (window as any).google && (window as any).google.maps && (window as any).google.maps.places) {
                const geocoder = new (window as any).google.maps.Geocoder();
                geocoder.geocode({ address: courtAddress }, (results: any, status: any) => {
                    if (status === 'OK' && results[0]) {
                        const lat = results[0].geometry.location.lat();
                        const lng = results[0].geometry.location.lng();
                        const mapDiv = document.getElementById("register-venue-map-preview");
                        if (mapDiv) {
                            mapDiv.classList.remove("hidden");
                            const mapInstance = new (window as any).google.maps.Map(mapDiv, {
                                center: { lat, lng },
                                zoom: 16,
                                disableDefaultUI: true,
                            });
                            new (window as any).google.maps.Marker({
                                position: { lat, lng },
                                map: mapInstance,
                            });
                        }
                    }
                });
            }
        }, 800);

        return () => {
            clearTimeout(timer);
            window.removeEventListener('google-maps-loaded', handleScriptLoad);
            if (autocomplete && (window as any).google && (window as any).google.maps) {
                (window as any).google.maps.event.clearInstanceListeners(autocomplete);
            }
        };
    }, [courtAddress]);

    if (!user) {
        return (
            <div className="min-h-screen flex flex-col bg-darkBackgroundV1">
                <Header />
                <main className="flex-1 flex flex-col items-center justify-center gap-4">
                    <Icon path={mdiStorefrontOutline} size={1.5} className="text-neutral-400 opacity-20" />
                    <p className="text-neutral-400 italic text-center max-w-md">Vui lòng đăng nhập và vào mục Đăng ký trở thành chủ sân</p>
                    <Button asChild>
                        <Link href="/">
                            <Icon path={mdiHome} size={0.8} />
                            Quay lại trang chủ
                        </Link>
                    </Button>
                </main>
                <Footer />
            </div>
        );
    }

    const handleCourtImagesUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        try {
            const uploadedUrls: string[] = [...courtImages];
            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                const res = await uploadImageMutation.mutateAsync(file);
                if (res.data?.url) {
                    uploadedUrls.push(res.data.url);
                }
            }
            setCourtImages(uploadedUrls);
            if (errors.courtImages) setErrors(prev => ({ ...prev, courtImages: "" }));
            toast.success("Tải ảnh sân lên thành công!");
        } catch (error: any) {
            console.error("Upload error details:", error);
            const errMsg = error?.response?.data?.message || error?.message || error?.data?.message || (typeof error === "object" ? JSON.stringify(error) : String(error));
            toast.error(`Lỗi tải ảnh sân: ${errMsg}`);
        }
    };

    const handleBusinessLicenseUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            const res = await uploadImageMutation.mutateAsync(file);
            if (res.data?.url) {
                setBusinessLicense(res.data.url);
                if (errors.businessLicense) setErrors(prev => ({ ...prev, businessLicense: "" }));
                toast.success("Tải ảnh giấy phép kinh doanh thành công!");
            }
        } catch (error: any) {
            console.error("Upload error details:", error);
            const errMsg = error?.response?.data?.message || error?.message || error?.data?.message || (typeof error === "object" ? JSON.stringify(error) : String(error));
            toast.error(`Lỗi tải ảnh giấy phép: ${errMsg}`);
        }
    };

    const removeCourtImage = (indexToRemove: number) => {
        setCourtImages(courtImages.filter((_, index) => index !== indexToRemove));
    };

    const removeBusinessLicense = () => {
        setBusinessLicense("");
    };

    const handleCancelRequest = async () => {
        if (!confirm("Bạn có chắc chắn muốn hủy đơn đăng ký này?")) return;
        setIsSubmitting(true);
        try {
            await cancelRequestMutation.mutateAsync();
            toast.success("Đã hủy đơn đăng ký thành công");
            refetchRequest();
            // Clear form
            setIdentityCard("");
            setCourtAddress("");
            setCourtImages([]);
            setBusinessLicense("");
            setBankName("");
            setBankAccountNumber("");
            setBankAccountName("");
            setTaxCode("");
            setIsAgreedToTerms(false);
            setIsOtherBank(false);
        } catch (error: any) {
            toast.error(error.message || "Không thể hủy đơn");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const newErrors: Record<string, string> = {};
        let isValid = true;

        const cccdResult = validateCCCD(identityCard);
        if (!cccdResult.valid) {
            newErrors.identityCard = cccdResult.message;
            isValid = false;
        }

        const taxResult = validateTaxCode(taxCode);
        if (!taxResult.valid) {
            newErrors.taxCode = taxResult.message;
            isValid = false;
        }
        if (!bankName.trim()) {
            newErrors.bankName = "Vui lòng chọn ngân hàng";
            isValid = false;
        }
        if (!bankAccountNumber.trim()) {
            newErrors.bankAccountNumber = "Vui lòng nhập Số tài khoản";
            isValid = false;
        }
        if (!bankAccountName.trim()) {
            newErrors.bankAccountName = "Vui lòng nhập Tên chủ tài khoản";
            isValid = false;
        }
        if (!courtAddress.trim()) {
            newErrors.courtAddress = "Vui lòng nhập địa chỉ sân";
            isValid = false;
        }
        if (courtImages.length === 0) {
            newErrors.courtImages = "Vui lòng tải lên ít nhất một ảnh sân thực tế";
            isValid = false;
        }
        if (!businessLicense) {
            newErrors.businessLicense = "Vui lòng tải lên Giấy phép hoạt động kinh doanh";
            isValid = false;
        }

        setErrors(newErrors);

        if (!isValid) {
            toast.error("Vui lòng kiểm tra lại các trường thông tin bị lỗi");
            return;
        }
        
        if (!isAgreedToTerms) {
            toast.error("Vui lòng đồng ý với các điều khoản");
            return;
        }

        setIsSubmitting(true);
        try {
            const data = {
                identityCard,
                courtAddress,
                courtImages,
                businessLicense,
                bankName,
                bankAccountNumber,
                bankAccountName,
                taxCode,
                isAgreedToTerms,
            };

            const isUpdate = myRequest && (myRequest.status === "REJECTED" || myRequest.status === "PENDING");
            const res = isUpdate
                ? await updateRequestMutation.mutateAsync(data)
                : await createRequestMutation.mutateAsync(data);
                
            if (res.statusCode === 200 || res.statusCode === 201) {
                toast.success(isUpdate ? "Cập nhật hồ sơ thành công!" : "Gửi yêu cầu đăng ký chủ sân thành công!");
                refetchRequest();
            } else {
                toast.error(res.message || "Gửi yêu cầu thất bại");
            }
        } catch (error: any) {
            toast.error(error.message || "Có lỗi xảy ra khi gửi yêu cầu");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col bg-darkBackgroundV1">
            <Header />

            <main className="flex-1 max-w-7xl mx-auto w-full px-4 pt-24 pb-8 space-y-4">
                {/* Breadcrumbs */}
                <Breadcrumb>
                    <BreadcrumbList>
                        <BreadcrumbItem>
                            <BreadcrumbLink href="/">Trang chủ</BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                            <BreadcrumbPage>Đăng ký trở thành chủ sân</BreadcrumbPage>
                        </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>

                {isRequestLoading ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-4">
                        <div className="h-10 w-10 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-neutral-400 italic">Đang tải thông tin hồ sơ của bạn...</p>
                    </div>
                ) : myRequest && myRequest.status === "APPROVED" ? (
                    /* APPROVED STATUS CARD */
                    <div className="space-y-4">
                        <div className="bg-darkCardV1 border border-green-500/20 rounded-2xl p-6 flex flex-col items-center text-center space-y-4 shadow-xl">
                            <div className="relative w-24 h-24">
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: [0, 1.1, 1] }}
                                    transition={{
                                        duration: 2,
                                        times: [0, 0.2, 0.5],
                                        repeat: Infinity,
                                        repeatDelay: 1
                                    }}
                                    className="w-full h-full bg-green-500/20 rounded-full flex items-center justify-center relative z-10"
                                >
                                    <Icon path={mdiCheckCircle} size={0.8} className="text-green-500 scale-[2.5]" />
                                </motion.div>

                                {/* Celebration Dots */}
                                {[...Array(8)].map((_, i) => {
                                    const angle = (i * 45 * Math.PI) / 180;
                                    const targetX = Math.cos(angle) * 80;
                                    const targetY = Math.sin(angle) * 80;

                                    return (
                                        <div key={i} className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                            <motion.div
                                                animate={{
                                                    scale: [0, 1, 0],
                                                    x: [0, targetX],
                                                    y: [0, targetY],
                                                }}
                                                transition={{
                                                    duration: 0.8,
                                                    repeat: Infinity,
                                                    repeatDelay: 2.2,
                                                    ease: "easeOut",
                                                    delay: 0.4 + (i * 0.05), // Starts exactly when the checkmark reaches its peak
                                                }}
                                                className="w-2 h-2 rounded-full bg-green-500"
                                            />
                                        </div>
                                    );
                                })}
                            </div>
                            <div className="space-y-2 flex flex-col items-center">
                                <h1 className="text-3xl font-semibold text-green-500">Chúc mừng bạn đã trở thành Chủ sân!</h1>
                                <p className="text-neutral-400 text-base max-w-xl">
                                    Đơn đăng ký của bạn đã được duyệt thành công! Tài khoản của bạn đã được cấp quyền của <span className="text-green-500 font-semibold">Chủ sân (Court Owner)</span>.
                                </p>
                                <p className="text-accent text-base font-semibold pt-2 animate-pulse">
                                    Hệ thống đang tự động đồng bộ hóa quyền hạn tài khoản và chuyển hướng bạn đến Kênh quản lý Chủ sân trong giây lát...
                                </p>
                            </div>
                            <Button asChild>
                                <Link href="/">
                                    <Icon path={mdiHome} size={0.8} />
                                    Quay lại trang chủ
                                </Link>
                            </Button>
                        </div>

                        {/* APPROVED SUBMITTED DETAILS */}
                        <div className="bg-darkCardV1 border border-darkBorderV1 rounded-2xl p-4 space-y-4 shadow-xl">
                            <h3 className="text-green-500 font-semibold flex items-center gap-2">
                                <Icon path={mdiFileDocumentOutline} size={0.8} className="text-green-500" />
                                Thông tin hồ sơ đã phê duyệt
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <Label>Số Căn cước công dân</Label>
                                    <p className="text-white font-medium text-sm bg-darkBorderV1 p-3 rounded-lg border border-darkBorderV1">{myRequest.identityCard}</p>
                                </div>
                                <div className="space-y-1">
                                    <Label>Mã số thuế</Label>
                                    <p className="text-white font-medium text-sm bg-darkBorderV1 p-3 rounded-lg border border-darkBorderV1">{myRequest.taxCode}</p>
                                </div>
                                <div className="space-y-1 md:col-span-2">
                                    <Label>Thông tin thanh toán</Label>
                                    <p className="text-white font-medium text-sm bg-darkBorderV1 p-3 rounded-lg border border-darkBorderV1">
                                        Ngân hàng: {myRequest.bankName} - STK: {myRequest.bankAccountNumber} - Chủ thẻ: {myRequest.bankAccountName}
                                    </p>
                                </div>
                                <div className="space-y-1 md:col-span-2">
                                    <Label>Địa chỉ sân hoạt động</Label>
                                    <p className="text-white font-medium text-sm bg-darkBorderV1 p-3 rounded-lg border border-darkBorderV1">{myRequest.courtAddress}</p>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Ảnh sân thực tế</Label>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                    {myRequest.courtImages?.map((url: string, index: number) => (
                                        <div key={index} className="relative aspect-video rounded-lg overflow-hidden border border-darkBorderV1 bg-neutral-900/50">
                                            <Image src={url} alt={`Court ${index + 1}`} fill className="object-contain" />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Giấy phép hoạt động kinh doanh</Label>
                                <div className="relative aspect-video max-w-[250px] rounded-lg overflow-hidden border border-darkBorderV1 bg-neutral-900/50">
                                    <Image src={myRequest.businessLicense} alt="Business License" fill className="object-contain" />
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    /* SUBMISSION FORM (Initial, Pending, or Rejected) */
                    <div className="space-y-4">
                        {myRequest && myRequest.status === "PENDING" && (
                            <div className="bg-accent/10 border border-accent/20 text-accent rounded-2xl p-4 flex gap-3 shadow-lg">
                                <Icon path={mdiCheckCircle} size={1} className="flex-shrink-0 mt-0.5" />
                                <div className="space-y-1">
                                    <p className="font-bold text-sm">Hồ sơ đang chờ duyệt</p>
                                    <p className="text-sm text-neutral-400">
                                        Ban quản trị BadmintonHub đang kiểm tra tính xác thực của thông tin. Bạn vẫn có thể cập nhật thông tin nếu có sai sót.
                                    </p>
                                </div>
                            </div>
                        )}
                        {myRequest && myRequest.status === "REJECTED" && (
                            <div className="bg-red-500/10 border border-red-500/20 text-red-500 rounded-2xl p-4 flex gap-3 shadow-lg">
                                <Icon path={mdiAlertCircleOutline} size={1} className="flex-shrink-0 mt-0.5" />
                                <div className="space-y-1">
                                    <p className="font-bold text-sm">Đơn đăng ký trước đó bị từ chối</p>
                                    <p className="text-sm text-neutral-400">
                                        Lý do: <span className="text-white italic">"{myRequest.rejectReason || "Thông tin cung cấp chưa chính xác hoặc hình ảnh mờ"}"</span>
                                    </p>
                                    <p className="text-sm text-neutral-400 pt-1">
                                        Vui lòng cập nhật lại thông tin đúng và gửi lại đơn đăng ký mới bên dưới.
                                    </p>
                                </div>
                            </div>
                        )}

                        <div className="bg-darkCardV1 border border-darkBorderV1 rounded-2xl p-4 space-y-4 shadow-lg flex flex-col">
                            <h3 className="text-accent font-semibold flex items-center gap-2">
                                <Icon path={mdiStorefrontOutline} size={0.8} />
                                Đăng ký trở thành Chủ sân
                            </h3>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="bg-darkCardV1 border border-darkBorderV1 rounded-2xl p-6 mb-6 shadow-lg">
                                    <h3 className="text-xl font-bold uppercase tracking-wider text-accent mb-6 flex items-center gap-2 border-b border-darkBorderV1 pb-4">
                                        <Icon path={mdiAccountDetailsOutline} size={1} />
                                        THÔNG TIN ĐỊNH DANH
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label htmlFor="identityCard" className="flex items-center gap-1">
                                                <Icon path={mdiAccountDetailsOutline} size={0.7} /> Căn cước công dân (CCCD) <span className="text-red-500">*</span>
                                            </Label>
                                            <div className="relative">
                                                <Input
                                                    id="identityCard"
                                                    placeholder="Nhập 12 số Căn cước công dân"
                                                    value={identityCard}
                                                    onChange={(e) => {
                                                        const val = e.target.value.replace(/\D/g, "");
                                                        setIdentityCard(val);
                                                        if (errors.identityCard) setErrors(prev => ({ ...prev, identityCard: "" }));
                                                    }}
                                                    maxLength={12}
                                                    inputMode="numeric"
                                                    className={`bg-darkBackgroundV1/50 pr-24 ${
                                                        errors.identityCard
                                                            ? "border-red-500 focus-visible:ring-red-500"
                                                            : identityCard.length === 12 && validateCCCD(identityCard).valid
                                                                ? "border-green-500 focus-visible:ring-green-500"
                                                                : ""
                                                    }`}
                                                    disabled={!isEditing}
                                                />
                                                <span className={`absolute right-3 top-1/2 -translate-y-1/2 text-xs font-mono font-bold tabular-nums ${
                                                    identityCard.length === 12 && validateCCCD(identityCard).valid
                                                        ? "text-green-500"
                                                        : identityCard.length > 0
                                                            ? "text-neutral-400"
                                                            : "text-neutral-600"
                                                }`}>{identityCard.length}/12</span>
                                            </div>
                                            {errors.identityCard && <p className="text-red-500 text-xs">{errors.identityCard}</p>}
                                            {!errors.identityCard && identityCard.length > 0 && identityCard.length < 12 && (
                                                <p className="text-neutral-500 text-xs">Còn {12 - identityCard.length} số nữa</p>
                                            )}
                                            {!errors.identityCard && identityCard.length === 12 && validateCCCD(identityCard).valid && (
                                                <p className="text-green-500 text-xs">✓ Định dạng CCCD hợp lệ</p>
                                            )}
                                            {!errors.identityCard && identityCard.length === 12 && !validateCCCD(identityCard).valid && (
                                                <p className="text-amber-400 text-xs">⚠ {validateCCCD(identityCard).message}</p>
                                            )}
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="taxCode" className="flex items-center gap-1">
                                                <Icon path={mdiReceiptTextOutline} size={0.7} /> Mã số thuế <span className="text-red-500">*</span>
                                            </Label>
                                            <div className="relative">
                                                <Input
                                                    id="taxCode"
                                                    placeholder="Nhập 10 số mã số thuế"
                                                    value={taxCode}
                                                    onChange={(e) => {
                                                        const val = e.target.value.replace(/\D/g, "");
                                                        setTaxCode(val);
                                                        if (errors.taxCode) setErrors(prev => ({ ...prev, taxCode: "" }));
                                                    }}
                                                    maxLength={10}
                                                    inputMode="numeric"
                                                    className={`bg-darkBackgroundV1/50 pr-16 ${
                                                        errors.taxCode
                                                            ? "border-red-500 focus-visible:ring-red-500"
                                                            : taxCode.length === 10 && validateTaxCode(taxCode).valid
                                                                ? "border-green-500 focus-visible:ring-green-500"
                                                                : ""
                                                    }`}
                                                    disabled={!isEditing}
                                                />
                                                <span className={`absolute right-3 top-1/2 -translate-y-1/2 text-xs font-mono font-bold tabular-nums ${
                                                    taxCode.length === 10 && validateTaxCode(taxCode).valid
                                                        ? "text-green-500"
                                                        : taxCode.length > 0
                                                            ? "text-neutral-400"
                                                            : "text-neutral-600"
                                                }`}>{taxCode.length}/10</span>
                                            </div>
                                            {errors.taxCode && <p className="text-red-500 text-xs">{errors.taxCode}</p>}
                                            {!errors.taxCode && taxCode.length > 0 && taxCode.length < 10 && (
                                                <p className="text-neutral-500 text-xs">Còn {10 - taxCode.length} số nữa</p>
                                            )}
                                            {!errors.taxCode && taxCode.length === 10 && validateTaxCode(taxCode).valid && (
                                                <p className="text-green-500 text-xs">✓ Định dạng mã số thuế hợp lệ</p>
                                            )}
                                            {!errors.taxCode && taxCode.length === 10 && !validateTaxCode(taxCode).valid && (
                                                <p className="text-amber-400 text-xs">⚠ {validateTaxCode(taxCode).message}</p>
                                            )}
                                        </div>
                                        <div className="space-y-2 md:col-span-2">
                                            <Label htmlFor="register-court-address-input" className="flex items-center gap-1">
                                                <Icon path={mdiMapMarkerOutline} size={0.7} /> Địa chỉ cơ sở sân <span className="text-red-500">*</span>
                                            </Label>
                                            <div className="space-y-2">
                                                <div className="relative">
                                                    <Input
                                                        id="register-court-address-input"
                                                        className={`pl-9 bg-darkBackgroundV1/50 ${errors.courtAddress ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                                                        placeholder="Nhập địa chỉ đầy đủ của cơ sở sân..."
                                                        value={courtAddress}
                                                        onChange={(e) => {
                                                            setCourtAddress(e.target.value);
                                                            if (errors.courtAddress) setErrors(prev => ({ ...prev, courtAddress: "" }));
                                                        }}
                                                        disabled={!isEditing}
                                                    />
                                                    <Icon path={mdiMapMarkerOutline} size={0.8} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                                                </div>
                                                {errors.courtAddress && <p className="text-red-500 text-xs">{errors.courtAddress}</p>}
                                                <div id="register-venue-map-preview" className="w-full h-[180px] rounded-lg overflow-hidden border border-neutral-800 bg-neutral-950 hidden" />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-darkCardV1 border border-darkBorderV1 rounded-2xl p-6 mb-6 shadow-lg">
                                    <h3 className="text-xl font-bold uppercase tracking-wider text-accent mb-6 flex items-center gap-2 border-b border-darkBorderV1 pb-4">
                                        <Icon path={mdiBankOutline} size={1} />
                                        THÔNG TIN THANH TOÁN
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <div className="space-y-2">
                                            <Label htmlFor="bankName" className="flex items-center gap-1">
                                                <Icon path={mdiBankOutline} size={0.7} /> Ngân hàng <span className="text-red-500">*</span>
                                            </Label>
                                            {isOtherBank ? (
                                                <div>
                                                    <Input
                                                        id="bankName"
                                                        placeholder="Nhập tên ngân hàng..."
                                                        value={bankName}
                                                        onChange={(e) => {
                                                            setBankName(e.target.value);
                                                            if (errors.bankName) setErrors(prev => ({ ...prev, bankName: "" }));
                                                        }}
                                                        className={`bg-darkBackgroundV1/50 ${errors.bankName ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                                                        autoFocus
                                                        disabled={!isEditing}
                                                    />
                                                    {errors.bankName && <p className="text-red-500 text-xs mt-1">{errors.bankName}</p>}
                                                    {isEditing && (
                                                        <button type="button" onClick={() => { setIsOtherBank(false); setBankName(""); if (errors.bankName) setErrors(prev => ({ ...prev, bankName: "" })); }} className="text-xs text-accent hover:underline mt-1 block">
                                                            ← Chọn từ danh sách
                                                        </button>
                                                    )}
                                                </div>
                                            ) : (
                                                <div className="space-y-1">
                                                    <Select key={bankName || 'empty'} disabled={!isEditing} value={bankName || undefined} onValueChange={(val) => {
                                                        if (val === "Khác") {
                                                            setIsOtherBank(true);
                                                            setBankName("");
                                                        } else {
                                                            setIsOtherBank(false);
                                                            setBankName(val);
                                                        }
                                                        if (errors.bankName) setErrors(prev => ({ ...prev, bankName: "" }));
                                                    }}>
                                                        <SelectTrigger className={`bg-darkBackgroundV1/50 ${errors.bankName ? "border-red-500 focus:ring-red-500" : ""}`}>
                                                            <SelectValue placeholder="Chọn ngân hàng" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {POPULAR_BANKS.map((bank) => (
                                                                <SelectItem key={bank} value={bank}>{bank}</SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                    {errors.bankName && <p className="text-red-500 text-xs">{errors.bankName}</p>}
                                                </div>
                                            )}
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="bankAccountNumber" className="flex items-center gap-1">
                                                <Icon path={mdiCreditCardOutline} size={0.7} /> Số tài khoản <span className="text-red-500">*</span>
                                            </Label>
                                            <Input
                                                id="bankAccountNumber"
                                                placeholder="Nhập số tài khoản"
                                                value={bankAccountNumber}
                                                onChange={(e) => {
                                                    setBankAccountNumber(e.target.value);
                                                    if (errors.bankAccountNumber) setErrors(prev => ({ ...prev, bankAccountNumber: "" }));
                                                }}
                                                className={`bg-darkBackgroundV1/50 ${errors.bankAccountNumber ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                                                disabled={!isEditing}
                                            />
                                            {errors.bankAccountNumber && <p className="text-red-500 text-xs">{errors.bankAccountNumber}</p>}
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="bankAccountName" className="flex items-center gap-1">
                                                <Icon path={mdiAccountDetailsOutline} size={0.7} /> Tên chủ thẻ <span className="text-red-500">*</span>
                                            </Label>
                                            <Input
                                                id="bankAccountName"
                                                placeholder="VD: NGUYEN VAN A"
                                                value={bankAccountName}
                                                onChange={(e) => {
                                                    setBankAccountName(e.target.value.toUpperCase());
                                                    if (errors.bankAccountName) setErrors(prev => ({ ...prev, bankAccountName: "" }));
                                                }}
                                                className={`bg-darkBackgroundV1/50 ${errors.bankAccountName ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                                                disabled={!isEditing}
                                            />
                                            {errors.bankAccountName && <p className="text-red-500 text-xs">{errors.bankAccountName}</p>}
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-x-4 gap-y-2 w-full items-stretch">
                                    {/* COURT IMAGES HEADER */}
                                    <div className="flex items-center gap-2 min-h-8">
                                        <Label>
                                            Ảnh sân thực tế <span className="text-red-500">*</span>
                                        </Label>
                                        <span className="text-sm text-neutral-400 italic">(Đăng tải tối thiểu 1 ảnh)</span>
                                    </div>

                                    {/* BUSINESS LICENSE HEADER */}
                                    <div className="flex items-center min-h-8">
                                        <Label>
                                            Giấy phép hoạt động kinh doanh <span className="text-red-500">*</span>
                                        </Label>
                                    </div>

                                    {/* COURT IMAGES UPLOAD */}
                                    <div className={`w-full h-full p-4 rounded-lg border-2 border-dashed bg-darkBackgroundV1/30 flex flex-col justify-center ${errors.courtImages ? "border-red-500" : "border-darkBorderV1"}`}>
                                        {courtImages.length > 0 && (
                                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4 w-full">
                                                {courtImages.map((url, index) => (
                                                    <div key={index} className="w-full relative aspect-video rounded-lg overflow-hidden border border-darkBorderV1 group bg-neutral-900/50">
                                                        <Image src={url} alt={`Court Image ${index + 1}`} fill className="object-contain" />
                                                        {isEditing && (
                                                            <button
                                                                type="button"
                                                                onClick={() => removeCourtImage(index)}
                                                                className="absolute inset-0 z-10 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-red-500"
                                                            >
                                                                <Icon path={mdiTrashCanOutline} size={0.8} />
                                                            </button>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                        {isEditing && (
                                            <label className="w-full flex flex-col items-center justify-center cursor-pointer transition-all gap-1 text-neutral-400 hover:text-accent mt-2">
                                                <Icon path={mdiCloudUploadOutline} size={1} />
                                                <span className="text-sm font-semibold">{courtImages.length > 0 ? "Tải thêm ảnh sân" : "Tải ảnh sân"}</span>
                                                <input
                                                    type="file"
                                                    multiple
                                                    accept="image/*"
                                                    onChange={handleCourtImagesUpload}
                                                    className="hidden"
                                                    disabled={uploadImageMutation.isPending}
                                                />
                                            </label>
                                        )}
                                        {errors.courtImages && <p className="text-red-500 text-xs text-center mt-2">{errors.courtImages}</p>}
                                    </div>

                                    {/* BUSINESS LICENSE UPLOAD */}
                                    <div className={`w-full h-full p-4 rounded-lg border-2 border-dashed bg-darkBackgroundV1/30 flex flex-col items-center justify-center ${errors.businessLicense ? "border-red-500" : "border-darkBorderV1"}`}>
                                        {businessLicense ? (
                                            <div className="w-full flex flex-col items-center justify-center">
                                                <div className="w-full max-w-[200px] relative aspect-video rounded-lg overflow-hidden border border-darkBorderV1 group bg-neutral-900/50 mb-3">
                                                    <Image src={businessLicense} alt="Business License" fill className="object-contain" />
                                                    {isEditing && (
                                                        <button
                                                            type="button"
                                                            onClick={removeBusinessLicense}
                                                            className="absolute inset-0 z-10 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-red-500"
                                                        >
                                                            <Icon path={mdiTrashCanOutline} size={1} />
                                                        </button>
                                                    )}
                                                </div>
                                                {isEditing && (
                                                    <label className="cursor-pointer text-sm text-accent hover:underline flex items-center gap-1 mt-2">
                                                        <Icon path={mdiCloudUploadOutline} size={0.6} /> Thay đổi ảnh
                                                        <input
                                                            type="file"
                                                            accept="image/*"
                                                            onChange={handleBusinessLicenseUpload}
                                                            className="hidden"
                                                            disabled={uploadImageMutation.isPending}
                                                        />
                                                    </label>
                                                )}
                                            </div>
                                        ) : isEditing ? (
                                            <label className="w-full h-full min-h-[5rem] flex flex-col items-center justify-center cursor-pointer transition-all gap-1 text-neutral-400 hover:text-accent">
                                                <Icon path={mdiCloudUploadOutline} size={1} />
                                                <span className="text-sm font-semibold">Tải ảnh giấy phép</span>
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={handleBusinessLicenseUpload}
                                                    className="hidden"
                                                    disabled={uploadImageMutation.isPending}
                                                />
                                            </label>
                                        ) : (
                                            <div className="w-full h-full min-h-[5rem] flex flex-col items-center justify-center gap-1 text-neutral-500">
                                                <Icon path={mdiFileDocumentOutline} size={1} />
                                                <span className="text-sm font-semibold italic">Chưa có ảnh</span>
                                            </div>
                                        )}
                                        {errors.businessLicense && <p className="text-red-500 text-xs text-center mt-2">{errors.businessLicense}</p>}
                                    </div>
                                </div>

                                {/* TERMS CHECKBOX */}
                                <div className="flex items-start space-x-3 bg-darkCardV1/50 p-4 rounded-xl border border-darkBorderV1/80 mt-4">
                                    <Checkbox
                                        id="termsAgreed"
                                        checked={isAgreedToTerms}
                                        onCheckedChange={(checked) => setIsAgreedToTerms(checked as boolean)}
                                        className="mt-1 border-neutral-500 data-[state=checked]:bg-accent data-[state=checked]:border-accent"
                                        disabled={!isEditing}
                                    />
                                    <div className="grid gap-1.5 leading-none">
                                        <label
                                            htmlFor="termsAgreed"
                                            className="text-sm font-medium leading-relaxed text-neutral-200 cursor-pointer"
                                        >
                                            Tôi cam kết các thông tin cung cấp bên trên là hoàn toàn chính xác và hợp pháp, đồng thời đồng ý với các điều khoản dịch vụ của BadmintonHub.
                                        </label>
                                    </div>
                                </div>

                                {/* SUBMIT BUTTON */}
                                <div className="pt-4 border-t border-darkBorderV1 flex justify-end gap-3">
                                    {myRequest && (myRequest.status === "REJECTED" || myRequest.status === "PENDING") && (
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            className="text-red-400 hover:text-red-400 hover:bg-red-500/10"
                                            onClick={handleCancelRequest}
                                            disabled={isSubmitting}
                                        >
                                            <Icon path={mdiTrashCanOutline} size={0.8} />
                                            Hủy đơn
                                        </Button>
                                    )}
                                    {!isEditing ? (
                                        <Button
                                            type="button"
                                            onClick={() => setIsEditing(true)}
                                            disabled={isSubmitting}
                                        >
                                            <Icon path={mdiFileDocumentEditOutline} size={0.8} />
                                            Chỉnh sửa hồ sơ
                                        </Button>
                                    ) : (
                                        <>
                                            {myRequest && (myRequest.status === "REJECTED" || myRequest.status === "PENDING") && (
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    onClick={handleCancelEdit}
                                                    disabled={isSubmitting}
                                                >
                                                    Hủy sửa
                                                </Button>
                                            )}
                                            <Button
                                                type="submit"
                                                disabled={isSubmitting || uploadImageMutation.isPending || !isAgreedToTerms}
                                            >
                                                <Icon path={mdiInvoiceTextSend} size={0.8} />
                                                {isSubmitting ? (
                                                    <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                ) : myRequest && (myRequest.status === "REJECTED" || myRequest.status === "PENDING") ? (
                                                    "Lưu cập nhật"
                                                ) : (
                                                    "Gửi hồ sơ đăng ký"
                                                )}
                                            </Button>
                                        </>
                                    )}
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </main>
            <style>{`
                .pac-container {
                    background-color: #0d1e21 !important;
                    border: 1px solid #1a3038 !important;
                    border-radius: 8px !important;
                    box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.5) !important;
                    font-family: inherit !important;
                    z-index: 99999 !important;
                    margin-top: 4px !important;
                    pointer-events: auto !important;
                }
                .pac-item {
                    border-top: 1px solid #14282c !important;
                    padding: 8px 12px !important;
                    color: #e5e7eb !important;
                    cursor: pointer !important;
                    font-size: 14px !important;
                }
                .pac-item:first-child {
                    border-top: none !important;
                }
                .pac-item:hover, .pac-item-selected {
                    background-color: #162f36 !important;
                }
                .pac-item-query {
                    color: #ffffff !important;
                    font-size: 14px !important;
                    padding-right: 4px !important;
                }
                .pac-matched {
                    color: #00ff88 !important;
                    font-weight: bold !important;
                }
                .pac-icon {
                    filter: invert(1) hue-rotate(90deg) !important;
                }
            `}</style>
            {apiKey && (
                <Script
                    src={`https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`}
                    strategy="afterInteractive"
                    onLoad={() => {
                        const triggerEvent = new Event('google-maps-loaded');
                        window.dispatchEvent(triggerEvent);
                    }}
                />
            )}
            <Footer />
        </div>
    );
}
