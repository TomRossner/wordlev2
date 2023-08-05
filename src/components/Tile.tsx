import React, { useEffect } from 'react';
import { ITile } from '../interfaces';

interface TileProps {
  tile: ITile;
}

const Tile: React.FC<TileProps> = ({tile}) => {

  return (
    <div className={`${tile.letter ? 'tile filled' : 'tile'} ${tile.colorClass}`}>
        {tile.letter.toUpperCase()}
    </div>
  )
}

export default Tile;