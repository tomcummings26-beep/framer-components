import * as React from "react"
import { useEffect, useMemo, useState } from "react"
import { addPropertyControls, ControlType } from "framer"

// ✅ Cloudflare image proxy helper (rounded + retina-safe)
const getOptimizedImage = (url: string, width: number, quality = 80) => {
    const base = "https://img.frenchmaison.co.uk/"
    if (!url) return ""

    // Round width to standard breakpoints to reduce unique transformations
    const standardWidths = [400, 800, 1200, 1600, 2000]
    const roundToNearest = (target: number) =>
        standardWidths.reduce((prev, curr) =>
            Math.abs(curr - target) < Math.abs(prev - target) ? curr : prev
        )

    // Handle device pixel ratio (retina screens)
    const dpr =
        typeof window !== "undefined"
            ? Math.min(window.devicePixelRatio || 1, 2)
            : 1

    const finalWidth = roundToNearest(Math.round(width * dpr))

    // Build Cloudflare proxy URL
    return `${base}?url=${encodeURIComponent(url)}&width=${finalWidth}&quality=${quality}`
}

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
    excludeRegion?: string
    sub_region?: string
    minCapacity?: number
    limit?: number
}

const AVAILABILITY_OPTIONS = [
    "Available in next 30 days",
    "Peak Season 2026 Availability",
    "Summer Holiday 2026 Availability",
] as const

const PAGE_MAX_WIDTH = 1360
const HOMEPAGE_MIN_INITIAL_PRICE_GBP = 3500
const SERIF_STACK =
    '"Cormorant Garamond", "Libre Baskerville", Georgia, "Times New Roman", serif'
const SECTION_INSET_DESKTOP = 20
const norm = (s: string) => s.trim().toLowerCase()

export default function VillasGrid({
    tags = [],
    maxPrice = 0,
    region,
    excludeRegion = "",
    sub_region,
    minCapacity = 0,
    limit = 12,
}: Props) {
    const [allVillas, setAllVillas] = useState<Villa[]>([])
    const [visibleCount, setVisibleCount] = useState(limit)
    const [loaded, setLoaded] = useState(false)
    const [isMobile, setIsMobile] = useState(false)
    const titleWrapperRef = React.useRef<HTMLDivElement>(null)

    useEffect(() => {
        setVisibleCount(limit)
    }, [limit])

    useEffect(() => {
        const updateViewport = () => {
            const width =
                titleWrapperRef.current?.offsetWidth || window.innerWidth
            setIsMobile(width < 768)
        }

        updateViewport()
        const observer =
            typeof ResizeObserver !== "undefined"
                ? new ResizeObserver(updateViewport)
                : null

        if (titleWrapperRef.current && observer) {
            observer.observe(titleWrapperRef.current)
        }

        window.addEventListener("resize", updateViewport)
        return () => {
            window.removeEventListener("resize", updateViewport)
            observer?.disconnect()
        }
    }, [])

    useEffect(() => {
        setLoaded(false)
        fetch("https://villa-api-production.up.railway.app/villas")
            .then((res) => res.json())
            .then((data: Villa[]) => {
                let filtered = data
                    .filter((v) => Boolean(v.main_photo))
                    .filter(
                        (v) =>
                            Array.isArray(v.availability_tags) &&
                            v.availability_tags.length > 0
                    )

                if (tags && tags.length > 0) {
                    const wanted = new Set(tags.map(norm))
                    filtered = filtered.filter((v) =>
                        (v.availability_tags || []).some((t) =>
                            wanted.has(norm(t))
                        )
                    )
                }

                if (maxPrice && maxPrice > 0) {
                    filtered = filtered.filter(
                        (v) =>
                            typeof v.price_gbp_max === "number" &&
                            v.price_gbp_max > 0 &&
                            v.price_gbp_max <= maxPrice
                    )
                }

                if (region && region.trim() !== "") {
                    filtered = filtered.filter((v) => v.region === region)
                }
                if (excludeRegion && excludeRegion.trim() !== "") {
                    filtered = filtered.filter(
                        (v) => v.region !== excludeRegion
                    )
                }
                if (sub_region && sub_region.trim() !== "") {
                    filtered = filtered.filter(
                        (v) => v.sub_region === sub_region
                    )
                }

                if (minCapacity && minCapacity > 0) {
                    filtered = filtered.filter((v) => v.capacity >= minCapacity)
                }

                setAllVillas(filtered)
            })
            .catch((err) => {
                console.error("Error fetching villas:", err)
                setAllVillas([])
            })
            .finally(() => setLoaded(true))
    }, [tags, maxPrice, region, excludeRegion, sub_region, minCapacity])

    const homepageVillas = useMemo(() => {
        const filtered = allVillas.filter((v) => {
            const min = v.price_gbp_min ?? 0
            const max = v.price_gbp_max ?? 0
            const effectivePrice = min > 0 ? min : max
            return effectivePrice >= HOMEPAGE_MIN_INITIAL_PRICE_GBP
        })

        const priceValue = (v: Villa) => {
            const min = v.price_gbp_min ?? 0
            const max = v.price_gbp_max ?? 0
            if (min > 0) return min
            if (max > 0) return max
            return Number.POSITIVE_INFINITY
        }

        filtered.sort((a, b) => {
            const capA = a.capacity || 0
            const capB = b.capacity || 0
            const pA = priceValue(a)
            const pB = priceValue(b)
            if (pA !== pB) return pA - pB
            return capA - capB
        })

        return filtered
    }, [allVillas])

    if (!loaded) return <p>Loading villas...</p>
    if (loaded && homepageVillas.length === 0) return <p>No villas found.</p>

    const visibleVillas = homepageVillas.slice(0, visibleCount)
    const hasMore = visibleCount < homepageVillas.length

    return (
        <div style={{ width: "100%" }}>
            <div style={pageShellStyle(isMobile)}>
                <div
                    ref={titleWrapperRef}
                    style={{
                        width: "100%",
                        margin: "0 0 20px 0",
                        paddingLeft: `${SECTION_INSET_DESKTOP}px`,
                        boxSizing: "border-box",
                        textAlign: "left",
                    }}
                >
                    <div style={headlineStyle(isMobile ? 24 : 30, "#153852")}>
                        Our Hand-Picked Villas for the Week:
                    </div>
                </div>

                {/* Villas grid */}
                <div
                    style={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: "20px",
                        justifyContent: "space-between",
                    }}
                >
                    {visibleVillas.map((villa) => (
                        <VillaCard key={villa.villa_id} villa={villa} />
                    ))}
                </div>

                {hasMore && (
                    <div style={{ textAlign: "center", marginTop: "20px" }}>
                        <button
                            onClick={() => setVisibleCount((c) => c + 12)}
                            style={{
                                padding: "10px 18px",
                                background: "#153852",
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
        </div>
    )
}

/* --- VillaCard --- */
function VillaCard({ villa }: { villa: Villa }) {
    const [photoIndex, setPhotoIndex] = useState(0)

    const photos = useMemo(() => {
        const list = villa.photos ? [...villa.photos] : []
        if (villa.main_photo && !list.includes(villa.main_photo)) {
            list.unshift(villa.main_photo)
        }
        return list
    }, [villa.photos, villa.main_photo])

    // 🧠 Sequential preload for Cloudflare-resized images (avoid 429s)
    useEffect(() => {
        const loadSequentially = async () => {
            for (const url of photos) {
                const img = new Image()
                img.src = getOptimizedImage(url, 800)
                await new Promise((r) => setTimeout(r, 200))
            }
        }
        loadSequentially()
    }, [photos])

    // ✅ Decode next image *before* switching — instant swap, no fade/flash
    const nextPhoto = () => {
        const next = (photoIndex + 1) % photos.length
        const img = new Image()
        img.src = getOptimizedImage(photos[next], 800)
        img.decode?.()
            .then(() => setPhotoIndex(next))
            .catch(() => setPhotoIndex(next))
    }

    const prevPhoto = () => {
        const prev = photoIndex === 0 ? photos.length - 1 : photoIndex - 1
        const img = new Image()
        img.src = getOptimizedImage(photos[prev], 800)
        img.decode?.()
            .then(() => setPhotoIndex(prev))
            .catch(() => setPhotoIndex(prev))
    }

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

    const displayTags = (villa.availability_tags || []).filter(
        (tag) => tag in tagColorMap
    )

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
            {/* 🖼 Carousel */}
            <div
                style={{
                    position: "relative",
                    width: "100%",
                    height: "232px",
                    backgroundColor: "#f5f5f5",
                    overflow: "hidden",
                }}
            >
                {photos.map((url, i) => (
                    <img
                        key={i}
                        src={getOptimizedImage(url, 800)}
                        alt={villa.name}
                        width="800"
                        height="600"
                        decoding="async"
                        loading={i === 0 ? "eager" : "lazy"}
                        style={{
                            position: "absolute",
                            inset: 0,
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                            display: i === photoIndex ? "block" : "none",
                        }}
                    />
                ))}

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

            {/* Details */}
            <div
                style={{
                    padding: "10px 16px 16px",
                    flex: "1",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    fontFamily: '"Inter", "Helvetica Neue", Arial, sans-serif',
                }}
            >
                <div>
                    <h3
                        style={{
                            fontSize: "18px",
                            marginBottom: "4px",
                            fontWeight: 600,
                            color: "#153852",
                            lineHeight: 1.15,
                        }}
                    >
                        {villa.name}
                    </h3>
                    <p
                        style={{
                            color: "#6b7280",
                            marginBottom: "6px",
                            fontWeight: 400,
                            fontSize: "13px",
                            lineHeight: 1.35,
                        }}
                    >
                        {villa.region} – {villa.sub_region}
                    </p>
                    <p
                        style={{
                            marginBottom: "8px",
                            fontWeight: 400,
                            color: "#111827",
                            fontSize: "13px",
                            lineHeight: 1.38,
                        }}
                    >
                        Sleeps {villa.capacity} • {villa.bedrooms} bedrooms •{" "}
                        {villa.bathrooms} bathrooms
                    </p>
                    <p
                        style={{
                            fontWeight: 600,
                            marginBottom: "12px",
                            color: "#111827",
                            fontSize: "15px",
                            lineHeight: 1.25,
                        }}
                    >
                        {priceLabel}
                    </p>

                    {/* Tags */}
                    <div style={{ marginBottom: "14px" }}>
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
                </div>

                <a
                    href={`/villa?id=${villa.villa_id}`}
                    style={{
                        display: "inline-block",
                        padding: "10px 14px",
                        padding: "10px 16px",
                        background: "#153852",
                        color: "white",
                        borderRadius: "10px",
                        textDecoration: "none",
                        fontWeight: 600,
                        fontSize: "15px",
                        lineHeight: 1.2,
                        alignSelf: "flex-start",
                    }}
                >
                    View Property →
                </a>
            </div>
        </div>
    )
}

const arrowStyle = (side: "left" | "right") => ({
    position: "absolute" as const,
    top: "50%",
    [side]: "12px",
    transform: "translateY(-50%)",
    background: "rgba(17,24,39,0.42)",
    color: "white",
    border: "none",
    borderRadius: "50%",
    width: "34px",
    height: "34px",
    fontSize: "22px",
    fontWeight: 600,
    cursor: "pointer",
    backdropFilter: "blur(6px)",
})

const headlineStyle = (
    fontSize: number,
    color: string
): React.CSSProperties => ({
    fontFamily: SERIF_STACK,
    fontSize,
    fontWeight: 500,
    lineHeight: 0.92,
    letterSpacing: "-0.03em",
    color,
    textWrap: "balance",
})

const pageShellStyle = (isMobile: boolean): React.CSSProperties => ({
    width: "100%",
    maxWidth: PAGE_MAX_WIDTH,
    margin: "0 auto",
    padding: isMobile ? "0 16px" : "0 24px",
    boxSizing: "border-box",
})

// Framer controls
addPropertyControls(VillasGrid, {
    tags: {
        type: ControlType.Array,
        title: "Tags",
        defaultValue: [],
        propertyControl: {
            type: ControlType.Enum,
            options: AVAILABILITY_OPTIONS,
        },
    },
    maxPrice: {
        type: ControlType.Number,
        title: "Max Price (£)",
        min: 0,
        defaultValue: 0,
    },
    region: { type: ControlType.String, title: "Region" },
    excludeRegion: { type: ControlType.String, title: "Exclude Region" },
    sub_region: { type: ControlType.String, title: "Sub Region" },
    minCapacity: {
        type: ControlType.Number,
        title: "Min Capacity",
        min: 0,
        defaultValue: 0,
    },
    limit: {
        type: ControlType.Number,
        title: "Initial Limit",
        defaultValue: 12,
        min: 1,
    },
})
