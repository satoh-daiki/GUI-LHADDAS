import { Tasks } from '../Tasks'

/**
 * "win32"などを返す
 */
export const getPlatform: Tasks['getPlatform'] = () => Promise.resolve(process.platform)
