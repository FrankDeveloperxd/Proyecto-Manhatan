import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { storage } from "../../lib/firebase";

export async function uploadWorkerPhoto(file: File, workerId: string) {
  const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
  const path = `workers/${workerId}/photo_${Date.now()}.${ext}`;
  const fileRef = ref(storage, path);
  await uploadBytes(fileRef, file);
  const url = await getDownloadURL(fileRef);
  return url;
}
