export interface User{
    username: string;
    token: string;
}


export interface TestAddress {
    postCode: string;
    line1: string;
}

export interface TestUser {
    name: string;
    age: number;
    address: TestAddress;
}