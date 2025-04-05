import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import User from "../models/User.js";
import Employee from "../models/Employee.js";

const JWT_SECRET = "8609b5c9fe41c78b1ed44776b96d2e59739154e63a3d31566e83c3b2f74677e9";

const resolvers = {
  Query: {
    getAllEmployees: async (_, { designation, department, searchQuery }) => {
      let filter = {};
      if (designation) filter.designation = { $regex: designation?.trim(), $options: 'i' };
      if (department) filter.department = { $regex: department?.trim(), $options: 'i' };

      console.log("Designation:", designation);
      console.log("Department:", department);

      let searchFilter = {};
      if (searchQuery) {
        searchFilter = {
          $or: [
            { first_name: { $regex: searchQuery.trim(), $options: 'i' } },
            { last_name: { $regex: searchQuery.trim(), $options: 'i' } },
            { email: { $regex: searchQuery.trim(), $options: 'i' } },
          ],
        };
      }

      try {
        let query = {};
        if (Object.keys(filter).length > 0 && Object.keys(searchFilter).length > 0) {
          query = { $and: [filter, searchFilter] };
        } else if (Object.keys(filter).length > 0) {
          query = filter;
        } else if (Object.keys(searchFilter).length > 0) {
          query = searchFilter;
        }

        console.log("Running mongoose query:", query);
        const result = await Employee.find(query);
        console.log("Mongoose query result:", result);
        return result;

      } catch (error) {
        console.error("Error fetching employees:", error);
        throw error;
      }
    },
    testEmployees: async () => {
      try {
        console.log("Running testEmployees resolver...");
        const result = await Employee.find({ designation: "scrum master" }); 
        console.log("Test query result:", result);
        return result;
      } catch (error) {
        console.error("Test query error:", error);
        return [];
      }
    },
    searchEmployeeByEid: async (_, { eid }) => {
      try {
        const employee = await Employee.findById(eid);
        if (!employee) throw new Error("Employee not found");
        return employee;
      } catch (error) {
        throw new Error("Error finding employee: " + error.message);
      }
    },
    searchEmployees: async (_, { query }) => { 
      try {
        const result = await Employee.find({
          $or: [
            { first_name: { $regex: query.trim(), $options: 'i' } },
            { last_name: { $regex: query.trim(), $options: 'i' } },
            { email: { $regex: query.trim(), $options: 'i' } },
            { designation: { $regex: query.trim(), $options: 'i' } },
            { department: { $regex: query.trim(), $options: 'i' } },
          ],
        });
        return result;
      } catch (error) {
        console.error("Error searching employees:", error);
        throw error;
      }
    },
  },
  Mutation: {
    login: async (_, { username, password }) => {
      const user = await User.findOne({ username });
      if (!user) throw new Error("User not found");

      const isValid = await bcrypt.compare(password, user.password);
      if (!isValid) throw new Error("Invalid credentials");

      const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: "1h" });

      return { id: user.id, username: user.username, email: user.email, token };
    },
    signup: async (_, { username, email, password }) => {
      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = new User({ username, email, password: hashedPassword });
      await newUser.save();

      const token = jwt.sign({ id: newUser.id }, JWT_SECRET, { expiresIn: "1h" });

      return { id: newUser.id, username: newUser.username, email: newUser.email, token };
    },
    addEmployee: async (_, args) => {
      const newEmployee = new Employee(args);
      return await newEmployee.save();
    },
    updateEmployee: async (_, { id, ...updates }) => {
      return await Employee.findByIdAndUpdate(id, updates, { new: true });
    },
    deleteEmployee: async (_, { id }) => {
      await Employee.findByIdAndDelete(id);
      return "Employee deleted successfully";
    },
  },
};

export default resolvers;