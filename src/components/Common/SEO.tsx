import { FC, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";

interface SEOProps {
    title?: string;
    description?: string;
    keywords?: string;
    image?: string;
    url?: string;
    type?: string;
}

const SEO: FC<SEOProps> = ({
    title,
    description,
    keywords,
    image = "https://streamlux.vercel.app/og-image.jpg",
    url,
    type = "website",
}) => {
    const { pathname } = useLocation();
    const { t, i18n } = useTranslation();

    const siteName = "StreamLux";
    const defaultDescription = "StreamLux — The ultimate world-class destination for movies, TV shows, and live sports. Experience cinematic quality with high-speed streaming.";
    const defaultKeywords = "streaming, movies, tv shows, sports live, football highlights, ncaa, cinema, world class streaming";

    const seoTitle = title ? `${title} | ${siteName}` : `${siteName} | Free Movies, TV Shows & Sports`;
    const seoDescription = description || defaultDescription;
    const seoKeywords = keywords || defaultKeywords;
    const seoUrl = url || `https://streamlux.vercel.app${pathname}`;

    useEffect(() => {
        // Update Document Title
        document.title = seoTitle;

        // Update Meta Tags
        const updateMetaTag = (name: string, content: string, attr: string = "name") => {
            let element = document.querySelector(`meta[${attr}="${name}"]`);
            if (!element) {
                element = document.createElement("meta");
                element.setAttribute(attr, name);
                document.head.appendChild(element);
            }
            element.setAttribute("content", content);
        };

        updateMetaTag("description", seoDescription);
        updateMetaTag("keywords", seoKeywords);

        // Open Graph
        updateMetaTag("og:title", seoTitle, "property");
        updateMetaTag("og:description", seoDescription, "property");
        updateMetaTag("og:url", seoUrl, "property");
        updateMetaTag("og:type", type, "property");
        updateMetaTag("og:image", image, "property");
        updateMetaTag("og:site_name", siteName, "property");

        // Twitter
        updateMetaTag("twitter:card", "summary_large_image");
        updateMetaTag("twitter:title", seoTitle);
        updateMetaTag("twitter:description", seoDescription);
        updateMetaTag("twitter:image", image);

        // Canonical
        let canonical = document.querySelector('link[rel="canonical"]');
        if (!canonical) {
            canonical = document.createElement("link");
            canonical.setAttribute("rel", "canonical");
            document.head.appendChild(canonical);
        }
        canonical.setAttribute("href", seoUrl);

        // Update HTML Lang
        document.documentElement.lang = i18n.language;
        document.documentElement.dir = i18n.language === "ar" ? "rtl" : "ltr";

    }, [seoTitle, seoDescription, seoKeywords, seoUrl, image, type, i18n.language]);

    return null;
};

export default SEO;
