import React from 'react';
import Proptypes from 'prop-types';
import {
  Text,
  View,
  TouchableHighlight,
  ScrollView
} from 'react-native';

import Native from 'react-native';

import { Card, Button, ListItem, Divider } from 'react-native-elements';

import FirebaseFunctions from '../firebase';
import UserInfo from '../userInfo';
import styles from '../stylesheets/styles';
import Icon from 'react-native-vector-icons/FontAwesome';

import { YellowBox } from 'react-native';
import _ from 'lodash';
YellowBox.ignoreWarnings(['Setting a timer']);
const _console = _.clone(console);
console.warn = message => {
  if (message.indexOf('Setting a timer') <= -1) {
    _console.warn(message);
  }
};

export default class Customer extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      payment: this.props.navigation.getParam("payment")
    }
  }

  updatePayment = payment => this.setState({ payment })

  refresh = () => this.props.navigation.replace('Profile');

  home = () => {
    this.props.navigation.getParam('home').replace()
    this.props.navigation.goBack();
  }

  render() {
    const { payment } = this.state;
    return (
      <ScrollView>
        <Divider style={{ backgroundColor: 'transparent', height: 10 }} />
        <Card containerStyle={{ borderRadius: 10, paddingBottom:0, paddingRight:0, paddingLeft:0 }} title="Information" >
          <ListItem
            title={UserInfo.firstName + " " + UserInfo.lastName}
            leftIcon={{ name: 'account-circle' }}
            containerStyle={{backgroundColor:"transparent"}}
            bottomDivider
          />
          <ListItem
            title={"@" + UserInfo.username}
            leftIcon={{ name: 'account-circle' }}
            bottomDivider
          />
          <ListItem
            title={UserInfo.email}
            leftIcon={{ name: 'email' }}
            bottomDivider
          />
          <ListItem
            title={UserInfo.phoneNumber}
            leftIcon={{ name: 'local-phone' }}
            containerStyle={{backgroundColor:"transparent"}}
          />
        </Card>

        <Divider style={{ backgroundColor: 'transparent', height: 10 }} />
        <Card containerStyle={{ borderRadius: 10, padding:0 }} >
          <ListItem
            title={"Edit Information"}
            containerStyle={{backgroundColor:"transparent"}}
            leftIcon={{ name: 'edit' }}
            onPress={async () => {
              this.props.navigation.navigate("EditProfile", { profile: this, collection: "Customers" });
            }}
            underlayColor='lightgray'
            bottomDivider
            chevron
          />
          <ListItem
            title="Change Password"
            leftIcon={{ name: 'autorenew' }}
            onPress={async () => {
              await FirebaseFunctions.changePassword(UserInfo.email);
              alert("Password Reset Link sent to email! Follow link to change password!");
            }}
            bottomDivider
            chevron
          />
          <ListItem
            title="My Reservations"
            leftIcon={{ name: 'local-laundry-service' }}
            onPress={() => {
              this.props.navigation.navigate(
                "Reservations", 
                {
                  payment,
                  updatePayment: this.updatePayment
                }
              );
            }}
            bottomDivider
            chevron
          />
          <ListItem
            title="Log Out"
            containerStyle={{backgroundColor:"transparent"}}
            leftIcon={{ name: 'exit-to-app', color:'red' }}
            titleStyle={{fontWeight:'500', color:'red'}}
            onPress={async () => {
              const loggedOut = await FirebaseFunctions.logout();
              loggedOut ? this.home() : alert("Logout failed");
            }}
            underlayColor='lightgray'
            chevron
          />
        </Card>

        <Divider style={{ backgroundColor: 'transparent', height: 10 }} />

        <Card containerStyle={{ borderRadius: 10, paddingBottom:10 }} title="Payment Method">
          <View>
            {!payment &&
              <Button
                raised
                containerStyle={styles.payButtonContainer}
                buttonStyle={styles.authButton}
                title="Add Payment"
                onPress={async () => {
                  this.props.navigation.navigate(
                    "AddPayments",
                    { updatePayment: this.updatePayment });
                }}
              />
            }

            {payment &&
              <View>
                <Text style={{ fontSize: 18, fontWeight: 'bold' }}>{payment.nameOnCard}</Text>
                <View style={{flex:1, flexDirection:'row', alignItems:'center'}}>
                  <Icon
                    name={payment.type}
                    color='grey'
                    size={24}
                    style={{ paddingRight: 10 }}
                  />
                  <Text>************{payment.cardNumber.substring(12)}</Text>
                </View>
                <Text>Expires: {payment.expDate.toDateString()}</Text>
                <Divider style={{ backgroundColor: 'transparent', height: 10 }} />
                <Native.Button
                  title="Remove"
                  color='red'
                  onPress={async () => {
                    status = await FirebaseFunctions.deletePayment(UserInfo.uid);
                    
                    status ? this.refresh() : alert("Something went wrong! Try again later");
                  }}
                />
              </View>
            }
          </View>
        </Card>

        <Divider style={{ backgroundColor: 'transparent', height: 50 }} />
      </ScrollView>
    )
  }
}

Customer.propTypes = {
  navigation: Proptypes.shape({
    navigate: Proptypes.func.isRequired,
    getParam: Proptypes.func.isRequired
  }),
}