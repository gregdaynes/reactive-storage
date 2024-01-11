Reactive Storage
================

A wrapper for localStorage compatible APIs that allows you to subscribe to changes.

Storage has a TTL for entries

Installation
------------

1. Add reactive-storage to your package.json

`npm install --save reactive-storage`

2. Create a new store

```
import ReactiveStore from 'reactive-store'
const myNewStore = new ReactiveStore()
```

3. Add data to store

```
myNewStore.setItem('someKey', 'my data')

// Or nested keys

myNewStore.setItem('parent.child', 'my nested data')
```

3. Get data from the store

```
myNewStore.getItem('someKey')

// Or nested keys

myNewStore.getItem('parent.child')
```

4. Delete data from the store

```
myNewStore.deleteItem('someKey')

// Or nested keys

myNewStore.deleteItem('parent.child')
```
