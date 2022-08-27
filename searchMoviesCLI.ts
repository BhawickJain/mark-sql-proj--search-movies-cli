import { question, keyInSelect } from "readline-sync";
import {utc} from "moment";
import { Client, QueryResult } from "pg";

function moviesCLI() {
    //As your database is on your local machine, with default port,
    //and default username and password,
    //we only need to specify the (non-default) database name.
    console.log(`Greetings ${process.env.PGUSER} !`)
    const client = new Client({ database: 'omdb' });
    client.connect()
    .then(() => console.log(`Successfully connected to omdb!`))
    .then(() => runCliUserInterface(client))
    .then(() => console.log('exiting...'))
    .finally(() => process.exit())
   }


async function runCliUserInterface(client: Client) {
    console.log("Welcome to search-movies-cli!");
    let favouriteMovies: any[] = []
    const options = [
        'Quit',
        'Search Movies Names',
        'See Favourites'
    ]

    let shouldExit = false

    while(shouldExit === false) {
       console.log('\n'.repeat(2))
       options.forEach((op, i) => console.log(`[${i}] ${op}`))
       console.log(`\n`)
       const index =  question(`Choose an action! [${Array.from(options.keys()).join(", ")}]: `)
       switch (index) {
           case '1':
               favouriteMovies = await searchMovies(client, favouriteMovies)
               break
           case '2':
               await showFavourites(client)
               break
           case '0':
               await performDisconnect(client)
               shouldExit = true
               break
 
        }
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

async function searchMovies(client: Client, favouriteMovies: any[]): Promise<any[]> {
    const searchTerm = question('move name search term: ')
    const text = `SELECT id, name, date budget FROM movies WHERE LOWER(name) LIKE LOWER($1) AND kind = 'movie' ORDER BY date DESC LIMIT 10`
    const value = [`%${searchTerm}%`]
    console.log(`searching... ${searchTerm}`)
    const queryResult = await client.query(text, value)
    presentResults(queryResult)
    console.log(`complete.`)

    const listOfMovieNames = queryResult.rows.map((r) => r['name'])
    const index = keyInSelect(listOfMovieNames, 'select a favourite movie', {cancel: 'BACK'})
    if (index !== -1) { await addToFavouritesTable(client, queryResult.rows[index]) }

    return favouriteMovies
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
    console.log('\n')
}

function formatRows(rows: any[]): any[] {
    return rows.map((r) => ({name: r.name, date: formatDate(r.date)}))
}

function formatDate(utcDate: string): string {
    return utcDate != null ? utc(utcDate).format('DD MMM YYYY') : 'tbc'
}

moviesCLI()