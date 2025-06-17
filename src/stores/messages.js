/**
 * Check if two objects are deeply equal.
 * @param {*} obj1 the first object to compare.
 * @param {*} obj2 the second object to compare.
 * @returns {boolean} true if the objects are deeply equal, false otherwise.
 */
function isDeepEqual (obj1, obj2) {
  if (obj1 === obj2) return true; // same reference
  if (typeof obj1 !== 'object' || typeof obj2 !== 'object' || obj1 == null || obj2 == null) {
    return false; // not objects or null
  }
  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);

  if (keys1.length !== keys2.length) return false;

  for (const key of keys1) {
    if (!keys2.includes(key) || !isDeepEqual(obj1[key], obj2[key])) {
      return false;
    }
  }
  return true;
}

export const useMessagesStore = defineStore('messages', () => {
  const queue = ref([]);

  function add (text, { color = 'success' } = {}) {
    const obj = {
      text,
      color,
    };

    // Check if the same message already exists in the queue before adding it again
    const exists = queue.value.some(o => isDeepEqual(o, obj));
    if (!exists) {
      queue.value.push({
        text,
        color,
      });
    }
  }

  return { queue, add };
});
