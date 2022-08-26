import { question, promptCLLoop } from "readline-sync";
import { Client, QueryResult } from "pg";

async function moviesCLI() {
    //As your database is on your local machine, with default port,
    //and default username and password,
    //we only need to specify the (non-default) database name.
    console.log(`Greetings ${process.env.PGUSER} !`)
    const client = new Client({ database: 'omdb' });
    await client.connect().then(() => console.log(`successfully connected to omdb!`))
    console.log("Welcome to search-movies-cli!");
    console.log(`
    q       quit
    search  search movie name
    `)

    while(true) {
        const command = question(">> ")
        if (command === 'q') {
            await performDisconnect(client)
            break
        }
        switch (command) {
            case 'q':
                break;
            case 'search':
                await searchMovies(client);
                break;
            case 'favourites':
                console.log('not implemented!');
                break;
            default:
                console.log(`command ${command} invalid`)

        }
    }
    console.log('exited')

}

async function performDisconnect(client: Client) {
    client.end().then(() => console.log('disconnected'))
}

async function searchMovies(client: Client): Promise<void> {
    const searchTerm = question('enter search term: ')
    const text = `SELECT name, date budget FROM movies WHERE LOWER(name) LIKE LOWER($1) AND kind = 'movie' ORDER BY date DESC LIMIT 10`
    const value = [`%${searchTerm}%`]
    console.log(`searching... ${searchTerm}`)
    const queryResult = await client.query(text, value)
    presentResults(queryResult)
    console.log(`complete.`)
    // console.error(`ERROR: ${err}`)

    return
}

function presentResults(queryResult: QueryResult): void {
    if (queryResult.rowCount > 0){
        console.table(queryResult.rows)
    } else {
        console.log('no rows found!')
    }
}

moviesCLI().finally(() => process.exit())