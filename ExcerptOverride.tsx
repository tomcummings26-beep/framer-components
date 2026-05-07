import type { ComponentType, CSSProperties } from "react"

interface Props {
    style?: CSSProperties
    [key: string]: any
}

export function withExcerpt(
    Component: ComponentType<Props>
): ComponentType<Props> {
    return function ExcerptWrapper(props: Props) {
        const excerptStyle: CSSProperties = {
            borderLeft: "3px solid #C8A96E",
            backgroundColor: "#FAF8F5",
            padding: "16px 20px",
            borderRadius: "0 4px 4px 0",
            fontStyle: "italic",
            lineHeight: "1.65",
            color: "#3D3D3D",
        }

        return (
            <Component {...props} style={{ ...props.style, ...excerptStyle }} />
        )
    }
}
