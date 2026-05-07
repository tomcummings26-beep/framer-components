"use client"

import * as React from "react"
import { addPropertyControls, ControlType } from "framer"

type Card = {
    featured?: boolean
    title: string
    description: string
    links: { label: string; href: string }[]
}

type Props = {
    maxWidth: number
    background: string
    cardBackground: string
    borderColor: string
    headingColor: string
    textColor: string
    mutedColor: string
    linkColor: string
    radius: number
    topPadding: number
    bottomPadding: number
}

const SERIF_STACK =
    '"Cormorant Garamond", "Libre Baskerville", Georgia, "Times New Roman", serif'

const SANS_STACK =
    '"Inter", "Inter var", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'

const cards: Card[] = [
    {
        featured: true,
        title: "South of France Villa Holidays",
        description:
            "The South of France remains one of the most popular areas for villa holidays, bringing together countryside escapes, stylish coastal stays and many of France's best-known summer regions.",
        links: [
            {
                label: "Explore South of France Villas",
                href: "/popular-regions/southoffrance",
            },
            {
                label: "Explore Provence Villas",
                href: "/popular-regions/southoffrance/provence",
            },
        ],
    },
    {
        title: "Provence Villa Holidays",
        description:
            "Provence is one of the best-known villa destinations in France, with hilltop villages, local markets, vineyard landscapes and elegant holiday homes with pools.",
        links: [
            {
                label: "Explore Provence Villas",
                href: "/popular-regions/southoffrance/provence",
            },
        ],
    },
    {
        title: "Dordogne Villa Holidays",
        description:
            "Dordogne is one of the best regions in France for relaxed family villa holidays, with river valleys, honey-coloured villages and spacious countryside homes that suit longer summer stays.",
        links: [
            {
                label: "Explore Dordogne Villas",
                href: "/popular-regions/southwestfrance/dordogne",
            },
        ],
    },
    {
        title: "Brittany Villa Holidays",
        description:
            "Brittany adds a different type of French villa holiday, with rugged coastline, sandy beaches and characterful holiday homes that are ideal for coastal escapes and multigenerational trips.",
        links: [
            {
                label: "Explore Brittany Villas",
                href: "/popular-regions/brittanyatlantic",
            },
        ],
    },
    {
        title: "Loire Valley Villa Holidays",
        description:
            "The Loire Valley brings a slower-paced and more elegant side of France, with château country, gardens and vineyard landscapes that suit travellers looking for refined rural stays.",
        links: [
            {
                label: "Explore Loire Valley Villas",
                href: "/popular-regions/loirevalley",
            },
        ],
    },
]

export default function HomepageSEODestinations(props: Props) {
    const {
        maxWidth,
        background,
        cardBackground,
        borderColor,
        headingColor,
        textColor,
        mutedColor,
        linkColor,
        radius,
        topPadding,
        bottomPadding,
    } = props

    return (
        <section
            aria-labelledby="fm-destinations-heading"
            style={{
                width: "100%",
                background,
                padding: `${topPadding}px 20px ${bottomPadding}px`,
            }}
        >
            <div
                style={{ maxWidth, margin: "0 auto", display: "grid", gap: 24 }}
            >
                <div style={{ display: "grid", gap: 12 }}>
                    <h2 id="fm-destinations-heading" style={{ margin: 0 }}>
                        <span
                            style={{
                                display: "block",
                                fontSize: "clamp(28px, 4vw, 42px)",
                                lineHeight: 1,
                                letterSpacing: "-0.03em",
                                color: headingColor,
                                fontFamily: SERIF_STACK,
                                fontWeight: 500,
                            }}
                        >
                            Explore villa holidays across France
                        </span>
                    </h2>

                    <p
                        style={{
                            margin: 0,
                            fontSize: 17,
                            lineHeight: 1.8,
                            color: mutedColor,
                            fontFamily: SANS_STACK,
                        }}
                    >
                        Start with the broadest and most popular villa
                        destinations in France, then explore a small selection
                        of standout regional collections.
                    </p>
                </div>

                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns:
                            "repeat(auto-fit, minmax(260px, 1fr))",
                        gap: 20,
                    }}
                >
                    {cards.map((card) => (
                        <article
                            key={card.title}
                            style={{
                                background: cardBackground,
                                border: `1px solid ${borderColor}`,
                                borderRadius: radius,
                                padding: 22,
                                display: "grid",
                                gap: 14,
                                boxShadow: card.featured
                                    ? "0 12px 30px rgba(21, 56, 82, 0.08)"
                                    : "none",
                                gridColumn: card.featured
                                    ? "span 2"
                                    : undefined,
                            }}
                        >
                            {card.featured ? (
                                <div
                                    style={{
                                        display: "inline-flex",
                                        alignItems: "center",
                                        width: "fit-content",
                                        padding: "6px 10px",
                                        borderRadius: 999,
                                        background: "#EAF2F6",
                                        color: headingColor,
                                        fontFamily: SANS_STACK,
                                        fontSize: 12,
                                        fontWeight: 600,
                                        letterSpacing: "0.04em",
                                        textTransform: "uppercase",
                                    }}
                                >
                                    Featured Destination
                                </div>
                            ) : null}

                            <h3 style={{ margin: 0 }}>
                                <span
                                    style={{
                                        display: "block",
                                        fontSize: 28,
                                        lineHeight: 1.05,
                                        letterSpacing: "-0.02em",
                                        color: headingColor,
                                        fontFamily: SERIF_STACK,
                                        fontWeight: 500,
                                    }}
                                >
                                    {card.title}
                                </span>
                            </h3>

                            <p
                                style={{
                                    margin: 0,
                                    fontSize: 16,
                                    lineHeight: 1.75,
                                    color: textColor,
                                    fontFamily: SANS_STACK,
                                }}
                            >
                                {card.description}
                            </p>

                            <ul
                                style={{
                                    margin: 0,
                                    paddingLeft: 20,
                                    fontFamily: SANS_STACK,
                                }}
                            >
                                {card.links.map((link) => (
                                    <li
                                        key={link.href}
                                        style={{ marginBottom: 8 }}
                                    >
                                        <a
                                            href={link.href}
                                            style={{
                                                color: linkColor,
                                                textDecoration: "underline",
                                                textUnderlineOffset: "3px",
                                                fontSize: 15,
                                                lineHeight: 1.5,
                                                fontFamily: SANS_STACK,
                                            }}
                                        >
                                            {link.label}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </article>
                    ))}
                </div>

                <p
                    style={{
                        margin: 0,
                        fontSize: 17,
                        lineHeight: 1.8,
                        color: mutedColor,
                        fontFamily: SANS_STACK,
                    }}
                >
                    Browse by region to find villas in some of France's most
                    popular holiday destinations, from sunny southern escapes to
                    elegant countryside stays.
                </p>
            </div>
        </section>
    )
}

HomepageSEODestinations.defaultProps = {
    maxWidth: 1200,
    background: "#FFFFFF",
    cardBackground: "#F8FAFC",
    borderColor: "#E2E8F0",
    headingColor: "#153852",
    textColor: "#243648",
    mutedColor: "#5E6B78",
    linkColor: "#153852",
    radius: 24,
    topPadding: 20,
    bottomPadding: 20,
}

addPropertyControls(HomepageSEODestinations, {
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
    headingColor: { type: ControlType.Color, title: "Heading" },
    textColor: { type: ControlType.Color, title: "Text" },
    mutedColor: { type: ControlType.Color, title: "Muted" },
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
})
