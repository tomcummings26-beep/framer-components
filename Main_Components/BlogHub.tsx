"use client"

import * as React from "react"
import { addPropertyControls, ControlType } from "framer"

/* -----------------------------------------------------------
   BlogHub — editorial blog hub for frenchmaison.co.uk
   - Uniform responsive card grid, newest post first
   - Region filter chips auto-derived from the loaded posts

   DATA SOURCE
   Posts are supplied via the `posts` Array property control
   (schema mirrors a blog CMS collection: Title, Excerpt, Cover,
   Region, Date, Link, Author, Read time, Featured). A single
   Framer code component can't read a whole CMS collection to
   filter across items, so the designer populates/links these
   entries in the properties panel.

   ➜ SWAP POINT: to drive this from a live feed later (e.g. a
   `blog-api` on Railway like villa-api, or an exported CMS JSON),
   replace `props.posts` with a fetched array in a useEffect and
   keep everything below unchanged.
----------------------------------------------------------- */

const SERIF_STACK =
    '"Cormorant Garamond", "Libre Baskerville", Georgia, "Times New Roman", serif'

const SANS_STACK =
    '"Inter", "Inter var", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'

// ✅ Cloudflare image proxy helper (same logic as VillasGrid / Social)
const getOptimizedImage = (url: string, width: number, quality = 80) => {
    const base = "https://img.frenchmaison.co.uk/"
    if (!url) return ""

    const standardWidths = [400, 800, 1200, 1600, 2000]
    const roundToNearest = (target: number) =>
        standardWidths.reduce((prev, curr) =>
            Math.abs(curr - target) < Math.abs(prev - target) ? curr : prev
        )

    const dpr =
        typeof window !== "undefined"
            ? Math.min(window.devicePixelRatio || 1, 2)
            : 1

    const finalWidth = roundToNearest(Math.round(width * dpr))
    return `${base}?url=${encodeURIComponent(url)}&width=${finalWidth}&quality=${quality}`
}

const formatDate = (iso: string) => {
    if (!iso) return ""
    const d = new Date(iso)
    if (isNaN(d.getTime())) return iso
    return d.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
    })
}

type Post = {
    title: string
    excerpt: string
    cover: string
    region: string
    date: string
    href: string
    author?: string
    readTime?: string
    featured?: boolean
}

type Props = {
    posts: Post[]
    heading: string
    intro: string
    showRegionFilter: boolean
    maxPosts: number
    columns: "auto" | "2" | "3" | "4"
    maxWidth: number
    radius: number
    topPadding: number
    bottomPadding: number
    background: string
    cardBackground: string
    borderColor: string
    headingColor: string
    textColor: string
    mutedColor: string
    linkColor: string
}

export default function BlogHub(props: Props) {
    const {
        posts,
        heading,
        intro,
        showRegionFilter,
        maxPosts,
        columns,
        maxWidth,
        radius,
        topPadding,
        bottomPadding,
        background,
        cardBackground,
        borderColor,
        headingColor,
        textColor,
        mutedColor,
        linkColor,
    } = props

    // Newest first, then optional cap
    const sortedPosts = React.useMemo(() => {
        const list = [...(posts || [])].sort(
            (a, b) =>
                new Date(b.date).getTime() - new Date(a.date).getTime()
        )
        return maxPosts > 0 ? list.slice(0, maxPosts) : list
    }, [posts, maxPosts])

    // Region chips derived from the posts we're showing
    const regions = React.useMemo(() => {
        const seen: string[] = []
        for (const p of sortedPosts) {
            const r = (p.region || "").trim()
            if (r && !seen.includes(r)) seen.push(r)
        }
        return seen
    }, [sortedPosts])

    const [activeRegion, setActiveRegion] = React.useState("All")

    // Reset filter if the active region disappears from the data
    React.useEffect(() => {
        if (activeRegion !== "All" && !regions.includes(activeRegion)) {
            setActiveRegion("All")
        }
    }, [regions, activeRegion])

    const visiblePosts =
        activeRegion === "All"
            ? sortedPosts
            : sortedPosts.filter((p) => p.region === activeRegion)

    const gridTemplate =
        columns === "auto"
            ? "repeat(auto-fit, minmax(300px, 1fr))"
            : `repeat(${columns}, 1fr)`

    return (
        <section
            aria-labelledby="fm-blog-heading"
            style={{
                width: "100%",
                background,
                padding: `${topPadding}px 20px ${bottomPadding}px`,
            }}
        >
            <div
                style={{ maxWidth, margin: "0 auto", display: "grid", gap: 28 }}
            >
                {/* Header */}
                <div style={{ display: "grid", gap: 12 }}>
                    <h2 id="fm-blog-heading" style={{ margin: 0 }}>
                        <span
                            style={{
                                display: "block",
                                fontSize: "clamp(28px, 4vw, 42px)",
                                lineHeight: 1.05,
                                letterSpacing: "-0.03em",
                                color: headingColor,
                                fontFamily: SERIF_STACK,
                                fontWeight: 500,
                            }}
                        >
                            {heading}
                        </span>
                    </h2>
                    {intro ? (
                        <p
                            style={{
                                margin: 0,
                                fontSize: 17,
                                lineHeight: 1.8,
                                color: mutedColor,
                                fontFamily: SANS_STACK,
                                maxWidth: 760,
                            }}
                        >
                            {intro}
                        </p>
                    ) : null}
                </div>

                {/* Region filter */}
                {showRegionFilter && regions.length > 0 ? (
                    <div
                        role="tablist"
                        aria-label="Filter posts by region"
                        style={{
                            display: "flex",
                            flexWrap: "wrap",
                            gap: 10,
                        }}
                    >
                        {["All", ...regions].map((region) => {
                            const active = region === activeRegion
                            return (
                                <button
                                    key={region}
                                    role="tab"
                                    aria-selected={active}
                                    onClick={() => setActiveRegion(region)}
                                    style={{
                                        cursor: "pointer",
                                        fontFamily: SANS_STACK,
                                        fontSize: 14,
                                        fontWeight: 600,
                                        letterSpacing: "0.01em",
                                        padding: "8px 16px",
                                        borderRadius: 999,
                                        border: `1px solid ${active ? linkColor : borderColor}`,
                                        background: active
                                            ? linkColor
                                            : "transparent",
                                        color: active ? "#FFFFFF" : textColor,
                                        transition:
                                            "background 0.15s ease, color 0.15s ease, border-color 0.15s ease",
                                    }}
                                >
                                    {region}
                                </button>
                            )
                        })}
                    </div>
                ) : null}

                {/* Grid */}
                {visiblePosts.length > 0 ? (
                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns: gridTemplate,
                            gap: 24,
                        }}
                    >
                        {visiblePosts.map((post, i) => (
                            <BlogCard
                                key={`${post.href}-${i}`}
                                post={post}
                                index={i}
                                cardBackground={cardBackground}
                                borderColor={borderColor}
                                headingColor={headingColor}
                                textColor={textColor}
                                mutedColor={mutedColor}
                                linkColor={linkColor}
                                radius={radius}
                            />
                        ))}
                    </div>
                ) : (
                    <p
                        style={{
                            margin: 0,
                            fontSize: 16,
                            lineHeight: 1.7,
                            color: mutedColor,
                            fontFamily: SANS_STACK,
                        }}
                    >
                        No posts in this region yet.
                    </p>
                )}
            </div>
        </section>
    )
}

/* -----------------------------
   BlogCard
----------------------------- */
function BlogCard({
    post,
    index,
    cardBackground,
    borderColor,
    headingColor,
    textColor,
    mutedColor,
    linkColor,
    radius,
}: {
    post: Post
    index: number
    cardBackground: string
    borderColor: string
    headingColor: string
    textColor: string
    mutedColor: string
    linkColor: string
    radius: number
}) {
    const dateLabel = formatDate(post.date)

    return (
        <a
            href={post.href}
            style={{
                display: "flex",
                flexDirection: "column",
                background: cardBackground,
                border: `1px solid ${borderColor}`,
                borderRadius: radius,
                overflow: "hidden",
                textDecoration: "none",
                boxShadow: post.featured
                    ? "0 12px 30px rgba(21, 56, 82, 0.08)"
                    : "none",
            }}
        >
            {/* Cover */}
            <div
                style={{
                    position: "relative",
                    width: "100%",
                    aspectRatio: "16 / 10",
                    background: "#EDF1F4",
                    overflow: "hidden",
                }}
            >
                {post.cover ? (
                    <img
                        src={getOptimizedImage(post.cover, 800)}
                        alt={post.title}
                        width="800"
                        height="500"
                        decoding="async"
                        loading={index === 0 ? "eager" : "lazy"}
                        style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                            display: "block",
                        }}
                    />
                ) : null}

                {post.region ? (
                    <span
                        style={{
                            position: "absolute",
                            top: 14,
                            left: 14,
                            padding: "6px 12px",
                            borderRadius: 999,
                            background: "rgba(255,255,255,0.92)",
                            color: headingColor,
                            fontFamily: SANS_STACK,
                            fontSize: 12,
                            fontWeight: 600,
                            letterSpacing: "0.04em",
                            textTransform: "uppercase",
                        }}
                    >
                        {post.region}
                    </span>
                ) : null}
            </div>

            {/* Body */}
            <div
                style={{
                    padding: 22,
                    display: "grid",
                    gap: 12,
                    flex: 1,
                }}
            >
                <div
                    style={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: 8,
                        alignItems: "center",
                        fontFamily: SANS_STACK,
                        fontSize: 13,
                        color: mutedColor,
                    }}
                >
                    {dateLabel ? <span>{dateLabel}</span> : null}
                    {dateLabel && (post.author || post.readTime) ? (
                        <span aria-hidden>•</span>
                    ) : null}
                    {post.author ? <span>{post.author}</span> : null}
                    {post.author && post.readTime ? (
                        <span aria-hidden>•</span>
                    ) : null}
                    {post.readTime ? <span>{post.readTime}</span> : null}
                </div>

                <h3 style={{ margin: 0 }}>
                    <span
                        style={{
                            display: "block",
                            fontSize: 24,
                            lineHeight: 1.15,
                            letterSpacing: "-0.02em",
                            color: headingColor,
                            fontFamily: SERIF_STACK,
                            fontWeight: 500,
                        }}
                    >
                        {post.title}
                    </span>
                </h3>

                {post.excerpt ? (
                    <p
                        style={{
                            margin: 0,
                            fontSize: 15,
                            lineHeight: 1.7,
                            color: textColor,
                            fontFamily: SANS_STACK,
                        }}
                    >
                        {post.excerpt}
                    </p>
                ) : null}

                <span
                    style={{
                        marginTop: "auto",
                        color: linkColor,
                        fontFamily: SANS_STACK,
                        fontSize: 15,
                        fontWeight: 600,
                    }}
                >
                    Read article →
                </span>
            </div>
        </a>
    )
}

BlogHub.defaultProps = {
    heading: "The French Maison Journal",
    intro: "Stories, guides and inspiration for your next villa holiday in France — from regional travel notes to seasonal highlights.",
    showRegionFilter: true,
    maxPosts: 0,
    columns: "auto",
    maxWidth: 1200,
    radius: 24,
    topPadding: 40,
    bottomPadding: 40,
    background: "#FFFFFF",
    cardBackground: "#F8FAFC",
    borderColor: "#E2E8F0",
    headingColor: "#153852",
    textColor: "#243648",
    mutedColor: "#5E6B78",
    linkColor: "#153852",
    posts: [
        {
            title: "A Slow Summer in Provence",
            excerpt:
                "Lavender fields, hilltop markets and long lunches — how to plan an unhurried villa holiday in the heart of Provence.",
            cover: "https://images.unsplash.com/photo-1499002238440-d264edd596ec",
            region: "Provence",
            date: "2026-06-01",
            href: "/blog/slow-summer-in-provence",
            author: "French Maison",
            readTime: "6 min read",
            featured: true,
        },
        {
            title: "Brittany's Wild Atlantic Coast",
            excerpt:
                "Rugged coastline, sandy coves and seafood straight off the boat — a guide to coastal villa stays in Brittany.",
            cover: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85",
            region: "Brittany",
            date: "2026-05-18",
            href: "/blog/brittany-atlantic-coast",
            author: "French Maison",
            readTime: "5 min read",
        },
        {
            title: "Family Villa Holidays in the Dordogne",
            excerpt:
                "River valleys, honey-coloured villages and space to roam — why the Dordogne is made for relaxed family trips.",
            cover: "https://images.unsplash.com/photo-1494526585095-c41746248156",
            region: "Dordogne",
            date: "2026-05-02",
            href: "/blog/family-villas-dordogne",
            author: "French Maison",
            readTime: "7 min read",
        },
    ],
}

addPropertyControls(BlogHub, {
    posts: {
        type: ControlType.Array,
        title: "Posts",
        control: {
            type: ControlType.Object,
            controls: {
                title: { type: ControlType.String, title: "Title" },
                excerpt: {
                    type: ControlType.String,
                    title: "Excerpt",
                    displayTextArea: true,
                },
                cover: { type: ControlType.Image, title: "Cover" },
                region: { type: ControlType.String, title: "Region" },
                date: {
                    type: ControlType.String,
                    title: "Date",
                    placeholder: "YYYY-MM-DD",
                },
                href: { type: ControlType.Link, title: "Link" },
                author: { type: ControlType.String, title: "Author" },
                readTime: { type: ControlType.String, title: "Read Time" },
                featured: { type: ControlType.Boolean, title: "Featured" },
            },
        },
    },
    heading: { type: ControlType.String, title: "Heading" },
    intro: {
        type: ControlType.String,
        title: "Intro",
        displayTextArea: true,
    },
    showRegionFilter: {
        type: ControlType.Boolean,
        title: "Region Filter",
        enabledTitle: "Show",
        disabledTitle: "Hide",
    },
    maxPosts: {
        type: ControlType.Number,
        title: "Max Posts",
        min: 0,
        max: 60,
        step: 1,
        description: "0 shows all posts",
    },
    columns: {
        type: ControlType.Enum,
        title: "Columns",
        options: ["auto", "2", "3", "4"],
        optionTitles: ["Auto", "2", "3", "4"],
        displaySegmentedControl: true,
    },
    maxWidth: {
        type: ControlType.Number,
        title: "Max Width",
        min: 800,
        max: 1400,
        step: 10,
    },
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
    background: { type: ControlType.Color, title: "Background" },
    cardBackground: { type: ControlType.Color, title: "Card BG" },
    borderColor: { type: ControlType.Color, title: "Border" },
    headingColor: { type: ControlType.Color, title: "Heading" },
    textColor: { type: ControlType.Color, title: "Text" },
    mutedColor: { type: ControlType.Color, title: "Muted" },
    linkColor: { type: ControlType.Color, title: "Link" },
})
