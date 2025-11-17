import React from 'react';
import {
  getFirestore,
  collection,
  getDocs,
  doc,
  updateDoc,
} from 'firebase/firestore';
import { Button, View, Text } from 'react-native'; // use regular HTML button if on web
import { app } from '@/configs/FirebaseConfig';

const firestore = getFirestore(app);

const AddFieldButton = () => {
  const handleAddField = async () => {
    try {
      const colRef = collection(firestore, 'personsList'); // your collection name
      const snapshot = await getDocs(colRef);

      const updates = snapshot.docs.map(async (docSnap) => {
        const docRef = doc(firestore, 'personsList', docSnap.id);
        await updateDoc(docRef, {
          isAdmin: false, // 👈 new field to add
        });
      });

      await Promise.all(updates);
      alert('Field added to all documents!');
    } catch (error) {
      console.error('Error adding field:', error);
      alert('Something went wrong.');
    }
  };

  return (
    <View className='p-4'>
      <Text className='text-lg mb-2'>Add Field to All Docs</Text>
      <Button
        title='Update Firestore Docs'
        onPress={handleAddField}
      />
    </View>
  );
};

export default AddFieldButton;
