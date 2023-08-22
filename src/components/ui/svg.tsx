type clickHandler = (e: React.MouseEvent<HTMLDivElement>) => void;

interface SVGProps {
  alt?: string;
  width: number;
  height?: number;
  fill?: string;
  src: React.JSXElementConstructor<{ width: number; height: number, style: React.CSSProperties, className?: string, onClick?: clickHandler }>
  style?: React.CSSProperties;
  className?: string;
  onClick?: clickHandler;
}

export function SVG(props: SVGProps) {
  const {
    fill = 'var(--cib-color-foreground-accent-primary)',
    src: Children,
    width = 20,
    height,
    style,
    className,
    onClick,
  } = props

  return <Children width={width} height={height || width} style={{ ...style, fill }} className={className} onClick={onClick} />
}
