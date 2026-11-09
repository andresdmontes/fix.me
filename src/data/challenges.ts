import { Challenge } from '../types/challenge';

export const CHALLENGES: Challenge[] = [
  {
    id: 'sum-even-numbers',
    slug: 'sum-even-numbers',
    title: 'Off-by-One Even Summer',
    difficulty: 'Easy',
    language: 'javascript',
    category: 'Arrays & Objects',
    tags: ['Loops', 'Arrays', 'Off-by-One', 'Math'],
    estimatedMinutes: 5,
    functionName: 'sumEvenNumbers',
    description: `### Problem Description
Write a function \`sumEvenNumbers(numbers)\` that takes an array of integers and returns the sum of all **even** numbers.

### The Bug
A junior engineer implemented this function, but it fails to include the first or last elements properly and has an inverted parity check.

### Example
\`\`\`javascript
sumEvenNumbers([1, 2, 3, 4, 5, 6]); // Expected: 12 (2 + 4 + 6)
sumEvenNumbers([10, 15, 20]);       // Expected: 30 (10 + 20)
sumEvenNumbers([1, 3, 5]);          // Expected: 0
\`\`\`

### Constraints
- Array can contain positive numbers, negative numbers, and zero.
- Empty array \`[]\` should return \`0\`.`,
    bugClue: 'Look closely at the loop starting index `i = 1`, the loop condition `i < numbers.length - 1`, and the modulo comparison `numbers[i] % 2 === 1`.',
    bugExplanation: 'The loop skipped the first element (index 0) and the last element (used length - 1 with <), while also checking for odd numbers instead of even numbers.',
    buggyCode: `function sumEvenNumbers(numbers) {
  let total = 0;
  // BUG: Indexing starts at 1 and stops one short of the end
  // BUG: Parity check looks for odd numbers instead of even
  for (let i = 1; i < numbers.length - 1; i++) {
    if (numbers[i] % 2 === 1) {
      total += numbers[i];
    }
  }
  return total;
}`,
    expectedSolution: `function sumEvenNumbers(numbers) {
  let total = 0;
  for (let i = 0; i < numbers.length; i++) {
    if (numbers[i] % 2 === 0) {
      total += numbers[i];
    }
  }
  return total;
}`,
    testCases: [
      {
        id: 'tc-1',
        description: 'Sums basic mixed array correctly',
        input: [[1, 2, 3, 4, 5, 6]],
        expected: 12,
      },
      {
        id: 'tc-2',
        description: 'Includes first and last elements if they are even',
        input: [[10, 15, 20]],
        expected: 30,
      },
      {
        id: 'tc-3',
        description: 'Returns 0 for all odd numbers',
        input: [[1, 3, 5, 7, 9]],
        expected: 0,
      },
      {
        id: 'tc-4',
        description: 'Handles empty array',
        input: [[]],
        expected: 0,
      },
      {
        id: 'tc-5',
        description: 'Handles negative even integers',
        input: [[-4, -3, -2, -1, 0, 2]],
        expected: -4,
        hidden: true,
      },
    ],
  },
  {
    id: 'deep-profile-merger',
    slug: 'deep-profile-merger',
    title: 'Immutable Settings Merger',
    difficulty: 'Easy',
    language: 'javascript',
    category: 'Arrays & Objects',
    tags: ['Immutability', 'Objects', 'Deep Clone', 'References'],
    estimatedMinutes: 6,
    functionName: 'mergeSettings',
    description: `### Problem Description
In our client app, user preferences need to be merged immutably with new overrides.
Write a function \`mergeSettings(defaultSettings, userOverrides)\` that returns a **fresh clone** containing the merged top-level values and nested \`notifications\` object.

### Critical Requirement: Immutability
The original \`defaultSettings\` object and its nested properties **MUST NOT be mutated**.

### Example
\`\`\`javascript
const defaults = {
  theme: "dark",
  notifications: { email: true, sms: false }
};

const overrides = {
  theme: "light",
  notifications: { sms: true }
};

const result = mergeSettings(defaults, overrides);
// result.notifications => { email: true, sms: true }
// defaults.notifications => { email: true, sms: false } (unmodified!)
\`\`\``,
    bugClue: '`Object.assign` only does a shallow copy. Direct assignment to `merged.notifications.sms` mutates the nested object in `defaultSettings` because both point to the same memory reference!',
    bugExplanation: 'A shallow copy copies object references for nested properties. To keep defaults immutable, `notifications` must be cloned separately as a new object.',
    buggyCode: `function mergeSettings(defaultSettings, userOverrides) {
  // BUG: Shallow copy shares nested object references!
  const merged = Object.assign({}, defaultSettings);
  
  if (userOverrides.theme) {
    merged.theme = userOverrides.theme;
  }
  
  // BUG: This mutates the original nested notifications object directly!
  if (userOverrides.notifications) {
    for (const key in userOverrides.notifications) {
      merged.notifications[key] = userOverrides.notifications[key];
    }
  }
  
  return merged;
}`,
    expectedSolution: `function mergeSettings(defaultSettings, userOverrides) {
  const merged = {
    ...defaultSettings,
    ...(userOverrides.theme ? { theme: userOverrides.theme } : {}),
    notifications: {
      ...(defaultSettings.notifications || {}),
      ...(userOverrides.notifications || {}),
    },
  };
  return merged;
}`,
    testCases: [
      {
        id: 'tc-1',
        description: 'Merges theme and notifications correctly',
        input: [
          { theme: 'dark', notifications: { email: true, sms: false } },
          { theme: 'light', notifications: { sms: true } },
        ],
        expected: { theme: 'light', notifications: { email: true, sms: true } },
      },
      {
        id: 'tc-2',
        description: 'Does not mutate original defaultSettings notifications',
        input: [
          { theme: 'dark', notifications: { email: true, sms: false, push: false } },
          { notifications: { push: true } },
        ],
        expected: { theme: 'dark', notifications: { email: true, sms: false, push: true } },
      },
      {
        id: 'tc-3',
        description: 'Handles empty user overrides without errors',
        input: [
          { theme: 'sepia', notifications: { email: false } },
          {},
        ],
        expected: { theme: 'sepia', notifications: { email: false } },
      },
      {
        id: 'tc-4',
        description: 'Preserves default settings when only theme is updated',
        input: [
          { theme: 'dark', notifications: { email: true } },
          { theme: 'neon' },
        ],
        expected: { theme: 'neon', notifications: { email: true } },
        hidden: true,
      },
    ],
  },
  {
    id: 'batch-array-chunker',
    slug: 'batch-array-chunker',
    title: 'Fixed Batch Chunker',
    difficulty: 'Medium',
    language: 'javascript',
    category: 'Algorithms',
    tags: ['Arrays', 'Slicing', 'Batching', 'Edge Cases'],
    estimatedMinutes: 8,
    functionName: 'chunkArray',
    description: `### Problem Description
Implement \`chunkArray(array, size)\` which splits an array into sub-arrays of maximum length \`size\`.
If the array cannot be split evenly, the final chunk will be the remaining elements.

### Rules & Edge Cases
- If \`array\` is empty, return an empty array \`[]\`.
- If \`size <= 0\`, return an empty array \`[]\`.
- All chunks except possibly the last one must have length equal to \`size\`.

### Example
\`\`\`javascript
chunkArray([1, 2, 3, 4, 5], 2); // [[1, 2], [3, 4], [5]]
chunkArray(['a', 'b', 'c'], 1); // [['a'], ['b'], ['c']]
chunkArray([1, 2, 3], 5);       // [[1, 2, 3]]
\`\`\``,
    bugClue: 'Watch out for how the loop increments, how slicing coordinates are calculated, and what happens when `size <= 0`.',
    bugExplanation: 'The buggy code used an incorrect slice end index calculation and failed to guard against non-positive chunk sizes, which could cause infinite loops.',
    buggyCode: `function chunkArray(array, size) {
  // BUG: Missing check for size <= 0
  const chunks = [];
  
  // BUG: Incorrect loop step and slicing logic
  for (let i = 0; i < array.length; i += size - 1) {
    const chunk = array.slice(i, size);
    chunks.push(chunk);
  }
  
  return chunks;
}`,
    expectedSolution: `function chunkArray(array, size) {
  if (!array || array.length === 0 || size <= 0) {
    return [];
  }
  const chunks = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}`,
    testCases: [
      {
        id: 'tc-1',
        description: 'Splits array with uneven remainder',
        input: [[1, 2, 3, 4, 5], 2],
        expected: [[1, 2], [3, 4], [5]],
      },
      {
        id: 'tc-2',
        description: 'Splits array with exact multiples',
        input: [[1, 2, 3, 4, 5, 6], 3],
        expected: [[1, 2, 3], [4, 5, 6]],
      },
      {
        id: 'tc-3',
        description: 'Handles chunk size larger than array length',
        input: [[1, 2, 3], 10],
        expected: [[1, 2, 3]],
      },
      {
        id: 'tc-4',
        description: 'Safely handles size <= 0',
        input: [[1, 2, 3], 0],
        expected: [],
      },
      {
        id: 'tc-5',
        description: 'Handles empty array input',
        input: [[], 3],
        expected: [],
        hidden: true,
      },
    ],
  },
  {
    id: 'async-retry-backoff',
    slug: 'async-retry-backoff',
    title: 'Async Retry with Exponential Backoff',
    difficulty: 'Medium',
    language: 'javascript',
    category: 'Async & Promises',
    tags: ['Async/Await', 'Promises', 'Recursion', 'Error Handling'],
    estimatedMinutes: 10,
    functionName: 'retryWithBackoff',
    description: `### Problem Description
Implement an asynchronous function \`retryWithBackoff(fn, maxRetries, delayMs)\` that executes an async function \`fn\`.
If \`fn()\` fails (throws or rejects):
1. Wait for \`delayMs\` milliseconds before retrying.
2. For each subsequent retry, double the delay (exponential backoff: \`delayMs * 2\`, \`delayMs * 4\`, etc.).
3. If it succeeds, return the resolved value.
4. If it exhausts all \`maxRetries\` attempts without success, rethrow the last encountered error.

### Example
\`\`\`javascript
let attempts = 0;
async function fetchUser() {
  attempts++;
  if (attempts < 3) throw new Error("Network transient failure");
  return { id: 42, name: "Ada Lovelace" };
}

const user = await retryWithBackoff(fetchUser, 3, 10);
// Resolves to { id: 42, name: "Ada Lovelace" }
\`\`\``,
    bugClue: 'Look at the catch block. Is the recursive call `retryWithBackoff(...)` properly awaited and returned? Also check what happens to `maxRetries` counter.',
    bugExplanation: 'The recursive retry in the catch block forgot to return the awaited promise, causing unhandled rejections or returning undefined instead of the resolved payload.',
    buggyCode: `async function retryWithBackoff(fn, maxRetries, delayMs = 10) {
  try {
    return await fn();
  } catch (error) {
    if (maxRetries <= 0) {
      throw error;
    }
    
    // BUG: Timer wait is not awaited!
    new Promise(resolve => setTimeout(resolve, delayMs));
    
    // BUG: Missing 'return await' here, so the function returns undefined!
    retryWithBackoff(fn, maxRetries - 1, delayMs * 2);
  }
}`,
    expectedSolution: `async function retryWithBackoff(fn, maxRetries, delayMs = 10) {
  try {
    return await fn();
  } catch (error) {
    if (maxRetries <= 0) {
      throw error;
    }
    await new Promise(resolve => setTimeout(resolve, delayMs));
    return await retryWithBackoff(fn, maxRetries - 1, delayMs * 2);
  }
}`,
    testCases: [
      {
        id: 'tc-1',
        description: 'Returns immediately on first success',
        input: [
          () => Promise.resolve('instant success'),
          3,
          5,
        ],
        expected: 'instant success',
      },
      {
        id: 'tc-2',
        description: 'Retries until success and resolves value',
        input: [
          (() => {
            let count = 0;
            return () => {
              count++;
              if (count < 3) return Promise.reject(new Error(`Attempt ${count} failed`));
              return Promise.resolve(`Success on attempt ${count}`);
            };
          })(),
          3,
          5,
        ],
        expected: 'Success on attempt 3',
      },
      {
        id: 'tc-3',
        description: 'Throws original error when retries are exhausted',
        input: [
          (() => {
            let count = 0;
            return () => {
              count++;
              if (count < 2) return Promise.reject(new Error('Persistent server error'));
              return Promise.resolve('Too late');
            };
          })(),
          0,
          5,
        ],
        shouldThrow: true,
        expectedErrorSubstring: 'Persistent server error',
        hidden: true,
      },
    ],
  },
  {
    id: 'lru-cache-implementation',
    slug: 'lru-cache-implementation',
    title: 'Least Recently Used (LRU) Cache',
    difficulty: 'Hard',
    language: 'javascript',
    category: 'Data Structures',
    tags: ['Cache', 'Data Structures', 'Map', 'Complexity'],
    estimatedMinutes: 12,
    functionName: 'runLRUCache',
    description: `### Problem Description
Implement an LRU Cache and helper \`runLRUCache(capacity, operations)\`.
The cache supports:
- \`get(key)\`: Returns the value of \`key\` if present, otherwise \`-1\`. Accessing a key marks it as **most recently used**.
- \`put(key, value)\`: Inserts or updates the value. If capacity is exceeded, **evict the least recently used key**.

\`runLRUCache\` takes \`capacity\` and a sequence of \`[operation, ...args]\` tuples (e.g., \`["put", 1, 1]\` or \`["get", 1]\`) and returns an array of results (\`null\` for \`put\`, and the fetched number or \`-1\` for \`get\`).

### Example
\`\`\`javascript
runLRUCache(2, [
  ["put", 1, 1],
  ["put", 2, 2],
  ["get", 1],    // returns 1
  ["put", 3, 3], // evicts key 2
  ["get", 2],    // returns -1
  ["put", 4, 4], // evicts key 1
  ["get", 1],    // returns -1
  ["get", 3],    // returns 3
  ["get", 4]     // returns 4
]);
// Output: [null, null, 1, null, -1, null, -1, 3, 4]
\`\`\``,
    bugClue: 'In JavaScript `Map`, iteration order is insertion order. When `get(key)` is called, the item must be re-inserted so it becomes the newest element in the Map! Also, check which key is deleted on eviction.',
    bugExplanation: 'The buggy implementation failed to refresh the key position on `get()` and deleted the newest key (`Array.from(map.keys()).pop()`) rather than the oldest key on capacity overflow.',
    buggyCode: `function runLRUCache(capacity, operations) {
  const map = new Map();

  function get(key) {
    if (!map.has(key)) return -1;
    // BUG: Accessing an item does not refresh its LRU position!
    return map.get(key);
  }

  function put(key, value) {
    if (map.has(key)) {
      map.delete(key);
    } else if (map.size >= capacity) {
      // BUG: Deletes the LAST (most recently added) key instead of the FIRST!
      const keys = Array.from(map.keys());
      const wrongEvictKey = keys[keys.length - 1];
      map.delete(wrongEvictKey);
    }
    map.set(key, value);
  }

  return operations.map(([op, key, val]) => {
    if (op === 'put') {
      put(key, val);
      return null;
    }
    return get(key);
  });
}`,
    expectedSolution: `function runLRUCache(capacity, operations) {
  const map = new Map();

  function get(key) {
    if (!map.has(key)) return -1;
    const val = map.get(key);
    map.delete(key);
    map.set(key, val);
    return val;
  }

  function put(key, value) {
    if (map.has(key)) {
      map.delete(key);
    } else if (map.size >= capacity) {
      // First key in map iterator is the least recently used
      const oldestKey = map.keys().next().value;
      map.delete(oldestKey);
    }
    map.set(key, value);
  }

  return operations.map(([op, key, val]) => {
    if (op === 'put') {
      put(key, val);
      return null;
    }
    return get(key);
  });
}`,
    testCases: [
      {
        id: 'tc-1',
        description: 'Standard eviction scenario',
        input: [
          2,
          [
            ['put', 1, 1],
            ['put', 2, 2],
            ['get', 1],
            ['put', 3, 3],
            ['get', 2],
            ['get', 3],
          ],
        ],
        expected: [null, null, 1, null, -1, 3],
      },
      {
        id: 'tc-2',
        description: 'Updates existing key without increasing capacity',
        input: [
          2,
          [
            ['put', 1, 10],
            ['put', 1, 20],
            ['get', 1],
            ['put', 2, 30],
            ['put', 3, 40],
            ['get', 1],
            ['get', 2],
          ],
        ],
        expected: [null, null, 20, null, null, -1, 30],
      },
      {
        id: 'tc-3',
        description: 'Handles capacity 1 with immediate eviction',
        input: [
          1,
          [
            ['put', 'a', 100],
            ['get', 'a'],
            ['put', 'b', 200],
            ['get', 'a'],
            ['get', 'b'],
          ],
        ],
        expected: [null, 100, null, -1, 200],
        hidden: true,
      },
    ],
  },
  {
    id: 'valid-syntax-brackets',
    slug: 'valid-syntax-brackets',
    title: 'Balanced Bracket & String Syntax Validator',
    difficulty: 'Hard',
    language: 'javascript',
    category: 'Strings',
    tags: ['Stack', 'Parsing', 'Strings', 'State Machine'],
    estimatedMinutes: 12,
    functionName: 'isValidSyntax',
    description: `### Problem Description
Build \`isValidSyntax(code)\` to determine if a code snippet has correctly balanced brackets (\`()\`, \`{}\`, \`[]\`).

### Crucial Feature: String Literals
Brackets occurring **inside single or double quotation marks** (like \`"hello (world)"\` or \`'['\`) are literal characters and **must be completely ignored**.

### Example
\`\`\`javascript
isValidSyntax('function test() { return [1, 2]; }'); // true
isValidSyntax('const str = "([";');                 // true (brackets inside quotes)
isValidSyntax('function fail() { return ( }');       // false (mismatched)
isValidSyntax('{[}]');                              // false (interleaved)
\`\`\``,
    bugClue: 'Notice how quote state is toggled: does it check if the quote character is escaped with a backslash? Also, check whether the function returns true when the stack still has unclosed brackets!',
    bugExplanation: 'The buggy version toggled in/out of strings without considering escape characters, and at the end of the string check it returned true regardless of remaining items in the stack.',
    buggyCode: `function isValidSyntax(code) {
  const stack = [];
  const pairs = { ')': '(', '}': '{', ']': '[' };
  let inQuote = null;

  for (let i = 0; i < code.length; i++) {
    const char = code[i];

    // BUG: Does not check for escaped quotes like \\"
    if (char === '"' || char === "'") {
      if (inQuote === char) {
        inQuote = null;
      } else if (!inQuote) {
        inQuote = char;
      }
      continue;
    }

    if (inQuote) continue;

    if (char === '(' || char === '{' || char === '[') {
      stack.push(char);
    } else if (char === ')' || char === '}' || char === ']') {
      // BUG: Checks wrong order or doesn't verify empty stack
      const top = stack.pop();
      if (top !== pairs[char]) {
        return false;
      }
    }
  }

  // BUG: If stack still has unclosed brackets, it incorrectly returns true!
  return true;
}`,
    expectedSolution: `function isValidSyntax(code) {
  const stack = [];
  const pairs = { ')': '(', '}': '{', ']': '[' };
  let inQuote = null;

  for (let i = 0; i < code.length; i++) {
    const char = code[i];
    const prevChar = i > 0 ? code[i - 1] : '';

    if ((char === '"' || char === "'") && prevChar !== '\\\\') {
      if (inQuote === char) {
        inQuote = null;
      } else if (!inQuote) {
        inQuote = char;
      }
      continue;
    }

    if (inQuote) continue;

    if (char === '(' || char === '{' || char === '[') {
      stack.push(char);
    } else if (char === ')' || char === '}' || char === ']') {
      if (stack.length === 0) return false;
      const top = stack.pop();
      if (top !== pairs[char]) return false;
    }
  }

  return inQuote === null && stack.length === 0;
}`,
    testCases: [
      {
        id: 'tc-1',
        description: 'Valid standard code block',
        input: ['function test() { return [1, 2]; }'],
        expected: true,
      },
      {
        id: 'tc-2',
        description: 'Ignores brackets inside double quotes',
        input: ['const str = "([";'],
        expected: true,
      },
      {
        id: 'tc-3',
        description: 'Fails on mismatched / unclosed opening brackets',
        input: ['function unclosed() { ( '],
        expected: false,
      },
      {
        id: 'tc-4',
        description: 'Fails on interleaved brackets like {[}]',
        input: ['{[}]'],
        expected: false,
      },
      {
        id: 'tc-5',
        description: 'Handles escaped quote inside string literal correctly',
        input: ['const msg = "quote \\" [ not bracket";'],
        expected: true,
        hidden: true,
      },
    ],
  },
];
