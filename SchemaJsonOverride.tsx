import type { ComponentType, CSSProperties } from "react"
import { useEffect, useRef } from "react"

interface Props {
    children?: any
    style?: CSSProperties
    [key: string]: any
}

export function withSchemaJson(
    Component: ComponentType<Props>
): ComponentType<Props> {
    return function SchemaJsonWrapper(props: Props) {
        const wrapperRef = useRef<HTMLDivElement>(null)

        useEffect(() => {
            const schemaJson = wrapperRef.current?.textContent?.trim() ?? ""

            if (!schemaJson) {
                console.warn(
                    "[SchemaJsonOverride] Schema JSON field is empty — skipping injection"
                )
                return
            }

            // Validate it's parseable JSON before injecting
            try {
                JSON.parse(schemaJson)
            } catch {
                console.warn(
                    "[SchemaJsonOverride] Schema JSON field is not valid JSON — skipping injection"
                )
                return
            }

            const script = document.createElement("script")
            script.type = "application/ld+json"
            script.id = "fm-article-schema"
            script.textContent = schemaJson
            document.head.appendChild(script)

            return () => {
                const existing = document.getElementById("fm-article-schema")
                if (existing) existing.remove()
            }
        }, [])

        // Wrapper div is hidden — used only to read textContent after render
        return (
            <div ref={wrapperRef} style={{ display: "none" }}>
                <Component {...props} />
            </div>
        )
    }
}
