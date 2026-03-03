import { redirect } from 'next/navigation';

export default function EnPage() {
  redirect('/?lang=en');
}
