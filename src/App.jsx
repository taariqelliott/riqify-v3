import './index.css'
import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'

const supabase = createClient(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_KEY);

async function signInWithGithub() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'github',
  })
}

async function signOut() {
  const { error } = await supabase.auth.signOut()
}


export default function App() {
  const [session, setSession] = useState(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      if (session?.user) {
        console.log('User info:', session.user)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleGithubSignIn = async () => {
    try {
      await signInWithGithub();
    } catch (error) {
      console.error('Failed to sign in with Github:', error.message);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Failed to sign out:', error.message);
    }
  }

  if (!session) {
    return (
      <div style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh"
      }}>
        <h1 className='h1'>Sign-In Page</h1>
        <Auth
          supabaseClient={supabase}
          providers={['github', 'google']}
          appearance={{
            theme: ThemeSupa,
            variables: {
              default: {
                colors: {
                  brand: 'orangered',
                  brandAccent: 'green',
                  brandButtonText: 'white',
                  defaultButtonText: 'black',
                  defaultButtonBackgroundHover: 'pink',
                  defaultButtonBorder: 'red',
                  dividerBackground: 'green',
                  anchorTextHoverColor: 'yellow',
                  inputBorderHover: 'orangered',
                  inputText: 'orangered',
                },
                borderWidths: {
                  buttonBorderWidth: '2px',
                  inputBorderWidth: '2px',
                },
              },
            },
          }}
          ongithubSignIn={handleGithubSignIn}
        />

      </div>
    )
  }
  else {
    return (
      <div style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh"
      }}>
        <h1>Logged In!</h1>
        <button onClick={handleSignOut}>Sign Out</button>
      </div>)
  }
}

