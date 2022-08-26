import { question, promptCLLoop } from "readline-sync";
import { Client } from "pg";

async function moviesCLI() {
    //As your database is on your local machine, with default port,
    //and default username and password,
    //we only need to specify the (non-default) database name.
    console.log(`Greetings ${process.env.PGUSER} !`)
    const client = new Client({ database: 'omdb' });
    await client.connect()
    console.log("Welcome to search-movies-cli!");

    let exit = false

    while (exit === false) {
        console.log("\nenter a SQL query")
        let command = question(">> ")
        if (command === 'q') {
            exit = true
            break
        }
        console.log(`searching... ${command}`)
        console.log(`\n`)
        const text = "SELECT name, date, kind FROM movies WHERE LOWER(name) LIKE LOWER($1) LIMIT 10"
        const values = [`%${command}%`]
        const queryResults = await client.query(text, values)
        if (queryResults.rowCount > 0) {
        console.table(queryResults.rows)

        }
        else {
            console.log('no results')
        }
        // .catch((error) => console.error(`ERROR: ${error}`))
        // .finally(() => client.end())
        // setTimeout(() => {}, 1000)
    }


    console.log("end")
    return 0
}

moviesCLI()