"use client"

import * as React from "react"
import { useEffect, useMemo, useState } from "react"
import { addPropertyControls, ControlType } from "framer"

type Villa = {
    villa_id: number
    name: string
    region: string
    sub_region: string
    country: string
    parent_region?: string
    address1?: string
    address2?: string
    city?: string
    zip_code?: number | null
    dwelling_type?: string
    capacity: number
    base_capacity?: number | null
    maximum_capacity?: number | null
    bedrooms: number
    bathrooms: number
    main_photo: string
    photos?: string[]
    photo_count?: number
    videos?: { type?: string; url?: string | null }[]
    url: string
    description: string
    location_description?: string
    interior_grounds?: string
    availability_tags?: string[]
    price_gbp_min?: number
    price_gbp_max?: number
    weekly_price_gbp_min?: number | null
    weekly_price_gbp_max?: number | null
    short_break_price_gbp_min?: number | null
    short_break_additional_day_price_gbp_min?: number | null
    minimum_stay_nights?: number | null
    short_break_allowed?: boolean
    min_short_break_duration?: number | null
    changeover_days?: string
    weekly_blocks_only?: boolean
    has_pool?: boolean
    has_private_pool?: boolean
    has_heated_pool?: boolean
    has_aircon?: boolean
    has_wifi?: boolean
    pets_on_request?: boolean
    ideal_for_kids?: boolean
    ideal_for_teens?: boolean
    parking_space?: boolean
    ev_charging?: boolean
    latitude?: number | null
    longitude?: number | null
    amenities?: string
    amenities_list?: string[]
    terms_and_conditions_list?: { title: string; details: string }[]
    security_deposit?: string
    arrival_time?: string
    departure_time?: string
    minimum_stay_note?: string
    pets_allowed_note?: string
    pool_heating_note?: string
    pool_opening_dates_note?: string
    smoking_allowed_note?: string
    end_of_stay_cleaning_note?: string
    other_ts_and_cs?: string
}

type LiveAvailabilityBlock = {
    start_date: string
    end_date: string
    bookable: boolean
    weekly_blocks_only?: boolean
}

type LiveRate = {
    on_sale_from: string
    on_sale_until?: string | null
    base_capacity?: number
    changeover_days?: string
    weekly_price?: { currency: string; price: number }[]
    minimum_stay_length?: number
    short_break_allowed?: boolean
    min_short_break_duration?: number
    short_break_price?: { currency: string; price: number }[]
    short_break_additional_day_price?: { currency: string; price: number }[]
    weekly_blocks_only?: boolean
}

type LiveVillaData = {
    villa_id: number
    availability_last_updated?: string
    pricing_last_updated?: string
    availability: LiveAvailabilityBlock[]
    rates: LiveRate[]
}

type Props = {
    fallbackVillaId?: number
}

type SavedVilla = {
    villa_id: number
    name: string
    region_label: string
    main_photo: string
    price_gbp_min?: number
    price_gbp_max?: number
    url: string
}

const API_BASE = "https://villa-api-production.up.railway.app"
const ENQUIRY_ENDPOINT = "https://fmenquiry-production.up.railway.app/enquiry"
const BOOKING_REQUEST_ENDPOINT =
    "https://fmbookingrequest-production.up.railway.app/booking-request"
const SAVED_VILLAS_STORAGE_KEY = "fm_saved_villas"

const ACCENT = "#153852"
const GREEN = "#10b981"
const BLUE = "#0e84c9"
const BORDER = "#e5e7eb"
const TEXT_MUTED = "#6b7280"
const CARD_BG = "#ffffff"
const SOFT_BG = "#fbfaf7"

const AMENITY_PRIORITY = [
    "Private Pool",
    "Heated Pool",
    "Wi-Fi/Internet",
    "Air-Con",
    "Ideal for Kids",
    "Ideal for Teens",
    "Ground Floor Bed & Bath",
    "High Chair(s)",
    "Cots (Cribs)",
    "Baby bath",
    "Fenced Grounds",
    "Parking Space",
    "Washing Machine",
    "Tumble Dryer",
    "Laptop Friendly Workspace",
    "Table Tennis",
    "Pool/Snooker",
    "Badminton",
    "Outdoor Games",
    "Indoor Games",
    "Board games",
    "Golf Nearby",
    "Watersports",
    "Horse Riding",
    "Walking/Hiking Paths",
    "Rural Location",
    "Fishing",
    "TV",
    "Heating",
]

const AMENITY_LABELS: Record<string, string> = {
    "Wi-Fi/Internet": "Wi-Fi",
    "Air-Con": "Air conditioning",
    "Ideal for Kids": "Family friendly",
    "Ideal for Teens": "Great for teens",
    "Ground Floor Bed & Bath": "Ground floor bed & bath",
    "High Chair(s)": "High chair",
    "Cots (Cribs)": "Cot / crib",
    "Private Pool": "Private pool",
    "Heated Pool": "Heated pool",
    "Pool/Snooker": "Pool table",
    "Outdoor Games": "Outdoor games",
    "Indoor Games": "Indoor games",
    "Board games": "Board games",
    "Walking/Hiking Paths": "Walking nearby",
    "Rural Location": "Rural setting",
    "Golf Nearby": "Golf nearby",
    "Laptop Friendly Workspace": "Workspace",
}

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

function penceToPounds(value: number) {
    return value / 100
}

function getSavedVillas(): SavedVilla[] {
    if (typeof window === "undefined") return []

    try {
        const raw = window.localStorage.getItem(SAVED_VILLAS_STORAGE_KEY)
        if (!raw) return []

        const parsed = JSON.parse(raw)
        return Array.isArray(parsed) ? parsed : []
    } catch {
        return []
    }
}

function writeSavedVillas(savedVillas: SavedVilla[]) {
    if (typeof window === "undefined") return
    window.localStorage.setItem(
        SAVED_VILLAS_STORAGE_KEY,
        JSON.stringify(savedVillas)
    )
}

function getGBP(prices?: { currency: string; price: number }[]) {
    const match = prices?.find((p) => p.currency === "GBP")
    return match ? penceToPounds(match.price) : null
}

function parseISODate(dateStr: string) {
    const [y, m, d] = dateStr.split("-").map(Number)
    return new Date(y, m - 1, d)
}

function toISODate(date: Date) {
    const y = date.getFullYear()
    const m = String(date.getMonth() + 1).padStart(2, "0")
    const d = String(date.getDate()).padStart(2, "0")
    return `${y}-${m}-${d}`
}

function dateKey(date: Date) {
    return toISODate(date)
}

function startOfMonth(date: Date) {
    return new Date(date.getFullYear(), date.getMonth(), 1)
}

function endOfMonth(date: Date) {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0)
}

function addMonths(date: Date, amount: number) {
    return new Date(date.getFullYear(), date.getMonth() + amount, 1)
}

function buildCalendarDays(monthDate: Date) {
    const first = startOfMonth(monthDate)
    const last = endOfMonth(monthDate)
    const startWeekday = (first.getDay() + 6) % 7
    const days: Date[] = []

    for (let i = 0; i < startWeekday; i++) {
        const d = new Date(first)
        d.setDate(first.getDate() - (startWeekday - i))
        days.push(d)
    }

    for (let d = 1; d <= last.getDate(); d++) {
        days.push(new Date(monthDate.getFullYear(), monthDate.getMonth(), d))
    }

    while (days.length % 7 !== 0) {
        const next = new Date(days[days.length - 1])
        next.setDate(next.getDate() + 1)
        days.push(next)
    }

    while (days.length < 42) {
        const next = new Date(days[days.length - 1])
        next.setDate(next.getDate() + 1)
        days.push(next)
    }

    return days
}

function nightsBetween(startDate: string, endDate: string) {
    const start = parseISODate(startDate)
    const end = parseISODate(endDate)
    return Math.round((end.getTime() - start.getTime()) / 86400000)
}

function formatSingleDateLabel(dateStr: string) {
    return parseISODate(dateStr).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
    })
}

function getMatchingRate(rates: LiveRate[], startDate: string) {
    const start = parseISODate(startDate)

    const sorted = [...rates].sort(
        (a, b) =>
            new Date(a.on_sale_from).getTime() -
            new Date(b.on_sale_from).getTime()
    )

    let selected: LiveRate | null = null

    for (const rate of sorted) {
        const from = parseISODate(rate.on_sale_from)
        const until = rate.on_sale_until
            ? parseISODate(rate.on_sale_until)
            : null
        if (start >= from && (!until || start <= until)) {
            selected = rate
        }
    }

    return selected
}

function normaliseChangeoverDays(changeoverDays?: string) {
    if (!changeoverDays) return null

    const lower = changeoverDays.toLowerCase()
    const map: Record<string, number> = {
        mon: 1,
        monday: 1,
        tue: 2,
        tues: 2,
        tuesday: 2,
        wed: 3,
        wednesday: 3,
        thu: 4,
        thur: 4,
        thurs: 4,
        thursday: 4,
        fri: 5,
        friday: 5,
        sat: 6,
        saturday: 6,
        sun: 0,
        sunday: 0,
    }

    const values = lower
        .split(/[,/| ]+/)
        .map((v) => v.trim())
        .filter(Boolean)
        .map((token) => map[token])
        .filter((v) => v !== undefined)

    return values.length ? values : null
}

function isArrivalDateSelectable(
    dateStr: string,
    blocks: LiveAvailabilityBlock[],
    rates: LiveRate[]
) {
    const containingBlock = blocks.find(
        (block) =>
            block.bookable &&
            dateStr >= block.start_date &&
            dateStr < block.end_date
    )

    if (!containingBlock) return false

    const rate = getMatchingRate(rates, dateStr)
    if (!rate) return true

    const allowedChangeoverDays = normaliseChangeoverDays(rate.changeover_days)
    if (
        allowedChangeoverDays?.length &&
        !allowedChangeoverDays.includes(parseISODate(dateStr).getDay())
    ) {
        return false
    }

    return hasValidDepartureForStart(dateStr, containingBlock, blocks, rates)
}

function isDateBookableNight(dateStr: string, blocks: LiveAvailabilityBlock[]) {
    return blocks.some(
        (block) =>
            block.bookable &&
            dateStr >= block.start_date &&
            dateStr < block.end_date
    )
}

function isStayWithinContinuousBlock(
    startDate: string,
    endDate: string,
    blocks: LiveAvailabilityBlock[]
) {
    return blocks.find(
        (block) =>
            block.bookable &&
            startDate >= block.start_date &&
            endDate <= block.end_date
    )
}

function isValidStayRange(
    startDate: string,
    endDate: string,
    blocks: LiveAvailabilityBlock[],
    rates: LiveRate[]
) {
    if (!startDate || !endDate || endDate <= startDate) {
        return {
            valid: false,
            error: "Please choose valid arrival and departure dates.",
        }
    }

    const containingBlock = isStayWithinContinuousBlock(
        startDate,
        endDate,
        blocks
    )

    if (!containingBlock) {
        return {
            valid: false,
            error: "Those dates are not available as one continuous stay.",
        }
    }

    const nights = nightsBetween(startDate, endDate)
    const rate = getMatchingRate(rates, startDate)

    if (!rate) {
        return { valid: false, error: "No live rate found for those dates." }
    }

    if (rate.weekly_blocks_only || containingBlock.weekly_blocks_only) {
        if (nights !== 7) {
            return {
                valid: false,
                error: "This property is currently bookable in 7-night blocks only.",
            }
        }
    }

    if (rate.minimum_stay_length && nights < rate.minimum_stay_length) {
        return {
            valid: false,
            error: `Minimum stay is ${rate.minimum_stay_length} nights.`,
        }
    }

    const allowedChangeoverDays = normaliseChangeoverDays(rate.changeover_days)
    if (allowedChangeoverDays?.length) {
        const startDay = parseISODate(startDate).getDay()
        if (!allowedChangeoverDays.includes(startDay)) {
            return {
                valid: false,
                error: "Selected arrival day is not allowed for this rate.",
            }
        }
    }

    if (nights < 7 && !rate.short_break_allowed) {
        return {
            valid: false,
            error: "Short stays are not available for these dates.",
        }
    }

    if (nights < 7 && rate.short_break_allowed) {
        const minShort =
            rate.min_short_break_duration || rate.minimum_stay_length || nights
        if (nights < minShort) {
            return {
                valid: false,
                error: `Minimum short break is ${minShort} nights.`,
            }
        }
    }

    return { valid: true, error: "" }
}

function hasValidDepartureForStart(
    startDate: string,
    containingBlock: LiveAvailabilityBlock,
    blocks: LiveAvailabilityBlock[],
    rates: LiveRate[]
) {
    const end = parseISODate(containingBlock.end_date)
    const cursor = parseISODate(startDate)
    cursor.setDate(cursor.getDate() + 1)

    while (cursor <= end) {
        if (
            isValidStayRange(startDate, toISODate(cursor), blocks, rates).valid
        ) {
            return true
        }
        cursor.setDate(cursor.getDate() + 1)
    }

    return false
}

function isDepartureDateSelectable(
    startDate: string,
    endDate: string,
    blocks: LiveAvailabilityBlock[],
    rates: LiveRate[]
) {
    return isValidStayRange(startDate, endDate, blocks, rates).valid
}

function calculateIndicativePriceForStay(
    rates: LiveRate[],
    startDate: string,
    endDate: string,
    blocks: LiveAvailabilityBlock[]
) {
    const validation = isValidStayRange(startDate, endDate, blocks, rates)
    if (!validation.valid) {
        return {
            price: null as number | null,
            error: validation.error,
            note: "",
        }
    }

    const nights = nightsBetween(startDate, endDate)
    const rate = getMatchingRate(rates, startDate)

    if (!rate) {
        return {
            price: null as number | null,
            error: "No rate found",
            note: "",
        }
    }

    const weekly = getGBP(rate.weekly_price)
    const shortBreak = getGBP(rate.short_break_price)
    const extraDay = getGBP(rate.short_break_additional_day_price)

    if (nights === 7 && weekly != null) {
        return { price: weekly, error: "", note: "" }
    }

    if (rate.short_break_allowed && shortBreak != null) {
        const minShort =
            rate.min_short_break_duration || rate.minimum_stay_length || nights

        if (nights === minShort) {
            return { price: shortBreak, error: "", note: "" }
        }

        if (nights > minShort && extraDay != null) {
            return {
                price: shortBreak + extraDay * (nights - minShort),
                error: "",
                note: "",
            }
        }
    }

    if (weekly != null) {
        const nightlyEstimate = weekly / 7
        return {
            price: nightlyEstimate * nights,
            error: "",
            note: "Indicative estimate based on weekly pricing.",
        }
    }

    return {
        price: null as number | null,
        error: "Unable to calculate live indicative price for these dates.",
        note: "",
    }
}

function isDateInSelectedRange(
    dateStr: string,
    startDate: string | null,
    endDate: string | null
) {
    if (!startDate || !endDate) return false
    return dateStr >= startDate && dateStr <= endDate
}

function getInitialCalendarMonth(blocks: LiveAvailabilityBlock[]) {
    const firstBookable = blocks.find((b) => b.bookable)
    if (!firstBookable) return new Date()
    const d = parseISODate(firstBookable.start_date)
    return new Date(d.getFullYear(), d.getMonth(), 1)
}

function blockUsesPassiveCheckMarkers(
    block: LiveAvailabilityBlock,
    rates: LiveRate[]
) {
    if (block.weekly_blocks_only) return true

    const rate = getMatchingRate(rates, block.start_date)
    if (!rate) return false

    if (rate.weekly_blocks_only) return true

    if (rate.short_break_allowed) return false

    if (rate.minimum_stay_length && rate.minimum_stay_length < 7) {
        return false
    }

    const changeoverDays = normaliseChangeoverDays(rate.changeover_days)
    return !!(changeoverDays && changeoverDays.length === 1)
}

function isPassiveArrivalBoundary(
    dateStr: string,
    blocks: LiveAvailabilityBlock[],
    rates: LiveRate[]
) {
    const containingBlock = blocks.find(
        (block) =>
            block.bookable &&
            dateStr >= block.start_date &&
            dateStr < block.end_date
    )

    if (
        !containingBlock ||
        !blockUsesPassiveCheckMarkers(containingBlock, rates)
    ) {
        return false
    }

    if (!isArrivalDateSelectable(dateStr, blocks, rates)) return false

    const previousDay = parseISODate(dateStr)
    previousDay.setDate(previousDay.getDate() - 1)

    return !isArrivalDateSelectable(toISODate(previousDay), blocks, rates)
}

function isPassiveDepartureBoundary(
    dateStr: string,
    blocks: LiveAvailabilityBlock[],
    rates: LiveRate[]
) {
    return blocks.some(
        (block) =>
            block.bookable &&
            block.end_date === dateStr &&
            blockUsesPassiveCheckMarkers(block, rates)
    )
}

function shouldShowTag(tag: string) {
    return !tag.toLowerCase().includes("available in ")
}

function useIsMobile(breakpoint = 900) {
    const [isMobile, setIsMobile] = useState(false)

    useEffect(() => {
        if (typeof window === "undefined") return
        const onResize = () => setIsMobile(window.innerWidth <= breakpoint)
        onResize()
        window.addEventListener("resize", onResize)
        return () => window.removeEventListener("resize", onResize)
    }, [breakpoint])

    return isMobile
}

function useContainerIsMobile<T extends HTMLElement>(breakpoint = 900) {
    const ref = React.useRef<T | null>(null)
    const [isMobile, setIsMobile] = useState(false)

    useEffect(() => {
        if (typeof window === "undefined") return

        const element = ref.current
        const update = () => {
            const width = element?.getBoundingClientRect().width
            setIsMobile(
                width != null && width > 0
                    ? width <= breakpoint
                    : window.innerWidth <= breakpoint
            )
        }

        update()

        if (typeof ResizeObserver === "undefined" || !element) {
            window.addEventListener("resize", update)
            return () => window.removeEventListener("resize", update)
        }

        const observer = new ResizeObserver(update)
        observer.observe(element)
        window.addEventListener("resize", update)

        return () => {
            observer.disconnect()
            window.removeEventListener("resize", update)
        }
    }, [breakpoint])

    return [ref, isMobile] as const
}

function parseAmenitiesList(villa: Villa | null) {
    if (!villa) return []

    if (Array.isArray(villa.amenities_list)) {
        return villa.amenities_list.map((a) => String(a).trim()).filter(Boolean)
    }

    if (villa.amenities) {
        return String(villa.amenities)
            .split(",")
            .map((a) => a.trim())
            .filter(Boolean)
    }

    return []
}

function getKeyAmenities(amenities: string[], limit = 8) {
    const clean = [...new Set(amenities.map((a) => a.trim()).filter(Boolean))]
    const matched = AMENITY_PRIORITY.filter((item) => clean.includes(item))
    const remainder = clean.filter((item) => !matched.includes(item))
    return [...matched, ...remainder].slice(0, limit)
}

function formatAmenityLabel(label: string) {
    return AMENITY_LABELS[label] || label
}

function amenityIcon(label: string) {
    const item = formatAmenityLabel(label).toLowerCase()
    if (item.includes("pool")) return "🏊"
    if (item.includes("wi")) return "📶"
    if (item.includes("air")) return "❄️"
    if (item.includes("family")) return "👨‍👩‍👧‍👦"
    if (item.includes("teen")) return "🎯"
    if (item.includes("cot") || item.includes("crib")) return "🛏️"
    if (item.includes("high chair")) return "🪑"
    if (item.includes("games")) return "🎲"
    if (item.includes("golf")) return "⛳"
    if (item.includes("walking")) return "🥾"
    if (item.includes("rural")) return "🌿"
    if (item.includes("workspace")) return "💻"
    if (item.includes("parking")) return "🚗"
    return "✓"
}

function hasValidCoordinates(villa: Villa | null) {
    const lat = villa?.latitude
    const lng = villa?.longitude
    return (
        typeof lat === "number" &&
        typeof lng === "number" &&
        Number.isFinite(lat) &&
        Number.isFinite(lng)
    )
}

function buildGoogleMapEmbedUrl(villa: Villa) {
    const lat = villa.latitude as number
    const lng = villa.longitude as number
    return `https://maps.google.com/maps?q=${lat},${lng}&z=12&output=embed`
}

function formatCurrency(value?: number | null) {
    if (!value || value <= 0) return "Price on request"
    return `£${Math.round(value).toLocaleString()}`
}

function clampText(text: string, max = 340) {
    const clean = String(text || "").trim()
    if (clean.length <= max) return { text: clean, trimmed: false }
    const slice = clean.slice(0, max)
    const safe = slice.slice(0, slice.lastIndexOf(" "))
    return { text: `${safe}…`, trimmed: true }
}

function replaceBrandMentionsInText(text: string) {
    return text.replace(/Oliver['’]s Travels/gi, "French Maison")
}

function sanitiseVillaContent<T>(value: T): T {
    if (typeof value === "string") {
        return replaceBrandMentionsInText(value) as T
    }

    if (Array.isArray(value)) {
        return value.map((item) => sanitiseVillaContent(item)) as T
    }

    if (value && typeof value === "object") {
        return Object.fromEntries(
            Object.entries(value).map(([key, item]) => [
                key,
                sanitiseVillaContent(item),
            ])
        ) as T
    }

    return value
}

function statItem(label: string, value: string, icon?: string) {
    return { label, value, icon }
}

function Lightbox({
    isOpen,
    photos,
    index,
    onClose,
    onPrev,
    onNext,
    setIndex,
}: {
    isOpen: boolean
    photos: string[]
    index: number
    onClose: () => void
    onPrev: () => void
    onNext: () => void
    setIndex: (n: number) => void
}) {
    const isMobile = useIsMobile(900)
    const thumbRefs = React.useRef<Array<HTMLButtonElement | null>>([])

    useEffect(() => {
        if (!isOpen) return

        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose()
            if (e.key === "ArrowLeft") onPrev()
            if (e.key === "ArrowRight") onNext()
        }

        window.addEventListener("keydown", onKey)
        document.body.style.overflow = "hidden"

        return () => {
            window.removeEventListener("keydown", onKey)
            document.body.style.overflow = ""
        }
    }, [isOpen, onClose, onPrev, onNext])

    useEffect(() => {
        if (!isOpen) return
        thumbRefs.current[index]?.scrollIntoView({
            behavior: "smooth",
            block: "nearest",
            inline: "center",
        })
    }, [index, isOpen])

    if (!isOpen || !photos.length) return null

    return (
        <div
            onClick={onClose}
            style={{
                position: "fixed",
                inset: 0,
                background: "rgba(15, 23, 42, 0.92)",
                zIndex: 9999,
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                padding: "20px",
            }}
        >
            <button
                onClick={onClose}
                style={{
                    position: "absolute",
                    top: 18,
                    right: 18,
                    width: 42,
                    height: 42,
                    borderRadius: 999,
                    border: "1px solid rgba(255,255,255,0.25)",
                    background: "rgba(255,255,255,0.12)",
                    color: "white",
                    fontSize: 24,
                    cursor: "pointer",
                }}
            >
                ×
            </button>

            {photos.length > 1 && (
                <>
                    <button
                        onClick={(e) => {
                            e.stopPropagation()
                            onPrev()
                        }}
                        style={lightboxNav("left", isMobile)}
                        aria-label="Previous photo"
                    >
                        <span
                            style={{
                                fontSize: isMobile ? 28 : 22,
                                lineHeight: 1,
                            }}
                        >
                            ‹
                        </span>
                        {!isMobile && <span>Prev</span>}
                    </button>
                    <button
                        onClick={(e) => {
                            e.stopPropagation()
                            onNext()
                        }}
                        style={lightboxNav("right", isMobile)}
                        aria-label="Next photo"
                    >
                        {!isMobile && <span>Next</span>}
                        <span
                            style={{
                                fontSize: isMobile ? 28 : 22,
                                lineHeight: 1,
                            }}
                        >
                            ›
                        </span>
                    </button>
                </>
            )}

            <div
                onClick={(e) => e.stopPropagation()}
                style={{
                    width: "100%",
                    maxWidth: "1200px",
                    margin: "0 auto",
                    display: "grid",
                    gap: "14px",
                }}
            >
                <div
                    style={{
                        borderRadius: 18,
                        overflow: "hidden",
                        background: "#111827",
                        maxHeight: "78vh",
                    }}
                >
                    <img
                        src={getOptimizedImage(photos[index], 2000, 85)}
                        alt={`Photo ${index + 1}`}
                        style={{
                            width: "100%",
                            maxHeight: "78vh",
                            objectFit: "contain",
                            display: "block",
                            background: "#111827",
                        }}
                    />
                </div>

                <div
                    style={{
                        display: "flex",
                        gap: isMobile ? 10 : 12,
                        overflowX: "auto",
                        paddingBottom: 8,
                        paddingInline: 2,
                        scrollbarWidth: "thin",
                    }}
                >
                    {photos.map((img, i) => (
                        <button
                            key={i}
                            onClick={() => setIndex(i)}
                            ref={(node) => {
                                thumbRefs.current[i] = node
                            }}
                            style={{
                                flex: "0 0 auto",
                                padding: 0,
                                border:
                                    i === index
                                        ? "2px solid white"
                                        : "2px solid transparent",
                                borderRadius: 10,
                                overflow: "hidden",
                                background: "transparent",
                                cursor: "pointer",
                                opacity: i === index ? 1 : 0.65,
                                boxShadow:
                                    i === index
                                        ? "0 8px 20px rgba(0,0,0,0.28)"
                                        : "none",
                            }}
                        >
                            <img
                                src={getOptimizedImage(img, 240, 70)}
                                alt={`Thumb ${i + 1}`}
                                style={{
                                    width: isMobile ? 76 : 92,
                                    height: isMobile ? 58 : 68,
                                    objectFit: "cover",
                                    display: "block",
                                }}
                            />
                        </button>
                    ))}
                </div>
            </div>
        </div>
    )
}

function HeroArrowButton({
    direction,
    onClick,
    isMobile,
}: {
    direction: "left" | "right"
    onClick: () => void
    isMobile: boolean
}) {
    return (
        <button
            onClick={(e) => {
                e.stopPropagation()
                onClick()
            }}
            aria-label={direction === "left" ? "Previous image" : "Next image"}
            style={{
                position: "absolute",
                top: "50%",
                [direction === "left" ? "left" : "right"]: "16px",
                transform: "translateY(-50%)",
                width: isMobile ? "38px" : "42px",
                height: isMobile ? "38px" : "42px",
                borderRadius: "999px",
                border: "1px solid rgba(255,255,255,0.75)",
                background: "rgba(255,255,255,0.72)",
                backdropFilter: "blur(6px)",
                color: ACCENT,
                fontSize: isMobile ? "22px" : "24px",
                lineHeight: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                boxShadow: "0 4px 12px rgba(0,0,0,0.12)",
                zIndex: 2,
            }}
        >
            {direction === "left" ? "‹" : "›"}
        </button>
    )
}

function ReadMoreSection({
    title,
    text,
    max = 340,
}: {
    title: string
    text?: string
    max?: number
}) {
    const [expanded, setExpanded] = useState(false)
    const clean = String(text || "").trim()
    if (!clean) return null
    const preview = clampText(clean, max)

    return (
        <section style={sectionCardStyle}>
            <h3 style={sectionHeadingStyle}>{title}</h3>
            <p style={bodyTextStyle}>
                {expanded || !preview.trimmed ? clean : preview.text}
            </p>
            {preview.trimmed && (
                <button
                    onClick={() => setExpanded((v) => !v)}
                    style={linkButtonStyle}
                >
                    {expanded ? "Read less" : "Read more"}
                </button>
            )}
        </section>
    )
}

function HighlightsRow({ villa }: { villa: Villa }) {
    const items = [
        villa.has_private_pool ? "Private pool" : "",
        villa.has_heated_pool ? "Heated pool" : "",
        villa.has_aircon ? "Air conditioning" : "",
        villa.has_wifi ? "Wi-Fi" : "",
        villa.ideal_for_kids ? "Family friendly" : "",
        villa.parking_space ? "Parking" : "",
        villa.ev_charging ? "EV charging" : "",
        villa.pets_on_request ? "Pets on request" : "",
    ].filter(Boolean)

    if (!items.length) return null

    return (
        <div
            style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 8,
                marginBottom: 20,
            }}
        >
            {items.map((item) => (
                <span
                    key={item}
                    style={{
                        display: "inline-flex",
                        alignItems: "center",
                        padding: "9px 12px",
                        borderRadius: 999,
                        background: "#f8fafc",
                        border: `1px solid ${BORDER}`,
                        color: ACCENT,
                        fontSize: 13,
                        fontWeight: 700,
                    }}
                >
                    {item}
                </span>
            ))}
        </div>
    )
}

function AmenitiesSection({
    villa,
    isMobile,
}: {
    villa: Villa
    isMobile: boolean
}) {
    const [showAll, setShowAll] = useState(false)
    const amenitiesList = useMemo(() => parseAmenitiesList(villa), [villa])

    const keyAmenities = useMemo(
        () => getKeyAmenities(amenitiesList, 8),
        [amenitiesList]
    )

    const allAmenities = useMemo(() => {
        return [...new Set(amenitiesList)]
            .filter((a) => a !== "Has Discount" && a !== "Special Offer")
            .sort((a, b) => a.localeCompare(b))
    }, [amenitiesList])

    if (!allAmenities.length) return null

    return (
        <section style={sectionCardStyle}>
            <h3 style={sectionHeadingStyle}>Amenities</h3>

            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: isMobile
                        ? "1fr"
                        : "repeat(auto-fit, minmax(210px, 1fr))",
                    gap: 10,
                    minWidth: 0,
                }}
            >
                {(showAll ? allAmenities : keyAmenities).map((item) => (
                    <div
                        key={item}
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 10,
                            padding: "10px 12px",
                            borderRadius: 12,
                            background: "#fff",
                            border: `1px solid ${BORDER}`,
                        }}
                    >
                        <span style={{ width: 24, textAlign: "center" }}>
                            {amenityIcon(item)}
                        </span>
                        <span
                            style={{
                                fontSize: 14,
                                color: "#374151",
                                fontWeight: 600,
                            }}
                        >
                            {formatAmenityLabel(item)}
                        </span>
                    </div>
                ))}
            </div>

            {allAmenities.length > keyAmenities.length && (
                <button
                    onClick={() => setShowAll((v) => !v)}
                    style={{ ...linkButtonStyle, marginTop: 14 }}
                >
                    {showAll
                        ? "Show fewer amenities"
                        : `Show all amenities (${allAmenities.length})`}
                </button>
            )}
        </section>
    )
}

function LocationSection({
    villa,
    isMobile,
}: {
    villa: Villa
    isMobile: boolean
}) {
    const [expanded, setExpanded] = useState(false)
    const preview = clampText(villa.location_description || "", 260)

    return (
        <section style={sectionCardStyle}>
            <h3 style={sectionHeadingStyle}>Location</h3>

            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: isMobile
                        ? "1fr"
                        : "minmax(0, 1.1fr) minmax(260px, 0.9fr)",
                    gap: 18,
                    alignItems: "start",
                }}
            >
                <div>
                    {villa.location_description ? (
                        <>
                            <p style={bodyTextStyle}>
                                {expanded || !preview.trimmed
                                    ? villa.location_description
                                    : preview.text}
                            </p>
                            {preview.trimmed && (
                                <button
                                    onClick={() => setExpanded((v) => !v)}
                                    style={linkButtonStyle}
                                >
                                    {expanded ? "Read less" : "Read more"}
                                </button>
                            )}
                        </>
                    ) : (
                        <p style={bodyTextStyle}>
                            Location details coming soon.
                        </p>
                    )}

                    <div
                        style={{
                            marginTop: 14,
                            display: "flex",
                            flexWrap: "wrap",
                            gap: 8,
                        }}
                    >
                        {villa.sub_region ? (
                            <span style={pillStyle}>{villa.sub_region}</span>
                        ) : null}
                        {villa.region ? (
                            <span style={pillStyle}>{villa.region}</span>
                        ) : null}
                        {villa.country ? (
                            <span style={pillStyle}>{villa.country}</span>
                        ) : null}
                    </div>
                </div>

                <div
                    style={{
                        alignSelf: "start",
                        borderRadius: 16,
                        overflow: "hidden",
                        border: `1px solid ${BORDER}`,
                        background: "#eef2f7",
                        minHeight: 280,
                    }}
                >
                    {hasValidCoordinates(villa) ? (
                        <iframe
                            title={`Map showing the location of ${villa.name}`}
                            src={buildGoogleMapEmbedUrl(villa)}
                            style={{
                                width: "100%",
                                height: 280,
                                border: 0,
                                display: "block",
                            }}
                            loading="lazy"
                        />
                    ) : (
                        <div
                            style={{
                                height: 280,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                color: TEXT_MUTED,
                                padding: 24,
                                textAlign: "center",
                            }}
                        >
                            Map location coming soon
                        </div>
                    )}
                </div>
            </div>
        </section>
    )
}

function ThingsToKnow({ villa }: { villa: Villa }) {
    const [expanded, setExpanded] = useState(false)

    const rows = [
        villa.arrival_time ? statItem("Arrival", villa.arrival_time) : null,
        villa.departure_time
            ? statItem("Departure", villa.departure_time)
            : null,
        villa.minimum_stay_note
            ? statItem("Minimum stay", villa.minimum_stay_note)
            : null,
        villa.pets_allowed_note
            ? statItem("Pets", villa.pets_allowed_note)
            : null,
        villa.pool_heating_note
            ? statItem("Pool heating", villa.pool_heating_note)
            : null,
        villa.pool_opening_dates_note
            ? statItem("Pool opening", villa.pool_opening_dates_note)
            : null,
        villa.smoking_allowed_note
            ? statItem("Smoking", villa.smoking_allowed_note)
            : null,
        villa.end_of_stay_cleaning_note
            ? statItem("Cleaning", villa.end_of_stay_cleaning_note)
            : null,
        villa.other_ts_and_cs
            ? statItem("More details", villa.other_ts_and_cs)
            : null,
    ].filter(Boolean) as { label: string; value: string }[]

    const shown = expanded ? rows : rows.slice(0, 6)

    if (!rows.length) return null

    return (
        <section style={sectionCardStyle}>
            <h3 style={sectionHeadingStyle}>Things to know</h3>

            <div style={{ display: "grid", gap: 12 }}>
                {shown.map((row) => (
                    <div
                        key={row.label}
                        style={{
                            paddingBottom: 12,
                            borderBottom: `1px solid ${BORDER}`,
                        }}
                    >
                        <div
                            style={{
                                fontSize: 12,
                                fontWeight: 800,
                                color: TEXT_MUTED,
                                textTransform: "uppercase",
                                letterSpacing: "0.04em",
                                marginBottom: 5,
                            }}
                        >
                            {row.label}
                        </div>
                        <div
                            style={{
                                fontSize: 14,
                                lineHeight: 1.55,
                                color: "#374151",
                                whiteSpace: "pre-line",
                            }}
                        >
                            {row.value}
                        </div>
                    </div>
                ))}
            </div>

            {rows.length > 6 && (
                <button
                    onClick={() => setExpanded((v) => !v)}
                    style={{ ...linkButtonStyle, marginTop: 14 }}
                >
                    {expanded
                        ? "Show fewer details"
                        : `Show all details (${rows.length})`}
                </button>
            )}
        </section>
    )
}

function TermsAndConditions({ villa }: { villa: Villa }) {
    const priorities = [
        {
            match: "security deposit",
            label: "Security deposit",
            fallback: villa.security_deposit,
        },
        {
            match: "insurance",
            label: "Insurance",
        },
        {
            match: "tax",
            label: "Tax",
        },
        {
            match: "end of stay cleaning",
            label: "End of stay cleaning",
            fallback: villa.end_of_stay_cleaning_note,
        },
    ]

    const rows = priorities
        .map(({ match, label, fallback }) => {
            const item = villa.terms_and_conditions_list?.find((entry) =>
                entry.title.toLowerCase().includes(match)
            )
            const value = item?.details || fallback
            return value ? statItem(label, value) : null
        })
        .filter(Boolean) as { label: string; value: string }[]

    if (!rows.length) return null

    return (
        <section style={sectionCardStyle}>
            <h3 style={sectionHeadingStyle}>Terms & conditions</h3>

            <div style={{ display: "grid", gap: 12 }}>
                {rows.map((row) => (
                    <div
                        key={row.label}
                        style={{
                            paddingBottom: 12,
                            borderBottom: `1px solid ${BORDER}`,
                        }}
                    >
                        <div
                            style={{
                                fontSize: 12,
                                fontWeight: 800,
                                color: TEXT_MUTED,
                                textTransform: "uppercase",
                                letterSpacing: "0.04em",
                                marginBottom: 5,
                            }}
                        >
                            {row.label}
                        </div>
                        <div
                            style={{
                                fontSize: 14,
                                lineHeight: 1.55,
                                color: "#374151",
                                whiteSpace: "pre-line",
                            }}
                        >
                            {row.value}
                        </div>
                    </div>
                ))}
            </div>
        </section>
    )
}

function SimilarProperties({
    similar,
    isMobile,
}: {
    similar: Villa[]
    isMobile: boolean
}) {
    const [visibleCount, setVisibleCount] = React.useState(3)
    const visible = similar.slice(0, visibleCount)
    const hasMore = visibleCount < similar.length && similar.length > 3

    const tagColorMap: Record<string, { bg: string; text: string }> = {
        "Peak Season 2026 Availability": { bg: "#fdf2f8", text: "#be185d" },
        "Summer Holiday 2026 Availability": { bg: "#eff6ff", text: "#1d4ed8" },
        "Available in next 30 days": { bg: "#f0fdf4", text: "#15803d" },
    }

    return (
        <>
            <div
                style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "20px",
                    justifyContent: "space-between",
                }}
            >
                {visible.map((villa) => {
                    const priceLabel =
                        villa.price_gbp_min && villa.price_gbp_max
                            ? `${formatCurrency(villa.price_gbp_min)} – ${formatCurrency(villa.price_gbp_max)} / week`
                            : villa.price_gbp_min
                              ? `${formatCurrency(villa.price_gbp_min)} / week`
                              : "Price on request"

                    const visibleTags = (villa.availability_tags || []).filter(
                        shouldShowTag
                    )

                    return (
                        <div
                            key={villa.villa_id}
                            style={{
                                flex: isMobile
                                    ? "1 1 100%"
                                    : "1 1 calc(33% - 20px)",
                                minWidth: 0,
                                width: isMobile ? "100%" : undefined,
                                maxWidth: isMobile ? "100%" : "400px",
                                border: `1px solid ${BORDER}`,
                                borderRadius: "18px",
                                overflow: "hidden",
                                boxShadow: "0 6px 18px rgba(0,0,0,0.07)",
                                display: "flex",
                                flexDirection: "column",
                                background: "white",
                            }}
                        >
                            <img
                                src={getOptimizedImage(
                                    villa.main_photo,
                                    600,
                                    75
                                )}
                                alt={villa.name}
                                loading="lazy"
                                style={{
                                    width: "100%",
                                    height: "210px",
                                    objectFit: "cover",
                                }}
                            />
                            <div style={{ padding: "16px", flex: "1" }}>
                                <h3
                                    style={{
                                        fontSize: "18px",
                                        fontWeight: 700,
                                        marginBottom: "6px",
                                        color: ACCENT,
                                    }}
                                >
                                    {villa.name}
                                </h3>
                                <p
                                    style={{
                                        color: "#666",
                                        marginBottom: "4px",
                                    }}
                                >
                                    Sleeps {villa.capacity} • {villa.bedrooms}{" "}
                                    bedrooms
                                </p>

                                <p
                                    style={{
                                        fontWeight: 700,
                                        color: ACCENT,
                                        marginBottom: "10px",
                                        fontSize: "15px",
                                    }}
                                >
                                    {priceLabel}
                                </p>

                                <div style={{ marginBottom: "12px" }}>
                                    {visibleTags.map((tag) => {
                                        const colors = tagColorMap[tag] || {
                                            bg: "#eee",
                                            text: "#333",
                                        }
                                        return (
                                            <span
                                                key={tag}
                                                style={{
                                                    display: "inline-block",
                                                    background: colors.bg,
                                                    color: colors.text,
                                                    padding: "4px 8px",
                                                    marginRight: "6px",
                                                    marginBottom: "4px",
                                                    borderRadius: "999px",
                                                    fontSize: "12px",
                                                    fontWeight: 600,
                                                }}
                                            >
                                                {tag}
                                            </span>
                                        )
                                    })}
                                </div>

                                <a
                                    href={`/villa?id=${villa.villa_id}`}
                                    style={{
                                        display: "inline-block",
                                        padding: "10px 14px",
                                        background: ACCENT,
                                        color: "white",
                                        borderRadius: "8px",
                                        textDecoration: "none",
                                        fontWeight: 600,
                                    }}
                                >
                                    View details →
                                </a>
                            </div>
                        </div>
                    )
                })}
            </div>

            {hasMore && (
                <div style={{ textAlign: "center", marginTop: "24px" }}>
                    <button
                        onClick={() => setVisibleCount((c) => c + 3)}
                        style={{
                            background: "#153852",
                            color: "white",
                            border: "none",
                            borderRadius: "8px",
                            padding: "10px 16px",
                            fontSize: "15px",
                            fontWeight: 600,
                            cursor: "pointer",
                            boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
                        }}
                    >
                        See more similar properties ↓
                    </button>
                </div>
            )}
        </>
    )
}

function EnquiryModal({
    isOpen,
    onClose,
    villa,
    arrivalDate,
    departureDate,
    nights,
}: {
    isOpen: boolean
    onClose: () => void
    villa: Villa
    arrivalDate: string | null
    departureDate: string | null
    nights: number | null
}) {
    const [customerName, setCustomerName] = useState("")
    const [email, setEmail] = useState("")
    const [phone, setPhone] = useState("")
    const [message, setMessage] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [submitError, setSubmitError] = useState("")
    const [submitSuccess, setSubmitSuccess] = useState(false)

    useEffect(() => {
        if (!isOpen) return

        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose()
        }

        window.addEventListener("keydown", onKey)
        document.body.style.overflow = "hidden"

        return () => {
            window.removeEventListener("keydown", onKey)
            document.body.style.overflow = ""
        }
    }, [isOpen, onClose])

    useEffect(() => {
        if (!isOpen) return
        setSubmitError("")
        setSubmitSuccess(false)

        if (!message) {
            setMessage(
                arrivalDate && departureDate
                    ? `Hi, I’d like to ask a question about ${villa.name} for ${formatSingleDateLabel(arrivalDate)} to ${formatSingleDateLabel(departureDate)}.`
                    : `Hi, I’d like to ask a question about ${villa.name}.`
            )
        }
    }, [isOpen, villa.name, arrivalDate, departureDate])

    if (!isOpen) return null

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setSubmitError("")
        setSubmitSuccess(false)

        if (!customerName.trim()) {
            setSubmitError("Please enter your name.")
            return
        }

        if (!email.trim()) {
            setSubmitError("Please enter your email.")
            return
        }

        if (!message.trim()) {
            setSubmitError("Please enter your question.")
            return
        }

        try {
            setIsSubmitting(true)

            const payload = {
                customer_name: customerName.trim(),
                email: email.trim(),
                phone: phone.trim(),
                message: message.trim(),
                villa_id: villa.villa_id,
                villa_name: villa.name,
                villa_region: villa.sub_region
                    ? `${villa.sub_region}, ${villa.region}`
                    : villa.region,
                villa_url:
                    typeof window !== "undefined" ? window.location.href : "",
                arrival_date: arrivalDate || undefined,
                departure_date: departureDate || undefined,
                nights: nights || undefined,
                source: "Villa Page",
                page_url:
                    typeof window !== "undefined" ? window.location.href : "",
                referrer:
                    typeof document !== "undefined" ? document.referrer : "",
                user_agent:
                    typeof navigator !== "undefined" ? navigator.userAgent : "",
            }

            const res = await fetch(ENQUIRY_ENDPOINT, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            })

            const data = await res.json().catch(() => ({}))

            if (!res.ok) {
                throw new Error(data?.error || "Failed to send enquiry")
            }

            setSubmitSuccess(true)
            setCustomerName("")
            setEmail("")
            setPhone("")
            setMessage("")
        } catch (error: any) {
            setSubmitError(
                error?.message || "Something went wrong. Please try again."
            )
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div
            onClick={onClose}
            style={{
                position: "fixed",
                inset: 0,
                background: "rgba(15, 23, 42, 0.58)",
                zIndex: 10000,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "20px",
            }}
        >
            <div
                onClick={(e) => e.stopPropagation()}
                style={{
                    width: "100%",
                    maxWidth: "640px",
                    background: "white",
                    borderRadius: "24px",
                    overflow: "hidden",
                    boxShadow: "0 24px 80px rgba(0,0,0,0.18)",
                    maxHeight: "90vh",
                    overflowY: "auto",
                }}
            >
                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "22px 22px 16px",
                        borderBottom: `1px solid ${BORDER}`,
                    }}
                >
                    <div>
                        <h3
                            style={{
                                margin: 0,
                                fontSize: 24,
                                fontWeight: 800,
                                color: ACCENT,
                                lineHeight: 1.1,
                            }}
                        >
                            Ask us a question
                        </h3>
                        <p
                            style={{
                                margin: "8px 0 0 0",
                                color: TEXT_MUTED,
                                fontSize: 14,
                                lineHeight: 1.5,
                            }}
                        >
                            We can help with suitability, layout, location or
                            anything else before you book.
                        </p>
                    </div>

                    <button
                        onClick={onClose}
                        style={{
                            width: 42,
                            height: 42,
                            borderRadius: 999,
                            border: `1px solid ${BORDER}`,
                            background: "white",
                            color: ACCENT,
                            fontSize: 24,
                            cursor: "pointer",
                            flex: "0 0 auto",
                        }}
                    >
                        ×
                    </button>
                </div>

                <div style={{ padding: 22 }}>
                    <div
                        style={{
                            border: `1px solid ${BORDER}`,
                            borderRadius: 18,
                            padding: 16,
                            background: "#fafaf8",
                            marginBottom: 18,
                        }}
                    >
                        <div
                            style={{
                                fontSize: 12,
                                fontWeight: 800,
                                color: TEXT_MUTED,
                                textTransform: "uppercase",
                                letterSpacing: "0.04em",
                                marginBottom: 6,
                            }}
                        >
                            Property
                        </div>
                        <div
                            style={{
                                fontSize: 17,
                                fontWeight: 800,
                                color: ACCENT,
                                marginBottom: 4,
                            }}
                        >
                            {villa.name}
                        </div>
                        <div
                            style={{
                                fontSize: 14,
                                color: "#374151",
                                lineHeight: 1.5,
                            }}
                        >
                            {villa.sub_region
                                ? `${villa.sub_region}, ${villa.region}`
                                : villa.region}
                            {arrivalDate && departureDate
                                ? ` • ${formatSingleDateLabel(arrivalDate)} to ${formatSingleDateLabel(departureDate)}`
                                : ""}
                            {nights ? ` • ${nights} nights` : ""}
                        </div>
                    </div>

                    {submitSuccess ? (
                        <div
                            style={{
                                border: "1px solid #bbf7d0",
                                background: "#f0fdf4",
                                borderRadius: 18,
                                padding: 18,
                            }}
                        >
                            <div
                                style={{
                                    fontSize: 18,
                                    fontWeight: 800,
                                    color: "#166534",
                                    marginBottom: 6,
                                }}
                            >
                                Thanks — your enquiry has been sent
                            </div>
                            <p
                                style={{
                                    margin: 0,
                                    fontSize: 14,
                                    lineHeight: 1.55,
                                    color: "#166534",
                                }}
                            >
                                We’ve received your question and will come back
                                to you shortly.
                            </p>

                            <div style={{ marginTop: 16 }}>
                                <button
                                    onClick={onClose}
                                    style={{
                                        ...primaryCtaStyle,
                                        border: "none",
                                        cursor: "pointer",
                                    }}
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit}>
                            <div
                                style={{
                                    display: "grid",
                                    gridTemplateColumns: "1fr 1fr",
                                    gap: 12,
                                    marginBottom: 12,
                                }}
                            >
                                <div style={{ gridColumn: "1 / -1" }}>
                                    <label style={fieldLabelStyle}>
                                        Name *
                                    </label>
                                    <input
                                        value={customerName}
                                        onChange={(e) =>
                                            setCustomerName(e.target.value)
                                        }
                                        placeholder="Your name"
                                        style={inputStyle}
                                    />
                                </div>

                                <div>
                                    <label style={fieldLabelStyle}>
                                        Email *
                                    </label>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) =>
                                            setEmail(e.target.value)
                                        }
                                        placeholder="you@example.com"
                                        style={inputStyle}
                                    />
                                </div>

                                <div>
                                    <label style={fieldLabelStyle}>
                                        Phone (optional)
                                    </label>
                                    <input
                                        value={phone}
                                        onChange={(e) =>
                                            setPhone(e.target.value)
                                        }
                                        placeholder="Phone number"
                                        style={inputStyle}
                                    />
                                </div>

                                <div style={{ gridColumn: "1 / -1" }}>
                                    <label style={fieldLabelStyle}>
                                        Your question *
                                    </label>
                                    <textarea
                                        value={message}
                                        onChange={(e) =>
                                            setMessage(e.target.value)
                                        }
                                        placeholder="Tell us what you'd like to know"
                                        style={{
                                            ...inputStyle,
                                            minHeight: 140,
                                            resize: "vertical",
                                            paddingTop: 14,
                                        }}
                                    />
                                </div>
                            </div>

                            {submitError ? (
                                <div
                                    style={{
                                        marginBottom: 14,
                                        borderRadius: 14,
                                        background: "#fef2f2",
                                        border: "1px solid #fecaca",
                                        padding: "12px 14px",
                                        color: "#b91c1c",
                                        fontSize: 14,
                                        lineHeight: 1.45,
                                        fontWeight: 600,
                                    }}
                                >
                                    {submitError}
                                </div>
                            ) : null}

                            <div
                                style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    gap: 12,
                                    flexWrap: "wrap",
                                }}
                            >
                                <p
                                    style={{
                                        margin: 0,
                                        fontSize: 12,
                                        lineHeight: 1.5,
                                        color: TEXT_MUTED,
                                        maxWidth: 330,
                                    }}
                                >
                                    Send us your question and we’ll help before
                                    you request your booking with French Maison.
                                </p>

                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    style={{
                                        ...primaryCtaStyle,
                                        border: "none",
                                        cursor: isSubmitting
                                            ? "not-allowed"
                                            : "pointer",
                                        opacity: isSubmitting ? 0.65 : 1,
                                        minWidth: 170,
                                    }}
                                >
                                    {isSubmitting
                                        ? "Sending..."
                                        : "Send enquiry"}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    )
}

function BookingRequestModal({
    isOpen,
    onClose,
    villa,
    arrivalDate,
    departureDate,
    nights,
    indicativePrice,
}: {
    isOpen: boolean
    onClose: () => void
    villa: Villa
    arrivalDate: string | null
    departureDate: string | null
    nights: number | null
    indicativePrice: number | null
}) {
    const [customerName, setCustomerName] = useState("")
    const [email, setEmail] = useState("")
    const [phone, setPhone] = useState("")
    const [adultCount, setAdultCount] = useState("2")
    const [childrenCount, setChildrenCount] = useState("0")
    const [childAges, setChildAges] = useState("")
    const [specialRequests, setSpecialRequests] = useState("")
    const [submitError, setSubmitError] = useState("")
    const [submitSuccess, setSubmitSuccess] = useState(false)
    const [bookingReference, setBookingReference] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)

    useEffect(() => {
        if (!isOpen) return

        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose()
        }

        window.addEventListener("keydown", onKey)
        document.body.style.overflow = "hidden"

        return () => {
            window.removeEventListener("keydown", onKey)
            document.body.style.overflow = ""
        }
    }, [isOpen, onClose])

    useEffect(() => {
        if (!isOpen) return
        setSubmitError("")
        setSubmitSuccess(false)
        setBookingReference("")
    }, [isOpen])

    if (!isOpen) return null

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setSubmitError("")
        setSubmitSuccess(false)

        if (!arrivalDate || !departureDate) {
            setSubmitError("Please select arrival and departure dates first.")
            return
        }

        if (!customerName.trim()) {
            setSubmitError("Please enter your name.")
            return
        }

        if (!email.trim()) {
            setSubmitError("Please enter your email.")
            return
        }

        if (!phone.trim()) {
            setSubmitError("Please enter your phone number.")
            return
        }

        const adults = Number(adultCount || 0)
        const children = Number(childrenCount || 0)
        const selectedRentalPrice =
            indicativePrice != null ? Math.round(indicativePrice) : undefined

        if (adults <= 0) {
            setSubmitError("Please add at least one adult.")
            return
        }

        try {
            setIsSubmitting(true)

            const payload = {
                customer_name: customerName.trim(),
                email: email.trim(),
                phone: phone.trim(),
                villa_id: villa.villa_id,
                villa_name: villa.name,
                villa_region: villa.sub_region
                    ? `${villa.sub_region}, ${villa.region}`
                    : villa.region,
                villa_url:
                    typeof window !== "undefined" ? window.location.href : "",
                arrival_date: arrivalDate,
                departure_date: departureDate,
                nights: nights || undefined,
                villa_rental_price: selectedRentalPrice,
                price_gbp: selectedRentalPrice,
                indicative_price_gbp: selectedRentalPrice,
                adult_count: adults,
                children_count: children || undefined,
                child_ages: childAges.trim(),
                guest_count: adults + children,
                special_requests: specialRequests.trim(),
                source: "Villa Page",
                page_url:
                    typeof window !== "undefined" ? window.location.href : "",
                referrer:
                    typeof document !== "undefined" ? document.referrer : "",
                user_agent:
                    typeof navigator !== "undefined" ? navigator.userAgent : "",
                website: "",
            }

            const res = await fetch(BOOKING_REQUEST_ENDPOINT, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            })

            const data = await res.json().catch(() => ({}))

            if (!res.ok) {
                throw new Error(
                    data?.error || "Failed to submit booking request"
                )
            }

            setSubmitSuccess(true)
            setBookingReference(data?.booking_reference || "")
            setCustomerName("")
            setEmail("")
            setPhone("")
            setAdultCount("2")
            setChildrenCount("0")
            setChildAges("")
            setSpecialRequests("")
        } catch (error: any) {
            setSubmitError(
                error?.message || "Something went wrong. Please try again."
            )
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div
            onClick={onClose}
            style={{
                position: "fixed",
                inset: 0,
                background: "rgba(15, 23, 42, 0.58)",
                zIndex: 10000,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "20px",
            }}
        >
            <div
                onClick={(e) => e.stopPropagation()}
                style={{
                    width: "100%",
                    maxWidth: "700px",
                    background: "white",
                    borderRadius: "24px",
                    overflow: "hidden",
                    boxShadow: "0 24px 80px rgba(0,0,0,0.18)",
                    maxHeight: "90vh",
                    overflowY: "auto",
                }}
            >
                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "22px 22px 16px",
                        borderBottom: `1px solid ${BORDER}`,
                    }}
                >
                    <div>
                        <h3
                            style={{
                                margin: 0,
                                fontSize: 24,
                                fontWeight: 800,
                                color: ACCENT,
                                lineHeight: 1.1,
                            }}
                        >
                            Request to book with French Maison
                        </h3>
                        <p
                            style={{
                                margin: "8px 0 0 0",
                                color: TEXT_MUTED,
                                fontSize: 14,
                                lineHeight: 1.5,
                            }}
                        >
                            We’ll confirm availability and guide you through the
                            next steps to secure your stay.
                        </p>
                    </div>

                    <button
                        onClick={onClose}
                        style={{
                            width: 42,
                            height: 42,
                            borderRadius: 999,
                            border: `1px solid ${BORDER}`,
                            background: "white",
                            color: ACCENT,
                            fontSize: 24,
                            cursor: "pointer",
                            flex: "0 0 auto",
                        }}
                    >
                        ×
                    </button>
                </div>

                <div style={{ padding: 22 }}>
                    <div
                        style={{
                            border: `1px solid ${BORDER}`,
                            borderRadius: 18,
                            padding: 16,
                            background: "#fafaf8",
                            marginBottom: 18,
                        }}
                    >
                        <div
                            style={{
                                fontSize: 12,
                                fontWeight: 800,
                                color: TEXT_MUTED,
                                textTransform: "uppercase",
                                letterSpacing: "0.04em",
                                marginBottom: 6,
                            }}
                        >
                            Booking summary
                        </div>
                        <div
                            style={{
                                fontSize: 17,
                                fontWeight: 800,
                                color: ACCENT,
                                marginBottom: 4,
                            }}
                        >
                            {villa.name}
                        </div>
                        <div
                            style={{
                                fontSize: 14,
                                color: "#374151",
                                lineHeight: 1.5,
                            }}
                        >
                            {villa.sub_region
                                ? `${villa.sub_region}, ${villa.region}`
                                : villa.region}
                            {arrivalDate && departureDate
                                ? ` • ${formatSingleDateLabel(arrivalDate)} to ${formatSingleDateLabel(departureDate)}`
                                : " • Please select dates on the calendar first"}
                            {nights ? ` • ${nights} nights` : ""}
                        </div>
                        {indicativePrice != null && (
                            <div
                                style={{
                                    marginTop: 10,
                                    fontSize: 14,
                                    fontWeight: 700,
                                    color: GREEN,
                                }}
                            >
                                Indicative price: £
                                {Math.round(indicativePrice).toLocaleString()}
                            </div>
                        )}
                    </div>

                    {submitSuccess ? (
                        <div
                            style={{
                                border: "1px solid #bbf7d0",
                                background: "#f0fdf4",
                                borderRadius: 18,
                                padding: 18,
                            }}
                        >
                            <div
                                style={{
                                    fontSize: 18,
                                    fontWeight: 800,
                                    color: "#166534",
                                    marginBottom: 6,
                                }}
                            >
                                Thanks — your booking request has been sent
                            </div>
                            <p
                                style={{
                                    margin: 0,
                                    fontSize: 14,
                                    lineHeight: 1.55,
                                    color: "#166534",
                                }}
                            >
                                We’ve received your request and will confirm
                                availability as soon as possible.
                                {bookingReference
                                    ? ` Your booking reference is ${bookingReference}.`
                                    : ""}
                            </p>

                            <div style={{ marginTop: 16 }}>
                                <button
                                    onClick={onClose}
                                    style={{
                                        ...primaryCtaStyle,
                                        border: "none",
                                        cursor: "pointer",
                                    }}
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit}>
                            <div
                                style={{
                                    display: "grid",
                                    gridTemplateColumns: "1fr 1fr",
                                    gap: 12,
                                    marginBottom: 12,
                                }}
                            >
                                <div style={{ gridColumn: "1 / -1" }}>
                                    <label style={fieldLabelStyle}>
                                        Full name *
                                    </label>
                                    <input
                                        value={customerName}
                                        onChange={(e) =>
                                            setCustomerName(e.target.value)
                                        }
                                        placeholder="Your full name"
                                        style={inputStyle}
                                    />
                                </div>

                                <div>
                                    <label style={fieldLabelStyle}>
                                        Email *
                                    </label>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) =>
                                            setEmail(e.target.value)
                                        }
                                        placeholder="you@example.com"
                                        style={inputStyle}
                                    />
                                </div>

                                <div>
                                    <label style={fieldLabelStyle}>
                                        Phone *
                                    </label>
                                    <input
                                        value={phone}
                                        onChange={(e) =>
                                            setPhone(e.target.value)
                                        }
                                        placeholder="Phone number"
                                        style={inputStyle}
                                    />
                                </div>

                                <div>
                                    <label style={fieldLabelStyle}>
                                        Adults *
                                    </label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={adultCount}
                                        onChange={(e) =>
                                            setAdultCount(e.target.value)
                                        }
                                        style={inputStyle}
                                    />
                                </div>

                                <div>
                                    <label style={fieldLabelStyle}>
                                        Children
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={childrenCount}
                                        onChange={(e) =>
                                            setChildrenCount(e.target.value)
                                        }
                                        style={inputStyle}
                                    />
                                </div>

                                {Number(childrenCount || 0) > 0 && (
                                    <div style={{ gridColumn: "1 / -1" }}>
                                        <label style={fieldLabelStyle}>
                                            Child ages
                                        </label>
                                        <input
                                            value={childAges}
                                            onChange={(e) =>
                                                setChildAges(e.target.value)
                                            }
                                            placeholder="For example: 4, 7"
                                            style={inputStyle}
                                        />
                                    </div>
                                )}

                                <div style={{ gridColumn: "1 / -1" }}>
                                    <label style={fieldLabelStyle}>
                                        Special requests
                                    </label>
                                    <textarea
                                        value={specialRequests}
                                        onChange={(e) =>
                                            setSpecialRequests(e.target.value)
                                        }
                                        placeholder="Tell us anything helpful about your trip or requirements"
                                        style={{
                                            ...inputStyle,
                                            minHeight: 130,
                                            resize: "vertical",
                                            paddingTop: 14,
                                        }}
                                    />
                                </div>
                            </div>

                            {submitError ? (
                                <div
                                    style={{
                                        marginBottom: 14,
                                        borderRadius: 14,
                                        background: "#fef2f2",
                                        border: "1px solid #fecaca",
                                        padding: "12px 14px",
                                        color: "#b91c1c",
                                        fontSize: 14,
                                        lineHeight: 1.45,
                                        fontWeight: 600,
                                    }}
                                >
                                    {submitError}
                                </div>
                            ) : null}

                            <div
                                style={{
                                    marginBottom: 14,
                                    borderRadius: 14,
                                    background: "#f8fbff",
                                    border: "1px solid #dbeafe",
                                    padding: "12px 14px",
                                    color: ACCENT,
                                    fontSize: 13,
                                    lineHeight: 1.5,
                                    fontWeight: 600,
                                }}
                            >
                                No payment is taken at this stage. We’ll confirm
                                availability before your booking is secured.
                            </div>

                            <div
                                style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    gap: 12,
                                    flexWrap: "wrap",
                                }}
                            >
                                <p
                                    style={{
                                        margin: 0,
                                        fontSize: 12,
                                        lineHeight: 1.5,
                                        color: TEXT_MUTED,
                                        maxWidth: 330,
                                    }}
                                >
                                    Your request goes directly to French Maison.
                                    We’ll confirm availability, guide you
                                    through the booking and follow up with the
                                    next step.
                                </p>

                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    style={{
                                        ...primaryCtaStyle,
                                        border: "none",
                                        cursor: isSubmitting
                                            ? "not-allowed"
                                            : "pointer",
                                        opacity: isSubmitting ? 0.65 : 1,
                                        minWidth: 220,
                                    }}
                                >
                                    {isSubmitting
                                        ? "Sending..."
                                        : "Send booking request"}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    )
}

function SavedVillasModal({
    isOpen,
    onClose,
    savedVillas,
    currentVillaId,
    onRemove,
}: {
    isOpen: boolean
    onClose: () => void
    savedVillas: SavedVilla[]
    currentVillaId?: number | null
    onRemove: (villaId: number) => void
}) {
    useEffect(() => {
        if (!isOpen) return

        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose()
        }

        window.addEventListener("keydown", onKey)
        document.body.style.overflow = "hidden"

        return () => {
            window.removeEventListener("keydown", onKey)
            document.body.style.overflow = ""
        }
    }, [isOpen, onClose])

    if (!isOpen) return null

    return (
        <div
            onClick={onClose}
            style={{
                position: "fixed",
                inset: 0,
                background: "rgba(15, 23, 42, 0.58)",
                zIndex: 10000,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "20px",
            }}
        >
            <div
                onClick={(e) => e.stopPropagation()}
                style={{
                    width: "100%",
                    maxWidth: "760px",
                    background: "white",
                    borderRadius: "24px",
                    overflow: "hidden",
                    boxShadow: "0 24px 80px rgba(0,0,0,0.18)",
                    maxHeight: "90vh",
                    overflowY: "auto",
                }}
            >
                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "22px 22px 16px",
                        borderBottom: `1px solid ${BORDER}`,
                    }}
                >
                    <div>
                        <h3
                            style={{
                                margin: 0,
                                fontSize: 24,
                                fontWeight: 800,
                                color: ACCENT,
                                lineHeight: 1.1,
                            }}
                        >
                            Saved villas
                        </h3>
                        <p
                            style={{
                                margin: "8px 0 0 0",
                                color: TEXT_MUTED,
                                fontSize: 14,
                                lineHeight: 1.5,
                            }}
                        >
                            Your saved villas are stored on this device so you
                            can come back to them later without logging in.
                        </p>
                    </div>

                    <button
                        onClick={onClose}
                        style={{
                            width: 42,
                            height: 42,
                            borderRadius: 999,
                            border: `1px solid ${BORDER}`,
                            background: "white",
                            color: ACCENT,
                            fontSize: 24,
                            cursor: "pointer",
                            flex: "0 0 auto",
                        }}
                    >
                        ×
                    </button>
                </div>

                <div style={{ padding: 22 }}>
                    {savedVillas.length === 0 ? (
                        <div
                            style={{
                                border: `1px solid ${BORDER}`,
                                borderRadius: 18,
                                padding: 18,
                                background: "#fafaf8",
                                color: TEXT_MUTED,
                                fontSize: 14,
                                lineHeight: 1.6,
                            }}
                        >
                            You haven't saved any villas yet. Use the “Save
                            villa” button on a property page to keep it here.
                        </div>
                    ) : (
                        <div
                            style={{
                                display: "grid",
                                gap: 14,
                            }}
                        >
                            {savedVillas.map((saved) => {
                                const priceText =
                                    saved.price_gbp_min && saved.price_gbp_max
                                        ? `${formatCurrency(saved.price_gbp_min)} – ${formatCurrency(saved.price_gbp_max)} / week`
                                        : saved.price_gbp_min
                                          ? `${formatCurrency(saved.price_gbp_min)} / week`
                                          : "Price on request"

                                const isCurrent =
                                    currentVillaId != null &&
                                    saved.villa_id === currentVillaId

                                return (
                                    <div
                                        key={saved.villa_id}
                                        style={{
                                            display: "grid",
                                            gridTemplateColumns:
                                                "110px minmax(0, 1fr)",
                                            gap: 14,
                                            border: `1px solid ${BORDER}`,
                                            borderRadius: 18,
                                            overflow: "hidden",
                                            background: "#fff",
                                        }}
                                    >
                                        <div
                                            style={{
                                                background:
                                                    "linear-gradient(180deg, #eef4f8 0%, #e6ecef 100%)",
                                                minHeight: 110,
                                            }}
                                        >
                                            {saved.main_photo ? (
                                                <img
                                                    src={getOptimizedImage(
                                                        saved.main_photo,
                                                        300,
                                                        80
                                                    )}
                                                    alt={saved.name}
                                                    style={{
                                                        width: "100%",
                                                        height: "100%",
                                                        objectFit: "cover",
                                                        display: "block",
                                                    }}
                                                />
                                            ) : null}
                                        </div>

                                        <div
                                            style={{
                                                padding: "14px 16px 14px 0",
                                                minWidth: 0,
                                            }}
                                        >
                                            <div
                                                style={{
                                                    display: "flex",
                                                    justifyContent:
                                                        "space-between",
                                                    alignItems: "flex-start",
                                                    gap: 12,
                                                    marginBottom: 8,
                                                }}
                                            >
                                                <div style={{ minWidth: 0 }}>
                                                    <div
                                                        style={{
                                                            fontSize: 18,
                                                            lineHeight: 1.25,
                                                            fontWeight: 800,
                                                            color: ACCENT,
                                                            marginBottom: 4,
                                                        }}
                                                    >
                                                        {saved.name}
                                                    </div>
                                                    <div
                                                        style={{
                                                            fontSize: 13,
                                                            color: TEXT_MUTED,
                                                            lineHeight: 1.5,
                                                        }}
                                                    >
                                                        {saved.region_label}
                                                        {isCurrent
                                                            ? " • Viewing now"
                                                            : ""}
                                                    </div>
                                                </div>

                                                <button
                                                    onClick={() =>
                                                        onRemove(saved.villa_id)
                                                    }
                                                    style={{
                                                        border: "none",
                                                        background: "none",
                                                        color: TEXT_MUTED,
                                                        fontSize: 13,
                                                        fontWeight: 700,
                                                        cursor: "pointer",
                                                        padding: 0,
                                                        whiteSpace: "nowrap",
                                                    }}
                                                >
                                                    Remove
                                                </button>
                                            </div>

                                            <div
                                                style={{
                                                    fontSize: 14,
                                                    lineHeight: 1.5,
                                                    color: "#374151",
                                                    fontWeight: 600,
                                                    marginBottom: 12,
                                                }}
                                            >
                                                {priceText}
                                            </div>

                                            <div
                                                style={{
                                                    display: "flex",
                                                    gap: 10,
                                                    flexWrap: "wrap",
                                                }}
                                            >
                                                <a
                                                    href={saved.url}
                                                    style={{
                                                        ...primaryCtaStyle,
                                                        textDecoration: "none",
                                                        border: "none",
                                                    }}
                                                >
                                                    View villa
                                                </a>
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default function VillaDetailDynamic({ fallbackVillaId = 457 }: Props) {
    const [containerRef, isMobile] = useContainerIsMobile<HTMLDivElement>(900)
    const [villa, setVilla] = useState<Villa | null>(null)
    const [similar, setSimilar] = useState<Villa[]>([])
    const [photoIndex, setPhotoIndex] = useState(0)
    const [lightboxOpen, setLightboxOpen] = useState(false)
    const [touchStartX, setTouchStartX] = useState<number | null>(null)
    const [touchEndX, setTouchEndX] = useState<number | null>(null)
    const [showFullAbout, setShowFullAbout] = useState(false)
    const [enquiryOpen, setEnquiryOpen] = useState(false)
    const [bookingRequestOpen, setBookingRequestOpen] = useState(false)
    const [savedVillas, setSavedVillasState] = useState<SavedVilla[]>([])
    const [savedVillasOpen, setSavedVillasOpen] = useState(false)

    const [liveData, setLiveData] = useState<LiveVillaData | null>(null)
    const [calendarMonth, setCalendarMonth] = useState<Date>(new Date())
    const [selectedStartDate, setSelectedStartDate] = useState<string | null>(
        null
    )
    const [selectedEndDate, setSelectedEndDate] = useState<string | null>(null)
    const [calendarHint, setCalendarHint] = useState<string | null>(null)

    const getVillaIdFromURL = (): number | null => {
        if (typeof window === "undefined") return null
        const params = new URLSearchParams(window.location.search)
        const idParam = params.get("id")
        if (idParam) return parseInt(idParam)
        return null
    }

    const villaId = getVillaIdFromURL() || fallbackVillaId

    useEffect(() => {
        if (!villaId) return

        fetch(`${API_BASE}/villas`)
            .then((res) => res.json())
            .then((data: Villa[]) => {
                const sanitizedData = sanitiseVillaContent(data)
                const match = sanitizedData.find((v) => v.villa_id === villaId)
                setVilla(match || null)

                if (match) {
                    const currentTags = new Set(match.availability_tags || [])
                    const targetMin = match.price_gbp_min || 0
                    const targetCapacity = match.capacity || 0
                    const currentRegion = match.region
                    const currentSubRegion = match.sub_region

                    const filterSimilar = (
                        villas: Villa[],
                        priceLow: number,
                        priceHigh: number,
                        capLow: number,
                        capHigh: number
                    ) => {
                        return villas
                            .filter((v) => {
                                if (v.villa_id === match.villa_id) return false
                                if (!v.main_photo) return false

                                const regionMatch =
                                    (currentSubRegion &&
                                        v.sub_region === currentSubRegion) ||
                                    (!currentSubRegion &&
                                        v.region === currentRegion)

                                if (!regionMatch) return false

                                const price =
                                    v.price_gbp_min && v.price_gbp_min > 0
                                        ? v.price_gbp_min
                                        : 0

                                const priceMatch =
                                    !targetMin ||
                                    (price >= priceLow && price <= priceHigh)

                                const capacityMatch =
                                    !targetCapacity ||
                                    (v.capacity >= capLow &&
                                        v.capacity <= capHigh)

                                const hasOverlap =
                                    v.availability_tags?.some((tag) =>
                                        currentTags.has(tag)
                                    ) ?? false

                                return priceMatch && capacityMatch && hasOverlap
                            })
                            .sort((a, b) => {
                                const diffA = Math.abs(
                                    (a.price_gbp_min || 0) -
                                        (match.price_gbp_min || 0)
                                )
                                const diffB = Math.abs(
                                    (b.price_gbp_min || 0) -
                                        (match.price_gbp_min || 0)
                                )
                                return diffA - diffB
                            })
                    }

                    let similarVillas = filterSimilar(
                        sanitizedData,
                        targetMin * 0.75,
                        targetMin * 1.25,
                        targetCapacity - 2,
                        targetCapacity + 2
                    )

                    if (similarVillas.length < 6) {
                        similarVillas = filterSimilar(
                            sanitizedData,
                            targetMin * 0.6,
                            targetMin * 1.4,
                            targetCapacity - 3,
                            targetCapacity + 3
                        )
                    }

                    if (similarVillas.length < 6 && currentSubRegion) {
                        similarVillas = sanitizedData.filter(
                            (v) =>
                                v.villa_id !== match.villa_id &&
                                v.region === currentRegion &&
                                Boolean(v.main_photo)
                        )
                    }

                    setSimilar(similarVillas.slice(0, 12))
                }
            })
            .catch((err) => {
                console.error("Error loading villa:", err)
                setVilla(null)
            })
    }, [villaId])

    useEffect(() => {
        if (!villaId) return

        fetch(`${API_BASE}/villa/${villaId}/live`)
            .then((res) => res.json())
            .then((data: LiveVillaData) => {
                setLiveData(data)
                setCalendarMonth(
                    getInitialCalendarMonth(data.availability || [])
                )
                setSelectedStartDate(null)
                setSelectedEndDate(null)
                setCalendarHint(null)
            })
            .catch((err) => {
                console.error("Error loading live villa data:", err)
                setLiveData(null)
            })
    }, [villaId])

    useEffect(() => {
        setSavedVillasState(getSavedVillas())

        const handleStorage = () => {
            setSavedVillasState(getSavedVillas())
        }

        window.addEventListener("storage", handleStorage)
        return () => window.removeEventListener("storage", handleStorage)
    }, [])

    const photos = useMemo(() => {
        if (!villa) return []
        const list = villa.photos ? [...villa.photos] : []
        if (villa.main_photo && !list.includes(villa.main_photo)) {
            list.unshift(villa.main_photo)
        }
        return list
    }, [villa])

    const displayTags = useMemo(() => {
        return (villa?.availability_tags || []).filter(shouldShowTag)
    }, [villa])

    const isCurrentVillaSaved = useMemo(() => {
        if (!villa) return false
        return savedVillas.some((saved) => saved.villa_id === villa.villa_id)
    }, [savedVillas, villa])

    const saveCurrentVilla = () => {
        if (!villa || typeof window === "undefined") return

        const nextSavedVillas = getSavedVillas()
        const exists = nextSavedVillas.some(
            (saved) => saved.villa_id === villa.villa_id
        )

        if (exists) {
            const filtered = nextSavedVillas.filter(
                (saved) => saved.villa_id !== villa.villa_id
            )
            persistSavedVillas(filtered)
            return
        }

        const savedVilla: SavedVilla = {
            villa_id: villa.villa_id,
            name: villa.name,
            region_label: villa.sub_region
                ? `${villa.sub_region}, ${villa.region}`
                : villa.region,
            main_photo: villa.main_photo,
            price_gbp_min: villa.price_gbp_min,
            price_gbp_max: villa.price_gbp_max,
            url: window.location.href,
        }

        persistSavedVillas([savedVilla, ...nextSavedVillas])
    }

    const persistSavedVillas = (nextSavedVillas: SavedVilla[]) => {
        setSavedVillasState(nextSavedVillas)
        writeSavedVillas(nextSavedVillas)
    }

    const removeSavedVilla = (savedVillaId: number) => {
        const filtered = savedVillas.filter(
            (saved) => saved.villa_id !== savedVillaId
        )
        persistSavedVillas(filtered)
    }

    useEffect(() => {
        const preloadSequentially = async () => {
            for (const url of photos.slice(0, 12)) {
                const img = new Image()
                img.src = getOptimizedImage(url, 1600, 80)
                await new Promise((r) => setTimeout(r, 160))
            }
        }
        if (photos.length) preloadSequentially()
    }, [photos])

    const handleTouchStart = (e: React.TouchEvent) =>
        setTouchStartX(e.touches[0].clientX)

    const handleTouchMove = (e: React.TouchEvent) =>
        setTouchEndX(e.touches[0].clientX)

    const handleTouchEnd = () => {
        if (touchStartX === null || touchEndX === null || photos.length <= 1)
            return
        const diff = touchStartX - touchEndX
        if (diff > 50) {
            setPhotoIndex((prev) => (prev + 1) % photos.length)
        } else if (diff < -50) {
            setPhotoIndex((prev) => (prev === 0 ? photos.length - 1 : prev - 1))
        }

        setTouchStartX(null)
        setTouchEndX(null)
    }

    const availabilityBlocks = liveData?.availability || []
    const rates = liveData?.rates || []
    const calendarDays = useMemo(
        () => buildCalendarDays(calendarMonth),
        [calendarMonth]
    )

    const selectedPrice = useMemo(() => {
        if (!selectedStartDate || !selectedEndDate) return null
        return calculateIndicativePriceForStay(
            rates,
            selectedStartDate,
            selectedEndDate,
            availabilityBlocks
        )
    }, [selectedStartDate, selectedEndDate, rates, availabilityBlocks])

    if (!villa) return null

    const priceLabel =
        villa.price_gbp_min && villa.price_gbp_max
            ? `${formatCurrency(villa.price_gbp_min)} – ${formatCurrency(villa.price_gbp_max)} / week`
            : villa.price_gbp_min
              ? `${formatCurrency(villa.price_gbp_min)} / week`
              : "Price on request"

    const selectedNights =
        selectedStartDate && selectedEndDate
            ? nightsBetween(selectedStartDate, selectedEndDate)
            : 0

    const monthTitle = calendarMonth.toLocaleDateString("en-GB", {
        month: "long",
        year: "numeric",
    })
    const monthHasPassiveCheckMarkers = calendarDays.some((day) => {
        const key = dateKey(day)
        return (
            isPassiveArrivalBoundary(key, availabilityBlocks, rates) ||
            isPassiveDepartureBoundary(key, availabilityBlocks, rates)
        )
    })

    const tagColorMap: Record<string, { bg: string; text: string }> = {
        "Peak Season 2026 Availability": { bg: "#fdf2f8", text: "#be185d" },
        "Summer Holiday 2026 Availability": { bg: "#eff6ff", text: "#1d4ed8" },
        "Available in next 30 days": { bg: "#f0fdf4", text: "#15803d" },
    }

    const aboutPreview = clampText(villa.description || "", 420)

    const summaryStats = [
        statItem("Sleeps", String(villa.capacity), "👥"),
        statItem("Bedrooms", String(villa.bedrooms), "🛏️"),
        statItem("Bathrooms", String(villa.bathrooms), "🚿"),
        villa.dwelling_type
            ? statItem("Property type", villa.dwelling_type, "🏡")
            : null,
        villa.minimum_stay_nights
            ? statItem(
                  "Minimum stay",
                  `${villa.minimum_stay_nights} nights`,
                  "📅"
              )
            : null,
    ].filter(Boolean) as { label: string; value: string; icon?: string }[]

    function showCalendarHint(message: string) {
        setCalendarHint(message)

        if ((showCalendarHint as any)._timer) {
            window.clearTimeout((showCalendarHint as any)._timer)
        }

        ;(showCalendarHint as any)._timer = window.setTimeout(() => {
            setCalendarHint(null)
        }, 1800)
    }

    function handleDayClick(dateStr: string) {
        if (!selectedStartDate || selectedEndDate) {
            if (!isArrivalDateSelectable(dateStr, availabilityBlocks, rates)) {
                showCalendarHint("Not available for check-in")
                return
            }

            setSelectedStartDate(dateStr)
            setSelectedEndDate(null)
            setCalendarHint(null)
            return
        }

        if (dateStr <= selectedStartDate) {
            if (!isArrivalDateSelectable(dateStr, availabilityBlocks, rates)) {
                showCalendarHint("Not available for check-in")
                return
            }

            setSelectedStartDate(dateStr)
            setSelectedEndDate(null)
            setCalendarHint(null)
            return
        }

        if (
            isDepartureDateSelectable(
                selectedStartDate,
                dateStr,
                availabilityBlocks,
                rates
            )
        ) {
            setSelectedEndDate(dateStr)
            setCalendarHint(null)
        } else {
            const validation = isValidStayRange(
                selectedStartDate,
                dateStr,
                availabilityBlocks,
                rates
            )
            showCalendarHint(
                validation.error || "Those dates are not available"
            )
        }
    }

    function clearDates() {
        setSelectedStartDate(null)
        setSelectedEndDate(null)
        setCalendarHint(null)
    }

    function goPrevPhoto() {
        if (photos.length <= 1) return
        setPhotoIndex((prev) => (prev === 0 ? photos.length - 1 : prev - 1))
    }

    function goNextPhoto() {
        if (photos.length <= 1) return
        setPhotoIndex((prev) => (prev + 1) % photos.length)
    }

    const bookingWidget = (
        <div
            style={{
                position: isMobile ? "relative" : "sticky",
                top: isMobile ? "auto" : "24px",
                width: "100%",
                maxWidth: isMobile ? "100%" : "340px",
                marginLeft: isMobile ? 0 : "auto",
                background: CARD_BG,
                border: `1px solid ${BORDER}`,
                borderRadius: "20px",
                boxShadow: "0 10px 28px rgba(0,0,0,0.06)",
                overflow: "hidden",
                boxSizing: "border-box",
                minWidth: 0,
            }}
        >
            <div
                style={{
                    height: "8px",
                    background:
                        "linear-gradient(90deg, #0e84c9 0%, #17a6f5 100%)",
                }}
            />

            <div style={{ padding: isMobile ? "16px" : "18px 18px 16px" }}>
                <h3
                    style={{
                        fontSize: "15px",
                        fontWeight: 800,
                        color: ACCENT,
                        margin: "0 0 12px 0",
                        letterSpacing: "-0.01em",
                    }}
                >
                    Check pricing & availability
                </h3>

                <div
                    style={{
                        fontSize: "12px",
                        lineHeight: 1.45,
                        color: TEXT_MUTED,
                        marginBottom: "12px",
                    }}
                >
                    {villa.minimum_stay_nights
                        ? `Minimum stay ${villa.minimum_stay_nights} nights`
                        : "Select dates to check pricing"}
                    {villa.short_break_allowed
                        ? " • Short stays available"
                        : ""}
                </div>

                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        marginBottom: "10px",
                    }}
                >
                    <button
                        onClick={() =>
                            setCalendarMonth((m) => addMonths(m, -1))
                        }
                        style={navBtn}
                    >
                        ‹
                    </button>

                    <div
                        style={{
                            fontSize: "15px",
                            fontWeight: 700,
                            color: "#1f2937",
                        }}
                    >
                        {monthTitle}
                    </div>

                    <button
                        onClick={() => setCalendarMonth((m) => addMonths(m, 1))}
                        style={navBtn}
                    >
                        ›
                    </button>
                </div>

                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(7, 1fr)",
                        gap: "3px",
                        marginBottom: "6px",
                    }}
                >
                    {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(
                        (d) => (
                            <div
                                key={d}
                                style={{
                                    textAlign: "center",
                                    fontWeight: 500,
                                    fontSize: "11px",
                                    color: "#4b5563",
                                    paddingBottom: "2px",
                                }}
                            >
                                {d}
                            </div>
                        )
                    )}
                </div>

                {calendarHint && (
                    <div
                        style={{
                            position: "relative",
                            marginBottom: "10px",
                            display: "flex",
                            justifyContent: "center",
                            zIndex: 2,
                        }}
                    >
                        <div
                            style={{
                                background: "rgba(31, 41, 55, 0.94)",
                                color: "white",
                                fontSize: "13px",
                                fontWeight: 600,
                                padding: "10px 14px",
                                borderRadius: "10px",
                                lineHeight: 1.3,
                                boxShadow: "0 8px 20px rgba(0,0,0,0.18)",
                                position: "relative",
                                textAlign: "center",
                                maxWidth: "240px",
                            }}
                        >
                            {calendarHint}
                        </div>
                    </div>
                )}

                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(7, 1fr)",
                        gap: "3px",
                        marginBottom: "14px",
                    }}
                >
                    {calendarDays.map((day) => {
                        const key = dateKey(day)
                        const inCurrentMonth =
                            day.getMonth() === calendarMonth.getMonth()
                        const showPassiveBoundaries =
                            !selectedStartDate && !selectedEndDate
                        const isBookableNight = isDateBookableNight(
                            key,
                            availabilityBlocks
                        )

                        const arrivalSelectable = isArrivalDateSelectable(
                            key,
                            availabilityBlocks,
                            rates
                        )

                        const departureSelectable =
                            !!selectedStartDate &&
                            key > selectedStartDate &&
                            isDepartureDateSelectable(
                                selectedStartDate,
                                key,
                                availabilityBlocks,
                                rates
                            )

                        const isStart = selectedStartDate === key
                        const isEnd = selectedEndDate === key
                        const inRange = isDateInSelectedRange(
                            key,
                            selectedStartDate,
                            selectedEndDate
                        )
                        const isPassiveStart =
                            showPassiveBoundaries &&
                            isPassiveArrivalBoundary(
                                key,
                                availabilityBlocks,
                                rates
                            )
                        const isPassiveEnd =
                            showPassiveBoundaries &&
                            isPassiveDepartureBoundary(
                                key,
                                availabilityBlocks,
                                rates
                            )

                        let bg = "transparent"
                        let color = inCurrentMonth ? "#111827" : "#9ca3af"
                        let border = "1px solid transparent"
                        let cursor: React.CSSProperties["cursor"] = "default"
                        let opacity = inCurrentMonth ? 1 : 0.55
                        let boxShadow = "none"
                        let fontWeight: React.CSSProperties["fontWeight"] = 500

                        if (!selectedStartDate || selectedEndDate) {
                            if (arrivalSelectable) {
                                bg = "#eef6ff"
                                color = "#111827"
                                border = "1px solid #bfdbfe"
                                cursor = "pointer"
                                opacity = 1
                            } else if (isBookableNight) {
                                bg = "#f7f8fa"
                                color = "#1f2937"
                                border = "1px solid #e5e7eb"
                                cursor = "default"
                                opacity = 1
                            } else if (inCurrentMonth) {
                                bg = "#fafafa"
                                color = "#9ca3af"
                                border = "1px solid #f3f4f6"
                                cursor = "default"
                                opacity = 1
                            }
                        }

                        if (selectedStartDate && !selectedEndDate) {
                            if (arrivalSelectable && key <= selectedStartDate) {
                                bg = "#f5faff"
                                color = "#111827"
                                border = "1px solid #dbeafe"
                                cursor = "pointer"
                                opacity = 1
                            } else if (departureSelectable) {
                                bg = "#ecfdf5"
                                color = "#111827"
                                border = "1px solid #bbf7d0"
                                cursor = "pointer"
                                opacity = 1
                            } else if (
                                inCurrentMonth &&
                                key > selectedStartDate
                            ) {
                                bg = "#f8fafc"
                                color = "#9ca3af"
                                border = "1px solid #f1f5f9"
                                cursor = "pointer"
                                opacity = 1
                            }
                        }

                        if (selectedStartDate && selectedEndDate && !inRange) {
                            if (isBookableNight) {
                                bg = "#f7f8fa"
                                color = "#1f2937"
                                border = "1px solid #e5e7eb"
                                cursor = "default"
                                opacity = 1
                            } else if (inCurrentMonth) {
                                bg = "#fafafa"
                                color = "#9ca3af"
                                border = "1px solid #f3f4f6"
                                cursor = "default"
                                opacity = 1
                            }
                        }

                        if (inRange) {
                            bg = "#dbeafe"
                            color = "#111827"
                            border = "1px solid #bfdbfe"
                            opacity = 1
                            fontWeight = 500
                        }

                        if (isStart || isEnd) {
                            bg = BLUE
                            color = "white"
                            border = `1px solid ${BLUE}`
                            opacity = 1
                            fontWeight = 700
                            boxShadow = "none"
                        } else if (isPassiveStart || isPassiveEnd) {
                            color = "#1f2937"
                            opacity = 1
                            fontWeight = 700
                        }

                        if (isPassiveStart && !isStart && !isEnd) {
                            boxShadow = "inset 3px 0 0 rgba(14, 132, 201, 0.55)"
                        }

                        if (isPassiveEnd && !isStart && !isEnd) {
                            bg =
                                "linear-gradient(135deg, #f7f8fa 0 74%, rgba(255,255,255,0) 74% 100%)"
                            border = "1px solid #e5e7eb"
                        }

                        return (
                            <button
                                key={key}
                                onClick={() => handleDayClick(key)}
                                style={{
                                    position: "relative",
                                    border,
                                    background: bg,
                                    color,
                                    minHeight: "41px",
                                    borderRadius: "0",
                                    fontSize: "14px",
                                    cursor,
                                    fontWeight,
                                    transition: "all 0.15s ease",
                                    opacity,
                                    boxShadow,
                                }}
                            >
                                {isPassiveStart && !isStart && !isEnd && (
                                    <span
                                        style={{
                                            position: "absolute",
                                            top: "4px",
                                            right: "4px",
                                            fontSize: "8px",
                                            fontWeight: 800,
                                            letterSpacing: "0.04em",
                                            color: BLUE,
                                            lineHeight: 1,
                                        }}
                                    >
                                        IN
                                    </span>
                                )}
                                {day.getDate()}
                            </button>
                        )
                    })}
                </div>

                {!selectedStartDate && !selectedEndDate && (
                    <div
                        style={{
                            display: "flex",
                            flexWrap: "wrap",
                            gap: "8px 12px",
                            marginBottom: "14px",
                            fontSize: "11px",
                            color: "#4b5563",
                            lineHeight: 1.35,
                        }}
                    >
                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "6px",
                            }}
                        >
                            <span
                                style={{
                                    width: "12px",
                                    height: "12px",
                                    borderRadius: "3px",
                                    background: "#eef6ff",
                                    border: "1px solid #bfdbfe",
                                    boxShadow:
                                        "inset 3px 0 0 rgba(14, 132, 201, 0.55)",
                                    flex: "0 0 auto",
                                }}
                            />
                            Check-in available
                        </div>

                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "6px",
                            }}
                        >
                            <span
                                style={{
                                    width: "12px",
                                    height: "12px",
                                    borderRadius: "3px",
                                    background: "#f7f8fa",
                                    border: "1px solid #e5e7eb",
                                    flex: "0 0 auto",
                                }}
                            />
                            Available to stay
                        </div>

                        {monthHasPassiveCheckMarkers && (
                            <div
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "6px",
                                }}
                            >
                                <span
                                    style={{
                                        width: "12px",
                                        height: "12px",
                                        borderRadius: "3px",
                                        background:
                                            "linear-gradient(135deg, #f7f8fa 0 74%, rgba(255,255,255,0) 74% 100%)",
                                        border: "1px solid #e5e7eb",
                                        flex: "0 0 auto",
                                    }}
                                />
                                Check-out only
                            </div>
                        )}

                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "6px",
                            }}
                        >
                            <span
                                style={{
                                    width: "12px",
                                    height: "12px",
                                    borderRadius: "3px",
                                    background: "#fafafa",
                                    border: "1px solid #f3f4f6",
                                    flex: "0 0 auto",
                                }}
                            />
                            Unavailable
                        </div>
                    </div>
                )}

                {(selectedStartDate || selectedEndDate) && (
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "flex-end",
                            marginTop: "-4px",
                            marginBottom: "14px",
                        }}
                    >
                        <button
                            onClick={clearDates}
                            style={{
                                border: `1px solid ${BLUE}`,
                                background: "#f8fbff",
                                padding: "7px 12px",
                                borderRadius: "999px",
                                fontSize: "12px",
                                fontWeight: 700,
                                color: BLUE,
                                cursor: "pointer",
                            }}
                        >
                            Clear dates
                        </button>
                    </div>
                )}

                <div
                    style={{
                        background: "#faf7ef",
                        borderRadius: "12px",
                        padding: "14px",
                        marginBottom: "12px",
                    }}
                >
                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns: "1fr 1fr",
                            gap: "12px",
                            marginBottom: "10px",
                        }}
                    >
                        <div>
                            <div
                                style={{
                                    fontSize: "10px",
                                    fontWeight: 700,
                                    color: TEXT_MUTED,
                                    textTransform: "uppercase",
                                    letterSpacing: "0.05em",
                                    marginBottom: "3px",
                                }}
                            >
                                Arrival
                            </div>
                            <div
                                style={{
                                    fontSize: "13px",
                                    fontWeight: 600,
                                    color: "#1f2937",
                                    lineHeight: 1.35,
                                }}
                            >
                                {selectedStartDate
                                    ? formatSingleDateLabel(selectedStartDate)
                                    : "Add date"}
                            </div>
                        </div>

                        <div>
                            <div
                                style={{
                                    fontSize: "10px",
                                    fontWeight: 700,
                                    color: TEXT_MUTED,
                                    textTransform: "uppercase",
                                    letterSpacing: "0.05em",
                                    marginBottom: "3px",
                                }}
                            >
                                Departure
                            </div>
                            <div
                                style={{
                                    fontSize: "13px",
                                    fontWeight: 600,
                                    color: "#1f2937",
                                    lineHeight: 1.35,
                                }}
                            >
                                {selectedEndDate
                                    ? formatSingleDateLabel(selectedEndDate)
                                    : "Add date"}
                            </div>
                        </div>
                    </div>
                </div>

                <div style={{ marginBottom: "14px" }}>
                    <div
                        style={{
                            fontSize: isMobile ? "30px" : "28px",
                            fontWeight: 800,
                            color: GREEN,
                            lineHeight: 1,
                            marginBottom: "6px",
                        }}
                    >
                        {selectedPrice?.price != null
                            ? `£${Math.round(selectedPrice.price).toLocaleString()} for ${selectedNights} nights`
                            : "—"}
                    </div>

                    <div
                        style={{
                            fontSize: "13px",
                            color: "#374151",
                            marginBottom: "8px",
                            lineHeight: 1.45,
                        }}
                    >
                        {selectedStartDate && selectedEndDate
                            ? `${formatSingleDateLabel(selectedStartDate)} – ${formatSingleDateLabel(selectedEndDate)} · ${villa.capacity} guests`
                            : `Select dates to see your stay summary · Up to ${villa.capacity} guests`}
                    </div>

                    {selectedPrice?.error &&
                        selectedStartDate &&
                        selectedEndDate && (
                            <p
                                style={{
                                    margin: "0 0 8px 0",
                                    fontSize: "12px",
                                    lineHeight: 1.45,
                                    color: "#b91c1c",
                                }}
                            >
                                {selectedPrice.error}
                            </p>
                        )}

                    {selectedPrice?.note && (
                        <p
                            style={{
                                margin: "0 0 8px 0",
                                fontSize: "12px",
                                lineHeight: 1.45,
                                color: TEXT_MUTED,
                            }}
                        >
                            {selectedPrice.note}
                        </p>
                    )}
                </div>

                <div
                    style={{
                        borderTop: `1px solid ${BORDER}`,
                        paddingTop: "14px",
                        marginTop: "2px",
                        marginBottom: "14px",
                    }}
                >
                    <div
                        style={{
                            fontSize: "15px",
                            fontWeight: 800,
                            color: ACCENT,
                            marginBottom: "8px",
                        }}
                    >
                        Book with French Maison
                    </div>

                    <div
                        style={{
                            fontSize: "13px",
                            color: TEXT_MUTED,
                            lineHeight: 1.45,
                        }}
                    >
                        Request your stay and we’ll personally guide you from
                        availability check to booking confirmation.
                    </div>
                </div>

                <button
                    onClick={() => setBookingRequestOpen(true)}
                    style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: "100%",
                        minHeight: isMobile ? "52px" : "50px",
                        background: ACCENT,
                        color: "white",
                        border: "none",
                        fontSize: "16px",
                        fontWeight: 800,
                        borderRadius: "12px",
                        letterSpacing: "-0.01em",
                        cursor: "pointer",
                    }}
                >
                    Request to Book
                </button>

                <button
                    onClick={() => setEnquiryOpen(true)}
                    style={{
                        marginTop: 12,
                        width: "100%",
                        background: "transparent",
                        border: "none",
                        color: ACCENT,
                        fontSize: 14,
                        fontWeight: 800,
                        cursor: "pointer",
                        textDecoration: "underline",
                        textUnderlineOffset: "2px",
                    }}
                >
                    Ask a Question
                </button>

                <button
                    onClick={saveCurrentVilla}
                    style={{
                        marginTop: 10,
                        width: "100%",
                        minHeight: "46px",
                        background: isCurrentVillaSaved ? "#f8fbff" : "#fff",
                        color: ACCENT,
                        border: `1px solid ${isCurrentVillaSaved ? "#bfdbfe" : BORDER}`,
                        fontSize: 14,
                        fontWeight: 800,
                        borderRadius: "12px",
                        cursor: "pointer",
                    }}
                >
                    {isCurrentVillaSaved ? "Saved to your list" : "Save villa"}
                </button>

                <button
                    onClick={() => setSavedVillasOpen(true)}
                    style={{
                        marginTop: 10,
                        width: "100%",
                        background: "transparent",
                        border: "none",
                        color: ACCENT,
                        fontSize: 13,
                        fontWeight: 700,
                        cursor: "pointer",
                        textDecoration: "underline",
                        textUnderlineOffset: "2px",
                    }}
                >
                    {savedVillas.length > 0
                        ? `View saved villas (${savedVillas.length})`
                        : "View saved villas"}
                </button>

                <div
                    style={{
                        marginTop: "14px",
                        display: "grid",
                        gap: "8px",
                    }}
                >
                    {[
                        "Availability confirmed before any payment",
                        "Personal support throughout the booking process",
                        "Clear deposit and balance timings",
                        "No obligation until your stay is confirmed",
                    ].map((item) => (
                        <div
                            key={item}
                            style={{
                                display: "flex",
                                alignItems: "flex-start",
                                gap: "8px",
                                fontSize: "12px",
                                lineHeight: 1.45,
                                color: "#374151",
                                fontWeight: 600,
                            }}
                        >
                            <span
                                style={{
                                    color: GREEN,
                                    fontSize: "13px",
                                    lineHeight: 1.2,
                                    marginTop: "1px",
                                }}
                            >
                                ✓
                            </span>
                            <span>{item}</span>
                        </div>
                    ))}
                </div>

                <div
                    style={{
                        marginTop: "16px",
                        paddingTop: "14px",
                        borderTop: `1px solid ${BORDER}`,
                    }}
                >
                    <div
                        style={{
                            fontSize: "13px",
                            fontWeight: 800,
                            color: ACCENT,
                            marginBottom: "8px",
                        }}
                    >
                        How booking works
                    </div>
                    <div
                        style={{
                            fontSize: "12px",
                            lineHeight: 1.5,
                            color: TEXT_MUTED,
                        }}
                    >
                        Request your stay → We confirm availability → You secure
                        your booking → Your stay is confirmed
                    </div>
                </div>
            </div>
        </div>
    )

    return (
        <div
            ref={containerRef}
            style={{
                width: "100%",
                maxWidth: "1200px",
                margin: "0 auto",
                padding: isMobile ? "20px" : "24px",
                boxSizing: "border-box",
                overflowX: "hidden",
                minWidth: 0,
                fontFamily: "Inter, sans-serif",
                color: "#1f2937",
            }}
        >
            <Lightbox
                isOpen={lightboxOpen}
                photos={photos}
                index={photoIndex}
                onClose={() => setLightboxOpen(false)}
                onPrev={goPrevPhoto}
                onNext={goNextPhoto}
                setIndex={setPhotoIndex}
            />

            <EnquiryModal
                isOpen={enquiryOpen}
                onClose={() => setEnquiryOpen(false)}
                villa={villa}
                arrivalDate={selectedStartDate}
                departureDate={selectedEndDate}
                nights={
                    selectedStartDate && selectedEndDate ? selectedNights : null
                }
            />

            <BookingRequestModal
                isOpen={bookingRequestOpen}
                onClose={() => setBookingRequestOpen(false)}
                villa={villa}
                arrivalDate={selectedStartDate}
                departureDate={selectedEndDate}
                nights={
                    selectedStartDate && selectedEndDate ? selectedNights : null
                }
                indicativePrice={selectedPrice?.price ?? null}
            />

            <SavedVillasModal
                isOpen={savedVillasOpen}
                onClose={() => setSavedVillasOpen(false)}
                savedVillas={savedVillas}
                currentVillaId={villa?.villa_id ?? null}
                onRemove={removeSavedVilla}
            />

            <div style={{ position: "relative", marginBottom: "24px" }}>
                <div
                    onTouchStart={handleTouchStart}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                    onClick={() => setLightboxOpen(true)}
                    style={{
                        width: "100%",
                        height: isMobile ? "62vh" : "60vh",
                        minHeight: isMobile ? "430px" : "380px",
                        maxHeight: isMobile ? "720px" : "760px",
                        borderRadius: "20px",
                        overflow: "hidden",
                        boxShadow: "0 6px 18px rgba(0,0,0,0.12)",
                        marginBottom: "12px",
                        backgroundColor: "#f5f5f5",
                        position: "relative",
                        touchAction: "pan-y",
                        cursor: "zoom-in",
                    }}
                >
                    {photos.length > 0 && (
                        <img
                            src={getOptimizedImage(
                                photos[photoIndex],
                                1600,
                                80
                            )}
                            alt={villa.name}
                            width="1600"
                            height="900"
                            decoding="async"
                            loading="eager"
                            style={{
                                width: "100%",
                                height: "100%",
                                objectFit: "cover",
                                display: "block",
                                userSelect: "none",
                                WebkitUserDrag: "none",
                                objectPosition: isMobile
                                    ? "center center"
                                    : "center center",
                            }}
                        />
                    )}

                    <div
                        style={{
                            position: "absolute",
                            left: 16,
                            bottom: 16,
                            display: "flex",
                            gap: 8,
                            alignItems: "center",
                            zIndex: 2,
                            flexWrap: "wrap",
                        }}
                    >
                        <span
                            style={{
                                background: "rgba(17,24,39,0.7)",
                                color: "white",
                                padding: "8px 12px",
                                borderRadius: 999,
                                fontSize: 13,
                                fontWeight: 700,
                            }}
                        >
                            View photos
                        </span>
                        <span
                            style={{
                                background: "rgba(255,255,255,0.88)",
                                color: ACCENT,
                                padding: "8px 12px",
                                borderRadius: 999,
                                fontSize: 13,
                                fontWeight: 700,
                            }}
                        >
                            {photoIndex + 1} /{" "}
                            {villa.photo_count || photos.length}
                        </span>
                    </div>

                    {photos.length > 1 && (
                        <>
                            <HeroArrowButton
                                direction="left"
                                onClick={goPrevPhoto}
                                isMobile={isMobile}
                            />
                            <HeroArrowButton
                                direction="right"
                                onClick={goNextPhoto}
                                isMobile={isMobile}
                            />
                        </>
                    )}
                </div>

                {photos.length > 1 && (
                    <div
                        style={{
                            display: "flex",
                            gap: "8px",
                            overflowX: "auto",
                            paddingBottom: "6px",
                            scrollbarWidth: "none",
                        }}
                    >
                        {photos.map((img, i) => (
                            <button
                                key={i}
                                style={{
                                    flex: "0 0 auto",
                                    width: "88px",
                                    aspectRatio: "4 / 3",
                                    borderRadius: "10px",
                                    overflow: "hidden",
                                    cursor: "pointer",
                                    border:
                                        i === photoIndex
                                            ? "2px solid #153852"
                                            : "2px solid transparent",
                                    opacity: i === photoIndex ? 1 : 0.65,
                                    transition: "all 0.2s ease",
                                    padding: 0,
                                    background: "transparent",
                                }}
                                onClick={() => setPhotoIndex(i)}
                            >
                                <img
                                    src={getOptimizedImage(img, 400, 70)}
                                    alt={`Thumbnail ${i + 1}`}
                                    loading="lazy"
                                    decoding="async"
                                    width="88"
                                    height="66"
                                    style={{
                                        width: "100%",
                                        height: "100%",
                                        objectFit: "cover",
                                        display: "block",
                                    }}
                                />
                            </button>
                        ))}
                    </div>
                )}
            </div>

            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: isMobile
                        ? "1fr"
                        : "minmax(0, 1fr) 340px",
                    gap: "32px",
                    alignItems: "start",
                    marginBottom: "40px",
                    minWidth: 0,
                    width: "100%",
                }}
            >
                <div style={{ minWidth: 0 }}>
                    <h1
                        style={{
                            fontSize: isMobile ? 28 : 34,
                            fontWeight: 500,
                            fontFamily:
                                '"Cormorant Garamond", "Libre Baskerville", Georgia, serif',
                            color: ACCENT,
                            margin: "0 0 8px 0",
                            lineHeight: 1.02,
                            letterSpacing: "-0.02em",
                        }}
                    >
                        {villa.name}
                    </h1>

                    <p style={{ color: TEXT_MUTED, marginBottom: 14 }}>
                        {villa.sub_region
                            ? `${villa.sub_region}, ${villa.region}`
                            : villa.region}
                    </p>

                    <p
                        style={{
                            fontSize: 22,
                            fontWeight: 700,
                            color: ACCENT,
                            marginBottom: displayTags.length > 0 ? 14 : 20,
                        }}
                    >
                        {priceLabel}
                    </p>

                    {displayTags.length > 0 && (
                        <div style={{ marginBottom: 20 }}>
                            {displayTags.map((tag) => {
                                const colors = tagColorMap[tag] || {
                                    bg: "#eee",
                                    text: "#333",
                                }
                                return (
                                    <span
                                        key={tag}
                                        style={{
                                            display: "inline-block",
                                            background: colors.bg,
                                            color: colors.text,
                                            padding: "6px 10px",
                                            marginRight: 8,
                                            marginBottom: 8,
                                            borderRadius: 999,
                                            fontSize: 13,
                                            fontWeight: 600,
                                        }}
                                    >
                                        {tag}
                                    </span>
                                )
                            })}
                        </div>
                    )}

                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns: isMobile
                                ? "repeat(2, minmax(0, 1fr))"
                                : "repeat(5, minmax(0, 1fr))",
                            gap: isMobile ? 10 : 16,
                            marginBottom: 18,
                            alignItems: "stretch",
                        }}
                    >
                        {summaryStats.map((item) => (
                            <div
                                key={item.label}
                                style={{
                                    padding: isMobile
                                        ? "10px 12px"
                                        : "14px 16px",
                                    border: `1px solid ${BORDER}`,
                                    borderRadius: 20,
                                    background:
                                        "linear-gradient(180deg, #ffffff 0%, #fafaf8 100%)",
                                    minHeight: isMobile ? 78 : 96,
                                    display: "flex",
                                    flexDirection: "column",
                                    justifyContent: "space-between",
                                    alignItems: "flex-start",
                                    boxShadow: "0 4px 14px rgba(0,0,0,0.03)",
                                }}
                            >
                                <div
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 8,
                                    }}
                                >
                                    {item.icon ? (
                                        <span
                                            style={{
                                                fontSize: isMobile ? 14 : 16,
                                                lineHeight: 1,
                                            }}
                                        >
                                            {item.icon}
                                        </span>
                                    ) : null}
                                    <div
                                        style={{
                                            fontSize: isMobile ? 11 : 13,
                                            color: TEXT_MUTED,
                                            fontWeight: 600,
                                            letterSpacing: "0.01em",
                                        }}
                                    >
                                        {item.label}
                                    </div>
                                </div>

                                <div
                                    style={{
                                        fontSize:
                                            item.label === "Property type"
                                                ? isMobile
                                                    ? 13
                                                    : 15
                                                : isMobile
                                                  ? 17
                                                  : 18,
                                        color: ACCENT,
                                        fontWeight: 700,
                                        lineHeight:
                                            item.label === "Property type"
                                                ? 1.2
                                                : 1.1,
                                        marginTop: isMobile ? 6 : 8,
                                        wordBreak: "break-word",
                                    }}
                                >
                                    {item.value}
                                </div>
                            </div>
                        ))}
                    </div>

                    <HighlightsRow villa={villa} />

                    {isMobile && (
                        <div style={{ marginTop: 22, marginBottom: 24 }}>
                            {bookingWidget}
                        </div>
                    )}

                    <section style={sectionCardStyle}>
                        <h3 style={sectionHeadingStyle}>About this property</h3>
                        <p style={bodyTextStyle}>
                            {showFullAbout || !aboutPreview.trimmed
                                ? villa.description
                                : aboutPreview.text}
                        </p>
                        {aboutPreview.trimmed && (
                            <button
                                onClick={() => setShowFullAbout((v) => !v)}
                                style={linkButtonStyle}
                            >
                                {showFullAbout ? "Read less" : "Read more"}
                            </button>
                        )}
                    </section>

                    <ReadMoreSection
                        title="Layout & grounds"
                        text={villa.interior_grounds}
                        max={340}
                    />

                    <LocationSection villa={villa} isMobile={isMobile} />

                    <AmenitiesSection villa={villa} isMobile={isMobile} />

                    <ThingsToKnow villa={villa} />
                    <TermsAndConditions villa={villa} />

                    <section
                        style={{ ...sectionCardStyle, background: SOFT_BG }}
                    >
                        <h3 style={sectionHeadingStyle}>
                            Ready to book or need more detail?
                        </h3>
                        <p style={bodyTextStyle}>
                            Request this villa with French Maison and we’ll
                            confirm availability for your dates. If you’d rather
                            talk it through first, we can help with suitability,
                            layout or location.
                        </p>
                        <div
                            style={{
                                display: "flex",
                                flexWrap: "wrap",
                                gap: 12,
                                marginTop: 14,
                            }}
                        >
                            <button
                                onClick={() => setEnquiryOpen(true)}
                                style={{
                                    ...secondaryCtaStyle,
                                    cursor: "pointer",
                                }}
                            >
                                Ask us a question
                            </button>
                            <button
                                onClick={() => setBookingRequestOpen(true)}
                                style={{
                                    ...primaryCtaStyle,
                                    border: "none",
                                    cursor: "pointer",
                                }}
                            >
                                Request to book with French Maison →
                            </button>
                        </div>
                    </section>

                    <div id="ask-a-question" />
                </div>

                {!isMobile && (
                    <div style={{ minWidth: 0 }}>{bookingWidget}</div>
                )}
            </div>

            {similar.length > 0 && (
                <div style={{ marginTop: isMobile ? 0 : 56 }}>
                    <h2
                        style={{
                            fontSize: 24,
                            fontWeight: 700,
                            color: ACCENT,
                            marginBottom: 20,
                        }}
                    >
                        Similar properties in {villa.sub_region || villa.region}
                    </h2>
                    <SimilarProperties similar={similar} isMobile={isMobile} />
                </div>
            )}
        </div>
    )
}

const navBtn: React.CSSProperties = {
    border: "none",
    background: "transparent",
    fontSize: "24px",
    cursor: "pointer",
    color: "#374151",
    lineHeight: 1,
    padding: "2px 6px",
}

const sectionCardStyle: React.CSSProperties = {
    marginTop: 22,
    border: `1px solid ${BORDER}`,
    borderRadius: 20,
    background: "white",
    padding: 20,
    boxShadow: "0 8px 22px rgba(0,0,0,0.04)",
}

const sectionHeadingStyle: React.CSSProperties = {
    fontSize: 20,
    fontWeight: 600,
    margin: "0 0 12px 0",
    color: ACCENT,
    lineHeight: 1.15,
}

const bodyTextStyle: React.CSSProperties = {
    lineHeight: 1.68,
    color: "#374151",
    fontSize: 15,
    margin: 0,
    whiteSpace: "pre-line",
}

const linkButtonStyle: React.CSSProperties = {
    border: "none",
    background: "transparent",
    padding: 0,
    color: ACCENT,
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
    marginTop: 12,
}

const pillStyle: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    padding: "8px 11px",
    borderRadius: 999,
    background: "#f8fafc",
    border: `1px solid ${BORDER}`,
    color: ACCENT,
    fontSize: 13,
    fontWeight: 600,
}

const primaryCtaStyle: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    minHeight: 48,
    padding: "0 18px",
    background: ACCENT,
    color: "white",
    textDecoration: "none",
    borderRadius: 12,
    fontWeight: 600,
    fontSize: 15,
}

const secondaryCtaStyle: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    minHeight: 48,
    padding: "0 18px",
    background: "white",
    color: ACCENT,
    textDecoration: "none",
    borderRadius: 12,
    border: `1px solid ${BORDER}`,
    fontWeight: 600,
    fontSize: 15,
}

const fieldLabelStyle: React.CSSProperties = {
    display: "block",
    marginBottom: 7,
    fontSize: 12,
    fontWeight: 700,
    color: TEXT_MUTED,
    textTransform: "uppercase",
    letterSpacing: "0.04em",
}

const inputStyle: React.CSSProperties = {
    width: "100%",
    minHeight: 50,
    borderRadius: 14,
    border: `1px solid ${BORDER}`,
    padding: "0 14px",
    fontSize: 15,
    color: "#111827",
    outline: "none",
    boxSizing: "border-box",
    background: "white",
}

function lightboxNav(
    side: "left" | "right",
    isMobile: boolean
): React.CSSProperties {
    return {
        position: "absolute",
        top: "50%",
        [side]: isMobile ? 12 : 20,
        transform: "translateY(-50%)",
        minWidth: isMobile ? 44 : 84,
        width: isMobile ? 44 : undefined,
        height: isMobile ? 44 : 52,
        padding: isMobile ? 0 : "0 14px",
        borderRadius: 999,
        border: "1px solid rgba(255,255,255,0.45)",
        background: "rgba(15, 23, 42, 0.46)",
        backdropFilter: "blur(10px)",
        color: "white",
        fontSize: isMobile ? 18 : 15,
        fontWeight: 800,
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: isMobile ? 0 : 8,
        boxShadow: "0 10px 24px rgba(0,0,0,0.22)",
    } as React.CSSProperties
}

addPropertyControls(VillaDetailDynamic, {
    fallbackVillaId: {
        type: ControlType.Number,
        title: "Preview Villa ID",
        defaultValue: 457,
        min: 1,
        step: 1,
    },
})
