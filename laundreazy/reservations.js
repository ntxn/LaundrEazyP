import React from 'react';
import Proptypes from 'prop-types';

import Modal from "react-native-modal";
import {
  FlatList,
  Text,
  View,
  ScrollView,
  RefreshControl
} from 'react-native';
import {
  Button,
  Card,
  ListItem
} from 'react-native-elements';
import { List } from 'react-native-paper';


import FirebaseFunctions from './firebase';
import UserInfo from './userInfo';
import Utilities from './utilities';
import {
  DRYER,
  WASHER,
} from './commonConstants';
import cardStyles from './stylesheets/cardStyles';
import modalStyles from './stylesheets/modalStyles';

export default class Reservations extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      washers: [],
      dryers: [],
      washerReservations: [],
      dryerReservations: [],
      isModalVisible: false,
      reservation: null,
      refreshing: false,
    }
  }

  async componentDidMount() {
    const laundromat = this.props.navigation.getParam('laundromat');
    var washers = [];
    var dryers = [];
    var washerReservations = [];
    var dryerReservations = [];

    if(laundromat){
      washers = await FirebaseFunctions.getMachines(WASHER, laundromat.id).then(
        (machines) => {return machines;}, () => {return [];});
      dryers = await FirebaseFunctions.getMachines(DRYER, laundromat.id).then(
        (machines) => {return machines;}, () => {return [];})
      const response = await FirebaseFunctions.getIncompletedReservationsByLaundromats(laundromat.id);
      if(response[0]){
        washerReservations = Utilities.sortReservations(response[0]);
        dryerReservations = Utilities.sortReservations(response[1]);
      }
    } else {
      const reservations = Utilities.sortReservations(await FirebaseFunctions.getReservationsOfUser(UserInfo.uid));
      reservations.forEach(reservation => {
        reservation.machineType === "washers" ?
          washerReservations.push(reservation) :
          dryerReservations.push(reservation);
      })
    }
    
    this.setState({
      washers,
      dryers,
      washerReservations,
      dryerReservations
    })
  }

  updateReservations = (reservation, originalMachineType) => {
    const {washerReservations, dryerReservations} = this.state;
    const reservationsName = reservation.machineType === "washers" ? "washerReservations" : "dryerReservations";
    var reservations = reservation.machineType === "washers" ? washerReservations : dryerReservations;

    if(reservation.machineType !== originalMachineType){
      const otherReservationsName = originalMachineType === "washers" ? "washerReservations" : "dryerReservations";
      var otherReservations = originalMachineType === "washers" ? washerReservations : dryerReservations;
      otherReservations = otherReservations.filter(r => r.id !== reservation.id)
      this.setState({[otherReservationsName] : otherReservations});
    } else {
      reservations = reservations.filter(r => r.id !== reservation.id)
    }

    reservations.push(reservation);
    Utilities.sortReservations(reservations);
    this.setState({[reservationsName] : reservations});
  }

  cancelReservation = async reservation => {
    const {washerReservations, dryerReservations} = this.state;
    const response = await FirebaseFunctions.cancelReservation(
      reservation,
      this.props.navigation.getParam('payment'),
      this.props.navigation.getParam('updatePayment')
    );

    if(response){
      var reservations = reservation.machineType === "washers" ? washerReservations : dryerReservations;
      var reservationType = reservation.machineType === "washers" ? "washerReservations" : 'dryerReservations';
      reservations = reservations.filter(res => res.id !== reservation.id);
      this.setState({[reservationType]: reservations});
    }
  }

  renderReservation = ({ item }, machineTitle) => {
    const disabled = this.isEligibleToMakeChanges(item.startTime);
    status = `Status: ${item.isCompleted ? 'Completed' : 'Active'}`;

    return (
      <List.Accordion
        title={item.id}
        titleStyle={{fontSize: 17, fontWeight: 'bold', paddingBottom: 5}}
        description={`${Utilities.formatStandardTime(item.startTime)} - ${Utilities.formatStandardTime(item.endTime)} on ${item.startTime.toLocaleDateString()}`}
        descriptionStyle={{fontStyle: 'italic', fontSize: 12}}
        style={{borderColor: '#ddd', borderBottomWidth: 1}}
      >
        <ListItem
          title={item.customerUID}
          leftIcon={{ name: 'account-circle' }}
          style={cardStyles.accordionItem}
        />
        <ListItem
          title={"Reserved On: " + item.reservedAt.toLocaleDateString()}
          leftIcon={{ name: 'info' }}
          style={cardStyles.accordionItem}
        />
        <ListItem
          title={machineTitle + "" + item.machineUID}
          leftIcon={{ name: 'local-laundry-service' }}
          style={cardStyles.accordionItem}
        />
        <ListItem
          title={status}
          titleStyle={{ color: 'green' }}
          leftIcon={{ name: 'timeline', color: 'green' }}
          style={cardStyles.accordionItem}
        />
        <ListItem
          title={"On: " + item.startTime.toLocaleDateString()}
          subtitle={Utilities.formatStandardTime(item.startTime) + " - " + Utilities.formatStandardTime(item.endTime)}
          leftIcon={{ name: 'date-range' }}
          style={cardStyles.accordionItem}
        />
        <ListItem
          title="Edit"
          leftIcon={{ name: 'edit' }}
          onPress={ async () => {
            var washers = this.state.washers;
            var dryers = this.state.dryers;
            var laundromat = this.props.navigation.getParam('laundromat');
            if(!washers.length){
              washers = await FirebaseFunctions.getMachines(WASHER, item.laundromatUID).then(
                machines => { return machines; }, () => { return []; });
              dryers = await FirebaseFunctions.getMachines(DRYER, item.laundromatUID).then(
                machines => { return machines; }, () => { return []; });
              laundromat = await FirebaseFunctions.getLaundromatByID(item.laundromatUID).then(
                laundromat => { return laundromat; }, () => { return {}; });
            }

            this.props.navigation.navigate(
              'MakeReservation',
              {
                customerUID: item.customerUID,
                laundromat,
                washers,
                dryers,
                reservation: item,
                updateReservations: this.updateReservations,
                payment: this.props.navigation.getParam('payment'),
                updatePayment: this.props.navigation.getParam('updatePayment')
              }
            );
          }}
          disabledStyle={{ opacity: 0.5 }}
          disabled={disabled}
          style={cardStyles.accordionItem}
          chevron
        />
        <ListItem
          title="Cancel"
          disabledStyle={{ opacity: 0.5 }}
          style={{ ...cardStyles.accordionItem, borderColor: '#ddd', borderBottomWidth: 1 }}
          leftIcon={{ name: 'close', color: 'red' }}
          titleStyle={{ fontWeight: '500', color: 'red' }}
          onPress={() => { this.toggleModal(item) }}
          underlayColor='lightgray'
          disabled={disabled}
          chevron
        />
      </List.Accordion>
    )
  }

  isEligibleToMakeChanges = startTime => {
    var now = new Date();
    now = now.setMinutes(now.getMinutes() + 30);

    return new Date(now) < startTime ? false : true;
  }

  reservationList = (reservations, title, machineTitle) => {
    return (
      <Card containerStyle={cardStyles.cardContainer} title={title}>
        { reservations.length ?
          <FlatList
            data={reservations}
            renderItem={({ item }) => this.renderReservation({item}, machineTitle)}
            refreshControl={<RefreshControl refreshing={this.state.refreshing} onRefresh={this.onRefresh}/>}
          /> :
          <Text style={{color: 'gray', paddingBottom: 10, textAlign: 'center'}}>No Reservation Found</Text>
        }
      </Card>
    );
  }

  toggleModal = reservation => this.setState(prevState => ({
    isModalVisible: !prevState.isModalVisible,
    reservation,
  }))


  /**************  TO REFRESH PAGE AFTER EDIT RESERVATION  **************/
  setRefreshing = refreshing => this.setState({ refreshing });

  wait = timeout => {
    return new Promise(resolve => {
      setTimeout(resolve, timeout);
    });
  }

  onRefresh = () => {
    this.setRefreshing(true);
    this.wait(2000).then(() => setRefreshing(false));
  }

  // remove timer
  componentWillUnmount() {
    if(this.wait) {
      clearTimeout(this.wait);
      this.wait = 0;
    }
  }


  render() {
    const { reservation, washerReservations, dryerReservations } = this.state;

    return (
      <ScrollView>
        {this.reservationList(washerReservations, "WASHER RESERVATIONS", "Washer ")}
        {this.reservationList(dryerReservations, "DRYER RESERVATIONS", "Dryer ")}

        <Modal isVisible={this.state.isModalVisible} style={modalStyles.modalContainer}>
          <View style={modalStyles.container}>
            <View style={{ width: '100%' }}>
              <Text style={modalStyles.header}>Are you sure you want to cancel this reservation?</Text>
            </View>

            <View style={{ flexDirection: "row", justifyContent: 'flex-end' }}>
              <Button
                title="Cancel"
                type="outline"
                onPress={() => this.toggleModal(null)}
                buttonStyle={modalStyles.btn}
              />
              <Button
                title="Confirm"
                onPress={() => {
                  this.cancelReservation(reservation);
                  this.toggleModal(null);
                }}
                buttonStyle={modalStyles.btn}
              />
            </View>
          </View>
        </Modal>
      </ScrollView>
    );
  }
}

Reservations.propTypes = {
  laundromat: Proptypes.string,
}
