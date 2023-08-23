export const timed = (originalMethod: (...args: any) => Promise<any>, _context: any) => {
  async function replacementMethod(this: any, ...args: any[]) {
    const start = Date.now();
    const result = await originalMethod.call<any, any, any>(this, ...args);
    const end = Date.now();
    const elapsedTime = end - start;
    console.log(`method '${originalMethod.name}' exec time: ${elapsedTime}ms`);
    return result;
  }

  return replacementMethod;
};
