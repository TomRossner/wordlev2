import React, { useEffect } from 'react';
import Tile from './Tile';

const Grid = ({grid, resetGrid}) => {
    

    // Create grid
    useEffect(() => {
        resetGrid();
    }, []);

  return (
    <section id='grid'>
        {grid.map((row, rowIndex) => {
            return (
                <div key={rowIndex} className='row'>
                    {row.map((tile, tileIndex) => {
                        return (
                            <Tile key={tileIndex} tile={tile}/>
                        )
                    })}
                </div>  
            )
        })}
    </section>
  )
}

export default Grid;