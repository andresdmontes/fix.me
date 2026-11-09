import { Challenge, ExecutionSummary, Language, TestCase, TestResult } from '../types/challenge';

/**
 * Deep equality helper that handles primitives, arrays, plain objects,
 * null/undefined, and NaN.
 */
export function deepEqual(a: any, b: any): boolean {
  if (Object.is(a, b)) return true;
  if (typeof a !== typeof b) return false;
  if (a === null || b === null || a === undefined || b === undefined) return a === b;

  if (typeof a === 'number' && typeof b === 'number') {
    if (isNaN(a) && isNaN(b)) return true;
    return a === b;
  }

  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
      if (!deepEqual(a[i], b[i])) return false;
    }
    return true;
  }

  if (typeof a === 'object' && typeof b === 'object') {
    const keysA = Object.keys(a);
    const keysB = Object.keys(b);
    if (keysA.length !== keysB.length) return false;
    for (const key of keysA) {
      if (!Object.prototype.hasOwnProperty.call(b, key)) return false;
      if (!deepEqual(a[key], b[key])) return false;
    }
    return true;
  }

  return false;
}

/**
 * Formats a value nicely for display in test results
 */
export function formatValue(val: any): string {
  if (val === undefined) return 'undefined';
  if (val === null) return 'null';
  if (typeof val === 'function') return `[Function: ${val.name || 'anonymous'}]`;
  if (typeof val === 'number' && isNaN(val)) return 'NaN';
  try {
    return JSON.stringify(val);
  } catch {
    return String(val);
  }
}

/**
 * Interface for pluggable language runners
 */
export interface CodeRunner {
  language: Language;
  run(code: string, challenge: Challenge): Promise<ExecutionSummary>;
}

/**
 * In-browser safe JavaScript code runner
 */
export class JavaScriptRunner implements CodeRunner {
  language: Language = 'javascript';

  async run(code: string, challenge: Challenge): Promise<ExecutionSummary> {
    const startTime = performance.now();
    const results: TestResult[] = [];
    const stdoutLogs: string[] = [];

    // Intercept console.log safely
    const originalLog = console.log;
    const originalWarn = console.warn;
    const originalError = console.error;

    const pushLog = (prefix: string, ...args: any[]) => {
      const formatted = args.map(arg => {
        try {
          return typeof arg === 'object' ? JSON.stringify(arg) : String(arg);
        } catch {
          return String(arg);
        }
      }).join(' ');
      stdoutLogs.push(prefix ? `[${prefix}] ${formatted}` : formatted);
    };

    try {
      // Evaluate user code in a functional sandbox
      // Wrap in closure and return the requested function
      const wrappedCode = `
        "use strict";
        ${code}
        if (typeof ${challenge.functionName} !== 'function') {
          throw new Error("Function '${challenge.functionName}' was not defined or is not a function.");
        }
        return ${challenge.functionName};
      `;

      let targetFn: Function;
      try {
        const factory = new Function(wrappedCode);
        targetFn = factory();
      } catch (err: any) {
        return {
          allPassed: false,
          totalTests: challenge.testCases.length,
          passedCount: 0,
          results: [],
          stdout: stdoutLogs,
          executionError: `Syntax / Definition Error: ${err.message || String(err)}`,
          durationMs: Math.round(performance.now() - startTime),
        };
      }

      // Execute each test case
      for (const tc of challenge.testCases) {
        const tcLogs: string[] = [];
        console.log = (...args: any[]) => {
          pushLog('', ...args);
          tcLogs.push(args.map(formatValue).join(' '));
        };
        console.warn = (...args: any[]) => pushLog('warn', ...args);
        console.error = (...args: any[]) => pushLog('error', ...args);

        const tcStartTime = performance.now();
        let passed = false;
        let actual: any;
        let errorMsg: string | undefined;

/**
 * Deep clone helper that preserves functions, arrays, and objects
 */
function safeClone(item: any): any {
  if (item === null || item === undefined || typeof item !== 'object') {
    return item;
  }
  if (typeof item === 'function') {
    return item;
  }
  if (Array.isArray(item)) {
    return item.map(safeClone);
  }
  const copy: any = {};
  for (const k of Object.keys(item)) {
    copy[k] = safeClone(item[k]);
  }
  return copy;
}

        try {
          // Clone inputs to avoid mutation side effects across test cases
          const clonedInputs = safeClone(tc.input);
          
          // Execute function
          actual = targetFn(...clonedInputs);
          
          // Check if it's a promise (async functions)
          if (actual && typeof actual.then === 'function') {
            actual = await actual;
          }

          if (tc.shouldThrow) {
            passed = errorMsg !== undefined;
            if (tc.expectedErrorSubstring && errorMsg) {
              passed = errorMsg.toLowerCase().includes(tc.expectedErrorSubstring.toLowerCase());
            }
          } else {
            passed = !errorMsg && deepEqual(actual, tc.expected);
          }
        } catch (err: any) {
          const caughtMsg = err.message || String(err);
          errorMsg = caughtMsg;
          if (tc.shouldThrow) {
            passed = true;
            if (tc.expectedErrorSubstring) {
              passed = caughtMsg.toLowerCase().includes(tc.expectedErrorSubstring.toLowerCase());
            }
          } else {
            passed = false;
          }
        }

        const tcDuration = Math.round(performance.now() - tcStartTime);

        results.push({
          testCaseId: tc.id,
          description: tc.description,
          passed,
          actual,
          expected: tc.expected,
          error: errorMsg,
          logs: tcLogs,
          executionTimeMs: tcDuration,
          hidden: tc.hidden,
        });
      }

      const passedCount = results.filter(r => r.passed).length;
      const allPassed = passedCount === challenge.testCases.length;

      return {
        allPassed,
        totalTests: challenge.testCases.length,
        passedCount,
        results,
        stdout: stdoutLogs,
        durationMs: Math.round(performance.now() - startTime),
      };
    } finally {
      // Restore native console
      console.log = originalLog;
      console.warn = originalWarn;
      console.error = originalError;
    }
  }
}

/**
 * Extensible runner for TypeScript (strips basic types client-side and evaluates)
 */
export class TypeScriptRunner extends JavaScriptRunner {
  override language: Language = 'typescript';

  override async run(code: string, challenge: Challenge): Promise<ExecutionSummary> {
    // For pure frontend without heavy TS compiler overhead, strip common type annotations:
    // `: string`, `: number`, `: any`, `interface ...`, type assertions
    const strippedCode = code
      .replace(/:\s*[A-Za-z0-9_<>\[\]|&\s]+(?=[,)=;{])/g, '')
      .replace(/as\s+[A-Za-z0-9_<>\[\]]+/g, '');
    return super.run(strippedCode, challenge);
  }
}

/**
 * Runner registry facilitating multi-language expansion
 */
class RunnerRegistry {
  private runners: Map<Language, CodeRunner> = new Map();

  constructor() {
    this.register(new JavaScriptRunner());
    this.register(new TypeScriptRunner());
  }

  register(runner: CodeRunner): void {
    this.runners.set(runner.language, runner);
  }

  getRunner(language: Language): CodeRunner {
    const runner = this.runners.get(language);
    if (!runner) {
      // Default to JavaScript runner with notice
      return this.runners.get('javascript')!;
    }
    return runner;
  }
}

export const runnerRegistry = new RunnerRegistry();

/**
 * Primary evaluation entry point
 */
export async function evaluateCode(
  code: string,
  challenge: Challenge
): Promise<ExecutionSummary> {
  const runner = runnerRegistry.getRunner(challenge.language);
  return runner.run(code, challenge);
}
