import React, { memo } from 'react';
import { createSlug } from 'utils/helpers';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import iconMapping from 'utils/iconMapping'; // Điều chỉnh đường dẫn import tùy theo thư mục của bạn

const SelectSidebar = ({ setIsSidebarOpen }) => {
    const { categories } = useSelector(state => state.app);
    const navigate = useNavigate();

    const handleChange = (event) => {
        const selectedCategory = event.target.value;
        navigate(`/${createSlug(selectedCategory)}`);
    };

    return (
        <div className='flex flex-col border relative'>
            <select
                onChange={handleChange}
                className='px-5 py-3 text-sm flex items-center hover:text-main'
            >
                <option value="" disabled selected>Select a category</option>
                {categories?.map(el => {
                    const IconComponent = iconMapping[el.title]; // Lấy icon tương ứng
                    return (
                        <option
                            key={createSlug(el.title)} // Thêm key vào đây
                            value={el.title}
                        >
                            {IconComponent && <IconComponent className='mr-2 text-[18px]' />}
                            {el.title}
                        </option>
                    );
                })}
            </select>
        </div>
    );
};

export default memo(SelectSidebar);
