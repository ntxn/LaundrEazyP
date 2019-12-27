import React from 'react';
import Proptypes from 'prop-types';
import {
  View,
  FlatList,
  ScrollView,
  YellowBox,
  Image,
  TouchableHighlight,
  SafeAreaView,
} from 'react-native';

import _ from 'lodash';
import DateTimePicker from "react-native-modal-datetime-picker";
import Icon from 'react-native-vector-icons/FontAwesome';
import Modal from "react-native-modal";
import {
  Button,
  Text
} from 'react-native-elements';

import FirebaseFunctions from './firebase';
import Utilities from './utilities';

import {
  reserveOutsideBusinessHour,
  reservationEndsAfterClosing,
  machineAlreadyBookedAtChosenTime
} from './errorMessages/makeReservation';

import modalStyles from './stylesheets/modalStyles';


YellowBox.ignoreWarnings(['componentWillReceiveProps']);
const _console = _.clone(console);
console.warn = message => {
  if (message.indexOf('componentWillReceiveProps') <= -1) {
    _console.warn(message);
  }
};

export default class MakeReservation extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      washers: [],
      dryers: [],
      index: 0,
      isModalVisible: false,
      isDatePickerVisible: false,
      isTimePickerVisible: false,
      date: new Date(),
      time: new Date(),
      datetime: new Date(),
      endTime: new Date(),
      dateStr: '',
      timeStr: '',
      dateTimeErrorMessage: '',
      washerChecked: true,
      dryerChecked: false,
      machineUID: '',
      bookingConfirmed: false,
      bookingFailed: false,
    }
  }

  componentDidMount(){
    const laundromat = this.props.navigation.getParam('laundromat');
    const openHour = laundromat.Open.getHours();
    const openMinute = laundromat.Open.getMinutes();
    const openInMinutes = openHour * 60 + openMinute;
    const closeInMinutes = laundromat.Close.getHours() * 60 + laundromat.Close.getMinutes();
    var now = new Date();
    const startTimeInMinutes = now.getHours() * 60 + now.getMinutes();
    var endTime = this.findEndTime(now);
    const endTimeInMinutes = endTime.getHours() * 60 + endTime.getMinutes();

    if(startTimeInMinutes < openInMinutes)
      now = new Date(now.getFullYear(), now.getMonth(), now.getDate(), openHour, openMinute);
    else if(endTimeInMinutes > closeInMinutes)
      now = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, openHour, openMinute);

    endTime = this.findEndTime(now);

    this.setState({
      date: now,
      time: now,
      endTime,
    }, this.findAvailableMachines);
  }

  // *********************** TIME ************************
  openDatePicker = () => this.setState({isDatePickerVisible: true})
  closeDatePicker = () => this.setState({isDatePickerVisible: false})
  openTimePicker = () => this.setState({isTimePickerVisible: true})
  closeTimePicker = () => this.setState({isTimePickerVisible: false})

  handleDateTimePicked = async (input, type='date') => {
    var date;
    var time;

    if(type === 'date'){
      date = input;
      time = this.state.time;
      this.closeDatePicker();
    } else {
      date = this.state.date;
      time = input;
      this.closeTimePicker();
    }

    this.setState({
      [type]: input,
      dateTimeErrorMessage: ''
    });

    const datetime = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
      time.getHours(),
      time.getMinutes()
    );

    const laundromat = this.props.navigation.getParam('laundromat');
    const openInMinutes = laundromat.Open.getHours() * 60 + laundromat.Open.getMinutes();
    const closeInMinutes = laundromat.Close.getHours() * 60 + laundromat.Close.getMinutes();

    var bookingTime = datetime.getHours() * 60 + datetime.getMinutes();

    if(datetime < new Date()){
      this.setState({
        dateTimeErrorMessage: "Invalid Time",
        washers: [],
        dryers: [],
      });
      return;
    }

    if(bookingTime < openInMinutes || bookingTime >= closeInMinutes) {
      this.setState({
        dateTimeErrorMessage: reserveOutsideBusinessHour,
        washers: [],
        dryers: [],
      });
      return;
    }

    const endTime = this.findEndTime(datetime)
    const bookingEndTime = endTime.getHours() * 60 + endTime.getMinutes();
    if(bookingEndTime > closeInMinutes){
      this.setState({
        dateTimeErrorMessage: reservationEndsAfterClosing,
        washers: [],
        dryers: [],
      });
      return;
    }
    this.setState({
      endTime,
      datetime
    }, this.findAvailableMachines);
  };

  findEndTime = date => {
    var endTime = new Date(date);
    endTime = endTime.setMinutes(endTime.getMinutes() + 45);
    return new Date(endTime);
  }


  // *********************** MODAL ************************
  toggleModal = () => this.setState(prevState => ({
    isModalVisible: !prevState.isModalVisible,
    bookingConfirmed: false,
    bookingFailed: false,
  }))


  // *********************** MACHINES ************************
  renderMachines = ({item}, machineTitle) => {
    const laundromat = this.props.navigation.getParam('laundromat');
    var image_url = require('./assets/washer.png');
    var image_size = 60;
    var image_styles = {width: image_size, height: image_size, marginRight: 5}
    var price = laundromat.WasherPrice;
    var washerChecked = true;
    var dryerChecked = false;
    var cardWidth = 142;

    if(machineTitle === 'Dryer'){
      image_url = require('./assets/dryer.png');
      image_size = 52;
      image_styles = {width: image_size, height: image_size, marginRight: 5, marginTop: 4}
      price = laundromat.DryerPrice;
      washerChecked = false;
      dryerChecked = true;
      cardWidth = 115
    }

    return (
      <View style={{
        flexDirection: 'row',
        width: cardWidth,
        marginBottom: 10,
        borderColor: '#ddd',
        borderBottomWidth: 1,
      }}>
        <Image
          style={image_styles}
          source={image_url}
        />
        <View style={{flexDirection: 'column', justifyContent: 'center'}}>
          <Text style={{fontSize: 17, fontWeight: 'bold', marginBottom: 3}}>{machineTitle} {item.id}</Text>
          <Text style={{color: 'green'}}>Available</Text>
          <Text style={{marginBottom: 5}}>Price: ${price}</Text>
          <Button
            title="Book"
            type='outline'
            containerStyle={{marginBottom: 10}}
            buttonStyle={{height: 30, justifyContent: 'center', padding: 0, alignItems: 'center'}}
            onPress={() => this.setState({washerChecked, dryerChecked}, this.pickThisMachine(item.id))}
          />
        </View>
      </View>
    )
  }

  machineList = (machines, machineTitle) => {
    const listContainerStyle = {flex: 1, marginRight: 20, marginLeft: 20};
    const list = machines.length ?
      <FlatList
        scrollEnabled={false}
        style={listContainerStyle}
        data={machines}
        renderItem={({item}) => this.renderMachines({item}, machineTitle)}
      /> :
      <Text style={{...listContainerStyle, color: 'gray'}}>
        {this.state.dateTimeErrorMessage === '' &&  `No ${machineTitle.toLowerCase()} found`}
      </Text>
    return list;
  }


  pickThisMachine = id => {
    const now = new Date();
    const bookingTimeInvalid = now >= this.state.date;
    if(bookingTimeInvalid) {
      this.handleDateTimePicked(now);
      const machines = this.state.washerChecked ? this.state.washers : this.state.dryers;
      const machineStillAvailable = machines.some(machine => id === machine.id);
      if(!machineStillAvailable){
        this.setState({ dateTimeErrorMessage: machineAlreadyBookedAtChosenTime })
        return;
      }
    }
    this.setState({machineUID: id})
    this.toggleModal()
  }

  // *********************** RESERVATIONS ************************
  findAvailableMachines = async () => {
    const {date} = this.state;
    const washers = this.props.navigation.getParam('washers');
    const dryers = this.props.navigation.getParam('dryers');

    const washerReservations = await FirebaseFunctions.getReservationsForMachines(
      date.toDateString(),
      this.props.navigation.getParam('laundromat').id + 'washers'
    )
    const dryerReservations = await FirebaseFunctions.getReservationsForMachines(
      date.toDateString(),
      this.props.navigation.getParam('laundromat').id + 'dryers'
    )

    if(washerReservations.length)
        this.filterAvailableMachines('washers', washers, washerReservations);
    else 
      this.setState({ washers});

    if(dryerReservations.length)
        dryerReservations.length && this.filterAvailableMachines('dryers', dryers, dryerReservations);
    else
      this.setState({ dryers});
  }

  filterAvailableMachines = (machineType, machines, reservations) => {
    const unavailableMachinesIDs = new Set();

    if(this.props.navigation.getParam('reservation'))
      reservations = reservations.filter(reservation => reservation.id !== this.props.navigation.getParam('reservation').id);

    reservations.forEach(reservation => {
      
      const startTime = reservation.data().startTime.toDate();
      const endTime = reservation.data().endTime.toDate();

      const condition = (this.state.datetime >= startTime && this.state.datetime <= endTime) ||
        (startTime <= this.state.endTime && this.state.endTime <= endTime);

      condition && unavailableMachinesIDs.add(reservation.data().machineUID);
    })

    const availableMachines = machines.filter(machine => !unavailableMachinesIDs.has(machine.id));
    this.setState({[machineType]: availableMachines})
  }

  price = machineType => { 
    return machineType === 'washers' ? 
      parseInt(this.props.navigation.getParam('laundromat').WasherPrice) :
      parseInt(this.props.navigation.getParam('laundromat').DryerPrice);
  }

  makeReservation = async () => {
    const {washerChecked, machineUID,
      endTime, washers, dryers,} = this.state;

    const customerUID = this.props.navigation.getParam('customerUID');
    var payment = this.props.navigation.getParam('payment');
    const machineType = washerChecked ? 'washers' : 'dryers';
    const price = this.price(machineType);
    const reservation = this.props.navigation.getParam('reservation');

    if(customerUID !== "RandomCustomer" && !payment)
      payment = await FirebaseFunctions.getPayment(customerUID);

    var newBalance = null;
    if(payment){
      if(reservation)
        newBalance = machineType === reservation.machineType ?
          payment.balance :
          payment.balance + this.price(reservation.machineType) - price;
      else
        newBalance = payment.balance - price;
    }
    
    const response = await FirebaseFunctions.makeReservation(
      customerUID,
      this.props.navigation.getParam('laundromat').id,
      machineType,
      machineUID,
      this.state.datetime,
      endTime,
      price,
      newBalance,
      reservation && reservation.id
    )

    if(response){
      const machines = washerChecked ? washers : dryers;
      const availableMachines = machines.filter(machine => machine.id !== machineUID);
      this.setState({
        [machineType]: availableMachines,
        bookingConfirmed: true,
      });

      if(this.props.navigation.getParam('reservation'))
        this.props.navigation.getParam('updateReservations')(response, reservation.machineType);

      if(this.props.navigation.getParam('payment')){
        payment.balance = newBalance;
        this.props.navigation.getParam('updatePayment')(payment);
      }
    } else {
      this.setState({
        bookingFailed: true,
      });
    }
    return response;
  }


  datetimePickerBtn = (func, imageUrl, text, extraStyles) => {
    return <TouchableHighlight
      onPress={func}
      underlayColor="#fff"
      style={{flex: 1, height: 60, borderColor: '#ddd', borderWidth: 1, justifyContent: 'center', ...extraStyles}}
    >
      <View style={{alignItems: 'center'}}>
        <Image
          source={imageUrl}
          style={{width: 20, height: 20, marginBottom: 7}}
        />
        <Text style={{fontWeight: 'bold'}}>{text}</Text>
      </View>
    </TouchableHighlight>
  }


  render() {
    const {date, time, dateTimeErrorMessage, isModalVisible,
      isDatePickerVisible, isTimePickerVisible, washerChecked, machineUID,
      endTime, washers, dryers, bookingConfirmed, bookingFailed} = this.state;
    const laundromat = this.props.navigation.getParam('laundromat');

    var maxDate = new Date(date);
    maxDate = maxDate.setMonth(maxDate.getMonth() + 3, date.getDate());
    maxDate = new Date(maxDate);
    

    return (
      <View style={{flex: 1}}>
        <View style={{padding: 10}}>
          <Text style={{fontSize:25, fontWeight:'bold', paddingBottom: 5}}>{laundromat.Name}</Text>
          <Text>{laundromat.Street + ", " + laundromat.City + ", " + laundromat.State + ", " + laundromat.Zip}</Text>
          <Text>({laundromat.Phone.substring(0, 3)}) {laundromat.Phone.substring(3, 6)}-{laundromat.Phone.substring(6, 10)}</Text>
          <Text>{Utilities.formatStandardTime(laundromat.Open)} - {Utilities.formatStandardTime(laundromat.Close)}</Text>
        </View>
        
        <View>
          <View style={{flexDirection: 'row', marginBottom: 15}}>
            {this.datetimePickerBtn(this.openDatePicker, require('./assets/calendar.png'), date.toDateString(), {})}
            {this.datetimePickerBtn(this.openTimePicker, require('./assets/clock.png'), Utilities.formatStandardTime(time), {borderLeftWidth: 0})}
          </View>

          {dateTimeErrorMessage !== '' &&
            <Text style={{color: 'red', alignSelf: 'center'}}>
              {dateTimeErrorMessage}
            </Text>
          }
        </View>

        <DateTimePicker
          date={date}
          mode="date"
          isVisible={isDatePickerVisible}
          onConfirm={this.handleDateTimePicked}
          onCancel={this.closeDatePicker}
          minimumDate={new Date()}
          maximumDate={maxDate}
        />

        <DateTimePicker
          date={time}
          mode="time"
          isVisible={isTimePickerVisible}
          onConfirm={time => this.handleDateTimePicked(time, 'time')}
          onCancel={this.closeTimePicker}
          is24Hour={false}
        />

        <ScrollView>
          <SafeAreaView style={{flex: 1, flexDirection: 'row', marginLeft: 10}}>
            {this.machineList(washers, 'Washer')}
            {this.machineList(dryers, 'Dryer')}
          </SafeAreaView>
        </ScrollView>
        

        <Modal isVisible={isModalVisible} style={modalStyles.modalContainer}>
          {(bookingConfirmed || bookingFailed) &&
            <View style={modalStyles.container}>
              <Icon
                name={bookingConfirmed ? 'check' : 'times'}
                color={bookingConfirmed ? 'green' : 'red'}
                size={50}
                style={{alignSelf: 'center'}}
              />
              {bookingConfirmed ?
                <View style={{width: '100%'}}>
                  <Text style={{...modalStyles.header, color: 'green', alignSelf: 'center'}}>Booking Successful</Text>
                  <Text style={modalStyles.text}>Please arrive 5 minutes before your booking to check-in</Text>
                </View> :
                <Text style={{...modalStyles.header, color: 'red', alignSelf: 'center'}}>Booking Unsuccessful</Text>
              }
              <View style={{flexDirection: "row", justifyContent: 'flex-end'}}>
                <Button
                  title="Close"
                  onPress={() => {
                    this.toggleModal();
                    if(this.props.navigation.getParam('reservation'))
                      this.props.navigation.goBack();
                  }}
                  buttonStyle={modalStyles.btn}
                />
              </View>
            </View>
          }
          {!bookingConfirmed && !bookingFailed &&
            <View style={modalStyles.container}>
              <Text style={modalStyles.header}>Reservation Information</Text>
              <Text style={modalStyles.text}>{washerChecked ? 'Washer' : 'Dryer'} {machineUID}</Text>
              <Text style={modalStyles.text}>{date.toLocaleDateString()}</Text>
              <Text style={modalStyles.text}>{Utilities.formatStandardTime(time)} - {Utilities.formatStandardTime(endTime)}</Text>
              <View style={{flexDirection: "row", justifyContent: 'flex-end'}}>
                <Button title="Cancel" type="outline" onPress={this.toggleModal} buttonStyle={modalStyles.btn}/>
                <Button title="Confirm" onPress={this.makeReservation} buttonStyle={modalStyles.btn}/>
              </View>
            </View>
          }
        </Modal>
      </View>
    )
  }
}

MakeReservation.propTypes = {
  navigation: Proptypes.shape({
    navigate: Proptypes.func.isRequired,
    getParam: Proptypes.func.isRequired
  }),
}