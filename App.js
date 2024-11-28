import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';

const geofences = [
  { id: 1, latitude: 37.78825, longitude: -122.4324, radius: 100 },
];

const getDistance = (point1, point2) => {
  const toRad = (value) => (value * Math.PI) / 180;
  const earthRadius = 6371000; // meters

  const dLat = toRad(point2.latitude - point1.latitude);
  const dLon = toRad(point2.longitude - point1.longitude);
  const lat1 = toRad(point1.latitude);
  const lat2 = toRad(point2.latitude);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return earthRadius * c;
};

const App = () => {
  const [location, setLocation] = useState(null);

  useEffect(() => {
    const requestPermissions = async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location access is required.');
        return;
      }

      let currentLocation = await Location.getCurrentPositionAsync({});
      setLocation(currentLocation.coords);
    };

    requestPermissions();
  }, []);

  useEffect(() => {
    if (location) {
      const isInsideGeofence = geofences.some((geofence) => {
        const distance = getDistance(location, geofence);
        return distance < geofence.radius;
      });

      if (isInsideGeofence) {
        Alert.alert('Geofence Alert', 'You entered a geofence area!');
      }
    }
  }, [location]);

  const region = location
    ? {
        latitude: location.latitude,
        longitude: location.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      }
    : null;

  return (
    <View style={styles.container}>
      {region ? (
        <MapView
          style={styles.map}
          region={region}
          onRegionChangeComplete={(newRegion) => console.log('Region Changed:', newRegion)}
        >
          <Marker coordinate={region} title="You are here" />
          {geofences.map((geofence) => (
            <Marker
              key={geofence.id}
              coordinate={{
                latitude: geofence.latitude,
                longitude: geofence.longitude,
              }}
              title={`Geofence ${geofence.id}`}
            />
          ))}
        </MapView>
      ) : (
        <Text>Loading location...</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  map: { width: '100%', height: '100%' },
});

export default App;