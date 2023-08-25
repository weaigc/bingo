// @ts-ignore
import nameStorage from 'namestorage'

export default () => {
  return {
    getItem(key: string) {
      return JSON.parse(nameStorage.getItem(key))
    },
    setItem(key: string, value: string) {
      const event = new CustomEvent("namestorage", {
        detail: {
          key,
          value,
        },
      });
      window.dispatchEvent(event)
      nameStorage.setItem(key, JSON.stringify(value))
    },
    removeItem(key: string) {
      nameStorage.removeItem(key)
    },
    subscribe(okey: string, callback: (value: any) => void) {
      const storageEventCallback = (event: any) => {
        const { key, value } = event.detail as { key: string, value: any }
        if (key === okey) {
          callback(value)
        }
      }
      window.addEventListener('namestorage', storageEventCallback)
      return () => {
        window.removeEventListener('namestorage', storageEventCallback)
      }
    }
  }
}
