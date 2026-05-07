"use client"

import * as React from "react"
import { useEffect, useMemo, useState } from "react"
import { addPropertyControls, ControlType } from "framer"

type Villa = {
    villa_id: number
    name: string
    region: string
    sub_region: string
    country: string
    capacity: number
    bedrooms: number
    bathrooms: number
    main_photo: string
    photos?: string[]
    url: string
    description: string
    availability_tags?: string[]
    price_gbp_min?: number
    price_gbp_max?: number
}

type Props = {
    tags?: string[]
    maxPrice?: number
    region?: string
    sub_region?: string
    minCapacity?: number
    limit?: number
    hideBelowGBP?: number
}

const norm = (s: string) => s.trim().toLowerCase()

export default function VillasGridStatic({
    tags = [],
    maxPrice = 0,
    region,
    sub_region,
    minCapacity = 0,
    limit = 12,
    hideBelowGBP = 3000, // default floor: £3k
}: Props) {
    const [allVillas, setAllVillas] = useState<Villa[]>([])
    const [visibleCount, setVisibleCount] = useState(limit)
    const [loaded, setLoaded] = useState(false)

    // 🧮 Price helper
    const getPrice = (v: Villa) => {
        const min = Number(v.price_gbp_min ?? 0)
        const max = Number(v.price_gbp_max ?? 0)
        if (min > 0 && max > 0) return Math.min(min, max)
        return min > 0 ? min : max > 0 ? max : 0
    }

    useEffect(() => {
        setLoaded(false)
        fetch("https://villa-api-production.up.railway.app/villas")
            .then((res) => res.json())
            .then((data: Villa[]) => {
                let filtered = data

                // 🖼️ Only villas with a photo + tags
                filtered = filtered.filter(
                    (v) => Boolean(v.main_photo) && v.availability_tags?.length
                )

                // 🏷️ Tag filter
                if (tags && tags.length > 0) {
                    const wanted = new Set(tags.map(norm))
                    filtered = filtered.filter((v) =>
                        (v.availability_tags || []).some((t) =>
                            wanted.has(norm(t))
                        )
                    )
                }

                // 💰 Max price filter
                if (maxPrice && maxPrice > 0) {
                    filtered = filtered.filter(
                        (v) =>
                            typeof v.price_gbp_max === "number" &&
                            v.price_gbp_max > 0 &&
                            v.price_gbp_max <= maxPrice
                    )
                }

                // 🌍 Region / Subregion filters
                if (region && region.trim()) {
                    filtered = filtered.filter(
                        (v) => v.region === region.trim()
                    )
                }
                if (sub_region && sub_region.trim()) {
                    filtered = filtered.filter(
                        (v) => v.sub_region === sub_region.trim()
                    )
                }

                // 👨‍👩‍👧 Capacity filter
                if (minCapacity && minCapacity > 0) {
                    filtered = filtered.filter((v) => v.capacity >= minCapacity)
                }

                // 🚫 Always hide villas under £3k (or custom threshold)
                filtered = filtered.filter((v) => getPrice(v) >= hideBelowGBP)

                // 🔽 Sort by price ascending
                filtered.sort((a, b) => getPrice(a) - getPrice(b))

                setAllVillas(filtered)
            })
            .catch((err) => {
                console.error("Error fetching villas:", err)
                setAllVillas([])
            })
            .finally(() => setLoaded(true))
    }, [tags, maxPrice, region, sub_region, minCapacity, hideBelowGBP])

    if (!loaded) return <p>Loading villas...</p>
    if (loaded && allVillas.length === 0)
        return <p>No villas match your filters.</p>

    const visibleVillas = allVillas.slice(0, visibleCount)
    const hasMore = visibleCount < allVillas.length

    return (
        <div style={{ width: "100%" }}>
            <div
                style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "20px",
                    justifyContent: "space-between",
                }}
            >
                {visibleVillas.map((villa) => (
                    <VillaCard
                        key={villa.villa_id}
                        villa={villa}
                        selectedTags={tags}
                    />
                ))}
            </div>

            {hasMore && (
                <div style={{ textAlign: "center", marginTop: "20px" }}>
                    <button
                        onClick={() => setVisibleCount((c) => c + 12)}
                        style={{
                            padding: "10px 18px",
                            background: "#2563eb",
                            color: "white",
                            border: "none",
                            borderRadius: "8px",
                            fontSize: "15px",
                            cursor: "pointer",
                            boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
                        }}
                    >
                        See More Villas ↓
                    </button>
                </div>
            )}
        </div>
    )
}

/* ─────────────────────────────────────────────
   🏡 Villa Card
────────────────────────────────────────────── */
function VillaCard({
    villa,
    selectedTags = [],
}: {
    villa: Villa
    selectedTags?: string[]
}) {
    const [photoIndex, setPhotoIndex] = useState(0)

    const photos = useMemo(() => {
        const list = villa.photos ? [...villa.photos] : []
        if (villa.main_photo && !list.includes(villa.main_photo))
            list.unshift(villa.main_photo)
        return list
    }, [villa.photos, villa.main_photo])

    useEffect(() => {
        photos.forEach((url) => {
            const img = new Image()
            img.src = url
        })
    }, [photos])

    const nextPhoto = () => setPhotoIndex((i) => (i + 1) % photos.length)
    const prevPhoto = () =>
        setPhotoIndex((i) => (i === 0 ? photos.length - 1 : i - 1))

    const min = villa.price_gbp_min ? Math.floor(villa.price_gbp_min) : 0
    const max = villa.price_gbp_max ? Math.floor(villa.price_gbp_max) : 0
    const priceLabel =
        min > 0 && max > 0
            ? `£${min.toLocaleString()} – £${max.toLocaleString()} / week`
            : min > 0
              ? `£${min.toLocaleString()} / week`
              : "Price on request"

    const tagColorMap: Record<string, { bg: string; text: string }> = {
        "Available in next 30 days": { bg: "#f0fdf4", text: "#15803d" },
        "Summer Holiday 2026 Availability": { bg: "#eff6ff", text: "#1d4ed8" },
        "Peak Season 2026 Availability": { bg: "#fdf2f8", text: "#be185d" },
    }

    const displayTags =
        selectedTags.length > 0
            ? (villa.availability_tags || []).filter((t) =>
                  selectedTags.includes(t)
              )
            : villa.availability_tags || []

    return (
        <div
            style={{
                flex: "1 1 calc(33% - 20px)",
                minWidth: "280px",
                maxWidth: "400px",
                border: "1px solid #ddd",
                borderRadius: "16px",
                overflow: "hidden",
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                display: "flex",
                flexDirection: "column",
            }}
        >
            <div style={{ position: "relative" }}>
                <img
                    src={photos[photoIndex] || ""}
                    alt={villa.name}
                    style={{
                        width: "100%",
                        height: "200px",
                        objectFit: "cover",
                    }}
                />
                {photos.length > 1 && (
                    <>
                        <button onClick={prevPhoto} style={arrowStyle("left")}>
                            ‹
                        </button>
                        <button onClick={nextPhoto} style={arrowStyle("right")}>
                            ›
                        </button>
                    </>
                )}
            </div>

            <div style={{ padding: "16px", flex: "1" }}>
                <h3 style={{ fontSize: "18px", marginBottom: "6px" }}>
                    {villa.name}
                </h3>
                <p style={{ color: "#666", marginBottom: "6px" }}>
                    {villa.region} – {villa.sub_region}
                </p>
                <p style={{ marginBottom: "6px" }}>
                    Sleeps {villa.capacity} • {villa.bedrooms} bedrooms •{" "}
                    {villa.bathrooms} bathrooms
                </p>
                <p style={{ fontWeight: "bold", marginBottom: "10px" }}>
                    {priceLabel}
                </p>

                <div style={{ marginBottom: "10px" }}>
                    {displayTags.map((tag) => {
                        const colors = tagColorMap[tag] || {
                            bg: "#eee",
                            text: "#333",
                        }
                        return (
                            <span
                                key={tag}
                                style={{
                                    display: "inline-block",
                                    background: colors.bg,
                                    color: colors.text,
                                    padding: "4px 8px",
                                    marginRight: "6px",
                                    marginBottom: "4px",
                                    borderRadius: "6px",
                                    fontSize: "12px",
                                }}
                            >
                                {tag}
                            </span>
                        )
                    })}
                </div>

                <a
                    href={`/villa?id=${villa.villa_id}`}
                    style={{
                        display: "inline-block",
                        padding: "10px 14px",
                        background: "#2563eb",
                        color: "white",
                        borderRadius: "8px",
                        textDecoration: "none",
                    }}
                >
                    View Property →
                </a>
            </div>
        </div>
    )
}

/* Arrow button style */
const arrowStyle = (side: "left" | "right") => ({
    position: "absolute" as const,
    top: "50%",
    [side]: "10px",
    transform: "translateY(-50%)",
    background: "rgba(0,0,0,0.5)",
    color: "white",
    border: "none",
    borderRadius: "50%",
    width: "40px",
    height: "40px",
    fontSize: "28px",
    fontWeight: "bold",
    cursor: "pointer",
})

/* ─────────────────────────────
   🔧 Framer Property Controls
────────────────────────────── */
addPropertyControls(VillasGridStatic, {
    tags: {
        type: ControlType.Array,
        title: "Tags",
        defaultValue: [],
        propertyControl: {
            type: ControlType.Enum,
            options: [
                "Available in next 30 days",
                "Peak Season 2026 Availability",
                "Summer Holiday 2026 Availability",
            ],
        },
    },
    maxPrice: {
        type: ControlType.Number,
        title: "Max Price (£)",
        min: 0,
        defaultValue: 0,
    },
    region: { type: ControlType.String, title: "Region" },
    sub_region: { type: ControlType.String, title: "Sub Region" },
    minCapacity: {
        type: ControlType.Number,
        title: "Min Capacity",
        min: 0,
        defaultValue: 0,
    },
    hideBelowGBP: {
        type: ControlType.Number,
        title: "Hide Below (£)",
        min: 0,
        defaultValue: 3000,
    },
    limit: {
        type: ControlType.Number,
        title: "Initial Limit",
        defaultValue: 12,
        min: 1,
    },
})
