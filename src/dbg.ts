// A simple debugging utility that logs messages to the console if the URL contains the parameter debug=1
export default function dbg(message: string): void {
  const urlParams = new URLSearchParams(window.location.search);
  const isDbg = urlParams.get('debug') === '1';
  if (isDbg) {
    console.log(message);
  }
}
