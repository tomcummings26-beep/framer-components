"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"

export default function AsSeenOnInstagramSEO() {
    const [expanded, setExpanded] = React.useState(false)
    const [schemas, setSchemas] = React.useState<string>("")

    React.useEffect(() => {
        const baseUrl = "https://frenchmaison.co.uk"
        const fullUrl = `${baseUrl}/link`

        const schemaList = [
            {
                "@context": "https://schema.org",
                "@type": "WebPage",
                "@id": fullUrl,
                url: fullUrl,
                name: "As Seen on Instagram – French Maison",
                description:
                    "Discover our hand-picked collection of French villas recently featured on our Instagram. From countryside châteaux to sun-soaked coastal homes, explore the properties that have inspired our latest posts.",
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
            },
        ]

        setSchemas(JSON.stringify(schemaList))
    }, [])

    const sections = [
        {
            title: "Explore Our Instagram Collection",
            content:
                "Our <strong>‘As Seen on Instagram’</strong> page brings together the villas and holiday homes we’ve recently shared on our <a href='https://www.instagram.com/frenchmaison/' target='_blank' rel='noopener noreferrer'>Instagram feed</a>. Each property showcases the charm of authentic French living – from rustic Provençal farmhouses and seaside villas in Brittany to luxury châteaux in the Loire Valley.",
        },
        {
            title: "Why Follow French Maison on Instagram?",
            content:
                "We share daily inspiration from across France’s most beautiful regions – featuring design ideas, travel guides, and insider tips on when to book. Following us helps you discover unique stays as soon as they’re available, including those with limited <strong>summer 2026</strong> and <strong>peak-season</strong> availability.",
        },
        {
            title: "Plan Your Next French Escape",
            content:
                "Click any villa above to view full details, photos, and pricing on FrenchMaison.co.uk. Every listing links directly to our trusted booking partner, Oliver’s Travels, so you can check availability and secure your stay with confidence.",
        },
    ]

    return (
        <div
            style={{
                width: "100%",
                maxWidth: "800px",
                margin: "0 auto",
                padding: "10px 0",
            }}
        >
            {/* 🧭 JSON-LD Schemas */}
            {schemas && (
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: schemas }}
                />
            )}

            <h1
                style={{
                    fontSize: "2rem",
                    color: "#153852",
                    fontWeight: 700,
                    marginBottom: "0.5rem",
                }}
            >
                As Seen on Instagram
            </h1>

            <p
                style={{
                    marginBottom: "1rem",
                    lineHeight: 1.6,
                    color: "#333",
                }}
            >
                Explore the latest villas and châteaux featured on our Instagram
                – a curated glimpse into the most beautiful places to stay
                across France.
            </p>

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
                    marginBottom: "1rem",
                }}
                aria-expanded={expanded}
            >
                {expanded ? "Read less ▲" : "Read more ▼"}
            </button>

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
                {sections.map((section, i) => (
                    <div key={i} style={{ marginBottom: "1.5rem" }}>
                        <h2
                            style={{
                                fontSize: "1.25rem",
                                color: "#153852",
                                marginBottom: "0.5rem",
                            }}
                        >
                            {section.title}
                        </h2>
                        <p
                            style={{
                                marginBottom: "0.75rem",
                                lineHeight: 1.6,
                                color: "#333",
                            }}
                            dangerouslySetInnerHTML={{
                                __html: section.content,
                            }}
                        />
                    </div>
                ))}
            </motion.div>
        </div>
    )
}
