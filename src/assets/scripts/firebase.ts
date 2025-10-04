import { getApps, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import firebaseConfig from "./config";

// Verifica se todas as variáveis necessárias estão presentes
const requiredConfig = {
  apiKey: firebaseConfig.apiKey,
  authDomain: firebaseConfig.authDomain,
  projectId: firebaseConfig.projectId,
};

const missingKeys = Object.entries(requiredConfig)
  .filter(([, value]) => !value)
  .map(([key]) => key);

if (missingKeys.length > 0) {
  throw new Error(
    `Configuração do Firebase incompleta. Variáveis em falta: ${missingKeys.join(
      ", "
    )}`
  );
}

let app;

if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

export const auth = getAuth(app);
export { app };
