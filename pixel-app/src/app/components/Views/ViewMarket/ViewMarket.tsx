import React, { useCallback } from 'react'

import { PixelImage } from '@/libs/viewport'
import { appGlobal } from '@/libs/states/globals'

interface Props {
  images: PixelImage[]
}

export const ViewMarket: React.FC<Props> = ({ images }) => {

  const move = useCallback((image: PixelImage) => {
    const scene = appGlobal.engine?.getCurrentScene()
    if (appGlobal.engine?.activeSceneIndex === 0 && scene) {
      // const scene
      // engine.updateMinimap()
      scene.moveToArea(image.area)
      document.querySelector('#WrapFullscreen')?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [])

  return (
    <div className="container p-4 max-w-4xl">
      <div className="grid lg:grid-cols-3 md:grid-cols-2 gap-4 xs:grid-cols-1">
        {images.map(i => (
          <div
            key={i.title}
            className="block rounded-lg bg-white shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] dark:bg-neutral-700">
            <a href="#!" onClick={() => move(i)}>
              <img
              className="rounded-t-lg"
              src={i.imageUrl}
              alt="" />
            </a>
            <div className="p-6">
              <h5
                className="mb-2 text-xl font-medium leading-tight text-neutral-800 dark:text-neutral-50">
                {`(${i.area.x}, ${i.area.y}) ${i.area.w} x ${i.area.h}`}
              </h5>
              <p className="mb-4 text-base text-neutral-600 dark:text-neutral-200">
                2500$
              </p>
              <button
                type="button"
                className="inline-block rounded bg-blue-500 px-6 pb-2 pt-2.5 text-xs font-medium uppercase leading-normal text-white shadow-[0_4px_9px_-4px_#3b71ca] transition duration-150 ease-in-out hover:bg-primary-600 hover:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] focus:bg-primary-600 focus:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] focus:outline-none focus:ring-0 active:bg-primary-700 active:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] dark:shadow-[0_4px_9px_-4px_rgba(59,113,202,0.5)] dark:hover:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.2),0_4px_18px_0_rgba(59,113,202,0.1)] dark:focus:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.2),0_4px_18px_0_rgba(59,113,202,0.1)] dark:active:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.2),0_4px_18px_0_rgba(59,113,202,0.1)]"
                data-te-ripple-init
                data-te-ripple-color="light">
                Buy
              </button>
            </div>
          </div>
        ))}
        {/* <div className="bg-gray-300 p-4">1/3</div>
        <div className="bg-gray-400 p-4">1/3</div>

        <div className="bg-gray-500 p-4">1/3</div>
        <div className="bg-gray-600 p-4">1/3</div>
        <div className="bg-gray-700 p-4">1/3</div> */}
      </div>
    </div>
  )
}
