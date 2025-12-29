import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import { IMAGE_URL } from '../../shared/constants';
import axios from '../../shared/axios';
import { Item } from '../../shared/types';

interface NavigationItem {
  title: string;
  description: string;
  path: string;
  image?: string;
  fallbackImage: string;
  fetchQuery?: { region?: string; with_origin_country?: string; with_genres?: string };
}

interface DiverseNavigationProps {
  currentTab?: "movie" | "tv" | "sports";
}

const DiverseNavigation: React.FC<DiverseNavigationProps> = ({ currentTab = "movie" }) => {
  const [navigationItems, setNavigationItems] = useState<NavigationItem[]>([]);
  const [lastTab, setLastTab] = useState<string>("");

  useEffect(() => {
    const fetchImages = async () => {
      // Use the provided currentTab or fallback to localStorage/default
      const effectiveTab = (currentTab === "sports" ? "movie" : currentTab) as "movie" | "tv";

      // Prevent redundant fetches if tab hasn't actually changed (unless it's the first run)
      if (lastTab === effectiveTab && navigationItems.length > 0) return;
      setLastTab(effectiveTab);

      const baseItems: NavigationItem[] = [
        {
          title: "African Cinema",
          description: "Nollywood, South African, Kenyan & more",
          path: `/explore?region=africa&type=${effectiveTab}`,
          fallbackImage: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1280&h=720&fit=crop",
          fetchQuery: { with_origin_country: "NG|ZA|KE|GH|TZ|UG|ET|RW|ZM|EG" }
        },
        {
          title: "Asian Cinema",
          description: "Bollywood, Korean, Japanese, Chinese",
          path: `/explore?region=asia&type=${effectiveTab}`,
          fallbackImage: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1280&h=720&fit=crop",
          fetchQuery: { with_origin_country: "IN|KR|JP|CN" }
        },
        {
          title: "Latin American",
          description: "Mexican, Brazilian, Argentine cinema",
          path: `/explore?region=latin&type=${effectiveTab}`,
          fallbackImage: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1280&h=720&fit=crop",
          fetchQuery: { with_origin_country: "MX|BR|AR" }
        },
        {
          title: "Middle Eastern",
          description: "Turkish, Egyptian, Saudi cinema",
          path: `/explore?region=middleeast&type=${effectiveTab}`,
          fallbackImage: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1280&h=720&fit=crop",
          fetchQuery: { with_origin_country: "TR|EG|SA" }
        },
        {
          title: "Nollywood",
          description: "Movies from the Nollywood industry (Nigeria)",
          path: `/explore?region=nollywood&type=${effectiveTab}`,
          fallbackImage: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1280&h=720&fit=crop",
          fetchQuery: { with_origin_country: "NG" }
        },
        {
          title: "Bollywood",
          description: "Indian movies & TV shows",
          path: `/explore?region=bollywood&type=${effectiveTab}`,
          fallbackImage: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1280&h=720&fit=crop",
          fetchQuery: { with_origin_country: "IN" }
        },
        {
          title: "Filipino",
          description: "ABS-CBN, iWantTFC shows & films",
          path: `/explore?region=philippines&type=${effectiveTab}`,
          fallbackImage: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1280&h=720&fit=crop",
          fetchQuery: { with_origin_country: "PH" }
        },
        {
          title: "Kenyan",
          description: "Citizen, NTV, KTN, Showmax",
          path: `/explore?region=kenya&type=${effectiveTab}`,
          fallbackImage: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1280&h=720&fit=crop",
          fetchQuery: { with_origin_country: "KE" }
        }
      ];

      const updatedItems = await Promise.all(
        baseItems.map(async (item) => {
          if (!item.fetchQuery) return item;

          let foundImage: string | null = null;

          // Primary Source: TMDB Discover based on Current Tab
          const tryFetch = async (mediaType: "movie" | "tv") => {
            try {
              const response = await axios.get(`/discover/${mediaType}`, {
                params: {
                  with_origin_country: item.fetchQuery?.with_origin_country,
                  sort_by: 'popularity.desc',
                  page: 1,
                  'vote_count.gte': 5
                },
                timeout: 5000
              });
              const results: Item[] = response.data.results || [];
              const queryCountries = item.fetchQuery?.with_origin_country?.split('|') || [];

              // Filter strictly by country
              const filtered = results.filter((res: any) => {
                const countries = res.origin_country || [];
                return countries.some((c: string) => queryCountries.includes(c));
              });

              const itemsToCheck = filtered.length > 0 ? filtered : results;
              for (const res of itemsToCheck.slice(0, 10)) {
                if (res.backdrop_path) return `${IMAGE_URL}/w1280${res.backdrop_path}`;
                if (res.poster_path) return `${IMAGE_URL}/w500${res.poster_path}`;
              }
            } catch (e) {
              return null;
            }
            return null;
          };

          // 1. Try current tab type
          foundImage = await tryFetch(effectiveTab);

          // 2. Try opposite type if current fails
          if (!foundImage) {
            foundImage = await tryFetch(effectiveTab === "movie" ? "tv" : "movie");
          }

          const defaultImages: { [key: string]: string } = {
            'African Cinema': 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1280&h=720&fit=crop&q=80',
            'Asian Cinema': 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=1280&h=720&fit=crop&q=80',
            'Nollywood': 'https://images.unsplash.com/photo-1533488765986-df82625ee3fb?w=1280&h=720&fit=crop&q=80',
            'Bollywood': 'https://images.unsplash.com/photo-1514533212735-5df27d970db0?w=1280&h=720&fit=crop&q=80',
          };

          return {
            ...item,
            image: foundImage || defaultImages[item.title] || item.fallbackImage
          };
        })
      );

      setNavigationItems(updatedItems);
    };

    fetchImages();
  }, [currentTab]); // Re-fetch when tab changes

  return (
    <div className="py-8">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white mb-4">
          🌍 Discover World Cinema
        </h2>
        <p className="text-gray-400 text-lg">
          Explore movies and TV shows from around the world
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto px-4">
        {navigationItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className="group block"
          >
            <div className="relative h-48 rounded-xl overflow-hidden transform transition-all duration-300 hover:scale-105 hover:shadow-2xl border border-gray-700/50">
              {item.image && item.image !== 'undefined' && item.image.startsWith('http') ? (
                <>
                  <LazyLoadImage
                    src={item.image}
                    alt={item.title}
                    className="absolute inset-0 w-full h-full object-cover"
                    effect="blur"
                    placeholderSrc={item.fallbackImage}
                    onError={(e: any) => {
                      // If image fails, use fallback background
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      const parent = target.parentElement;
                      if (parent) {
                        parent.style.backgroundImage = `url(${item.fallbackImage})`;
                        parent.style.backgroundSize = 'cover';
                        parent.style.backgroundPosition = 'center';
                      }
                    }}
                  />
                  {/* Fallback background in case image fails */}
                  <div
                    className="absolute inset-0 w-full h-full bg-gradient-to-br from-primary/20 to-primary/40"
                    style={{
                      backgroundImage: `url(${item.fallbackImage})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      zIndex: -1
                    }}
                  />
                </>
              ) : (
                <div
                  className="absolute inset-0 w-full h-full bg-gradient-to-br from-primary/20 to-primary/40"
                  style={{
                    backgroundImage: item.fallbackImage ? `url(${item.fallbackImage})` : 'none',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                  }}
                >
                  {!item.fallbackImage && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-4xl opacity-50">{item.title.charAt(0)}</span>
                    </div>
                  )}
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/30"></div>
              <div className="absolute inset-0 p-6 flex flex-col justify-end text-white">
                <h3 className="text-xl font-bold mb-2">
                  {item.title}
                </h3>
                <p className="text-white/90 text-sm leading-relaxed mb-3">
                  {item.description}
                </p>
                <div className="flex items-center gap-2 text-white/80 text-sm">
                  <span>Explore Now</span>
                  <span className="ml-auto group-hover:translate-x-1 transition-transform">→</span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="text-center mt-8">
        <p className="text-gray-500 text-sm">
          Click on any category above to explore movies and TV shows from that region
        </p>
      </div>
    </div>
  );
};

export default DiverseNavigation;
