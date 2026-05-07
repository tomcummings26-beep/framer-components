import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { addPropertyControls, ControlType } from "framer"

// ✅ Reusable SEOTextBlock Component
function SEOTextBlock({
    h1,
    intro,
    sections,
    initiallyExpanded = false,
}: {
    h1?: string
    intro?: string
    sections?: any[]
    initiallyExpanded?: boolean
}) {
    const [expanded, setExpanded] = React.useState(initiallyExpanded)
    const [schemas, setSchemas] = React.useState<string>("")

    React.useEffect(() => {
        if (typeof window === "undefined") return
        const path = window.location.pathname
        const params = new URLSearchParams(window.location.search)
        const villaId = params.get("id")
        const baseUrl = "https://frenchmaison.co.uk"
        const fullUrl = `${baseUrl}${path}${villaId ? `?id=${villaId}` : ""}`

        const buildSchemas = async () => {
            // 📄 WebPage schema
            const webpageSchema = {
                "@context": "https://schema.org",
                "@type": "WebPage",
                "@id": fullUrl,
                url: fullUrl,
                name: h1,
                description: intro || "",
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

            const schemaList: any[] = [webpageSchema]

            // 🏡 Product + Accommodation schema (villa pages)
            if (villaId) {
                try {
                    const res = await fetch(
                        "https://villa-api-production.up.railway.app/villas"
                    )
                    const villas = await res.json()
                    const villa = villas.find(
                        (v: any) => String(v.villa_id) === villaId
                    )

                    if (villa) {
                        const accommodationSchema = {
                            "@type": "Accommodation",
                            name: villa.name,
                            description: villa.description?.slice(0, 250) || "",
                            numberOfRooms: villa.bedrooms || 0,
                            occupancy: {
                                "@type": "QuantitativeValue",
                                value: villa.capacity || 0,
                                unitCode: "C62",
                            },
                            address: {
                                "@type": "PostalAddress",
                                addressCountry: "FR",
                                addressRegion: villa.region || "",
                                addressLocality: villa.sub_region || "",
                            },
                            image: villa.photos?.length
                                ? villa.photos
                                : villa.main_photo
                                  ? [villa.main_photo]
                                  : [],
                        }

                        const productSchema = {
                            "@context": "https://schema.org",
                            "@type": "Product",
                            name: villa.name,
                            description: villa.description?.slice(0, 250) || "",
                            url: fullUrl,
                            image: villa.photos?.length
                                ? villa.photos
                                : villa.main_photo
                                  ? [villa.main_photo]
                                  : [],
                            brand: {
                                "@type": "Organization",
                                name: "French Maison",
                                url: baseUrl,
                            },
                            offers: {
                                "@type": "Offer",
                                priceCurrency: "GBP",
                                price: villa.price_gbp_min || 0,
                                availability: "https://schema.org/InStock",
                                url: fullUrl,
                            },
                            additionalProperty: [
                                {
                                    "@type": "PropertyValue",
                                    name: "Region",
                                    value: villa.region,
                                },
                                {
                                    "@type": "PropertyValue",
                                    name: "Sub Region",
                                    value: villa.sub_region,
                                },
                                {
                                    "@type": "PropertyValue",
                                    name: "Sleeps",
                                    value: villa.capacity,
                                },
                                {
                                    "@type": "PropertyValue",
                                    name: "Bedrooms",
                                    value: villa.bedrooms,
                                },
                            ],
                            isRelatedTo: accommodationSchema,
                        }

                        schemaList.push(productSchema)
                    }
                } catch (err) {
                    console.warn("❌ Error generating Product schema:", err)
                }
            }

            setSchemas(JSON.stringify(schemaList))
        }

        buildSchemas()
    }, [h1, intro])

    return (
        <div style={{ width: "100%", maxWidth: "800px", margin: "0 auto" }}>
            {/* 🧭 JSON-LD Schemas */}
            {schemas && (
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: schemas }}
                />
            )}

            {/* H1 */}
            <h1
                style={{
                    fontSize: "2rem",
                    color: "#153852",
                    fontWeight: 700,
                    marginBottom: "0.5rem",
                }}
            >
                {h1}
            </h1>

            {/* Intro paragraph */}
            {intro && (
                <p
                    style={{
                        marginBottom: "1rem",
                        lineHeight: 1.6,
                        color: "#333",
                    }}
                >
                    {intro}
                </p>
            )}

            {/* Expand / collapse toggle */}
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

            {/* SEO text */}
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
                {sections?.map((section, index) => (
                    <div key={index} style={{ marginBottom: "1.5rem" }}>
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
                        {section.subtopics && (
                            <ul
                                style={{
                                    paddingLeft: "1rem",
                                    margin: 0,
                                }}
                            >
                                {section.subtopics.map((sub, i) => (
                                    <li
                                        key={i}
                                        style={{
                                            marginBottom: "0.25rem",
                                        }}
                                    >
                                        <h3
                                            style={{
                                                fontSize: "1rem",
                                                fontWeight: 600,
                                                color: "#153852",
                                                display: "inline",
                                            }}
                                        >
                                            {sub.title}
                                        </h3>
                                        {sub.content && (
                                            <span
                                                style={{
                                                    color: "#444",
                                                    marginLeft: "0.3rem",
                                                }}
                                            >
                                                – {sub.content}
                                            </span>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                ))}
            </motion.div>
        </div>
    )
}

/* ─────────────────────────────
   🔧 Framer Property Controls
────────────────────────────── */
addPropertyControls(SEOTextBlock, {
    h1: { type: ControlType.String, title: "H1 Title" },
    intro: { type: ControlType.String, title: "Intro Paragraph" },
    initiallyExpanded: {
        type: ControlType.Boolean,
        title: "Start Expanded?",
        defaultValue: false,
    },
    sections: {
        type: ControlType.Array,
        title: "Sections",
        control: {
            type: ControlType.Object,
            controls: {
                title: { type: ControlType.String, title: "H2 Title" },
                content: { type: ControlType.String, title: "Paragraph Text" },
                subtopics: {
                    type: ControlType.Array,
                    title: "Subtopics (H3)",
                    control: {
                        type: ControlType.Object,
                        controls: {
                            title: {
                                type: ControlType.String,
                                title: "H3 Title",
                            },
                            content: {
                                type: ControlType.String,
                                title: "H3 Text",
                            },
                        },
                    },
                },
            },
        },
    },
})

SEOTextBlock.defaultProps = {
    h1: "Aquitaine Villas & Holiday Homes",
    intro: "Discover the beauty of Aquitaine — from the surf beaches of the Atlantic to Bordeaux’s vineyards — with our curated villas and holiday homes.",
    sections: [
        {
            title: "About Aquitaine",
            content:
                "Aquitaine combines beach life, wine country, and tranquil countryside charm. Expect sunshine, seafood, and world-class wines.",
        },
        {
            title: "Top Destinations",
            content: `
        <strong>Bordeaux</strong> – A UNESCO city surrounded by vineyards.<br/><br/>
        <strong>Arcachon</strong> – Coastal charm and the famous Dune du Pilat.<br/><br/>
        <strong>Basque Country</strong> – Stylish surf towns and Pyrenean views.
      `,
        },
        {
            title: "Browse Available Villas",
            content:
                "View Aquitaine villas with live availability — from beachside escapes to vineyard estates.",
        },
    ],
}
export default SEOTextBlock
