
class CustomerModel {
    constructor(id, firstName, lastName, email, phoneNumber, username){
        this.id = id;
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.phoneNumber = phoneNumber;
        this.username = username;
        this.paymentInfos = [];
        this.reservations = [];
    }
}

class OwnerModel {
    constructor(id, firstName, lastName, email, phoneNumber, username){
        this.id = id;
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.phoneNumber = phoneNumber;
        this.username = username;
        this.laundromats = []
    }
}

export default {
    CustomerModel,
    OwnerModel
};