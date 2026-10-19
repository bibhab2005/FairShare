const OFFLINE_QUEUE_KEY = 'fairshare_offline_expense_queue';

export const getOfflineQueue = () => {
  try {
    const raw = localStorage.getItem(OFFLINE_QUEUE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error('Failed to read offline queue', e);
    return [];
  }
};

export const enqueueOfflineExpense = (expensePayload) => {
  try {
    const queue = getOfflineQueue();
    queue.push({
      id: `offline-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      payload: expensePayload,
      createdAt: new Date().toISOString(),
    });
    localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(queue));
    return true;
  } catch (e) {
    console.error('Failed to enqueue offline expense', e);
    return false;
  }
};

export const clearOfflineQueue = () => {
  try {
    localStorage.removeItem(OFFLINE_QUEUE_KEY);
  } catch (e) {
    console.error('Failed to clear offline queue', e);
  }
};

export const syncOfflineExpenses = async (createExpenseApi) => {
  const queue = getOfflineQueue();
  if (!queue || queue.length === 0) return 0;

  const remaining = [];
  let syncedCount = 0;

  for (const item of queue) {
    try {
      await createExpenseApi(item.payload);
      syncedCount++;
    } catch (err) {
      console.error('Failed to sync item:', item, err);
      // Keep in queue only if it's still a network error, discard if validation error (400)
      if (!err.response || err.response.status >= 500) {
        remaining.push(item);
      }
    }
  }

  if (remaining.length > 0) {
    localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(remaining));
  } else {
    clearOfflineQueue();
  }

  return syncedCount;
};
