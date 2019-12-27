import React from 'react';
import Proptypes from 'prop-types';
import {
  FlatList,
  Text,
  View,
  ScrollView,
} from 'react-native';
import {
  Button,
  Card,
  Divider,
  ListItem
} from 'react-native-elements';
import Modal from "react-native-modal";

import FirebaseFunctions from '../firebase';
import {
  DRYER,
  MAX_MACHINES_NUM,
  WASHER,
  WORKING,
  status,
} from '../commonConstants';
import modalStyles from '../stylesheets/modalStyles';
import cardStyles from '../stylesheets/cardStyles';

export default class Machines extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      washers: this.props.navigation.getParam('washers'),
      dryers: this.props.navigation.getParam('dryers'),
      maxIndexWashers: this.props.navigation.getParam('maxIndexWashers'),
      maxIndexDryers: this.props.navigation.getParam('maxIndexDryers'),
      lastIndex: 0,
      isModalVisible: false,
      id: null,
      machineType: null,
    }
  }

  addMachine = (machineType) => {
    var machines, maxIndex, indexName;
    if(machineType === WASHER){
      maxIndex = this.state.maxIndexWashers;
      machines = this.state.washers;
      indexName = "maxIndexWashers";
    } else {
      maxIndex = this.state.maxIndexDryers;
      machines = this.state.dryers;
      indexName = "maxIndexDryers";
    }

    if(machines.length >= MAX_MACHINES_NUM){
      alert("Max number of machines reached");
      return;
    }

    var nextIndex;
    if(maxIndex > machines.length){
      var m_i = this.state.lastIndex;
      for(var i = this.state.lastIndex + 1; i < maxIndex; i++){
        if(i !== parseInt(machines[m_i].id)){
          this.setState({ lastIndex: i });
          nextIndex = i.toString();
          break;
        }
        m_i++;
      }
    } else { 
      nextIndex = (maxIndex + 1).toString();
      this.setState({[indexName]: maxIndex + 1})
    }

    response = FirebaseFunctions.addMachine(
      machineType,
      nextIndex,
      this.props.navigation.getParam('laundromatUID')
    );

    if(response){
      machineType === WASHER ? 
      this.setState(prevState => ({ washers: [...prevState.washers, {id: nextIndex, status: WORKING}] })) :
      this.setState(prevState => ({ dryers: [...prevState.dryers, {id: nextIndex, status: WORKING}] }));
    }
  }

  deleteMachines = async (machineType) => {
    const response = await FirebaseFunctions.deleteMachines(machineType, this.props.navigation.getParam('laundromatUID'));
    if(response){
      type = machineType === WASHER ? "washers" : "dryers";
      maxIndex = machineType === WASHER ? "maxIndexWashers" : "maxIndexDryers";
      this.setState(prevState => ({
        ...prevState,
        [type]: [],
        [maxIndex]: 0
      }))
    }
  }

  deleteMachine = async (machineType, id) => {
    const response = await FirebaseFunctions.deleteMachine(machineType, id, this.props.navigation.getParam('laundromatUID'));
    if(response){
      this.setState(prevState => {
        if(machineType === WASHER)
          return {
            ...prevState,
            washers: prevState.washers.filter(machine => machine.id != id)
          }
        
        return {
          ...prevState,
          dryers: prevState.dryers.filter(machine => machine.id != id)
        }
      })
    }
  }

  createCard = (machineType, machines) => {
    const title = machineType === WASHER ? 'Washers' : 'Dryers';
    return (
      <Card containerStyle={cardStyles.cardContainer} title={title}>
        <FlatList
          data={machines}
          renderItem={({item}) => this.renderItem({item}, machineType)}
        />
        <ListItem
          title={`Add ${title}`}
          titleStyle={{color: 'blue', fontWeight: 'bold'}}
          leftIcon={{ name: 'add-circle-outline', color: 'blue' }}
          onPress={() => this.addMachine(machineType)}
          disabled={machines.length === MAX_MACHINES_NUM}
          disabledStyle={{ opacity:0.5 }}
          bottomDivider
        />
        <ListItem
          title="Delete All"
          titleStyle={{color: 'red', fontWeight: 'bold'}}
          leftIcon={{ name: 'delete', color: 'red' }}
          onPress={() => this.toggleModal(machineType)}
          disabled={machines.length === 0}
          disabledStyle={{ opacity:0.5 }}
        />
      </Card>
    )
  }

  renderItem = ({item}, machineType) => {
    return (
      <ListItem
        title={`#${item.id}`}
        titleStyle={{fontSize: 18, fontWeight: 'bold', paddingBottom: 5}}
        subtitle={`Status: ${status[item.status]}`}
        subtitleStyle={{fontSize: 14, fontStyle: 'italic', color: 'gray'}}
        rightIcon={{ name: 'delete'}}
        onPress={() => this.toggleModal(machineType, item.id)}
        bottomDivider
      />
    )
  }

  toggleModal = (machineType=null, id=null) => {
    this.setState(prevState => ({
      ...prevState,
      isModalVisible: !prevState.isModalVisible,
      machineType,
      id,
    }))
  }

  delete = async (machineType, id) => {
    this.toggleModal();
    if(id)
      this.deleteMachine(machineType, id);
    else if(machineType)
      this.deleteMachines(machineType);
  }

  render(){
    return (
      <ScrollView>
        {this.createCard(WASHER, this.state.washers)}
        <Divider style={cardStyles.divider} />
        {this.createCard(DRYER, this.state.dryers)}
        <Divider style={cardStyles.divider} />

        <Modal isVisible={this.state.isModalVisible} style={modalStyles.modalContainer}>
          <View style={modalStyles.container}>
            <View style={{width: '100%'}}>
              <Text style={modalStyles.header}>Item(s) once deleleted can't be retrieved</Text>
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
                onPress={() => this.delete(this.state.machineType, this.state.id)}
                buttonStyle={modalStyles.btn}
              />
            </View>
          </View>
        </Modal>
      </ScrollView>
    );
  }
}

Machines.propTypes = {
  laundromatUID: Proptypes.string,
}
