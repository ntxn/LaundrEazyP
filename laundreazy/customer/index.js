import React from 'react';
import Proptypes from 'prop-types';
import Carousel from 'react-native-snap-carousel';
import Native, { ScrollView, FlatList } from 'react-native'
import {
  Dimensions,
  Text,
  TouchableHighlight,
  View,
  SafeAreaView,
} from 'react-native';
import {
  Button,
} from 'react-native-elements';
import { Searchbar } from 'react-native-paper';
import Icon from 'react-native-vector-icons/FontAwesome';
import MapView from 'react-native-maps';
import Geolocation from '@react-native-community/geolocation';

import FirebaseFunctions from '../firebase';
import Utilities from '../utilities';
import styles from '../stylesheets/styles'
import {
  WASHER,
  WORKING,
  DRYER,
} from '../commonConstants';
import UserInfo from '../userInfo';

const { width: viewportWidth, height: viewportHeight } = Dimensions.get('window');

function wp(percentage) {
  const value = (percentage * viewportWidth) / 100;
  return Math.round(value);
}

const slideWidth = wp(85);
const itemHorizontalMargin = wp(2);

export const sliderWidth = viewportWidth;
export const itemWidth = slideWidth + itemHorizontalMargin * 2;

export default class Customer extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      region: {
        latitude: 0,
        longitude: 0,
        latitudeDelta: 0,
        longitudeDelta: 0,
      },
      current: {
        latitude: 0,
        longitude: 0,
        latitudeDelta: 0,
        longitudeDelta: 0,
      },
      searchTerm: "",
      errorMessage: "",
      laundromats: this.props.navigation.getParam('laundromats'),
      mapView: true,
      cardStyle: styles.card,
      radius: 40,
      offset: 0.005,
      payment: null
    }
  }

  async componentDidMount() {
    laundromats = this.state.laundromats;
    Geolocation.getCurrentPosition(
      position => {
        laundromats.sort((a, b) => {
          aToUser = Utilities.distance(a.Lat, a.Long, position.coords.latitude, position.coords.longitude);
          bToUser = Utilities.distance(b.Lat, b.Long, position.coords.latitude, position.coords.longitude);

          return aToUser - bToUser;
        })
      },
      error => alert(error.message),
      { enableHighAccuracy: true }
    );

    this.setState({ laundromats });
    
    this.findCoordinates();
    const payment = await FirebaseFunctions.getPayment(UserInfo.uid);
    this.setState({ payment })
  }

  replace = () => this.props.navigation.replace('Home');

  findCoordinates = () => {
    Geolocation.getCurrentPosition(
      position => {
        this.setState({
          region: {
            latitude: position.coords.latitude - this.state.offset,
            longitude: position.coords.longitude,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          },
          current: {
            latitude: position.coords.latitude - this.state.offset,
            longitude: position.coords.longitude,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          },
        });
      },
      error => alert(error.message),
      { enableHighAccuracy: true }
    );
  };

  loadMarkers = () => {
    newMarkers = [];
    i = 0;
    this.state.laundromats.forEach(data => {
      newMarkers[i] = <MapView.Marker
        key={i}
        coordinate={{
          latitude: data.Lat,
          longitude: data.Long
        }}
        title={data.Name}
        description={data.Street + ", " + data.City + ", " + data.State}
      />
      i++;
    });

    return newMarkers;
  }

  /**
   * Taking an array of laundromats and display them
   * <TouchableHighlight> is used later to click on each laundromat to 
   * show a list of machines
   */
  renderLaundromats = ({ item }) => {
    distance = Utilities.distance(item.Lat, item.Long, this.state.current.latitude, this.state.current.longitude);
    distance = Math.round(distance);
    return (
      <TouchableHighlight style={this.state.cardStyle}
        underlayColor='lightgrey'
        onPress={async () => {
          const washers = await FirebaseFunctions.getMachines(WASHER, item.id).then(
            (machines) => { return machines; }, () => { return []; }
          );
          const dryers = await FirebaseFunctions.getMachines(DRYER, item.id).then(
            (machines) => { return machines; }, () => { return []; }
          );
          this.props.navigation.navigate(
            'MakeReservation',
            {
              customerUID: UserInfo.uid,
              laundromat: item,
              washers,
              dryers,
              payment: this.state.payment,
              updatePayment: this.updatePayment
            }
          );
        }}
      >
        <View>
          <Text style={{ fontSize: 20, fontWeight: 'bold' }}>{item.Name}</Text>
          <Text>{item.Street + ", " + item.City + ", " + item.State + ", " + item.Zip}</Text>
          <Text>({item.Phone.substring(0, 3)}) {item.Phone.substring(3, 6)}-{item.Phone.substring(6, 10)}</Text>
          <Text style={{fontStyle:"italic", fontWeight: 'bold'}}>{distance} Miles Away</Text>
        </View>
      </TouchableHighlight>
    )
  }


  /**
   * Search for laundromat based on name, city, zipcode
   * the response gotten from firebase function is sorted by distance
   * from the current location
   */
  search = async () => {
    var laundromats = this.props.navigation.getParam('laundromats');

    laundromats = laundromats.filter(data => {
      all = (data.Name + data.City + data.Street + data.State + data.Zip).toLowerCase();
      return all.includes(this.state.searchTerm.toLowerCase());
    });

    if (laundromats.length > 0) {
      this.setState({
        laundromats: [],
        errorMessage: "",
      })

      //Sort based on current location
      Geolocation.getCurrentPosition(
        position => {
          laundromats.sort((a, b) => {
            aToUser = Utilities.distance(a.Lat, a.Long, position.coords.latitude, position.coords.longitude);
            bToUser = Utilities.distance(b.Lat, b.Long, position.coords.latitude, position.coords.longitude);

            return aToUser - bToUser;
          })
        },
        error => alert(error.message),
        { enableHighAccuracy: true }
      );

      if (laundromats.length) {
        this.setState({
          region: {
            latitude: laundromats[0].Lat - this.state.offset,
            longitude: laundromats[0].Long,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          },
          laundromats,
        })
        return;
      }
    }

    this.setState({
      laundromats: [],
      errorMessage: "No laundromats found"
    });
  }

  toggleView = () => this.setState(prevState => ({ mapView: !prevState.mapView }))
  updatePayment = payment => this.setState({ payment })

  render() {
    return (
      <View style={{ flex: 1 }}>
        {this.state.mapView ?
          <View style={{ flex: 1 }}>
            <MapView
              style={{
                flex: 1
              }}
              initialRegion={{
                latitude: 37.78825,
                longitude: -122.4324,
                latitudeDelta: 0.0922,
                longitudeDelta: 0.0421,
              }}
              region={this.state.region}
              showsUserLocation={true}
            >
              {this.loadMarkers()}
            </MapView>
            <SafeAreaView style={{ position: 'absolute', top: 20, left: 0, right: 0 }}>
              <Searchbar
                style={
                  {
                    marginLeft: 10,
                    marginRight: 10,
                    borderRadius: 20
                  }
                }
                placeholder="Search"
                onChangeText={searchTerm => { this.setState({ searchTerm }); this.search(); }}
                value={this.state.searchTerm}
              />
            </SafeAreaView>
            <View style={{ position: 'absolute', bottom: 20, left: 0, right: 0 }}>
              <View style={{ flexDirection: "row", justifyContent: 'center' }}>
                <Button
                  containerStyle={{
                    marginRight: 10
                  }}
                  buttonStyle={
                    {
                      width: 46,
                      height: 46,
                      borderRadius: 23,
                    }
                  }
                  raised={true}
                  icon={<Icon
                    name='location-arrow'
                    size={21}
                    color="white" />
                  }
                  onPress={this.findCoordinates}
                />
                <Button
                  containerStyle={{
                    marginRight: 10
                  }}
                  buttonStyle={
                    {
                      width: 46,
                      height: 46,
                      borderRadius: 23,
                    }
                  }
                  raised={true}
                  icon={<Icon
                    name='list'
                    size={21}
                    color="white" />
                  }
                  onPress={() => {this.toggleView(); this.setState({cardStyle: styles.smallCard});}}
                />
                <Button
                  buttonStyle={
                    {
                      width: 46,
                      height: 46,
                      borderRadius: 23,
                    }
                  }
                  raised={true}
                  icon={<Icon
                    name='user-circle'
                    size={21}
                    color="white" />
                  }
                  onPress={async () => {
                    this.props.navigation.navigate(
                      'Profile',
                      {
                        home: this,
                        payment: this.state.payment,
                      }
                    );
                  }}
                />
              </View>

              <Carousel
                ref={(c) => { this._carousel = c; }}
                data={this.state.laundromats}
                renderItem={this.renderLaundromats}
                sliderWidth={sliderWidth}
                itemWidth={itemWidth}
                onSnapToItem={(index) => {
                  this.setState({
                    region: {
                      latitude: this.state.laundromats[index].Lat - this.state.offset,
                      longitude: this.state.laundromats[index].Long,
                      latitudeDelta: 0.0922,
                      longitudeDelta: 0.0421,
                    }
                  })
                }}
              />
            </View>
          </View> :
          <SafeAreaView style={{ flex: 1 }}>
            <ScrollView style={{ flex: 1, paddingBottom: 10, paddingTop: 10 }}>
              <View style={{ flexDirection: "row", width: "100%", marginLeft:10, alignItems:'center'}}>
              <Button
                buttonStyle={
                  {
                    width: 46,
                    height: 46,
                    borderRadius: 23,
                  }
                }
                icon={<Icon
                raised={true}
                  name='map'
                  size={21}
                  color="white" />
                }
                onPress={() => {this.toggleView(); this.setState({cardStyle: styles.card});}}
              />
              <Searchbar
                style={
                  {
                    width: "80%",
                    marginLeft: 7,
                    marginRight: 10,
                    borderRadius: 20,
                    marginBottom: 5
                  }
                }
                placeholder="Search"
                onChangeText={searchTerm => { this.setState({ searchTerm }); this.search(); }}
                value={this.state.searchTerm}
                raised={true}
                
              />
              </View>
              <FlatList
                style={{paddingBottom: 10, paddingTop: 10}}
                data={this.state.laundromats}
                renderItem={this.renderLaundromats}
              />
            </ScrollView>
          </SafeAreaView>

        }
      </View>
    )
  }
}

Customer.propTypes = {
  navigation: Proptypes.shape({
    navigate: Proptypes.func.isRequired,
    getParam: Proptypes.func.isRequired
  }),
}
