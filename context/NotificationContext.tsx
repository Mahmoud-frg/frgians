import { Button, StyleSheet } from 'react-native';
import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import * as Notifications from 'expo-notifications';
import { registerForPushNotificationsAsync } from '@/utils/registerForPushNotificationsAsync';
import { useAuth, useUser } from '@clerk/clerk-expo';
import {
  arrayUnion,
  collection,
  doc,
  getDocs,
  query,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore';
import { db } from '@/configs/FirebaseConfig';
import { router } from 'expo-router';

async function sendPushNotification(expoPushToken: string) {
  const message = {
    to: expoPushToken,
    sound: 'default',
    title: 'Original Title',
    body: 'And here is the body!',
    data: { newsId: 'example-news-id' }, // Customize your payload here
    android: {
      icon: './assets/images/FRG-icon-1030.png',
      color: '#000',
    },
  };

  await fetch('https://exp.host/--/api/v2/push/send', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Accept-encoding': 'gzip, deflate',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(message),
  });
}

interface NotificationContextType {
  expoPushToken: string | null;
  notification: Notifications.Notification | null;
  error: Error | null;
}

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined
);

const useNotification = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error(
      'useNotification must be used within a NotificationProvider'
    );
  }
  return context;
};

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({
  children,
}) => {
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
  const [notification, setNotification] =
    useState<Notifications.Notification | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const notificationListener = useRef<Notifications.Subscription | null>(null);
  const responseListener = useRef<Notifications.Subscription | null>(null);

  const { isLoaded, isSignedIn, userId } = useAuth();

  const { user } = useUser();
  const [code, setCode] = useState<string | null>(null);

  useEffect(() => {
    const fetchCode = async () => {
      if (!user?.primaryEmailAddress?.emailAddress) return;

      const userEmail = user.primaryEmailAddress.emailAddress;

      const personsRef = collection(db, 'personsList');
      const q = query(personsRef, where('frgMail', '==', userEmail));

      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0];
        setCode(doc.id); // document ID is the code
      }
    };

    fetchCode();
  }, [user]);

  const markNewsAsSeen = async (newsId: string, userId: string) => {
    const newsRef = doc(db, 'newsList', newsId);
    await updateDoc(newsRef, {
      seenBy: arrayUnion(userId),
    });
  };

  useEffect(() => {
    if (!isLoaded || !isSignedIn || !code) return;

    // Register for push notifications
    registerForPushNotificationsAsync()
      .then(async (token) => {
        if (token) {
          setExpoPushToken(token);
          if (userId) {
            await setDoc(doc(db, 'pushTokens', userId), { token });
          }
        }
      })
      .catch((err) => {
        console.error('Push notification registration failed:', err);
        setError(err);
        setExpoPushToken(null);
      });

    // Foreground: Notification received
    notificationListener.current =
      Notifications.addNotificationReceivedListener((notification) => {
        setNotification(notification);
      });

    // Background or Foreground: Tapping a notification
    responseListener.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        const data = response.notification.request.content.data;
        const newsId = data.newsId;
        if (newsId) {
          markNewsAsSeen(newsId.toString(), code);

          router.push(`/newsdetails/${newsId}`);
        }
      });

    // Cold start: App opened via notification
    (async () => {
      const lastNotificationResponse =
        await Notifications.getLastNotificationResponseAsync();
      if (lastNotificationResponse) {
        const data = lastNotificationResponse.notification.request.content.data;
        const newsId = data.newsId;
        if (newsId) {
          markNewsAsSeen(newsId.toString(), code);
          router.push(`/newsdetails/${newsId}`);
        }
      }
    })();

    return () => {
      notificationListener.current?.remove();
      responseListener.current?.remove();
    };
  }, [isLoaded, isSignedIn, userId, code]);

  return (
    <>
      {/* Test push button (optional) */}
      {/* <Button
        title='Press to Send Notification'
        onPress={async () => {
          if (expoPushToken) {
            await sendPushNotification(expoPushToken);
          }
        }}
      /> */}

      <NotificationContext.Provider
        value={{ expoPushToken, notification, error }}
      >
        {children}
      </NotificationContext.Provider>
    </>
  );
};

export default useNotification;

const styles = StyleSheet.create({});
