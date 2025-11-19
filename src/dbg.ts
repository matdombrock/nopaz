export default function dbg(message: string): void {
  const urlParams = new URLSearchParams(window.location.search);
  const isDbg = urlParams.get('debug') === '1';
  if (isDbg) {
    console.log(message);
  }
}
