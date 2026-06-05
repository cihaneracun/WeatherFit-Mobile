import axios from 'axios';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Keyboard,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

const API_KEY = '781e86a027336829eb3132ae49b12197'; 

export default function WeatherScreen() {
  const [weather, setWeather] = useState<any>(null);
  const [forecast, setForecast] = useState<any[]>([]); 
  const [loading, setLoading] = useState(true);
  const [city, setCity] = useState('Bandırma'); 
  const [inputCity, setInputCity] = useState(''); 

  useEffect(() => {
    fetchAllWeatherData(city);
  }, []);

  const fetchAllWeatherData = async (targetCity: string) => {
    if (!targetCity || targetCity.trim() === '') return;
    
    setLoading(true);
    try {
      const encodedCity = encodeURIComponent(targetCity.trim());
      
      const currentRes = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather?q=${encodedCity}&appid=${API_KEY}&units=metric&lang=tr`
      );

      const forecastRes = await axios.get(
        `https://api.openweathermap.org/data/2.5/forecast?q=${encodedCity}&appid=${API_KEY}&units=metric&lang=tr`
      );

      if (forecastRes.data && forecastRes.data.list) {
        const dailyData = forecastRes.data.list.filter((item: any) => 
          item.dt_txt.includes("12:00:00")
        );
        setForecast(dailyData.length > 0 ? dailyData : forecastRes.data.list.slice(0, 5));
      }

      if (currentRes.data) {
        setWeather(currentRes.data);
      }
      
      setLoading(false);
    } catch (error: any) {
      console.log("API Hatası:", error.response?.data || error.message);
      let userFriendlyMessage = "Hava durumu bilgisi alınamadı.";
      if (error.response?.data?.message === "city not found") {
        userFriendlyMessage = "Şehir bulunamadı. Lütfen tekrar deneyin.";
      }
      Alert.alert("Hata", userFriendlyMessage);
      setLoading(false);
    }
  };

  const handleSearch = () => {
    let searchedCity = inputCity.trim();

    if (searchedCity.length > 0) {
      const lowerCity = searchedCity.toLowerCase();
      if (lowerCity === 'panderma' || lowerCity === 'pandirma' || lowerCity === 'bandirma') {
        searchedCity = 'Bandırma';
      } else {
        searchedCity = searchedCity.replace(/(^\w|\s\w)/g, m => m.toUpperCase());
      }

      fetchAllWeatherData(searchedCity);
      setCity(searchedCity);
      setInputCity(''); 
      Keyboard.dismiss(); 
    }
  };

  const getWeatherIcon = (iconCode: string) => {
    if (!iconCode) return 'https://openweathermap.org/img/wn/10d@4x.png';
    return `https://openweathermap.org/img/wn/${iconCode}@4x.png`;
  };

  const getDayName = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', { weekday: 'long' });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      <View style={styles.headerContainer}>
        <Text style={styles.appTitle}>HAVA DURUMU</Text>
        <View style={styles.searchWrapper}>
          <TextInput
            style={styles.input}
            placeholder="Şehir adı yazın..."
            placeholderTextColor="rgba(255,255,255,0.5)"
            value={inputCity}
            onChangeText={setInputCity}
            onSubmitEditing={handleSearch}
          />
          <TouchableOpacity style={styles.searchIconButton} onPress={handleSearch}>
            <Text style={styles.searchIcon}>🔍</Text>
          </TouchableOpacity>
        </View>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#ffffff" />
        </View>
      ) : (
        weather && (
          <ScrollView 
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.mainCard}>
              <Text style={styles.cityText}>{city}</Text>
              
              <Image 
                source={{ uri: getWeatherIcon(weather?.weather?.[0]?.icon) }} 
                style={styles.weatherIcon}
              />
              
              <Text style={styles.temp}>
                {weather?.main?.temp ? Math.round(weather.main.temp) : 0}°
              </Text>
              
              <Text style={styles.desc}>
                {weather?.weather?.[0]?.description ? weather.weather[0].description.toUpperCase() : ''}
              </Text>
            </View>
            
            <View style={styles.statsContainer}>
              <View style={styles.statBox}>
                <Text style={styles.statEmoji}>💧</Text>
                <Text style={styles.statLabel}>Nem</Text>
                <Text style={styles.statValue}>%{weather?.main?.humidity ?? 0}</Text>
              </View>

              <View style={styles.statBox}>
                <Text style={styles.statEmoji}>💨</Text>
                <Text style={styles.statLabel}>Rüzgar</Text>
                <Text style={styles.statValue}>{weather?.wind?.speed ?? 0} m/s</Text>
              </View>
            </View>

            <View style={styles.forecastContainer}>
              <Text style={styles.forecastTitle}>5 Günlük Tahmin</Text>
              
              {forecast.map((item, index) => (
                <View key={index} style={styles.forecastRow}>
                  <Text style={styles.forecastDay}>{getDayName(item.dt_txt)}</Text>
                  
                  <View style={styles.forecastRightSide}>
                    <Image 
                      source={{ uri: getWeatherIcon(item?.weather?.[0]?.icon) }} 
                      style={styles.forecastIcon}
                    />
                    <Text style={styles.forecastTemp}>
                      {Math.round(item?.main?.temp)}°
                    </Text>
                  </View>
                </View>
              ))}
            </View>

          </ScrollView>
        )
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1a1e29' },
  headerContainer: { paddingHorizontal: 20, marginTop: 20, marginBottom: 10 },
  appTitle: { fontSize: 11, fontWeight: '700', color: 'rgba(255,255,255,0.4)', letterSpacing: 2, marginBottom: 8 },
  searchWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', paddingHorizontal: 15, height: 48 },
  input: { flex: 1, color: '#ffffff', fontSize: 15 },
  searchIconButton: { padding: 5 },
  searchIcon: { fontSize: 16 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 40 },
  mainCard: { width: '100%', backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 24, paddingVertical: 20, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', marginTop: 10 },
  cityText: { fontSize: 24, fontWeight: 'bold', color: '#ffffff' },
  weatherIcon: { width: 100, height: 100, marginVertical: -5 },
  temp: { fontSize: 64, fontWeight: '200', color: '#ffffff', lineHeight: 68 },
  desc: { fontSize: 13, color: 'rgba(255,255,255,0.5)', fontWeight: '600', letterSpacing: 1, marginTop: 5 },
  statsContainer: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginTop: 15 },
  statBox: { width: '48%', backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 18, padding: 15, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  statEmoji: { fontSize: 18, marginBottom: 4 },
  statLabel: { fontSize: 11, color: 'rgba(255,255,255,0.4)', fontWeight: '700', textTransform: 'uppercase' },
  statValue: { fontSize: 15, fontWeight: '600', color: '#ffffff', marginTop: 2 },
  forecastContainer: { marginTop: 15, backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 22, paddingHorizontal: 20, paddingVertical: 15, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  forecastTitle: { color: '#ffffff', fontSize: 15, fontWeight: '700', marginBottom: 10, letterSpacing: 0.5 },
  forecastRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.03)', justifyContent: 'space-between' },
  forecastDay: { color: 'rgba(255,255,255,0.85)', fontSize: 15, fontWeight: '500', textTransform: 'capitalize' },
  forecastRightSide: { flexDirection: 'row', alignItems: 'center' },
  forecastIcon: { width: 35, height: 35, marginRight: 15 },
  forecastTemp: { color: '#ffffff', fontSize: 16, fontWeight: '600', width: 35, textAlign: 'right' },
});
