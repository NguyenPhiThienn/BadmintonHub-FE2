"use client";

import React from "react";
import { Icon } from "@/components/ui/mdi-icon";
import { mdiMagnify, mdiTuneVariant } from "@mdi/js";
import { Input } from "@/components/ui/input";

export const SearchBar = () => {
  return (
    <div className="relative group">
      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 group-focus-within:text-accent transition-colors">
        <Icon path={mdiMagnify} size={0.8} />
      </div>
      <Input
        placeholder="Tìm sân, địa điểm, khu vực..."
      />
      <button className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-accent p-1 transition-colors">
        <Icon path={mdiTuneVariant} size={0.8} />
      </button>
    </div>
  );
};
