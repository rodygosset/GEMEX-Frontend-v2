import React, { CSSProperties, useCallback } from "react"
import { useEffect, useRef, useState } from "react"
import styles from "@styles/components/utils/vertical-scrollbar.module.scss"



const VerticalScrollBar = ({ children, style, className }:
    {
        children: any,
        style?: CSSProperties,
        className?: string
    }
    ) => {
    
    const contentRef = useRef<HTMLDivElement>(null)
    const scrollbarContainerRef = useRef<HTMLDivElement>(null)
    const thumbRef = useRef<HTMLDivElement>(null)

    const resizeObserver = useRef<ResizeObserver>(null)
    
    const [thumbHeight, setThumbHeight] = useState<number>(20)
    const [thumbPosition, setThumbPosition] = useState(0)
    const [isDragging, setIsDragging] = useState(false)


    const [showScrollBar, setShowScrollBar] = useState(false)

    const [scrollStartPosition, setScrollStartPosition] = useState<number | null>(null)
    const [initialScrollTop, setInitialScrollTop] = useState<number>(0)

    useEffect(() => {
        handleResize()
    }, [contentRef.current])

    const handleResize = () => {
        if(!contentRef.current || !scrollbarContainerRef.current) { return }
        const { clientHeight, scrollHeight } = contentRef.current
        setThumbHeight(Math.max(clientHeight * clientHeight / scrollHeight, 20))
        setShowScrollBar(scrollHeight > clientHeight)
    }

    const handleContentScroll = () => {
        if(!contentRef.current) return
        const { clientHeight, scrollHeight, scrollTop } = contentRef.current
        setThumbPosition(clientHeight / scrollHeight * scrollTop)
    }

    const handleThumbGrab = useCallback((e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()
        setScrollStartPosition(e.clientY)
        if(contentRef.current) setInitialScrollTop(contentRef.current.scrollTop)
        setIsDragging(true)
    }, [])

    const handleThumbFree = useCallback((e: MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()
        if(isDragging) setIsDragging(false)
    },[isDragging])

    const handleMouseMove = useCallback((e: MouseEvent) => {
        if(!isDragging || !contentRef.current) { return }
        const { scrollHeight, offsetHeight } = contentRef.current;

        // @ts-ignore
        const deltaY = (e.clientY - scrollStartPosition) * (offsetHeight / thumbHeight)
        const newScrollTop = Math.min(
            initialScrollTop + deltaY,
            scrollHeight - offsetHeight
        )

        contentRef.current.scrollTop = newScrollTop;
    }, [isDragging, scrollStartPosition, thumbHeight])

    useEffect(() => {
        if(contentRef.current) {
            // @ts-ignore
            resizeObserver.current = new ResizeObserver(handleResize)
            resizeObserver.current.observe(contentRef.current)
        }
    }, [])

    const handleThumbPosition = useCallback(() => {
        if (
          !contentRef.current ||
          !thumbRef.current
        ) {
          return;
        }
        const { scrollTop: contentTop, scrollHeight: contentHeight } =
          contentRef.current;
        const { clientHeight: trackHeight } = contentRef.current;
        let newTop = (+contentTop / +contentHeight) * trackHeight;
        newTop = Math.min(newTop, trackHeight - thumbHeight);
        const thumb = thumbRef.current;
        thumb.style.top = `${newTop}px`;
      }, []);

    // If the content and the scrollbar track exist, use a ResizeObserver to adjust height of thumb and listen for scroll event to move the thumb
    useEffect(() => {
        if (contentRef.current) {
            const ref = contentRef.current;
            // @ts-ignore
            resizeObserver.current = new ResizeObserver(() => {
                handleResize()
            });
            resizeObserver.current.observe(ref);
            ref.addEventListener('scroll', handleThumbPosition);
            return () => {
                resizeObserver.current?.unobserve(ref);
                ref.removeEventListener('scroll', handleThumbPosition);
            };
        }
    }, []);


    // Listen for mouse events to handle scrolling by dragging the thumb
    useEffect(() => {
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleThumbFree);
        document.addEventListener('mouseleave', handleThumbFree);
        return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleThumbFree);
        document.removeEventListener('mouseleave', handleThumbFree);
        };
    }, [handleMouseMove, handleThumbFree]);
    const getStyle = () => style ? style : undefined

    const getClassNames = () => {
        let classes = styles.content
        classes += typeof className !== 'undefined' ? ' ' + className : ''
        return classes
    }

    return (
        <div 
            style={getStyle()}
            className={styles.container} 
            >
            <div 
                className={getClassNames()}
                ref={contentRef}
                onScroll={handleContentScroll}>
                { children }
            </div>
            <div 
                hidden={!showScrollBar}
                className={styles.scrollbarContainer}
                ref={scrollbarContainerRef}>
                <div 
                    className={styles.thumb}
                    style={{ top: `${thumbPosition}px`, height: `${thumbHeight}px` }}
                    onMouseDown={handleThumbGrab}
                    ref={thumbRef}>
                    s
                </div>
            </div>
        </div>
    )
}

export default VerticalScrollBar