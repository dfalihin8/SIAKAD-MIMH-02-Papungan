"use client";

import React from "react";

export default function BackgroundVideo() {
    return (
        <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none">
            <video
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-full object-cover opacity-100 brightness-[0.8]"
            >
                <source src="/mumet.mp4" type="video/mp4" />
                Your browser does not support the video tag.
            </video>
            {/* Overlay to ensure readability */}
            <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-[2px]"></div>
        </div>
    );
}
