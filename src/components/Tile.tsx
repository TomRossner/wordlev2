import React from 'react';
import { ITile } from '../interfaces';

interface TileProps {
  tile: ITile;
  handleRemoveShake: () => void; 
}

const Tile: React.FC<TileProps> = ({tile, handleRemoveShake}) => {
  const winAnimation: string = `win 1.2s forwards`;
  const animationDelay: string = tile.delay ? `${tile.delay * 0.2}s` : '';

  return (
    <div
      className={`${tile.letter ? 'tile filled' : 'tile'} ${tile.colorClass ? tile.colorClass : ''}`}
      onAnimationEnd={tile.colorClass.includes('shake') ? handleRemoveShake : undefined}
      style={tile.delay ? {animation: winAnimation, animationDelay} : undefined}
    >
        {tile.letter.toUpperCase()}
    </div>
  )
}

export default Tile;