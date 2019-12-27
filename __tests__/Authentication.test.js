import React from 'react';
import {shallow} from 'enzyme';
import CreateAccount from '../laundreazy/createAccount';
import Login from '../laundreazy/login'


describe('CreateAccount', () => {
    describe('Rendering', () => {
        it('Rendering should match to snapshot', () => {
            const component = shallow(<CreateAccount/>)
            expect(component).toMatchSnapshot('Create Account')

            const blank = '';
            expect(component.state('firstName')).toBe(blank);
            expect(component.state('lastName')).toBe(blank);
            expect(component.state('username')).toBe(blank);
            expect(component.state('email')).toBe(blank);
            expect(component.state('phoneNumber')).toBe(blank);
            expect(component.state('firstNameErrorMessage')).toBe(blank);
            expect(component.state('lastNameErrorMessage')).toBe(blank);
            expect(component.state('usernameErrorMessage')).toBe(blank);
            expect(component.state('emailErrorMessage')).toBe(blank);
            expect(component.state('phoneNumberErrorMessage')).toBe(blank);
            expect(component.state('passwordErrorMessage')).toBe(blank);
        });
    });

    describe("validation", () => {
        const nameRegex = /^[a-zA-Z\-]+$/;
        const usernameRegex = /^[a-z0-9]+$/;
        const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
        const numberRegex = /^\d+$/;

        it("Updating error message works", () => {
            const component = shallow(<CreateAccount />);
            const componentInstance = component.instance();

            componentInstance.updateErrorMessage("", "", 'emailErrorMessage');;
            expect(component.state('emailErrorMessage')).toBe("Required field");

            componentInstance.validateField(
                component.state('phoneNumber'),
                "44444",
                'phoneNumberErrorMessage',
                ("44444".length === 10) && RegExp(numberRegex).test("44444"),
                'Enter 10 digit number for phone number'
            );

            expect(component.state('phoneNumberErrorMessage')).toBe("Enter 10 digit number for phone number");

            componentInstance.validate();

            expect(component.state('emailErrorMessage')).toBe("Required field");
        })

        it("Return correct errors for empty fields", () => {
            const component = shallow(<CreateAccount/>);
            const componentInstance = component.instance();

            componentInstance.validate("");
            const mess = "Required field"
            expect(component.state('firstNameErrorMessage')).toBe(mess);
            expect(component.state('lastNameErrorMessage')).toBe(mess);
            expect(component.state('usernameErrorMessage')).toBe(mess);
            expect(component.state('emailErrorMessage')).toBe(mess);
            expect(component.state('phoneNumberErrorMessage')).toBe(mess);
            expect(component.state('passwordErrorMessage')).toBe(mess);
        })

        it("Validation works for each field", () => {
            const component = shallow(<CreateAccount/>);
            const componentInstance = component.instance();

            componentInstance.validateField(
                component.state('firstName'),
                "test12",
                'firstNameErrorMessage',
                RegExp(nameRegex).test("test12"),
                'Names should only contain A-Z and a-z'
            );

            componentInstance.validateField(
                component.state('lastName'),
                "test12",
                'lastNameErrorMessage',
                RegExp(nameRegex).test("test12"),
                'Names should only contain A-Z and a-z'
            );

            componentInstance.validateField(
                component.state('username'),
                "user$^%",
                'usernameErrorMessage',
                RegExp(usernameRegex).test("user$^%"),
                'Usernames should only contain a-z and 0-9'
            );

            componentInstance.validateField(
                component.state('email'),
                "fake.email.com",
                'emailErrorMessage',
                RegExp(emailRegex).test("fake.email.com"),
                'Email is formatted incorrectly'
            );

            componentInstance.validateField(
                component.state('phoneNumber'),
                "44444",
                'phoneNumberErrorMessage',
                ("44444".length === 10) && RegExp(numberRegex).test("44444"),
                'Enter 10 digit number for phone number'
            );

            expect(component.state('phoneNumberErrorMessage')).toBe("Enter 10 digit number for phone number");

            componentInstance.validateField(
                component.state('phoneNumber'),
                "notnum",
                'phoneNumberErrorMessage',
                ("notnum".length === 10) && RegExp(numberRegex).test("notnum"),
                'Enter 10 digit number for phone number'
            );

            componentInstance.validateField(
                component.state('password'),
                "test",
                'passwordErrorMessage',
                "test".length >= 6,
                'Password is short and weak'
            )

            expect(component.state('firstNameErrorMessage')).toBe("Names should only contain A-Z and a-z");
            expect(component.state('lastNameErrorMessage')).toBe("Names should only contain A-Z and a-z");
            expect(component.state('usernameErrorMessage')).toBe("Usernames should only contain a-z and 0-9");
            expect(component.state('emailErrorMessage')).toBe("Email is formatted incorrectly");
            expect(component.state('phoneNumberErrorMessage')).toBe("Enter 10 digit number for phone number");
            expect(component.state('passwordErrorMessage')).toBe("Password is short and weak");
        })

        it("No accounts with duplicate usernames", () =>
        {
            const component = shallow(<CreateAccount/>);
            const componentInstance = component.instance();

            componentInstance.validateField(
                component.state('firstName'),
                "Test",
                'firstNameErrorMessage',
                RegExp(nameRegex).test("Test"),
                'Names should only contain A-Z and a-z'
            );

            componentInstance.validateField(
                component.state('lastName'),
                "Test",
                'lastNameErrorMessage',
                RegExp(nameRegex).test("Test"),
                'Names should only contain A-Z and a-z'
            );

            componentInstance.validateField(
                component.state('username'),
                "test",
                'usernameErrorMessage',
                RegExp(usernameRegex).test("test"),
                'Usernames should only contain a-z and 0-9'
            );

            componentInstance.validateField(
                component.state('email'),
                "fake@email.com",
                'emailErrorMessage',
                RegExp(emailRegex).test("fake@email.com"),
                'Email is formatted incorrectly'
            );

            componentInstance.validateField(
                component.state('phoneNumber'),
                "4444444444",
                'phoneNumberErrorMessage',
                ("4444444444".length === 10) && RegExp(numberRegex).test("4444444444"),
                'Enter 10 digit number for phone number'
            );

            componentInstance.validateField(
                component.state('password'),
                "Test123",
                'passwordErrorMessage',
                "Test123".length >= 6,
                'Password is short and weak'
            )

            component.setState({"userType": "customer"});

            componentInstance.createAccount().then(
                () => expect(component.state('usernameErrorMessage')).toBe("Username Already Exists")
            );

            component.setState({"userType": "owner"});

            componentInstance.createAccount().then(
                () => expect(component.state('usernameErrorMessage')).toBe("Username Already Exists")
            );
        })

        it("No accounts with duplicate emails", () =>
        {
            const component = shallow(<CreateAccount/>);
            const componentInstance = component.instance();

            componentInstance.validateField(
                component.state('firstName'),
                "Test",
                'firstNameErrorMessage',
                RegExp(nameRegex).test("Test"),
                'Names should only contain A-Z and a-z'
            );

            componentInstance.validateField(
                component.state('lastName'),
                "Test",
                'lastNameErrorMessage',
                RegExp(nameRegex).test("Test"),
                'Names should only contain A-Z and a-z'
            );

            componentInstance.validateField(
                component.state('username'),
                "test123",
                'usernameErrorMessage',
                RegExp(usernameRegex).test("test123"),
                'Usernames should only contain a-z and 0-9'
            );

            componentInstance.validateField(
                component.state('email'),
                "test@email.com",
                'emailErrorMessage',
                RegExp(emailRegex).test("test@email.com"),
                'Email is formatted incorrectly'
            );

            componentInstance.validateField(
                component.state('phoneNumber'),
                "4444444444",
                'phoneNumberErrorMessage',
                ("4444444444".length === 10) && RegExp(numberRegex).test("4444444444"),
                'Enter 10 digit number for phone number'
            );

            componentInstance.validateField(
                component.state('password'),
                "Test123",
                'passwordErrorMessage',
                "Test123".length >= 6,
                'Password is short and weak'
            )

            component.setState({"userType": "customer"});

            componentInstance.createAccount().then(
                () => expect(component.state('emailErrorMessage')).toBe("Email is already registered")
            );

            component.setState({"userType": "owner"});

            componentInstance.createAccount().then(
                () => expect(component.state('emailErrorMessage')).toBe("Email is already registered")
            );
        })
    })
})

describe('LogIn', () => {
    describe('Rendering', () => {
        it('Rendering should match to snapshot', () => {
            const component = shallow(<Login />);
            expect(component).toMatchSnapshot('Log In')

            const blank = '';

            expect(component.state('email')).toBe(blank);
            expect(component.state('emailErrorMessage')).toBe(blank);
            expect(component.state('passwordErrorMessage')).toBe(blank);
        });
    });

    describe("validation", () => {
        it("Validation works for empty field", () => {
            const component = shallow(<Login />);
            const componentInstance = component.instance();

            componentInstance.validate("");
            expect(component.state('emailErrorMessage')).toBe("Email is required");
            expect(component.state('passwordErrorMessage')).toBe("Password is required");
        })
    })

    describe("logging in", () => {
        it("Owner can't log in from customer login", () =>
        {
            const component = shallow(<Login />);
            const componentInstance = component.instance();

            component.setState({"userType": "customer"});
            component.setState({"email": "test@i.com"});

            componentInstance.login("Test123").then(
                () => expect(component.state('emailErrorMessage')).toBe("Username or password is incorrect!")
            );
        })

        it("Customer can't log in from owner login", () =>
        {
            const component = shallow(<Login />);
            const componentInstance = component.instance();

            component.setState({"userType": "owner"});
            component.setState({"email": "test@email.com"});

            componentInstance.login("Test123").then(
                () => expect(component.state('emailErrorMessage')).toBe("Username or password is incorrect!")
            );
        })

        it("Customer Login works", () => {
            const component = shallow(<Login />);
            const componentInstance = component.instance();

            component.setState({"userType": "customer"});
            component.setState({"email": "test@email.com"});

            componentInstance.login("Test123").then(
                () => expect(component.state('emailErrorMessage')).toBe("")
            );
        })

        it("Owner Login works", () => {
            const component = shallow(<Login />);
            const componentInstance = component.instance();

            component.setState({"userType": "owner"});
            component.setState({"email": "test@i.com"});

            componentInstance.login("Test123").then(
                () => expect(component.state('emailErrorMessage')).toBe("")
            );
        })
    })
})