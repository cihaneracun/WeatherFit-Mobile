import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Keyboard, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

const API_KEY = '781e86a027336829eb3132ae49b12197'; 

export default function WeatherScreen() {
  const [weather, setWeather] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [city, setCity] = useState('Bandirma'); // Varsayılan şehir
  const [inputCity, setInputCity] = useState(''); // Yazılan şehir

  useEffect(() => {
    fetchWeather(city);
  }, []);

 const fetchWeather = async (targetCity: string) => {
    if (!targetCity) return;
    
    setLoading(true);
    try {
      // Şehir ismini URL güvenli hale getiriyoruz (Boşluk ve TR karakter hatasını önler)
      const encodedCity = encodeURIComponent(targetCity.trim());
      
      const response = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather?q=${encodedCity}&appid=${API_KEY}&units=metric&lang=tr`
      );

      setWeather(response.data);
      setLoading(false);
    } catch (error: any) {
      // Hata detayını terminale basar (Hata kodunu buradan görebilirsin)
      console.error("API Detay Hatası:", error.response?.data || error.message);

      // Kullanıcıya dostça ve açıklayıcı bir mesaj gösterir
      const serverMessage = error.response?.data?.message;
      let userFriendlyMessage = "Bir sorun oluştu, lütfen tekrar deneyin.";

      if (serverMessage === "city not found") {
        userFriendlyMessage = "Şehir bulunamadı. Lütfen İngilizce karakterlerle (ist, bandirma vb.) deneyin.";
      } else if (error.message === "Network Error") {
        userFriendlyMessage = "İnternet bağlantısı kurulamadı. Lütfen bağlantınızı kontrol edin.";
      }

      Alert.alert("Hava Durumu Bilgisi", userFriendlyMessage);
      setLoading(false);
    }
  };

  const handleSearch = () => {
    if (inputCity.trim().length > 0) {
      fetchWeather(inputCity);
      setCity(inputCity);
      setInputCity(''); // Kutuyu temizle
      Keyboard.dismiss(); // Klavyeyi kapat
    }
  };

  return (
    <View style={styles.container}>
      {/* Şehir Arama Kısmı */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.input}
          placeholder="Şehir adı yazın..."
          placeholderTextColor="#eee"
          value={inputCity}
          onChangeText={setInputCity}
        />
        <TouchableOpacity style={styles.button} onPress={handleSearch}>
          <Text style={styles.buttonText}>Ara</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#ffffff" />
        </View>
      ) : (
        <View style={styles.weatherBox}>
          <Text style={styles.cityText}>{weather?.name}</Text>
          <Text style={styles.temp}>{Math.round(weather?.main?.temp)}°C</Text>
          <Text style={styles.desc}>{weather?.weather[0]?.description.toUpperCase()}</Text>
          
          <View style={styles.details}>
            <Text style={styles.detailText}>Nem: %{weather?.main?.humidity}</Text>
            <Text style={styles.detailText}>Rüzgar: {weather?.wind?.speed} m/s</Text>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#4A90E2', paddingTop: 60 },
  searchContainer: { flexDirection: 'row', paddingHorizontal: 20, marginBottom: 20 },
  input: {
    flex: 1,
    height: 45,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 10,
    paddingHorizontal: 15,
    color: 'white',
    fontSize: 16
  },
  button: {
    backgroundColor: 'white',
    paddingHorizontal: 20,
    justifyContent: 'center',
    borderRadius: 10,
    marginLeft: 10
  },
  buttonText: { color: '#4A90E2', fontWeight: 'bold' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  weatherBox: { flex: 1, alignItems: 'center', marginTop: 40 },
  cityText: { fontSize: 35, fontWeight: 'bold', color: 'white' },
  temp: { fontSize: 80, fontWeight: '200', color: 'white' },
  desc: { fontSize: 20, color: 'white', letterSpacing: 2, marginTop: 10 },
  details: { 
    marginTop: 30, 
    backgroundColor: 'rgba(255,255,255,0.2)', 
    padding: 20, 
    borderRadius: 15,
    width: '80%'
  },
  detailText: { color: 'white', fontSize: 18, marginVertical: 5, textAlign: 'center' }
});