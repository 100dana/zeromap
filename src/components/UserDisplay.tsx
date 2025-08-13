import firestore from '@react-native-firebase/firestore';

export default async function displayUserName(userId: string | undefined) {
  try {
    const doc = await firestore().collection('users').doc(userId).get();
    return doc.data()?.name ?? 'Unknown';
  } catch (error) {
    console.error('Error getting user name:', error);
    return 'Unknown';
  }
}