import React from 'react';
import Proptypes from 'prop-types';
import {
    Text,
    View,
    Image
} from 'react-native';
import {
    Button,
    Input,
    Card
} from 'react-native-elements';

import DateTimePicker from "react-native-modal-datetime-picker";
import Icon from 'react-native-vector-icons/FontAwesome';

import FirebaseFunctions from "../firebase";
import UserInfo from "../userInfo";
import Utilities from '../utilities';
import styles from '../stylesheets/styles';

import { YellowBox } from 'react-native';
import _ from 'lodash';
YellowBox.ignoreWarnings(['componentWillReceiveProps']);
const _console = _.clone(console);
console.warn = message => {
  if (message.indexOf('componentWillReceiveProps') <= -1) {
    _console.warn(message);
  }
};

export default class AddPayments extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            nameOnCard: "",
            cardNum: "",
            expDate: new Date(),
            cvv: "",
            type: 'credit-card',
            nameOnCardErrorMessage: '',
            cardNumErrorMessage: '',
            cvvErrorMessage: '',

            isDateTimePickerVisible: false,
        };
    }

    openDateTimePicker = () => this.setState({ isDateTimePickerVisible: true })
    closeDateTimePicker = () => this.setState({ isDateTimePickerVisible: false })

    type = (num) => {
        num.substring(0, 1) in Utilities.CardType ?
            this.setState({ type: Utilities.CardType[num.substring(0, 1)] }) :
            this.setState({ type: 'credit-card' });
    }

    addAndGoBack = async () => {
        const response = await FirebaseFunctions.addPayment(UserInfo.uid, this.state.nameOnCard, this.state.cardNum, this.state.cvv, this.state.type, this.state.expDate);
        if(response){
            this.props.navigation.getParam('updatePayment')(response)
            this.props.navigation.goBack();
        }
    }

    validate = (value, error, regex, field, card) =>{
        if(!value){
            this.setState({ [field]: "Required field" });
        }
        else if(!RegExp(regex).test(value)){
            this.setState({ [field]: error });
        }
        else if(card && this.state.type == "None"){
            this.setState({ [field]: "Card needs to be valid" });
        }
        else{
            this.setState({ [field]: "" });
        }
    }

    validated = () => {
        return this.state.cardNumErrorMessage.length + this.state.nameOnCardErrorMessage.length + this.state.cvvErrorMessage.length == 0;
    }

    render() {
        const nameRegex = /^[a-zA-Z\s\-]+$/;
        const cardNumRegex = /^[a-zA-Z0-9]{15,16}$/;
        const cvvRegex = /^[a-zA-Z0-9]{3}$/;

        return (
            <View>
                <Input
                    label="Name On Card"
                    leftIcon={
                        <Icon
                            name='user'
                            color='grey'
                            size={26}
                            style={{ paddingRight: 10 }}
                        />
                    }
                    containerStyle={styles.inputStyle}
                    autoCorrect={false}
                    autoCapitalize={"words"}
                    onChangeText={(nameOnCard) => {
                        this.setState({ nameOnCard });
                        this.validate(nameOnCard, "Name Format is Wrong", nameRegex, 'nameOnCardErrorMessage', false);
                    }}
                    errorMessage={this.state.nameOnCardErrorMessage}
                />
                <Input
                    label="Card Number"
                    leftIcon={
                        <Icon
                            name={this.state.type}
                            color='grey'
                            size={24}
                            style={{ paddingRight: 10 }}
                        />
                    }
                    containerStyle={styles.inputStyle}
                    autoCorrect={false}
                    keyboardType={'phone-pad'}
                    maxLength={16}
                    onChangeText={(cardNum) => {
                        this.type(cardNum);
                        this.setState({ cardNum });
                        this.validate(cardNum, "Card can only have 15 or 16 Numbers!", cardNumRegex, 'cardNumErrorMessage', true);
                    }}
                    errorMessage={this.state.cardNumErrorMessage}
                /> 
                <Input
                    label="CVV"
                    leftIcon={
                        <Icon
                            name='credit-card'
                            color='grey'
                            size={24}
                            style={{ paddingRight: 10 }}
                        />
                    }
                    containerStyle={styles.inputStyle}
                    autoCapitalize={"none"}
                    autoCorrect={false}
                    keyboardType={'phone-pad'}
                    maxLength={3}
                    onChangeText={(cvv) => {
                        this.setState({ cvv });
                        this.validate(cvv, "CVV can only have 3 Numbers!", cvvRegex, 'cvvErrorMessage', false);
                    }}
                    errorMessage={this.state.cvvErrorMessage}
                />
                <Input
                    label="Expiration Date"
                    leftIcon={
                        <Icon
                            name='calendar'
                            color='grey'
                            size={26}
                            style={{ paddingRight: 10 }}
                        />
                    }
                    containerStyle={styles.inputStyle}
                    value={this.state.expDate.toLocaleDateString()}
                    type="text"
                    onTouchStart={this.openDateTimePicker}
                    editable={false}
                />
                <DateTimePicker
                    date={this.state.expDate}
                    isVisible={this.state.isDateTimePickerVisible}
                    onCancel={() => this.closeDateTimePicker()}
                    onConfirm={(date) => this.setState({ expDate: date, isDateTimePickerVisible: false })}
                    minimumDate={new Date()}
                    maximumDate={new Date(2040, 12)}
                />

                <Button
                    raised
                    containerStyle={styles.authButtonContainer}
                    buttonStyle={styles.authButton}
                    title="Add"
                    onPress={async () => this.validated() ? 
                        await this.addAndGoBack() :
                        alert("Make sure you completed the fields!")}
                />
            </View>
        );
    }
}

AddPayments.propTypes = {
    navigation: Proptypes.shape({
      navigate: Proptypes.func.isRequired,
      getParam: Proptypes.func.isRequired
    }),
  }