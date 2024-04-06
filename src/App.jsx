import './index.css'
import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import { AudioPlayer } from 'react-audio-player-component'

const supabase = createClient(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_KEY);

async function signInWithGithub() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'github',
  });
  if (error) {
    throw error;
  }
  return data;
}

async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) {
    throw error;
  }
}

export default function App() {
  const [session, setSession] = useState(null)
  const [userId, setUserId] = useState('')
  const [audio, setAudio] = useState([])
  const [audioLoading, setAudioLoading] = useState(false); // State for audio loading indicator

  const getUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (user !== null) {
        setUserId(user.id);
      } else {
        setUserId('');
      }
    } catch (error) {
      console.error('Failed to get user:', error.message)
    }
  }
  async function uploadAudio(e) {
    let file = e.target.files[0];
    let fileName = file.name;

    const { data, error } = await supabase
      .storage
      .from("audio")
      .upload(userId + '/' + fileName, file)

    if (data) {
      // Append the metadata of the newly uploaded audio file to the existing list
      setAudio(prevAudio => [...prevAudio, {
        name: fileName,
        size: file.size, // Add other metadata if needed
        // Add other metadata properties as needed
      }]);
      document.getElementById("fileUploader").value = "";
    } else {
      console.error('Failed to upload audio:', error.message)
    }
  }



  async function getAudio() {
    setAudioLoading(true); // Set loading to true when fetching audio
    const { data, error } = await supabase
      .storage
      .from('audio')
      .list(userId + '/', {
        limit: 10,
        offset: 0,
        sortBy: {
          column: 'name',
          order: 'asc'
        }
      });

    if (data) {
      // Filter out placeholder files
      const filteredData = data.filter(item => !item.name.startsWith('.emptyFolderPlaceholder'));
      setAudio(filteredData);
      setAudioLoading(false); // Set loading to false after fetching audio
      document.getElementById("fileUploader").value = "";

    } else {
      console.error('Failed to get audio:', error.message)
    }
  }


  async function deleteAudio(name) {
    const { error } = await supabase
      .storage
      .from('audio')
      .remove(`${userId}/${name}`);
    if (error) {
      console.error('Failed to delete audio:', error.message);
    } else {
      await getAudio(); // Fetch updated list of audio after deleting
    }
  }


  useEffect(() => {
    getUser();
    getAudio();
  }, [userId]);

  useEffect(() => {
    // Fetch the user's session from Supabase
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })

    // Subscribe to changes in the user's authentication state
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      if (session?.user) {
        console.log('User info:', session.user)
      }
    });

    // Unsubscribe from the authentication state changes when the component is unmounted
    return () => subscription.unsubscribe()
  }, [])

  const handleGithubSignIn = async () => {
    try {
      const data = await signInWithGithub();
      console.log('Sign in successful:', data);
    } catch (error) {
      console.error('Failed to sign in with Github:', error.message);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      console.log('Sign out successful');
    } catch (error) {
      console.error('Failed to sign out:', error.message);
    }
  }

  // console.log("user id", session?.user?.id);

  return (
    <div>
      {!session ? (
        <Auth
          supabaseClient={supabase}
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
      ) : (
        <div className="app-container">
          <div className="upload-container">
            <h1>Riqify 3.0</h1>
            {session?.user?.user_metadata.user_name ? <h3>@{session?.user?.user_metadata.user_name}</h3> : <h3>{session?.user?.email}</h3>}
            <input type="file" onChange={uploadAudio} id='fileUploader' />
          </div>
          {audioLoading ? (
            <div>Loading...</div>
          ) : (
            <div className="audio-list">
              {audio.length > 0 && (
                <div className="audio-scroll-container">
                  {audio.map((audio, index) => (
                    <div key={audio.id || index} className="audio-item">
                      <h3 className="songName">Song: {audio.name}</h3>
                      <AudioPlayer
                        src={`https://lsbkkaiphnpnizappfrw.supabase.co/storage/v1/object/public/audio/${userId}/${audio.name}`}
                        minimal={false}
                        width={330}
                        trackHeight={50}
                        barWidth={1}
                        gap={2}
                        visualise={true}
                        backgroundColor="orangered"
                        barColor="black"
                        barPlayedColor="white"
                        skipDuration={2}
                        showLoopOption={true}
                        showVolumeControl={true}
                        seekBarColor="white"
                        volumeControlColor="white"
                      />
                      <button onClick={() => deleteAudio(audio.name)}>Delete</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          <button className="sign-out-btn" onClick={handleSignOut}>Sign Out</button>
        </div>
      )}
    </div>
  );

}
