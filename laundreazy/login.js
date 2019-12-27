import React from 'react';
import Proptypes from 'prop-types';
import {
  View, Image,
} from 'react-native';
import {
  Button,
  Input,
  Card,
  Divider
} from 'react-native-elements';
import Icon from 'react-native-vector-icons/FontAwesome';
import Spinner from 'react-native-loading-spinner-overlay';

import FirebaseFunctions from './firebase';
import Utilities from './utilities';
import UserInfo from './userInfo';

import { YellowBox } from 'react-native';
import _ from 'lodash';
import styles from './stylesheets/styles';
YellowBox.ignoreWarnings(['Setting a timer']);
const _console = _.clone(console);
console.warn = message => {
  if (message.indexOf('Setting a timer') <= -1) {
    _console.warn(message);
  }
};

export default class Login extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      email: "",
      password: "",
      spinner: false,
      emailErrorMessage: "",
      passwordErrorMessage: "",
      userType: this.props.userType ? this.props.userType : 'owner',
    };
  }

  login = async (password) => {
    this.setState({spinner:true});
    userData = await FirebaseFunctions.logIn(
      this.state.email,
      password,
      this.state.userType,
    );

    if (!userData || !userData.Email) {
      this.setState({
        emailErrorMessage: "Username or password is incorrect!",
        passwordErrorMessage: "Username or password is incorrect!"
      });
      this.setState({spinner:false});
      return;
    }

    UserInfo.uid = userData.uid;
    UserInfo.firstName = userData.First;
    UserInfo.lastName = userData.Last;
    UserInfo.email = userData.Email;
    UserInfo.phoneNumber = userData.Phone;
    UserInfo.username = userData.Username;

    var laundromats = this.state.userType === 'customer' ?
      await FirebaseFunctions.getLaundromats() :
      await FirebaseFunctions.getOwnerLaundromats(userData.uid);
    
    laundromats = laundromats.map(doc => {
      const laundromat = doc.data();
      laundromat.id = doc.id;
      laundromat.Open = doc.data().Open.toDate();
      laundromat.Close = doc.data().Close.toDate();
      return laundromat;
    })

    this.props.navigation.replace(
      this.state.userType === 'customer' ? "Customer" : "Owner",
      { laundromats }
    );
  }

  validate = (password) => {
    var nonEmpty = true;

    if (!this.state.email) {
      this.setState({ emailErrorMessage: "Email is required" });
      nonEmpty = false;
    }

    if (!password) {
      this.setState({ passwordErrorMessage: "Password is required" });
      nonEmpty = false;
    }

    return nonEmpty;
  }

  render() {
    return (
      <View style={{flex:1, alignContent:'center'}}>
        <Image
          source={require("./assets/logo.png")}
          style={{width:"auto", height:180}}
          resizeMode="contain"
        />
        <Spinner
          visible={this.state.spinner}
          textStyle={styles.spinnerTextStyle}
        />
          <Input
            containerStyle={styles.inputStyle}
            placeholder="Email"
            autoCapitalize={"none"}
            autoCorrect={false}
            keyboardType={"email-address"}
            onChangeText={(email) => this.setState({email})}
            leftIcon={
              <Icon
                name='envelope'
                color='grey'
                size={20}
                style={{paddingRight: 10}}
              />
            }
            errorMessage={this.state.emailErrorMessage}
          />
          <Divider style={{ backgroundColor: 'transparent', height:10 }}/>
          <Input
            containerStyle={styles.inputStyle}
            placeholder="Password"
            secureTextEntry={true}
            onChangeText={(password)=> this.setState({password})}
            leftIcon={
              <Icon
                name='lock'
                color='grey'
                size={26}
                style={{paddingRight: 10}}
              />
            }
            errorMessage={this.state.passwordErrorMessage}
          />
        
        <Button
          raised
          containerStyle={styles.authButtonContainer}
          buttonStyle={styles.authButton}
          onPress={() => {
            this.setState({
              errorMessage: '',
              emailErrorMessage: '',
              passwordErrorMessage: '',
            });
            if (this.validate(this.state.password))
              this.login(this.state.password);
          }}
          title="Log in"
        />

        <Button
          type="outline"
          containerStyle={styles.authButtonContainer}
          buttonStyle={styles.authButton}
          title="Sign Up"
          onPress={() => this.props.navigation.navigate(
            'CreateAccount',
            { userType: this.state.userType }
          )}
        />
      </View>
    );
  }
}

Login.propTypes = {
  navigation: Proptypes.shape({
    navigate: Proptypes.func.isRequired
  }),
  userType: Proptypes.string,
}