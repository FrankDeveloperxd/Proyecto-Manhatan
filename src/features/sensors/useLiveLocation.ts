import { ref, set, serverTimestamp } from "firebase/database";
import { rtdb } from "../../lib/firebase";

export function startLiveLocation(uid:string){
  const id = navigator.geolocation.watchPosition(async p=>{
    const { latitude:lat, longitude:lng } = p.coords;
    await set(ref(rtdb, `presence/${uid}`), {
      lat, lng, status: "active", updatedAt: Date.now()
    });
  }, console.error, { enableHighAccuracy:true, maximumAge:5000, timeout:10000 });
  return ()=> navigator.geolocation.clearWatch(id);
}
