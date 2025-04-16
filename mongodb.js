import { MongoClient, ObjectId } from "mongodb";

const dbHost = "localhost:27017";
const dbUser = "matias";
const dbPassword = "salasana1";
const dbName = "testi";
const dataCollection = "data";
const usersCollection = "users";
const destConnString = `mongodb://${dbUser}:${dbPassword}@${dbHost}/?authSource=${dbName}`;
const dbServer = new MongoClient(destConnString);

let logonUsers = new Map();

const openDbConn = async () => {
  try {
    await dbServer.connect();
    return dbServer.db(dbName);
  } catch (error) {
    console.error("Failed to connect databaase", error);
    throw error;
  }
};

const db = await openDbConn();

const connDbCollection = async (collection) => {
  const db = await openDbConn();
  return db.collection(collection);
};

const sendQuery = async (query, toArray = false) => {
  try {
    const result = await query;
    if (toArray) return await result.toArray();
    else console.log("should do something");
  } catch (err) {
    console.error("Query execution failed", err);
    throw err;
  }
};

const findOneUser = async (username) => {
  const usersCol = await connDbCollection("users");
  return sendQuery(
    usersCol.aggregate([
      { $match: { username } },
      { $project: { username: 1, password: 1, _id: 0 } },
    ]),
    true
  );
};

const getAllData = async () => {
  const dataCol = await connDbCollection("data");
  return sendQuery(dataCol.find(), true);
};

const getDataById = async (id) => {
  const dataCol = await connDbCollection("data");
  return await dataCol.findOne({ _id: new ObjectId(id) });
};

const getAllUsers = async () => {
  const usersCol = await connDbCollection("users");
  return sendQuery(usersCol.find(), true);
};

const addOneUser = async (username, password) => {
  const usersCol = await connDbCollection("users");
  return await usersCol.insertOne({ username, password });
};

const addData = async ({ Firstname, Surname, userid }) => {
  const dataCol = await connDbCollection("data");
  return await dataCol.insertOne({ Firstname, Surname, userid });
};

const randomFirstName = async () => {
  const dataCol = await connDbCollection("data");
  const result = await sendQuery(
    dataCol.aggregate([
      { $sample: { size: 1 } },
      { $project: { _id: 0, Firstname: 1 } },
    ]),
    true
  );

  return result[0]?.Firstname || "Etunimi";
};

const randomSurname = async () => {
  const dataCol = await connDbCollection("data");
  const result = await sendQuery(
    dataCol.aggregate([
      { $sample: { size: 1 } },
      { $project: { _id: 0, Surname: 1 } },
    ]),
    true
  );

  return result[0]?.Surname || "Sukunimi";
};

const addRows = async ({ RowAmount }) => {
  let i = 0;
  const dataCol = await connDbCollection("data");

  const rows = [];
  while (i < RowAmount) {
    const user_id = Math.random() < 0.5 ? "jk" : "pl";

    const firstName = await randomFirstName();
    const surname = await randomSurname();

    rows.push({ Firstname: firstName, Surname: surname, userid: user_id });
    i++;
  }

  return await dataCol.insertMany(rows);
};

const closeDbConnection = async () => {
  try {
    await dbServer.close();
    console.log("Database conenction closed");
  } catch (error) {
    console.error("Failed to close the database connection", error);
  }
};

process.on("SIGINT", closeDbConnection);
process.on("SIGNTERM", closeDbConnection);

export {
  findOneUser,
  getAllData,
  getDataById,
  getAllUsers,
  addOneUser,
  addData,
  addRows,
  randomFirstName,
  randomSurname,
  logonUsers,
};
