import React from 'react';
import {shallow} from 'enzyme';
import FirebaseFunctions from "../laundreazy/firebase";

describe("Firebase", () => {
    describe("Log In", () => {
        it("Logging In Fails with wrong Pass", async () => {
            await FirebaseFunctions.logIn("test@email.com", "Test123", "Customers").then(
                (val) => expect(val).not.toBe(false),
                () => expect(false).toBe(false)
            );
        });

        it("Logging In Fails with wrong Pass", async () => {
            await FirebaseFunctions.logIn("test@email.com", "Test13", "Customers").then(
                (val) => expect(val).toBe(false),
                () => expect(false).toBe(true)
            );
        });

        it("Logging In Fails with wrong Email", async () => {
            await FirebaseFunctions.logIn("test@gmail.com", "Test123", "Customers").then(
                (val) => expect(val).toBe(false),
                () => expect(false).toBe(true)
            );
        });
    });

    describe("User", () => {
        it("Getting User", async () => {
            await FirebaseFunctions.getUser("rCEagzirgyUntq9HY1O2fn40l1Z2", "Customers").then(
                (val) => expect(val).not.toBe(false),
                () => expect(false).toBe(true)
            );
        });

        it("Getting User with wrong UID", async () => {
            await FirebaseFunctions.getUser("000", "customer").then(
                (val) => expect(typeof val).toBe('undefined'),
                () => expect(false).toBe(true)
            );
        });

        it("Adding with no User Data", async () => {
            await FirebaseFunctions.addUserToDatabase(null, "customer").then(
                (val) => expect(val).toBe(false),
                () => expect(false).toBe(false)
            );
        });

        it("User exists", async () => {
            await FirebaseFunctions.usernameExists("test", "customer").then(
                (val) => expect(val).toBe(true),
                () => expect(false).toBe(true)
            );
        })

        it("User Doesn't exists", async () => {
            await FirebaseFunctions.usernameExists("doesnotexist", "customer").then(
                (val) => expect(val).toBe(false),
                () => expect(false).toBe(true)
            );
        })

        it("Update Info", async () => {
            await FirebaseFunctions.updateUserInfo("Customers", "rCEagzirgyUntq9HY1O2fn40l1Z2", "Bronsin", "Benyamin", "2222222222").then(
                (val) => expect(val).not.toBe(false),
                () => expect(false).toBe(true)
            );
        });
    });

    describe("Payments", () => {
        it("Delete Payment", async () => {
            await FirebaseFunctions.deletePayment("rCEagzirgyUntq9HY1O2fn40l1Z2").then(
                (val) => expect(val).toBe(true),
                () => expect(false).toBe(true)
            )
        }, 10000)

        it("Add and Update Payment/Balance", async () => {
            await FirebaseFunctions.addPayment("rCEagzirgyUntq9HY1O2fn40l1Z2", "Bronsin Benyamin", "4698734567023476", "435", "cc-visa", new Date()).then(
                (val) => expect(val).not.toBe(false),
                () => expect(false).toBe(true)
            );

            await FirebaseFunctions.updateBalance("rCEagzirgyUntq9HY1O2fn40l1Z2", 10000).then(
                (val) => expect(val).toBe(true),
                () => expect(false).toBe(true)
            )
        }, 10000);

        it("Get Payment", async () => {
            await FirebaseFunctions.getPayment("rCEagzirgyUntq9HY1O2fn40l1Z2").then(
                (val) => expect(val.nameOnCard).toBe("Bronsin Benyamin"),
                () => expect(false).toBe(true)
            )
        });

        it("Get Payment Fail", async () => {
            await FirebaseFunctions.getPayment("00").then(
                (val) => expect(val).toBe(false),
                () => expect(false).toBe(false)
            )
        });

        it("Delete Payment Fail", async () => {
            await FirebaseFunctions.deletePayment("00").then(
                (val) => expect(val).toBe(false),
                () => expect(false).toBe(false)
            )
        })

        it("Update Balance Fail", async () => {
            await FirebaseFunctions.updateBalance("00", 10000).then(
                (val) => expect(val).toBe(false),
                () => expect(false).toBe(false)
            )
        });
    })
});