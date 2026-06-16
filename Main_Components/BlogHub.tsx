"use client"

import * as React from "react"
import { addPropertyControls, ControlType } from "framer"

/* -----------------------------------------------------------
   BlogHub — editorial blog hub for frenchmaison.co.uk
   - Uniform responsive card grid, newest post first
   - Fetches all articles from a generated JSON file in the repo

   DATA SOURCE
   A Framer code component can't read a CMS collection directly,
   so the 17 Articles are pre-exported to `articles.json` at the
   root of the framer-components repo and fetched at runtime from
   raw.githubusercontent.com (default `sourceUrl` below).

   articles.json is produced by `scripts/gen_articles.py`, which
   reads the published site's search index (title, excerpt, date,
   author, read time, url) and each post's og:image (cover).
   ➜ When you add/edit posts in the CMS and republish, re-run that
   script and commit the refreshed articles.json — no component
   change needed.

   The `posts` prop seeds initial state so the canvas shows content
   instantly; the fetch then replaces it with the live list.
----------------------------------------------------------- */

const ARTICLES_URL =
    "https://raw.githubusercontent.com/tomcummings26-beep/framer-components/main/articles.json"

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

type Post = {
    title: string
    excerpt: string
    cover: string
    date: string
    href: string
    author?: string
    readTime?: string
    featured?: boolean
}

type Props = {
    sourceUrl: string
    posts: Post[]
    heading: string
    intro: string
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
        sourceUrl,
        posts,
        heading,
        intro,
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

    // Seed with the prop posts so the canvas renders instantly,
    // then replace with the live fetched list.
    const [loaded, setLoaded] = React.useState<Post[]>(posts || [])

    React.useEffect(() => {
        if (!sourceUrl) return
        let cancelled = false
        async function load() {
            try {
                const res = await fetch(sourceUrl, { cache: "no-store" })
                if (!res.ok) return
                const data: Post[] = await res.json()
                if (!cancelled && Array.isArray(data) && data.length) {
                    setLoaded(data)
                }
            } catch (err) {
                console.error("BlogHub: failed to load articles", err)
            }
        }
        load()
        return () => {
            cancelled = true
        }
    }, [sourceUrl])

    // Newest first (articles.json is pre-sorted, but stay defensive),
    // then optional cap.
    const visiblePosts = React.useMemo(() => {
        const list = [...(loaded || [])].sort((a, b) => {
            const ta = new Date(a.date).getTime()
            const tb = new Date(b.date).getTime()
            if (isNaN(ta) || isNaN(tb)) return 0
            return tb - ta
        })
        return maxPosts > 0 ? list.slice(0, maxPosts) : list
    }, [loaded, maxPosts])

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
                        Loading articles…
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
                    {post.date ? <span>{post.date}</span> : null}
                    {post.date && (post.author || post.readTime) ? (
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
    sourceUrl: ARTICLES_URL,
    heading: "The French Maison Journal",
    intro: "Stories, guides and inspiration for your next villa holiday in France — from regional travel notes to seasonal highlights.",
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
            title: "Loading the latest articles…",
            excerpt:
                "Live posts are fetched from articles.json. This placeholder shows only if the fetch hasn't completed.",
            cover: "",
            date: "",
            href: "/blog",
        },
    ],
}

addPropertyControls(BlogHub, {
    sourceUrl: {
        type: ControlType.String,
        title: "Source URL",
        description: "articles.json feed (raw GitHub)",
    },
    heading: { type: ControlType.String, title: "Heading" },
    intro: {
        type: ControlType.String,
        title: "Intro",
        displayTextArea: true,
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
