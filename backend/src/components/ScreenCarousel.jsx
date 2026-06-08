import React, { useRef, useState, useEffect } from 'react';
import { motion, useMotionValue, animate } from 'framer-motion';
import ScreenErrorBoundary from './ScreenErrorBoundary';
import LoadingScreen from './LoadingScreen';
import { Suspense } from 'react';

// Shortest distance wrapping around a loop of size n
function getRelativeOffset(i, c, n) {
  let diff = i - c;
  while (diff < -n / 2) diff += n;
  while (diff > n / 2) diff -= n;
  return diff;
}

export default function ScreenCarousel({ activeTab, setActiveTab, mainTabs, renderScreen }) {
  const containerRef = useRef(null);
  const dragX = useMotionValue(0);
  const [width, setWidth] = useState(390);
  const isHorizontalRef = useRef(null);
  const isTransitioningRef = useRef(false);
  const animationRef = useRef(null);

  const n = mainTabs.length;
  const currentIdx = mainTabs.indexOf(activeTab);

  // Keep track of container width for gesture thresholds and animations
  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        const w = containerRef.current.offsetWidth;
        if (w > 0) {
          setWidth(w);
        } else {
          setWidth(window.innerWidth || 390);
        }
      }
    };
    updateWidth();
    const timer = setTimeout(updateWidth, 100);

    window.addEventListener('resize', updateWidth);
    return () => {
      window.removeEventListener('resize', updateWidth);
      clearTimeout(timer);
    };
  }, []);

  // Reset container scrollLeft to 0 to prevent browser auto-scroll shifting
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      if (container.scrollLeft !== 0) {
        container.scrollLeft = 0;
      }
    };

    // Store handler for cleanup
    handleScrollRef.current = handleScroll;
    container.addEventListener('scroll', handleScroll);
    container.scrollLeft = 0;

    return () => {
      if (container) {
        container.removeEventListener('scroll', handleScroll);
      }
    };
  }, []);

  // Force scrollLeft = 0 when activeTab changes
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollLeft = 0;
    }
  }, [activeTab]);

  // Sync index change from external clicks (e.g. NavBar tapping)
  const prevIdxRef = useRef(currentIdx);
  const wasDraggedRef = useRef(false);
  const handleScrollRef = useRef(null); // Store handler for cleanup

  useEffect(() => {
    const prev = prevIdxRef.current;
    prevIdxRef.current = currentIdx;

    if (prev !== currentIdx && prev !== -1) {
      if (wasDraggedRef.current) {
        // Drag already animated — just reset
        wasDraggedRef.current = false;
        isTransitioningRef.current = false;
        if (animationRef.current) {
          animationRef.current.stop();
          animationRef.current = null;
        }
        dragX.set(0);
      } else {
        // NavBar tap — determine direction including wrap-around
        const diff = getRelativeOffset(currentIdx, prev, n);
        const startX = diff * width;

        if (animationRef.current) {
          animationRef.current.stop();
        }
        dragX.set(startX);
        isTransitioningRef.current = true;
        animationRef.current = animate(dragX, 0, {
          type: 'spring', stiffness: 280, damping: 30,
          onComplete: () => {
            isTransitioningRef.current = false;
            animationRef.current = null;
          }
        });
      }
    }
  }, [currentIdx, width, n]);

  // Cleanup scroll listener on unmount
  useEffect(() => {
    return () => {
      if (containerRef.current && handleScrollRef.current) {
        containerRef.current.removeEventListener('scroll', handleScrollRef.current);
        handleScrollRef.current = null;
      }
    };
  }, []);

  const handlePanStart = () => {
    isHorizontalRef.current = null;
    isTransitioningRef.current = false;
    if (animationRef.current) {
      animationRef.current.stop();
      animationRef.current = null;
    }
  };

  const handlePan = (e, info) => {
    if (isHorizontalRef.current === false) return;

    if (isHorizontalRef.current === null) {
      const dx = Math.abs(info.offset.x);
      const dy = Math.abs(info.offset.y);

      // Require 10px minimum total movement before locking gesture direction
      if (dx + dy > 10) {
        if (dx > dy * 1.5) {
          isHorizontalRef.current = true;
        } else {
          isHorizontalRef.current = false;
          return;
        }
      } else {
        return;
      }
    }

    // Set interactive drag displacement
    isTransitioningRef.current = false;
    if (animationRef.current) {
      animationRef.current.stop();
      animationRef.current = null;
    }
    dragX.set(info.offset.x);
  };

  const handlePanEnd = (e, info) => {
    if (isHorizontalRef.current !== true) return;

    const offset = info.offset.x;
    const velocity = info.velocity.x;
    const threshold = width * 0.25;

    if (animationRef.current) {
      animationRef.current.stop();
    }

    if (offset < -threshold || velocity < -300) {
      // Swipe left → next screen (loops via modulo)
      const nextIdx = (currentIdx + 1) % n;
      wasDraggedRef.current = true;
      isTransitioningRef.current = true;
      animationRef.current = animate(dragX, -width, {
        type: 'spring', stiffness: 280, damping: 30,
        onComplete: () => {
          isTransitioningRef.current = false;
          animationRef.current = null;
          dragX.set(0);
          setActiveTab(mainTabs[nextIdx]);
        }
      });
    } else if (offset > threshold || velocity > 300) {
      // Swipe right → previous screen (loops via modulo)
      const prevIdx = (currentIdx - 1 + n) % n;
      wasDraggedRef.current = true;
      isTransitioningRef.current = true;
      animationRef.current = animate(dragX, width, {
        type: 'spring', stiffness: 280, damping: 30,
        onComplete: () => {
          isTransitioningRef.current = false;
          animationRef.current = null;
          dragX.set(0);
          setActiveTab(mainTabs[prevIdx]);
        }
      });
    } else {
      // Below threshold — snap back
      isTransitioningRef.current = true;
      animationRef.current = animate(dragX, 0, {
        type: 'spring', stiffness: 280, damping: 30,
        onComplete: () => {
          isTransitioningRef.current = false;
          animationRef.current = null;
        }
      });
    }
  };

  const handleTouchEndOrCancel = () => {
    setTimeout(() => {
      if (!isTransitioningRef.current && Math.abs(dragX.get()) > 1) {
        console.warn("[ScreenCarousel] Stuck state detected! Snapping back to 0.");
        isTransitioningRef.current = true;
        if (animationRef.current) {
          animationRef.current.stop();
        }
        animationRef.current = animate(dragX, 0, {
          type: 'spring',
          stiffness: 280,
          damping: 30,
          onComplete: () => {
            isTransitioningRef.current = false;
            animationRef.current = null;
          }
        });
      }
    }, 100);
  };

  if (currentIdx === -1) return null;

  return (
    <div
      ref={containerRef}
      onTouchStart={() => {
        isTransitioningRef.current = false;
        if (animationRef.current) {
          animationRef.current.stop();
          animationRef.current = null;
        }
      }}
      onTouchEnd={handleTouchEndOrCancel}
      onTouchCancel={handleTouchEndOrCancel}
      onPointerDown={() => {
        isTransitioningRef.current = false;
        if (animationRef.current) {
          animationRef.current.stop();
          animationRef.current = null;
        }
      }}
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        overflow: 'hidden'
      }}
    >
      <motion.div
        onPanStart={handlePanStart}
        onPan={handlePan}
        onPanEnd={handlePanEnd}
        style={{
          x: dragX,
          display: 'block',
          width: '100%',
          height: '100%',
          position: 'relative',
          touchAction: 'pan-y' // Tells browser to handle vertical scroll, we handle horizontal pan
        }}
      >
        {mainTabs.map((tabId, i) => {
          const diff = getRelativeOffset(i, currentIdx, n);
          return (
            <div
              key={tabId}
              style={{
                position: 'absolute',
                left: `${diff * 100}%`,
                width: '100%',
                height: '100%',
                flexShrink: 0,
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              <ScreenErrorBoundary screenName={tabId} onGoHome={() => setActiveTab('Home')}>
                <Suspense fallback={<LoadingScreen />}>
                  {renderScreen(tabId)}
                </Suspense>
              </ScreenErrorBoundary>
            </div>
          );
        })}
      </motion.div>
    </div>
  );
}
