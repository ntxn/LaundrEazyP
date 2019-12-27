import * as firebase from 'firebase';
import 'firebase/firestore';
import 'firebase/auth';

import {
    FIREBASE_API_KEY,
    GOOGLE_API_KEY,
} from './credentials';

import {
    WASHER,
    WORKING,
    DRYER,
} from './commonConstants';

import Geocoder from 'react-native-geocoding';

var CryptoJS = require("crypto-js");

Geocoder.init(GOOGLE_API_KEY);

const firebaseConfig = {
    projectId: "laundreazy",
    apiKey: FIREBASE_API_KEY,
    authDomain: "laundreazy.firebaseapp.com",
    databaseURL: "https://laundreazy.firebaseio.com",
    storageBucket: "laundreazy.appspot.com",
  };
// Initialize Firebase
firebase.initializeApp(firebaseConfig);

class FirebaseFunctions{
    /********************************** ACCOUNTS ***********************************/
    /**
     * Creating users depending on type (Customer or Laundromat Owner)
     * @param {createAccount} user - User state from createAccount
     * @param {String} password - Users preferred password
     * @param {String} userType - Type of user
     */
    static async createAccount(user){
        return await firebase.auth().createUserWithEmailAndPassword(user.email, user.password)
            .then(
                async (cred) => {
                    var usernameExists = await this.usernameExists(user.username, user.userType);
                    if(usernameExists){
                        await cred.user.delete();
                        return [false, "ExistingUsernameError"];
                    }
                    var status = await FirebaseFunctions.addUserToDatabase(
                        user, 
                        cred.user.uid
                    );
                  
                    return [status, cred.user.uid];
                },
                () => {return [false, "ExistingEmailError"];}
            );
    }

    /**
     * Checks if username already exists
     * @param {String} username - Username inputted
     * @param {String} userType - Type of account
     */
    static async usernameExists(username, userType){
        userCollection = userType === 'customer' ? 'Customers' : 'Owners';
        return await firebase.firestore().collection(userCollection).get()
            .then(
                (snapshot) => {
                    const status = snapshot.docs.findIndex((document) => document.data().Username == username);
                    return (status >= 0 ? true : false);
                }
            , () => {return false;})
    }

    static async changePassword(email){
        return await firebase.auth().sendPasswordResetEmail(email).then(
            () => {return true},
            () => {return false}
        );
    }

    /**
     * Upload information of new user to Firebase
     * @param {createAccount} user - User state from createAccount
     * @param {String} uid - Unique ID of new user
     * @param {String} userType - Type of user
     */
    static async addUserToDatabase(user, uid){
        userCollection = user.userType === 'customer' ? 'Customers' : 'Owners';
        return await firebase.firestore().collection(userCollection).doc(uid).set({
            First: user.firstName,
            Last: user.lastName,
            Email: user.email,
            Phone: user.phoneNumber,
            Username: user.username,
        }).then(
            () => {return true;}, 
            async () => {
                await firebase.auth().currentUser.delete(); //If information is not added to database, delete the account created
                return false;
            });
    }

    /**
     * Update Basic Information of user
     * @param {String} userType - Owner or Customer
     * @param {*} uid - Unique ID of user
     * @param {*} firstName - Updated first name
     * @param {*} lastName - Updated last name
     * @param {*} phoneNumber - Updated phone number
     */
    static async updateUserInfo(userType, uid, firstName, lastName, phoneNumber){
        return await firebase.firestore().collection(userType).doc(uid).update({
            First: firstName,
            Last: lastName,
            Phone: phoneNumber
        }).then(
            (success) => {return true},
            (err) => {alert(err);return false}
        );
    }

    /**
     * Log in user in depending on type (Customer or Laundromat Owner)
     * @param {String} email - Email of user
     * @param {String} password - Password of user
     * @param {String} userType - Type of user
     */
    static async logIn(email, password, userType){
        return await firebase.auth().signInWithEmailAndPassword(email, password)
            .then(async (auth) => {
                userData = await FirebaseFunctions.getUser(
                    auth.user.uid,
                    userType
                );
                if(!userData)
                    return false;
                userData.uid = auth.user.uid;
                return userData;
            }, () => {return false;})
    }

    /**
     * Logs user out
     */
    static async logout(){
        return await firebase.auth().signOut().then(
            () => {return true},
            () => {return false}
        );
    }

    /**
     * Download user data from Firebase
     * @param {String} uid - Unique ID of user
     * @param {String} userType - Type of user
     */
    static async getUser(uid, userType){
        userCollection = userType === 'customer' ? 'Customers' : 'Owners';
        return await firebase.firestore().collection(userCollection).doc(uid).get()
        .then(snapshot => {return snapshot.data();}, () => {return false});
    }

    /*********************************** PAYMENTS ************************************/

    static async addPayment(uid, nameOnCard, cardNumber, cvv, type, expDate){
        const balance = Math.floor(Math.random() * 10000) + 1500;

        return await firebase.firestore().collection("Customers").doc(uid)
            .update({ payment: {
                nameOnCard,
                cardNumber: CryptoJS.AES.encrypt(cardNumber, uid).toString(),
                cvv: CryptoJS.AES.encrypt(cvv, uid).toString(),
                expDate,
                type,
                balance: CryptoJS.AES.encrypt(balance.toString(), uid).toString()
            }})
            .then(() => {return { nameOnCard, cardNumber, cvv, expDate, type, balance }}
                , () => {return false});
    }

    static async getPayment(uid){
        return await firebase.firestore().collection("Customers").doc(uid).get()
        .then(snapshot => {
            const payment = snapshot.data().payment;

            if(!payment)
                return null;

            payment.cardNumber = CryptoJS.AES.decrypt(payment.cardNumber, uid).toString(CryptoJS.enc.Utf8);
            payment.cvv = CryptoJS.AES.decrypt(payment.cvv, uid).toString(CryptoJS.enc.Utf8);
            payment.balance = parseInt(CryptoJS.AES.decrypt(payment.balance, uid).toString(CryptoJS.enc.Utf8));
            payment.expDate = payment.expDate.toDate()
            return payment;
        }, () => {return false});
    }

    static async deletePayment(uid){
        return await firebase.firestore().collection("Customers").doc(uid)
            .update({ payment: null})
            .then(() => {return true}
                , () => {return false});
    }

    static async updateBalance(customerUID, balance) {
        balance = CryptoJS.AES.encrypt(balance.toString(), customerUID).toString();
        return await firebase.firestore().collection("Customers").doc(customerUID)
            .update({ "payment.balance": balance }).then(
                () => {return true;},
                () => {return false;}
            );
    }


    /********************************** LAUNDROMATS ***********************************/
    /**
     * Create a new laundromat, and assign that laundromat to the laundro owner
     * @param {LaundromatRegistrationForm} laundromat - state of LaundromatRegistrationForm
     * @param {String} ownerUID 
     */
    static async createOrUpdateLaundromat(laundromat, laundromatUID=null, ownerUID=null){
        const address = laundromat.Street + "," + laundromat.City + ", " 
                    + laundromat.State + ", " + laundromat.Zip;
        const location = await Geocoder.from(address).then(
            async (json) => { return json.results[0].geometry.location; },
            (err) => {return err["code"]});
        if(location === 4)
            return false;

        const data = {
            ...laundromat,
            Lat: location.lat,
            Long: location.lng,
        }

        // Add laundromat to database, return its ID
        if(ownerUID){
            const ref = await firebase.firestore().collection("Laundromats")
                .add(data)
                .then(ref => { return ref; })
                .catch(error => alert(JSON.stringify(error)));

            await firebase.firestore().collection("Owners").doc(ownerUID)
                .collection("Laundromats").doc(ref.id).set({active: true});
            
            return ref.id;
        }

        await firebase.firestore().collection("Laundromats").doc(laundromatUID).update(data)
        return "Success";
    }

    /**
     * Get all registered laundromats
     */
    static async getLaundromats(){
        return await firebase.firestore().collection("Laundromats").get()
            .then(
                (snapshot) => {
                    return snapshot.docs;
                },
                () => {return false;}
            );
    }

    /**
     * Get a laundromat by ID
     * @param {string} id 
     */
    static async getLaundromatByID(id){
        return await firebase.firestore().collection("Laundromats").doc(id).get()
            .then(
                (snapshot) => {
                    const data = snapshot.data();
                    data.id = snapshot.id;
                    data.Open = data.Open.toDate();
                    data.Close = data.Close.toDate();
                    return data;
                },
                () => {return false;}
            );
    }

    /**
     * Delete a laundromat
     * @param {string} id - laundromatUID
     * @param {string} ownerUID 
     */
    static async deleteLaundromat(id, ownerUID){
        // delete all machines in washers & dryers so it'll remove the collections Washers and Dryers
        const deleteWashers = await FirebaseFunctions.deleteMachines(WASHER, id);
        const deleteDryers = await FirebaseFunctions.deleteMachines(DRYER, id);

        if(deleteWashers && deleteDryers){
            // delete laundromat
            var response = await firebase.firestore().collection("Laundromats").doc(id)
            response = await firebase.firestore().collection("Laundromats").doc(id).delete()
                .then(() => {return true;})
                .catch(() => {return false;})

            if(response)
                response = await firebase.firestore().collection("Owners").doc(ownerUID).collection("Laundromats").doc(id).delete()
                    .then(() => {return true;})
                    .catch(() => {return false;})
            return response
        }
        return false;
    }

    /**
     * Get owner's laundromats
     * @param {String} uid - Unique ID of owner
     */
    static async getOwnerLaundromats(uid){
        laundromats = await FirebaseFunctions.getLaundromats();
        registeredLaundromats = await firebase.firestore().collection("Owners").doc(uid).collection("Laundromats").get()  
            .then(
                (snapshot) => {
                    return snapshot.docs;
                },
                (err) => {alert(err); return false;}
            );

        ownerLaundromats = new Array(registeredLaundromats.length);
        i = 0;
        registeredLaundromats.forEach(element => {
            laundromat = laundromats.find((laundromat) => laundromat.id === element.id);
            ownerLaundromats[i] = laundromat;
            i++;
        });
        return ownerLaundromats;
    }


    /********************************** MACHINES ***********************************/
    /**
     * Add a single washer/dryer to a laundromat
     * @param {integer} machineType - WASHER/DRYER
     * @param {string} machineUID - UID of the machine to be created
     * @param {string} laundromatUID - UID of the laundromat 
     */
    static async addMachine(machineType, machineUID, laundromatUID){
        const subCollectionName = machineType === WASHER ? "Washers" : "Dryers";
        return await firebase.firestore().collection("Laundromats").doc(laundromatUID).collection(subCollectionName)
        .doc(machineUID).set({
            Status: WORKING,
            ID: parseInt(machineUID)
        })
        .then(() => {return true;}), () => {return false;}
    }

    /**
     * Bulk add multiple machines (washers/dryers) to a laundromat 
     * @param {integer} machineType - WASHER/DRYER
     * @param {integer} machineNum - the number of machines to be added
     * @param {string} laundromatUID - UID of the laundromat 
     */
    static async addMachines(machineType, machineNum, laundromatUID){
        const subCollectionName = machineType === WASHER ? "Washers" : "Dryers";
        const db = firebase.firestore();
        const collection = db.collection("Laundromats").doc(laundromatUID).collection(subCollectionName);
        for(var i = 1; i < machineNum+1; i++){
            var batch = db.batch();
            batch.set(collection.doc(i.toString()), {
                Status: WORKING,
                ID: i
            })
            batch.commit();
        }
    }

    /**
     * Query the list of machines (dryers/washers) of a laundromat
     * @param {integer} machineType - WASHER/DRYER
     * @param {string} laundromatUID - UID of the laundromat 
     */
    static async getMachines(machineType, laundromatUID){
        const subCollectionName = machineType === WASHER ? "Washers" : "Dryers";
        return await firebase.firestore().collection("Laundromats").doc(laundromatUID).collection(subCollectionName)
            .orderBy("ID")
            .get()
            .then(
                (snapshot) => {
                    docs = snapshot.docs;
                    var machines = [];
                    machines = docs.map(element => {return {id: element.id, status: element.data().Status}});
                    return machines;
                }, () => {return false;}
            );
    }
    /**
     * Bulk delete all washers/dryers of a laundromat
     * @param {integer} machineType 
     * @param {string} laundromatUID 
     */
    static async deleteMachines(machineType, laundromatUID){
        const db = firebase.firestore();
        const subCollectionName = machineType === WASHER ? "Washers" : "Dryers";
        return await db.collection("Laundromats").doc(laundromatUID).collection(subCollectionName)
            .get()
            .then(
                async (snapshot) => {
                    await snapshot.docs.forEach(doc => {
                        const batch = db.batch();
                        batch.delete(doc.ref);
                        batch.commit();
                    });
                    return true;
                }
            ).catch(() => {return false;})
    }

    /**
     * Delete a single machine
     * @param {integer} machineType
     * @param {string} machineUID
     * @param {string} laundromatUID
     */
    static async deleteMachine(machineType, machineUID, laundromatUID){
        const subCollectionName = machineType === WASHER ? "Washers" : "Dryers";
        return await firebase.firestore().collection("Laundromats").doc(laundromatUID).collection(subCollectionName)
            .doc(machineUID).delete()
            .then(() => {return true;})
            .catch(() => {return false;});
    }


    /********************************** RESERVATIONS ***********************************/
    static async getReservationsForMachines(date, laundromatMachineType) {
        return await firebase.firestore().collection("Reservations")
            .where("keywords.date", "==", date)
            .where("keywords.laundromatMachineType", "==", laundromatMachineType)
            .where("isCompleted", "==", false)
            .get()
            .then((snapshot) => {return snapshot.docs;})
            .catch(() => {return false;})
    }

    static async getReservationsOfUser(uid){
        return await firebase.firestore().collection("Reservations")
        .where("customerUID", "==", uid)
        .where("isCompleted", "==", false)
        .get()
        .then(snapshot => {
            const now = new Date();
            const reservations = [];
            snapshot.docs.forEach(doc => {
                const reservation = doc.data();
                reservation.id = doc.id;
                reservation.startTime = reservation.startTime.toDate();
                reservation.endTime = reservation.endTime.toDate();
                reservation.reservedAt = reservation.reservedAt.toDate();
                if(reservation.endTime > now)
                    reservations.push(reservation);
                else
                    firebase.firestore().collection("Reservations").doc(reservation.id)
                        .update({ isCompleted: true })
            });
            return reservations;
        }, () => {return false;})
    }

    static async cancelReservation(reservation, payment=null, updatePayment=null){
        const {customerUID, price} = reservation;
        const notRandomCustomer = customerUID !== "RandomCustomer"
        if(notRandomCustomer && !payment)
            payment = await FirebaseFunctions.getPayment(customerUID);

        return await firebase.firestore().collection("Reservations").doc(reservation.id).delete()
        .then(
            () => {
                if(notRandomCustomer){
                    const newBalance = payment.balance + price;
                    payment.balance = newBalance;
                    FirebaseFunctions.updateBalance(customerUID, newBalance);
                    updatePayment && updatePayment(payment);
                }
                return true;
            },
            () => {return false;}
        )
    }

    static async makeReservation(customerUID, laundromatUID, machineType, machineUID, startTime, endTime, price, newBalance, id=null){
        const keywords = {
            date: startTime.toDateString(),
            laundromatMachineType: laundromatUID + machineType
        }

        const data = {
            customerUID,
            laundromatUID,
            machineType,
            machineUID,
            startTime,
            endTime,
            price,
            keywords,
            isCompleted: false,
            reservedAt: new Date(),
        }

        return id ? 
            await firebase.firestore().collection("Reservations").doc(id).update(data)
                .then(() => {
                    data.id = id;
                    newBalance && FirebaseFunctions.updateBalance(customerUID, newBalance);
                    return data;
                })
                .catch(() => {return false;}) :
            await firebase.firestore().collection("Reservations").add(data)
                .then(docRef => {
                    data.id = docRef.id;
                    newBalance && FirebaseFunctions.updateBalance(customerUID, newBalance);
                    return data;
                })
                .catch(() => {return false;})
    }


    

    /**
     * Get active reservations for 1 laundromat sorted by booking start time
     * @param {string} laundromatUID 
     */
    static async getIncompletedReservationsByLaundromats(laundromatUID) {
        return await firebase.firestore().collection("Reservations")
            .where("laundromatUID", "==", laundromatUID)
            .where("isCompleted", "==", false)
            .get()
            .then(snapshot => {
                const now = new Date();
                const washerReservations = [];
                const dryerReservations = [];

                snapshot.docs.forEach(doc => {
                    const reservation = doc.data();
                    reservation.id = doc.id;
                    reservation.startTime = reservation.startTime.toDate();
                    reservation.endTime = reservation.endTime.toDate();
                    reservation.reservedAt = reservation.reservedAt.toDate();
                    if(reservation.endTime > now)
                        reservation.machineType === "washers" ? washerReservations.push(reservation) : dryerReservations.push(reservation)
                    else
                        firebase.firestore().collection("Reservations").doc(reservation.id)
                            .update({ isCompleted: true })
                });
                return [washerReservations, dryerReservations]
            }, () => {return [false];})
    }

    /**
     * Get active reservations for 1 laundromat sorted by booking start time
     * @param {string} laundromatUID 
     */
    static async getAllReservationsByLaundromats(laundromatUID) {
        return await firebase.firestore().collection("Reservations")
            .where("laundromatUID", "==", laundromatUID)
            .get()
            .then(snapshot => {
               return snapshot.docs.map(doc => {
                    const reservation = doc.data();
                    reservation.id = doc.id;
                    reservation.startTime = reservation.startTime.toDate();
                    reservation.endTime = reservation.endTime.toDate();
                    reservation.reservedAt = reservation.reservedAt.toDate();
                    return reservation;
                });
            }, () => {return false;})
    }

}

export default FirebaseFunctions;
