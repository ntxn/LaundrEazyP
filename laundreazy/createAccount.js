import React from 'react';
import Proptypes from 'prop-types';
import {
  Text,
  ScrollView,
} from 'react-native';
import {
  Button,
  Input,
} from 'react-native-elements';
import Icon from 'react-native-vector-icons/FontAwesome';
import Spinner from 'react-native-loading-spinner-overlay';

import FirebaseFunctions from "./firebase";
import UserInfo from "./userInfo";
import styles from './stylesheets/styles';

export default class CreateAccount extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      firstName: "",
      lastName: "",
      username: "",
      email: "",
      password: "",
      phoneNumber: "",
      firstNameErrorMessage: '',
      lastNameErrorMessage: '',
      usernameErrorMessage: '',
      emailErrorMessage: '',
      phoneNumberErrorMessage: '',
      passwordErrorMessage: '',
      spinner: false
    };
  }

  createAccount = async () => {
    this.setState({ spinner: true });
    const response = await FirebaseFunctions.createAccount(
      {
        firstName: this.state.firstName,
        lastName: this.state.lastName,
        username: this.state.username,
        email: this.state.email,
        phoneNumber: this.state.phoneNumber,
        password: this.state.password,
        userType: this.props.navigation.getParam('userType'),
      }
    )

    if (!response[0] && response[1] === "ExistingUsernameError")
      this.setState({ usernameErrorMessage: "Username Already Exists" });
    if (!response[0] && response[1] === "ExistingEmailError")
      this.setState({ emailErrorMessage: "Email is already registered" });

    if (response[0]) {
      var laundromatData = [];
      this.props.navigation.getParam('userType') === 'customer' ? laundromatData = await FirebaseFunctions.getLaundromats()
        : laundromatData = await FirebaseFunctions.getOwnerLaundromats(userData.uid);

      laundromatData = laundromatData.map(doc => {
        const laundromat = doc.data();
        laundromat.id = doc.id;
        laundromat.Open = doc.data().Open.toDate();
        laundromat.Close = doc.data().Close.toDate();
        return laundromat;
      })

      UserInfo.uid = response[1];
      UserInfo.firstName = this.state.firstName;
      UserInfo.lastName = this.state.lastName;
      UserInfo.username = this.state.username;
      UserInfo.email = this.state.email;
      UserInfo.phoneNumber = this.state.phoneNumber;
      this.props.navigation.navigate(
        this.props.navigation.getParam('userType') === 'customer' ? "Customer" : "Owner",
        {
          laundromats: laundromatData,
        }
      );
    }
    this.setState({ spinner: false });
  };

  validate = () => {
    if (this.state.email && this.state.firstName && this.state.lastName &&
      this.state.phoneNumber && this.state.username && this.state.password)
      return true;

    this.updateErrorMessage(this.state.email, this.state.emailErrorMessage, 'emailErrorMessage');
    this.updateErrorMessage(this.state.firstName, this.state.firstNameErrorMessage, 'firstNameErrorMessage');
    this.updateErrorMessage(this.state.lastName, this.state.lastNameErrorMessage, 'lastNameErrorMessage');
    this.updateErrorMessage(this.state.phoneNumber, this.state.phoneNumberErrorMessage, 'phoneNumberErrorMessage');
    this.updateErrorMessage(this.state.username, this.state.usernameErrorMessage, 'usernameErrorMessage');
    this.updateErrorMessage(this.state.password, this.state.passwordErrorMessage, 'passwordErrorMessage');
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

  updateErrorMessage = (variable, error, errorMessageVariable) => {
    if (!variable && !error)
      this.setState({ [errorMessageVariable]: "Required field" });
  }

  render() {
    const nameRegex = /^[a-zA-Z\-]+$/;
    const usernameRegex = /^[a-z0-9]+$/;
    const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    const numberRegex = /^\d+$/;

    return (
      <ScrollView>
        <Spinner
          visible={this.state.spinner}
          textStyle={styles.spinnerTextStyle}
        />
        <Input
          label="First Name"
          autoCorrect={false}
          autoCapitalize={"words"}
          containerStyle={styles.inputStyle}
          leftIcon={
            <Icon
              name='user'
              color='grey'
              size={24}
              style={{ paddingRight: 10 }}
            />
          }
          onChangeText={firstName => this.validateField(
            'firstName',
            firstName,
            'firstNameErrorMessage',
            RegExp(nameRegex).test(firstName),
            'Names should only contain A-Z and a-z'
          )}
          errorMessage={this.state.firstNameErrorMessage}
        />
        <Input
          label="Last Name"
          autoCorrect={false}
          autoCapitalize={"words"}
          containerStyle={styles.inputStyle}
          leftIcon={
            <Icon
              name='user'
              color='grey'
              size={24}
              style={{ paddingRight: 10 }}
            />
          }
          onChangeText={lastName => this.validateField(
            'lastName',
            lastName,
            'lastNameErrorMessage',
            RegExp(nameRegex).test(lastName),
            'Names should only contain A-Z and a-z'
          )}
          errorMessage={this.state.lastNameErrorMessage}
        />
        <Input
          label="Username"
          autoCapitalize={"none"}
          autoCorrect={false}
          containerStyle={styles.inputStyle}
          leftIcon={
            <Icon
              name='user'
              color='grey'
              size={24}
              style={{ paddingRight: 10 }}
            />
          }
          onChangeText={username => this.validateField(
            'username',
            username,
            'usernameErrorMessage',
            RegExp(usernameRegex).test(username),
            'Usernames should only contain a-z and 0-9'
          )}
          errorMessage={this.state.usernameErrorMessage}
        />
        <Input
          label="Email"
          autoCapitalize={"none"}
          autoCorrect={false}
          keyboardType={"email-address"}
          containerStyle={styles.inputStyle}
          leftIcon={
            <Icon
              name='envelope'
              color='grey'
              size={20}
              style={{ paddingRight: 10 }}
            />
          }
          onChangeText={email => this.validateField(
            'email',
            email,
            'emailErrorMessage',
            RegExp(emailRegex).test(email),
            'Email is formatted incorrectly'
          )}
          errorMessage={this.state.emailErrorMessage}
        />
        <Input
          label="Phone Number"
          keyboardType={'phone-pad'}
          containerStyle={styles.inputStyle}
          leftIcon={
            <Icon
              name='phone'
              color='grey'
              size={24}
              style={{ paddingRight: 10 }}
            />
          }
          onChangeText={phoneNumber => this.validateField(
            'phoneNumber',
            phoneNumber,
            'phoneNumberErrorMessage',
            (phoneNumber.length === 10) && RegExp(numberRegex).test(phoneNumber),
            'Enter 10 digit number for phone number'
          )}
          maxLength={10}
          errorMessage={this.state.phoneNumberErrorMessage}
        />
        <Input
          label="Password"
          containerStyle={styles.inputStyle}
          leftIcon={
            <Icon
              name='lock'
              color='grey'
              size={26}
              style={{ paddingRight: 10 }}
            />
          }
          onChangeText={password => this.validateField(
            'password',
            password,
            'passwordErrorMessage',
            password.length >= 6,
            'Password is short and weak'
          )
          }
          secureTextEntry={true}
          errorMessage={this.state.passwordErrorMessage}
        />
        <Button
          title="Create"
          containerStyle={styles.authButtonContainer}
          buttonStyle={styles.authButton}
          onPress={() => {
            if (this.validate())
              this.createAccount();
          }
          }
        />

        <Button
          title="Back"
          type="outline"
          containerStyle={styles.authButtonContainer}
          buttonStyle={styles.authButton}
          onPress={() => this.props.navigation.goBack()}
        />
      </ScrollView>
    );
  }
}

CreateAccount.propTypes = {
  navigation: Proptypes.shape({
    navigate: Proptypes.func.isRequired,
    getParam: Proptypes.func.isRequired,
  }),
}
