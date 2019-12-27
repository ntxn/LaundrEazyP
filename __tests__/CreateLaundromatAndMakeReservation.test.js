import React from 'react';
import {shallow} from 'enzyme';
import MakeReservation from '../laundreazy/makeReservation';
import FirebaseFunctions from '../laundreazy/firebase';
import LaundromatRegistrationForm from '../laundreazy/owner/laundromatRegistrationForm';
import UserInfo from '../laundreazy/userInfo';


UserInfo.uid = 'nV4rGOKZyTexvMtd3hhn4z1wwPg2';

describe('Create Laundromat and Make Reservation test with Firebase db', () => {
  const laundromat = {
    Name: "Spartan Laundry",
    Street: "1 Washington",
    City: "San Jose",
    State: "CA",
    Zip: "95131",
    Phone: "4083456758",
    Open: new Date(2019, 1, 24, 7, 0),
    Close: new Date(2019, 1, 24, 19, 30),
    WasherPrice: '3',
    DryerPrice: '4.5',
    keywords: ["spartan", "laundry", "spartan laundry", "san jose", "95131"],
  }

  const washers = [{id: '1', status: 0}, {id: '2', status: 0}, {id: '3', status: 0}, {id: '4', status: 0}];
  const dryers = [{id: '1', status: 0}, {id: '2', status: 0}, {id: '3', status: 0}, {id: '4', status: 0}];

  var reservation;

  describe('Create and edit laundromat', () => {
    const lparams = {
      updateLaundromats: jest.fn()
    }
    
    const lnavigation = {
      navigate: jest.fn(),
      goBack: jest.fn(),
      getParam: key => {return lparams[key]},
    }

    it('Create a new laundromat', async () => {
      const component = shallow(<LaundromatRegistrationForm navigation={lnavigation} />);
      const componentInstance = component.instance();

      component.setState({
        laundromatName: laundromat.Name,
        streetAddress: laundromat.Street,
        city: laundromat.City,
        state: laundromat.State,
        zipCode: laundromat.Zip,
        phoneNumber: laundromat.Phone,
        open: laundromat.Open,
        close: laundromat.Close,
        washerPrice: laundromat.WasherPrice,
        dryerPrice: laundromat.DryerPrice,
        washers: washers.length.toString(),
        dryers: dryers.length.toString(),
      });
      const response = await componentInstance.submit();
      laundromat.id = response.id;
      expect(laundromat).toMatchObject(response);
    });

    it('Edit a laundromat', async () => {
      lparams.laundromat = laundromat;
      const component = shallow(<LaundromatRegistrationForm navigation={lnavigation} />);
      const componentInstance = component.instance();

      expect(component.state('editMode')).toBe(true)
      expect(component.state('laundromatName')).toBe(laundromat.Name)
      expect(component.state('streetAddress')).toBe(laundromat.Street)
      expect(component.state('open')).toBe(laundromat.Open)
      expect(component.state('washerPrice')).toBe(laundromat.WasherPrice)

      component.setState({
        laundromatName: 'Spartan Laundry Test'
      })

      const response = await componentInstance.submit();
      laundromat.Name = 'Spartan Laundry Test';
      laundromat.keywords = ["spartan", "laundry", "test", "spartan laundry test", "san jose", "95131"];
      expect(laundromat).toMatchObject(response);
    });
  });

  describe('Reservations', () => {
    const rparams = {
      customerUID: "RandomCustomer",
      laundromat,
      washers,
      dryers,
    }

    const rnavigation = {
      navigate: jest.fn(),
      goBack: jest.fn(),
      getParam: key => {return rparams[key]},
    }

    var date = new Date();
    date = date.setMonth(date.getMonth() + 1);
    date = new Date(date);

    it('Make new reservation', async () => {
      const component = shallow(<MakeReservation navigation={rnavigation}/>)
      const componentInstance = component.instance();

      // Pick a date and time
      component.setState({ date: new Date(date) });
      const datetime = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 17, 0);
      componentInstance.handleDateTimePicked(datetime, 'time'); // 5:00 PM
      expect(component.state('dateTimeErrorMessage')).toEqual('');
      expect(component.state('datetime')).toEqual(datetime);

      // Choose to pick a washer
      component.setState({ washerChecked: true, dryerChecked: false });
      expect(component.state('washerChecked')).toBe(true);
    
      // Pick a washer, currently all machines are available
      componentInstance.pickThisMachine('1');
      expect(component.state('machineUID')).toEqual('1');

      // Confirm book washer 1
      const response = await componentInstance.makeReservation();
      if(response){
        reservation = response;
        expect(response.machineUID).toEqual('1');
        expect(response.machineType).toEqual('washers');
        expect(response.customerUID).toEqual("RandomCustomer");
        expect(response.laundromatUID).toEqual(laundromat.id);
        expect(response.startTime).toEqual(datetime);
      }
    });

    it('Edit a reservation', async () => {
      rparams.reservation = reservation;
      rparams.updateReservations = jest.fn();
      rparams.payment = jest.fn();
      rparams.updatePayment = jest.fn();

      const component = shallow(<MakeReservation navigation={rnavigation}/>)
      const componentInstance = component.instance();

      // Pick a date and time
      component.setState({ date: new Date(date) });
      const datetime = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 8, 0);
      componentInstance.handleDateTimePicked(datetime, 'time'); // 5:00 PM
      expect(component.state('dateTimeErrorMessage')).toEqual('');
      expect(component.state('datetime')).toEqual(datetime);

      // Choose to pick a washer
      component.setState({ washerChecked: false, dryerChecked: true });
      expect(component.state('washerChecked')).toBe(false);
    
      // Pick a washer, currently all machines are available
      componentInstance.pickThisMachine('2');
      expect(component.state('machineUID')).toEqual('2');

      // Confirm book washer 1
      const response = await componentInstance.makeReservation();
      if(response){
        reservation = response;
        expect(response.machineUID).toEqual('2');
        expect(response.machineType).toEqual('dryers');
        expect(response.customerUID).toEqual("RandomCustomer");
        expect(response.laundromatUID).toEqual(laundromat.id);
        expect(response.startTime).toEqual(datetime);
      }
    })
  });

  describe('Delete laundromat and reservations', () => {
    it('Delete laundromat', async () => {
      const response = await FirebaseFunctions.deleteLaundromat(laundromat.id, UserInfo.uid);
      expect(response).toBe(true)
    });
    
    it('Delete reservation', async () => {
      const response = await FirebaseFunctions.cancelReservation(reservation)
      expect(response).toBe(true)
    })
  })
});