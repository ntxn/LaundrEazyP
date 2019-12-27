import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  container: {
    padding: 10,
    alignItems:'center',
    justifyContent:'center',
    backgroundColor: '#43a1c9',
  },
  inputStyle: {
    padding: 8,
  },
  payButtonContainer:{
    marginLeft:20,
    marginRight:20,
    borderRadius:20
  },
  authButtonContainer:{
    marginLeft:20,
    marginRight:20,
    marginTop:20,
    borderRadius:20
  },
  authButton:{
    borderRadius:20
  },
  buttonText: {
    fontSize: 20,
    textAlign: 'center'
  },
  laundromatContainer: {
    flex: 1,
    flexDirection: 'row',
    padding: 10,
    marginLeft:16,
    marginRight:16,
    marginTop: 8,
    marginBottom: 8,
    borderRadius: 5,
    backgroundColor: '#FFF',
    elevation: 2,
  },
  laundromatTitle: {
    fontSize: 16,
    color: '#000',
  },
  laundromatContainerText: {
    flex: 1,
    flexDirection: 'column',
    marginLeft: 12,
    justifyContent: 'center',
  },
  laudromatAddress: {
    fontSize: 11,
    fontStyle: 'italic',
  },
  card: {
      borderWidth: 1,
      borderRadius: 10,
      borderColor: '#ddd',
      borderBottomWidth: 0,
      backgroundColor: 'white',
      padding: 10,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: -1 },
      shadowRadius: 10,
      shadowOpacity: 0.4,
      elevation: 1,
      marginTop: 20,
      marginBottom: 20
  },
  smallCard: {
    borderWidth: 1,
    borderRadius: 10,
    borderColor: '#ddd',
    borderBottomWidth: 0,
    backgroundColor: 'white',
    flex: 1,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -1 },
    shadowRadius: 10,
    shadowOpacity: 0.4,
    elevation: 1,
    marginTop: 10,
    marginBottom: 10,
    marginLeft: 10,
    marginRight: 10,
},
});
