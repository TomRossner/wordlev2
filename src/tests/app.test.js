import renderer from 'react-test-renderer';
import App from '../App';

it('Renders correctly', () => {
    const tree = renderer.create(<App/>).toJSON();

    expect(tree).toMatchSnapshot();
})

