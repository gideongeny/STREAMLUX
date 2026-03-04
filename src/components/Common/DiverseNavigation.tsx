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

const DiverseNavigation: React.FC = () => {
  const [navigationItems, setNavigationItems] = useState<NavigationItem[]>([]);

  useEffect(() => {
    const fetchImages = async () => {
      // Get current tab from localStorage to determine default type
      const currentTab = (localStorage.getItem("currentTab") || "movie") as "movie" | "tv";
      
      const baseItems: NavigationItem[] = [
        {
          title: "African Cinema",
          description: "Nollywood, South African, Kenyan & more",
          path: `/explore?region=africa&type=${currentTab}`,
          fallbackImage: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1280&h=720&fit=crop",
          fetchQuery: { with_origin_country: "NG|ZA|KE|GH|TZ|UG|ET|RW|ZM|EG" }
        },
        {
          title: "Asian Cinema",
          description: "Bollywood, Korean, Japanese, Chinese",
          path: `/explore?region=asia&type=${currentTab}`,
          fallbackImage: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1280&h=720&fit=crop",
          fetchQuery: { with_origin_country: "IN|KR|JP|CN" }
        },
        {
          title: "Latin American",
          description: "Mexican, Brazilian, Argentine cinema",
          path: `/explore?region=latin&type=${currentTab}`,
          fallbackImage: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1280&h=720&fit=crop",
          fetchQuery: { with_origin_country: "MX|BR|AR" }
        },
        {
          title: "Middle Eastern",
          description: "Turkish, Egyptian, Saudi cinema",
          path: `/explore?region=middleeast&type=${currentTab}`,
          fallbackImage: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1280&h=720&fit=crop",
          fetchQuery: { with_origin_country: "TR|EG|SA" }
        },
        {
          title: "Nollywood",
          description: "Movies from the Nollywood industry (Nigeria)",
          path: `/explore?region=nollywood&type=${currentTab}`,
          fallbackImage: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1280&h=720&fit=crop",
          fetchQuery: { with_origin_country: "NG" }
        },
        {
          title: "Bollywood",
          description: "Indian movies & TV shows",
          path: `/explore?region=bollywood&type=${currentTab}`,
          fallbackImage: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1280&h=720&fit=crop",
          fetchQuery: { with_origin_country: "IN" }
        },
        {
          title: "Filipino",
          description: "ABS-CBN, iWantTFC shows & films",
          path: `/explore?region=philippines&type=${currentTab}`,
          fallbackImage: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1280&h=720&fit=crop",
          fetchQuery: { with_origin_country: "PH" }
        },
        {
          title: "Kenyan",
          description: "Citizen, NTV, KTN, Showmax",
          path: `/explore?region=kenya&type=${currentTab}`,
          fallbackImage: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1280&h=720&fit=crop",
          fetchQuery: { with_origin_country: "KE" }
        }
      ];

      const updatedItems = await Promise.all(
        baseItems.map(async (item) => {
          if (!item.fetchQuery) return item;
          
          let foundImage: string | null = null;
          
          // Try multiple sources with fallbacks - fetch popular content from the region/genre
          const sources = [
            // Source 1: Primary TMDB discover - get most popular from region (movies)
            async () => {
              try {
                const response = await axios.get('/discover/movie', {
                  params: {
                    with_origin_country: item.fetchQuery?.with_origin_country,
                    sort_by: 'popularity.desc',
                    page: 1,
                    'vote_count.gte': 5,
                    'vote_average.gte': 4.0
                  },
                  timeout: 8000
                });
                const movies: Item[] = response.data.results || [];
                // Filter to ensure origin_country matches - be strict about this
                const queryCountries = item.fetchQuery?.with_origin_country?.split('|') || [];
                const filteredMovies = movies.filter((movie: any) => {
                  const countries = movie.origin_country || [];
                  return countries.some((c: string) => queryCountries.includes(c));
                });
                // Try first 20 movies to find one with backdrop
                const moviesToCheck = filteredMovies.length > 0 ? filteredMovies : movies;
                for (const movie of moviesToCheck.slice(0, 20)) {
                  if (movie.backdrop_path && movie.backdrop_path !== 'null') {
                    const imageUrl = `${IMAGE_URL}/w1280${movie.backdrop_path}`;
                    // Verify image exists by checking if it's a valid URL
                    if (imageUrl.includes('image.tmdb.org')) {
                      return imageUrl;
                    }
                  }
                }
              } catch (e) {
                console.warn(`Error fetching movie image for ${item.title}:`, e);
                return null;
              }
              return null;
            },
            // Source 2: Try TV shows from same region
            async () => {
              try {
                const response = await axios.get('/discover/tv', {
                  params: {
                    with_origin_country: item.fetchQuery?.with_origin_country,
                    sort_by: 'popularity.desc',
                    page: 1,
                    'vote_count.gte': 5,
                    'vote_average.gte': 4.0
                  },
                  timeout: 8000
                });
                const shows: Item[] = response.data.results || [];
                // Filter to ensure origin_country matches
                const queryCountries = item.fetchQuery?.with_origin_country?.split('|') || [];
                const filteredShows = shows.filter((show: any) => {
                  const countries = show.origin_country || [];
                  return countries.some((c: string) => queryCountries.includes(c));
                });
                const showsToCheck = filteredShows.length > 0 ? filteredShows : shows;
                for (const show of showsToCheck.slice(0, 20)) {
                  if (show.backdrop_path && show.backdrop_path !== 'null') {
                    const imageUrl = `${IMAGE_URL}/w1280${show.backdrop_path}`;
                    if (imageUrl.includes('image.tmdb.org')) {
                      return imageUrl;
                    }
                  }
                }
              } catch (e) {
                console.warn(`Error fetching TV image for ${item.title}:`, e);
                return null;
              }
              return null;
            },
            // Source 3: Try trending from region
            async () => {
              try {
                const response = await axios.get('/trending/movie/day', {
                  params: { page: 1 },
                  timeout: 5000
                });
                const movies: Item[] = response.data.results || [];
                const queryCountries = item.fetchQuery?.with_origin_country?.split('|') || [];
                const filteredMovies = movies.filter((movie: any) => {
                  const countries = movie.origin_country || [];
                  return countries.some((c: string) => queryCountries.includes(c));
                });
                for (const movie of (filteredMovies.length > 0 ? filteredMovies : movies).slice(0, 10)) {
                  if (movie.backdrop_path && movie.backdrop_path !== 'null') {
                    const imageUrl = `${IMAGE_URL}/w1280${movie.backdrop_path}`;
                    if (imageUrl.includes('image.tmdb.org')) {
                      return imageUrl;
                    }
                  }
                }
              } catch (e) {
                return null;
              }
              return null;
            },
          ];

          // Try each source sequentially until we find a valid image
          for (const source of sources) {
            try {
              const imageUrl = await source();
              if (imageUrl && imageUrl !== 'undefined' && imageUrl.startsWith('http')) {
                // Verify the image URL is valid
                if (imageUrl.includes('image.tmdb.org') || imageUrl.includes('unsplash.com')) {
                  foundImage = imageUrl;
                  break; // Found a valid image, stop searching
                }
              }
            } catch (error) {
              // Continue to next source on error
              console.warn(`Error fetching image from source for ${item.title}:`, error);
            }
          }
          
          // If no image found from API, try to use a poster from a popular item
          if (!foundImage) {
            try {
              // Try to get at least one popular item to use its poster/backdrop
              const response = await axios.get('/discover/movie', {
                params: {
                  with_origin_country: item.fetchQuery?.with_origin_country,
                  sort_by: 'popularity.desc',
                  page: 1,
                },
                timeout: 5000
              });
              const movies = response.data.results || [];
              if (movies.length > 0) {
                const firstMovie = movies[0];
                if (firstMovie.backdrop_path) {
                  foundImage = `${IMAGE_URL}/w1280${firstMovie.backdrop_path}`;
                } else if (firstMovie.poster_path) {
                  foundImage = `${IMAGE_URL}/w500${firstMovie.poster_path}`;
                }
              }
            } catch (e) {
              // Ignore errors, will use fallback
            }
          }
          
          // If all sources fail, use category-specific default images
          const defaultImages: { [key: string]: string } = {
            'African Cinema': 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1280&h=720&fit=crop&q=80',
            'Asian Cinema': 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=1280&h=720&fit=crop&q=80',
            'Latin American': 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1280&h=720&fit=crop&q=80',
            'Middle Eastern': 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1280&h=720&fit=crop&q=80',
            'Nollywood': 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1280&h=720&fit=crop&q=80',
            'Bollywood': 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=1280&h=720&fit=crop&q=80',
            'Filipino': 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1280&h=720&fit=crop&q=80',
            'Kenyan': 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1280&h=720&fit=crop&q=80',
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
  }, []); // Only run once on mount

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
