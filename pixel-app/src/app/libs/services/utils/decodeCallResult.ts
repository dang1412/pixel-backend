import type { AbiMessage } from '@polkadot/api-contract/types'
import type { ContractExecResultResult } from '@polkadot/types/interfaces'
import type { Registry } from '@polkadot/types/types'
import { DecodedResult } from './types'

export function decodeCallResult<T>(
  result: ContractExecResultResult,
  message: AbiMessage,
  registry: Registry,
): DecodedResult<T> {
  if (result.isErr || !message.returnType) {
    return { ok: false, error: result.asErr }
  }

  const raw = registry.createTypeUnsafe(
    message.returnType.lookupName || message.returnType.type,
    [result.asOk.data.toU8a(true)],
    { isPedantic: true },
  )

  return { ok: true, value: (raw?.toHuman() as Record<'Ok', T>)?.Ok }
}
