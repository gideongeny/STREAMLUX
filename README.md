)# StreamLux

Free Movies, TV Shows & Live Sports Streaming Platform

## Live demo

Official website: [https://streamlux.vercel.app/](https://streamlux.vercel.app/)

🔍 **Find us on Google:** Search for "StreamLux" or "StreamLux movies" on Google to discover our platform. The website is indexed and searchable on Google Search.

**Note:** The website has been rebranded from Moonlight Films to StreamLux. The project uses Firebase for authentication and data storage, and integrates with multiple APIs for content discovery.

## Content Sources

- **Movies & TV Shows:** The Movie Database (TMDB) API
- **Sports Data:** TheSportsDB API (free tier)
- **Streaming Links:** Multiple embed sources for movies, TV shows, and sports content

## Main technology used

- ReactJS, Typescript, TailwindCSS
- Redux-Toolkit
- React-Query, Axios
- Firebase
- Swiper
- React-AutoAnimate, React-Select, React-Toastify, React-Circular-Progressbar, React-Infinite-Scroll-Component, React-Lazy-Load-Image-Component, React-Icons, React-Router-Dom
- Formik, Yup

## Features

### Core Features
- **Well-designed homepage/detail/watching pages** with modern UI
- **Sort/filter** (query-params based) for movies, TV shows, and sports
- **Search by name** with suggestion keywords, filter result by type
- **Skeleton loading**, infinite scrolling, query-based pagination and smooth animation
- **Authentication** by email/password or Google/Facebook. Fully validated sign-up form
- **Bookmark favourite films**, store recently watched films. Allowing to edit films list: Select All -> Clear
- **Profile page**: allowing to change profile photo, name, email, password, verify, delete account after reauthentication
- **Comment system**: Allowing to give reactions, see who reacts to a comment (sorted and filter out the 3 most popular reactions), reply to a comment, edit, delete, hide, sort by latest/popular and load more comment

### New Features (StreamLux)
- **Live Sports Streaming**: Direct integration with SportsLive.run for live sports streaming (Note: Sports API temporarily disabled to ensure website stability)
- **World Cinema Discovery**: Explore movies and TV shows from Africa, Asia, Latin America, Middle East, and more with beautiful category images
- **Enhanced Content Categories**:
  - 🔥 Most Trending Now
  - 👻 Horror Movies
  - ✊🏿 Must-watch Black Shows & Movies
  - 🆕 Latest Nollywood Movies
  - 🇿🇦 SA Drama, 🇹🇭 Thai Drama, 🇨🇳 C-Drama
  - 🌍 African Cinema & TV Shows (comprehensive collection)
  - 📺 African TV Shows & Series (diverse content from multiple African countries)
  - 🇰🇪 Kenyan TV Shows, 🇳🇬 Nigerian TV Shows
  - And many more curated sections
- **Multiple Streaming Sources**: Access to various embed sources for movies, TV shows, and sports (including SportsLive.run, Streamed.pk, KissKH, Ailok, Googotv, Dramacool, Cuevana, Shahid, and many more regional platforms)
- **Real-time Sports Updates**: Live scores and upcoming fixtures (Note: Sports API temporarily disabled to prevent website crashes - will be re-enabled once stability issues are resolved)
- **Enhanced African Content**: Expanded fetching strategies with multiple pages and search terms for maximum content diversity
- **Responsive Design**: Optimized for mobile, tablet, and desktop
- **Copyright Page**: Comprehensive legal information and terms of use
- **Vercel Web Analytics**: Integrated analytics for performance monitoring and user insights
- **Performance Optimizations**: 
  - API request caching and rate limiting to prevent quota exceeded errors
  - Optimized Google services usage (Firebase Analytics, Google Fonts)
  - Background content loading for faster initial page loads
  - Reduced Firestore query operations
- **Enhanced Video Sources**: Comprehensive list of international streaming platforms with proper display names for better user experience
- **Direct Download Feature**: Download movies and TV shows directly to your device with a single click, similar to MovieBox.ph
- **Sports Integration**: Direct integration with SportsLive.run for live sports streaming and match details
- **Footer with Legal Pages**: Comprehensive footer including Contact Us, Privacy Policy, User Agreement, Disclaimer, and Backlinks sections
- **Error Boundaries**: Robust error handling with React Error Boundaries to prevent app crashes and provide graceful fallbacks
- **Cross-Platform Compatibility**: Optimized for iPhone, Android, and desktop browsers with polyfills for older devices
- **Google Search Optimized**: Website is indexed and discoverable via Google Search
- **Android App Available**: Download the StreamLux Android APK directly from our website, similar to MovieBox. See [BUILD_APK.md](./BUILD_APK.md) and [DISTRIBUTE_APK.md](./DISTRIBUTE_APK.md) for distribution instructions

## 📱 Android App

StreamLux is now available as a native Android app! Download the APK from [GitHub Releases](https://github.com/gideongeny/STREAMLUX/releases) and enjoy streaming on your Android device.

### Android App Screenshots

#### Movies Section
![StreamLux Android - Movies Section](![WhatsApp Image 2025-12-03 at 04 25 59_79b6a59f](https://github.com/user-attachments/assets/e015ce20-dce0-4da5-84eb-ddcab06609d7)
)
*Movies section featuring F1 movie banner, Popular section with Zootopia 2 and The Shadow's Edge. Clean dark theme with orange accents.*

#### TV Shows Section
![StreamLux Android - TV Shows Section](![WhatsApp Image 2025-12-03 at 04 25 59_04d2962f](https://github.com/user-attachments/assets/dffb0b8f-418f-49e8-8300-3b93d04186f5)
)
*TV Shows section showing "Heated Rivalry" featured content and Popular section with Stranger Things and IT: Welcome to Derry.*

#### Search Page
![StreamLux Android - Search Page](![WhatsApp Image 2025-12-03 at 04 25 59_c0380572](https://github.com/user-attachments/assets/0cabb2d0-2a7e-48dd-b7cd-5d89c2d6bef0)
)
*Beautiful search interface with anime-style illustration, featuring "Find your favourite movies, TV shows, people and more" with search bar.*

#### Sign In Page
![StreamLux Android - Sign In Page](![WhatsApp Image 2025-12-03 at 04 26 00_dc4a0d9d](https://github.com/user-attachments/assets/8bf949c8-9d81-42c9-97f8-356e275c59b6)
)
*Sign In page with Google and Facebook login options, email/password fields, and "Not a member? Sign Up" link.*

### Download Android App

- **GitHub Releases**: [Download APK](https://github.com/gideongeny/STREAMLUX/releases)
- **Installation Guide**: See [BUILD_APK.md](./BUILD_APK.md) for detailed instructions
- **Requirements**: Android 5.0+ with 50MB free space

## Screenshots, Preview

### Home Page
![Home Page - Breaking Bad Banner](https://raw.githubusercontent.com/gideongeny/STREAMLUX/main/Images/Screenshot%202025-12-01%20015602.png)
*Home page featuring TV Shows, Movies, and Sports tabs. Shows Breaking Bad banner with watch/download options, popular content slider, and trending sidebar.*

### Account Settings / Profile Page  
![Account Settings Page](https://raw.githubusercontent.com/gideongeny/STREAMLUX/main/Images/Screenshot%202025-12-01%20015701.png)
*Account Settings page showing user information section with email and name fields, change password option, profile photo upload, and delete account button. Left sidebar navigation with Profile highlighted.*

### Sign In Page  
![Sign In Page](https://raw.githubusercontent.com/gideongeny/STREAMLUX/main/Images/Screenshot%202025-12-01%20015724.png)
*Sign In To StreamLux page with Google and Facebook login buttons, email/password input fields, and "Not a member? Sign Up" link.*

### Explore Page  
![Explore Movies & TV Shows](https://raw.githubusercontent.com/gideongeny/STREAMLUX/main/Images/Screenshot%202025-12-01%20015841.png)
*Explore Movies & TV Shows page with Movies/TV Shows tabs, sort dropdown (Most popular), genre filters, and grid layout showing various movies and TV shows including Stranger Things, IT: Welcome to Derry, Supernatural, Law & Order: SVU, Tulsa King, Grey's Anatomy, and The Simpsons.*

### TV Show Detail Page - Stranger Things  
![TV Show Detail - Stranger Things](https://raw.githubusercontent.com/gideongeny/STREAMLUX/main/Images/Screenshot%202025-12-01%20015639.png)
*TV Show Detail Page for Stranger Things showing banner with "WELCOME TO HAWKINS" sign, genres (SCI-FI & FANTASY, MYSTERY, ACTION & ADVENTURE), WATCH and Download buttons, poster image, rating (8.6), story section, details (Status: Returning Series, Last air date, Spoken language), media trailers section, and similar content sidebar.*

### Sports Page - NBA Live Games  
![Sports Page - NBA Live Games](https://raw.githubusercontent.com/gideongeny/STREAMLUX/main/Images/Screenshot%202025-12-01%20015811.png)
*Sports page showing NBA live games with team logos, scores, fan voting predictions with percentages and progress bars. Displays upcoming games including LA Lakers vs New Orleans Pelicans, Sacramento Kings vs Memphis Grizzlies, Minnesota Timberwolves vs San Antonio Spurs, New York Knicks vs Toronto Raptors, and Cleveland Cavaliers vs Boston Celtics.*

## Project Timeline

- **Original Development**: July 2, 2024 to August 9, 2025
- **Rebranded to StreamLux**: 2025
- **Current Version**: StreamLux v2.0 with enhanced features

## How to clone this project

You have to create an account on the website: https://www.themoviedb.org/ to get the API KEY. You then create a file named ".env" in your root project folder.

In that file, assign the API KEY that you get from the previous step to a variable named REACT_APP_API_KEY (it has to be this specific name).

It looks like this:
REACT_APP_API_KEY = a8a6fa2f944128e971223235bc3cxxxxx

## Tech Stack

- **Frontend Framework**: React 18+ with TypeScript
- **Styling**: TailwindCSS
- **State Management**: Redux Toolkit
- **Data Fetching**: React Query (TanStack Query), Axios
- **Authentication**: Firebase Auth
- **Database**: Firebase Firestore
- **Analytics**: Vercel Web Analytics, Firebase Analytics (optimized)
- **UI Components**: Swiper, React-AutoAnimate, React-Select, React-Toastify
- **Routing**: React Router DOM v6
- **Image Optimization**: React-Lazy-Load-Image-Component
- **Form Handling**: Formik, Yup
- **Icons**: React-Icons
- **Caching**: LRU Cache for API responses
- **Performance**: Rate limiting, request batching, background loading

## Deployment

This project is deployed on Vercel. The build process uses:
- Node.js 24.x (auto-upgraded from engines requirement)
- npm with `--force --legacy-peer-deps --no-optional` flags
- Create React App build system

## Performance & Optimization

### API Optimization
- **Caching**: LRU cache implementation for API responses (15-minute default TTL)
- **Rate Limiting**: Built-in rate limiting (30 requests/minute) to prevent quota exceeded errors
- **Request Batching**: Content fetched in batches to reduce concurrent API calls
- **Background Loading**: Non-critical content loads in the background for faster initial page loads

### Google Services Optimization
- **Firebase Analytics**: Conditionally initialized only in production, with automatic disable on quota errors
- **Google Fonts**: Optimized with `preconnect`, `dns-prefetch`, and `font-display: swap`
- **Firestore Queries**: Optimized to use `getDoc` instead of `getDocs` where possible to reduce read operations

### Content Fetching
- **Multi-Source Integration**: Fetches from TMDB, FZMovies, KissKH, Ailok, Googotv, and other custom sources
- **Regional Content**: Enhanced filtering for African, Asian, Latin American, and Middle Eastern content
- **Parallel Fetching**: Uses `Promise.all` for concurrent API requests where appropriate

## Additional Features

### Direct Download
- **One-Click Download**: Download movies and TV shows directly to your device
- **Smart Download Page**: Automatically attempts to extract video URLs from embed sources
- **Multiple Download Options**: Choose from various video sources and quality options
- **Progress Tracking**: Real-time download progress and status updates

### Sports Integration
- **SportsLive.run Integration**: Direct links to live sports matches and upcoming games
- **Match Details**: Click any game to view detailed match information on SportsLive.run
- **Live Scores**: Real-time updates for ongoing matches (Note: Sports API temporarily disabled to ensure website stability)
- **Multiple Leagues**: Support for NBA, EPL, La Liga, Bundesliga, Serie A, and more
- **Status**: Sports API calls are currently disabled to prevent website crashes. Users are redirected to SportsLive.run for live sports content.

### Legal & Compliance
- **Privacy Policy**: Comprehensive privacy policy page
- **User Agreement**: Terms of service and user agreement
- **Disclaimer**: Content disclaimer and copyright information
- **Contact Information**: Social media links and contact options in footer

### Browser Compatibility
- **iPhone Support**: Fully optimized for iOS devices with proper viewport settings
- **Android Support**: Compatible with older Android devices (Android 5+)
- **Desktop Browsers**: Works on all modern browsers (Chrome, Firefox, Safari, Edge)
- **Polyfills**: Includes polyfills for older browser compatibility

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Search & Discovery

🔍 **Find StreamLux on Google:**
- Search for "StreamLux" to find our platform
- Search for "StreamLux movies" or "StreamLux TV shows" for content discovery
- Search for "StreamLux sports" for live sports streaming
- The website is fully indexed and optimized for Google Search

**Access the website:**
- Direct URL: [https://streamlux.vercel.app/](https://streamlux.vercel.app/)

## License

Copyright © 2025 StreamLux. All rights reserved.

See [Copyright Page](/copyright) for more information.

**Legal Pages:**
- [Privacy Policy](/privacy-policy)
- [User Agreement](/user-agreement)
- [Disclaimer](/disclaimer)

---

### 👉 If you like this project, give it a star ✨ and share 👨🏻‍💻 it to your friends 👈
