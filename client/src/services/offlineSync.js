/**
 * IndexedDB-based offline sync service
 * Queues actions when offline, syncs when back online
 */

const DB_NAME = 'EKAI_OfflineDB'
const DB_VERSION = 1
const QUEUE_STORE = 'syncQueue'

/**
 * Initialize IndexedDB
 */
export const initDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve(request.result)

    request.onupgradeneeded = (event) => {
      const db = event.target.result
      if (!db.objectStoreNames.contains(QUEUE_STORE)) {
        const store = db.createObjectStore(QUEUE_STORE, { keyPath: 'id', autoIncrement: true })
        store.createIndex('timestamp', 'timestamp', { unique: false })
        store.createIndex('status', 'status', { unique: false })
      }
    }
  })
}

/**
 * Queue an action for offline sync
 * @param {Object} action - Action to queue
 * @returns {Promise<number>} Queue item ID
 */
export const queueAction = async (action) => {
  const db = await initDB()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([QUEUE_STORE], 'readwrite')
    const store = transaction.objectStore(QUEUE_STORE)

    const queueItem = {
      action: action.type,
      endpoint: action.endpoint,
      method: action.method || 'POST',
      data: action.data,
      timestamp: Date.now(),
      status: 'pending',
      retries: 0
    }

    const request = store.add(queueItem)
    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve(request.result)
  })
}

/**
 * Get all pending actions
 * @returns {Promise<Array>} Pending actions
 */
export const getPendingActions = async () => {
  const db = await initDB()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([QUEUE_STORE], 'readonly')
    const store = transaction.objectStore(QUEUE_STORE)
    const index = store.index('status')

    const request = index.getAll('pending')
    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve(request.result)
  })
}

/**
 * Update queue item status
 * @param {number} id - Queue item ID
 * @param {string} status - New status (pending, synced, failed)
 */
export const updateQueueItemStatus = async (id, status) => {
  const db = await initDB()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([QUEUE_STORE], 'readwrite')
    const store = transaction.objectStore(QUEUE_STORE)

    const getRequest = store.get(id)
    getRequest.onsuccess = () => {
      const item = getRequest.result
      if (item) {
        item.status = status
        item.syncedAt = status === 'synced' ? Date.now() : null
        const updateRequest = store.put(item)
        updateRequest.onerror = () => reject(updateRequest.error)
        updateRequest.onsuccess = () => resolve(item)
      }
    }
    getRequest.onerror = () => reject(getRequest.error)
  })
}

/**
 * Clear synced items older than specified time
 * @param {number} olderThanMs - Age in milliseconds
 */
export const clearOldSyncedItems = async (olderThanMs = 24 * 60 * 60 * 1000) => {
  const db = await initDB()
  const cutoffTime = Date.now() - olderThanMs

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([QUEUE_STORE], 'readwrite')
    const store = transaction.objectStore(QUEUE_STORE)

    const request = store.openCursor()
    const deletedCount = 0

    request.onsuccess = (event) => {
      const cursor = event.target.result
      if (cursor) {
        const item = cursor.value
        if (item.status === 'synced' && item.syncedAt && item.syncedAt < cutoffTime) {
          cursor.delete()
        }
        cursor.continue()
      } else {
        resolve(deletedCount)
      }
    }
    request.onerror = () => reject(request.error)
  })
}

/**
 * Get sync statistics
 * @returns {Promise<Object>} Sync stats
 */
export const getSyncStats = async () => {
  const db = await initDB()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([QUEUE_STORE], 'readonly')
    const store = transaction.objectStore(QUEUE_STORE)
    const index = store.index('status')

    const pendingRequest = index.count('pending')
    const syncedRequest = index.count('synced')
    const failedRequest = index.count('failed')

    let completed = 0
    const stats = {}

    const checkComplete = () => {
      completed++
      if (completed === 3) {
        resolve(stats)
      }
    }

    pendingRequest.onsuccess = () => {
      stats.pending = pendingRequest.result
      checkComplete()
    }
    pendingRequest.onerror = () => reject(pendingRequest.error)

    syncedRequest.onsuccess = () => {
      stats.synced = syncedRequest.result
      checkComplete()
    }
    syncedRequest.onerror = () => reject(syncedRequest.error)

    failedRequest.onsuccess = () => {
      stats.failed = failedRequest.result
      checkComplete()
    }
    failedRequest.onerror = () => reject(failedRequest.error)
  })
}

/**
 * Remove a queue item
 * @param {number} id - Queue item ID
 */
export const removeQueueItem = async (id) => {
  const db = await initDB()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([QUEUE_STORE], 'readwrite')
    const store = transaction.objectStore(QUEUE_STORE)

    const request = store.delete(id)
    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve()
  })
}

/**
 * Clear all queue items
 */
export const clearAllQueue = async () => {
  const db = await initDB()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([QUEUE_STORE], 'readwrite')
    const store = transaction.objectStore(QUEUE_STORE)

    const request = store.clear()
    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve()
  })
}
