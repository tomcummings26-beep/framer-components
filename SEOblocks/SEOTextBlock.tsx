"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { addPropertyControls, ControlType } from "framer"

type Subtopic = {
    title?: string
    content?: string
}

type Section = {
    title?: string
    content?: string
    subtopics?: Subtopic[]
}

type FrameworkContent = {
    h1?: string
    intro?: string
    sections?: Section[]
}

type Props = {
    h1?: string
    intro?: string
    sections?: Section[]
    contentFramework?: string
    initiallyExpanded?: boolean
}

function parseFrameworkContent(input?: string): FrameworkContent | null {
    if (!input?.trim()) return null

    try {
        let source = input.trim()

        const assignmentMatch = source.match(
            /SEOTextBlock\.defaultProps\s*=\s*([\s\S]+)$/
        )
        if (assignmentMatch?.[1]) {
            source = assignmentMatch[1].trim()
        }

        if (source.endsWith(";")) {
            source = source.slice(0, -1).trim()
        }

        const parsed = new Function(`return (${source})`)()
        if (!parsed || typeof parsed !== "object") return null

        return {
            h1: typeof parsed.h1 === "string" ? parsed.h1 : undefined,
            intro: typeof parsed.intro === "string" ? parsed.intro : undefined,
            sections: Array.isArray(parsed.sections) ? parsed.sections : [],
        }
    } catch (error) {
        console.warn("SEOTextBlock framework parse failed", error)
        return null
    }
}

export default function SEOTextBlock(props: Props) {
    const {
        contentFramework,
        h1,
        intro,
        sections,
        initiallyExpanded = false,
    } = props

    const [expanded, setExpanded] = React.useState(initiallyExpanded)
    const [schemas, setSchemas] = React.useState<string>("")

    const frameworkContent = React.useMemo(
        () => parseFrameworkContent(contentFramework),
        [contentFramework]
    )
    const resolved = React.useMemo(
        () => ({
            h1: frameworkContent?.h1 || h1 || "",
            intro: frameworkContent?.intro || intro || "",
            sections:
                frameworkContent?.sections &&
                frameworkContent.sections.length > 0
                    ? frameworkContent.sections
                    : sections || [],
        }),
        [frameworkContent, h1, intro, sections]
    )

    React.useEffect(() => {
        setExpanded(initiallyExpanded)
    }, [initiallyExpanded])

    React.useEffect(() => {
        if (typeof window === "undefined") return

        const path = window.location.pathname
        const params = new URLSearchParams(window.location.search)
        const villaId = params.get("id")
        const baseUrl = "https://frenchmaison.co.uk"
        const fullUrl = `${baseUrl}${path}${villaId ? `?id=${villaId}` : ""}`

        const buildSchemas = async () => {
            const webpageSchema = {
                "@context": "https://schema.org",
                "@type": "WebPage",
                "@id": fullUrl,
                url: fullUrl,
                name: resolved.h1 || "",
                description: resolved.intro || "",
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

            if (villaId) {
                try {
                    const response = await fetch(
                        "https://villa-api-production.up.railway.app/villas"
                    )
                    const villas = await response.json()
                    const villa = villas.find(
                        (item: any) => String(item.villa_id) === villaId
                    )

                    if (villa) {
                        const images = villa.photos?.length
                            ? villa.photos
                            : villa.main_photo
                              ? [villa.main_photo]
                              : []

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
                            image: images,
                        }

                        const productSchema = {
                            "@context": "https://schema.org",
                            "@type": "Product",
                            name: villa.name,
                            description: villa.description?.slice(0, 250) || "",
                            url: fullUrl,
                            image: images,
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
                } catch (error) {
                    console.warn("Error generating Product schema", error)
                }
            }

            setSchemas(JSON.stringify(schemaList))
        }

        buildSchemas()
    }, [resolved.h1, resolved.intro, resolved.sections])

    return (
        <div style={{ width: "100%", maxWidth: "800px", margin: "0 auto" }}>
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
                {resolved.h1}
            </h1>

            {resolved.intro && (
                <p
                    style={{
                        marginBottom: "1rem",
                        lineHeight: 1.6,
                        color: "#333",
                    }}
                >
                    {resolved.intro}
                </p>
            )}

            <button
                onClick={() => setExpanded((current) => !current)}
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

            {/* SEO content — ALWAYS rendered in the DOM so Googlebot can index it
                on first-pass crawl. Collapse is purely visual via animated height/opacity. */}
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
                {resolved.sections?.map((section, index) => (
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
                                __html: section.content || "",
                            }}
                        />
                        {section.subtopics && section.subtopics.length > 0 && (
                            <ul
                                style={{
                                    paddingLeft: "1rem",
                                    margin: 0,
                                }}
                            >
                                {section.subtopics.map(
                                    (subtopic, subtopicIndex) => (
                                        <li
                                            key={subtopicIndex}
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
                                                {subtopic.title}
                                            </h3>
                                            {subtopic.content && (
                                                <span
                                                    style={{
                                                        color: "#444",
                                                        marginLeft: "0.3rem",
                                                    }}
                                                >
                                                    - {subtopic.content}
                                                </span>
                                            )}
                                        </li>
                                    )
                                )}
                            </ul>
                        )}
                    </div>
                ))}
            </motion.div>
        </div>
    )
}

addPropertyControls(SEOTextBlock, {
    contentFramework: {
        type: ControlType.String,
        title: "Props Block",
        displayTextArea: true,
        placeholder:
            'Paste SEOTextBlock.defaultProps = { h1: "...", intro: "...", sections: [...] }',
    },
    h1: {
        type: ControlType.String,
        title: "H1 Title",
        defaultValue: "",
    },
    intro: {
        type: ControlType.String,
        title: "Intro Paragraph",
        displayTextArea: true,
        defaultValue: "",
    },
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
                content: {
                    type: ControlType.String,
                    title: "Paragraph Text",
                    displayTextArea: true,
                },
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
        defaultValue: [],
    },
})
