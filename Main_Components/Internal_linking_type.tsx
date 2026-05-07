"use client"

import * as React from "react"
import { addPropertyControls, ControlType, RenderTarget } from "framer"

type Card = {
    title: string
    slug: string
    description: string
    image: string
}

type Props = {
    heading?: string
    regionName?: string
    basePath?: string
    currentPage?: string

    hubImage?: string
    poolsImage?: string
    familyImage?: string
    largeImage?: string
    luxuryImage?: string

    showDebug?: boolean
}

function trimSlashes(value: string) {
    return String(value || "").replace(/^\/+|\/+$/g, "")
}

function normalisePath(value: string) {
    const trimmed = trimSlashes(value)
    return trimmed ? `/${trimmed}` : ""
}

function joinPath(basePath: string, slug: string) {
    const cleanBase = normalisePath(basePath)
    const cleanSlug = trimSlashes(slug)

    if (!cleanBase) {
        return cleanSlug ? `/${cleanSlug}` : "#"
    }

    return cleanSlug ? `${cleanBase}/${cleanSlug}` : cleanBase
}

function getCurrentSlug(currentPage: string, basePath: string) {
    const page = trimSlashes(currentPage)
    const base = trimSlashes(basePath)

    if (!page || page === "hub" || page === base) return ""

    if (page === "villas-with-pool" || page.endsWith("/villas-with-pool")) {
        return "villas-with-pool"
    }

    if (page === "family-villas" || page.endsWith("/family-villas")) {
        return "family-villas"
    }

    if (page === "large-villas" || page.endsWith("/large-villas")) {
        return "large-villas"
    }

    if (page === "luxury-villas" || page.endsWith("/luxury-villas")) {
        return "luxury-villas"
    }

    return ""
}

function isCanvasOrEditor() {
    try {
        return RenderTarget.current() === RenderTarget.canvas
    } catch {
        return false
    }
}

export default function RegionClusterStaticSafe({
    heading = "",
    regionName = "",
    basePath = "",
    currentPage = "hub",

    hubImage = "",
    poolsImage = "",
    familyImage = "",
    largeImage = "",
    luxuryImage = "",

    showDebug = false,
}: Props) {
    const [isMobile, setIsMobile] = React.useState(false)

    React.useEffect(() => {
        const updateIsMobile = () => {
            setIsMobile(window.innerWidth <= 900)
        }

        updateIsMobile()
        window.addEventListener("resize", updateIsMobile)

        return () => window.removeEventListener("resize", updateIsMobile)
    }, [])

    const trimmedRegionName = regionName.trim()
    const hasRegionName = trimmedRegionName.length > 0
    const hasValidBasePath = trimSlashes(basePath).length > 0

    const currentSlug = React.useMemo(
        () => getCurrentSlug(currentPage, basePath),
        [currentPage, basePath]
    )

    const hubPath = React.useMemo(() => joinPath(basePath, ""), [basePath])

    const resolvedPath = React.useMemo(
        () => (currentSlug ? joinPath(basePath, currentSlug) : hubPath),
        [basePath, currentSlug, hubPath]
    )

    const isHub = currentSlug === ""

    const cards: Card[] = React.useMemo(
        () => [
            {
                title: hasRegionName
                    ? `${trimmedRegionName} Villas`
                    : "Holiday Homes",
                slug: "",
                description: hasRegionName
                    ? `Explore our full collection of villas and holiday homes in ${trimmedRegionName}.`
                    : "Explore our full collection of villas and holiday homes.",
                image: hubImage,
            },
            {
                title: hasRegionName
                    ? `${trimmedRegionName} Villas with Pools`
                    : "Villas with Pools",
                slug: "villas-with-pool",
                description: hasRegionName
                    ? `Private-pool villas across ${trimmedRegionName}, from countryside escapes to coastal stays.`
                    : "Private-pool villas, from countryside escapes to coastal stays.",
                image: poolsImage,
            },
            {
                title: hasRegionName
                    ? `${trimmedRegionName} Family Villas`
                    : "Family Villas",
                slug: "family-villas",
                description: hasRegionName
                    ? `Well-suited villas in ${trimmedRegionName} for easy shared holidays.`
                    : "Well-suited villas for easy shared holidays.",
                image: familyImage,
            },
            {
                title: hasRegionName
                    ? `${trimmedRegionName} Large Villas`
                    : "Large Villas",
                slug: "large-villas",
                description: hasRegionName
                    ? `Spacious properties in ${trimmedRegionName} for groups and longer stays.`
                    : "Spacious properties for groups and longer stays.",
                image: largeImage,
            },
            {
                title: hasRegionName
                    ? `${trimmedRegionName} Luxury Villas`
                    : "Luxury Villas",
                slug: "luxury-villas",
                description: hasRegionName
                    ? `High-comfort stays in ${trimmedRegionName} with standout setting, style and finish.`
                    : "High-comfort stays with standout setting, style and finish.",
                image: luxuryImage,
            },
        ],
        [
            hasRegionName,
            trimmedRegionName,
            hubImage,
            poolsImage,
            familyImage,
            largeImage,
            luxuryImage,
        ]
    )

    const resolvedHeading = React.useMemo(() => {
        if (heading) return heading

        if (isHub) {
            return hasRegionName
                ? `Explore ${trimmedRegionName} villa collections`
                : "Explore Holiday Home Types"
        }

        return hasRegionName
            ? `Explore more ${trimmedRegionName} villas`
            : "Explore more holiday homes"
    }, [heading, isHub, hasRegionName, trimmedRegionName])

    const intro = React.useMemo(() => {
        return hasRegionName
            ? `Browse ${trimmedRegionName} villa collections to explore different villa types and narrow down your search.`
            : "Browse villa collections to explore different villa types and narrow down your search."
    }, [hasRegionName, trimmedRegionName])

    const visibleCards = React.useMemo(() => {
        return cards
            .map((card) => ({
                ...card,
                href: joinPath(basePath, card.slug),
            }))
            .filter((card) => card.href !== resolvedPath)
    }, [cards, basePath, resolvedPath])

    const desktopColumnCount =
        visibleCards.length >= 4 ? 4 : visibleCards.length

    const cardGridColumns = isMobile
        ? "1fr"
        : `repeat(${Math.max(desktopColumnCount, 1)}, minmax(0, 1fr))`

    const showEditorDebug = isCanvasOrEditor() || showDebug

    return (
        <section
            style={{
                width: "100%",
                maxWidth: "1360px",
                margin: "3rem auto",
                padding: "0 24px",
                boxSizing: "border-box",
                fontFamily:
                    'Inter, "Inter Variable", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
            }}
        >
            {showEditorDebug && (
                <div
                    style={{
                        marginBottom: "12px",
                        padding: "10px 12px",
                        borderRadius: "10px",
                        border: hasValidBasePath
                            ? "1px solid #d8e7d3"
                            : "1px solid #f3c2c2",
                        background: hasValidBasePath ? "#f4fbf2" : "#fff4f4",
                        color: hasValidBasePath ? "#245b2a" : "#8a1f1f",
                        fontSize: "12px",
                        lineHeight: 1.5,
                    }}
                >
                    <strong>RegionCluster debug</strong>
                    <div>Region: {trimmedRegionName || "(blank)"}</div>
                    <div>Base path: {basePath || "(blank)"}</div>
                    <div>Current page: {currentPage || "(blank)"}</div>
                    {!hasValidBasePath && (
                        <div style={{ marginTop: "4px", fontWeight: 600 }}>
                            Missing basePath — this instance needs configuring.
                        </div>
                    )}
                </div>
            )}

            <div
                style={{
                    borderRadius: "20px",
                    border: "1px solid #e7e2d8",
                    background: "#faf8f3",
                    padding: "28px",
                }}
            >
                <h2
                    style={{
                        margin: 0,
                        fontSize: "32px",
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
                        marginBottom: "12px",
                        maxWidth: "760px",
                        fontSize: "16px",
                        lineHeight: 1.7,
                        color: "#555",
                    }}
                >
                    {intro}
                </p>

                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: cardGridColumns,
                        gap: "18px",
                        alignItems: "stretch",
                    }}
                >
                    {visibleCards.map((card, i) => {
                        const isDisabled =
                            !hasValidBasePath || card.href === "#"

                        return (
                            <a
                                key={`${card.slug || "hub"}-${i}`}
                                href={isDisabled ? undefined : card.href}
                                data-href={card.href}
                                style={{
                                    display: "block",
                                    textDecoration: "none",
                                    background: "#fff",
                                    borderRadius: "16px",
                                    overflow: "hidden",
                                    border: "1px solid #e7e2d8",
                                    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                                    pointerEvents: isDisabled ? "none" : "auto",
                                    opacity: isDisabled ? 0.7 : 1,
                                }}
                            >
                                <div
                                    style={{
                                        width: "100%",
                                        height: "180px",
                                        overflow: "hidden",
                                        background: "#f3efe7",
                                    }}
                                >
                                    {card.image ? (
                                        <img
                                            src={card.image}
                                            alt={card.title}
                                            style={{
                                                width: "100%",
                                                height: "100%",
                                                objectFit: "cover",
                                                display: "block",
                                            }}
                                        />
                                    ) : null}
                                </div>

                                <div style={{ padding: "16px" }}>
                                    <h3
                                        style={{
                                            margin: 0,
                                            fontSize: "18px",
                                            fontWeight: 600,
                                            color: "#153852",
                                            lineHeight: 1.3,
                                        }}
                                    >
                                        {card.title}
                                    </h3>

                                    <p
                                        style={{
                                            marginTop: "8px",
                                            fontSize: "14px",
                                            color: "#555",
                                            lineHeight: 1.55,
                                        }}
                                    >
                                        {card.description}
                                    </p>

                                    {showEditorDebug && (
                                        <div
                                            style={{
                                                marginTop: "8px",
                                                fontSize: "11px",
                                                color: "#7a7a7a",
                                                wordBreak: "break-all",
                                            }}
                                        >
                                            {card.href}
                                        </div>
                                    )}
                                </div>
                            </a>
                        )
                    })}
                </div>
            </div>
        </section>
    )
}

addPropertyControls(RegionClusterStaticSafe, {
    heading: {
        type: ControlType.String,
        title: "Heading",
        defaultValue: "",
    },
    regionName: {
        type: ControlType.String,
        title: "Region",
        defaultValue: "",
    },
    basePath: {
        type: ControlType.String,
        title: "Base Path",
        defaultValue: "",
    },
    currentPage: {
        type: ControlType.Enum,
        title: "Current Page",
        options: [
            "hub",
            "villas-with-pool",
            "family-villas",
            "large-villas",
            "luxury-villas",
        ],
        optionTitles: [
            "Hub",
            "Villas with Pool",
            "Family Villas",
            "Large Villas",
            "Luxury Villas",
        ],
        defaultValue: "hub",
    },

    hubImage: {
        type: ControlType.String,
        title: "Hub Image URL",
        placeholder: "https://img.frenchmaison.co.uk/?url=...",
    },
    poolsImage: {
        type: ControlType.String,
        title: "Pools Image URL",
        placeholder: "https://img.frenchmaison.co.uk/?url=...",
    },
    familyImage: {
        type: ControlType.String,
        title: "Family Image URL",
        placeholder: "https://img.frenchmaison.co.uk/?url=...",
    },
    largeImage: {
        type: ControlType.String,
        title: "Large Image URL",
        placeholder: "https://img.frenchmaison.co.uk/?url=...",
    },
    luxuryImage: {
        type: ControlType.String,
        title: "Luxury Image URL",
        placeholder: "https://img.frenchmaison.co.uk/?url=...",
    },
    showDebug: {
        type: ControlType.Boolean,
        title: "Show Debug",
        defaultValue: false,
        enabledTitle: "Yes",
        disabledTitle: "No",
    },
})
