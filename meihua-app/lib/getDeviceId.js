import { cookies } from 'next/headers';

export async function getDeviceId() {
  const cookieStore = await cookies();
  return cookieStore.get('device_id')?.value || 'unknown';
}
