import React from 'react';
import RouterLink from './RouterLink';
import { useFavorites } from './FavoritesContext.tsx';

const Header: React.FC = () => {
    const { favorites } = useFavorites();


    return (
        <header className='bg-white border-b border-gray-100 py-4 px-6 flex items-center justify-between sticky top-0 z-50 backdrop-blur-md '>
            <div>
                <RouterLink
                    className="flex items-center gap-6 text-2xl font-bold text-gray-600 hover:text-gray-900 transition-colors duration-200"
                    to="/"
                >
                    🍳 Recipe Catalog
                </RouterLink>
            </div>

            <nav>
                <RouterLink
                    to="/favorites"
                    className="flex items-center gap-2 text-xl font-bold text-gray-600 hover:text-gray-900 transition-colors duration-200"
                >
                    <span>Favorites</span>
                    {favorites.length > 0 && (
                        <span className="flex items-center justify-center bg-red-100 text-red-700 text-sm font-semibold min-w-[30px] h-7 px-1 rounded-full border border-red-100">
            {favorites.length}
        </span>
                    )}
                </RouterLink>
            </nav>
        </header>
    );
};

export default Header;