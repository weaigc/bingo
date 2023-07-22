import { getMany, set, del, clear } from 'idb-keyval';

export const Storage = {
  async get(key: string | string[] | null): Promise<any> {
    if (key === null) return null;
    if (typeof key === 'string') {
      key = [key]
    }
    const returnData: Record<string, any> = {}
    const values = await getMany(key)
    key.forEach((k, idx)=> {
      returnData[k] = values[idx]
    })
    return returnData;
  },
  async set(object: any) {
    for (let key of Object.keys(object)) {
      await set(key, object[key])
    }
  },
  async remove(key: string) {
    return del(key);
  },
  async clear() {
    return clear();
  }
}
