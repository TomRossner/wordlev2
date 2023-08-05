import React, { useEffect } from 'react';
import Tile from './Tile.tsx';
import { IGrid, ITile } from '../interfaces';

interface GridProps {
    grid: IGrid;
    resetGrid: () => void
}

const Grid: React.FC<GridProps> = ({grid, resetGrid}) => {
    

    // Create grid
    useEffect(() => {
        resetGrid();
    }, []);

  return (
    <section id='grid' className='tiles-container'>
        {grid.grid.map((row: ITile[], rowIndex: number) => {
            return (
                <div key={rowIndex} className='row'>
                    {row.map((tile: ITile, tileIndex: number) => {
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