'use client'

import React, { Fragment, useCallback, useState } from 'react'
import { Menu, Transition } from '@headlessui/react'

import { useLogin } from '@/components/hooks'

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ')
}

const menus = ['Metamask', 'Polkadot.js', 'Subwallet']
const loggedInMenus = ['Profile', 'Setting']

interface Props {}

export const AccountLogin: React.FC<Props> = (props) => {
  const { account, accounts, setAccount, login, logout } = useLogin()
  const wallets = ['polkadot-js', 'subwallet-js']

  return (
    <>
    {account.addr ? (
      <Menu as="div" className="relative inline-block text-left">
        <div>
          <Menu.Button className="text-sm font-semibold leading-6 text-gray-900">
            {account.alias}
          </Menu.Button>
        </div>

        <Transition
          as={Fragment}
          enter="transition ease-out duration-100"
          enterFrom="transform opacity-0 scale-95"
          enterTo="transform opacity-100 scale-100"
          leave="transition ease-in duration-75"
          leaveFrom="transform opacity-100 scale-100"
          leaveTo="transform opacity-0 scale-95"
        >
          <Menu.Items className="absolute right-0 z-10 mt-2 w-56 origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
            <div className="py-1">
              {accounts?.map((acc, i) => (
                <Menu.Item key={i}>
                {({ active }) => (
                  <a
                    type='Button'
                    className={classNames(
                      active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
                      'block px-4 py-2 text-sm'
                    )}
                    onClick={() => setAccount(i)}
                  >
                    { acc.alias }
                  </a>
                )}
              </Menu.Item>
              ))}
            </div>
            <div className="py-1">
              {loggedInMenus.map((item, i) => (
                <Menu.Item key={i}>
                {({ active }) => (
                  <a
                    type='Button'
                    className={classNames(
                      active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
                      'block px-4 py-2 text-sm'
                    )}
                  >
                    {item}
                  </a>
                )}
              </Menu.Item>
              ))}
              <Menu.Item>
                {({ active }) => (
                  <a
                    type='Button'
                    className={classNames(
                      active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
                      'block px-4 py-2 text-sm'
                    )}
                    onClick={logout}
                  >
                    Log out
                  </a>
                )}
              </Menu.Item>
            </div>
          </Menu.Items>
        </Transition>
      </Menu>
    ) : (
      <Menu as="div" className="relative inline-block text-left">
        <div>
          <Menu.Button className="text-sm font-semibold leading-6 text-gray-900">
            Log in <span aria-hidden="true">&rarr;</span>
          </Menu.Button>
        </div>

        <Transition
          as={Fragment}
          enter="transition ease-out duration-100"
          enterFrom="transform opacity-0 scale-95"
          enterTo="transform opacity-100 scale-100"
          leave="transition ease-in duration-75"
          leaveFrom="transform opacity-100 scale-100"
          leaveTo="transform opacity-0 scale-95"
        >
          <Menu.Items className="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
            <div className="py-1">
              {wallets.map((w, i) => (
                <Menu.Item key={i}>
                {({ active }) => (
                  <a
                    type='Button'
                    className={classNames(
                      active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
                      'block px-4 py-2 text-sm'
                    )}
                    // onClick={() => login('Polkadot.js')}
                    onClick={() => login(w)}
                  >
                    {w}
                  </a>
                )}
              </Menu.Item>
              ))}
            </div>
          </Menu.Items>
        </Transition>
      </Menu>
    )}
   </>
  )
}
