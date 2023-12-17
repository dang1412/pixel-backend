import { ApiPromise } from '@polkadot/api'
import { ContractPromise } from '@polkadot/api-contract'
import type { InjectedAccountWithMeta } from '@polkadot/extension-inject/types'
import type { Weight, ContractExecResult } from '@polkadot/types/interfaces'
import { SubmittableExtrinsic } from '@polkadot/api/types'
import { web3FromSource } from '@polkadot/extension-dapp'

import { findMetaError } from './findMetaError'
import { decodeCallResult } from './decodeCallResult'
import { Result } from './types'

type MessageResult = 'Ok' | { Err: string | { Custom: string } }

export async function doMessage(
  api: ApiPromise,
  contract: ContractPromise,
  method: string,
  params: any[],
  account?: InjectedAccountWithMeta,
): Promise<string> {
  // const tx = this.api.tx.pixelModule.mintPixel(10)
  // const gasLimitResult = await getGasLimit(this.api, this.account?.address || '', 'mintPixels', this.contract, {}, [[120]]);

  // if (!gasLimitResult.ok) {
  //   console.log(gasLimitResult.error)
  //   return
  // }

  // const { value: gasLimit } = gasLimitResult
  // console.log('gasLimit', gasLimit)
  // const tx = this.contract.tx.mintPixels({ gasLimit }, [120])
  // await this.signTx(tx)

  // dry run and get gasRequired
  const [gasLimit, rs] = await doQuery<MessageResult>(api, contract, method, params, account)

  // system error
  if (!rs.ok) {
    return rs.error
  }

  // contract error
  if (rs.value !== 'Ok') {
    return typeof rs.value.Err === 'string' ? rs.value.Err : rs.value.Err.Custom
  }

  // continue run transaction
  const tx = contract.tx[method]({ gasLimit }, ...params)
  const error = await signAndSendTx(api, tx, account)

  console.log(`Finished ${method} with params ${params}`, error || 'success')

  return error
}

export async function doQuery<T>(
  api: ApiPromise,
  contract: ContractPromise,
  method: string,
  params: unknown[],
  account?: InjectedAccountWithMeta,
): Promise<[Weight, Result<T, string>]> {

  // https://polkadot.js.org/docs/api-contract/start/contract.read/
  // const { gasRequired, storageDeposit, result, output } = await this.contract.query[method](this.account?.address || '', {}, ...params)

  // console.log(result.toHuman(), gasRequired.toHuman(), output?.toHuman())

  const abiMessage = contract.abi.findMessage(method)
  const registry = contract.abi.registry

  const raw = await api.call.contractsApi.call<ContractExecResult>(
    account?.address || '',
    contract.address,
    0,
    null,
    null,
    abiMessage.toU8a(params)
  )

  const gasRequired = raw.gasRequired

  const decode = decodeCallResult<T>(raw.result, abiMessage, registry)
  console.log(account, decode, params, raw.gasRequired.toHuman())
  if (!decode.ok) {
    const dispatchError = decode.error
    const error = findMetaError(api, dispatchError)
    console.log(error)

    return [gasRequired, { ok: false, error }]
  }

  return [gasRequired, { ok: true, value: decode.value }]
}

// Sign and send the transaction
export async function signAndSendTx(
  api: ApiPromise,
  tx: SubmittableExtrinsic<'promise'>,
  account?: InjectedAccountWithMeta,
): Promise<string> {
  // if (this.account?.meta.isTesting) {
  //   const pair = keyring.getPair(this.account.address)
  //   console.log('signTx', pair, this.account)
  //   await tx.signAndSend(pair, (rs) => console.log(rs))
  // }
  return new Promise<string>(async (res) => {
    if (account) {
      const injector = await web3FromSource(account.meta.source)
      const unsub = await tx.signAndSend(account.address, { signer: injector.signer }, async ({ events = [], status, dispatchError }) => {
        // Error
        // if (dispatchError) {
        //   res(findMetaError(api, dispatchError))
        //   unsub()
        // }
        if (status.isInBlock) {
          console.log(`Transaction included in block: ${status.asInBlock}`);
        } else if (status.isFinalized) {
          unsub(); // Unsubscribe from the status updates
          console.log(`Transaction finalized in block: ${status.asFinalized}`);
          res(dispatchError ? findMetaError(api, dispatchError) : '')
          
        } else if (status.isBroadcast) {
          console.log(`Transaction broadcasted: ${status.asBroadcast}`);
        } else {
          // Handle other status types if needed
          console.log(`Transaction status: ${status.type}`);
        }
      })
    } else {
      res('No account')
    }
  })
}
