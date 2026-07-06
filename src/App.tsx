import Home from './pages/Home/Home.tsx';
import Router from "./components/Router.tsx";
import MealDetails from "./pages/MealDetails/components/MealDetails.tsx";
import {FavoritesProvider} from "./components/FavoritesContext.tsx";
import Favorites from "./pages/Favorites/Favorites.tsx";
import Header from "./components/Header.tsx";


const routes = {
    '/': Home,
    '/meal/:id': MealDetails,
    '/favorites': Favorites,
    '*': () => <div>404 page not found </div>,
}

const App = () => {

    return (
        <FavoritesProvider>
            <Header />
            <main className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <Router routes={routes}/>
            </main>
        </FavoritesProvider>
    );
}

export default App


