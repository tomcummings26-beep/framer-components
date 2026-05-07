"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { addPropertyControls, ControlType } from "framer"

export default function VillaSEOBlock({
    initiallyExpanded = false,
}: {
    initiallyExpanded?: boolean
}) {
    const [villa, setVilla] = React.useState<any>(null)
    const [expanded, setExpanded] = React.useState(initiallyExpanded)
    const [schemas, setSchemas] = React.useState<string>("")
    const [isMobile, setIsMobile] = React.useState(false)

    React.useEffect(() => {
        if (typeof window === "undefined") return

        const updateViewport = () => {
            setIsMobile(window.innerWidth < 768)
        }

        updateViewport()
        window.addEventListener("resize", updateViewport)
        return () => window.removeEventListener("resize", updateViewport)
    }, [])

    React.useEffect(() => {
        if (typeof window === "undefined") return

        const params = new URLSearchParams(window.location.search)
        const villaId = params.get("id") || "457"
        const baseUrl = "https://frenchmaison.co.uk"
        const path = window.location.pathname
        const fullUrl = `${baseUrl}${path}?id=${villaId}`

        // Create or update a single matching tag early
        // NOTE: selector must include the attribute VALUE, otherwise every
        // meta[property=...] call overwrites the same first element.
        const ensureTag = (tag: string, attrs: Record<string, string>) => {
            const [k] = Object.keys(attrs)
            const v = attrs[k]
            let el = document.head.querySelector(`${tag}[${k}="${v}"]`)
            if (!el) {
                el = document.createElement(tag)
                document.head.appendChild(el)
            }
            Object.entries(attrs).forEach(([key, val]) =>
                el!.setAttribute(key, val)
            )
        }

        // 🧭 Robots tag
        ensureTag("meta", { name: "robots", content: "index,follow" })

        // 🔗 Canonical override — Worker currently points every /villa variant
        // at /villa, causing Google to treat them as duplicates. Force the
        // per-villa canonical client-side so the rendered HTML wins.
        let canonicalEl = document.head.querySelector(
            'link[rel="canonical"]'
        ) as HTMLLinkElement | null
        if (!canonicalEl) {
            canonicalEl = document.createElement("link")
            canonicalEl.setAttribute("rel", "canonical")
            document.head.appendChild(canonicalEl)
        }
        canonicalEl.setAttribute("href", fullUrl)

        const buildSchemas = async () => {
            try {
                const res = await fetch(
                    "https://villa-api-production.up.railway.app/villas"
                )
                const data = await res.json()
                const v = data.find(
                    (vv: any) => String(vv.villa_id) === String(villaId)
                )

                // If villa missing, avoid thin indexed page
                if (!v) {
                    ensureTag("meta", {
                        name: "robots",
                        content: "noindex,follow",
                    })
                    return
                }

                setVilla(v)

                // ─── JSON-LD Schemas ───
                const webpageSchema = {
                    "@context": "https://schema.org",
                    "@type": "WebPage",
                    "@id": fullUrl,
                    url: fullUrl,
                    name: `${v.name} — ${v.sub_region || ""}${v.sub_region ? ", " : ""}${v.region || ""}`.trim(),
                    description:
                        v.description?.slice(0, 250) ||
                        `Luxury villa in ${v.sub_region || ""}${v.sub_region ? ", " : ""}${v.region || "France"}.`,
                    inLanguage: "en-GB",
                    publisher: {
                        "@type": "Organization",
                        name: "French Maison",
                        url: baseUrl,
                        logo: {
                            "@type": "ImageObject",
                            url: `${baseUrl}/logo.png`,
                        },
                    },
                }

                const productSchema = {
                    "@context": "https://schema.org",
                    "@type": "Product",
                    name: v.name,
                    description: v.description?.slice(0, 250) || "",
                    url: fullUrl,
                    image: v.photos?.length
                        ? v.photos
                        : v.main_photo
                          ? [v.main_photo]
                          : [],
                    brand: {
                        "@type": "Organization",
                        name: "French Maison",
                        url: baseUrl,
                    },
                    offers: {
                        "@type": "Offer",
                        priceCurrency: "GBP",
                        price: v.price_gbp_min || 0,
                        availability: "https://schema.org/InStock",
                        url: fullUrl,
                    },
                }

                setSchemas(JSON.stringify([webpageSchema, productSchema]))

                // ─── Meta + OG Tags ───
                const title = `${v.name} | ${v.region} Villas | French Maison`
                document.title = title

                const desc =
                    v.description?.slice(0, 160) ||
                    `${v.name} in ${v.sub_region || ""}${v.sub_region ? ", " : ""}${v.region || "France"}. Sleeps ${v.capacity ?? "—"}, ${v.bedrooms ?? "—"} bedrooms.`

                ensureTag("meta", { name: "description", content: desc })
                ensureTag("meta", { property: "og:title", content: title })
                ensureTag("meta", { property: "og:description", content: desc })
                // Worker already sets correct og:url for SSR; keeping this ensures parity post-hydration
                ensureTag("meta", { property: "og:url", content: fullUrl })
                ensureTag("meta", {
                    property: "og:image",
                    content:
                        v.main_photo || v.photos?.[0] || `${baseUrl}/logo.png`,
                })
                ensureTag("meta", { property: "og:type", content: "product" })
            } catch (e) {
                console.error("VillaSEOBlock fetch error", e)
            }
        }

        buildSchemas()
    }, [])

    const hasPeakTag = villa?.availability_tags?.includes(
        "Peak Season 2026 Availability"
    )

    return (
        <div
            style={{
                width: "100%",
                maxWidth: 800,
                margin: isMobile ? "0.75rem auto 0 auto" : "1rem auto 0 auto",
                height: "auto",
                overflow: "visible",
                fontFamily: '"Inter", "Helvetica Neue", Arial, sans-serif',
                color: "#374151",
                display: "block",
            }}
        >
            {schemas && (
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: schemas }}
                />
            )}

            {/* ─── Title + Tag ─── */}
            <div style={{ textAlign: "left", marginBottom: "16px" }}>
                <h2
                    style={{
                        fontFamily:
                            '"Cormorant Garamond", "Libre Baskerville", Georgia, serif',
                        fontWeight: 500,
                        letterSpacing: "-0.03em",
                        lineHeight: "0.98em",
                        fontSize: "40px",
                        color: "#153852",
                        margin: "0 0 8px 0",
                    }}
                >
                    {villa?.name || " "}
                </h2>

                {hasPeakTag && (
                    <span
                        style={{
                            display: "inline-block",
                            background: "#fdf2f8",
                            color: "#be185d",
                            padding: "6px 10px",
                            borderRadius: "6px",
                            fontSize: "13px",
                            fontWeight: 600,
                        }}
                    >
                        Peak Season 2026 Availability
                    </span>
                )}
            </div>

            {/* ─── Description ─── */}
            <p
                style={{
                    lineHeight: 1.7,
                    color: "#374151",
                    fontSize: "15px",
                    marginBottom: "1rem",
                }}
            >
                {villa
                    ? `Stay at ${villa.name}, a beautiful villa in ${villa.sub_region}, nestled in the ${villa.region}. Perfect for families and groups, offering comfort, privacy, and proximity to local highlights.`
                    : " "}
            </p>

            <button
                onClick={() => setExpanded(!expanded)}
                style={{
                    background: "none",
                    border: "none",
                    color: "#153852",
                    cursor: "pointer",
                    padding: 0,
                    fontWeight: 600,
                    fontSize: "14px",
                    marginBottom: "1rem",
                }}
                aria-expanded={expanded}
            >
                {villa ? (expanded ? "Read less ▲" : "Read more ▼") : " "}
            </button>

            <motion.div
                initial={false}
                animate={{
                    height: expanded && villa ? "auto" : 0,
                    opacity: expanded && villa ? 1 : 0,
                }}
                transition={{ duration: 0.4 }}
                style={{ overflow: "hidden" }}
                aria-hidden={!expanded}
            >
                {villa && (
                    <div
                        style={{
                            display: "block",
                            width: "100%",
                            height: "auto",
                            overflow: "visible",
                            marginTop: 0,
                            paddingBottom: "2px",
                        }}
                    >
                        <section style={{ marginBottom: "1.5rem" }}>
                            <h3
                                style={{
                                    fontFamily:
                                        '"Inter", "Helvetica Neue", Arial, sans-serif',
                                    fontSize: "20px",
                                    color: "#153852",
                                    fontWeight: 600,
                                    margin: "0 0 10px 0",
                                }}
                            >
                                About this Villa
                            </h3>
                            <p
                                style={{
                                    fontFamily:
                                        '"Inter", "Helvetica Neue", Arial, sans-serif',
                                    color: "#374151",
                                    lineHeight: 1.7,
                                    fontSize: "15px",
                                }}
                            >
                                {villa.description?.trim() ||
                                    `A stunning retreat in ${villa.region}, ideal for an unforgettable French holiday.`}
                            </p>
                        </section>

                        <section style={{ marginBottom: "1.5rem" }}>
                            <h3
                                style={{
                                    fontFamily:
                                        '"Inter", "Helvetica Neue", Arial, sans-serif',
                                    fontSize: "20px",
                                    color: "#153852",
                                    fontWeight: 600,
                                    margin: "0 0 10px 0",
                                }}
                            >
                                Key Features
                            </h3>
                            <ul
                                style={{
                                    fontFamily:
                                        '"Inter", "Helvetica Neue", Arial, sans-serif',
                                    paddingLeft: "1rem",
                                    color: "#374151",
                                    lineHeight: 1.7,
                                    fontSize: "15px",
                                }}
                            >
                                <li>Sleeps {villa.capacity}</li>
                                <li>
                                    {villa.bedrooms} bedrooms •{" "}
                                    {villa.bathrooms} bathrooms
                                </li>
                                <li>Private pool, terrace, and gardens</li>
                                <li>
                                    Located in {villa.sub_region},{" "}
                                    {villa.region}
                                </li>
                            </ul>
                        </section>

                        <section>
                            <h3
                                style={{
                                    fontFamily:
                                        '"Inter", "Helvetica Neue", Arial, sans-serif',
                                    fontSize: "20px",
                                    color: "#153852",
                                    fontWeight: 600,
                                    margin: "0 0 10px 0",
                                }}
                            >
                                Booking & Availability
                            </h3>
                            <p
                                style={{
                                    fontFamily:
                                        '"Inter", "Helvetica Neue", Arial, sans-serif',
                                    color: "#374151",
                                    lineHeight: 1.7,
                                    fontSize: "15px",
                                }}
                            >
                                Weekly rates from{" "}
                                <strong>
                                    £
                                    {villa.price_gbp_min?.toLocaleString() ||
                                        "N/A"}
                                </strong>
                                . Browse live availability for this villa and
                                others in {villa.region}.
                            </p>
                        </section>
                    </div>
                )}
            </motion.div>
        </div>
    )
}

addPropertyControls(VillaSEOBlock, {
    initiallyExpanded: {
        type: ControlType.Boolean,
        title: "Start Expanded?",
        defaultValue: false,
    },
})
