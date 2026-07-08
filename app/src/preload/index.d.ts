import { ElectronAPI } from '@electron-toolkit/preload'
import { Tasks } from '../main/Tasks'

declare global {
  interface Window {
    tasks: Tasks
    electronAPI: any
    paths: {
      cesiumBaseUrl: string
      templateDir: string
    }
  }
}
