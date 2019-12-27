import React from 'react';
import Proptypes from 'prop-types';
import {
    Text,
    View,
} from 'react-native';

import {
    Input,
    Button,
} from 'react-native-elements';

import Icon from 'react-native-vector-icons/FontAwesome';
import Spinner from 'react-native-loading-spinner-overlay';

import FirebaseFunctions from './firebase';
import UserInfo from './userInfo';
import styles from './stylesheets/styles'

export default class EditProfile extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      firstName: UserInfo.firstName,
      lastName: UserInfo.lastName,
      phoneNumber: UserInfo.phoneNumber,
      firstNameErrorMessage: '',
      lastNameErrorMessage: '',
      phoneNumberErrorMessage: '',
      spinner: false
    };
  }

  validate = () => {
    if (this.state.firstName && this.state.lastName &&
      this.state.phoneNumber)
      return true;

    this.updateErrorMessage(this.state.firstName, this.state.firstNameErrorMessage, 'firstNameErrorMessage');
    this.updateErrorMessage(this.state.lastName, this.state.lastNameErrorMessage, 'lastNameErrorMessage');
    this.updateErrorMessage(this.state.phoneNumber, this.state.phoneNumberErrorMessage, 'phoneNumberErrorMessage');
    return false;
  }

  validateField = (input, value, fieldError, conditions = true, errorMessage = '') => {
    if (!value)
      this.setState({ [fieldError]: "Required field" });
    else if (conditions)
      this.setState({
        [input]: value,
        [fieldError]: "",
      });
    else
      this.setState({ [fieldError]: errorMessage });
  }

  render() {
    const nameRegex = /^[a-zA-Z\-]+$/;
    const numberRegex = /^\d+$/;
    return (
      <View>
        <Spinner
          visible={this.state.spinner}
          textStyle={styles.spinnerTextStyle}
        />
        <Input
          label="First Name"
          containerStyle={styles.inputStyle}
          value={this.state.firstName}
          autoCorrect={false}
          autoCapitalize={"words"}
          onChangeText={firstName => {
            this.setState({ firstName });
            this.validateField(
              'firstName',
              firstName,
              'firstNameErrorMessage',
              RegExp(nameRegex).test(firstName),
              'Names should only contain A-Z and a-z'
            )
          }
          }
          leftIcon={
            <Icon
              name='user'
              color='grey'
              size={24}
              style={{ paddingRight: 10 }}
            />
          }
          errorMessage={this.state.firstNameErrorMessage}
        />
        <Input
          label="Last Name"
          containerStyle={styles.inputStyle}
          value={this.state.lastName}
          autoCorrect={false}
          autoCapitalize={"words"}
          onChangeText={
            lastName => {
              this.setState({ lastName })
              this.validateField(
                'lastName',
                lastName,
                'lastNameErrorMessage',
                RegExp(nameRegex).test(lastName),
                'Names should only contain A-Z and a-z'
              );
            }
          }
          leftIcon={
            <Icon
              name='user'
              color='grey'
              size={24}
              style={{ paddingRight: 10 }}
            />
          }
          errorMessage={this.state.lastNameErrorMessage}
        />
        <Input
          label="Phone Number"
          containerStyle={styles.inputStyle}
          value={this.state.phoneNumber}
          keyboardType={'phone-pad'}
          onChangeText={phoneNumber => {
            this.setState({ phoneNumber });
            this.validateField(
              'phoneNumber',
              phoneNumber,
              'phoneNumberErrorMessage',
              (phoneNumber.length === 10) && RegExp(numberRegex).test(phoneNumber),
              'Enter 10 digit number for phone number'
            )}
          }
          leftIcon={
            <Icon
              name='phone'
              color='grey'
              size={24}
              style={{ paddingRight: 10 }}
            />
          }
          maxLength={10}
          errorMessage={this.state.phoneNumberErrorMessage}
        />


        <Button
          raised
          containerStyle={styles.authButtonContainer}
          buttonStyle={styles.authButton}
          title="Save"
          onPress={async () => {
            this.setState({ spinner: true });
            if (this.validate()) {
              if (await FirebaseFunctions.updateUserInfo(this.props.navigation.getParam('collection'), UserInfo.uid,
                this.state.firstName, this.state.lastName, this.state.phoneNumber)) {
                UserInfo.firstName = this.state.firstName;
                UserInfo.lastName = this.state.lastName;
                UserInfo.phoneNumber = this.state.phoneNumber;
                this.props.navigation.getParam('profile').refresh();
                this.props.navigation.goBack();
              }
              else {
                alert("Something went wrong");
              }
            }
            this.setState({ spinner: false });
          }}
        />
      </View>
    )
  }
}

EditProfile.propTypes = {
  navigation: Proptypes.shape({
    navigate: Proptypes.func.isRequired,
    getParam: Proptypes.func.isRequired
  }),
}