import { images } from '@/constants/images';
import React, { useMemo } from 'react';
import { Image } from 'react-native';

const TILE_SIZE = 80;

const TiledBackground = ({
  width,
  height,
}: {
  width: number;
  height: number;
}) => {
  const rows = Math.ceil(height / TILE_SIZE);
  const cols = Math.ceil(width / TILE_SIZE);

  const tiles = useMemo(() => {
    const result = [];
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        result.push(
          <Image
            key={`${row}-${col}`}
            source={images.darkBG3}
            style={{
              width: TILE_SIZE,
              height: TILE_SIZE,
              position: 'absolute',
              top: row * TILE_SIZE,
              left: col * TILE_SIZE,
              tintColor: '#000000',
            }}
            resizeMode='cover'
          />
        );
      }
    }
    return result;
  }, [width, height]);

  return <>{tiles}</>;
};

export default TiledBackground;
