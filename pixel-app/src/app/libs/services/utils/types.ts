import type { DispatchError } from '@polkadot/types/interfaces'

export type Result<T, E = Error> =
  | { ok: true; value: T }
  | { ok: false; error: E };

export type DecodedResult<T> = Result<T, DispatchError>