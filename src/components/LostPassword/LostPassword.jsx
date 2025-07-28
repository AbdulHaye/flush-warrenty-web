import React from 'react'
import Navbar from '../Navbar/navbar'
import FlushWarrantyFooter from '../Footer/flushWarrantyFooter'
import { Link as RouterLink} from 'react-router-dom'


function LostPassword() {
  return (
    <>
    <Navbar/>
    <div className='w-full max-w-screen-lg mx-auto mt-[80px]'>
      <h3 className='text-center mb-[80px] text-[60px] sm:text-[84px] leading-[96px] text-black font-extrabold'>Lost Password</h3>

      <div className='px-[30px] xl:px-0'>
        <form action="">
            <p className='mb-4 text-base leading-[24px] text-black'>Lost your password? Please enter your username or email address. You will receive a link to create a new password via email.</p>

          <div className='flex flex-col mb-4'>
            <label className='text-black text-base leading-[24px] font-normal mb-[5px]'>Username or email address <span className='text-red-600'>*</span></label>
            <input type="email" className='border border-[#dcd7ca] py-[15px] px-[18px] outline-0' />
          </div>

          

          <button type='submit' className='text-[17px] leading-[21px] font-semibold hover:underline cursor-pointer bg-[#007BFF] text-white py-[12px] px-[16px] mb-[16px] rounded-4xl'>RESET PASSWORD</button>

        </form>
      </div>
    </div>
    <FlushWarrantyFooter/>
    </>
  )
}

export default LostPassword