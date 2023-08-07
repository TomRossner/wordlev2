import React from 'react';
import { ITile } from '../interfaces';

interface TileProps {
  tile: ITile;
  handleRemoveShake: () => void; 
}

const Tile: React.FC<TileProps> = ({tile, handleRemoveShake}) => {

  return (
    <div className={`${tile.letter ? 'tile filled' : 'tile'} ${tile.colorClass}`} onAnimationEnd={handleRemoveShake}>
        {tile.letter.toUpperCase()}
    </div>
  )
}

export default Tile;