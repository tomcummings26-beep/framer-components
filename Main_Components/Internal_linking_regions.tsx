"use client"

import * as React from "react"
import { addPropertyControls, ControlType } from "framer"

type Villa = {
    region?: string
    sub_region?: string
    main_photo?: string
    photos?: string[]
    price_gbp_min?: number
}

type RegionCard = {
    key: string
    label: string
    slug: string
    description: string
}

type RegionGroupKey =
    | "southoffrance"
    | "southwestfrance"
    | "brittanyatlantic"
    | "northernfrance"
    | "paris"
    | "burgundy"
    | "loirevalley"

type Props = {
    heading?: string
    intro?: string
    apiUrl?: string
    groupKey?: RegionGroupKey
    basePath?: string
    current?: string
    currentPath?: string
    currentPage?: string
}

type RegionStats = {
    count: number
    img?: string
    minPrice: number
}

const PAGE_SHELL_MAX_WIDTH = 1360
const MOBILE_BREAKPOINT = 900

const REGION_GROUPS: Record<RegionGroupKey, RegionCard[]> = {
    southoffrance: [
        {
            key: "Provence-Alpes",
            label: "Provence",
            slug: "provence",
            description:
                "Browse hand-picked villas in Provence for classic countryside stays and elegant summer escapes.",
        },
        {
            key: "French Riviera (Cote D'Azur)",
            label: "French Riviera",
            slug: "frenchriviera",
            description:
                "Explore villas on the French Riviera for coastal holidays with beaches, towns, and sunshine close by.",
        },
        {
            key: "Languedoc",
            label: "Languedoc",
            slug: "languedoc",
            description:
                "Discover Languedoc villas for relaxed stays with vineyards, villages, and Mediterranean character.",
        },
        {
            key: "Rhone-Alpes",
            label: "Rhone",
            slug: "rhone",
            description:
                "Find Rhone villas and holiday homes for mountain scenery, lakeside settings, and spacious family trips.",
        },
    ],
    southwestfrance: [
        {
            key: "Aquitaine",
            label: "Aquitaine",
            slug: "aquitaine",
            description:
                "Explore Aquitaine villas for Atlantic beaches, vineyards, and laid-back summer stays.",
        },
        {
            key: "Dordogne",
            label: "Dordogne",
            slug: "dordogne",
            description:
                "Browse Dordogne villas for family holidays, market towns, and classic countryside escapes.",
        },
        {
            key: "Midi-Pyrenees",
            label: "Pyrenees",
            slug: "pyrenees",
            description:
                "Discover Pyrenees villas for dramatic scenery, character villages, and slower-paced rural stays.",
        },
    ],
    brittanyatlantic: [
        {
            key: "Brittany",
            label: "Brittany",
            slug: "brittany",
            description:
                "Find Brittany villas for coastal holidays with beaches, harbours, and rugged Atlantic scenery.",
        },
        {
            key: "Atlantic Coast",
            label: "Atlantic Coast",
            slug: "atlanticcoast",
            description:
                "Browse Atlantic Coast villas for beach-led stays, open space, and easy summer living.",
        },
        {
            key: "Ile de Re",
            label: "Ile de Re",
            slug: "iledere",
            description:
                "Explore Ile de Re villas for stylish island stays with cycling, markets, and coastal charm.",
        },
    ],
    northernfrance: [
        {
            key: "Normandy",
            label: "Normandy",
            slug: "normandy",
            description:
                "Browse Normandy villas for heritage towns, broad beaches, and countryside family holidays.",
        },
        {
            key: "Champagne",
            label: "Champagne",
            slug: "champagne",
            description:
                "Explore Champagne villas for elegant stays among vineyards, villages, and historic cities.",
        },
    ],
    paris: [
        {
            key: "Paris Region",
            label: "Paris Region",
            slug: "parisregion",
            description:
                "Discover villas and holiday homes in the Paris Region for city-and-country stays with easy access to Paris.",
        },
    ],
    burgundy: [
        {
            key: "Burgundy",
            label: "Burgundy",
            slug: "burgundy",
            description:
                "Browse Burgundy villas for vineyard landscapes, food-led escapes, and classic French countryside stays.",
        },
    ],
    loirevalley: [
        {
            key: "Loire Valley",
            label: "Loire Valley",
            slug: "loirevalley",
            description:
                "Explore Loire Valley villas for chateaux, gardens, and relaxed stays in one of France's best-known regions.",
        },
    ],
}

function trimSlashes(value: string) {
    return value.replace(/^\/+|\/+$/g, "")
}

function joinPath(basePath: string, slug: string) {
    const cleanBase = "/" + trimSlashes(basePath)
    if (!slug) return cleanBase
    return `${cleanBase}/${trimSlashes(slug)}`
}

function formatPrice(minPrice: number) {
    if (!Number.isFinite(minPrice) || minPrice <= 0) return ""
    return `from £${Math.floor(minPrice).toLocaleString()}/week`
}

function getDefaultHeading(groupKey: RegionGroupKey) {
    const groupLabels: Record<RegionGroupKey, string> = {
        southoffrance: "South of France",
        southwestfrance: "Southwest France",
        brittanyatlantic: "Brittany & Atlantic",
        northernfrance: "Northern France",
        paris: "Paris Region",
        burgundy: "Burgundy",
        loirevalley: "Loire Valley",
    }

    return `Explore ${groupLabels[groupKey]} villa collections`
}

function getDefaultIntro(groupKey: RegionGroupKey) {
    const intros: Record<RegionGroupKey, string> = {
        southoffrance:
            "Browse the main South of France villa regions to find the right setting for your stay, from Riviera coastlines to Provençal countryside and relaxed Languedoc escapes.",
        southwestfrance:
            "Explore the main Southwest France villa regions to compare countryside, coast, and family-friendly holiday settings.",
        brittanyatlantic:
            "Browse the key Brittany and Atlantic collections to compare island, coastline, and classic seaside holiday settings.",
        northernfrance:
            "Explore Northern France collections to compare heritage-rich regions, vineyard landscapes, and countryside holiday bases.",
        paris: "Browse villas and holiday homes in and around the Paris Region for city-and-country stays with easy access to the capital.",
        burgundy:
            "Explore Burgundy villas and holiday homes for vineyard landscapes, food-led escapes, and slower-paced countryside stays.",
        loirevalley:
            "Browse Loire Valley villas and holiday homes for chateaux, gardens, and relaxed stays in one of France's best-known regions.",
    }

    return intros[groupKey]
}

export default function InternalLinkingRegions({
    heading = "",
    intro = "",
    apiUrl = "https://villa-api-production.up.railway.app/villas",
    groupKey = "southoffrance",
    basePath = "/popular-regions/southoffrance",
    current = "hub",
    currentPath = "",
    currentPage = "hub",
}: Props) {
    const [isMobile, setIsMobile] = React.useState(false)
    const [villas, setVillas] = React.useState<Villa[]>([])
    const [loading, setLoading] = React.useState(true)

    React.useEffect(() => {
        const updateLayout = () => {
            setIsMobile(window.innerWidth <= MOBILE_BREAKPOINT)
        }

        updateLayout()
        window.addEventListener("resize", updateLayout)

        return () => window.removeEventListener("resize", updateLayout)
    }, [])

    React.useEffect(() => {
        let isCancelled = false

        fetch(apiUrl)
            .then((response) => response.json())
            .then((data: Villa[]) => {
                if (!isCancelled) {
                    setVillas(Array.isArray(data) ? data : [])
                }
            })
            .catch((error) => {
                console.error("Internal linking regions API error:", error)
            })
            .finally(() => {
                if (!isCancelled) setLoading(false)
            })

        return () => {
            isCancelled = true
        }
    }, [apiUrl])

    const cards = REGION_GROUPS[groupKey] || []
    const resolvedCurrentSlug = current || currentPage
    const resolvedCurrentPath =
        currentPath ||
        (resolvedCurrentSlug === "hub"
            ? joinPath(basePath, "")
            : joinPath(basePath, resolvedCurrentSlug))

    const visibleCards = React.useMemo(
        () =>
            cards
                .map((card) => ({
                    ...card,
                    href: joinPath(basePath, card.slug),
                }))
                .filter((card) => card.href !== resolvedCurrentPath),
        [basePath, cards, resolvedCurrentPath]
    )

    const regionStats = React.useMemo(() => {
        const allowedKeys = new Set(cards.map((card) => card.key))
        const map: Record<string, RegionStats> = {}

        villas.forEach((villa) => {
            const key = villa.sub_region || villa.region || ""
            if (!allowedKeys.has(key)) return

            if (!map[key]) {
                map[key] = {
                    count: 0,
                    img: undefined,
                    minPrice: Number.POSITIVE_INFINITY,
                }
            }

            const entry = map[key]
            entry.count += 1

            const image = villa.main_photo || villa.photos?.[0]
            if (image && !entry.img) entry.img = image

            const minPrice = Number(villa.price_gbp_min || 0)
            if (minPrice > 0 && minPrice < entry.minPrice) {
                entry.minPrice = minPrice
            }
        })

        return map
    }, [cards, villas])

    const resolvedHeading = heading || getDefaultHeading(groupKey)
    const resolvedIntro = intro || getDefaultIntro(groupKey)

    const desktopColumnCount =
        visibleCards.length >= 4 ? 4 : visibleCards.length
    const gridTemplateColumns = isMobile
        ? "1fr"
        : `repeat(${Math.max(desktopColumnCount, 1)}, minmax(0, 1fr))`

    if (!visibleCards.length) return null

    return (
        <section
            style={{
                width: "100%",
                maxWidth: `${PAGE_SHELL_MAX_WIDTH}px`,
                margin: "3rem auto",
                padding: "0 24px",
                boxSizing: "border-box",
                fontFamily:
                    'Inter, "Inter Variable", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
            }}
        >
            <div
                style={{
                    borderRadius: "20px",
                    border: "1px solid #e7e2d8",
                    background: "#faf8f3",
                    padding: isMobile ? "22px" : "28px",
                }}
            >
                <h2
                    style={{
                        margin: 0,
                        fontSize: isMobile ? "28px" : "32px",
                        lineHeight: 1.15,
                        fontWeight: 700,
                        color: "#153852",
                    }}
                >
                    {resolvedHeading}
                </h2>

                <p
                    style={{
                        marginTop: "12px",
                        marginBottom: "24px",
                        maxWidth: "820px",
                        fontSize: isMobile ? "15px" : "16px",
                        lineHeight: 1.7,
                        color: "#555",
                    }}
                >
                    {resolvedIntro}
                </p>

                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns,
                        gap: "18px",
                        alignItems: "stretch",
                    }}
                >
                    {visibleCards.map((card, index) => {
                        const stats = regionStats[card.key]
                        const image = stats?.img
                        const count = stats?.count || 0
                        const price = formatPrice(stats?.minPrice || 0)

                        return (
                            <a
                                key={`${card.key}-${index}`}
                                href={card.href}
                                style={{
                                    display: "block",
                                    textDecoration: "none",
                                    background: "#fff",
                                    borderRadius: "16px",
                                    overflow: "hidden",
                                    border: "1px solid #e7e2d8",
                                    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                                }}
                            >
                                <div
                                    style={{
                                        width: "100%",
                                        aspectRatio: "4 / 3",
                                        overflow: "hidden",
                                        background:
                                            "linear-gradient(180deg, #eef4f8 0%, #e6ecef 100%)",
                                    }}
                                >
                                    {image ? (
                                        <img
                                            src={image}
                                            alt={`${card.label} villas`}
                                            style={{
                                                width: "100%",
                                                height: "100%",
                                                objectFit: "cover",
                                                display: "block",
                                            }}
                                        />
                                    ) : null}
                                </div>

                                <div
                                    style={{
                                        padding: isMobile ? "18px" : "20px",
                                    }}
                                >
                                    <h3
                                        style={{
                                            margin: 0,
                                            fontSize: isMobile
                                                ? "19px"
                                                : "20px",
                                            lineHeight: 1.25,
                                            fontWeight: 700,
                                            color: "#153852",
                                        }}
                                    >
                                        {card.label} Villas & Holiday Homes
                                    </h3>

                                    <p
                                        style={{
                                            margin: "10px 0 0",
                                            fontSize: "15px",
                                            lineHeight: 1.6,
                                            color: "#555",
                                        }}
                                    >
                                        {card.description}
                                    </p>

                                    <p
                                        style={{
                                            margin: "14px 0 0",
                                            fontSize: "14px",
                                            lineHeight: 1.5,
                                            color: "#6b7280",
                                        }}
                                    >
                                        {loading
                                            ? "Loading collection details..."
                                            : count > 0
                                              ? `${count}+ villas${price ? ` · ${price}` : ""}`
                                              : "Explore this collection"}
                                    </p>
                                </div>
                            </a>
                        )
                    })}
                </div>
            </div>
        </section>
    )
}

addPropertyControls(InternalLinkingRegions, {
    heading: {
        type: ControlType.String,
        title: "Heading",
        defaultValue: "",
    },
    intro: {
        type: ControlType.String,
        title: "Intro",
        displayTextArea: true,
        defaultValue: "",
    },
    groupKey: {
        type: ControlType.Enum,
        title: "Parent Region",
        options: [
            "southoffrance",
            "southwestfrance",
            "brittanyatlantic",
            "northernfrance",
            "paris",
            "burgundy",
            "loirevalley",
        ],
        optionTitles: [
            "South of France",
            "Southwest France",
            "Brittany & Atlantic",
            "Northern France",
            "Paris",
            "Burgundy",
            "Loire Valley",
        ],
        defaultValue: "southoffrance",
    },
    basePath: {
        type: ControlType.String,
        title: "Base Path",
        defaultValue: "/popular-regions/southoffrance",
    },
    currentPage: {
        type: ControlType.String,
        title: "Legacy Slug",
        defaultValue: "hub",
        placeholder: "hub or current sub-region slug",
    },
    current: {
        type: ControlType.String,
        title: "Current Sub-Region Slug",
        defaultValue: "hub",
        placeholder: "eg frenchriviera or hub",
    },
    currentPath: {
        type: ControlType.String,
        title: "Current Full Path",
        defaultValue: "",
        placeholder: "Optional full current path override",
    },
    apiUrl: {
        type: ControlType.String,
        title: "API URL",
        defaultValue: "https://villa-api-production.up.railway.app/villas",
    },
})
