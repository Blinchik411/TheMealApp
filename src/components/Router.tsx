import React, {useEffect, useState} from "react";

interface RouteParams {
    [key: string]: string;
}

interface PageProps {
    params: RouteParams;
}

type PageComponent = React.ComponentType<PageProps>;

interface RouterProps {
    routes: {
        [routePattern: string]: PageComponent;
    };
}

const mathPath = (path:string, route:string): RouteParams | null => {
    const pathParts = path.split('/')
    const routePaths = route.split('/')

    if (pathParts.length !== routePaths.length) {
        return null
    }

    const params: RouteParams = {};

    for (let i = 0; i < routePaths.length; i++) {
        if(routePaths[i].startsWith(':')) {
            const paramName = routePaths[i].slice(1)

            params[paramName] = pathParts[i]
        } else if (routePaths[i] !== pathParts[i]) {
            return null
        }
    }

    return params
}

export const useRoute = () => {

    const [path, setPath] = useState<string>(window.location.pathname)


    useEffect(() => {
        const onLocationChange = () => {
            setPath(window.location.pathname)
        }

        window.addEventListener('popstate', onLocationChange)

        return () => {
            window.removeEventListener('popstate', onLocationChange)
        }
    }, [])

    return path

}

const Router: React.FC<RouterProps> = ({routes}) => {

    const path = useRoute()

    for (const route in routes) {
        const params = mathPath(path, route)

        if (params) {
            const Page = routes[route]

            return <Page params={params}/>
        }
    }

    const NotFound = routes['*']

    return <NotFound params={{}}/>


}

export default Router