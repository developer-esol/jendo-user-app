import React from 'react';
import { Ionicons, MaterialIcons, MaterialCommunityIcons, FontAwesome, Feather } from '@expo/vector-icons';

type IconLibrary = 'ionicons' | 'material' | 'material-community' | 'fontawesome' | 'feather';

interface IconProps {
  name: string;
  size?: number;
  color?: string;
  library?: IconLibrary;
}

export const Icon: React.FC<IconProps> = ({ 
  name, 
  size = 24, 
  color = '#000', 
  library = 'ionicons' 
}) => {
  switch (library) {
    case 'material':
      return <MaterialIcons name={name as any} size={size} color={color} />;
    case 'material-community':
      return <MaterialCommunityIcons name={name as any} size={size} color={color} />;
    case 'fontawesome':
      return <FontAwesome name={name as any} size={size} color={color} />;
    case 'feather':
      return <Feather name={name as any} size={size} color={color} />;
    default:
      return <Ionicons name={name as any} size={size} color={color} />;
  }
};

export default Icon;
