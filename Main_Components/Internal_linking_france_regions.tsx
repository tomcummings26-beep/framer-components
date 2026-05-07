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

type RegionGroupKey =
    | "allfrance"
    | "southoffrance"
    | "southwestfrance"
    | "brittanyatlantic"
    | "northernfrance"
    | "paris"
    | "burgundy"
    | "loirevalley"

type GroupCard = {
    key: RegionGroupKey
    label: string
    description: string
}

type GroupStats = {
    count: number
    img?: string
    minPrice: number
}

type Props = {
    heading?: string
    intro?: string
    apiUrl?: string
    currentGroup?: RegionGroupKey
    current?: string
    currentPath?: string
    currentPage?: string
    basePath?: string
    maxCards?: number
}

const PAGE_SHELL_MAX_WIDTH = 1360
const MOBILE_BREAKPOINT = 900

const GROUP_REGION_KEYS: Record<RegionGroupKey, string[]> = {
    allfrance: [],
    southoffrance: [
        "Provence-Alpes",
        "French Riviera (Cote D'Azur)",
        "Languedoc",
        "Rhone-Alpes",
    ],
    southwestfrance: ["Aquitaine", "Dordogne", "Midi-Pyrenees"],
    brittanyatlantic: ["Brittany", "Atlantic Coast", "Ile de Re"],
    northernfrance: ["Normandy", "Champagne"],
    paris: ["Paris Region"],
    burgundy: ["Burgundy"],
    loirevalley: ["Loire Valley"],
}

const GROUP_CARDS: Record<RegionGroupKey, GroupCard> = {
    allfrance: {
        key: "allfrance",
        label: "France",
        description:
            "Explore France by major villa region, from warm southern coastlines to countryside, islands, and heritage-rich northern areas.",
    },
    southoffrance: {
        key: "southoffrance",
        label: "South of France",
        description:
            "Explore the South of France for Riviera coastlines, Provençal countryside, and warm-weather villa stays.",
    },
    southwestfrance: {
        key: "southwestfrance",
        label: "Southwest France",
        description:
            "Browse Southwest France for Dordogne countryside, Atlantic beaches, and family-friendly holiday settings.",
    },
    brittanyatlantic: {
        key: "brittanyatlantic",
        label: "Brittany & Atlantic",
        description:
            "Discover Brittany and the Atlantic coast for beach holidays, island escapes, and rugged coastal scenery.",
    },
    northernfrance: {
        key: "northernfrance",
        label: "Northern France",
        description:
            "Explore Northern France for heritage-rich regions, vineyard landscapes, and countryside holiday bases.",
    },
    paris: {
        key: "paris",
        label: "Paris Region",
        description:
            "Browse the Paris Region for city-and-country stays with easy access to the capital and surrounding areas.",
    },
    burgundy: {
        key: "burgundy",
        label: "Burgundy",
        description:
            "Find Burgundy villas and holiday homes for vineyard landscapes, food-led escapes, and slower-paced stays.",
    },
    loirevalley: {
        key: "loirevalley",
        label: "Loire Valley",
        description:
            "Explore the Loire Valley for chateaux, gardens, and relaxed stays in one of France's best-known regions.",
    },
}

const RELATED_GROUPS: Record<RegionGroupKey, RegionGroupKey[]> = {
    allfrance: [
        "southoffrance",
        "southwestfrance",
        "brittanyatlantic",
        "northernfrance",
    ],
    southoffrance: [
        "southwestfrance",
        "brittanyatlantic",
        "northernfrance",
        "loirevalley",
    ],
    southwestfrance: [
        "southoffrance",
        "brittanyatlantic",
        "northernfrance",
        "burgundy",
    ],
    brittanyatlantic: [
        "northernfrance",
        "loirevalley",
        "southwestfrance",
        "southoffrance",
    ],
    northernfrance: ["paris", "loirevalley", "burgundy", "brittanyatlantic"],
    paris: ["northernfrance", "loirevalley", "burgundy", "southoffrance"],
    burgundy: ["loirevalley", "northernfrance", "paris", "southwestfrance"],
    loirevalley: ["northernfrance", "paris", "burgundy", "southwestfrance"],
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

function getDefaultHeading(currentGroup: RegionGroupKey) {
    const currentLabel = GROUP_CARDS[currentGroup]?.label || "France"
    if (currentGroup === "allfrance") return "Explore Regions of France"
    return `Explore other France villa regions beyond ${currentLabel}`
}

function getDefaultIntro(currentGroup: RegionGroupKey) {
    const currentLabel = GROUP_CARDS[currentGroup]?.label || "this region"
    if (currentGroup === "allfrance") {
        return "Browse the main villa regions across France to compare coast, countryside, island, and city-adjacent holiday settings."
    }
    return `If ${currentLabel} is not quite the right fit, browse other villa regions across France to compare holiday settings, landscapes, and styles of stay.`
}

export default function InternalLinkingFranceRegions({
    heading = "",
    intro = "",
    apiUrl = "https://villa-api-production.up.railway.app/villas",
    currentGroup = "allfrance",
    current = "hub",
    currentPath = "",
    currentPage = "hub",
    basePath = "/popular-regions",
    maxCards = 4,
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
                console.error(
                    "Internal linking France regions API error:",
                    error
                )
            })
            .finally(() => {
                if (!isCancelled) setLoading(false)
            })

        return () => {
            isCancelled = true
        }
    }, [apiUrl])

    const relatedGroupKeys = React.useMemo(() => {
        const curated = RELATED_GROUPS[currentGroup] || []
        return curated.slice(0, Math.max(1, maxCards))
    }, [currentGroup, maxCards])

    const cards = React.useMemo(
        () => relatedGroupKeys.map((key) => GROUP_CARDS[key]).filter(Boolean),
        [relatedGroupKeys]
    )

    const groupStats = React.useMemo(() => {
        const map: Record<string, GroupStats> = {}
        const regionToGroup = new Map<string, RegionGroupKey>()

        Object.entries(GROUP_REGION_KEYS).forEach(([groupKey, regionKeys]) => {
            regionKeys.forEach((regionKey) =>
                regionToGroup.set(regionKey, groupKey as RegionGroupKey)
            )
        })

        villas.forEach((villa) => {
            const regionKey = villa.sub_region || villa.region || ""
            const groupKey = regionToGroup.get(regionKey)

            if (!groupKey || !relatedGroupKeys.includes(groupKey)) return

            if (!map[groupKey]) {
                map[groupKey] = {
                    count: 0,
                    img: undefined,
                    minPrice: Number.POSITIVE_INFINITY,
                }
            }

            const entry = map[groupKey]
            entry.count += 1

            const image = villa.main_photo || villa.photos?.[0]
            if (image && !entry.img) entry.img = image

            const minPrice = Number(villa.price_gbp_min || 0)
            if (minPrice > 0 && minPrice < entry.minPrice) {
                entry.minPrice = minPrice
            }
        })

        return map
    }, [relatedGroupKeys, villas])

    const resolvedCurrentSlug = current || currentPage
    const resolvedCurrentPath =
        currentGroup === "allfrance"
            ? ""
            : currentPath ||
              (resolvedCurrentSlug === "hub"
                  ? joinPath(basePath, currentGroup)
                  : joinPath(
                        joinPath(basePath, currentGroup),
                        resolvedCurrentSlug
                    ))

    const visibleCards =
        currentGroup === "allfrance"
            ? cards
            : cards.filter(
                  (card) => joinPath(basePath, card.key) !== resolvedCurrentPath
              )

    const resolvedHeading = heading || getDefaultHeading(currentGroup)
    const resolvedIntro = intro || getDefaultIntro(currentGroup)

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
                        maxWidth: "860px",
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
                        const stats = groupStats[card.key]
                        const image = stats?.img
                        const count = stats?.count || 0
                        const price = formatPrice(stats?.minPrice || 0)
                        const href = joinPath(basePath, card.key)

                        return (
                            <a
                                key={`${card.key}-${index}`}
                                href={href}
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

addPropertyControls(InternalLinkingFranceRegions, {
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
    currentGroup: {
        type: ControlType.Enum,
        title: "Current France Region",
        options: [
            "allfrance",
            "southoffrance",
            "southwestfrance",
            "brittanyatlantic",
            "northernfrance",
            "paris",
            "burgundy",
            "loirevalley",
        ],
        optionTitles: [
            "All France",
            "South of France",
            "Southwest France",
            "Brittany & Atlantic",
            "Northern France",
            "Paris",
            "Burgundy",
            "Loire Valley",
        ],
        defaultValue: "allfrance",
    },
    currentPage: {
        type: ControlType.String,
        title: "Legacy Slug",
        defaultValue: "hub",
        placeholder: "hub or current sub-page slug",
    },
    current: {
        type: ControlType.String,
        title: "Current Page Slug",
        defaultValue: "hub",
        placeholder: "eg frenchriviera or hub",
    },
    currentPath: {
        type: ControlType.String,
        title: "Current Full Path",
        defaultValue: "",
        placeholder: "Optional full current path override",
    },
    basePath: {
        type: ControlType.String,
        title: "Base Path",
        defaultValue: "/popular-regions",
    },
    maxCards: {
        type: ControlType.Number,
        title: "Max Cards",
        min: 2,
        max: 6,
        step: 1,
        defaultValue: 4,
    },
    apiUrl: {
        type: ControlType.String,
        title: "API URL",
        defaultValue: "https://villa-api-production.up.railway.app/villas",
    },
})
