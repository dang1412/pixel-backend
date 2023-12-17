import { ApiPromise } from '@polkadot/api'
import type { DispatchError } from '@polkadot/types/interfaces'

export function findMetaError(api: ApiPromise, dispatchError: DispatchError): string {
  if (dispatchError.isModule) {
    // for module errors, we have the section indexed, lookup
    const decoded = api.registry.findMetaError(dispatchError.asModule)
    const { docs, name, section } = decoded

    return `${section}.${name}: ${docs.join(' ')}`
  } else {
    // Other, CannotLookup, BadOrigin, no extra info
    return dispatchError.toString()
  }
}