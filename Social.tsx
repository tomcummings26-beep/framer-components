"use client"

import * as React from "react"

// ✅ Cloudflare image proxy helper (same logic as VillasGrid)
const getOptimizedImage = (url: string, width: number, quality = 80) => {
    const base = "https://img.frenchmaison.co.uk/"
    if (!url) return ""

    const standardWidths = [400, 800, 1200, 1600, 2000]
    const roundToNearest = (target: number) =>
        standardWidths.reduce((prev, curr) =>
            Math.abs(curr - target) < Math.abs(prev - target) ? curr : prev
        )

    const dpr =
        typeof window !== "undefined"
            ? Math.min(window.devicePixelRatio || 1, 2)
            : 1

    const finalWidth = roundToNearest(Math.round(width * dpr))
    return `${base}?url=${encodeURIComponent(url)}&width=${finalWidth}&quality=${quality}`
}

type Villa = {
    villa_id: number
    name: string
    region: string
    sub_region?: string
    main_photo?: string
    photos?: string[]
    price_gbp_min?: number
    price_gbp_max?: number
    availability_tags?: string[]
    capacity?: number
    bedrooms?: number
    bathrooms?: number
}

type PostRecord = {
    villa_id: number
    name: string
    date: string
    post_id: string
}

const tagColorMap: Record<string, { bg: string; text: string }> = {
    "Available in next 30 days": { bg: "#f0fdf4", text: "#15803d" },
    "Summer Holiday 2026 Availability": { bg: "#eff6ff", text: "#1d4ed8" },
    "Peak Season 2026 Availability": { bg: "#fdf2f8", text: "#be185d" },
}

export default function AsSeenOnSocial() {
    const [villas, setVillas] = React.useState<Villa[]>([])

    React.useEffect(() => {
        async function loadData() {
            try {
                // 1️⃣ Fetch full villa catalogue
                const villaRes = await fetch(
                    "https://villa-api-production.up.railway.app/villas"
                )
                const allVillas: Villa[] = await villaRes.json()

                // 2️⃣ Enrich our two manual fallback villas with full API data
                const fallbackIds = [10709, 512]
                const enrichedFallbacks = fallbackIds
                    .map((id) => allVillas.find((v) => v.villa_id === id))
                    .filter(Boolean) as Villa[]

                // 3️⃣ Fetch the JSON history of posted villas (if available)
                const postsRes = await fetch(
                    "https://frenchmaisonposter-production.up.railway.app/posted_villas.json",
                    { cache: "no-store" }
                )
                const posts: PostRecord[] = postsRes.ok
                    ? await postsRes.json()
                    : []

                // 4️⃣ Find corresponding villa data for those posts
                const matched = posts
                    .map((p) =>
                        allVillas.find((v) => v.villa_id === p.villa_id)
                    )
                    .filter(Boolean) as Villa[]

                // 5️⃣ Combine: newest cron-posted first, then manual fallback ones
                setVillas([...matched, ...enrichedFallbacks])
            } catch (err) {
                console.error("Error loading social villas:", err)
            }
        }

        loadData()
    }, [])

    if (!villas.length) return null

    return (
        <section
            style={{
                padding: "20px 24px",
                maxWidth: "1200px",
                margin: "0 auto",
                fontFamily: "Inter, sans-serif",
            }}
        >
            <div
                style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "20px",
                    justifyContent: "space-between",
                }}
            >
                {villas.map((villa) => (
                    <VillaCard key={villa.villa_id} villa={villa} />
                ))}
            </div>
        </section>
    )
}

/* -----------------------------
   VillaCard (shared style)
----------------------------- */
function VillaCard({ villa }: { villa: Villa }) {
    const [photoIndex, setPhotoIndex] = React.useState(1)

    const photos = React.useMemo(() => {
        const list = villa.photos ? [...villa.photos] : []
        if (villa.main_photo && !list.includes(villa.main_photo)) {
            list.unshift(villa.main_photo)
        }
        return list
    }, [villa.photos, villa.main_photo])

    const nextPhoto = () => {
        const next = (photoIndex + 1) % photos.length
        setPhotoIndex(next)
    }

    const prevPhoto = () => {
        const prev = photoIndex === 0 ? photos.length - 1 : photoIndex - 1
        setPhotoIndex(prev)
    }

    const min = villa.price_gbp_min ? Math.floor(villa.price_gbp_min) : 0
    const max = villa.price_gbp_max ? Math.floor(villa.price_gbp_max) : 0
    const priceLabel =
        min > 0 && max > 0
            ? `£${min.toLocaleString()} – £${max.toLocaleString()} / week`
            : min > 0
              ? `£${min.toLocaleString()} / week`
              : "Price on request"

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
                    height: "200px",
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
            <div style={{ padding: "16px", flex: "1" }}>
                <h3 style={{ fontSize: "18px", marginBottom: "6px" }}>
                    {villa.name}
                </h3>
                <p style={{ color: "#666", marginBottom: "6px" }}>
                    {villa.region}
                    {villa.sub_region ? ` – ${villa.sub_region}` : ""}
                </p>
                <p style={{ marginBottom: "6px" }}>
                    Sleeps {villa.capacity} • {villa.bedrooms} bedrooms
                    {villa.bathrooms ? ` • ${villa.bathrooms} bathrooms` : ""}
                </p>
                <p style={{ fontWeight: "bold", marginBottom: "10px" }}>
                    {priceLabel}
                </p>
                <div style={{ marginBottom: "10px" }}>
                    {(villa.availability_tags || []).map((tag) => {
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
                        fontWeight: 600,
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
