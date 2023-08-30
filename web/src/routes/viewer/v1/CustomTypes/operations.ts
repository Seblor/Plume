import type { Operation } from 'fast-json-patch'

export type operationNames = Operation['op'] | 'moved' | 'change'