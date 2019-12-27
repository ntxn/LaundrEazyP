import React from 'react';
import {
  SafeAreaView,
  ScrollView,
  Text
} from 'react-native';
import Proptypes from 'prop-types';

import {
  Button,
  Input,
  Divider
} from 'react-native-elements';
import DateTimePicker from "react-native-modal-datetime-picker";
import Icon from 'react-native-vector-icons/FontAwesome';

import FirebaseFunctions from '../firebase';
import {
  DRYER,
  MAX_MACHINES_NUM,
  WASHER,
} from '../commonConstants';
import Utilities from '../utilities'; 
import UserInfo from '../userInfo';
import styles from '../stylesheets/styles';

export default class LaundromatRegistrationForm extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      editMode: false,
      isTimePickerVisible: false,
      businessTimeMode: '',
      laundromatName: '',
      streetAddress: '',
      city: '',
      state: '',
      zipCode: '',
      phoneNumber: '',
      washers: '',
      dryers: '',
      washerPrice: '1.5',
      dryerPrice: '2',
      open: new Date(2020, 1, 1, 8, 0),
      close: new Date(2020, 1, 1, 19, 0),
      errorMessage: '',
      nameErrorMessage: '',
      streetAddressErrorMessage: '',
      cityErrorMessage: '',
      stateErrorMessage: '',
      zipCodeErrorMessage: '',
      phoneNumberErrorMessage: '',
      washersErrorMessage: '',
      dryersErrorMessage: '',
      timeErrorMessage: '',
      washerPriceErrorMessage: '',
      dryerPriceErrorMessage: '',
    }
  }

  componentDidMount() {
    if(this.props.navigation.getParam('laundromat')){
      const laundromat = this.props.navigation.getParam('laundromat');
      this.setState({
        editMode: true,
        laundromatName: laundromat.Name,
        streetAddress: laundromat.Street,
        city: laundromat.City,
        state: laundromat.State,
        zipCode: laundromat.Zip,
        phoneNumber: laundromat.Phone,
        washerPrice: laundromat.WasherPrice,
        dryerPrice: laundromat.DryerPrice,
        open: laundromat.Open,
        close: laundromat.Close,
      })
    }
  }

  validate = () => {
    if(this.state.laundromatName && this.state.streetAddress && this.state.city &&
      this.state.state && this.state.zipCode && this.state.phoneNumber && 
      !this.state.timeErrorMessage && !this.state.washerPriceErrorMessage && !this.state.dryerPriceErrorMessage)
      return true;

    this.updateErrorMessage(this.state.laundromatName, this.state.nameErrorMessage, "nameErrorMessage")
    this.updateErrorMessage(this.state.streetAddress, this.state.streetAddressErrorMessage, "streetAddressErrorMessage")
    this.updateErrorMessage(this.state.city, this.state.cityErrorMessage, "cityErrorMessage")
    this.updateErrorMessage(this.state.state, this.state.stateErrorMessage, "stateErrorMessage")
    this.updateErrorMessage(this.state.zipCode, this.state.zipCodeErrorMessage, "zipCodeErrorMessage")
    this.updateErrorMessage(this.state.phoneNumber, this.state.phoneNumberErrorMessage, "phoneNumberErrorMessage")
    this.updateErrorMessage(this.state.washers, this.state.washersErrorMessage, "washersErrorMessage")
    this.updateErrorMessage(this.state.dryers, this.state.dryersErrorMessage, "dryersErrorMessage")

    return false;
  }

  updateErrorMessage = (variable, error, errorMessageVariable) => {
    if(!variable && !error)
      this.setState({ [errorMessageVariable]: "Required field" });
  }

  validateField = (input, value, fieldError, conditions=true, errorMessage='') => {
    if(!value)
      this.setState({ [fieldError]: "Required field" });
    else if(conditions)
      this.setState({
        [input]: value,
        [fieldError]: "",
      });
    else
      this.setState({ [fieldError]: errorMessage });
  }

  submit = async () => {
    const {laundromatName, streetAddress, city, state, zipCode, phoneNumber, open, close, washerPrice, dryerPrice} = this.state;

    var keywords = laundromatName.toLowerCase().split(" ");
    keywords.push(laundromatName.toLowerCase());
    keywords.push(city.toLowerCase());
    keywords.push(zipCode);

    const laundromatInfo ={
      Name: laundromatName,
      Street: streetAddress,
      City: city,
      State: state,
      Zip: zipCode,
      Phone: phoneNumber,
      Open: open,
      Close: close,
      WasherPrice: washerPrice,
      DryerPrice: dryerPrice,
      keywords
    }

    if(this.validate()){
      const response = this.state.editMode ?
        await FirebaseFunctions.createOrUpdateLaundromat(laundromatInfo, this.props.navigation.getParam('laundromat').id) :
        await FirebaseFunctions.createOrUpdateLaundromat(laundromatInfo, null, UserInfo.uid);

      if(!response)
        this.setState({errorMessage: "Please enter a valid address"});
      else {
        if(!this.state.editMode){
          await FirebaseFunctions.addMachines(WASHER, parseInt(this.state.washers), response);
          await FirebaseFunctions.addMachines(DRYER, parseInt(this.state.dryers), response);
          laundromatInfo.id = response;
        } else {
          laundromatInfo.id = this.props.navigation.getParam('laundromat').id;
        }

        this.props.navigation.getParam('updateLaundromats')(laundromatInfo);
        this.props.navigation.goBack();
        return laundromatInfo;
      }
  }}

  toggleTimePicker = (businessTimeMode) => this.setState(prevState => ({
    isTimePickerVisible: !prevState.isTimePickerVisible,
    businessTimeMode,
  }))

  timeInMinute = time => { return time.getHours() * 60 + time.getMinutes(); }

  handleTimePicked = (time) => {
    const timeErrorMessage = "Close time has to be after open time";
    const {businessTimeMode} = this.state;
    this.setState({
      [businessTimeMode]: time,
      timeErrorMessage: '',
    }, () => {
      this.timeInMinute(this.state.close) <= this.timeInMinute(this.state.open) &&
        this.setState({timeErrorMessage});
    })

    this.toggleTimePicker("");
  };


  render() {
    const {isTimePickerVisible, open, close, washerPrice, dryerPrice} = this.state;

    return (
      <ScrollView style={{ padding: 15 }}>
        <Input
          defaultValue={this.state.editMode ? this.state.laundromatName : null}
          type="text"
          label="Laundromat Name"
          leftIcon={
            <Icon
              name='user'
              color='grey'
              size={24}
              style={{ paddingRight: 10 }}
            />
          }
          textContentType={"organizationName"}
          onChangeText={(laundromatName) => this.validateField('laundromatName', laundromatName, "nameErrorMessage")}
          errorMessage={this.state.nameErrorMessage}
          containerStyle={styles.inputStyle}
        />
        <Input
          defaultValue={this.state.editMode ? this.state.streetAddress: null}
          type="text"
          label="Street Address"
          leftIcon={
            <Icon
              name='address-card'
              color='grey'
              size={24}
              style={{ paddingRight: 10 }}
            />
          }
          autoCapitalize={"words"}
          autoCompleteType={"street-address"}
          textContentType={"streetAddressLine1"}
          onChangeText={(streetAddress) => this.validateField('streetAddress', streetAddress, "streetAddressErrorMessage")}
          errorMessage={this.state.streetAddressErrorMessage}
          containerStyle={styles.inputStyle}
        />
        <Input
          defaultValue={this.state.editMode ? this.state.city: null}
          type="text"
          label="City"
          leftIcon={
            <Icon
              name='address-card'
              color='grey'
              size={24}
              style={{ paddingRight: 10 }}
            />
          }
          autoCapitalize={"words"}
          textContentType={"addressCity"}
          onChangeText={(city) => this.validateField('city', city, "cityErrorMessage")}
          errorMessage={this.state.cityErrorMessage}
          containerStyle={styles.inputStyle}
        />
        <Input
          defaultValue={this.state.editMode ? this.state.state : null}
          type="text"
          label="State"
          leftIcon={
            <Icon
              name='address-card'
              color='grey'
              size={24}
              style={{ paddingRight: 10 }}
            />
          }
          textContentType={"addressState"}
          maxLength={2}
          autoCapitalize={"characters"}
          autoCorrect={false}
          onChangeText={(state) => this.validateField(
            'state',
            state,
            "stateErrorMessage",
            (state ? state.length === 2 : false) && RegExp(/^[a-zA-Z\-]+$/).test(state),
            "Enter 2 letters for State"
          )}
          errorMessage={this.state.stateErrorMessage}
          containerStyle={styles.inputStyle}
        />
        <Input
          defaultValue={this.state.editMode ? this.state.zipCode : null}
          type="number"
          label="Zipcode"
          keyboardType={'phone-pad'}
          autoCompleteType={"postal-code"}
          textContentType={"postalCode"}
          leftIcon={
            <Icon
              name='address-card'
              color='grey'
              size={24}
              style={{ paddingRight: 10 }}
            />
          }
          maxLength={5}
          onChangeText={(zipCode) => this.validateField(
            'zipCode',
            zipCode,
            "zipCodeErrorMessage",
            (zipCode ? zipCode.length === 5 : false) && RegExp(/^\d+$/).test(zipCode),
            "Enter 5 digit number for Zip Code"
          )}
          errorMessage={this.state.zipCodeErrorMessage}
          containerStyle={styles.inputStyle}
        />
        <Input
          defaultValue={this.state.editMode ? this.state.phoneNumber: null}
          type="number"
          label="Phone Number"
          leftIcon={
            <Icon
              name='phone'
              color='grey'
              size={24}
              style={{ paddingRight: 10 }}
            />
          }
          keyboardType={'phone-pad'}
          textContentType={"telephoneNumber"}
          maxLength={10}
          onChangeText={(phoneNumber) => this.validateField(
            'phoneNumber',
            phoneNumber,
            "phoneNumberErrorMessage",
            (phoneNumber ? phoneNumber.length === 10 : false) && RegExp(/^\d+$/).test(phoneNumber),
            "Enter 10 digit number for Phone number"
          )}
          errorMessage={this.state.phoneNumberErrorMessage}
          containerStyle={styles.inputStyle}
        />
        <SafeAreaView style={{width:'50%', flexDirection: "row" }}>
          <Input
            label="Open"
            defaultValue={Utilities.formatStandardTime(open)}
            type="date"
            onTouchStart={() => this.toggleTimePicker("open")}
            editable={false}
            inputContainerStyle={{ paddingLeft: 15 }}
            containerStyle={styles.inputStyle}
          />
          <Input
            label="Close"
            defaultValue={Utilities.formatStandardTime(close)}
            type="date"
            onTouchStart={() => this.toggleTimePicker("close")}
            editable={false}
            errorMessage={this.state.timeErrorMessage}
            inputContainerStyle={{ paddingLeft: 15 }}
            containerStyle={styles.inputStyle}
          />
        </SafeAreaView>
        <DateTimePicker
            date={new Date()}
            mode="time"
            isVisible={isTimePickerVisible}
            onConfirm={this.handleTimePicked}
            onCancel={() => this.toggleTimePicker("")}
          />
        {this.state.editMode ?
          null :
          <SafeAreaView style={{width:'50%', flexDirection: "row" }}>
            <Input
              defaultValue={this.state.editMode ? this.state.washers : null}
              type="number"
              label="Washers"
              placeholder="10"
              keyboardType={'phone-pad'}
              maxLength={2}
              onChangeText={washers => this.validateField(
                'washers',
                washers,
                "washersErrorMessage",
                (washers.length <= MAX_MACHINES_NUM) && RegExp(/^\d+$/).test(washers),
                `Maximum number of washers is ${MAX_MACHINES_NUM}`
              )}
              errorMessage={this.state.washersErrorMessage}
            inputContainerStyle={{ paddingLeft: 15 }}
            containerStyle={styles.inputStyle}
            />
            <Input
              defaultValue={this.state.editMode ? this.state.dryers : null}
              type="number"
              label="Dryers"
              placeholder="10"
              keyboardType={'phone-pad'}
              maxLength={2}
              onChangeText={dryers => this.validateField(
                'dryers',
                dryers,
                "dryersErrorMessage",
                (dryers.length <= MAX_MACHINES_NUM) && RegExp(/^\d+$/).test(dryers),
                `Maximum number of dryers is ${MAX_MACHINES_NUM}`
              )}
              errorMessage={this.state.dryersErrorMessage}
            inputContainerStyle={{ paddingLeft: 15 }}
            containerStyle={styles.inputStyle}
            />
          </SafeAreaView>
        }
        <SafeAreaView style={{ width:'50%', flexDirection: "row" }}>
          <Input
            label="Washer Price"
            defaultValue={washerPrice}
            type="number"
            maxLength={4}
            onChangeText={price => this.validateField(
              'washerPrice',
              price,
              "washerPriceErrorMessage",
              RegExp(/\d*.?\d+$/).test(price),
              "Prices are integer or float"
            )}
            errorMessage={this.state.washerPriceErrorMessage}
            inputContainerStyle={{ paddingLeft: 15 }}
            containerStyle={styles.inputStyle}
          />
          <Input
            label="Dryer Price"
            defaultValue={dryerPrice}
            type="number"
            maxLength={4}
            onChangeText={price => this.validateField(
              'dryerPrice',
              price,
              "dryerPriceErrorMessage",
              RegExp(/\d*.?\d+$/).test(price),
              "Prices are integer or float"
            )}
            errorMessage={this.state.dryerPriceErrorMessage}
            inputContainerStyle={{ paddingLeft: 15 }}
            containerStyle={styles.inputStyle}
          />
        </SafeAreaView>

        {this.state.errorMessage ?
          <Text style={{color: 'red', paddingTop: 10, paddingBottom: 10}}>{this.state.errorMessage}</Text> :
          null
        }

        <Button
          title="Submit"
          onPress={this.submit}
          buttonStyle={styles.authButton}
          containerStyle={styles.authButtonContainer}
        />
        {this.state.editMode ?
          <Button
            type="outline"
            title="Cancel"
            onPress={() => this.props.navigation.goBack()}
            buttonStyle={styles.authButton}
            containerStyle={styles.authButtonContainer}
          /> :
          null
        }
        <Divider style={{ backgroundColor: 'transparent', height:20 }}/>
      </ScrollView>
    );
  }
}

LaundromatRegistrationForm.propTypes = {
  laundromat: Proptypes.object,
  id: Proptypes.string,
}