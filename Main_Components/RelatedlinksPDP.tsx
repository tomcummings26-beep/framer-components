"use client"

import * as React from "react"
import { addPropertyControls, ControlType } from "framer"

type Villa = {
    villa_id: number
    region: string
    sub_region?: string
    main_photo?: string
    photos?: string[]
    price_gbp_min?: number
}

type Props = {
    heading?: string
    apiUrl?: string
    maxItems?: number
    fallbackVillaId?: number
}

/* -------------------------
 ✅ Allowed regions + subregions
-------------------------- */
const REGION_MAP: Record<string, string[]> = {
    "South of France": [
        "French Riviera (Cote D'Azur)",
        "Provence-Alpes",
        "Languedoc",
        "Rhone-Alpes",
    ],
    "South West France": ["Aquitaine", "Dordogne", "Midi-Pyrenees"],
    "Northern France": ["Normandy", "Champagne"],
    "Brittany & The Atlantic Coast": ["Brittany & Atlantic Coast"],
    Burgundy: ["Burgundy"],
    "Loire Valley": ["Loire Valley"],
    Paris: ["Paris Region"],
}

const DISPLAY_NAME_MAP: Record<string, string> = {
    "French Riviera (Cote D'Azur)": "French Riviera",
    "Provence-Alpes": "Provence",
    "Rhone-Alpes": "Rhone",
    "Midi-Pyrenees": "Pyrenees",
    "Brittany & Atlantic Coast": "Brittany & Atlantic Coast",
    "Ile de Re": "Île de Ré",
}

const slugify = (s: string) =>
    (s || "")
        .toLowerCase()
        .replace(/[()']/g, "")
        .replace(/&/g, "and")
        .replace(/\s+/g, "")

export default function VillaNearbyRegionsPDP({
    heading = "Explore nearby regions",
    apiUrl = "https://villa-api-production.up.railway.app/villas",
    maxItems = 6,
    fallbackVillaId = 457,
}: Props) {
    const [villas, setVillas] = React.useState<Villa[]>([])
    const [villa, setVilla] = React.useState<Villa | null>(null)
    const [loading, setLoading] = React.useState(true)

    const villaId = React.useMemo(() => {
        if (typeof window === "undefined") return fallbackVillaId
        const id = new URLSearchParams(window.location.search).get("id")
        return id ? parseInt(id) : fallbackVillaId
    }, [fallbackVillaId])

    React.useEffect(() => {
        const run = async () => {
            try {
                const res = await fetch(apiUrl)
                const data: Villa[] = await res.json()
                setVillas(data || [])
                const v = data.find((x) => x.villa_id === villaId) || null
                setVilla(v)
            } catch (e) {
                console.error("VillaNearbyRegionsPDP error:", e)
            } finally {
                setLoading(false)
            }
        }
        run()
    }, [apiUrl, villaId])

    const cards = React.useMemo(() => {
        if (!villa) return []

        const regionName = villa.region?.toLowerCase() || ""
        const subName = villa.sub_region?.toLowerCase() || ""

        const parent = Object.entries(REGION_MAP).find(([region, subs]) => {
            const regionLower = region.toLowerCase()
            return (
                regionName.includes(regionLower) ||
                subs.some((s) => s.toLowerCase() === subName)
            )
        })

        if (!parent) return []

        const [parentRegion, subRegions] = parent

        const map: Record<
            string,
            { count: number; img?: string; minPrice?: number }
        > = {}

        villas.forEach((v) => {
            if (!v.region) return
            if (v.region.toLowerCase() !== parentRegion.toLowerCase()) return

            const key = v.sub_region || v.region
            if (!key || !subRegions.includes(key)) return

            if (!map[key])
                map[key] = { count: 0, img: undefined, minPrice: Infinity }
            map[key].count++
            const img = v.main_photo || v.photos?.[0]
            if (img && !map[key].img) map[key].img = img
            const min = v.price_gbp_min || 0
            if (min > 0 && min < (map[key].minPrice || Infinity))
                map[key].minPrice = min
        })

        const currentKey = villa.sub_region || villa.region
        const related = subRegions.filter((r) => r !== currentKey && map[r])

        return related.slice(0, maxItems).map((label) => {
            const info = map[label]
            const displayLabel = DISPLAY_NAME_MAP[label] || label
            const parentSlug = slugify(parentRegion)
            const subSlug = slugify(displayLabel)
            return {
                label: displayLabel,
                url: `/popular-regions/${parentSlug}/${subSlug}`,
                count: info.count,
                img: info.img,
                minPrice:
                    info.minPrice && info.minPrice !== Infinity
                        ? info.minPrice
                        : null,
            }
        })
    }, [villa, villas, maxItems])

    // ❌ Don’t render anything if still loading or no matches
    if (loading || !villa || cards.length < 1) return null

    return (
        <section
            aria-label="Explore nearby villa regions"
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

            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                    gap: "1.25rem",
                }}
            >
                {cards.map((c, i) => (
                    <article key={i}>
                        <a
                            href={c.url}
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
                                }}
                            >
                                {c.img ? (
                                    <img
                                        src={c.img}
                                        alt={`${c.label} villas in ${villa.region}`}
                                        loading="lazy"
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
                                    {c.label} Villas & Holiday Homes
                                </h3>
                                <p
                                    style={{
                                        fontSize: "0.9rem",
                                        color: "#555",
                                        margin: 0,
                                    }}
                                >
                                    {c.count}+ villas
                                    {c.minPrice
                                        ? ` • from £${Math.floor(c.minPrice).toLocaleString()}/week`
                                        : ""}
                                </p>
                            </div>
                        </a>
                    </article>
                ))}
            </div>
        </section>
    )
}

addPropertyControls(VillaNearbyRegionsPDP, {
    heading: { type: ControlType.String, title: "Heading" },
    apiUrl: {
        type: ControlType.String,
        title: "API URL",
        defaultValue: "https://villa-api-production.up.railway.app/villas",
    },
    maxItems: {
        type: ControlType.Number,
        title: "Max Items",
        defaultValue: 6,
        min: 2,
        max: 12,
    },
    fallbackVillaId: {
        type: ControlType.Number,
        title: "Preview Villa ID",
        defaultValue: 7254,
    },
})
