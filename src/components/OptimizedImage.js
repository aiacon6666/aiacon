import React from 'react';
import { Image, Platform } from 'react-native';
import FastImage from 'react-native-fast-image';

// Use FastImage on Android/iOS, fallback to Image
const OptimizedImage = (props) => {
  if (Platform.OS === 'web') return <Image {...props} />;
  return (
    <FastImage
      {...props}
      source={typeof props.source === 'number' ? props.source : { uri: props.source.uri, priority: FastImage.priority.normal }}
      resizeMode={FastImage.resizeMode.cover}
    />
  );
};

export default OptimizedImage;
