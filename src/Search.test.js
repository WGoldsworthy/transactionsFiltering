import React from 'react';
import ReactDOM from 'react-dom';
import Search from './App';
import Results from './App';
import { shallow, mount } from 'enzyme';

import $ from 'jquery';

it('Search renders without crashing', () => {
  const search = shallow(<Search />);
  expect(search).toMatchSnapshot();
});

describe('UserSearch', () => {
	describe('search starts with an empty value and renders', () => {
		const wrapper = mount(<Search />);

		const text = wrapper.find('.user p').text();

		expect(text).toEqual('User: ');

		wrapper.unmount();
	}),

	describe('Searching updates the user value', () => {
		const wrapper = mount(<Results />);

		const input = wrapper.find('.searchInput')

		input.instance().value = "1"
		input.simulate('change');

		const text = wrapper.find('.user p').text()

		expect(text).toEqual('User: 1');
		wrapper.unmount();
	}),

	describe('Start date updates on the timeline', () => {
		const wrapper = mount(<Search />);

		const startDate = wrapper.find('.startDate input');
		startDate.instance().value = "01/01/2018";
		startDate.simulate('change');


		const dateText = wrapper.find('.timelineStart').text();

		expect(dateText).toEqual('Mon Jan 01 2018');

		wrapper.unmount();
	}),

	describe('End date updates on the timeline', () => {
		const wrapper = mount(<Search />);

		const endDate = wrapper.find('.endDate input');
		endDate.instance().value = "02/01/2018";
		endDate.simulate('change');


		const dateText = wrapper.find('.timelineEnd').text();

		expect(dateText).toEqual('Thu Feb 01 2018');

		wrapper.unmount();
	})
})