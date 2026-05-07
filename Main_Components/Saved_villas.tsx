"use client"

import * as React from "react"
import { useEffect, useMemo, useState } from "react"
import { addPropertyControls, ControlType } from "framer"

type SavedVilla = {
    villa_id: number
    name: string
    region_label: string
    main_photo: string
    price_gbp_min?: number
    price_gbp_max?: number
    url: string
}

type Props = {
    heading?: string
    intro?: string
    emptyHeading?: string
    emptyBody?: string
    browsePath?: string
    browseLabel?: string
}

const SAVED_VILLAS_STORAGE_KEY = "fm_saved_villas"
const ACCENT = "#153852"
const BORDER = "#e5e7eb"
const TEXT_MUTED = "#6b7280"
const SOFT_BG = "#fbfaf7"

function getSavedVillas(): SavedVilla[] {
    if (typeof window === "undefined") return []

    try {
        const raw = window.localStorage.getItem(SAVED_VILLAS_STORAGE_KEY)
        if (!raw) return []

        const parsed = JSON.parse(raw)
        return Array.isArray(parsed) ? parsed : []
    } catch {
        return []
    }
}

function writeSavedVillas(savedVillas: SavedVilla[]) {
    if (typeof window === "undefined") return
    window.localStorage.setItem(
        SAVED_VILLAS_STORAGE_KEY,
        JSON.stringify(savedVillas)
    )
}

function formatCurrency(value?: number) {
    if (!value || value <= 0) return "Price on request"
    return `£${Math.round(value).toLocaleString()}`
}

function getOptimizedImage(url: string, width: number, quality = 80) {
    const base = "https://img.frenchmaison.co.uk/"
    if (!url) return ""
    return `${base}?url=${encodeURIComponent(url)}&width=${width}&quality=${quality}`
}

export default function SavedVillasPage({
    heading = "Your saved villas",
    intro = "Saved villas are stored on this device, so you can return to them later without creating an account or logging in.",
    emptyHeading = "No saved villas yet",
    emptyBody = "When you save a villa from a property page, it will appear here so you can compare options and come back to them later.",
    browsePath = "/villatype/villas",
    browseLabel = "Browse villas",
}: Props) {
    const [savedVillas, setSavedVillas] = useState<SavedVilla[]>([])
    const [isMobile, setIsMobile] = useState(false)

    useEffect(() => {
        const updateViewport = () => {
            setIsMobile(window.innerWidth < 768)
        }

        updateViewport()
        window.addEventListener("resize", updateViewport)

        return () => window.removeEventListener("resize", updateViewport)
    }, [])

    useEffect(() => {
        const syncSavedVillas = () => {
            setSavedVillas(getSavedVillas())
        }

        syncSavedVillas()
        window.addEventListener("storage", syncSavedVillas)

        return () => window.removeEventListener("storage", syncSavedVillas)
    }, [])

    const sortedSavedVillas = useMemo(() => [...savedVillas], [savedVillas])

    const removeSavedVilla = (villaId: number) => {
        const filtered = savedVillas.filter(
            (villa) => villa.villa_id !== villaId
        )
        setSavedVillas(filtered)
        writeSavedVillas(filtered)
    }

    const clearSavedVillas = () => {
        setSavedVillas([])
        writeSavedVillas([])
    }

    return (
        <section
            style={{
                width: "100%",
                maxWidth: "1360px",
                margin: "0 auto",
                padding: isMobile ? "20px" : "32px 24px",
                boxSizing: "border-box",
                fontFamily:
                    'Inter, "Inter Variable", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                color: ACCENT,
            }}
        >
            <div
                style={{
                    borderRadius: "24px",
                    border: `1px solid ${BORDER}`,
                    background: SOFT_BG,
                    padding: isMobile ? "22px" : "28px",
                }}
            >
                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: isMobile ? "flex-start" : "flex-end",
                        gap: 16,
                        flexDirection: isMobile ? "column" : "row",
                        marginBottom: 24,
                    }}
                >
                    <div style={{ maxWidth: 760 }}>
                        <h1
                            style={{
                                margin: 0,
                                fontSize: isMobile ? "32px" : "42px",
                                lineHeight: 1.08,
                                fontWeight: 800,
                                letterSpacing: "-0.03em",
                            }}
                        >
                            {heading}
                        </h1>

                        <p
                            style={{
                                margin: "12px 0 0",
                                fontSize: isMobile ? "16px" : "17px",
                                lineHeight: 1.7,
                                color: "#555",
                            }}
                        >
                            {intro}
                        </p>
                    </div>

                    {sortedSavedVillas.length > 0 && (
                        <button
                            onClick={clearSavedVillas}
                            style={{
                                border: `1px solid ${BORDER}`,
                                background: "#fff",
                                color: ACCENT,
                                minHeight: "44px",
                                padding: "0 16px",
                                borderRadius: "999px",
                                fontSize: "14px",
                                fontWeight: 700,
                                cursor: "pointer",
                                whiteSpace: "nowrap",
                            }}
                        >
                            Clear saved villas
                        </button>
                    )}
                </div>

                {sortedSavedVillas.length === 0 ? (
                    <div
                        style={{
                            borderRadius: "20px",
                            border: `1px solid ${BORDER}`,
                            background: "#fff",
                            padding: isMobile ? "22px" : "26px",
                        }}
                    >
                        <div
                            style={{
                                fontSize: isMobile ? "24px" : "28px",
                                lineHeight: 1.15,
                                fontWeight: 800,
                                marginBottom: 10,
                            }}
                        >
                            {emptyHeading}
                        </div>
                        <p
                            style={{
                                margin: 0,
                                fontSize: "15px",
                                lineHeight: 1.7,
                                color: "#555",
                                maxWidth: 620,
                            }}
                        >
                            {emptyBody}
                        </p>

                        <a
                            href={browsePath}
                            style={{
                                display: "inline-flex",
                                alignItems: "center",
                                justifyContent: "center",
                                marginTop: 18,
                                minHeight: "48px",
                                padding: "0 18px",
                                borderRadius: "12px",
                                background: ACCENT,
                                color: "#fff",
                                textDecoration: "none",
                                fontSize: "15px",
                                fontWeight: 800,
                            }}
                        >
                            {browseLabel}
                        </a>
                    </div>
                ) : (
                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns: isMobile
                                ? "1fr"
                                : "repeat(3, minmax(0, 1fr))",
                            gap: "18px",
                        }}
                    >
                        {sortedSavedVillas.map((villa) => {
                            const priceText =
                                villa.price_gbp_min && villa.price_gbp_max
                                    ? `${formatCurrency(villa.price_gbp_min)} – ${formatCurrency(villa.price_gbp_max)} / week`
                                    : villa.price_gbp_min
                                      ? `${formatCurrency(villa.price_gbp_min)} / week`
                                      : "Price on request"

                            return (
                                <div
                                    key={villa.villa_id}
                                    style={{
                                        background: "#fff",
                                        borderRadius: "18px",
                                        overflow: "hidden",
                                        border: `1px solid ${BORDER}`,
                                        boxShadow:
                                            "0 8px 22px rgba(15, 23, 42, 0.05)",
                                    }}
                                >
                                    <div
                                        style={{
                                            width: "100%",
                                            aspectRatio: "4 / 3",
                                            background:
                                                "linear-gradient(180deg, #eef4f8 0%, #e6ecef 100%)",
                                        }}
                                    >
                                        {villa.main_photo ? (
                                            <img
                                                src={getOptimizedImage(
                                                    villa.main_photo,
                                                    700,
                                                    80
                                                )}
                                                alt={villa.name}
                                                style={{
                                                    width: "100%",
                                                    height: "100%",
                                                    objectFit: "cover",
                                                    display: "block",
                                                }}
                                            />
                                        ) : null}
                                    </div>

                                    <div style={{ padding: "18px" }}>
                                        <div
                                            style={{
                                                fontSize: "24px",
                                                lineHeight: 1.14,
                                                fontWeight: 800,
                                                letterSpacing: "-0.02em",
                                                marginBottom: 8,
                                            }}
                                        >
                                            {villa.name}
                                        </div>

                                        <div
                                            style={{
                                                fontSize: "14px",
                                                lineHeight: 1.55,
                                                color: TEXT_MUTED,
                                                marginBottom: 10,
                                            }}
                                        >
                                            {villa.region_label}
                                        </div>

                                        <div
                                            style={{
                                                fontSize: "15px",
                                                lineHeight: 1.5,
                                                color: "#374151",
                                                fontWeight: 700,
                                                marginBottom: 16,
                                            }}
                                        >
                                            {priceText}
                                        </div>

                                        <div
                                            style={{
                                                display: "flex",
                                                gap: 10,
                                                flexWrap: "wrap",
                                            }}
                                        >
                                            <a
                                                href={villa.url}
                                                style={{
                                                    display: "inline-flex",
                                                    alignItems: "center",
                                                    justifyContent: "center",
                                                    minHeight: "44px",
                                                    padding: "0 16px",
                                                    borderRadius: "12px",
                                                    background: ACCENT,
                                                    color: "#fff",
                                                    textDecoration: "none",
                                                    fontSize: "14px",
                                                    fontWeight: 800,
                                                }}
                                            >
                                                View villa
                                            </a>

                                            <button
                                                onClick={() =>
                                                    removeSavedVilla(
                                                        villa.villa_id
                                                    )
                                                }
                                                style={{
                                                    minHeight: "44px",
                                                    padding: "0 16px",
                                                    borderRadius: "12px",
                                                    background: "#fff",
                                                    color: ACCENT,
                                                    border: `1px solid ${BORDER}`,
                                                    fontSize: "14px",
                                                    fontWeight: 700,
                                                    cursor: "pointer",
                                                }}
                                            >
                                                Remove
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>
        </section>
    )
}

addPropertyControls(SavedVillasPage, {
    heading: {
        type: ControlType.String,
        title: "Heading",
        defaultValue: "Your saved villas",
    },
    intro: {
        type: ControlType.String,
        title: "Intro",
        displayTextArea: true,
        defaultValue:
            "Saved villas are stored on this device, so you can return to them later without creating an account or logging in.",
    },
    emptyHeading: {
        type: ControlType.String,
        title: "Empty Title",
        defaultValue: "No saved villas yet",
    },
    emptyBody: {
        type: ControlType.String,
        title: "Empty Body",
        displayTextArea: true,
        defaultValue:
            "When you save a villa from a property page, it will appear here so you can compare options and come back to them later.",
    },
    browsePath: {
        type: ControlType.String,
        title: "Browse Path",
        defaultValue: "/villatype/villas",
    },
    browseLabel: {
        type: ControlType.String,
        title: "Browse Button",
        defaultValue: "Browse villas",
    },
})
