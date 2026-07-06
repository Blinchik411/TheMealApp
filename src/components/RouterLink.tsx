import React from "react";

interface  RouterLinkProps extends Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> {
    to: string;
    children: React.ReactNode;
}

const RouterLink: React.FC<RouterLinkProps> = ({to, children, ...rest}) => {


    const handleClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
        event.preventDefault()
        window.history.pushState({}, '', to)
        window.dispatchEvent(new PopStateEvent('popstate'))
    }

    return (
        <a
            href={to}
            onClick={handleClick}
            {...rest}
        >
            {children}
        </a>
    )
}

export default RouterLink