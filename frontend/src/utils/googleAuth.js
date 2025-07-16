// Google OAuth utility functions
export const initializeGoogleAPI = () => {
  return new Promise((resolve, reject) => {
    if (typeof window !== 'undefined' && window.gapi) {
      window.gapi.load('auth2', () => {
        window.gapi.auth2.init({
          client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID || '839466896691-sbp75gvd382h6omr7uvdjed94mob92db.apps.googleusercontent.com',
        }).then(() => {
          resolve(window.gapi.auth2.getAuthInstance());
        }).catch(reject);
      });
    } else {
      reject(new Error('Google API not loaded'));
    }
  });
};

export const signInWithGoogle = async () => {
  try {
    const authInstance = await initializeGoogleAPI();
    const user = await authInstance.signIn();
    const profile = user.getBasicProfile();
    
    return {
      id: profile.getId(),
      name: profile.getName(),
      email: profile.getEmail(),
      imageUrl: profile.getImageUrl(),
      token: user.getAuthResponse().id_token,
    };
  } catch (error) {
    console.error('Google sign in error:', error);
    throw error;
  }
};

export const signOutGoogle = async () => {
  try {
    const authInstance = await initializeGoogleAPI();
    await authInstance.signOut();
  } catch (error) {
    console.error('Google sign out error:', error);
    throw error;
  }
};
