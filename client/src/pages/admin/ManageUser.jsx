import React, { useCallback, useEffect, useState } from 'react';
import { apiDeleteUser, apiGetAllUser, apiUpdateUser } from 'apis/user';
import { roles, blockStatus } from 'utils/contants';
import moment from 'moment';
import { InputField, Pagination, InputForm, Select, Button, WishlistView, CartView } from 'components';
import UserDetail from 'components/Modals/UserDetail'
import useDebounce from 'hooks/useDebounce';
import { useSearchParams } from 'react-router-dom';
import { useForm } from "react-hook-form";
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import clsx from 'clsx';
import { AiFillDelete, AiFillEdit } from 'react-icons/ai';
import { BiSolidUserDetail } from "react-icons/bi";
import { FaRegHeart } from 'react-icons/fa6';
import { GiShoppingCart } from "react-icons/gi";
import { IoClose } from 'react-icons/io5';

const ManageUsers = () => {
  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    defaultValues: {
      email: '',
      firstname: '',
      lastname: '',
      role: '',
      mobile: '',
      isBlocked: ''
    }
  });

  const [users, setUsers] = useState(null);
  const [queries, setQueries] = useState({ q: '' });
  const [editElm, setEditElm] = useState(null);
  const [update, setUpdate] = useState(false);
  const [userDetail, setUserDetail] = useState(false);
  const [cartView, setCartView] = useState(false);
  const [wishlistView, setWishlistView] = useState(false);
  const [wishlistUserId, setWishlistUserId] = useState(null);
  const [cartViewUserId, setCartViewUserId] = useState(null);
  const [userDetailId, setUserDetailId] = useState(null);
  const [params] = useSearchParams();

  const fetchUsers = useCallback(async (params) => {
    const response = await apiGetAllUser({ ...params, limit: process.env.REACT_APP_PRODUCT_LIMIT });
    if (response.success) setUsers(response);
  }, []);

  const render = useCallback(() => {
    setUpdate(prevUpdate => !prevUpdate);
  }, []);

  const queriesDebounce = useDebounce(queries.q, 800);

  useEffect(() => {
    const queriesObj = Object.fromEntries([...params]);
    if (queriesDebounce) queriesObj.q = queriesDebounce;
    fetchUsers(queriesObj);
  }, [queriesDebounce, params, update, fetchUsers]);

  // call submit update
  const handleUpdate = async (data) => {
    try {
      const response = await apiUpdateUser(data, editElm._id);
      if (response.success) {
        setEditElm(null);
        render();
        toast.success(response.message);
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || "An unexpected error occurred. Please try again.";
      toast.info(errorMessage);
    }

  };

  // Check and delete user
  const handleDeleteUser = (uid, role) => {
    if (+role === 1988) {
      toast.error("Admins are not allowed to delete users!");
      return;
    }
    Swal.fire({
      title: "User Deleting...",
      text: "Do you want to remove this user?",
      showCancelButton: true,
    }).then(async (rs) => {
      if (rs.isConfirmed) {
        try {
          const response = await apiDeleteUser(uid);
          if (response.success) {
            render(); // Assuming render is a function to refresh the user list or UI
            toast.success(response.message);
          } else {
            toast.error(response.message);
          }
        } catch (error) {
          const errorMessage = error.response?.data?.message || error.message || "Error deleting user!";
          toast.error(errorMessage);
        }
      }
    });
  };


  const handleUserDetail = (uid) => {
    setUserDetailId(uid);
    setUserDetail(true);
  };

  // function wishlist view
  const handleCartView = (uid) => {
    setCartViewUserId(uid);
    setCartView(true);
  };

  // function wishlist view
  const handleWishlistView = (uid) => {
    setWishlistUserId(uid);
    setWishlistView(true);
  };

  useEffect(() => {
    if (editElm) {
      reset({
        email: editElm.email,
        firstname: editElm.firstname,
        lastname: editElm.lastname,
        role: editElm.role,
        mobile: editElm.mobile,
        isBlocked: editElm.isBlocked
      });
    }
  }, [editElm, reset]);

  return (
    <div className={clsx("w-full overflow-x-auto", editElm && "pl-16")}>
      <h1 className='h-[75px] flex justify-between items-center text-3xl font-bold px-4 text-main bg-gray-100 border-b border-gray-500'>
        <span>Manage Users</span>
      </h1>
      <div className='w-full p-4'>
        <div className='flex justify-center md:justify-end py-4'>
          <InputField
            nameKey={'q'}
            value={queries.q}
            setValue={setQueries}
            style={'w500'}
            placeholder="Search by name or email user"
            isHideLabel
          />
        </div>
        <form onSubmit={handleSubmit(handleUpdate)} className='md:w-full overflow-x-auto md:overflow-visible'>
          {editElm && <Button type='submit'>Update Information</Button>}
          <table className='table-auto text-left w-full my-6'>
            <thead className='font-bold bg-main text-[14px] text-white'>
              <tr className='border border-gray-500'>
                <th className='px-4 py-3'>#</th>
                <th className='px-4 py-3'>Email Address</th>
                <th className='px-4 py-3'>Firstname</th>
                <th className='px-4 py-3'>Lastname</th>
                <th className='px-4 py-3'>Roles</th>
                <th className='px-4 py-3'>Phone</th>
                <th className='px-4 py-3'>Status</th>
                <th className='px-4 py-3'>Created At</th>
                <th className='px-4 py-3'>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users?.users?.map((el, index) => (
                <tr key={el._id} className='border border-gray-500'>
                  <td className='px-4 py-2'>{index + 1}</td>
                  <td className='px-4 py-2'>
                    {editElm?._id === el._id
                      ? <InputForm
                        fullWidth
                        register={register}
                        errors={errors}
                        id={"email"}
                        defaultValue={editElm.email}
                        validate={{
                          required: 'This field is required',
                          pattern: {
                            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                            message: "Invalid email address"
                          }
                        }}
                      />
                      : <span>{el.email}</span>}
                  </td>
                  <td className='px-4 py-2'>
                    {editElm?._id === el._id
                      ? <InputForm
                        fullWidth
                        register={register}
                        errors={errors}
                        id={"firstname"}
                        validate={{ required: 'This field is required' }}
                        defaultValue={editElm.firstname}
                      />
                      : <span>{el.firstname}</span>}
                  </td>
                  <td className='px-4 py-2'>
                    {editElm?._id === el._id
                      ? <InputForm
                        fullWidth
                        register={register}
                        errors={errors}
                        id={"lastname"}
                        validate={{ required: 'This field is required' }}
                        defaultValue={editElm.lastname}
                      />
                      : <span>{el.lastname}</span>}
                  </td>
                  <td className='px-4 py-2'>
                    {editElm?._id === el._id
                      ? <Select
                        fullWidth
                        register={register}
                        errors={errors}
                        id={"role"}
                        defaultValue={+el.role}
                        options={roles}
                        validate={{ required: 'This field is required' }}
                      />
                      : <span>{roles.find(role => +role.code === +el.role)?.value}</span>}
                  </td>
                  <td className='px-4 py-2'>
                    {editElm?._id === el._id
                      ? <InputForm
                        fullWidth
                        register={register}
                        errors={errors}
                        id={"mobile"}
                        defaultValue={editElm.mobile}
                        validate={{
                          required: 'This field is required',
                          pattern: {
                            value: /^(0|\+84)(\d{9}|\d{10})$/,
                            message: "Invalid mobile phone"
                          }
                        }}
                      />
                      : <span>{el.mobile}</span>}
                  </td>
                  <td className='px-4 py-2'>
                    {editElm?._id === el._id
                      ? <Select
                        fullWidth
                        register={register}
                        errors={errors}
                        id={"isBlocked"}
                        defaultValue={el.isBlocked}
                        options={blockStatus}
                        validate={{ required: 'This field is required' }}
                      />
                      : <span>{el.isBlocked ? 'Blocked' : 'Active'}</span>}
                  </td>
                  <td className='px-4 py-2'>{moment(el.createdAt).format("DD/MM/YYYY")}</td>
                  <td className='p-2 flex gap-2 min-w-[160px]'
                    onClick={(e) => e.stopPropagation()}>
                    {editElm?._id === el._id
                      ? <span className='px-1 text-main hover:underline cursor-pointer'
                        onClick={() => setEditElm(null)}>Back</span>
                      : <span title='Quick edit' className='px-2 text-blue-900 hover:underline cursor-pointer'
                        onClick={() => setEditElm(el)}><AiFillEdit size={20} /></span>}
                    <span
                      title='Delete user'
                      className='px-1 text-main cursor-pointer'
                      onClick={() => handleDeleteUser(el._id, el.role)}
                    ><AiFillDelete /></span>
                    <span
                      title='User detail'
                      className='px-1 cursor-pointer'
                      onClick={() => handleUserDetail(el._id)}
                    ><BiSolidUserDetail size={20} /></span>
                    <span
                      title='Cart view'
                      className='px-1 cursor-pointer'
                      onClick={() => handleCartView(el._id)}
                    ><GiShoppingCart size={20} /></span>
                    <span
                      title='Wishlist view'
                      className='px-1 cursor-pointer'
                      onClick={() => handleWishlistView(el._id)}
                    ><FaRegHeart size={20} /></span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </form>
        <div className='overflow-x-auto flex justify-end mt-4 md:w-full md:overflow-visible'>
          <Pagination
            totalCount={users?.counts}
          />
        </div>
      </div>
      {userDetail &&
        <div
          className='absolute min-h-screen top-0 left-0 right-0 bottom-0 bg-overlay z-50 flex flex-col justify-center items-center'
        >
          <div
            className='relative bg-white w-ful animate-side-left md:ml-10 md:w-[40%] md:h-auto rounded-md p-8'
          >
            <UserDetail userId={userDetailId} />
            <span
              className='absolute top-3 right-3 p-3 text-gray-700 hover:rounded-full hover:text-main cursor-pointer'
              onClick={() => setUserDetail(false)}
            >
              <IoClose size={24} />
            </span>
          </div>
        </div>
      }
      {cartView &&
        <div
          className='absolute min-h-screen top-0 left-0 right-0 bottom-0 bg-overlay z-50 flex flex-col justify-center items-center'
        >
          <div
            className='bg-white w-full animate-side-left md:ml-10 md:w-[40%] md:h-[65%] relative rounded-md'
          >
            <CartView userId={cartViewUserId} />
            <span
              className='absolute top-3 right-3 p-3 text-white hover:rounded-ful hover:text-gray-700 cursor-pointer'
              onClick={() => setCartView(false)}
            >
              <IoClose size={24} />
            </span>
          </div>
        </div>}
      {wishlistView &&
        <div
          className='absolute min-h-screen top-0 left-0 right-0 bottom-0 bg-overlay z-50 flex flex-col justify-center items-center'
        >
          <div
            className='bg-white w-full animate-side-left md:ml-10 md:w-[40%] md:h-[60%] rounded-md relative'
          >
            <WishlistView userId={wishlistUserId} />
            <span
              className='absolute top-3 right-3 p-1 text-white hover:rounded-ful hover:text-gray-700 cursor-pointer'
              onClick={() => setWishlistView(false)}
            >
              <IoClose size={24} />
            </span>
          </div>
        </div>}
    </div>
  );
};

export default ManageUsers;
