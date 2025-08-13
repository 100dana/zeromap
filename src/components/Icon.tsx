import React from 'react';
import { Image, ImageStyle, StyleSheet } from 'react-native';

export type IconName = 
  | 'back'
  | 'search'
  | 'home'
  | 'settings'
  | 'notification'
  | 'refresh'
  | 'filter'
  | 'add'
  | 'close'
  | 'refill'

  | 'cosmetics'
  | 'cafe'
  | 'more'
  | 'eco'
  | 'water-drop'
  | 'coffee-cup'
  | 'natural'
  | 'arrow-left'
  | 'magnifying-glass'
  | 'house'
  | 'gear'
  | 'bell'
  | 'dots';

interface IconProps {
  name: IconName;
  size?: number;
  color?: string;
  style?: ImageStyle;
}

export default function Icon({ name, size = 24, color = '#000000', style }: IconProps) {
  const iconSource = getIconSource(name);
  
  return (
    <Image
      source={iconSource}
      style={[
        {
          width: size,
          height: size,
          tintColor: color,
        },
        style,
      ]}
      resizeMode="contain"
    />
  );
}

function getIconSource(name: IconName): any {
  // 아이콘 이름에 따른 소스 매핑
  const iconSources: Record<IconName, any> = {
    back: require('../../assets/icons/arrow-left.png'),
    search: require('../../assets/icons/magnifying-glass.png'),
    home: require('../../assets/icons/house.png'),
    settings: require('../../assets/icons/gear.png'),
    notification: require('../../assets/icons/bell.png'),
    refresh: require('../../assets/icons/refresh.png'),
    filter: require('../../assets/icons/filter.png'),
    add: require('../../assets/icons/add.png'),
    close: require('../../assets/icons/close.png'),
    refill: require('../../assets/icons/water-drop.png'),

    cosmetics: require('../../assets/icons/cosmetics.png'),
    cafe: require('../../assets/icons/coffee-cup.png'),
    more: require('../../assets/icons/dots.png'),
    eco: require('../../assets/icons/eco.png'),
    'water-drop': require('../../assets/icons/water-drop.png'),
    'coffee-cup': require('../../assets/icons/coffee-cup.png'),
    natural: require('../../assets/icons/natural.png'),
    'arrow-left': require('../../assets/icons/arrow-left.png'),
    'magnifying-glass': require('../../assets/icons/magnifying-glass.png'),
    house: require('../../assets/icons/house.png'),
    gear: require('../../assets/icons/gear.png'),
    bell: require('../../assets/icons/bell.png'),
    dots: require('../../assets/icons/dots.png'),
  };

  return iconSources[name];
} 