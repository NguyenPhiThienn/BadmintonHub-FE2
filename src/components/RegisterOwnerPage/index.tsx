"use client";

import { Footer } from "@/components/Landing/Footer";
import { Header } from "@/components/Landing/Header";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Icon } from "@/components/ui/mdi-icon";
import { useUser } from "@/context/useUserContext";
import { useCreateOwnerRequest, useMyOwnerRequest } from "@/hooks/useOwnerRequest";
import { useUploadImage } from "@/hooks/useUpload";
import {
    mdiAlertCircleOutline,
    mdiCheckCircleOutline,
    mdiClockOutline,
    mdiCloudUploadOutline,
    mdiDeleteOutline,
    mdiFileDocumentOutline,
    mdiInvoiceTextSend,
    mdiStorefrontOutline
} from "@mdi/js";
import Image from "next/image";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

export default function RegisterOwnerPage() {
    const { user } = useUser();

    // Request status hook
    const { data: myRequestResponse, isLoading: isRequestLoading, refetch: refetchRequest } = useMyOwnerRequest(!!user);
    const myRequest = myRequestResponse?.data;

    // Mutation hooks
    const uploadImageMutation = useUploadImage();
    const createRequestMutation = useCreateOwnerRequest();

    // Form states
    const [identityCard, setIdentityCard] = useState("");
    const [courtAddress, setCourtAddress] = useState("");
    const [courtImages, setCourtImages] = useState<string[]>([]);
    const [businessLicense, setBusinessLicense] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    // If rejected, allow editing previous values
    useEffect(() => {
        if (myRequest && myRequest.status === "REJECTED") {
            setIdentityCard(myRequest.identityCard || "");
            setCourtAddress(myRequest.courtAddress || "");
            setCourtImages(myRequest.courtImages || []);
            setBusinessLicense(myRequest.businessLicense || "");
        }
    }, [myRequest]);

    if (!user) {
        return (
            <div className="min-h-screen flex flex-col bg-darkBackgroundV1">
                <Header />
                <main className="flex-1 flex flex-col items-center justify-center gap-4">
                    <Icon path={mdiStorefrontOutline} size={1.5} className="text-neutral-400 opacity-20" />
                    <p className="text-neutral-400 italic">Vui lòng đăng nhập để thực hiện đăng ký chủ sân.</p>
                    <Button variant="accent" onClick={() => window.location.href = "/"}>
                        Quay lại trang chủ
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
            toast.success("Tải ảnh sân lên thành công!");
        } catch (error: any) {
            console.error("Upload error:", error);
        }
    };

    const handleBusinessLicenseUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            const res = await uploadImageMutation.mutateAsync(file);
            if (res.data?.url) {
                setBusinessLicense(res.data.url);
                toast.success("Tải ảnh giấy phép kinh doanh thành công!");
            }
        } catch (error: any) {
            console.error("Upload error:", error);
        }
    };

    const removeCourtImage = (indexToRemove: number) => {
        setCourtImages(courtImages.filter((_, index) => index !== indexToRemove));
    };

    const removeBusinessLicense = () => {
        setBusinessLicense("");
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!identityCard.trim()) {
            toast.error("Vui lòng nhập số Căn cước công dân");
            return;
        }
        if (!courtAddress.trim()) {
            toast.error("Vui lòng nhập địa chỉ sân");
            return;
        }
        if (courtImages.length === 0) {
            toast.error("Vui lòng tải lên ít nhất một ảnh sân thực tế");
            return;
        }
        if (!businessLicense) {
            toast.error("Vui lòng tải lên Giấy phép hoạt động kinh doanh");
            return;
        }

        setIsSubmitting(true);
        try {
            const res = await createRequestMutation.mutateAsync({
                identityCard,
                courtAddress,
                courtImages,
                businessLicense,
            });
            if (res.statusCode === 201) {
                toast.success("Gửi yêu cầu đăng ký chủ sân thành công!");
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
                ) : myRequest && myRequest.status === "PENDING" ? (
                    /* PENDING STATUS CARD */
                    <div className="space-y-4">
                        <div className="bg-darkCardV1 border border-accent/20 rounded-2xl p-6 flex flex-col items-center text-center space-y-4 shadow-xl">
                            <div className="h-16 w-16 bg-accent/10 text-accent rounded-full flex items-center justify-center">
                                <Icon path={mdiClockOutline} size={1.2} className="animate-pulse" />
                            </div>
                            <div className="space-y-2">
                                <h2 className="text-2xl font-bold text-white">Đơn đăng ký của bạn đang được xét duyệt</h2>
                                <p className="text-neutral-400 text-sm max-w-xl">
                                    Hệ thống đã nhận được hồ sơ của bạn. Ban quản trị BadmintonHub đang kiểm tra tính xác thực của thông tin. Chúng tôi sẽ gửi thông báo kết quả duyệt hoặc từ chối qua email <span className="text-accent font-semibold">{user.email}</span> của bạn sớm nhất!
                                </p>
                            </div>
                        </div>

                        {/* REVIEW SUBMITTED DETAILS */}
                        <div className="bg-darkCardV1 border border-darkBorderV1 rounded-2xl p-4 space-y-4 shadow-xl">
                            <h3 className="text-lg font-bold text-white border-b border-darkBorderV1 pb-2 flex items-center gap-2">
                                <Icon path={mdiFileDocumentOutline} size={0.8} className="text-accent" />
                                Thông tin đã gửi xét duyệt
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <Label className="text-neutral-400">Số Căn cước công dân</Label>
                                    <p className="text-white font-medium text-sm bg-darkBackgroundV1/50 p-3 rounded-lg border border-darkBorderV1">{myRequest.identityCard}</p>
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-neutral-400">Địa chỉ sân hoạt động</Label>
                                    <p className="text-white font-medium text-sm bg-darkBackgroundV1/50 p-3 rounded-lg border border-darkBorderV1">{myRequest.courtAddress}</p>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-neutral-400">Ảnh sân thực tế</Label>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                    {myRequest.courtImages?.map((url: string, index: number) => (
                                        <div key={index} className="relative aspect-video rounded-lg overflow-hidden border border-darkBorderV1 bg-darkBackgroundV1/50">
                                            <Image src={url} alt={`Court ${index + 1}`} fill className="object-cover" />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-neutral-400">Giấy phép hoạt động kinh doanh</Label>
                                <div className="relative aspect-video max-w-sm rounded-lg overflow-hidden border border-darkBorderV1 bg-darkBackgroundV1/50">
                                    <Image src={myRequest.businessLicense} alt="Business License" fill className="object-cover" />
                                </div>
                            </div>
                        </div>
                    </div>
                ) : myRequest && myRequest.status === "APPROVED" ? (
                    /* APPROVED STATUS CARD */
                    <div className="bg-darkCardV1 border border-green-500/20 rounded-2xl p-8 flex flex-col items-center text-center space-y-4 shadow-xl">
                        <div className="h-20 w-20 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(34,197,94,0.2)]">
                            <Icon path={mdiCheckCircleOutline} size={1.5} />
                        </div>
                        <div className="space-y-2">
                            <h2 className="text-3xl font-extrabold text-white">Chúc mừng bạn đã là Chủ sân!</h2>
                            <p className="text-neutral-400 text-sm max-w-xl">
                                Đơn đăng ký của bạn đã được duyệt thành công! Tài khoản của bạn đã được cấp quyền của **Chủ sân (Court Owner)**.
                            </p>
                            <p className="text-accent text-sm font-semibold pt-2">
                                Vui lòng Đăng xuất và Đăng nhập lại để cập nhật quyền truy cập và sử dụng trang Quản lý dành cho Chủ sân!
                            </p>
                        </div>
                        <Button variant="accent" size="lg" className="px-8 shadow-lg shadow-accent/20" onClick={() => window.location.href = "/"}>
                            Quay lại trang chủ
                        </Button>
                    </div>
                ) : (
                    /* SUBMISSION FORM (Initial or Rejected) */
                    <div className="space-y-4">
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
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* CCCD INPUT */}
                                    <div className="space-y-2">
                                        <Label htmlFor="identityCard">
                                            Căn cước công dân (CCCD) <span className="text-red-500">*</span>
                                        </Label>
                                        <Input
                                            id="identityCard"
                                            placeholder="Nhập 12 số Căn cước công dân"
                                            value={identityCard}
                                            onChange={(e) => setIdentityCard(e.target.value)}

                                            maxLength={12}
                                        />
                                    </div>

                                    {/* ADDRESS INPUT */}
                                    <div className="space-y-2">
                                        <Label htmlFor="courtAddress">
                                            Địa chỉ cơ sở sân <span className="text-red-500">*</span>
                                        </Label>
                                        <Input
                                            id="courtAddress"
                                            placeholder="Nhập địa chỉ đầy đủ của cơ sở sân"
                                            value={courtAddress}
                                            onChange={(e) => setCourtAddress(e.target.value)}

                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-x-4 gap-y-2 w-full">
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
                                    <div className="space-y-3">
                                        <label className="w-full h-32 rounded-lg border-2 border-dashed border-darkBorderV1 hover:border-accent/40 bg-darkBackgroundV1/30 hover:bg-darkBackgroundV1/50 flex flex-col items-center justify-center cursor-pointer transition-all gap-1 text-neutral-400 hover:text-accent">
                                            <Icon path={mdiCloudUploadOutline} size={0.8} />
                                            <span className="text-sm font-semibold">Tải ảnh sân</span>
                                            <input
                                                type="file"
                                                multiple
                                                accept="image/*"
                                                onChange={handleCourtImagesUpload}
                                                className="hidden"
                                                disabled={uploadImageMutation.isPending}
                                            />
                                        </label>

                                        {courtImages.length > 0 && (
                                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
                                                {courtImages.map((url, index) => (
                                                    <div key={index} className="w-full relative aspect-video rounded-lg overflow-hidden border border-darkBorderV1 group bg-darkCardV1">
                                                        <Image src={url} alt={`Court Image ${index + 1}`} fill className="object-cover" />
                                                        <button
                                                            type="button"
                                                            onClick={() => removeCourtImage(index)}
                                                            className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-red-500"
                                                        >
                                                            <Icon path={mdiDeleteOutline} size={0.8} />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {/* BUSINESS LICENSE UPLOAD */}
                                    <div className="w-full">
                                        {businessLicense ? (
                                            <div className="w-full relative aspect-video rounded-lg overflow-hidden border border-darkBorderV1 group bg-darkCardV1">
                                                <Image src={businessLicense} alt="Business License" fill className="object-cover" />
                                                <button
                                                    type="button"
                                                    onClick={removeBusinessLicense}
                                                    className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-red-500"
                                                >
                                                    <Icon path={mdiDeleteOutline} size={0.8} />
                                                </button>
                                            </div>
                                        ) : (
                                            <label className="w-full h-32 rounded-lg border-2 border-dashed border-darkBorderV1 hover:border-accent/40 bg-darkBackgroundV1/30 hover:bg-darkBackgroundV1/50 flex flex-col items-center justify-center cursor-pointer transition-all gap-1 text-neutral-400 hover:text-accent">
                                                <Icon path={mdiCloudUploadOutline} size={0.8} />
                                                <span className="text-sm font-semibold">Tải ảnh giấy phép</span>
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
                                </div>

                                {/* SUBMIT BUTTON */}
                                <div className="pt-4 border-t border-darkBorderV1 flex justify-end">
                                    <Button
                                        type="submit"
                                        disabled={isSubmitting || uploadImageMutation.isPending}
                                    >
                                        <Icon path={mdiInvoiceTextSend} size={0.8} />
                                        {isSubmitting ? (
                                            <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        ) : (
                                            "Gửi hồ sơ đăng ký"
                                        )}
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </main>
            <Footer />
        </div>
    );
}
