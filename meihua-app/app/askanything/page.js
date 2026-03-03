import { redirect } from 'next/navigation';

export default function AskAnythingPage() {
  redirect('/?mode=ask');
}
