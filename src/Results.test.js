import React from 'react';
import ReactDOM from 'react-dom';
import Results from './App';
import { shallow, mount } from 'enzyme';

it('Results renders without crashing', () => {
  const results = shallow(<Results />);
  expect(results).toMatchSnapshot();
});
