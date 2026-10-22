import { useRef, useState } from 'react';
export const MEMBER_KEY = 'shanyu-member-v1';
function readMember(): boolean {
  try { return localStorage.getItem(MEMBER_KEY) !== 'false'; }
  catch { return true; }
}
export function useMember() {
  // The demo account is a member by default, so the 95折 offer is on until turned off.
  const [isMember, setIsMember] = useState<boolean>(readMember);
  const latest = useRef(isMember);
  const [storageError, setStorageError] = useState('');
  const toggle = () => {
    const next = !latest.current;
    try {
      localStorage.setItem(MEMBER_KEY, String(next));
      latest.current = next;
      setIsMember(next);
      setStorageError('');
      return next;
    } catch {
      setStorageError('浏览器未能保存会员设置，本次修改未生效。请释放存储空间后重试。');
      return latest.current;
    }
  };
  return { isMember, toggle, storageError };
}
