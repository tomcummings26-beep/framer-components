"use client"

import * as React from "react"
import { addPropertyControls, ControlType } from "framer"

type Props = {
    maxWidth: number
    background: string
    textColor: string
    mutedColor: string
    headingColor: string
    topPadding: number
    bottomPadding: number
}

const SERIF_STACK =
    '"Cormorant Garamond", "Libre Baskerville", Georgia, "Times New Roman", serif'

const SANS_STACK =
    '"Inter", "Inter var", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'
const PAGE_MAX_WIDTH = 1360
const SECTION_INSET_DESKTOP = 20
const SECTION_INSET_MOBILE = 14

export default function HomepageSEOIntro(props: Props) {
    const {
        background,
        textColor,
        mutedColor,
        headingColor,
        topPadding,
        bottomPadding,
    } = props

    return (
        <section
            aria-labelledby="fm-home-intro-heading"
            style={{
                width: "100%",
                background,
                padding: `${topPadding}px 0 ${bottomPadding}px`,
            }}
        >
            <div
                style={{
                    width: "100%",
                    maxWidth: PAGE_MAX_WIDTH,
                    margin: "0 auto",
                    padding: `0 calc(clamp(16px, 2vw, 24px) + ${SECTION_INSET_DESKTOP}px) 0 calc(clamp(16px, 2vw, 24px) + ${SECTION_INSET_DESKTOP}px)`,
                    boxSizing: "border-box",
                    display: "grid",
                    gap: 18,
                }}
            >
                <h2 id="fm-home-intro-heading" style={{ margin: 0 }}>
                    <span
                        style={{
                            display: "block",
                            fontSize: "clamp(22px, 4vw, 38px)",
                            lineHeight: 1,
                            letterSpacing: "-0.03em",
                            color: headingColor,
                            fontFamily: SERIF_STACK,
                            fontWeight: 500,
                        }}
                    >
                        French villa holidays made easier
                    </span>
                </h2>

                <p
                    style={{
                        margin: 0,
                        fontSize: 18,
                        lineHeight: 1.8,
                        color: textColor,
                        fontFamily: SANS_STACK,
                    }}
                >
                    French Maison helps you discover villas and holiday homes in
                    France with a stronger focus on real availability, trusted
                    partners and useful browsing paths. Whether you are looking
                    for a family villa in Dordogne, a summer stay in the South
                    of France, a luxury villa in Provence or a coastal escape in
                    Brittany, the site is designed to help you narrow your
                    search quickly.
                </p>

                <p
                    style={{
                        margin: 0,
                        fontSize: 18,
                        lineHeight: 1.8,
                        color: mutedColor,
                        fontFamily: SANS_STACK,
                    }}
                >
                    Many travellers begin with a destination, while others start
                    with a travel period or a specific villa type. That is why
                    French Maison makes it easier to explore by region, by style
                    and by seasonal demand, helping you spend less time
                    searching and more time planning.
                </p>
            </div>
        </section>
    )
}

HomepageSEOIntro.defaultProps = {
    maxWidth: PAGE_MAX_WIDTH,
    background: "#FFFFFF",
    textColor: "#243648",
    mutedColor: "#5E6B78",
    headingColor: "#153852",
    topPadding: 40,
    bottomPadding: 40,
}

addPropertyControls(HomepageSEOIntro, {
    maxWidth: {
        type: ControlType.Number,
        title: "Max Width",
        min: 800,
        max: 1600,
        step: 10,
    },
    background: { type: ControlType.Color, title: "Background" },
    textColor: { type: ControlType.Color, title: "Text" },
    mutedColor: { type: ControlType.Color, title: "Muted" },
    headingColor: { type: ControlType.Color, title: "Heading" },
    topPadding: {
        type: ControlType.Number,
        title: "Top Pad",
        min: 0,
        max: 320,
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
