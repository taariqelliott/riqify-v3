// import './index.css'
// import { useState, useEffect } from 'react'
// import { createClient } from '@supabase/supabase-js'
// import { Auth } from '@supabase/auth-ui-react'
// import { ThemeSupa } from '@supabase/auth-ui-shared'
// import { v4 as uuidv4 } from 'uuid'

// const supabase = createClient(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_KEY);

// async function signInWithGithub() {
//   const { data, error } = await supabase.auth.signInWithOAuth({
//     provider: 'github',
//   });
//   if (error) {
//     throw error;
//   }
//   return data;
// }

// async function signOut() {
//   const { error } = await supabase.auth.signOut();
//   if (error) {
//     throw error;
//   }
// }



// /**
//  * Main component of the application.
//  * Handles user authentication and session management.
//  */
// export default function App() {
//   const [session, setSession] = useState(null)
//   const [userId, setUserId] = useState('')
//   const [audio, setAudio] = useState([])

//   const getUser = async () => {

//     try {
//       const { data: { user } } = await supabase.auth.getUser()
//       if (user !== null) {
//         setUserId(user.id);
//       } else {
//         setUserId('');
//       }
//     } catch (error) {
//       console.error('Failed to get user:', error.message)
//     }
//   }


//   async function uploadAudio(e) {
//     let file = e.target.files[0];

//     const { data, error } = await supabase
//       .storage
//       .from("audio")
//       .upload(userId + '/' + uuidv4(), file)

//     if (data) {
//       getAudio()
//     } else {
//       console.error('Failed to upload audio:', error.message)
//     }
//   }

//   async function getAudio() {
//     const { data, error } = await supabase.from('audio').list(userId + '/', {
//       limit: 10,
//       offset: 0,
//       sortBy: {
//         column: 'name', order:
//           'asc'
//       }
//     });

//     if (data) {
//       setAudio(data)
//     } else {
//       console.error('Failed to get audio:', error.message)
//     }
//   }

//   useEffect(() => {
//     getUser();
//     getAudio


//   }, [userId]);



//   useEffect(() => {
//     // Fetch the user's session from Supabase
//     supabase.auth.getSession().then(({ data: { session } }) => {
//       setSession(session)
//     })

//     // Subscribe to changes in the user's authentication state
//     const {
//       data: { subscription },
//     } = supabase.auth.onAuthStateChange((_event, session) => {
//       setSession(session)
//       if (session?.user) {
//         console.log('User info:', session.user)
//       }
//     });



//     // Unsubscribe from the authentication state changes when the component is unmounted
//     return () => subscription.unsubscribe()
//   }, [])

//   /**
//    * Handles signing in with GitHub.
//    */
//   const handleGithubSignIn = async () => {
//     try {
//       const data = await signInWithGithub();
//       // Handle successful sign-in if needed
//       console.log('Sign in successful:', data);
//     } catch (error) {
//       // Handle sign-in error
//       console.error('Failed to sign in with Github:', error.message);
//     }
//   };

//   /**
//    * Handles signing out.
//    */
//   const handleSignOut = async () => {
//     try {
//       await signOut();
//       // Handle successful sign-out if needed
//       console.log('Sign out successful');
//     } catch (error) {
//       // Handle sign-out error
//       console.error('Failed to sign out:', error.message);
//     }
//   }

//   if (!session) {
//     // Render the sign-in page if the user is not authenticated
//     return (
//       <div style={{
//         display: "flex",
//         flexDirection: "column",
//         alignItems: "center",
//         justifyContent: "center",
//         height: "100vh"
//       }}>
//         <h1 className='h1'>Sign-In Page</h1>
//         <Auth
//           supabaseClient={supabase}
//           providers={['github', 'google']}
//           appearance={{
//             theme: ThemeSupa,
//             variables: {
//               default: {
//                 colors: {
//                   brand: 'orangered',
//                   brandAccent: 'green',
//                   brandButtonText: 'white',
//                   defaultButtonText: 'black',
//                   defaultButtonBackgroundHover: 'pink',
//                   defaultButtonBorder: 'red',
//                   dividerBackground: 'green',
//                   anchorTextHoverColor: 'yellow',
//                   inputBorderHover: 'orangered',
//                   inputText: 'orangered',
//                 },
//                 borderWidths: {
//                   buttonBorderWidth: '2px',
//                   inputBorderWidth: '2px',
//                 },
//               },
//             },
//           }}
//           ongithubSignIn={handleGithubSignIn}
//         />

//       </div>
//     )
//   }
//   else {
//     // Render the logged-in page if the user is authenticated
//     return (
//       <div style={{
//         display: "flex",
//         flexDirection: "column",
//         alignItems: "center",
//         justifyContent: "center",
//         height: "100vh"
//       }}>
//         <h1 style={{ margin: 0 }}>Welcome Home</h1>
//         <h1 style={{ margin: 0 }}>Mr. {session.user.user_metadata.name.toUpperCase().split(' ').slice(-1)[0]}</h1>
//         <h4 style={{ margin: 4 }}>@{session.user.user_metadata.user_name}</h4>
//         <img src="https://f4.bcbits.com/img/0024637118_25.jpg" alt="" style={{ paddingBottom: 8, height: 300 }} />
//         <button onClick={handleSignOut}>Sign Out</button>
//       </div>)
//   }
// }