
import React from 'react';
import {shallow} from 'enzyme';
import MakeReservation from '../laundreazy/makeReservation';
import * as err from '../laundreazy/errorMessages/makeReservation';


const laundromatInfo = {
  id: 'l1',
  Name: "Spartan Laundry",
  Street: "1 Washington",
  City: "San Jose",
  State: "CA",
  Zip: "95131",
  Phone: "4083456758",
  Open: new Date(2019, 1, 24, 7, 0),
  Close: new Date(2019, 1, 24, 19, 30),
  WasherPrice: 3,
  DryerPrice: 4.5,
  Lat: 37.3362723,
  Long: -121.8833527,
  keywords: ["spartan", "laundry", "spartan laundry", "san jose", "95131"],
}

const washers = [{id: '1', status: 0}, {id: '2', status: 0}, {id: '3', status: 0}, {id: '4', status: 0}];
const dryers = [{id: '1', status: 0}, {id: '2', status: 0}, {id: '3', status: 0}, {id: '4', status: 0}];

const params = {
  customerUID: 'c1',
  laundromat: laundromatInfo,
  washers,
  dryers,
}

const navigation = {
  navigate: jest.fn(),
  getParam: key => {return params[key]},
}

var date = new Date();
date = date.setMonth(date.getMonth() + 1);
date = new Date(date);

describe('MakeReservationInput', () => {
  describe('Rendering, Initial values', () => {
    it('Rendering should match to snapshot', () => {
      const component = shallow(<MakeReservation navigation={navigation}/>)
      expect(component).toMatchSnapshot('Laundromat Page')
    });

    it('Initial value should match the provided data', () => {
      const component = shallow(<MakeReservation navigation={navigation}/>)
      const componentInstance = component.instance();

      expect(componentInstance.props.navigation.getParam('laundromat')).toEqual(laundromatInfo);
      expect(componentInstance.props.navigation.getParam('washers')).toEqual(washers);
      expect(componentInstance.props.navigation.getParam('dryers')).toEqual(dryers);
      expect(componentInstance.props.navigation).toEqual(navigation);
    });
  });

  describe('Constraint/Input validation', () => {
    it('Pick a start time before opening hour', () => {
      const component = shallow(<MakeReservation navigation={navigation}/>)
      const componentInstance = component.instance();
      component.setState({ date: new Date(date) })
      componentInstance.handleDateTimePicked(new Date(date.getFullYear(), date.getMonth(), date.getDate(), 6, 0), 'time'); // 6AM
      expect(component.state('dateTimeErrorMessage')).toEqual(err.reserveOutsideBusinessHour);
    });

    it('Pick a start time after closing hour', () => {
      const component = shallow(<MakeReservation navigation={navigation}/>)
      const componentInstance = component.instance();
      component.setState({ date: new Date(date) })
      componentInstance.handleDateTimePicked(new Date(date.getFullYear(), date.getMonth(), date.getDate(), 22, 10), 'time'); // 10:10 PM
      expect(component.state('dateTimeErrorMessage')).toEqual(err.reserveOutsideBusinessHour);
    });

    it('Pick a start time for a reservation ending after closing hour', () => {
      const component = shallow(<MakeReservation navigation={navigation}/>)
      const componentInstance = component.instance();
      component.setState({ date: new Date(date) })
      componentInstance.handleDateTimePicked(new Date(date.getFullYear(), date.getMonth(), date.getDate(), 19, 0), 'time'); // 7:00 PM
      expect(component.state('dateTimeErrorMessage')).toEqual(err.reservationEndsAfterClosing);
    });

    it("Pick a valid start time", () => {
      const component = shallow(<MakeReservation navigation={navigation}/>)
      const componentInstance = component.instance();
      component.setState({ date: new Date(date) });
      const datetime = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 17, 0);
      componentInstance.handleDateTimePicked(datetime, 'time'); // 5:00 PM
      expect(component.state('dateTimeErrorMessage')).toEqual('');
      expect(component.state('datetime')).toEqual(datetime);
    });
  });
});