"use client"

import * as React from "react"
import { addPropertyControls, ControlType } from "framer"

type Card = {
    title: string
    href: string
    image: string
}

type Props = {
    maxWidth: number
    background: string
    cardBackground: string
    borderColor: string
    textColor: string
    headingColor: string
    linkColor: string
    radius: number
    topPadding: number
    bottomPadding: number
    poolsImage: string
    familyImage: string
    largeImage: string
    luxuryImage: string
}

const SERIF_STACK =
    '"Cormorant Garamond", "Libre Baskerville", Georgia, "Times New Roman", serif'

const SANS_STACK =
    '"Inter", "Inter var", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'

function optimiseImage(url: string, width = 800, quality = 70) {
    if (!url) return ""
    if (url.includes("img.frenchmaison.co.uk")) return url

    return `https://img.frenchmaison.co.uk/?url=${encodeURIComponent(
        url
    )}&width=${width}&quality=${quality}`
}

export default function HomepageSEOVillaTypes(props: Props) {
    const {
        maxWidth,
        background,
        cardBackground,
        borderColor,
        textColor,
        headingColor,
        linkColor,
        radius,
        topPadding,
        bottomPadding,
        poolsImage,
        familyImage,
        largeImage,
        luxuryImage,
    } = props

    const cards: Card[] = [
        {
            title: "Villas with Pools",
            href: "/villatype/villas/villas-with-pool",
            image: poolsImage,
        },
        {
            title: "Family Villas",
            href: "/villatype/villas/family-villas",
            image: familyImage,
        },
        {
            title: "Large Villas",
            href: "/villatype/villas/large-villas",
            image: largeImage,
        },
        {
            title: "Luxury Villas",
            href: "/villatype/villas/luxury-villas",
            image: luxuryImage,
        },
    ]

    return (
        <section
            aria-labelledby="fm-home-types-heading"
            style={{
                width: "100%",
                background,
                padding: `${topPadding}px 20px ${bottomPadding}px`,
            }}
        >
            <div
                style={{
                    maxWidth,
                    margin: "0 auto",
                    display: "grid",
                    gap: 24,
                }}
            >
                <h2 id="fm-home-types-heading" style={{ margin: 0 }}>
                    <span
                        style={{
                            display: "block",
                            fontSize: "clamp(22px, 3vw, 30px)",
                            lineHeight: 1.05,
                            letterSpacing: "-0.02em",
                            color: headingColor,
                            fontFamily: SERIF_STACK,
                            fontWeight: 400,
                        }}
                    >
                        Browse by villa type
                    </span>
                </h2>

                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns:
                            "repeat(auto-fit, minmax(250px, 1fr))",
                        gap: 22,
                    }}
                >
                    {cards.map((card) => (
                        <a
                            key={card.href}
                            href={card.href}
                            style={{
                                display: "grid",
                                gap: 12,
                                textDecoration: "none",
                                background: cardBackground,
                                border: `1px solid ${borderColor}`,
                                borderRadius: radius,
                                padding: 14,
                                color: textColor,
                                boxShadow: "0 10px 30px rgba(17, 24, 39, 0.04)",
                            }}
                        >
                            <div
                                style={{
                                    height: 220,
                                    borderRadius: Math.max(radius - 8, 12),
                                    overflow: "hidden",
                                    border: "1px solid rgba(226, 232, 240, 0.7)",
                                    background:
                                        "linear-gradient(135deg, #E8EEF3 0%, #F8FAFC 100%)",
                                }}
                            >
                                {card.image ? (
                                    <img
                                        src={optimiseImage(card.image, 800, 70)}
                                        alt={card.title}
                                        loading="lazy"
                                        decoding="async"
                                        style={{
                                            width: "100%",
                                            height: "100%",
                                            objectFit: "cover",
                                            display: "block",
                                        }}
                                    />
                                ) : null}
                            </div>

                            <div style={{ display: "grid", gap: 8 }}>
                                <h3
                                    style={{
                                        margin: 0,
                                        fontSize: "clamp(20px, 2.1vw, 24px)",
                                        lineHeight: 1.02,
                                        letterSpacing: "-0.015em",
                                        color: headingColor,
                                        fontFamily: SERIF_STACK,
                                        fontWeight: 400,
                                    }}
                                >
                                    {card.title}
                                </h3>
                            </div>
                        </a>
                    ))}
                </div>
            </div>
        </section>
    )
}

HomepageSEOVillaTypes.defaultProps = {
    maxWidth: 1200,
    background: "#FFFFFF",
    cardBackground: "#F8FAFC",
    borderColor: "#E2E8F0",
    textColor: "#243648",
    headingColor: "#153852",
    linkColor: "#153852",
    radius: 24,
    topPadding: 20,
    bottomPadding: 20,
    poolsImage: "",
    familyImage: "",
    largeImage: "",
    luxuryImage: "",
}

addPropertyControls(HomepageSEOVillaTypes, {
    maxWidth: {
        type: ControlType.Number,
        title: "Max Width",
        min: 800,
        max: 1400,
        step: 10,
    },
    background: { type: ControlType.Color, title: "Background" },
    cardBackground: { type: ControlType.Color, title: "Card BG" },
    borderColor: { type: ControlType.Color, title: "Border" },
    textColor: { type: ControlType.Color, title: "Text" },
    headingColor: { type: ControlType.Color, title: "Heading" },
    linkColor: { type: ControlType.Color, title: "Link" },
    radius: {
        type: ControlType.Number,
        title: "Radius",
        min: 0,
        max: 40,
        step: 1,
    },
    topPadding: {
        type: ControlType.Number,
        title: "Top Pad",
        min: 0,
        max: 120,
        step: 4,
    },
    bottomPadding: {
        type: ControlType.Number,
        title: "Bottom Pad",
        min: 0,
        max: 120,
        step: 4,
    },
    poolsImage: {
        type: ControlType.String,
        title: "Pools Image",
        placeholder: "https://...",
    },
    familyImage: {
        type: ControlType.String,
        title: "Family Image",
        placeholder: "https://...",
    },
    largeImage: {
        type: ControlType.String,
        title: "Large Image",
        placeholder: "https://...",
    },
    luxuryImage: {
        type: ControlType.String,
        title: "Luxury Image",
        placeholder: "https://...",
    },
})
