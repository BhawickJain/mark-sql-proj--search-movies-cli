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

    while (true) {
        console.log("\nenter a SQL query")
        let command = question(">> ")
        if (command === 'q') { break }
        console.log(`searching... ${command}`)
        console.log(`\n`)
        try {
        const text = "SELECT id, name, date, runtime, budget, revenue, vote_average, votes_count FROM movies WHERE LOWER(name) LIKE LOWER($1) AND kind = 'movie' ORDER BY date DESC LIMIT 10"
        const values = [`%${command}%`]
        const queryResults = await client.query(text, values)
        if (queryResults.rowCount > 0) {
        console.table(queryResults.rows)

        }
        else {
            console.log('no results')
        }
        } catch(error)
        {
console.error(`ERROR: ${error}`)
        }
    }


    console.log("end")
}

moviesCLI().finally(() => process.exit())