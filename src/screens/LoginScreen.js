
import { useState } from 'react'
import { Alert, Button, TextInput, View } from 'react-native'
import { supabase } from '../services/supabase'

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const login = async () => {
    setLoading(true)

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    setLoading(false)

    if (error) Alert.alert('Error', error.message)
    navigation.navigate('Inicio')
  }

  return (
    <View>
      <TextInput placeholder="Email" onChangeText={setEmail} />
      <TextInput placeholder="Password" secureTextEntry onChangeText={setPassword} />
      <Button title={loading ? 'Ingresando...' : 'Login'} onPress={login} />
    </View>
  )
}