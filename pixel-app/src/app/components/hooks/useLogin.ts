import { useCallback, useState } from 'react'
import { useRecoilState } from 'recoil'
// import type { InjectedAccountWithMeta } from '@polkadot/extension-inject/types'
// import { useWallet, useAllWallets } from 'useink'

import { PixelService } from '@/libs/services'
import { AccountState, accountState } from '@/libs/states'

// interface WalletAccount {
//   signer?: Signer
//   address: string
//   source: string
//   name?: string
//   wallet?: Wallet
// }

interface UseLoginHook {
  // account?: WalletAccount
  // accounts?: WalletAccount[]
  account: AccountState
  accounts: AccountState[]
  setAccount: (i: number) => void
  login: (item: string) => void
  logout: () => void
}

export function useLogin(): UseLoginHook {
  const [account, setAccountState] = useRecoilState(accountState)
  const [accounts, setAccounts] = useState<AccountState[]>([])
  // const { account, accounts, setAccount, connect, disconnect } = useWallet()

  const login = useCallback((wallet: string) => {
    (async () => {
      const service = await PixelService.getInstance()
      const account = await service.login(wallet)
      setAccountState(account)

      // update accounts list
      const accounts: AccountState[] = service.getAccounts()?.map(a => ({ addr: a.address, alias: a.meta.name || '' })) || []
      setAccounts(accounts)

      // if (item === 'Metamask') {
      //   const account = await service.login(WalletType.meta)
      //   console.log(account)
      //   setAccount(account)
      // } else if (item === 'Polkadot.js') {
      //   const account = await service.login(WalletType.polka)
      //   console.log(account)
      //   setAccount(account)
      // } else if (item === 'Subwallet') {
        
      // }
    })()
    // connect(item)
  }, [setAccountState])

  const logout = useCallback(() => {
    (async () => {
      const service = await PixelService.getInstance()
      service.logout()
      setAccountState({ addr: '', alias: '' })
      setAccounts([])
      // disconnect()
    })()
  }, [setAccountState])

  const setAccount = useCallback((i: number) => {
    (async () => {
      const service = await PixelService.getInstance()
      const account = service.setAccount(i)
      if (account) {
        setAccountState(account)
      }
    })()
  }, [setAccountState])

  return { account, accounts, setAccount, login, logout }
}