import renderer from 'react-test-renderer';
import Tile from '../components/Tile';

const tileMock = {
    letter: 'a',
    colorClass: 'gray'
}

it('Renders correctly', () => {
    const tile = renderer.create(<Tile tile={tileMock}/>).toJSON();

    expect(tile).toMatchSnapshot();
})