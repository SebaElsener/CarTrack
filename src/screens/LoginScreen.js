
import { useRouter } from "expo-router";
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, TextInput } from "react-native-paper";
import { useAuth } from '../context/AuthContext';
import { supabase } from '../services/supabase';

const router = useRouter()

export default function LoginScreen() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const { setError } = useAuth();

  const login = async () => {
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    setLoading(false)
    if (error) {
      setError(error.message)
      return
    }

    router.replace("/(app)");
  }

  return (
    <View style={styles.container}>
      <TextInput
        label="Email"
        value={email}
        onChangeText={setEmail}
        mode="outlined"
        style={styles.input}
      />

      <TextInput
        label="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        mode="outlined"
        style={styles.input}
      />

      <Button mode="contained" onPress={login} style={styles.button}>
        Ingresar
      </Button>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, marginTop: 150 },
  input: { marginTop: 15 },
  button: { marginTop: 25 },
})