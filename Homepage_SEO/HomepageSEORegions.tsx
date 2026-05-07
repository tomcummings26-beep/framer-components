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
    southOfFranceImage: string
    northernFranceImage: string
    southwestFranceImage: string
    parisImage: string
    brittanyAtlanticImage: string
    burgundyImage: string
    loireValleyImage: string
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

export default function HomepageSEORegions(props: Props) {
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
        southOfFranceImage,
        northernFranceImage,
        southwestFranceImage,
        parisImage,
        brittanyAtlanticImage,
        burgundyImage,
        loireValleyImage,
    } = props

    const cards: Card[] = [
        {
            title: "South of France",
            href: "/popular-regions/southoffrance",
            image: southOfFranceImage,
        },
        {
            title: "Northern France",
            href: "/popular-regions/northernfrance",
            image: northernFranceImage,
        },
        {
            title: "Southwest France",
            href: "/popular-regions/southwestfrance",
            image: southwestFranceImage,
        },
        {
            title: "Paris",
            href: "/popular-regions/paris",
            image: parisImage,
        },
        {
            title: "Brittany & Atlantic",
            href: "/popular-regions/brittanyatlantic",
            image: brittanyAtlanticImage,
        },
        {
            title: "Burgundy",
            href: "/popular-regions/burgundy",
            image: burgundyImage,
        },
        {
            title: "Loire Valley",
            href: "/popular-regions/loirevalley",
            image: loireValleyImage,
        },
    ]

    return (
        <section
            aria-labelledby="fm-home-regions-heading"
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
                <h2 id="fm-home-regions-heading" style={{ margin: 0 }}>
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
                        Explore regions across France
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

HomepageSEORegions.defaultProps = {
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
    southOfFranceImage: "",
    northernFranceImage: "",
    southwestFranceImage: "",
    parisImage: "",
    brittanyAtlanticImage: "",
    burgundyImage: "",
    loireValleyImage: "",
}

addPropertyControls(HomepageSEORegions, {
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
    southOfFranceImage: {
        type: ControlType.String,
        title: "South Image",
        placeholder: "https://...",
    },
    northernFranceImage: {
        type: ControlType.String,
        title: "North Image",
        placeholder: "https://...",
    },
    southwestFranceImage: {
        type: ControlType.String,
        title: "SW Image",
        placeholder: "https://...",
    },
    parisImage: {
        type: ControlType.String,
        title: "Paris Image",
        placeholder: "https://...",
    },
    brittanyAtlanticImage: {
        type: ControlType.String,
        title: "Brittany Image",
        placeholder: "https://...",
    },
    burgundyImage: {
        type: ControlType.String,
        title: "Burgundy Image",
        placeholder: "https://...",
    },
    loireValleyImage: {
        type: ControlType.String,
        title: "Loire Image",
        placeholder: "https://...",
    },
})
