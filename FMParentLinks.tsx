import * as React from "react"
import { addPropertyControls, ControlType, RenderTarget } from "framer"

type LinkCard = {
    title: string
    href: string
    description: string
}

type Props = {
    heading?: string
    intro?: string
    pathOverride?: string
    typeBasePath?: string
    showDebug?: boolean

    maxWidth?: number
    sidePadding?: number
    marginTop?: number
    marginBottom?: number

    backgroundColor?: string
    borderColor?: string
    cardBackground?: string
    titleColor?: string
    textColor?: string
}

type ParsedParentLinkPage = {
    groupSlug: string
    groupLabel: string
    subregionSlug?: string
    subregionLabel?: string
    typeSlug: string
    typeLabel: string
    pageKind: "group-type" | "subregion-type"
}

const MOBILE_BREAKPOINT = 900

const GROUP_LABELS: Record<string, string> = {
    southoffrance: "South of France",
    southwestfrance: "Southwest France",
    brittanyatlantic: "Brittany & Atlantic",
    northernfrance: "Northern France",
    paris: "Paris Region",
    burgundy: "Burgundy",
    loirevalley: "Loire Valley",
}

const SUBREGION_LABELS: Record<string, string> = {
    provence: "Provence",
    frenchriviera: "French Riviera",
    languedoc: "Languedoc",
    rhone: "Rhone",
    aquitaine: "Aquitaine",
    dordogne: "Dordogne",
    pyrenees: "Pyrenees",
    brittany: "Brittany",
    atlanticcoast: "Atlantic Coast",
    iledere: "Ile de Re",
    normandy: "Normandy",
    champagne: "Champagne",
    parisregion: "Paris Region",
    burgundy: "Burgundy",
    loirevalley: "Loire Valley",
}

const TYPE_LABELS: Record<string, string> = {
    "villas-with-pool": "Villas with Pools",
    "villas-with-pools": "Villas with Pools",
    "family-villas": "Family Villas",
    "large-villas": "Large Villas",
    "luxury-villas": "Luxury Villas",
}

function trimSlashes(value: string) {
    return String(value || "").replace(/^\/+|\/+$/g, "")
}

function normalisePath(value: string) {
    const trimmed = trimSlashes(String(value || ""))
    return trimmed ? `/${trimmed}` : ""
}

/**
 * Normalise a URL path. Returns "" for empty input so the caller can tell the
 * difference between "path unknown" and "path is root".
 */
function normaliseUrlPath(value: string) {
    const clean = String(value || "")
        .split("#")[0]
        .split("?")[0]
        .trim()
    if (!clean) return ""
    const trimmed = trimSlashes(clean)
    return trimmed ? `/${trimmed}` : "/"
}

function joinPath(basePath: string, slug: string) {
    const cleanBase = normalisePath(basePath)
    const cleanSlug = trimSlashes(slug)

    if (!cleanBase) {
        return cleanSlug ? `/${cleanSlug}` : "#"
    }

    return cleanSlug ? `${cleanBase}/${cleanSlug}` : cleanBase
}

function isCanvasOrEditor() {
    try {
        return RenderTarget.current() === RenderTarget.canvas
    } catch {
        return false
    }
}

function lowerFirst(value: string) {
    if (!value) return value
    return value.charAt(0).toLowerCase() + value.slice(1)
}

function parseParentLinkPage(pathname: string): ParsedParentLinkPage | null {
    const path = normaliseUrlPath(pathname)
    if (!path) return null
    const segments = trimSlashes(path).split("/").filter(Boolean)

    if (!segments.length) return null
    if (segments[0] !== "popular-regions") return null

    // Pattern 1: /popular-regions/{group}/{type}
    if (segments.length === 3) {
        const groupSlug = segments[1]
        const typeSlug = segments[2]

        const groupLabel = GROUP_LABELS[groupSlug]
        const typeLabel = TYPE_LABELS[typeSlug]

        if (!groupLabel || !typeLabel) return null

        return {
            groupSlug,
            groupLabel,
            typeSlug,
            typeLabel,
            pageKind: "group-type",
        }
    }

    // Pattern 2: /popular-regions/{group}/{subregion}/{type}
    if (segments.length === 4) {
        const groupSlug = segments[1]
        const subregionSlug = segments[2]
        const typeSlug = segments[3]

        const groupLabel = GROUP_LABELS[groupSlug]
        const subregionLabel = SUBREGION_LABELS[subregionSlug]
        const typeLabel = TYPE_LABELS[typeSlug]

        if (!groupLabel || !subregionLabel || !typeLabel) return null

        return {
            groupSlug,
            groupLabel,
            subregionSlug,
            subregionLabel,
            typeSlug,
            typeLabel,
            pageKind: "subregion-type",
        }
    }

    return null
}

export default function FMAutoParentLinks({
    heading = "",
    intro = "",
    pathOverride = "",
    typeBasePath = "/villatype/villas",
    showDebug = false,

    maxWidth = 1360,
    sidePadding = 24,
    marginTop = 32,
    marginBottom = 32,

    backgroundColor = "#faf8f3",
    borderColor = "#e7e2d8",
    cardBackground = "#ffffff",
    titleColor = "#153852",
    textColor = "#555555",
}: Props) {
    const [isMobile, setIsMobile] = React.useState(false)

    // Initial state uses pathOverride only. Empty = "path unknown" so SSR
    // will skip rendering. After hydration, useEffect fills in the real path.
    const [resolvedPath, setResolvedPath] = React.useState(() =>
        normaliseUrlPath(pathOverride)
    )

    React.useEffect(() => {
        const updateLayout = () => {
            setIsMobile(window.innerWidth <= MOBILE_BREAKPOINT)
        }

        updateLayout()
        window.addEventListener("resize", updateLayout)

        return () => window.removeEventListener("resize", updateLayout)
    }, [])

    React.useEffect(() => {
        const inEditor = isCanvasOrEditor()

        if (inEditor && pathOverride.trim()) {
            setResolvedPath(normaliseUrlPath(pathOverride))
            return
        }

        if (typeof window !== "undefined" && window.location?.pathname) {
            setResolvedPath(normaliseUrlPath(window.location.pathname))
            return
        }

        setResolvedPath(normaliseUrlPath(pathOverride))
    }, [pathOverride])

    const parsed = React.useMemo(
        () => parseParentLinkPage(resolvedPath),
        [resolvedPath]
    )

    const resolvedHeading = React.useMemo(() => {
        if (heading.trim()) return heading
        return "Explore broader collections"
    }, [heading])

    const resolvedIntro = React.useMemo(() => {
        if (intro.trim()) return intro
        if (!parsed) return ""

        if (parsed.pageKind === "subregion-type" && parsed.subregionLabel) {
            return `Use these collections to explore ${parsed.subregionLabel} within ${parsed.groupLabel} and compare ${lowerFirst(parsed.typeLabel)} across France.`
        }

        return `Use these collections to explore ${parsed.groupLabel} in context and compare ${lowerFirst(parsed.typeLabel)} across France.`
    }, [intro, parsed])

    const cards: LinkCard[] = React.useMemo(() => {
        if (!parsed) return []

        return [
            {
                title: `${parsed.groupLabel} Villas & Holiday Homes`,
                href: `/popular-regions/${parsed.groupSlug}`,
                description:
                    parsed.pageKind === "subregion-type" &&
                    parsed.subregionLabel
                        ? `Browse the wider ${parsed.groupLabel} collection, including ${parsed.subregionLabel} and other regional stays.`
                        : `Browse the wider ${parsed.groupLabel} collection and compare related regional stays.`,
            },
            {
                title: parsed.typeLabel,
                href: joinPath(typeBasePath, parsed.typeSlug),
                description: `Compare ${lowerFirst(parsed.typeLabel)} across France.`,
            },
        ]
    }, [parsed, typeBasePath])

    if (!resolvedPath) return null
    if (!parsed || !cards.length) return null

    const desktopColumns = cards.length >= 3 ? 3 : cards.length
    const gridTemplateColumns = isMobile
        ? "1fr"
        : `repeat(${Math.max(desktopColumns, 1)}, minmax(0, 1fr))`

    return (
        <section
            style={{
                width: "100%",
                maxWidth: `${maxWidth}px`,
                margin: `${marginTop}px auto ${marginBottom}px`,
                padding: `0 ${sidePadding}px`,
                boxSizing: "border-box",
                fontFamily:
                    'Inter, "Inter Variable", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
            }}
        >
            {showDebug && (
                <div
                    style={{
                        marginBottom: "12px",
                        padding: "10px 12px",
                        borderRadius: "10px",
                        border: "1px solid #d8e7d3",
                        background: "#f4fbf2",
                        color: "#245b2a",
                        fontSize: "12px",
                        lineHeight: 1.5,
                    }}
                >
                    <strong>Auto Parent Links debug</strong>
                    <div>Resolved path: {resolvedPath}</div>
                    <div>
                        Match:{" "}
                        {parsed.pageKind === "subregion-type"
                            ? `${parsed.groupLabel} / ${parsed.subregionLabel} / ${parsed.typeLabel}`
                            : `${parsed.groupLabel} / ${parsed.typeLabel}`}
                    </div>
                    <div>Type base path: {typeBasePath}</div>
                </div>
            )}

            <div
                style={{
                    borderRadius: "20px",
                    border: `1px solid ${borderColor}`,
                    background: backgroundColor,
                    padding: isMobile ? "22px" : "28px",
                }}
            >
                <h2
                    style={{
                        margin: 0,
                        fontSize: isMobile ? "28px" : "32px",
                        lineHeight: 1.15,
                        fontWeight: 700,
                        color: titleColor,
                    }}
                >
                    {resolvedHeading}
                </h2>

                {resolvedIntro ? (
                    <p
                        style={{
                            marginTop: "12px",
                            marginBottom: "24px",
                            maxWidth: "820px",
                            fontSize: isMobile ? "15px" : "16px",
                            lineHeight: 1.7,
                            color: textColor,
                        }}
                    >
                        {resolvedIntro}
                    </p>
                ) : null}

                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns,
                        gap: "18px",
                        alignItems: "stretch",
                    }}
                >
                    {cards.map((card, index) => (
                        <a
                            key={`${card.title}-${index}`}
                            href={card.href}
                            style={{
                                display: "block",
                                textDecoration: "none",
                                background: cardBackground,
                                borderRadius: "16px",
                                border: `1px solid ${borderColor}`,
                                boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                                padding: isMobile ? "18px" : "20px",
                            }}
                        >
                            <h3
                                style={{
                                    margin: 0,
                                    fontSize: isMobile ? "19px" : "20px",
                                    lineHeight: 1.3,
                                    fontWeight: 700,
                                    color: titleColor,
                                }}
                            >
                                {card.title}
                            </h3>

                            {card.description ? (
                                <p
                                    style={{
                                        margin: "10px 0 0",
                                        fontSize: "15px",
                                        lineHeight: 1.6,
                                        color: textColor,
                                    }}
                                >
                                    {card.description}
                                </p>
                            ) : null}
                        </a>
                    ))}
                </div>
            </div>
        </section>
    )
}

addPropertyControls(FMAutoParentLinks, {
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
    pathOverride: {
        type: ControlType.String,
        title: "Path Override",
        defaultValue: "",
        placeholder:
            "REQUIRED for SSR — set per page, eg /popular-regions/southoffrance/provence/family-villas",
    },
    typeBasePath: {
        type: ControlType.String,
        title: "Type Base",
        defaultValue: "/villatype/villas",
        placeholder: "/villatype/villas or /villas",
    },
    showDebug: {
        type: ControlType.Boolean,
        title: "Show Debug",
        defaultValue: false,
        enabledTitle: "Yes",
        disabledTitle: "No",
    },
    maxWidth: {
        type: ControlType.Number,
        title: "Max Width",
        defaultValue: 1360,
        min: 800,
        max: 1800,
        step: 10,
    },
    sidePadding: {
        type: ControlType.Number,
        title: "Padding",
        defaultValue: 24,
        min: 0,
        max: 80,
        step: 1,
    },
    marginTop: {
        type: ControlType.Number,
        title: "Top Margin",
        defaultValue: 32,
        min: 0,
        max: 120,
        step: 1,
    },
    marginBottom: {
        type: ControlType.Number,
        title: "Bottom Margin",
        defaultValue: 10,
        min: 0,
        max: 120,
        step: 1,
    },
    backgroundColor: {
        type: ControlType.Color,
        title: "Bg",
        defaultValue: "#faf8f3",
    },
    borderColor: {
        type: ControlType.Color,
        title: "Border",
        defaultValue: "#e7e2d8",
    },
    cardBackground: {
        type: ControlType.Color,
        title: "Card Bg",
        defaultValue: "#ffffff",
    },
    titleColor: {
        type: ControlType.Color,
        title: "Title Color",
        defaultValue: "#153852",
    },
    textColor: {
        type: ControlType.Color,
        title: "Text Color",
        defaultValue: "#555555",
    },
})
