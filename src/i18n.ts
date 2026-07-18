import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { safeStorage } from "./utils/safeStorage";

// Deeply Customized Multi-Language Support
const resources = {
    en: {
        translation: {
            "Home": "Home", "Explore": "Explore", "History": "History", "Search": "Search", "Settings": "Settings", "Movies": "Movies", "TV Shows": "TV Shows", "Trending": "Trending", "Popular": "Popular",
            "Top Rated": "Top Rated", "New Releases": "New Releases", "Recommended": "Recommended", "Continue Watching": "Continue Watching", "You might like": "You might like", "Select Server": "Select Server",
            "Switch Server": "Switch Server", "Download": "Download", "Seasons": "Seasons", "Episodes": "Episodes", "Cast": "Cast", "Reviews": "Reviews", "Similar": "Similar", "Genre": "Genre", "Year": "Year",
            "Sort By": "Sort By", "Language": "Language", "Sign In": "Sign In", "Sign Up": "Sign Up", "Logout": "Logout", "MENU": "MENU", "GENRES": "GENRES", "PERSONAL": "PERSONAL", "GENERAL": "GENERAL",
            "Bookmarked": "Bookmarked", "Watchlist": "Watchlist", "Library": "Library", "My Library": "My Library", "Sign in to access": "Sign in to access", "Sign in to access bookmarks": "Sign in to access bookmarks",
            "Sign in to access library": "Sign in to access library", "Sign in to access history": "Sign in to access history", "Sign in to access profile": "Sign in to access profile", "Vision AI: Cast Identification": "Vision AI: Cast Identification",
            "Vision Cast": "Vision Cast", "Cinema Mode": "Cinema Mode", "Enter Cinema Mode": "Enter Cinema Mode", "Exit Cinema Mode": "Exit Cinema Mode", "Immersive Fullscreen": "Immersive Fullscreen",
            "Exit Fullscreen": "Exit Fullscreen", "Magic Menu": "Magic Menu", "Switch to Clean Source": "Switch to Clean Source", "Skip Ad": "Skip Ad", "Retry": "Retry", "Try Next Source": "Try Next Source",
            "No video sources available.": "No video sources available.", "Playback failed for": "Playback failed for", "Streaming": "Streaming", "Select Source": "Select Source", "Tell Vision": "Tell Vision",
            "Arena Dashboard": "Arena Dashboard", "Live Now": "Live Now", "Upcoming": "Upcoming", "Replays & Clips": "Replays & Clips", "Elite Football Highlights": "Elite Football Highlights",
            "Pro Wrestling Highlights": "Pro Wrestling Highlights", "Combat Sports": "Combat Sports", "Sports Documentaries": "Sports Documentaries", "Historical Match Replays": "Historical Match Replays",
            "No Events Found": "No Events Found", "Try another competition": "Try another competition", "Your destination for free movies, TV shows, and live sports streaming.": "Your destination for free movies, TV shows, and live sports streaming.",
            "Discover world cinema from around the globe.": "Discover world cinema from around the globe.", "Quick Links": "Quick Links", "Legal": "Legal", "Contact Us": "Contact Us", "Privacy Policy": "Privacy Policy",
            "User Agreement": "User Agreement", "Disclaimer": "Disclaimer", "Copyright": "Copyright", "Backlinks & Partners": "Backlinks & Partners", "Download App": "Download App",
            "footer_disclaimer": "All content on this page is provided for testing and demonstration purposes only. We do not store, record, or upload any content ourselves.", "Made with ❤️ for movie and TV show enthusiasts worldwide": "Made with ❤️ for movie and TV show enthusiasts worldwide",
            "NCAA Collegiate Specials": "NCAA Collegiate Specials", "Experience sports in ultra-high definition. From the Premier League to the UFC octagon, witness every legendary moment in real-time.": "Experience sports in ultra-high definition. From the Premier League to the UFC octagon, witness every legendary moment in real-time.",
            "Sports": "Sports", "Action": "Action", "Adventure": "Adventure", "Animation": "Animation", "Comedy": "Comedy", "Crime": "Crime", "Documentary": "Documentary", "Drama": "Drama", "Family": "Family", "Fantasy": "Fantasy",
            "History": "History", "Horror": "Horror", "Music": "Music", "Mystery": "Mystery", "Romance": "Romance", "Sci-Fi": "Sci-Fi", "Thriller": "Thriller", "War": "War", "Western": "Western", "African Cinema": "African Cinema", 
            "Asian Cinema": "Asian Cinema", "Latin American": "Latin American", "Middle East TV": "Middle East TV", "Latin TV Series": "Latin TV Series", "Check for Updates": "Check for Updates", "Visit Website": "Visit Website",
            "Find us on Google": "Find us on Google", "Profile": "Profile", "Downloads": "Downloads", "African Originals": "African Originals", "Nollywood Movies": "Nollywood Movies", "Bollywood Movies": "Bollywood Movies",
            "British & European TV": "British & European TV", "K-Dramas & Korean Cinema": "K-Dramas & Korean Cinema", "Anime & J-Dramas": "Anime & J-Dramas"
        }
    },
    es: {
        translation: {
            "Home": "Inicio", "Explore": "Explorar", "History": "Historial", "Search": "Buscar", "Settings": "Ajustes", "Movies": "Películas", "TV Shows": "Series", "Trending": "Tendencias", "Popular": "Popular",
            "Top Rated": "Mejor Valoradas", "New Releases": "Nuevos Lanzamientos", "Recommended": "Recomendado", "Continue Watching": "Continuar Viendo", "You might like": "Te podría gustar", "Select Server": "Seleccionar Servidor",
            "Switch Server": "Cambiar Servidor", "Download": "Descargar", "Seasons": "Temporadas", "Episodes": "Episodios", "Cast": "Reparto", "Reviews": "Reseñas", "Similar": "Similares", "Genre": "Género", "Year": "Año",
            "Sort By": "Ordenar Por", "Language": "Idioma", "GENRES": "GÉNEROS", "MENU": "MENÚ", "PERSONAL": "PERSONAL", "GENERAL": "GENERAL", "Sports": "Deportes", "Action": "Acción", "Adventure": "Aventura", "Animation": "Animación",
            "Comedy": "Comedia", "Crime": "Crimen", "Documentary": "Documental", "Drama": "Drama", "Family": "Familia", "Fantasy": "Fantasía", "History": "Historia", "Horror": "Terror", "Music": "Música", "Mystery": "Misterio",
            "Romance": "Romance", "Sci-Fi": "Ciencia Ficción", "Thriller": "Suspenso", "War": "Guerra", "Western": "Wéstern", "Latin TV Series": "Series de TV Latinas", "Middle East TV": "TV del Medio Oriente",
            "Latin American": "Latinoamérica", "African Cinema": "Cine Africano", "Asian Cinema": "Cine Asiático", "Sign In": "Iniciar sesión", "Sign Up": "Registrarse", "Logout": "Cerrar sesión", "Check for Updates": "Buscar actualizaciones",
            "Visit Website": "Visitar sitio web", "Find us on Google": "Encuentranos en Google", "Profile": "Perfil", "Downloads": "Descargas", "Sign in to access": "Inicia sesión para acceder", "Bookmarked": "Guardados", "Watchlist": "Lista",
            "African Originals": "Originales Africanos", "Nollywood Movies": "Películas de Nollywood", "Bollywood Movies": "Películas Indias", "British & European TV": "TV Británica y Europea", "K-Dramas & Korean Cinema": "K-Dramas", "Anime & J-Dramas": "Anime y J-Dramas"
        }
    },
    fr: {
        translation: {
            "Home": "Accueil", "Explore": "Explorer", "History": "Historique", "Search": "Recherche", "Settings": "Paramètres", "Movies": "Films", "TV Shows": "Séries", "Trending": "Tendances", "Popular": "Populaire",
            "Top Rated": "Mieux Notés", "New Releases": "Nouveautés", "Recommended": "Recommandé", "Continue Watching": "Reprendre", "You might like": "Vous pourriez aimer", "Select Server": "Choisir Serveur",
            "Switch Server": "Changer Serveur", "Download": "Télécharger", "Seasons": "Saisons", "Episodes": "Épisodes", "Cast": "Distribution", "Reviews": "Avis", "Similar": "Similaire", "Genre": "Genre", "Year": "Année",
            "Sort By": "Trier Par", "Language": "Langue", "GENRES": "GENRES", "MENU": "MENU", "PERSONAL": "PERSONNEL", "GENERAL": "GÉNÉRAL", "Sports": "Sports", "Action": "Action", "Adventure": "Aventure", "Animation": "Animation",
            "Comedy": "Comédie", "Crime": "Crime", "Documentary": "Documentaire", "Drama": "Drame", "Family": "Famille", "Fantasy": "Fantaisie", "History": "Histoire", "Horror": "Horreur", "Music": "Musique", "Mystery": "Mystère",
            "Romance": "Romance", "Sci-Fi": "Science-Fiction", "Thriller": "Thriller", "War": "Guerre", "Western": "Western", "Latin TV Series": "Séries TV Latines", "Middle East TV": "TV du Moyen-Orient",
            "Latin American": "Amérique Latine", "African Cinema": "Cinéma Africain", "Asian Cinema": "Cinéma Asiatique", "Sign In": "Connexion", "Sign Up": "S'inscrire", "Logout": "Déconnexion", "Check for Updates": "Vérifier les MAJ",
            "Visit Website": "Visiter le site Web", "Find us on Google": "Retrouvez-nous", "Profile": "Profil", "Downloads": "Téléchargements", "Sign in to access": "Connectez-vous", "Bookmarked": "Favoris", "Watchlist": "Liste",
            "African Originals": "Originaux Africains", "Nollywood Movies": "Films Nollywood", "Bollywood Movies": "Films Bollywood", "British & European TV": "TV Britannique et Européenne", "K-Dramas & Korean Cinema": "K-Dramas", "Anime & J-Dramas": "Anime et J-Dramas"
        }
    },
    sw: {
        translation: {
            "Home": "Nyumbani", "Explore": "Gundua", "History": "Historia", "Search": "Tafuta", "Settings": "Mipangilio", "Movies": "Filamu", "TV Shows": "Vipindi vya TV", "Trending": "Zinazovuma", "Popular": "Maarufu",
            "Top Rated": "Zilizopewa Alama za Juu", "New Releases": "Matoleo Mapya", "Recommended": "Unapendekezwa", "Continue Watching": "Endelea Kutazama", "You might like": "Unaweza kupenda", "Download": "Pakua",
            "GENRES": "AINA", "MENU": "MENYU", "PERSONAL": "BINAFSI", "GENERAL": "UJUMLA", "Sports": "Michezo", "Action": "Hatua", "Adventure": "Matukio", "Animation": "Uhuishaji", "Comedy": "Vichekesho", "Crime": "Uhalifu",
            "Documentary": "Hati", "Drama": "Tamthilia", "Family": "Familia", "Fantasy": "Ndoto", "History": "Historia", "Horror": "Kutisha", "Music": "Muziki", "Mystery": "Siri", "Romance": "Mapenzi", "Sci-Fi": "Sayansi",
            "Sign In": "Ingia", "Sign Up": "Jisajili", "Logout": "Ondoka", "Check for Updates": "Angalia Sasisho", "Visit Website": "Tembelea Tovuti", "Find us on Google": "Tutafute Google", "Profile": "Profaili", "Downloads": "Vipakuliwa",
            "Sign in to access": "Ingia ili kufikia", "African Cinema": "Sinema za Afrika", "Asian Cinema": "Sinema za Asia", "Latin American": "Amerika Kusini", "Bookmarked": "Vialamisho", "Watchlist": "Orodha"
        }
    },
    ar: {
        translation: {
            "Home": "الرئيسية", "Explore": "اكتشف", "History": "السجل", "Search": "بحث", "Settings": "إعدادات", "Movies": "أفلام", "TV Shows": "مسلسلات", "Trending": "شائع", "Popular": "رائج",
            "Top Rated": "الأعلى تقييماً", "New Releases": "إصدارات جديدة", "Recommended": "موصى به", "Continue Watching": "متابعة المشاهدة", "Download": "تحميل", "GENRES": "الأنواع", "MENU": "القائمة",
            "PERSONAL": "شخصي", "GENERAL": "عام", "Sports": "رياضة", "Action": "أكشن", "Adventure": "مغامرة", "Animation": "انمي", "Comedy": "كوميديا", "Crime": "جريمة", "Documentary": "وثائقي", "Drama": "دراما",
            "Family": "عائلي", "Fantasy": "خيال", "History": "تاريخ", "Horror": "رعب", "Music": "موسيقى", "Sign In": "دخول", "Sign Up": "تسجيل", "Logout": "خروج", "Check for Updates": "تحديث", "Profile": "حساب",
            "Sign in to access": "تسجيل الدخول", "African Cinema": "أفريقيا", "Asian Cinema": "آسيا", "Latin American": "لاتينية", "Downloads": "تحميلات", "Bookmarked": "المفضلة", "Watchlist": "القائمة"
        }
    },
    hi: {
        translation: {
            "Home": "होम", "Explore": "खोजें", "History": "इतिहास", "Search": "सर्च", "Settings": "सेटिंग्स", "Movies": "फिल्में", "TV Shows": "टीवी शो", "Trending": "ट्रेंडिंग", "Popular": "लोकप्रिय",
            "Top Rated": "टॉप रेटेड", "GENRES": "शैलियां", "MENU": "मेन्यू", "PERSONAL": "व्यक्तिगत", "GENERAL": "सामान्य", "Sports": "खेल", "Action": "एक्शन", "Adventure": "एडवेंचर", "Animation": "एनिमेशन",
            "Comedy": "कॉमेडी", "Crime": "क्राइम", "Documentary": "डॉक्यूमेंट्री", "Drama": "ड्रामा", "Family": "परिवार", "Fantasy": "फैंटेसी", "Horror": "डरावनी", "Sign In": "साइन इन", "Sign Up": "साइन अप", "Logout": "लॉग आउट"
        }
    },
    id: {
        translation: {
            "Home": "Beranda", "Explore": "Jelajahi", "History": "Riwayat", "Search": "Cari", "Settings": "Pengaturan", "Movies": "Film", "TV Shows": "Acara TV", "Trending": "Tren", "Popular": "Populer",
            "Top Rated": "Teratas", "GENRES": "GENRE", "MENU": "MENU", "PERSONAL": "PRIBADI", "GENERAL": "UMUM", "Sports": "Olahraga", "Action": "Aksi", "Adventure": "Petualangan", "Animation": "Animasi",
            "Comedy": "Komedi", "Crime": "Kriminal", "Documentary": "Dokumenter", "Drama": "Drama", "Family": "Keluarga", "Horror": "Horor", "Sign In": "Masuk", "Sign Up": "Daftar", "Logout": "Keluar"
        }
    },
    pt: {
        translation: {
            "Home": "Início", "Explore": "Explorar", "History": "Histórico", "Search": "Pesquisar", "Settings": "Configurações", "Movies": "Filmes", "TV Shows": "Séries", "Trending": "Tendências", 
            "Popular": "Popular", "Top Rated": "Mais Votados", "GENRES": "GÊNEROS", "MENU": "MENU", "PERSONAL": "PESSOAL", "GENERAL": "GERAL", "Sports": "Esportes", "Action": "Ação", "Adventure": "Aventura",
            "Animation": "Animação", "Comedy": "Comédia", "Crime": "Crime", "Documentary": "Documentário", "Drama": "Drama", "Family": "Família", "Horror": "Terror", "Sign In": "Entrar", "Sign Up": "Registrar", "Logout": "Sair"
        }
    },
    tl: {
        translation: {
            "Home": "Home", "Explore": "Galugarin", "History": "Kasaysayan", "Search": "Maghanap", "Settings": "Settings", "Movies": "Pelikula", "TV Shows": "TV Shows", "GENRES": "MGA GENRE", "MENU": "MENU",
            "PERSONAL": "PERSONAL", "GENERAL": "PANGKALAHATAN", "Sports": "Sports", "Action": "Aksyon", "Adventure": "Pakikipagsapalaran", "Animation": "Aнимаyon", "Comedy": "Komedya", "Crime": "Krimen",
            "Documentary": "Dokumentaryo", "Drama": "Drama", "Sign In": "Mag-sign In", "Sign Up": "Mag-sign Up", "Logout": "Mag-logout"
        }
    },
    ur: {
        translation: {
            "Home": "ہوم", "Explore": "دریافت", "History": "تاریخ", "Search": "تلاش", "Settings": "ترتیبات", "Movies": "فلمیں", "TV Shows": "ٹی وی شوز", "GENRES": "اصناف", "MENU": "مینو", "PERSONAL": "ذاتی", 
            "GENERAL": "عام", "Sports": "کھیل", "Action": "ایکشن", "Adventure": "ایڈونچر", "Animation": "اینیمیشن", "Comedy": "کامیڈی", "Crime": "جرم", "Drama": "ڈرامہ", "Sign In": "لاگ ان", "Logout": "لاگ آؤٹ"
        }
    },
    zh: {
        translation: {
            "Home": "首页", "Explore": "探索", "History": "历史", "Search": "搜索", "Settings": "设置", "Movies": "电影", "TV Shows": "剧集", "GENRES": "类型", "MENU": "菜单", "PERSONAL": "个人", "GENERAL": "常规",
            "Sports": "体育", "Action": "动作", "Adventure": "冒险", "Animation": "动画", "Comedy": "喜剧", "Crime": "犯罪", "Documentary": "纪录片", "Drama": "剧情", "Family": "家庭", "Horror": "恐怖", "Sign In": "登录", "Logout": "登出"
        }
    },
    vi: {
        translation: {
            "Home": "Trang Chủ", "Explore": "Khám Phá", "History": "Lịch Sử", "Search": "Tìm Kiếm", "Settings": "Cài Đặt", "Movies": "Phim", "TV Shows": "Truyền Hình", "GENRES": "THỂ LOẠI", "MENU": "MENU", 
            "PERSONAL": "CÁ NHÂN", "GENERAL": "CHUNG", "Sports": "Thể thao", "Action": "Hành động", "Adventure": "Phiêu lưu", "Animation": "Hoạt hình", "Comedy": "Hài hước", "Crime": "Tội phạm", "Drama": "Chính kịch", "Sign In": "Đăng Nhập"
        }
    },
    ja: {
        translation: {
            "Home": "ホーム", "Explore": "見つける", "History": "履歴", "Search": "検索", "Settings": "設定", "Movies": "映画", "TV Shows": "テレビ番組", "GENRES": "ジャンル", "MENU": "メニュー", "PERSONAL": "個人", "GENERAL": "一般",
            "Sports": "スポーツ", "Action": "アクション", "Adventure": "アドベンチャー", "Animation": "アニメ", "Comedy": "コメディ", "Crime": "犯罪", "Documentary": "ドキュメンタリー", "Drama": "ドラマ", "Sign In": "ログイン"
        }
    },
    ru: {
        translation: {
            "Home": "Главная", "Explore": "Обзор", "History": "История", "Search": "Поиск", "Settings": "Настройки", "Movies": "Фильмы", "TV Shows": "Сериалы", "GENRES": "ЖАНРЫ", "MENU": "МЕНЮ", "PERSONAL": "ЛИЧНОЕ", "GENERAL": "ОБЩЕЕ",
            "Sports": "Спорт", "Action": "Боевик", "Adventure": "Приключения", "Animation": "Анимация", "Comedy": "Комедия", "Crime": "Криминал", "Documentary": "Документальный", "Drama": "Драма", "Sign In": "Войти"
        }
    },
    de: {
        translation: {
            "Home": "Startseite", "Explore": "Entdecken", "History": "Verlauf", "Search": "Suche", "Settings": "Einstellungen", "Movies": "Filme", "TV Shows": "Serien", "GENRES": "GENRES", "MENU": "MENÜ", "PERSONAL": "PERSÖNLICH", "GENERAL": "ALLGEMEIN",
            "Sports": "Sport", "Action": "Action", "Adventure": "Abenteuer", "Animation": "Animation", "Comedy": "Komödie", "Crime": "Krimi", "Documentary": "Dokumentarfilm", "Drama": "Drama", "Sign In": "Anmelden"
        }
    }
};

i18n
    .use(initReactI18next)
    .init({
        resources,
        lng: safeStorage.get("streamlux_language") || "en", // Load from storage
        fallbackLng: "en",
        interpolation: {
            escapeValue: false
        }
    });

export default i18n;
