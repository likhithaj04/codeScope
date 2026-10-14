import React from 'react'

export default function Navbar() {
  return (
    <div className='mains bg-slate-700 text-white md:p-10 p-5 flex md:gap-5 flex-col'>
    <div className='flex flex-row justify-between'>
        <h1 className='font-bold text-2xl'>CodeScope</h1>
        <p className='text-xl'>Repository Explorer</p>
    </div>
      <div className='border rounded-xl flex items-start flex-col md:px-10 md:py-3 py-2 px-2'>
        <p>url here</p>
        <button>search</button>
      </div>
      <div className='flex justify-center md:gap-30 gap-4 md:p-4 p-1'>
        <button className=' border rounded-xl border-blue-500 md:w-80 w-20 p-3 hover:cursor-pointer hover:bg-slate-400 hover:text-black' > Files</button>
        <button className=' border rounded-xl border-blue-500 md:w-80 w-20 hover:cursor-pointer hover:bg-slate-400  hover:text-black'>Graph</button>
        <button className=' border rounded-xl border-blue-500 md:w-80 w-20 hover:cursor-pointer hover:bg-slate-400  hover:text-black'>Impact</button>

      </div>
    </div>
  )
}
