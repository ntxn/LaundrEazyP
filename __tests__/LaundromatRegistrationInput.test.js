
import React from 'react';
import {shallow} from 'enzyme';
import LaundromatRegistrationForm from '../laundreazy/owner/laundromatRegistrationForm';

const params = {
  updateLaundromats: jest.fn()
}

const navigation = {
  navigate: jest.fn(),
  getParam: key => {return params[key]},
}

describe('LaundromatRegistrationFormInput', () => {
  describe('Rendering, Initial values', () => {
    it('Rendering should match to snapshot', () => {
      const component = shallow(<LaundromatRegistrationForm navigation={navigation} />)
      expect(component).toMatchSnapshot('Laundromat Registration Form')
    });

    it('Checking initial values of state and props for adding new laundromat', () => {
      const component = shallow(<LaundromatRegistrationForm navigation={navigation} />)

      // Accessing component state
      expect(component.state('state')).toBe('');
      expect(component.state('stateErrorMessage')).toBe('');
      expect(component.state('open').getHours()).toBe(8);
      expect(component.state('close').getHours()).toBe(19);
    })
  });

  describe('Accessing class functions', () => {
    it('updateErrorMessage', () => {
      const component = shallow(<LaundromatRegistrationForm navigation={navigation} />)
      const componentInstance = component.instance();

      // if(!variable && !error)
      expect(component.state('state')).toBe('');
      expect(component.state('stateErrorMessage')).toBe('');
      componentInstance.updateErrorMessage(component.state('state'), component.state('stateErrorMessage'), "stateErrorMessage");
      expect(component.state('stateErrorMessage')).toBe("Required field");
      
      // else
      component.setState({stateErrorMessage: 'Enter 2 letters for State'});
      expect(component.state('stateErrorMessage')).toBe('Enter 2 letters for State');
      componentInstance.updateErrorMessage(component.state('state'), component.state('stateErrorMessage'), "stateErrorMessage");
      expect(component.state('stateErrorMessage')).toBe('Enter 2 letters for State');
      component.setState({stateErrorMessage: ''});
    });

    it('validateField', () => {
      const component = shallow(<LaundromatRegistrationForm navigation={navigation} />)
      const componentInstance = component.instance();

      // Empty input
      expect(component.state('city')).toBe('');
      expect(component.state('cityErrorMessage')).toBe('');
      componentInstance.validateField('city', '', 'cityErrorMessage');
      expect(component.state('cityErrorMessage')).toBe('Required field');

      // Non-empty input
      componentInstance.validateField('city', 'San Jose', 'cityErrorMessage');
      expect(component.state('cityErrorMessage')).toBe('');
      expect(component.state('city')).toBe('San Jose');
    })

    it('validateField with all parameters', () => {
      const component = shallow(<LaundromatRegistrationForm navigation={navigation} />)
      const componentInstance = component.instance();

      // Checking initial values and initialize variables
      expect(component.state('zipCode')).toBe('');
      expect(component.state('zipCodeErrorMessage')).toBe('');
      var zipCode = '';
      const errorMessage = "Enter 5 digit number for Zip Code";

      // Empty input
      componentInstance.validateField('zipCode', zipCode, 'zipCodeErrorMessage', (zipCode ? zipCode.length === 5 : false) && RegExp(/^\d+$/).test(zipCode), errorMessage);
      expect(component.state('zipCode')).toBe('');
      expect(component.state('zipCodeErrorMessage')).toBe('Required field');

      // non-empty input but fail condition 1
      zipCode = '392';
      componentInstance.validateField('zipCode', zipCode, 'zipCodeErrorMessage', (zipCode ? zipCode.length === 5 : false) && RegExp(/^\d+$/).test(zipCode), errorMessage);
      expect(component.state('zipCode')).toBe('');
      expect(component.state('zipCodeErrorMessage')).toBe(errorMessage);

      // non-empty input but fail condition 2
      zipCode = '392dg';
      componentInstance.validateField('zipCode', zipCode, 'zipCodeErrorMessage', (zipCode ? zipCode.length === 5 : false) && RegExp(/^\d+$/).test(zipCode), errorMessage);
      expect(component.state('zipCode')).toBe('');
      expect(component.state('zipCodeErrorMessage')).toBe(errorMessage);

      // non-empty input, meet all conditions
      zipCode = '39232';
      componentInstance.validateField('zipCode', zipCode, 'zipCodeErrorMessage', (zipCode ? zipCode.length === 5 : false) && RegExp(/^\d+$/).test(zipCode), errorMessage);
      expect(component.state('zipCodeErrorMessage')).toBe('');
      expect(component.state('zipCode')).toBe(zipCode);
    });

    it('validateInput', () => {
      const component = shallow(<LaundromatRegistrationForm navigation={navigation} />)
      const componentInstance = component.instance();

      // Check initial conditions
      expect(component.state('laundromatName')).toBe('');
      expect(component.state('streetAddress')).toBe('');
      expect(component.state('city')).toBe('');
      expect(component.state('state')).toBe('');
      expect(component.state('zipCode')).toBe('');
      expect(component.state('phoneNumber')).toBe('');
      expect(component.state('dryers')).toBe('');
      expect(component.state('washers')).toBe('');

      // All fields are empty
      componentInstance.validate();
      expect(component.state('laundromatName')).toBe('');
      expect(component.state('streetAddress')).toBe('');
      expect(component.state('city')).toBe('');
      expect(component.state('state')).toBe('');
      expect(component.state('zipCode')).toBe('');
      expect(component.state('phoneNumber')).toBe('');
      expect(component.state('washers')).toBe('');
      expect(component.state('dryers')).toBe('');
      expect(component.state('nameErrorMessage')).toBe('Required field');
      expect(component.state('streetAddressErrorMessage')).toBe('Required field');
      expect(component.state('cityErrorMessage')).toBe('Required field');
      expect(component.state('stateErrorMessage')).toBe('Required field');
      expect(component.state('zipCodeErrorMessage')).toBe('Required field');
      expect(component.state('phoneNumberErrorMessage')).toBe('Required field');
      expect(component.state('washersErrorMessage')).toBe('Required field');
      expect(component.state('dryersErrorMessage')).toBe('Required field');

      // Some fields are empty, some are not empty but has error messages, some are non-empty and don't have any error messages
      componentInstance.validateField('city', 'San Jose', 'cityErrorMessage');
      expect(component.state('cityErrorMessage')).toBe('');
      expect(component.state('city')).toBe('San Jose');

      var zipCode = '392dg';
      const errorMessage = 'Enter 5 digit number for Zip Code'
      componentInstance.validateField('zipCode', zipCode, 'zipCodeErrorMessage', (zipCode ? zipCode.length === 5 : false) && RegExp(/^\d+$/).test(zipCode), errorMessage);
      expect(component.state('zipCode')).toBe('');
      expect(component.state('zipCodeErrorMessage')).toBe(errorMessage);

      componentInstance.validate();
      expect(component.state('laundromatName')).toBe('');
      expect(component.state('streetAddress')).toBe('');
      expect(component.state('city')).toBe('San Jose');
      expect(component.state('state')).toBe('');
      expect(component.state('zipCode')).toBe('');
      expect(component.state('phoneNumber')).toBe('');
      expect(component.state('washers')).toBe('');
      expect(component.state('dryers')).toBe('');
      expect(component.state('nameErrorMessage')).toBe('Required field');
      expect(component.state('streetAddressErrorMessage')).toBe('Required field');
      expect(component.state('cityErrorMessage')).toBe('');
      expect(component.state('stateErrorMessage')).toBe('Required field');
      expect(component.state('zipCodeErrorMessage')).toBe(errorMessage);
      expect(component.state('phoneNumberErrorMessage')).toBe('Required field');
      expect(component.state('washersErrorMessage')).toBe('Required field');
      expect(component.state('dryersErrorMessage')).toBe('Required field');

      // All fields are non-empty and don't have any error messages
      zipCode = '39232';
      const state = 'CA';
      const phoneNumber = "1234567890"
      const washers = "3"
      const dryers = "3"
      componentInstance.validateField('laundromatName', 'Lee Laundromat', 'nameErrorMessage');
      componentInstance.validateField('streetAddress', '123 Washington', 'streetAddressErrorMessage');
      componentInstance.validateField('city', 'San Jose', 'cityErrorMessage');
      componentInstance.validateField('state', state, 'stateErrorMessage', (state ? state.length === 2 : false) && RegExp(/^[a-zA-Z\-]+$/).test(state), "Enter 2 letters for State");
      componentInstance.validateField('zipCode', zipCode, 'zipCodeErrorMessage', (zipCode ? zipCode.length === 5 : false) && RegExp(/^\d+$/).test(zipCode), errorMessage);
      componentInstance.validateField('phoneNumber', phoneNumber, 'phoneNumberErrorMessage', (phoneNumber ? phoneNumber.length === 10 : false) && RegExp(/^\d+$/).test(phoneNumber), "Enter 10 digit number for Phone number");
      componentInstance.validateField('washers', washers, 'washersErrorMessage', (washers <= 15) && RegExp(/^\d+$/).test(washers), "Maximum number of washers is 15");
      componentInstance.validateField('dryers', dryers, 'dryersErrorMessage', (dryers <= 15) && RegExp(/^\d+$/).test(dryers), "Maximum number of dryers is 15");
      
      componentInstance.validate();
      expect(component.state('laundromatName')).toBe('Lee Laundromat');
      expect(component.state('streetAddress')).toBe('123 Washington');
      expect(component.state('city')).toBe('San Jose');
      expect(component.state('state')).toBe('CA');
      expect(component.state('zipCode')).toBe('39232');
      expect(component.state('phoneNumber')).toBe('1234567890');
      expect(component.state('washers')).toBe('3');
      expect(component.state('dryers')).toBe('3');
      expect(component.state('nameErrorMessage')).toBe('');
      expect(component.state('streetAddressErrorMessage')).toBe('');
      expect(component.state('cityErrorMessage')).toBe('');
      expect(component.state('stateErrorMessage')).toBe('');
      expect(component.state('zipCodeErrorMessage')).toBe('');
      expect(component.state('phoneNumberErrorMessage')).toBe('');
      expect(component.state('washersErrorMessage')).toBe('');
      expect(component.state('dryersErrorMessage')).toBe('');
    })
  });
});