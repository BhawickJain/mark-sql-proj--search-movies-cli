import { question } from "readline-sync";
import { Client } from "pg";

//As your database is on your local machine, with default port,
//and default username and password,
//we only need to specify the (non-default) database name.
console.log(`Greetings ${process.env.PGUSER} !`)
const client = new Client({ database: 'omdb' });
console.log("Welcome to search-movies-cli!");

let exit = false

while (exit === false) {
    console.log("\nenter a SQL query")
    let command = question(">> ")
    if (command === 'q') {
        exit = true
    }
}

console.log("end")
