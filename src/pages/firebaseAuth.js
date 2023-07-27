import { getAuth, onAuthStateChanged } from 'firebase/auth';


const checkAuth = () => {
  return new Promise((resolve, reject) => {
    const auth = getAuth();
    onAuthStateChanged(auth, (user) => {
      if (user) {
        resolve(user);
      } else {
        reject();
      }
    });
  });
};

export { checkAuth };
