import React from 'react';
import Proptypes from 'prop-types';

import {
  SafeAreaView,
  Text,
  View,
  Alert
} from 'react-native';
import {Button, Input} from "react-native-elements";
import Modal from "react-native-modal";
import modalStyles from './stylesheets/modalStyles';

import Login from './login';
import FirebaseFunctions from './firebase';
import styles from './stylesheets/styles';

export default class HomeScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      email: "",
      parent: this,
      isModalVisible: false,
    }
  }

  message = (mess) => alert(mess);

  toggleModal = () => this.setState(prevState => ({
    isModalVisible: !prevState.isModalVisible
  }))
  
  render() {
    return (
      <SafeAreaView style={{flex:1}}>
        <Login
          navigation = {this.props.navigation}
          userType = "customer"
        />
        
        <Button
          title="Forgot Password?"
          type='clear'
          titleStyle={
            {
              color:"black",
              fontSize:15,
              fontWeight:'500'
            }
          }
          onPress={() => this.toggleModal()}
          
        />
        <Button
          title="Laundromat Owner? Click Here"
          type='clear'
          titleStyle={
            {
              color:"black",
              fontSize:15,
              fontWeight:'500'
            }
          }
          onPress={() => this.props.navigation.navigate('Login')}
        />
        <Modal isVisible={this.state.isModalVisible} style={modalStyles.modalContainer}>
            <View style={modalStyles.container}>
                <View style={{width: '100%'}}>
                    <Text style={modalStyles.header}>Please Enter your Email Below</Text>
                </View>
                <View style={{width: '100%'}}>
                <Input
                  placeholder="Email"
                  autoCapitalize={"none"}
                  autoCorrect={false}
                  keyboardType={"email-address"}
                  onChangeText={(email) => this.setState({email})}
                />
                </View>
                <View style={{flexDirection: "row", justifyContent: 'flex-end'}}>
                    <Button
                        title="Cancel"
                        type="outline"
                        onPress={() => this.toggleModal(null)}
                        buttonStyle={modalStyles.btn}
                    />
                    <Button
                        title="Confirm"
                        onPress={async () => {
                            status = await FirebaseFunctions.changePassword(this.state.email);

                            status ? this.toggleModal(null) :
                            Alert.alert(
                              "Alert",
                              "Email either not found or format is incorrect!",
                              [
                                {
                                  text: 'Try Again',
                                  style: 'cancel',
                                },
                                {text: 'Close', onPress: () => this.toggleModal(null)},
                              ],
                            );
                        }}
                        buttonStyle={modalStyles.btn}
                    />
                </View>
            </View>
        </Modal>
      </SafeAreaView>
    );
  }
}

HomeScreen.propTypes = {
  navigation: Proptypes.shape({
    navigate: Proptypes.func.isRequired
  }),
}