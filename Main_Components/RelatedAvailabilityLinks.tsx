"use client"

import * as React from "react"
import { addPropertyControls, ControlType } from "framer"

type Villa = {
    villa_id?: number
    availability_tags?: string[]
    main_photo?: string
    photos?: string[]
    price_gbp_min?: number
    price_gbp_max?: number
}

/* -------------------------
 🗓️ Availability definitions
-------------------------- */
const availabilityPages = [
    {
        slug: "30days",
        tag: "Available in next 30 days",
        label: "Available in Next 30 Days",
        description: "Villas you can book within the next 30 days.",
    },
    {
        slug: "peak",
        tag: "Peak Season 2026 Availability",
        label: "Peak Season 2026 Availability",
        description:
            "Discover villas available during the 2026 summer peak season.",
    },
    {
        slug: "summerholiday",
        tag: "Summer Holiday 2026 Availability",
        label: "Summer Holiday 2026 Availability",
        description: "Find beautiful villas ready to book for Summer 2026.",
    },
]

/* -------------------------
 🖼️ Fallback images
-------------------------- */
const fallbackImages: Record<string, string> = {
    "30days": "https://framerusercontent.com/images/availability-30days.jpg",
    peak: "https://framerusercontent.com/images/availability-peak.jpg",
    summerholiday:
        "https://framerusercontent.com/images/availability-summerholiday.jpg",
}

/* -------------------------
 🔧 Component
-------------------------- */
export default function RelatedAvailabilityLinks({
    heading = "Explore other availability options",
    apiUrl = "https://villa-api-production.up.railway.app/villas",
}: {
    heading?: string
    apiUrl?: string
}) {
    const [pathname, setPathname] = React.useState("")
    const [villas, setVillas] = React.useState<Villa[]>([])
    const [loading, setLoading] = React.useState(true)

    React.useEffect(() => {
        if (typeof window !== "undefined") {
            setPathname(window.location.pathname.toLowerCase())
        }

        fetch(apiUrl)
            .then((r) => r.json())
            .then((data: Villa[]) => setVillas(data || []))
            .catch((err) => console.error("❌ Error fetching villas:", err))
            .finally(() => setLoading(false))
    }, [apiUrl])

    // Determine which page we’re on
    const currentSlug = React.useMemo(() => {
        const match = availabilityPages.find((p) => pathname.includes(p.slug))
        return match?.slug || ""
    }, [pathname])

    // Filter related pages (exclude current one)
    const related = availabilityPages.filter((p) => p.slug !== currentSlug)

    /* -------------------------
   🧠 Group villas by tag
   - Ensure different images for each tag
  -------------------------- */
    const buckets = React.useMemo(() => {
        const map: Record<
            string,
            { villas: Villa[]; img?: string; count: number; minPrice?: number }
        > = {}

        villas.forEach((v) => {
            if (!v.availability_tags?.length) return
            v.availability_tags.forEach((tag) => {
                if (!map[tag])
                    map[tag] = {
                        villas: [],
                        img: undefined,
                        count: 0,
                        minPrice: Infinity,
                    }

                map[tag].villas.push(v)
                map[tag].count++

                const min = v.price_gbp_min || 0
                if (min > 0 && min < (map[tag].minPrice || Infinity))
                    map[tag].minPrice = min
            })
        })

        // pick one representative image per tag (randomized for variety)
        Object.keys(map).forEach((tag) => {
            const vList = map[tag].villas
            if (vList.length > 0) {
                const randomVilla =
                    vList[Math.floor(Math.random() * vList.length)]
                const img = randomVilla.main_photo || randomVilla.photos?.[0]
                map[tag].img = img
            }
        })

        return map
    }, [villas])

    // SEO Schema
    const schemaData = React.useMemo(() => {
        const baseUrl = "https://frenchmaison.co.uk"
        const items = related.map((p, idx) => ({
            "@type": "ListItem",
            position: idx + 1,
            name: p.label,
            url: `${baseUrl}/availability/${p.slug}`,
        }))
        return {
            "@context": "https://schema.org",
            "@type": "ItemList",
            name: heading,
            itemListElement: items,
        }
    }, [related, heading])

    if (loading) return <p style={{ color: "#555" }}>Loading villas...</p>

    return (
        <section
            style={{
                width: "100%",
                maxWidth: "1100px",
                margin: "4rem auto 2rem",
                padding: "0 1rem",
            }}
        >
            <h2
                style={{
                    fontSize: "1.75rem",
                    fontWeight: 700,
                    color: "#153852",
                    marginBottom: "1.5rem",
                }}
            >
                {heading}
            </h2>

            {/* Inject schema JSON-LD */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
            />

            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                    gap: "1.25rem",
                }}
            >
                {related.map((p, i) => {
                    const info = buckets[p.tag] || {}
                    const img = info.img || fallbackImages[p.slug]
                    const count = info.count || 0
                    const price =
                        info.minPrice && info.minPrice !== Infinity
                            ? `from £${Math.floor(info.minPrice).toLocaleString()}/week`
                            : ""

                    return (
                        <a
                            key={i}
                            href={`/availability/${p.slug}`}
                            style={{
                                display: "block",
                                textDecoration: "none",
                                borderRadius: "16px",
                                overflow: "hidden",
                                boxShadow:
                                    "0 2px 6px rgba(0,0,0,0.08), 0 4px 12px rgba(0,0,0,0.04)",
                                background: "#fff",
                                transition:
                                    "transform 0.25s ease, box-shadow 0.25s ease",
                            }}
                        >
                            <div
                                style={{
                                    position: "relative",
                                    width: "100%",
                                    height: "180px",
                                    backgroundColor: "#f5f5f5",
                                }}
                            >
                                {img ? (
                                    <img
                                        src={img}
                                        alt={p.label}
                                        style={{
                                            width: "100%",
                                            height: "100%",
                                            objectFit: "cover",
                                            display: "block",
                                        }}
                                    />
                                ) : (
                                    <div
                                        style={{
                                            background: "#eef2f7",
                                            width: "100%",
                                            height: "100%",
                                        }}
                                    />
                                )}
                            </div>

                            <div style={{ padding: "1rem" }}>
                                <h3
                                    style={{
                                        fontSize: "1.1rem",
                                        fontWeight: 600,
                                        color: "#153852",
                                        margin: "0 0 0.4rem",
                                    }}
                                >
                                    {p.label}
                                </h3>
                                <p
                                    style={{
                                        fontSize: "0.9rem",
                                        color: "#555",
                                        margin: 0,
                                    }}
                                >
                                    {count > 0
                                        ? `${count}+ villas available ${price}`
                                        : p.description}
                                </p>
                            </div>
                        </a>
                    )
                })}
            </div>
        </section>
    )
}

/* -------------------------
 🎛️ Framer controls
-------------------------- */
addPropertyControls(RelatedAvailabilityLinks, {
    heading: { type: ControlType.String, title: "Heading" },
    apiUrl: {
        type: ControlType.String,
        title: "API URL",
        defaultValue: "https://villa-api-production.up.railway.app/villas",
    },
})
