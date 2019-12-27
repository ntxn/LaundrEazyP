import React from 'react';
import Proptypes from 'prop-types';

import {
  FlatList,
  Text,
  ScrollView,
  View
} from 'react-native';
import {
  Card,
  ListItem,
  Divider,
  Button
} from 'react-native-elements';
import { List } from 'react-native-paper';
import Modal from "react-native-modal";

import FirebaseFunctions from '../firebase';
import UserInfo from '../userInfo';
import {
  DRYER,
  WASHER,
} from '../commonConstants';

import cardStyles from '../stylesheets/cardStyles';
import modalStyles from '../stylesheets/modalStyles';

export default class Owner extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      ccountDetailExpanded: false,
      laundromatRegistrationExpanded: false,
      registrationStatus: '',
      laundromats: this.props.navigation.getParam('laundromats'),
      laundromatIDToDelete: null,
      isModalVisible: false,
    }
  }


  updateLaundromats = laundromat => {
    var newItem = true;
    const laundromats = this.state.laundromats.map(item => {
      if(item.id === laundromat.id){
        newItem = false;
        return laundromat;
      }
      return item;
    });

    if(newItem)
      laundromats.push(laundromat);
    
    this.setState({ laundromats });
  }

  toggleModal = (id=null) => this.setState(prevState => ({
    isModalVisible: !prevState.isModalVisible,
    laundromatIDToDelete: id
  }))

  deleteLaundromat = async () => {
    response = await FirebaseFunctions.deleteLaundromat(this.state.laundromatIDToDelete, UserInfo.uid);
    
    if(response){
      const laundromats = this.state.laundromats.filter(item => item.id != this.state.laundromatIDToDelete);
      this.setState({ laundromats });
      this.toggleModal();
    } else {
      this.toggleModal();
      alert("Deletion Unsucessful")
    }
  }

  render() {
    return (
      <ScrollView>
        <Card containerStyle={cardStyles.cardContainer} title="Account Details">
          <ListItem
            title={UserInfo.firstName + " " + UserInfo.lastName}
            leftIcon={{ name: 'account-circle' }}
            containerStyle={cardStyles.firstItemContainer}
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
            title={`(${UserInfo.phoneNumber.substring(0, 3)}) ${UserInfo.phoneNumber.substring(3, 6)}-${UserInfo.phoneNumber.substring(6, 10)}`}
            leftIcon={{ name: 'local-phone' }}
            containerStyle={cardStyles.lastItemContainer}
          />
        </Card>

        <Divider style={cardStyles.divider} />
        <Card containerStyle={cardStyles.cardContainer}>
          <ListItem
            title="Edit account details"
            containerStyle={cardStyles.firstItemContainer}
            leftIcon={{ name: 'edit' }}
            onPress={async () => {
              this.props.navigation.navigate("EditProfile", { profile: this, collection: 'Owners' });
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
            title="View Reports"
            
            leftIcon={{ name: 'assessment' }}
            onPress={() => this.props.navigation.navigate(
              'Reports',
              { laundromats: this.state.laundromats }
            )}
            bottomDivider
            chevron
          />
          <ListItem
            title="Log Out"
            containerStyle={cardStyles.lastItemContainer}
            leftIcon={{ name: 'exit-to-app', color:'red' }}
            titleStyle={{fontWeight:'500', color:'red'}}
            onPress={() => this.props.navigation.navigate('Home')}
            underlayColor='lightgray'
            chevron
          />
        </Card>

        <Divider style={cardStyles.divider} />

        <Card containerStyle={cardStyles.cardContainer} title="Laundromats">
          <FlatList
            data={this.state.laundromats}
            renderItem={({ item }) =>
            <List.Accordion
              title={item.Name}
              titleStyle={{fontSize: 17, fontWeight: 'bold', paddingBottom: 5}}
              description={`${item.Street}, ${item.City}, ${item.State}, ${item.Zip}`}
              descriptionStyle={{fontStyle: 'italic', fontSize: 12}}
              style={{borderColor: '#ddd', borderBottomWidth: 1}}
            >
              <ListItem
                title="Reservations"
                leftIcon={{ name: 'list' }}
                style={cardStyles.accordionItem}
                onPress={() => 
                  this.props.navigation.navigate(
                    "Reservations",
                    { laundromat: item }
                  )
                }
                chevron
              />
              <ListItem
                title="Make reservation"
                leftIcon={{ name: 'today' }}
                style={cardStyles.accordionItem}
                onPress={async () => {
                  const washers = await FirebaseFunctions.getMachines(WASHER, item.id).then(
                    (machines) => {return machines;}, () => {return [];});
                  const dryers = await FirebaseFunctions.getMachines(DRYER, item.id).then(
                    (machines) => {return machines;}, () => {return [];});

                  this.props.navigation.navigate(
                    'MakeReservation',
                    {
                      customerUID: "RandomCustomer",
                      laundromat: item,
                      washers,
                      dryers,
                    }
                  );
                }}
                chevron
              />
              <ListItem
                title="Machines"
                leftIcon={{ name: 'local-laundry-service' }}
                style={cardStyles.accordionItem}
                onPress={async () => {
                  const washers = await FirebaseFunctions.getMachines(WASHER, item.id).then(
                    (machines) => {return machines;}, () => {return [];});
                  const dryers = await FirebaseFunctions.getMachines(DRYER, item.id).then(
                    (machines) => {return machines;}, () => {return [];});
                  const maxIndexWashers = washers.length ? parseInt(washers[washers.length - 1].id) : 0;
                  const maxIndexDryers = dryers.length ? parseInt(dryers[dryers.length - 1].id) : 0;

                  this.props.navigation.navigate(
                    'Machines',
                    {
                      laundromatUID: item.id,
                      washers,
                      dryers,
                      maxIndexWashers,
                      maxIndexDryers
                    }
                  )
                }}
                chevron
              />
              <ListItem
                title="Edit"
                leftIcon={{ name: 'edit' }}
                style={cardStyles.accordionItem}
                onPress={() => this.props.navigation.navigate(
                  "AddLaundromat",
                  {
                    updateLaundromats: this.updateLaundromats,
                    laundromat: item,
                  }
                )}
                chevron
              />
              <ListItem
                title="Delete"
                titleStyle={{ color: 'red' }}
                leftIcon={{ name: 'delete', color: 'red'}}
                style={{ ...cardStyles.accordionItem, borderColor: '#ddd', borderBottomWidth: 1 }}
                onPress={() => this.toggleModal(item.id)}
                chevron
              />
            </List.Accordion>
            }
          />
          <ListItem
            title="Add Laundromat"
            titleStyle={{color: 'blue', fontWeight: 'bold'}}
            leftIcon={{ name: 'add-circle-outline', color: 'blue' }}
            onPress={() => this.props.navigation.navigate(
              "AddLaundromat",
              { updateLaundromats: this.updateLaundromats }
            )}
          />
        </Card>

        <Divider style={cardStyles.divider} />

        <Modal isVisible={this.state.isModalVisible} style={modalStyles.modalContainer}>
          <View style={modalStyles.container}>
            <View style={{width: '100%'}}>
              <Text style={modalStyles.header}>Are you sure you want to this laundromat?</Text>
            </View>
            
            <View style={{flexDirection: "row", justifyContent: 'flex-end'}}>
              <Button
                title="Cancel"
                type="outline"
                onPress={this.toggleModal}
                buttonStyle={modalStyles.btn}
              />
              <Button
                title="Confirm"
                onPress={this.deleteLaundromat}
                buttonStyle={modalStyles.btn}
              />
            </View>
          </View>
        </Modal>
      </ScrollView>
    )
  }
}

Owner.propTypes = {
  navigation: Proptypes.shape({
    navigate: Proptypes.func.isRequired,
    getParam: Proptypes.func.isRequired
  }),
}