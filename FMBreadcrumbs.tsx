"use client"

/*
 * FMAutoBreadcrumbs
 * ─────────────────
 * SSR-safe breadcrumb component for Framer. Emits both a visible <nav> and an
 * inline BreadcrumbList JSON-LD so Googlebot's first-pass HTML crawl picks up
 * the hierarchy without needing to execute JavaScript.
 *
 * IMPORTANT — for SSR to work, set the `pathOverride` property on every page
 * instance in the Framer canvas, e.g. "/popular-regions/southoffrance/provence".
 * If pathOverride is empty, the component renders nothing during SSR and only
 * fills in after hydration on the client (invisible to Googlebot's first pass).
 */

import * as React from "react"
import { addPropertyControls, ControlType, RenderTarget } from "framer"

type Crumb = {
    label: string
    href?: string
}

type Props = {
    homeLabel?: string
    homeHref?: string
    siteOrigin?: string
    pathOverride?: string
    hideOnHome?: boolean
    hideOnPaths?: string
    emitJsonLd?: boolean
    showDebug?: boolean

    maxWidth?: number
    sidePadding?: number
    marginTop?: number
    marginBottom?: number

    desktopFontSize?: number
    mobileFontSize?: number

    linkColor?: string
    currentColor?: string
    separatorColor?: string
    separator?: string
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

const AVAILABILITY_LABELS: Record<string, string> = {
    // Short slugs as they appear in the live Framer paths
    "30days": "Villas Available in Next 30 Days",
    summerholiday: "Summer Holiday Villa Availability",
    peak: "Peak Season Villas June - August",

    // Long-form slugs kept for backwards compatibility
    "villas-available-in-next-30-days": "Villas Available in Next 30 Days",
    "summer-holiday-villa-availability": "Summer Holiday Villa Availability",
    "peak-season-villas-june-august": "Peak Season Villas June - August",
}

function trimSlashes(value: string) {
    return String(value || "").replace(/^\/+|\/+$/g, "")
}

/**
 * Normalise a path. Returns "" for empty input so callers can distinguish
 * "path not yet known" from "path is the home page".
 */
function normalizePath(value: string) {
    const clean = String(value || "")
        .split("#")[0]
        .split("?")[0]
        .trim()
    if (!clean) return ""
    const trimmed = trimSlashes(clean)
    return trimmed ? `/${trimmed}` : "/"
}

function parseHiddenPaths(value: string) {
    return String(value || "")
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean)
        .map((item) => normalizePath(item))
        .filter(Boolean)
}

function isCanvasOrEditor() {
    try {
        return RenderTarget.current() === RenderTarget.canvas
    } catch {
        return false
    }
}

function fallbackLabel(slug: string) {
    return slug
        .replace(/-/g, " ")
        .replace(/\b\w/g, (char) => char.toUpperCase())
}

function getLabelForSegment(slug: string) {
    return (
        TYPE_LABELS[slug] ||
        AVAILABILITY_LABELS[slug] ||
        SUBREGION_LABELS[slug] ||
        GROUP_LABELS[slug] ||
        fallbackLabel(slug)
    )
}

function normaliseOrigin(value: string) {
    return String(value || "")
        .trim()
        .replace(/\/+$/, "")
}

function toAbsoluteUrl(origin: string, pathOrUrl: string): string {
    const input = String(pathOrUrl || "").trim()
    if (!input) return origin
    if (/^https?:\/\//i.test(input)) return input
    const path = input.startsWith("/") ? input : `/${input}`
    return `${origin}${path}`
}

function buildCrumbs(
    pathname: string,
    homeLabel: string,
    homeHref: string
): Crumb[] {
    const path = normalizePath(pathname)
    if (!path) return []
    const segments = trimSlashes(path).split("/").filter(Boolean)

    if (!segments.length) return []

    const crumbs: Crumb[] = [{ label: homeLabel, href: homeHref || "/" }]

    if (segments[0] === "popular-regions") {
        if (segments.length === 1) {
            crumbs.push({ label: "Popular Regions" })
            return crumbs
        }

        crumbs.push({
            label: "Popular Regions",
            href: "/popular-regions",
        })

        const groupSlug = segments[1]
        if (groupSlug) {
            const groupHref = `/popular-regions/${groupSlug}`

            if (segments.length === 2) {
                crumbs.push({ label: getLabelForSegment(groupSlug) })
                return crumbs
            }

            crumbs.push({
                label: getLabelForSegment(groupSlug),
                href: groupHref,
            })
        }

        const third = segments[2]
        if (third) {
            const thirdIsType = !!TYPE_LABELS[third]
            const thirdHref = `/popular-regions/${segments[1]}/${third}`

            if (thirdIsType) {
                crumbs.push({ label: getLabelForSegment(third) })
                return crumbs
            }

            if (segments.length === 3) {
                crumbs.push({ label: getLabelForSegment(third) })
                return crumbs
            }

            crumbs.push({
                label: getLabelForSegment(third),
                href: thirdHref,
            })
        }

        const fourth = segments[3]
        if (fourth) {
            crumbs.push({ label: getLabelForSegment(fourth) })
        }

        return crumbs
    }

    if (segments[0] === "villatype" && segments[1] === "villas") {
        const typeSlug = segments[2]

        crumbs.push({
            label: "Villas",
            href: "/villatype/villas",
        })

        if (typeSlug) {
            crumbs.push({ label: getLabelForSegment(typeSlug) })
        }

        return crumbs
    }

    if (segments[0] === "byavailability") {
        const availabilitySlug = segments[1]

        if (availabilitySlug) {
            crumbs.push({ label: getLabelForSegment(availabilitySlug) })
        }

        return crumbs
    }

    if (segments[0] === "french-holiday-homes") {
        crumbs.push({ label: "French Holiday Homes" })
        return crumbs
    }

    if (segments[0] === "villas") {
        if (segments.length === 1) {
            crumbs.push({ label: "Villas" })
            return crumbs
        }

        crumbs.push({
            label: "Villas",
            href: "/villatype/villas",
        })

        const second = segments[1]
        if (second) {
            crumbs.push({ label: getLabelForSegment(second) })
        }

        return crumbs
    }

    const running: string[] = []
    segments.forEach((segment, index) => {
        running.push(segment)
        const isLast = index === segments.length - 1

        crumbs.push({
            label: getLabelForSegment(segment),
            href: isLast ? undefined : `/${running.join("/")}`,
        })
    })

    return crumbs
}

export default function FMAutoBreadcrumbs({
    homeLabel = "Home",
    homeHref = "/",
    siteOrigin = "https://frenchmaison.co.uk",
    pathOverride = "",
    hideOnHome = true,
    hideOnPaths = "",
    emitJsonLd = true,
    showDebug = false,

    maxWidth = 1360,
    sidePadding = 24,
    marginTop = 24,
    marginBottom = 16,

    desktopFontSize = 14,
    mobileFontSize = 14,

    linkColor = "#6b7280",
    currentColor = "#153852",
    separatorColor = "#9ca3af",
    separator = "/",
}: Props) {
    const [isMobile, setIsMobile] = React.useState(false)

    // Initial state uses pathOverride only. Empty string = "path not yet known"
    // so SSR will skip rendering rather than falsely assuming "/" (home).
    const [resolvedPath, setResolvedPath] = React.useState(() =>
        normalizePath(pathOverride)
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

        const updatePath = () => {
            if (inEditor && pathOverride.trim()) {
                setResolvedPath(normalizePath(pathOverride))
                return
            }

            if (typeof window !== "undefined" && window.location?.pathname) {
                setResolvedPath(normalizePath(window.location.pathname))
                return
            }

            setResolvedPath(normalizePath(pathOverride))
        }

        updatePath()

        if (typeof window === "undefined") return

        const onRouteChange = () => updatePath()

        window.addEventListener("popstate", onRouteChange)
        window.addEventListener("hashchange", onRouteChange)
        window.addEventListener(
            "framer:pageview",
            onRouteChange as EventListener
        )

        const originalPushState = window.history.pushState
        const originalReplaceState = window.history.replaceState

        window.history.pushState = function (...args) {
            const result = originalPushState.apply(this, args as any)
            window.dispatchEvent(new Event("locationchange"))
            return result
        }

        window.history.replaceState = function (...args) {
            const result = originalReplaceState.apply(this, args as any)
            window.dispatchEvent(new Event("locationchange"))
            return result
        }

        window.addEventListener("locationchange", onRouteChange)

        return () => {
            window.removeEventListener("popstate", onRouteChange)
            window.removeEventListener("hashchange", onRouteChange)
            window.removeEventListener(
                "framer:pageview",
                onRouteChange as EventListener
            )
            window.removeEventListener("locationchange", onRouteChange)

            window.history.pushState = originalPushState
            window.history.replaceState = originalReplaceState
        }
    }, [pathOverride])

    const crumbs = React.useMemo(
        () => buildCrumbs(resolvedPath, homeLabel, homeHref),
        [resolvedPath, homeLabel, homeHref]
    )

    const hiddenPaths = React.useMemo(
        () => parseHiddenPaths(hideOnPaths),
        [hideOnPaths]
    )

    const origin = React.useMemo(
        () => normaliseOrigin(siteOrigin),
        [siteOrigin]
    )

    const jsonLd = React.useMemo(() => {
        if (!emitJsonLd) return null
        if (!resolvedPath) return null
        if (!crumbs.length) return null
        return {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: crumbs.map((crumb, index) => ({
                "@type": "ListItem",
                position: index + 1,
                name: crumb.label,
                item: toAbsoluteUrl(origin, crumb.href ?? resolvedPath),
            })),
        }
    }, [crumbs, resolvedPath, emitJsonLd, origin])

    // Guard clauses. Order matters — don't render anything if path is unknown.
    if (!resolvedPath) return null

    const shouldHide =
        (hideOnHome && resolvedPath === "/") ||
        hiddenPaths.includes(resolvedPath)

    if (shouldHide) return null
    if (!crumbs.length) return null

    const fontSize = isMobile ? mobileFontSize : desktopFontSize
    const inEditor = isCanvasOrEditor()

    return (
        <nav
            aria-label="Breadcrumb"
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
                        marginBottom: "10px",
                        padding: "10px 12px",
                        borderRadius: "10px",
                        border: "1px solid #d8e7d3",
                        background: "#f4fbf2",
                        color: "#245b2a",
                        fontSize: "12px",
                        lineHeight: 1.5,
                    }}
                >
                    <strong>Breadcrumb debug</strong>
                    <div>Resolved path: {resolvedPath}</div>
                    <div>
                        Hidden paths: {hiddenPaths.join(", ") || "(none)"}
                    </div>
                    <div>
                        Mode:{" "}
                        {inEditor && pathOverride.trim()
                            ? "Editor override"
                            : "Automatic"}
                    </div>
                    <div>JSON-LD: {jsonLd ? "emitted" : "off"}</div>
                </div>
            )}

            {jsonLd ? (
                <script
                    type="application/ld+json"
                    // eslint-disable-next-line react/no-danger
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify(jsonLd),
                    }}
                />
            ) : null}

            <ol
                style={{
                    margin: 0,
                    padding: 0,
                    listStyle: "none",
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "6px",
                    alignItems: "center",
                    fontSize: `${fontSize}px`,
                    lineHeight: 1.5,
                }}
            >
                {crumbs.map((crumb, index) => {
                    const isLast = index === crumbs.length - 1
                    const hasHref = !!crumb.href

                    return (
                        <React.Fragment key={`${crumb.label}-${index}`}>
                            <li
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                }}
                            >
                                {isLast || !hasHref ? (
                                    <span
                                        aria-current={
                                            isLast ? "page" : undefined
                                        }
                                        style={{
                                            color: isLast
                                                ? currentColor
                                                : linkColor,
                                            fontWeight: isLast ? 600 : 400,
                                        }}
                                    >
                                        {crumb.label}
                                    </span>
                                ) : (
                                    <a
                                        href={crumb.href}
                                        style={{
                                            color: linkColor,
                                            textDecoration: "none",
                                        }}
                                    >
                                        {crumb.label}
                                    </a>
                                )}
                            </li>

                            {!isLast && (
                                <li
                                    aria-hidden="true"
                                    style={{
                                        color: separatorColor,
                                        userSelect: "none",
                                    }}
                                >
                                    {separator}
                                </li>
                            )}
                        </React.Fragment>
                    )
                })}
            </ol>
        </nav>
    )
}

addPropertyControls(FMAutoBreadcrumbs, {
    homeLabel: {
        type: ControlType.String,
        title: "Home Label",
        defaultValue: "Home",
    },
    homeHref: {
        type: ControlType.String,
        title: "Home Href",
        defaultValue: "/",
    },
    siteOrigin: {
        type: ControlType.String,
        title: "Site Origin",
        defaultValue: "https://frenchmaison.co.uk",
        placeholder: "https://frenchmaison.co.uk",
    },
    pathOverride: {
        type: ControlType.String,
        title: "Path Override",
        defaultValue: "",
        placeholder:
            "REQUIRED for SSR — set per page, eg /popular-regions/southoffrance/provence/family-villas",
    },
    hideOnHome: {
        type: ControlType.Boolean,
        title: "Hide on Home",
        defaultValue: true,
        enabledTitle: "Yes",
        disabledTitle: "No",
    },
    hideOnPaths: {
        type: ControlType.String,
        title: "Hide Paths",
        defaultValue: "",
        placeholder: "/, /thank-you, /contact",
    },
    emitJsonLd: {
        type: ControlType.Boolean,
        title: "JSON-LD",
        defaultValue: true,
        enabledTitle: "On",
        disabledTitle: "Off",
    },
    showDebug: {
        type: ControlType.Boolean,
        title: "Show Debug",
        defaultValue: false,
        enabledTitle: "Yes",
        disabledTitle: "No",
    },
    separator: {
        type: ControlType.String,
        title: "Separator",
        defaultValue: "/",
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
        defaultValue: 24,
        min: 0,
        max: 120,
        step: 1,
    },
    marginBottom: {
        type: ControlType.Number,
        title: "Bottom Margin",
        defaultValue: 16,
        min: 0,
        max: 120,
        step: 1,
    },
    desktopFontSize: {
        type: ControlType.Number,
        title: "Desktop Font",
        defaultValue: 14,
        min: 10,
        max: 24,
        step: 1,
    },
    mobileFontSize: {
        type: ControlType.Number,
        title: "Mobile Font",
        defaultValue: 14,
        min: 10,
        max: 24,
        step: 1,
    },
    linkColor: {
        type: ControlType.Color,
        title: "Link Color",
        defaultValue: "#6b7280",
    },
    currentColor: {
        type: ControlType.Color,
        title: "Current Color",
        defaultValue: "#153852",
    },
    separatorColor: {
        type: ControlType.Color,
        title: "Separator Color",
        defaultValue: "#9ca3af",
    },
})
