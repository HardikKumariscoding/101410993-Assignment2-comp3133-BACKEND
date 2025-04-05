import { gql } from "apollo-server-express";

const typeDefs = gql`
  type User {
    id: ID!
    username: String!
    email: String!
    token: String
  }

  type Employee {
    id: ID!
    first_name: String!
    last_name: String!
    email: String!
    gender: String!
    designation: String!
    salary: Float!
    date_of_joining: String!
    department: String!
    employee_photo: String
  }

  type Query {
    getAllEmployees(designation: String, department: String, searchQuery: String): [Employee]
    searchEmployeeByEid(eid: ID!): Employee
    searchEmployees(query: String!): [Employee] 
    testEmployees: [Employee]
  }

  type Mutation {
    login(username: String!, password: String!): User
    signup(username: String!, email: String!, password: String!): User
    addEmployee(first_name: String!, last_name: String!, email: String!, gender: String!, designation: String!, salary: Float!, date_of_joining: String!, department: String!, employee_photo: String): Employee
    updateEmployee(id: ID!, first_name: String, last_name: String, email: String, gender: String, designation: String, salary: Float, date_of_joining: String, department: String, employee_photo: String): Employee
    deleteEmployee(id: ID!): String
  }
`;

export default typeDefs;