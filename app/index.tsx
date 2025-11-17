import { useState } from 'react';
import { useRouter } from 'expo-router';
import AppLoadingScreen from '@/components/LoadingScreen/AppLoadingScreen';

export default function Index() {
  const router = useRouter();
  const [loadingDone, setLoadingDone] = useState(false);

  if (!loadingDone) {
    return <AppLoadingScreen onFinish={() => {}} />;
  }

  return null;
}
