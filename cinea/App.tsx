import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
// import { Routes } from './src/routes'; // Futura importação das rotas

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      {/* <Routes /> Aqui entrará o componente que gerencia as telas */}
    </SafeAreaProvider>
  );
}