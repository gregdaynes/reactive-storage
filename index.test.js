import test from 'node:test'
import assert from 'node:assert/strict'
import { Store } from './index.js'

class localStorageMock {
  #store = {};

  getItem(key) {
    return this.#store[key];
  }

  setItem(key, value) {
    this.#store[key] = value;
  }

  clear() {
    this.#store = {};
  }

  removeItem(key) {
    delete this.#store[key];
  }

  getAll() {
    return this.#store;
  }
}

test('Store', async (t) => {
  await t.test('set', async (t) => {
    await t.test('sets a nested value', () => {
      const mockedLocalStorage = new localStorageMock()
      const store = new Store({ storeName: 'set-test', localStorage: mockedLocalStorage })
      const key = 'test-key.test-key-2'

      store.setItem(key, 'test-value')

      const actualStoredItem = mockedLocalStorage.getAll()['set-test']
      const expectedStoredItem = '{"test-key":{"test-key-2":"test-value"}}'
      assert.equal(actualStoredItem, expectedStoredItem)
    })

    await t.test('set emits an updated event', (t, done) => {
      const mockedLocalStorage = new localStorageMock()
      const eventHost = new EventTarget()
      const store = new Store({ storeName: 'set-test', localStorage: mockedLocalStorage, eventHost })
      const key = 'test-key.test-key-2'

      // doesn't need a test, if done() doesn't get called the event didn't emit
      eventHost.addEventListener('set-test:updated:test-key.test-key-2', (e) => {
        assert.equal(e.type, 'set-test:updated:test-key.test-key-2')
        done()
      });

      store.setItem(key, 'test-value')
    })

    await t.test('records a timestamp for the key', () => {
      const mockedLocalStorage = new localStorageMock()
      const store = new Store({ storeName: 'set-test', localStorage: mockedLocalStorage })
      const key = 'test-key.test-key-2'

      store.setItem(key, 'test-value')

      assert.equal(typeof store._metadata.timestamps[key], 'number')
    })
  })

  await t.test('get', async (t) => {
    await t.test('gets a nested value', () => {
      const mockedLocalStorage = new localStorageMock()
      const store = new Store({ storeName: 'set-test', localStorage: mockedLocalStorage })
      const key = 'test-key.test-key-2'

      store.setItem(key, 'test-value')

      assert.equal(store.getItem(key), 'test-value')
    })

    await t.test('cannot get a value by key that was not set', () => {
      const mockedLocalStorage = new localStorageMock()
      const store = new Store({ storeName: 'set-test', localStorage: mockedLocalStorage })
      const key = 'test-key.test-key-2'

      assert.equal(store.getItem(key), undefined)
    })

    await t.test('cannot get a value whose ttl lapsed', () => {
      const mockedLocalStorage = new localStorageMock()
      const store = new Store({ storeName: 'set-test', ttl: -1000, localStorage: mockedLocalStorage })
      const key = 'test-key.test-key-2'

      store.setItem(key, 'test-value')

      assert.equal(store.getItem(key), undefined)
    })
  })

  await t.test('deletes a stored item', () => {
    const mockedLocalStorage = new localStorageMock()
    const store = new Store({ storeName: 'set-test', localStorage: mockedLocalStorage })
    const key = 'test-key.test-key-2'

    store.setItem(key, 'test-value')
    assert.equal(store.getItem(key), 'test-value')

    store.deleteItem(key)
    assert.equal(store.getItem(key), undefined)
  })
})
