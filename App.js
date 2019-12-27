import React from 'react';
import { createAppContainer } from 'react-navigation';
import { createStackNavigator } from 'react-navigation-stack';

import Icon from 'react-native-vector-icons/FontAwesome';
Icon.loadFont();

import CreateAccount from './laundreazy/createAccount';
import Customer from './laundreazy/customer/index';
import HomeScreen from './laundreazy/index';
import Login from './laundreazy/login';
import Owner from './laundreazy/owner/index';
import AddLaundromat from './laundreazy/owner/laundromatRegistrationForm';
import Profile from './laundreazy/customer/profile';
import AddPayments from './laundreazy/customer/addPayments';
import MakeReservation from './laundreazy/makeReservation';
import Reports from './laundreazy/owner/reports';
import Machines from './laundreazy/owner/machines';
import EditProfile from './laundreazy/editProfile';
import Reservations from './laundreazy/reservations';

// NAVIGATION
const AppNavigator = createStackNavigator({
  CreateAccount: {
    screen: CreateAccount,
    navigationOptions: {
      title: "Create Account"
    }
  },
  Customer: {
    screen: Customer,
    navigationOptions: {
      header: null
    }
  },
  AddPayments: AddPayments,
  Profile: {
    screen: Profile,
    navigationOptions: {
      title: "Profile"
    }
  },
  Home: {
    screen: HomeScreen,
    navigationOptions: {
      header: null
    }
  },
  Login: {
    screen: Login,
    navigationOptions: {
      title: "Owner Log In",
    }
  },
  Owner: {
    screen: Owner,
    navigationOptions: {
      title: "Profile",
    }
  },
  AddLaundromat: {
    screen: AddLaundromat,
    navigationOptions: {
      title: "Add Laundromat"
    }
  },
  MakeReservation: {
    screen: MakeReservation,
    navigationOptions: {
      title: 'Make Reservation'
    }
  },
  Reports: {
    screen: Reports,
    navigationOptions: {
      title: "Reports",
    }
  },
  EditProfile: {
    screen: EditProfile,
    navigationOptions: {
      title: "Edit Profile"
    }
  },
  Reservations: {
    screen: Reservations,
    navigationOptions: {
      title: "Reservations",
    }
  },
  Machines: {
    screen: Machines,
    navigationOptions: {
      title: "Machines",
    }
  }
},{
  initialRouteName: 'Home',
});
const AppContainer = createAppContainer(AppNavigator);

const App = () => {
  return <AppContainer />;
};

export default App;