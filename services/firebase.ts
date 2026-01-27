// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyC_dX5748d3xPWb-eRVJxmllcGrechODPM",
  authDomain: "kingshms-hotel.firebaseapp.com",
  projectId: "kingshms-hotel",
  storageBucket: "kingshms-hotel.firebasestorage.app",
  messagingSenderId: "796908142992",
  appId: "1:796908142992:web:cf6d75fdd4f476acae3315",
  measurementId: "G-PPP4RC300Y"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const storage = getStorage(app);

async function uploadCategoryImage(categoryId: string, file: File): Promise<string> {
  const safeName = file.name.replace(/[^\w.\-]/g, '_');
  const fileRef = ref(storage, `categories/${categoryId}/${Date.now()}-${safeName}`);
  const snapshot = await uploadBytes(fileRef, file, { contentType: file.type });
  return await getDownloadURL(snapshot.ref);
}

async function uploadCategoryGallery(categoryId: string, files: File[]): Promise<string[]> {
  const urls: string[] = [];
  for (const f of files) {
    const url = await uploadCategoryImage(categoryId, f);
    urls.push(url);
  }
  return urls;
}

export { app, analytics, storage, uploadCategoryImage, uploadCategoryGallery };
