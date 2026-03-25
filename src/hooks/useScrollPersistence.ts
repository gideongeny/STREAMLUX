import { useEffect, useLayoutEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * Hook to persist and restore scroll position for a specific page.
 * Useful for maintaining position on the Home page when returning from detail pages.
 */
export const useScrollPersistence = (key: string, isDataLoaded: boolean = true) => {
    const location = useLocation();
    const storageKey = `scroll_pos_${key}`;

    // Save scroll position before leaving or on scroll
    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 0) {
                sessionStorage.setItem(storageKey, window.scrollY.toString());
            }
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, [storageKey]);

    // Restore scroll position once data is loaded
    useLayoutEffect(() => {
        if (isDataLoaded) {
            const savedPosition = sessionStorage.getItem(storageKey);
            if (savedPosition) {
                // Use a small timeout to ensure DOM has settled
                const timeoutId = setTimeout(() => {
                    window.scrollTo({
                        top: parseInt(savedPosition),
                        behavior: "auto"
                    });
                }, 100);
                return () => clearTimeout(timeoutId);
            }
        }
    }, [isDataLoaded, storageKey]);
};
