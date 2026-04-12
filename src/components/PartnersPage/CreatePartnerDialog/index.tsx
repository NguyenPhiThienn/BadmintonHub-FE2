"use client";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCreatePartner } from "@/hooks/usePartners";
import { IContact } from "@/interface/partner";
import { mdiClose, mdiHandshake, mdiLoading, mdiMinus, mdiPlus } from "@mdi/js";
import Icon from "@mdi/react";
import { useState } from "react";
import { toast } from "react-toastify";

interface CreatePartnerDialogProps {
    isOpen: boolean;
    onClose: () => void;
}

export function CreatePartnerDialog({ isOpen, onClose }: CreatePartnerDialogProps) {
    const { mutate: createPartner, isPending } = useCreatePartner();

    const [partnerName, setPartnerName] = useState("");
    const [address, setAddress] = useState("");
    const [contacts, setContacts] = useState<IContact[]>([{ name: "", phoneNumber: "" }]);

    const addContact = () => setContacts((p) => [...p, { name: "", phoneNumber: "" }]);
    const removeContact = (i: number) =>
        setContacts((p) => (p.length > 1 ? p.filter((_, idx) => idx !== i) : p));
    const updateContact = (i: number, field: keyof IContact, value: string) => {
        setContacts((p) => {
            const next = [...p];
            next[i] = { ...next[i], [field]: value };
            return next;
        });
    };

    const resetForm = () => {
        setPartnerName("");
        setAddress("");
        setContacts([{ name: "", phoneNumber: "" }]);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const missingFields: string[] = [];
        if (!partnerName.trim()) missingFields.push("Tên công ty");

        if (missingFields.length > 0) {
            toast.warning(
                <div>
                    <p className="font-semibold mb-1">Vui lòng điền đủ thông tin:</p>
                    <ul className="list-disc ml-4 text-sm">
                        {missingFields.map((field, index) => (
                            <li key={index}>{field}</li>
                        ))}
                    </ul>
                </div>
            );
            return;
        }

        const validContacts = contacts.filter((c) => c.name.trim() || c.phoneNumber.trim());
        const data = { partnerName, address, contacts: validContacts };

        createPartner(data, {
            onSuccess: () => {
                resetForm();
                onClose();
            },
        });
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent size="small">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-accent">
                        <Icon path={mdiHandshake} size={0.8} className="flex-shrink-0" />
                        <span>Thêm công ty mới</span>
                    </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-3 md:space-y-4">
                    <div className="space-y-3 md:space-y-4 max-h-[70vh] overflow-y-auto custom-scrollbar p-3 md:p-4">
                        <div className="space-y-3 md:space-y-4">
                            <div className="space-y-1">
                                <Label htmlFor="partnerName">Tên công ty</Label>
                                <Input
                                    id="partnerName"
                                    value={partnerName}
                                    onChange={(e) => setPartnerName(e.target.value)}
                                    placeholder="Tên công ty / công ty"
                                    required
                                />
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="address">Địa chỉ</Label>
                                <Input
                                    id="address"
                                    value={address}
                                    onChange={(e) => setAddress(e.target.value)}
                                    placeholder="Địa chỉ"
                                />
                            </div>
                            <div className="space-y-1">
                                <Label>Thông tin liên hệ</Label>
                                <div className="space-y-2 mb-4">
                                    {contacts.map((c, i) => (
                                        <div key={i} className="flex gap-2">
                                            <Input
                                                value={c.name}
                                                onChange={(e) => updateContact(i, "name", e.target.value)}
                                                placeholder="Họ tên liên hệ"
                                            />
                                            <Input
                                                value={c.phoneNumber}
                                                onChange={(e) => updateContact(i, "phoneNumber", e.target.value)}
                                                placeholder="Số điện thoại"
                                            />
                                            <Button
                                                type="button"
                                                size="icon"
                                                variant="destructive"
                                                onClick={() => removeContact(i)}
                                                disabled={contacts.length <= 1}
                                                className="h-10 w-10 flex-shrink-0"
                                            >
                                                <Icon path={mdiMinus} size={0.8} className="flex-shrink-0" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                                <div className="w-full flex justify-end pt-3">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={addContact}
                                    >
                                        <Icon path={mdiPlus} size={0.8} className="flex-shrink-0" />
                                        Thêm liên hệ
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose} disabled={isPending}>
                            <Icon path={mdiClose} size={0.8} className="flex-shrink-0" />
                            Hủy
                        </Button>
                        <Button type="submit" disabled={isPending}>
                            <Icon path={isPending ? mdiLoading : mdiHandshake} size={0.8} className={isPending ? "animate-spin" : ""} />
                            {isPending ? "Đang lưu..." : "Thêm công ty"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
