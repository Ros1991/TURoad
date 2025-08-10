import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, View, Dimensions } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
// Removido import do MaterialIcons - usando Unicode como solução definitiva

// Import your screens here
import SplashScreen from '../screens/SplashScreen';
import WelcomeScreen from '../screens/WelcomeScreen';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen';
import HomeScreen from '../screens/HomeScreen';
import ExploreScreen from '../screens/ExploreScreen';
import RoutesScreen from '../screens/RoutesScreen';
import ProfileScreen from '../screens/ProfileScreen';
import CityScreen from '../screens/CityScreen';
import RouteDetailScreen from '../screens/RouteDetailScreen';
import SelectCityScreen from '../screens/SelectCityScreen';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabNavigator() {
  return (
    <View style={{ flex: 1, position: 'relative' }}>
      <Tab.Navigator
        screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName = 'home'; // ícone padrão
          let fallbackIcon = '🏠'; // fallback Unicode
          let label = route.name;
          
          // Calcular largura baseada na tela dividida por 4 botões
          const screenWidth = Dimensions.get('window').width;
          const buttonWidth = screenWidth / 4;
          const isFirstTab = route.name === 'Home';
          const isLastTab = route.name === 'Profile';
          
          // Largura do background: quase todo o espaço, com pequena margem nas extremidades
          const backgroundWidth = isFirstTab || isLastTab ? buttonWidth - 12 : buttonWidth - 4;

          // Ícones Unicode que imitam Material Icons
          if (route.name === 'Home') {
            iconName = 'home-outline';
          } else if (route.name === 'Explore') {
            iconName = 'compass-outline';
          } else if (route.name === 'Routes') {
            iconName = 'map-marker-path';
          } else if (route.name === 'Profile') {
            iconName = 'account-outline';
          }

          return (
            <View style={{
              backgroundColor: focused ? '#EAFBFF' : 'transparent',
              borderRadius: 16,
              paddingVertical: 8,
              alignItems: 'center',
              justifyContent: 'center',
              width: backgroundWidth,
              height: 55,
              marginTop: 16
            }}>
              {/* Ícones Unicode simples - estilo Material */}
              <Icon name={iconName} size={20} color={color} />
                
              <Text style={{
                fontFamily: 'Proxima-Soft',
                fontSize: 11,
                fontWeight: 'bold',
                color: color,
                textAlign: 'center'
              }}>
                {label}
              </Text>
            </View>
          );
        },
        tabBarActiveTintColor: '#035A6E',
        tabBarInactiveTintColor: '#5A5A5A',
        tabBarShowLabel: false, // Remove labels padrão já que renderizamos customizado
        tabBarStyle: {
          backgroundColor: 'white',
          paddingTop: 8,
          paddingBottom: 8,
          paddingHorizontal: 4,
          height: 75,
          borderTopWidth: 0, // Remove borda sólida, substituída pelo degradê
          elevation: 0,
          shadowOpacity: 0
        },
        tabBarItemStyle: {
          paddingHorizontal: 0,
          flex: 1
        }
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen} 
        options={{ headerShown: false }} // Remove o header da Home
      />
      <Tab.Screen name="Explore" component={ExploreScreen} />
      <Tab.Screen name="Routes" component={RoutesScreen} />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen} 
        options={{ headerShown: false }} // Remove o header da Profile
      />
    </Tab.Navigator>
    
    {/* Degradê sutil na borda superior */}
    <LinearGradient
      colors={['rgba(229, 229, 229, 0.0)', 'rgba(229, 229, 229, 0.3)']}
      style={{
        position: 'absolute',
        bottom: 75, // Altura do TabBar
        left: 0,
        right: 0,
        height: 15,
        zIndex: 1
      }}
    />
  </View>
  );
}

function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="Welcome" component={WelcomeScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
        <Stack.Screen name="MainTabs" component={MainTabNavigator} />
        <Stack.Screen name="City" component={CityScreen} />
        <Stack.Screen name="RouteDetail" component={RouteDetailScreen} />
        <Stack.Screen name="SelectCity" component={SelectCityScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default AppNavigator;


