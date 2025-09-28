import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// Initialize Firebase Admin only if it hasn't been initialized
let app;
if (getApps().length === 0) {
  const serviceAccount = {
    type: "service_account",
    project_id: "north-harbour-rugby-dashboard1",
    private_key_id: "73e4b81fdf7a99162580db8db8100104c74dc9ec",
    private_key: "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDtapX0lObgNs+p\nBAw5enCUbqld90i9MStQqczXR4bVyashAC6vzbWccI6BFEnoLw97jRu2y63LZVit\nJhgBlo5wHpvQoly2d/WKssfx0fJJjK/QIadhS4Z8rtPms7axYS2TR8vM6/H7PKap\nCMTV6yR+NMOhv9PBJAXb97Ul0oeoV1E4JflHl133cDxY4kzG+qsAD9+EKX37DX7b\nyBORNau2y+x5gAG9FXVbocaf4kgi/cYcRMDyWAz1x4RLFvDnTDYxREtRxtwLsORn\nJO1ihySH0vBzGftjnfMeBI74QrZpVzSs0nwZmKdJMuMsygeqP2gdVS9y6FQDuo6x\nMEH/XJGvAgMBAAECggEABKndUYqYkRBCj/1bssgBl3N9Bt1+o54S+GioH2pw7u4h\nMGrCgALjGF7q+FofrDHlyfWBn9uXCbHEm3zDZ/SUeQYA5Yjq7U1PQ27eQpUZ1JwG\nMBPD0pjF3C51och8mYthISLTPAPpIu2UEH9IQ94fP2Nl8bLE7rxNvn5lI9240HOs\n8p51MpBxwnnejsj8vYlCA4qEWAv4bQHWkVv8zV+2U+O3GqWMQIwGwlf/3aXz3shJ\nUzQzL8EYjNYbVbLGrlwLWH5Wa41a7iR3J/mscLTeuV7OguuctL4wPKgoFWkv4xYv\nblwSOXJb7ePEoVnVpLpjdHd49NgONY01P9h0Bwf88QKBgQD8WEPvQL5tO9beqW+s\nSVB0hqXF+nlPuo2yoK5cBkHoXwQt+thAsGyCsl8cI6GcEeKTM1ieijm3R9t38sFr\n0sT1nJuVC3Me8I0glV5XrilsSAtCA4EiY3ZqK60vxhXQBD7x0oOGMqmLqnh31VhU\na+CVfQoYW898LZhsm19OcmtLiwKBgQDw2vaf5aSCYYXN+k9S9rSCrYsAPJmuhYSF\nuoapFi9ZGRB2TXksrjZG541Dabp4e2Y22xi7769xRKkQflxWlgqPFwrEe2a7v2Lg\ngBPs3M5BakwDeFKGeBaiw1T4iY3RhsEOpJUbyA+UelShvU0LbQevdOPMH4NbB7MC\ndKplzJMm7QKBgB667QL84nPQ/ri875GOmBKotxVmDFHuSQVA1hr01B/lOlATJTSz\nh3NfH4AAwtSLxQjiDt+3u5GbWZnA4VctIrk6aiP7cfiJmNYn+oY4+mhqWZyfaqFy\ndWA2k2+m8s8TRUsTtNqp3sXYa7VEMO6O+Jmb0Zfnzluz/cT0IuYdvv1DAoGBAJpp\nxvN8JpvwKfiEIZbu04tz90mPkHdy4iNaEjsVHgXhK8ysnqMmjWWnzckKX6Ieeslw\nbcsPP0s+2aTZXhmk1+AkxaJx+ssjSCDl++A/L3yAyXrwCPhsxRZUZIVyqplJ6zuY\nCIBnIpXuV5PZ6SsKG4NBTUnwaiZSKVHJufTJ0w2BAoGAfQgzsRQ3C3rBbCPk5uVr\nAMXhqnq9UncvDngi2eqtAJj6hSs0rTFMgpmaZgYTeOUxRq53NoNvz3Kzx7AhlQ/X\nlPG9bKlaSeUAi5hXRBfJnop/Jj1sGoI4YG7U86HaX3FF7Jclyeygtl7ND6K1nOAo\nsGN070Ufyy+2jVo8l6vuI8I=\n-----END PRIVATE KEY-----\n",
    client_email: "north-harbour-migration-servic@north-harbour-rugby-dashboard1.iam.gserviceaccount.com",
    client_id: "117263801496193048795",
    auth_uri: "https://accounts.google.com/o/oauth2/auth",
    token_uri: "https://oauth2.googleapis.com/token",
    auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
    universe_domain: "googleapis.com"
  };

  app = initializeApp({
    credential: cert(serviceAccount as any),
    projectId: "north-harbour-rugby-dashboard1"
  });
} else {
  app = getApps()[0];
}

export const db = getFirestore(app);
export { app };

// Test Firebase connection
export async function testFirebaseConnection() {
  try {
    const testDoc = await db.collection('_test').add({ timestamp: new Date() });
    await db.collection('_test').doc(testDoc.id).delete();
    console.log('✅ Firebase connection successful');
    return true;
  } catch (error) {
    console.error('❌ Firebase connection failed:', error);
    return false;
  }
}