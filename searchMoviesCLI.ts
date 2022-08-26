import { question, keyInSelect } from "readline-sync";
import { Client, QueryResult } from "pg";

async function moviesCLI() {
    //As your database is on your local machine, with default port,
    //and default username and password,
    //we only need to specify the (non-default) database name.
    console.log(`Greetings ${process.env.PGUSER} !`)
    const client = new Client({ database: 'omdb' });
    await client.connect().then(() => console.log(`successfully connected to omdb!`))
    console.log("Welcome to search-movies-cli!");

    let favouriteMovies: any[] = []

    const options = [
        'Quit',
        'Search Movies Names',
        'See Favourites'
    ]

    let shouldExit = false

    while(shouldExit === false) {
       options.forEach((op, i) => console.log(`[${i}] ${op}`))
       console.log(`\n`)
       const index =  question(`Choose an action! [${Array.from(options.keys()).join(", ")}]: `)
       switch (index) {
           case '1':
               favouriteMovies = await searchMovies(client, favouriteMovies)
               break
           case '2':
               await showFavourites(favouriteMovies)
               break
           case '0':
               await performDisconnect(client)
               shouldExit = true
               break
       }
    }
    console.log('exited')

}

async function performDisconnect(client: Client) {
    client.end().then(() => console.log('disconnected'))
}

async function showFavourites(favouriteMovies: any[]) {
    console.table(favouriteMovies)
    return
}

async function searchMovies(client: Client, favouriteMovies: any[]): Promise<any[]> {
    const searchTerm = question('move name search term: ')
    const text = `SELECT name, date budget FROM movies WHERE LOWER(name) LIKE LOWER($1) AND kind = 'movie' ORDER BY date DESC LIMIT 10`
    const value = [`%${searchTerm}%`]
    console.log(`searching... ${searchTerm}`)
    const queryResult = await client.query(text, value)
    presentResults(queryResult)
    console.log(`complete.`)
    // console.error(`ERROR: ${err}`)

    const listOfMovieNames = queryResult.rows.map((r) => r['name'])
    const index = keyInSelect(listOfMovieNames, 'select a favourite movie')
    favouriteMovies.push(queryResult.rows[index])
    console.log(`${listOfMovieNames[index]} added to favourites`, '\n')

    return favouriteMovies
}

function presentResults(queryResult: QueryResult): void {
    if (queryResult.rowCount > 0){
        console.table(queryResult.rows)
    } else {
        console.log('no rows found!')
    }
}

moviesCLI().finally(() => process.exit())