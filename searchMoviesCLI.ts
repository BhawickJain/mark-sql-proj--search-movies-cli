import { question, keyInSelect } from "readline-sync";
import {utc} from "moment";
import { Client, QueryResult } from "pg";

function moviesCLI() {

    //As your database is on your local machine, with default port,
    //and default username and password,
    //we only need to specify the (non-default) database name.
    console.log("\n")
    console.log(`Greetings ${process.env.PGUSER} !`)
    const client = new Client({ database: 'omdb' });
    client.connect()
    .then(() => console.log(`Successfully connected to omdb!`))
    .then(() => runCliUserInterface(client))
    .then(() => console.log('exiting...'))
    .finally(() => process.exit(0))
    .catch((error) => {
        console.error(`ERROR: ${error}`)
        process.exit(1)
    })
   }


async function runCliUserInterface(client: Client) {
    console.log("Welcome to search-movies-cli!");
    const options = [
        'Search Movies Names',
        'See Favourites'
    ]
    const optionActions: (() => Promise<void>)[] = [
        () => searchMovies(client),
        () => showFavourites(client),
    ]

    let chosenOption: number | null = null
    while(chosenOption !== -1) {

       chosenOption = keyInSelect(options, `Choose an action! `, {cancel: 'QUIT'})

       chosenOption === -1 // if chosen quit
       ? await performDisconnect(client) 
       : await optionActions[chosenOption]() 

    }
}

async function performDisconnect(client: Client) {
    client.end().then(() => console.log('disconnected'))
}

async function showFavourites(client: Client) {
    const queryResult = await getFavourites(client)
    presentResults(queryResult)
    return
}

async function addToFavouritesTable(client: Client, row: any) {
    const text = "INSERT INTO favourites(movie_id) VALUES ($1)"
    const value = [`${row.id}`]
    try {
        await client.query(text, value)

        console.log(`${row.name} added to favourites`, '\n')
    } catch(err) {
        console.error(`ERROR: ${err}`)
    }
}

async function searchMovies(client: Client): Promise<void> {
    const searchTerm = question('move name search term: ')
    const text = `SELECT id, name, date, budget FROM movies WHERE LOWER(name) LIKE LOWER($1) AND kind = 'movie' ORDER BY date DESC LIMIT 10`
    const value = [`%${searchTerm}%`]
    console.log(`searching... ${searchTerm}`)
    const queryResult = await client.query(text, value)
    presentResults(queryResult)
    console.log(`complete.`)

    const listOfMovieNames = queryResult.rows.map((r) => r['name'])
    const index = keyInSelect(listOfMovieNames, 'select a favourite movie', {cancel: 'BACK'})
    if (index !== -1) { await addToFavouritesTable(client, queryResult.rows[index]) }
return
}

async function getFavourites(client: Client) {
    const text = "SELECT movies.id as id, movies.name as name, movies.date as date FROM favourites LEFT JOIN movies ON movie_id = movies.id ORDER BY date DESC"
    try {
        const queryResult = await client.query(text)
        return queryResult
    } catch(err) {
        console.error(`ERROR: ${err}`)
    }
    return undefined
}

function presentResults(queryResult: QueryResult): void {
    if (queryResult.rowCount > 0){
        const formattedRows = formatRows(queryResult.rows)
        console.table(formattedRows)
    } else {
        console.log('no rows found!')
    }
}

function formatRows(rows: any[]): any[] {
    return rows.map((r) => ({name: r.name, date: formatDate(r.date)}))
}

function formatDate(utcDate: string): string {
    return utcDate != null ? utc(utcDate).format('DD MMM YYYY') : 'tbc'
}

moviesCLI()