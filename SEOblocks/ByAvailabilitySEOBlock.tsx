"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { addPropertyControls, ControlType } from "framer"

const TAG_COLORS: Record<string, { bg: string; text: string }> = {
    "Available in next 30 days": { bg: "#f0fdf4", text: "#15803d" },
    "Summer Holiday 2026 Availability": { bg: "#eff6ff", text: "#1d4ed8" },
    "Peak Season 2026 Availability": { bg: "#fdf2f8", text: "#be185d" },
    "Available Villas": { bg: "#eee", text: "#333" },
}

export default function ByAvailabilitySEOBlock({
    initiallyExpanded = false,
}: {
    initiallyExpanded?: boolean
}) {
    const [expanded, setExpanded] = React.useState(initiallyExpanded)
    const [schemas, setSchemas] = React.useState<string>("")
    const [villaCount, setVillaCount] = React.useState<number | null>(null)
    const [pageData, setPageData] = React.useState({
        tagLabel: "Available Villas",
        title: "Available Villas in France",
        intro: "Browse our latest villas with live availability — updated daily with verified partner data.",
        seoBody: "",
    })

    React.useEffect(() => {
        if (typeof window === "undefined") return

        const baseUrl = "https://frenchmaison.co.uk"
        const path = window.location.pathname.toLowerCase()

        // Detect tag dynamically from URL slug
        let tagLabel = "Available Villas"
        let title = "Available Villas in France"
        let intro =
            "Browse our latest villas with live availability — updated daily with verified partner data."
        let seoBody = ""

        if (path.includes("30days")) {
            tagLabel = "Available in next 30 days"
            title = "Villas Available in the Next 30 Days"
            intro =
                "Explore last-minute villas available over the next 30 days — perfect for spontaneous getaways in France."
            seoBody = `
                <h2>Last-Minute French Villa Escapes</h2>
                <p>Our <strong>last-minute villas in France</strong> combine value and quality. Whether you’re planning a spontaneous weekend in Provence or a coastal break in the Côte d’Azur, these hand-picked villas are ready to book right now. Enjoy flexible travel and verified availability from trusted partners.</p>

                <h3>Why Book a Villa at Short Notice?</h3>
                <ul>
                    <li>✅ Verified, up-to-date booking data direct from partners</li>
                    <li>💶 Competitive weekly rates with no hidden fees</li>
                    <li>🌿 Instant availability across Brittany, Dordogne, and the Riviera</li>
                </ul>

                <p>Every property listed below is available to book in the next 30 days, offering a mix of countryside charm, private pools, and proximity to local markets and beaches.</p>
            `
        } else if (path.includes("summer")) {
            tagLabel = "Summer Holiday 2026 Availability"
            title = "Summer Holiday 2026 Villas & Holiday Homes"
            intro =
                "Discover beautiful villas available for Summer 2026 — from family-friendly countryside retreats to luxury coastal estates."
            seoBody = `
                <h2>Summer Villas in France 2026</h2>
                <p>Our <strong>Summer 2026 villa collection</strong> showcases the best of France — from Provençal mas and châteaux to coastal villas with pools. Every property offers flexible arrival days and secure online booking through our trusted partner network.</p>

                <h3>Plan Your Summer 2026 Holiday</h3>
                <ul>
                    <li>☀️ Peak-season availability across July & August 2026</li>
                    <li>👨‍👩‍👧 Ideal for families and group bookings</li>
                    <li>🏖 Coastal, countryside, and wine-region retreats</li>
                </ul>

                <p>Booking early ensures access to the most sought-after villas before demand peaks. Our listings are refreshed daily for the latest verified availability.</p>
            `
        } else if (path.includes("peak")) {
            tagLabel = "Peak Season 2026 Availability"
            title = "Peak Season 2026 Villa Availability"
            intro =
                "Find villas still available for the 2026 peak season — book early to secure the best properties for July and August."
            seoBody = `
                <h2>Peak Season French Villas 2026</h2>
                <p>During July and August, France’s most iconic destinations book up fast. Our <strong>Peak Season 2026 villas</strong> list all properties that still have availability in these high-demand weeks — ideal for families and groups planning ahead.</p>

                <h3>Regions Still Available for Summer 2026</h3>
                <ul>
                    <li>🌻 Provence and Côte d’Azur</li>
                    <li>🍷 Bordeaux and Dordogne countryside</li>
                    <li>🏰 Loire Valley & Brittany coast</li>
                </ul>

                <p>Each villa below offers full availability details, verified weekly rates, and easy links to book securely via our partner platform.</p>
            `
        }

        setPageData({
            tagLabel,
            title,
            intro,
            seoBody,
        })

        const webpageSchema = {
            "@context": "https://schema.org",
            "@type": "WebPage",
            url: `${baseUrl}${path}`,
            name: title,
            description: intro,
            inLanguage: "en-GB",
            publisher: {
                "@type": "Organization",
                name: "French Maison",
                url: baseUrl,
            },
        }

        setSchemas(JSON.stringify([webpageSchema]))

        document.title = `${title} | French Maison`
        const meta =
            document.querySelector('meta[name="description"]') ||
            (() => {
                const m = document.createElement("meta")
                m.name = "description"
                document.head.appendChild(m)
                return m
            })()
        meta.setAttribute("content", intro)

        fetch("https://villa-api-production.up.railway.app/villas")
            .then((res) => res.json())
            .then((data) => {
                const count = data.filter((v: any) =>
                    v.availability_tags?.includes(tagLabel)
                ).length
                setVillaCount(count)
            })
            .catch(() => setVillaCount(null))
    }, [])

    const tagStyle =
        TAG_COLORS[pageData.tagLabel] || TAG_COLORS["Available Villas"]

    return (
        <div
            style={{
                width: "100%",
                maxWidth: "800px",
                margin: "0 auto",
                padding: "24px 16px 8px 16px",
                fontFamily: "Inter, sans-serif",
            }}
        >
            {/* 🧭 JSON-LD */}
            {schemas && (
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: schemas }}
                />
            )}

            {/* 🏷 Title */}
            <h1
                style={{
                    fontWeight: 700,
                    letterSpacing: "-0.04em",
                    lineHeight: "1em",
                    fontSize: "40px",
                    color: "#999999",
                    marginBottom: "8px",
                }}
            >
                {pageData.title}
            </h1>

            {/* Tag */}
            <span
                style={{
                    display: "inline-block",
                    background: tagStyle.bg,
                    color: tagStyle.text,
                    padding: "6px 10px",
                    borderRadius: "6px",
                    fontSize: "13px",
                    fontWeight: 600,
                }}
            >
                {pageData.tagLabel}
            </span>

            {/* Count */}
            {villaCount !== null && (
                <p
                    style={{
                        color: "#666",
                        fontWeight: 500,
                        fontSize: "0.95rem",
                        margin: "6px 0 12px 0",
                    }}
                >
                    {villaCount > 0
                        ? `${villaCount} villas currently available`
                        : "No villas found — please check back soon."}
                </p>
            )}

            {/* Intro */}
            <p style={{ marginBottom: "1rem", lineHeight: 1.6, color: "#333" }}>
                {pageData.intro}
            </p>

            {/* Read more toggle */}
            <button
                onClick={() => setExpanded(!expanded)}
                style={{
                    background: "none",
                    border: "none",
                    color: "#0070f3",
                    cursor: "pointer",
                    padding: 0,
                    fontWeight: 600,
                    fontSize: "0.95rem",
                    marginBottom: "0.75rem",
                }}
                aria-expanded={expanded}
            >
                {expanded ? "Read less ▲" : "Read more ▼"}
            </button>

            {/* Expandable SEO copy */}
            <motion.div
                initial={false}
                animate={{
                    height: expanded ? "auto" : 0,
                    opacity: expanded ? 1 : 0,
                }}
                transition={{ duration: 0.4 }}
                style={{ overflow: "hidden" }}
                aria-hidden={!expanded}
            >
                <div
                    style={{
                        lineHeight: 1.6,
                        color: "#333",
                        fontSize: "16px",
                    }}
                    dangerouslySetInnerHTML={{
                        __html: pageData.seoBody,
                    }}
                />
            </motion.div>
        </div>
    )
}

addPropertyControls(ByAvailabilitySEOBlock, {
    initiallyExpanded: {
        type: ControlType.Boolean,
        title: "Start Expanded?",
        defaultValue: false,
    },
})
