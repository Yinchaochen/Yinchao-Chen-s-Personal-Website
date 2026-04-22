import { useEffect, useRef, useState, type CSSProperties, type ImgHTMLAttributes, type ReactEventHandler } from 'react';

type LazyImageProps = Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'loading'> & {
  src: string;
  containerClassName?: string;
  containerStyle?: CSSProperties;
  eager?: boolean;
  rootMargin?: string;
  threshold?: number;
};

export default function LazyImage({
  src,
  alt,
  style,
  onLoad,
  containerClassName,
  containerStyle,
  eager = false,
  rootMargin = '200px 0px',
  threshold = 0.01,
  ...imgProps
}: LazyImageProps) {
  const containerRef = useRef<HTMLSpanElement>(null);
  const [shouldLoad, setShouldLoad] = useState(eager);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (eager || shouldLoad) return;

    const target = containerRef.current;
    if (!target) return;

    if (!('IntersectionObserver' in window)) {
      setShouldLoad(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting || entry.intersectionRatio > 0)) {
          setShouldLoad(true);
          observer.disconnect();
        }
      },
      { rootMargin, threshold },
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [eager, rootMargin, shouldLoad, threshold]);

  const handleLoad: ReactEventHandler<HTMLImageElement> = (event) => {
    setLoaded(true);
    onLoad?.(event);
  };

  const transition = typeof style?.transition === 'string'
    ? `${style.transition}, opacity 0.35s ease`
    : 'opacity 0.35s ease';

  return (
    <span
      ref={containerRef}
      className={containerClassName}
      style={{
        display: 'block',
        background: 'rgba(104,20,43,0.06)',
        ...containerStyle,
      }}
    >
      {shouldLoad ? (
        <img
          {...imgProps}
          src={src}
          alt={alt}
          loading={eager ? 'eager' : 'lazy'}
          decoding="async"
          fetchPriority={eager ? 'high' : 'low'}
          onLoad={handleLoad}
          style={{
            ...style,
            opacity: loaded ? 1 : 0,
            transition,
          }}
        />
      ) : (
        <span aria-hidden="true" style={{ display: 'block', width: '100%', height: '100%' }} />
      )}
    </span>
  );
}
