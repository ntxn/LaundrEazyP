import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  modalContainer: {
    alignItems: 'center'
  },

  container: {
    justifyContent: 'center',
    backgroundColor: 'white',
    width: '80%',
    borderRadius: 10,
    padding: 20,
    flexWrap: 'wrap'
  },

  header: {
    fontWeight: 'bold',
    fontSize: 20,
    paddingBottom: 10
  },

  text: {
    marginLeft: 25,
    paddingBottom: 3,
    fontSize: 15
  },

  btn: {
    height: 30,
    paddingTop: 0,
    paddingBottom: 0,
    paddingLeft: 10,
    paddingRight: 10,
    marginLeft: 15,
    marginTop: 15,
    justifyContent: 'center',
    alignItems: 'center',
  }
})