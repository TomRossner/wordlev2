import renderer from 'react-test-renderer';
import Grid from '../components/Grid';
import { MAX_GUESSES, WORD_LENGTH } from '../constants';

const createGrid = (rows, cols) => {
    const newGrid = [];

    for (let i = 0; i < rows; i++) {
      const row = [];

      for (let j = 0; j < cols; j++) {
        row.push(tileMock);
      }

      newGrid.push(row);
    }

    return newGrid;
};

const tileMock = {
    letter: "",
    colorClass: "",
}

const gridMock = {
    grid: createGrid(MAX_GUESSES, WORD_LENGTH)
}

it('Renders correctly', () => {
    const grid = renderer.create(<Grid grid={gridMock}/>).toJSON();

    expect(grid).toMatchSnapshot();
});

