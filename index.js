class MyStore {
  #storeName = null
  #ttl = null
  #localStorage = null
  #eventHost = null

  constructor({ storeName, ttl, localStorage, eventHost } = {}) {
    if (!localStorage && typeof window === 'undefined') return

    this.#storeName = storeName || 'reactiveStore'
    this.#ttl = ttl || 60000 // 60 seconds
    this.#localStorage = localStorage || window.localStorage || {}
    this.#eventHost = eventHost
  }

  setItem (key, data, storeName = this.#storeName) {
    const storeObj = this.#fetchStore(storeName)
    const updatedStore = this.#setProperty(storeObj, key, data)

    this.#localStorage.setItem(this.#storeName, JSON.stringify(updatedStore))
    this.#setTimestamp(key)
    this.#emit(key)
  }

  getItem (key, storeName = this.#storeName) {
    if (!this.#getTimestamps()[key]) return undefined
    if (this.#isExpired(this.#getTimestamps()[key])) {
      this.deleteItem(key)
      this.#deleteTimestamp(key)
      return
    }

    const storeObj = this.#fetchStore(storeName)

    return this.#getProperty(storeObj, key)
  }

  deleteItem (key, storeName = this.#storeName) {
    const store = this.#fetchStore(storeName)
    const storeObj = this.#setProperty(store, key, null)
    const updatedStore = JSON.parse(JSON.stringify(storeObj, (key, value) => {
      return (value === null ? undefined : value);
    }));

    this.#localStorage.setItem(this.#storeName, JSON.stringify(updatedStore))
    this.#deleteTimestamp(key)
    this.#emit(key)
  }

  get _metadata() {
    return {
      storeName: this.#storeName,
      ttl: this.#ttl,
      localStorage: this.#localStorage,
      eventHost: this.#eventHost,
      timestamps: this.#getTimestamps(),
    }
  }

  #setProperty (obj, path, value) {
    const copyObj = structuredClone(obj)
    const pathArray = this.#parsePath(path)

    pathArray.reduce((acc, key, i) => {
      if (acc[key] === undefined) acc[key] = {}
      if (i === pathArray.length - 1) acc[key] = value
      return acc[key]
    }, copyObj)

    return copyObj
  }

  #getProperty (obj, path, defValue) {
    if (!path) return undefined
    const pathArray = this.#parsePath(path)

    const result = pathArray.reduce((prevObj, key) => prevObj && prevObj[key], obj)

    return result === undefined ? defValue : result
  }

  #emit (key) {
    if (!this.#eventHost) return

    this.#eventHost.dispatchEvent(
      new CustomEvent(`${this.#storeName}:updated:${key}`),
    );
  }

  #getTimestamps () {
    return this.#fetchStore('_timestamps')
  }

  #setTimestamp (key) {
    const storeObj = this.#fetchStore('_timestamps')
    storeObj[key] = this.#now()

    this.#localStorage.setItem('_timestamps', JSON.stringify(storeObj))
  }

  #deleteTimestamp (key) {
    return delete this.#localStorage.removeItem('_timestamps', key)
  }

  #parsePath = (path) => Array.isArray(path) ? path : path.match(/([^[.\]])+/g)

  #now = () => new Date().getTime()

  #isExpired = (timestamp) => this.#now() > timestamp + this.#ttl

  #fetchStore = (name) => JSON.parse(this.#localStorage.getItem(name) || null) || {}
}

export default new MyStore();
export const Store = MyStore;
