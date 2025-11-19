// A simple debugging utility that logs messages to the console if the URL contains the parameter debug=1
export default function dbg(message: string): void {

  let isDbg = false;

  // Check for browser environment
  if (typeof window !== 'undefined' && typeof window.location !== 'undefined') {
    const urlParams = new URLSearchParams(window.location.search);
    isDbg = urlParams.get('dbg') === '1';
  }

  // Check for Node.js environment
  if (typeof process !== 'undefined' && process.env && process.env.DBG === '1') {
    isDbg = true;
  }

  if (isDbg) {
    console.log(message);
  }
}
