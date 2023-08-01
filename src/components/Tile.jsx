import React from 'react';

const Tile = ({tile}) => {

  return (
    <div className={`tile ${tile.colorClass}`}>
        {tile.letter}
    </div>
  )
}

export default Tile;