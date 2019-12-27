import React from 'react';
import Proptypes from 'prop-types';
import {
  ScrollView,
  View,
} from 'react-native';

import {
  Card,
  Text,
  Divider
} from 'react-native-elements';

import {
  Table,
  TableWrapper,
  Col,
  Cols,
  Cell,
} from 'react-native-table-component';

import { Dropdown } from 'react-native-material-dropdown';

import reportStyles from '../stylesheets/reportTableStyle';

import FirebaseFunctions from '../firebase';

const MONTHS = ["Jan", "Feb", "March", "April", "May", "June", "July", "August", "Sep", "Oct", "Nov", "Dec"];


export default class Reports extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      laundromatUIDs: [],
      reservations: {},
      laundromats: {},
      laundromatNames: [],
      machineNameCol: [],
      profitCol: [],
      totalProfit: 0,
      laundromatRowHeights: [],
      rowHeights: [],
    }
  }

  async componentDidMount() {
    const laundromatUIDs = [];
    const laundromatNames = [];
    const machineNameCol = [];
    const laundromats = {};
    const reservations = {};
    const machineNames = ["Washers", "Dryers"];
    const rowHeight = [30, 30];
    const rowHeights = [];
    const laundromatRowHeights = [];

    const l = this.props.navigation.getParam("laundromats");
    for(var i=0; i < l.length; i++){
      laundromatUIDs.push(l[i].id);
      laundromats[l[i].id] = l[i].Name;
      laundromatNames.push(l[i].Name);
      machineNameCol.push(...machineNames);
      const res = await FirebaseFunctions.getAllReservationsByLaundromats(l[i].id);
      reservations[l[i].id] = res;
      rowHeights.push(...rowHeight);
      laundromatRowHeights.push(60);
    }
    
    this.setState({
      laundromats,
      reservations,
      laundromatUIDs,
      laundromatNames,
      machineNameCol,
      rowHeights,
      laundromatRowHeights,
    })
  }

  calcReservationsProfit = reservations => {
    var washers = 0;
    var dryers = 0;
    for(var i=0; i< reservations.length; i++)
      if(reservations[i].machineType === "washers")
        washers += reservations[i].price
      else
        dryers += reservations[i].price
    this.setState(prevState => ({ totalProfit: prevState.totalProfit + washers + dryers }))
    return ['$' + washers, '$' + dryers];
  }

  updateProfit = value => {
    this.setState({totalProfit: 0});
    const {reservations, laundromatUIDs} = this.state;
    const now = new Date();
    const profitCol = [];
    var filteredReservations;
    laundromatUIDs.forEach(id => {
      if (value === "Current year") 
        filteredReservations = reservations[id].filter(res => res.startTime.getFullYear() === now.getFullYear());
      else if (value === "Current month")
        filteredReservations = reservations[id].filter(res => res.startTime.getMonth() === now.getMonth());
      else
        filteredReservations = reservations[id].filter(res => res.startTime.getMonth() === now.getMonth() + 1);
      
      const profits = this.calcReservationsProfit(filteredReservations);
      profitCol.push(...profits);
    });
    
    this.setState({ profitCol });
  }

  

  render() {
    const {totalProfit, laundromatNames, machineNameCol,
      profitCol, rowHeights, laundromatRowHeights, laundromatUIDs, reservations} = this.state;
    const options = [{value: 'Current year'}, {value: 'Current month'}, {value: 'Next month'}];

    /* calculate max and min month earnings */
    const statistics = {}
    var uniqueMonths = new Set(); 
    
    reservations && laundromatUIDs.forEach(id => {
      reservations[id].forEach(res => {
        const monthIDX = res.startTime.getMonth();
        uniqueMonths.add(MONTHS[monthIDX])
        statistics[MONTHS[monthIDX]] = res.price + (statistics[MONTHS[monthIDX]] || 0); 
      })
    })

    uniqueMonths = [...uniqueMonths];
    uniqueMonths.sort((a, b) => {return statistics[a] - statistics[b]});
    const lastElementInd = uniqueMonths.length - 1;

    const statisticsRowTitles = ['Highest earnings', 'Lowest earnings']
    const statisticsRowMonths = [uniqueMonths[lastElementInd], uniqueMonths[0]];
    const statisticsRowProfits = ['$' + statistics[uniqueMonths[lastElementInd]], '$' + statistics[uniqueMonths[0]]]
    
    return (
      <ScrollView>
        <Card containerStyle={{ borderRadius: 10, padding:20 }} title="Statistics" >
          <Table borderStyle={{borderWidth: 1}}>
            <TableWrapper style={{flexDirection: 'row'}}>
              <Cell data='' style={reportStyles.statisticTitleHeader}/>
              <Cell data='Month' style={reportStyles.statisticHeader} textStyle={reportStyles.headerText}/>
              <Cell data='Profit' style={reportStyles.statisticHeader} textStyle={reportStyles.headerText}/>
            </TableWrapper>
            <TableWrapper style={{flexDirection: 'row'}}>
              <Col data={statisticsRowTitles} heightArr={[30, 30]} style={{flex: 2}} textStyle={reportStyles.text}/>
              <Col data={statisticsRowMonths} heightArr={[30, 30]} style={{flex: 1}} textStyle={reportStyles.btnText}/>
              <Col data={statisticsRowProfits} heightArr={[30, 30]} style={{flex: 1}} textStyle={reportStyles.btnText}/>
            </TableWrapper>
          </Table>
        </Card>
        <Card containerStyle={{ borderRadius: 10}} title="Profits" >
          <Dropdown
            label='View by...'
            data={options}
            containerStyle={{width: 130, alignSelf: 'flex-end', marginRight: 5}}
            dropdownPosition={0}
            onChangeText={this.updateProfit}
          />
          { profitCol.length ?
            <View style={reportStyles.container}>
              <Table borderStyle={{borderWidth: 1}}>
                <TableWrapper style={{flex: 1, flexDirection: 'row'}} >
                  {/* Left Wrapper */}
                  <TableWrapper style={{flex: 3}}>
                    <Cell data="Laundromat" style={reportStyles.laundromatHeader} textStyle={reportStyles.headerText}/>
                    <TableWrapper style={{flex: 3, flexDirection: 'row'}}>
                      <Col
                        data={laundromatNames}
                        textStyle={reportStyles.text}
                        style={reportStyles.laundromatCol}
                        heightArr={laundromatRowHeights}
                      />
                      <Col
                        data={machineNameCol}
                        textStyle={reportStyles.titleText}
                        style={reportStyles.rowStyle}
                        heightArr={rowHeights}
                      />
                    </TableWrapper>
                    <Cell data="Total" style={reportStyles.laundromatHeader} textStyle={reportStyles.headerText}/>
                  </TableWrapper>
        
                  {/* Right Wrapper */}
                  <TableWrapper style={{flex:1}}>
                    <Cell data="Profit" style={reportStyles.profitHeader} textStyle={reportStyles.headerText}/>
                    <Cols data={[profitCol]} heightArr={rowHeights} style={reportStyles.rowStyle} textStyle={reportStyles.btnText}/>
                    <Cell data={'$' + totalProfit} style={reportStyles.profitHeader} textStyle={reportStyles.headerText}/>
                  </TableWrapper>
                </TableWrapper>
              </Table>
            </View> :
            <Text style={{textAlign: 'center', marginTop: 20}}>Select an option to view profits</Text>
          }
        </Card>
      </ScrollView>
    );
  }
}

Reports.propTypes = {
  navigation: Proptypes.shape({
    navigate: Proptypes.func.isRequired,
    getParam: Proptypes.func.isRequired
  }),
}