import React, { memo } from 'react'
import useBreadcrumbs from "use-react-router-breadcrumbs";
import { Link } from 'react-router-dom'
import icons from '../../utils/icons';

const { IoIosArrowForward } = icons
const Breadcrumb = ({ title, category }) => {
    const routes = [
        { path: "/:category", breadcrumb: category },
        { path: "/", breadcrumb: "Home" },
        { path: "/:category/:pid/:title", breadcrumb: title },

    ];

    const breadcrumb = useBreadcrumbs(routes);
    // console.log(breadcrumb)
    return (
        <div className='text-sm flex items-center'>
            {breadcrumb?.filter(el => !el.match.route === false).map(({ match, breadcrumb }, index, self) => (
                <Link key={match.pathname} to={match.pathname} className='flex items-center gap-1 hover:text-main'>
                    <span className='capitalize'>{breadcrumb}</span>
                    {index !== self.length - 1 && <IoIosArrowForward />}
                </Link>
            ))}
        </div>
    )
}

export default memo(Breadcrumb)